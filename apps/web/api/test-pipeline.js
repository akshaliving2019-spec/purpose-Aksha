// Endpoint de prueba del pipeline completo (carta → Claude → email) sin pasar
// por Stripe. Protegido: requiere TEST_PIPELINE_TOKEN configurado en Vercel y
// enviado como Authorization: Bearer <token>.
//
// Uso:
//   POST /api/test-pipeline
//   { "nombre": "...", "email": "...", "fecha": "DD/MM/YYYY", "hora": "HH:MM",
//     "lugar": "Ciudad, País", "transitos": "YYYY-MM-DD", "lugar_transitos": "Miami",
//     "enviar": true }
// Si "enviar" es false, devuelve el reporte sin mandar el email.

import { timingSafeEqual } from 'node:crypto';
import { calcularCarta } from './calcular-carta.js';
import { generarReporte } from './generar-reporte.js';
import { enviarReporte } from './enviar-reporte.js';
import { validarReporte } from './validar-reporte.js';

function tokenValido(recibido, esperado) {
  const a = Buffer.from(String(recibido));
  const b = Buffer.from(String(esperado));
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!process.env.TEST_PIPELINE_TOKEN || !tokenValido(token, process.env.TEST_PIPELINE_TOKEN)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const {
    nombre, email, fecha, hora, lugar,
    transitos, lugar_transitos, enviar = false,
  } = req.body || {};

  if (!nombre || !email || !fecha || !lugar) {
    return res.status(400).json({ error: 'Faltan campos: nombre, email, fecha, lugar' });
  }

  const pasos = {};
  try {
    console.log('🔭 [test] Calculando carta natal...');
    const carta = await calcularCarta(fecha, hora, lugar, {
      nombre,
      transitos,
      lugarTransitos: lugar_transitos,
    });
    pasos.carta = carta.fallback ? 'fallback' : 'ok';

    console.log('🤖 [test] Generando reporte con Claude...');
    const reporte = await generarReporte({
      nombre, email, birthDate: fecha, birthTime: hora, birthPlace: lugar, carta,
    });
    pasos.reporte = `ok (${reporte.length} caracteres)`;

    const validacion = validarReporte(reporte, carta);
    pasos.validacion = validacion.ok
      ? 'ok — posiciones coinciden con Swiss Ephemeris'
      : `⚠️ discrepancias: ${validacion.errores.join(' | ')}`;

    let resultadoEnvio = null;
    if (enviar && !validacion.ok) {
      pasos.email = 'bloqueado por validación (lineamiento AKSHA)';
    } else if (enviar) {
      console.log('📧 [test] Enviando email a:', email);
      resultadoEnvio = await enviarReporte({ nombre, email, reporte });
      pasos.email = 'ok';
    } else {
      pasos.email = 'omitido (enviar=false)';
    }

    return res.status(200).json({
      ok: true,
      pasos,
      validacion,
      carta_texto: carta.texto,
      reporte,
      envio: resultadoEnvio,
    });
  } catch (error) {
    console.error('❌ [test] Error en pipeline:', error);
    // No incluir error.cause en la respuesta: puede contener headers con secretos.
    return res.status(500).json({
      ok: false,
      pasos,
      error: String(error),
      status: error?.status ?? null,
    });
  }
}
