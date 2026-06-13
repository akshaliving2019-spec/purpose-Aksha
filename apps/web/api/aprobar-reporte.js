// Aprobación de un reporte en revisión: GET /api/aprobar-reporte?pi=...&token=...
// El link llega en el email de revisión. Verifica el HMAC, recupera el texto
// guardado en Blob y lo envía al cliente desde reportes@aksha.life.

import Stripe from 'stripe';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { enviarReporte } from './_lib/enviar-reporte.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// El nombre y email vienen del formulario de checkout (controlados por el
// cliente) y se interpolan en HTML: hay que escaparlos siempre.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function pagina(titulo, mensaje) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo} · AKSHA LIFE</title></head>
<body style="font-family:Georgia,serif;background:#07142F;color:#fff;margin:0;padding:0;">
  <div style="max-width:560px;margin:0 auto;padding:64px 24px;text-align:center;">
    <div style="color:#D4AF37;font-size:24px;font-weight:bold;letter-spacing:4px;">AKSHA LIFE</div>
    <h1 style="color:#D4AF37;font-size:22px;margin-top:40px;">${titulo}</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:16px;line-height:1.8;">${mensaje}</p>
  </div>
</body></html>`;
}

function responder(res, status, titulo, mensaje) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(status).send(pagina(titulo, mensaje));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pi, token } = req.query || {};
  const secreto = process.env.REVISION_SECRET;
  if (!secreto) {
    return responder(res, 500, 'Configuración incompleta',
      'REVISION_SECRET no está configurado en el servidor.');
  }
  if (!pi || !token) {
    return responder(res, 400, 'Link incompleto', 'Faltan parámetros en el enlace.');
  }

  const esperado = createHmac('sha256', secreto).update(String(pi)).digest('hex');
  const a = Buffer.from(String(token));
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return responder(res, 401, 'Link no válido',
      'Este enlace de aprobación no es válido o fue alterado.');
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(String(pi));
  const md = paymentIntent.metadata || {};

  if (md.reporte_status === 'enviado') {
    return responder(res, 200, 'Ya enviado ✅',
      `Este reporte ya fue aprobado y enviado a <strong>${escapeHtml(md.customer_email || 'el cliente')}</strong>. No se envió de nuevo.`);
  }
  if (md.reporte_status !== 'en_revision' || !md.reporte_blob_url) {
    return responder(res, 409, 'No disponible',
      `Este pedido no tiene un reporte pendiente de aprobación (estado: ${escapeHtml(md.reporte_status || 'sin procesar')}).`);
  }

  const respuesta = await fetch(md.reporte_blob_url);
  if (!respuesta.ok) {
    return responder(res, 500, 'Error al recuperar el reporte',
      'No se pudo leer el reporte guardado. Escríbenos a Purpose@aksha.life.');
  }
  const reporte = await respuesta.text();

  const idioma = md.idioma === 'en' ? 'en' : 'es';

  const envio = await enviarReporte({
    nombre: md.customer_name,
    email: md.customer_email,
    reporte,
    urlWeb: md.reporte_web_url || '',
    idioma,
  });

  await stripe.paymentIntents.update(String(pi), {
    metadata: {
      reporte_status: 'enviado',
      reporte_resend_id: envio?.id || '',
      reporte_enviado_at: new Date().toISOString(),
      reporte_error: '',
    },
  });

  return responder(res, 200, 'Reporte aprobado ✅',
    `El Mapa de Propósito de <strong>${escapeHtml(md.customer_name)}</strong> fue enviado a <strong>${escapeHtml(md.customer_email)}</strong>.`);
}
