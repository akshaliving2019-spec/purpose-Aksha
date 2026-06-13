// Orquestación del pedido con registro persistente en Stripe.
// El estado vive en la metadata del PaymentIntent (reporte_status:
// procesando | enviado | fallido), lo que da idempotencia (un pago = un
// reporte aunque Stripe entregue el evento dos veces) y permite reprocesar
// pedidos fallidos sin base de datos adicional.

import Stripe from 'stripe';
import { put } from '@vercel/blob';
import { calcularCarta } from './calcular-carta.js';
import { generarReporte } from './generar-reporte.js';
import { enviarReporte, enviarAlertaInterna, enviarReporteRevision } from './enviar-reporte.js';
import { validarReporte } from './validar-reporte.js';
import { renderReporteWeb } from './plantilla-reporte-web.js';
import {
  modoRevisionActivo, emailRevision, guardarReportePendiente, urlAprobacion, urlFeedback,
} from './revision-reporte.js';

// Versión web del Mapa (plantilla top-tier): se genera SIEMPRE y se guarda en
// Blob con URL impredecible; el email lleva el botón "Abrir tu Mapa". Si el
// render o el Blob fallan, el reporte sigue su curso solo por email.
async function generarMapaWeb(paymentIntentId, nombre, reporte, idioma) {
  try {
    const html = renderReporteWeb({ nombre, reporte, idioma });
    const { url } = await put(`mapas/${paymentIntentId}.html`, html, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'text/html; charset=utf-8',
    });
    return url;
  } catch (error) {
    console.warn(`⚠️ [${paymentIntentId}] Mapa web no generado (continúa solo email):`, String(error).slice(0, 200));
    return '';
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const MAX_INTENTOS = 3;
const PROCESANDO_TIMEOUT_MS = 10 * 60 * 1000; // tras 10 min, un "procesando" se considera muerto

export async function procesarPedido(paymentIntentId, { forzar = false, observaciones = '' } = {}) {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  const md = pi.metadata || {};
  const { customer_name, customer_email, birth_date, birth_time, birth_place, producto } = md;

  // Idioma del reporte ('es'|'en'); pedidos antiguos no lo traen → 'es'.
  const idioma = md.idioma === 'en' ? 'en' : 'es';

  if (!customer_name || !customer_email || !birth_date || !birth_place) {
    return { estado: 'datos_incompletos' };
  }

  // Pedidos antiguos guardaban 'Not provided' cuando faltaba la hora; el
  // protocolo sin hora del prompt se activa solo con valor vacío.
  const birthTime = !birth_time || birth_time === 'Not provided' ? '' : birth_time;

  // La historia de vida viaja troceada en historia_vida_1..N porque la
  // metadata de Stripe limita cada valor a 500 caracteres.
  const historiaVida = Object.keys(md)
    .filter((k) => /^historia_vida_\d+$/.test(k))
    .sort((a, b) => parseInt(a.slice(14), 10) - parseInt(b.slice(14), 10))
    .map((k) => md[k])
    .join('');

  const intentos = parseInt(md.reporte_intentos || '0', 10);

  if (!forzar) {
    if (md.reporte_status === 'enviado') return { estado: 'ya_enviado' };
    if (md.reporte_status === 'en_revision') return { estado: 'en_revision' };
    if (md.reporte_status === 'procesando') {
      const inicio = Date.parse(md.reporte_inicio_at || 0);
      if (Date.now() - inicio < PROCESANDO_TIMEOUT_MS) return { estado: 'en_proceso' };
    }
    if (intentos >= MAX_INTENTOS) return { estado: 'max_intentos' };
  }

  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: {
      reporte_status: 'procesando',
      reporte_intentos: String(intentos + 1),
      reporte_inicio_at: new Date().toISOString(),
    },
  });

  try {
    console.log(`🔭 [${paymentIntentId}] Calculando carta natal...`);
    const carta = await calcularCarta(birth_date, birthTime, birth_place, {
      nombre: customer_name,
    });

    console.log(`🤖 [${paymentIntentId}] Generando reporte con Claude...`);
    const reporte = await generarReporte({
      nombre: customer_name,
      email: customer_email,
      birthDate: birth_date,
      birthTime,
      birthPlace: birth_place,
      carta,
      observaciones,
      historiaVida,
      producto,
      idioma,
    });

    // Lineamiento AKSHA: el texto generado se valida contra la carta Swiss
    // Ephemeris. En modo directo una discrepancia bloquea el envío (el cron
    // reintenta con una generación nueva); en modo revisión va marcada.
    const validacion = validarReporte(reporte, carta);
    if (!validacion.ok) {
      console.warn(`⚠️ [${paymentIntentId}] Validación:`, validacion.errores);
    }

    const urlWeb = await generarMapaWeb(paymentIntentId, customer_name, reporte, idioma);

    // Modo revisión: el reporte va primero a la revisora con link de
    // aprobación; el cliente lo recibe cuando ella aprueba (/api/aprobar-reporte).
    if (modoRevisionActivo()) {
      console.log(`🔍 [${paymentIntentId}] Modo revisión: enviando a`, emailRevision());
      const blobUrl = await guardarReportePendiente(paymentIntentId, reporte);
      const envioRevision = await enviarReporteRevision({
        nombre: customer_name,
        emailCliente: customer_email,
        emailRevisora: emailRevision(),
        reporte,
        urlWeb,
        linkAprobacion: urlAprobacion(paymentIntentId),
        linkFeedback: urlFeedback(paymentIntentId),
        paymentIntentId,
        validacion,
      });

      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          reporte_status: 'en_revision',
          reporte_blob_url: blobUrl,
          reporte_web_url: urlWeb,
          reporte_revision_resend_id: envioRevision?.id || '',
          reporte_revision_at: new Date().toISOString(),
          reporte_error: '',
        },
      });

      console.log(`✅ [${paymentIntentId}] Reporte en revisión (${emailRevision()})`);
      return { estado: 'en_revision', resend_id: envioRevision?.id };
    }

    if (!validacion.ok) {
      throw new Error(
        `Validación astrológica falló — envío bloqueado: ${validacion.errores.join(' | ')}`,
      );
    }

    console.log(`📧 [${paymentIntentId}] Enviando reporte a:`, customer_email);
    const envio = await enviarReporte({ nombre: customer_name, email: customer_email, reporte, urlWeb, idioma });

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        reporte_status: 'enviado',
        reporte_web_url: urlWeb,
        reporte_resend_id: envio?.id || '',
        reporte_enviado_at: new Date().toISOString(),
        reporte_error: '',
      },
    });

    console.log(`✅ [${paymentIntentId}] Reporte enviado a`, customer_email);
    return { estado: 'enviado', resend_id: envio?.id };
  } catch (error) {
    console.error(`❌ [${paymentIntentId}] Error en pipeline:`, error);
    // Los valores de metadata de Stripe aceptan máx. 500 caracteres
    const detalle = String(error).slice(0, 450);

    await stripe.paymentIntents
      .update(paymentIntentId, {
        metadata: { reporte_status: 'fallido', reporte_error: detalle },
      })
      .catch((e) => console.error('No se pudo registrar el fallo en Stripe:', e));

    await enviarAlertaInterna({
      asunto: `🔴 Reporte FALLIDO — ${customer_name} (intento ${intentos + 1}/${MAX_INTENTOS})`,
      texto:
        `El pipeline de reporte falló.\n\n` +
        `PaymentIntent: ${paymentIntentId}\n` +
        `Cliente: ${customer_name} <${customer_email}>\n` +
        `Nacimiento: ${birth_date} ${birthTime || '(sin hora)'} · ${birth_place}\n` +
        `Intento: ${intentos + 1} de ${MAX_INTENTOS}\n\n` +
        `Error:\n${detalle}\n\n` +
        (intentos + 1 < MAX_INTENTOS
          ? 'El cron diario lo reintentará automáticamente.'
          : '⚠️ MÁXIMO DE INTENTOS ALCANZADO — requiere revisión manual.'),
    }).catch((e) => console.error('No se pudo enviar la alerta interna:', e));

    throw error;
  }
}

// Busca pagos exitosos de los últimos días cuyo reporte no llegó a enviarse
// y los reprocesa (uno por invocación: cada pipeline tarda ~4 min y el límite
// de la función es 300s). Con dryRun solo lista, sin procesar ni escribir.
export async function reprocesarPendientes({ maxPedidos = 1, dryRun = false } = {}) {
  const desde = Math.floor(Date.now() / 1000) - 3 * 24 * 3600;
  const lista = await stripe.paymentIntents.list({ created: { gte: desde }, limit: 100 });

  const pendientes = lista.data.filter((pi) => {
    const md = pi.metadata || {};
    if (pi.status !== 'succeeded') return false;
    if (!md.customer_email || !md.birth_date) return false;
    if (md.reporte_status === 'enviado') return false;
    if (md.reporte_status === 'en_revision') return false; // espera aprobación, no reprocesar
    if (parseInt(md.reporte_intentos || '0', 10) >= MAX_INTENTOS) return false;
    if (md.reporte_status === 'procesando') {
      const inicio = Date.parse(md.reporte_inicio_at || 0);
      if (Date.now() - inicio < PROCESANDO_TIMEOUT_MS) return false;
    }
    return true;
  });

  const resumen = pendientes.map((pi) => ({
    id: pi.id,
    cliente: pi.metadata.customer_name,
    email: pi.metadata.customer_email,
    status: pi.metadata.reporte_status || '(sin procesar)',
    intentos: pi.metadata.reporte_intentos || '0',
  }));

  if (dryRun) return { dryRun: true, pendientes: resumen };

  const resultados = [];
  for (const pi of pendientes.slice(0, maxPedidos)) {
    try {
      resultados.push({ id: pi.id, ...(await procesarPedido(pi.id)) });
    } catch (error) {
      resultados.push({ id: pi.id, estado: 'fallido', error: String(error).slice(0, 200) });
    }
  }
  return { pendientes: resumen, procesados: resultados };
}
