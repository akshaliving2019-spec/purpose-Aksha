// Cron diario (14:00 UTC) del plan de 4 semanas. Para cada pedido cuyo cliente
// ya recibió el reporte, envía el email semanal que toca (+7/14/21/28 días).
// Estado en metadata del PaymentIntent (sin base de datos). Guard Bearer
// CRON_SECRET, igual que reprocesar-pendientes.js.
//   GET  ?dry=1   → lista candidatos, no envía nada
//   POST          → procesa hasta N=5 candidatos

import Stripe from 'stripe';
import { timingSafeEqual } from 'node:crypto';
import {
  semanaPendiente, parsearPlanLog, construirPlanLog,
} from './_lib/plan-elemento.js';
import { generarPlanSemanal } from './_lib/generar-plan-semanal.js';
import { enviarPlanSemanal } from './_lib/enviar-reporte.js';
import { validarReporte } from './_lib/validar-reporte.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const VENTANA_DIAS = 45;
const MAX_POR_CORRIDA = 5;
// El semanal no afirma posiciones: una carta-stub satisface la guarda de
// validarReporte y deja correr solo los chequeos de estilo (glifos, astro, largo).
const CARTA_STUB = { planetas: [{ nombre: '_', signo: '_', casa: 0 }], cuspides_casas: {} };

function tokenValido(recibido, esperado) {
  const a = Buffer.from(String(recibido));
  const b = Buffer.from(String(esperado));
  return a.length === b.length && timingSafeEqual(a, b);
}

async function candidatos() {
  const desde = Math.floor(Date.now() / 1000) - VENTANA_DIAS * 24 * 3600;
  const lista = await stripe.paymentIntents.list({ created: { gte: desde }, limit: 100 });
  const ahora = Date.now();
  return lista.data
    .map((pi) => ({ pi, semana: semanaPendiente(pi.metadata || {}, ahora) }))
    .filter((c) => c.semana > 0);
}

async function procesarUno(pi, semana) {
  const md = pi.metadata || {};
  const idioma = md.idioma === 'en' ? 'en' : 'es';
  const log = parsearPlanLog(md.plan_log);
  const intentosPrevios = Number(log[`s${semana}`]?.n || 0);

  try {
    const resp = await fetch(md.reporte_md_url);
    if (!resp.ok) throw new Error(`No se pudo bajar reporte.md (HTTP ${resp.status})`);
    const reporteMd = await resp.text();

    const contenido = await generarPlanSemanal({
      nombre: md.customer_name,
      reporteMd,
      elemento: md.plan_elemento || 'agua',
      semana,
      idioma,
    });

    const validacion = validarReporte(contenido, CARTA_STUB, { min: 400, max: 1100 });
    if (!validacion.ok) {
      throw new Error(`Validación del semanal falló: ${validacion.errores.join(' | ')}`);
    }

    const envio = await enviarPlanSemanal({
      nombre: md.customer_name,
      email: md.customer_email,
      contenidoMd: contenido,
      semana,
      idioma,
    });

    const nuevoLog = construirPlanLog(log, semana, new Date().toISOString(), intentosPrevios + 1);
    await stripe.paymentIntents.update(pi.id, {
      metadata: { plan_semana: String(semana), plan_log: nuevoLog, plan_error: '' },
    });

    return { id: pi.id, semana, estado: 'enviado', resend_id: envio?.id };
  } catch (error) {
    const detalle = String(error).slice(0, 400);
    const nuevoLog = construirPlanLog(log, semana, log[`s${semana}`]?.at || null, intentosPrevios + 1);
    await stripe.paymentIntents
      .update(pi.id, { metadata: { plan_log: nuevoLog, plan_error: detalle } })
      .catch((e) => console.error('No se pudo registrar el fallo del semanal:', e));
    console.error(`❌ [${pi.id}] Plan semana ${semana} falló:`, detalle);
    return { id: pi.id, semana, estado: 'fallido', error: detalle };
  }
}

export default async function handler(req, res) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) {
    console.error('❌ CRON_SECRET no configurado — endpoint bloqueado');
    return res.status(503).json({ error: 'Servicio no configurado' });
  }
  const auth = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!tokenValido(auth, secreto)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const dryRun = req.query?.dry === '1' || req.query?.dry === 'true';

  try {
    const todos = await candidatos();
    const lote = todos.slice(0, MAX_POR_CORRIDA);

    if (dryRun) {
      return res.status(200).json({
        dryRun: true,
        total: todos.length,
        candidatos: lote.map((c) => ({
          id: c.pi.id, cliente: c.pi.metadata.customer_name, semana: c.semana,
          elemento: c.pi.metadata.plan_elemento,
        })),
      });
    }

    const resultados = [];
    for (const c of lote) {
      resultados.push(await procesarUno(c.pi, c.semana));
    }
    console.log('🗓️ Plan semanal:', JSON.stringify(resultados));
    return res.status(200).json({ total: todos.length, procesados: resultados });
  } catch (error) {
    console.error('❌ Error en plan-semanal:', error);
    return res.status(500).json({ error: String(error) });
  }
}
