// Modo revisión: mientras REVISION_EMAIL esté configurada, los reportes NO se
// envían al cliente — van primero a la revisora con un link de aprobación.
// El texto del reporte se guarda en Vercel Blob (URL impredecible) para que
// /api/aprobar-reporte envíe al cliente exactamente la versión revisada.
// Requiere en Vercel: REVISION_EMAIL, REVISION_SECRET y un Blob store
// conectado al proyecto (BLOB_READ_WRITE_TOKEN automático).

import { put } from '@vercel/blob';
import { createHmac } from 'node:crypto';

export function modoRevisionActivo() {
  return Boolean((process.env.REVISION_EMAIL || '').trim());
}

export function emailRevision() {
  return (process.env.REVISION_EMAIL || '').trim();
}

export function tokenAprobacion(paymentIntentId) {
  const secreto = process.env.REVISION_SECRET;
  if (!secreto) {
    throw new Error('Modo revisión activo pero REVISION_SECRET no está configurado');
  }
  return createHmac('sha256', secreto).update(String(paymentIntentId)).digest('hex');
}

export function urlAprobacion(paymentIntentId) {
  const base = (process.env.APP_BASE_URL || 'https://aksha.life').replace(/\/$/, '');
  return `${base}/api/aprobar-reporte?pi=${encodeURIComponent(paymentIntentId)}&token=${tokenAprobacion(paymentIntentId)}`;
}

export function urlFeedback(paymentIntentId) {
  const base = (process.env.APP_BASE_URL || 'https://aksha.life').replace(/\/$/, '');
  return `${base}/api/feedback-reporte?pi=${encodeURIComponent(paymentIntentId)}&token=${tokenAprobacion(paymentIntentId)}`;
}

export async function guardarReportePendiente(paymentIntentId, reporte) {
  const { url } = await put(`revisiones/${paymentIntentId}.txt`, reporte, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'text/plain; charset=utf-8',
  });
  return url;
}
