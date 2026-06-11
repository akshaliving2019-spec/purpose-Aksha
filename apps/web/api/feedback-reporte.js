// Ciclo de mejora continua del modo revisión.
// GET  ?pi=...&token=...  → formulario para registrar qué no estuvo bien.
// POST (desde el formulario) → guarda la observación en el registro de mejoras
// (Vercel Blob, prefijo "mejoras/"), avisa al buzón interno y regenera el
// reporte EN SEGUNDO PLANO incorporando las observaciones; la nueva versión
// llega de nuevo al email de revisión.
// GET  ?listar=1&token=...(HMAC de "listado-mejoras") → registro acumulado,
// para actualizar el prompt maestro cada cierto número de reportes.

import Stripe from 'stripe';
import { timingSafeEqual } from 'node:crypto';
import { put, list } from '@vercel/blob';
import { waitUntil } from '@vercel/functions';
import { tokenAprobacion } from './_lib/revision-reporte.js';
import { enviarAlertaInterna } from './_lib/enviar-reporte.js';
import { procesarPedido } from './_lib/pipeline-reporte.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CATEGORIAS = [
  'Datos astrológicos', 'Tono / lenguaje', 'Estructura', 'Profundidad', 'Otro',
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function tokenValido(recibido, esperado) {
  const a = Buffer.from(String(recibido));
  const b = Buffer.from(String(esperado));
  return a.length === b.length && timingSafeEqual(a, b);
}

function pagina(titulo, cuerpo) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo} · AKSHA LIFE</title></head>
<body style="font-family:Georgia,serif;background:#07142F;color:#fff;margin:0;padding:0;">
  <div style="max-width:640px;margin:0 auto;padding:48px 24px;">
    <div style="text-align:center;color:#D4AF37;font-size:24px;font-weight:bold;letter-spacing:4px;">AKSHA LIFE</div>
    <h1 style="color:#D4AF37;font-size:20px;margin-top:36px;">${titulo}</h1>
    ${cuerpo}
  </div>
</body></html>`;
}

function responder(res, status, titulo, cuerpo) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(status).send(pagina(titulo, cuerpo));
}

function formulario(pi, token, md) {
  const checks = CATEGORIAS.map((c) => `
    <label style="display:block;color:rgba(255,255,255,0.85);font-size:15px;margin:6px 0;">
      <input type="checkbox" name="categorias" value="${c}" style="margin-right:8px;">${c}
    </label>`).join('');
  return `
    <p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.7;">
      Reporte de <strong>${escapeHtml(md.customer_name || '')}</strong>
      &lt;${escapeHtml(md.customer_email || '')}&gt; · Pedido ${escapeHtml(pi)}
    </p>
    <form method="POST" action="/api/feedback-reporte">
      <input type="hidden" name="pi" value="${escapeHtml(pi)}">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <p style="color:#D4AF37;font-size:15px;margin-bottom:4px;">¿Qué área(s) necesitan mejorar?</p>
      ${checks}
      <p style="color:#D4AF37;font-size:15px;margin:20px 0 8px;">¿Qué no estuvo bien y cómo debería ser?</p>
      <textarea name="motivo" required rows="8" maxlength="4000"
        style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.06);border:1px solid rgba(212,175,55,0.4);border-radius:6px;color:#fff;font-family:Georgia,serif;font-size:15px;padding:12px;"
        placeholder="Ej.: El módulo de Pasión suena genérico; debería conectar la Casa 10 con el liderazgo que muestra la Luna en Escorpio..."></textarea>
      <label style="display:block;color:rgba(255,255,255,0.85);font-size:15px;margin:16px 0;">
        <input type="checkbox" name="regenerar" value="1" checked style="margin-right:8px;">
        Regenerar el reporte incorporando estas observaciones (te llegará una nueva versión para revisar)
      </label>
      <button type="submit"
        style="background:#D4AF37;color:#07142F;font-weight:bold;font-size:16px;padding:12px 28px;border:none;border-radius:6px;cursor:pointer;">
        Registrar observaciones
      </button>
    </form>
    <p style="color:rgba(255,255,255,0.45);font-size:12px;margin-top:20px;">
      Cada observación queda en el registro de mejoras de AKSHA para perfeccionar el prompt maestro.
    </p>`;
}

async function listarMejoras(res) {
  const { blobs } = await list({ prefix: 'mejoras/' });
  if (blobs.length === 0) {
    return responder(res, 200, 'Registro de mejoras', '<p style="color:rgba(255,255,255,0.8);">Aún no hay observaciones registradas.</p>');
  }
  const entradas = [];
  for (const blob of blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1))) {
    try {
      const r = await fetch(blob.url);
      entradas.push(await r.json());
    } catch { /* entrada ilegible: se omite */ }
  }
  const filas = entradas.map((e) => `
    <div style="border:1px solid rgba(212,175,55,0.3);border-radius:8px;padding:16px;margin-bottom:16px;">
      <p style="color:#D4AF37;font-size:14px;margin:0 0 6px;">${escapeHtml(e.fecha || '')} · ${escapeHtml(e.cliente || '')} · ${escapeHtml(e.pi || '')}</p>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 8px;">Áreas: ${escapeHtml((e.categorias || []).join(', ') || '—')}</p>
      <p style="color:rgba(255,255,255,0.9);font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap;">${escapeHtml(e.motivo || '')}</p>
    </div>`).join('');
  return responder(res, 200, `Registro de mejoras (${entradas.length})`, filas);
}

export default async function handler(req, res) {
  const datos = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const { pi, token } = datos;

  if (req.method === 'GET' && req.query?.listar) {
    if (!tokenValido(req.query.token || '', tokenAprobacion('listado-mejoras'))) {
      return responder(res, 401, 'Acceso no válido', '<p style="color:rgba(255,255,255,0.8);">El enlace del registro no es válido.</p>');
    }
    return listarMejoras(res);
  }

  if (!pi || !token || !tokenValido(token, tokenAprobacion(pi))) {
    return responder(res, 401, 'Enlace no válido', '<p style="color:rgba(255,255,255,0.8);">Este enlace de observaciones no es válido o fue alterado.</p>');
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(String(pi));
  const md = paymentIntent.metadata || {};

  if (req.method === 'GET') {
    return responder(res, 200, '✍️ Observaciones del reporte', formulario(pi, token, md));
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const motivo = String(datos.motivo || '').trim().slice(0, 4000);
  if (!motivo) {
    return responder(res, 400, 'Falta el motivo', '<p style="color:rgba(255,255,255,0.8);">Escribe qué no estuvo bien antes de enviar.</p>');
  }
  const categorias = [].concat(datos.categorias || []).filter((c) => CATEGORIAS.includes(c));
  const regenerar = Boolean(datos.regenerar);

  const entrada = {
    fecha: new Date().toISOString(),
    pi: String(pi),
    cliente: md.customer_name || '',
    categorias,
    motivo,
    regenerar,
  };
  await put(`mejoras/${entrada.fecha.replace(/[:.]/g, '-')}-${pi}.json`, JSON.stringify(entrada, null, 2), {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json',
  });

  await stripe.paymentIntents.update(String(pi), {
    metadata: {
      reporte_status: regenerar ? 'procesando' : 'rechazado',
      reporte_feedback: motivo.slice(0, 450),
    },
  });

  await enviarAlertaInterna({
    asunto: `✍️ Observaciones de revisión — ${md.customer_name || pi}`,
    texto:
      `Áreas: ${categorias.join(', ') || '—'}\n` +
      `Regenerar: ${regenerar ? 'sí' : 'no'}\n\n${motivo}\n\nPedido: ${pi}`,
  }).catch((e) => console.error('No se pudo enviar la alerta de feedback:', e));

  if (regenerar) {
    waitUntil(
      procesarPedido(String(pi), { forzar: true, observaciones: motivo }).catch((error) => {
        console.error('Regeneración con observaciones falló para', pi, error);
      }),
    );
    return responder(res, 200, 'Observaciones registradas ✅',
      `<p style="color:rgba(255,255,255,0.85);font-size:16px;line-height:1.8;">
        Quedaron en el registro de mejoras. El reporte de
        <strong>${escapeHtml(md.customer_name || '')}</strong> se está regenerando
        incorporándolas — la nueva versión te llegará al correo de revisión en unos minutos.
      </p>`);
  }

  return responder(res, 200, 'Observaciones registradas ✅',
    `<p style="color:rgba(255,255,255,0.85);font-size:16px;line-height:1.8;">
      Quedaron en el registro de mejoras. El reporte quedó marcado como
      <strong>rechazado</strong> y no se enviará al cliente.
    </p>`);
}
