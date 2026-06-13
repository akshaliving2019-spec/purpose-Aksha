// Valida un cupón desde el checkout (botón "Aplicar"). Solo informa precio y
// porcentaje; el canje real se revalida server-side en create-payment-intent.
import {
  validarCupon, precioConCupon, mensajeCuponInvalido, PRECIO_BASE_CENTAVOS,
} from './_lib/cupones.js';

const ALLOWED_ORIGINS = [
  'https://aksha.life',
  'https://www.aksha.life',
  'http://localhost:3000',
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { codigo, idioma } = req.body || {};
  if (!codigo || typeof codigo !== 'string' || codigo.length > 50) {
    return res.status(400).json({ valido: false, error: mensajeCuponInvalido('no_existe', idioma) });
  }

  try {
    const v = await validarCupon(codigo);
    if (!v.valido) {
      return res.status(200).json({ valido: false, error: mensajeCuponInvalido(v.motivo, idioma) });
    }
    return res.status(200).json({
      valido: true,
      codigo: v.codigo,
      pct: v.pct,
      precioBase: PRECIO_BASE_CENTAVOS,
      precioFinal: precioConCupon(v.pct),
    });
  } catch (error) {
    console.error('Error validando cupón:', error.message);
    return res.status(503).json({
      valido: false,
      error: idioma === 'en'
        ? 'Could not validate the coupon right now. Please try again.'
        : 'No pudimos validar el cupón en este momento. Intenta de nuevo.',
    });
  }
}
