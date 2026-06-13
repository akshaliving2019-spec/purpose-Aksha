// Vercel Serverless Function — creates a Stripe PaymentIntent with user birth data
import Stripe from 'stripe';
import {
  validarCupon, precioConCupon, mensajeCuponInvalido, PRECIO_BASE_CENTAVOS,
} from './_lib/cupones.js';
import { trocearHistoria } from './_lib/historia-vida.js';
import { normalizarPaisCiudad } from './_lib/pais-residencia.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  const { name, email, birthDate, birthTime, birthPlace, historiaVida, idioma, cupon } = req.body || {};

  if (!name || !email || !birthDate || !birthPlace) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (typeof name !== 'string' || name.length > 200 ||
      typeof email !== 'string' || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email) ||
      typeof birthDate !== 'string' || birthDate.length > 20 ||
      (birthTime && (typeof birthTime !== 'string' || birthTime.length > 20)) ||
      (historiaVida && (typeof historiaVida !== 'string' || historiaVida.length > 2500)) ||
      typeof birthPlace !== 'string' || birthPlace.length > 200) {
    return res.status(400).json({ error: 'Invalid field format.' });
  }

  // Idioma del reporte: 'es' o 'en'. Cualquier otra cosa (o ausencia) cae a
  // 'es' — los pedidos viejos no traen este campo y no deben romperse.
  const idiomaReporte = idioma === 'en' ? 'en' : 'es';

  // País/ciudad de residencia por IP, SIN fricción: Vercel inyecta estos
  // headers en runtime (ausentes en local/preview). La ciudad puede venir
  // URL-encoded. No hay campo de formulario ni cookie; si el header falta, el
  // pipeline deriva el país del lugar de nacimiento (respaldo de la Pieza 2).
  const { pais: paisResidencia, ciudad: ciudadResidencia } = normalizarPaisCiudad(
    req.headers['x-vercel-ip-city'],
    req.headers['x-vercel-ip-country'],
  );
  const metadataResidencia = {
    ...(paisResidencia ? { pais_residencia: paisResidencia } : {}),
    ...(ciudadResidencia ? { ciudad_residencia: ciudadResidencia } : {}),
  };

  // La historia de vida ya no se pide en el checkout: se recoge DESPUÉS del
  // pago en la página de gracias (/api/agregar-historia), para que el
  // formulario de compra no espante con preguntas largas. Si aun así llega
  // aquí (cliente viejo en caché), se respeta; si no, espera_historia avisa
  // al pipeline que dé una ventana antes de generar el reporte.
  const metadataHistoria = trocearHistoria(historiaVida);
  const esperaHistoria = Object.keys(metadataHistoria).length === 0;

  // Cupón: se revalida aquí aunque el frontend ya lo validó — el cupo pudo
  // agotarse entre "Aplicar" y "Pagar". Si Stripe no responde, se rechaza.
  let cuponAplicado = null;
  if (cupon) {
    if (typeof cupon !== 'string' || cupon.length > 50) {
      return res.status(400).json({ error: mensajeCuponInvalido('no_existe', idiomaReporte) });
    }
    try {
      const v = await validarCupon(cupon, { email });
      if (!v.valido) {
        return res.status(400).json({ error: mensajeCuponInvalido(v.motivo, idiomaReporte) });
      }
      cuponAplicado = v;
    } catch (error) {
      console.error('Error validando cupón:', error.message);
      return res.status(503).json({
        error: idiomaReporte === 'en'
          ? 'Could not validate the coupon right now. Please try again.'
          : 'No pudimos validar el cupón en este momento. Intenta de nuevo.',
      });
    }
  }

  const metadata = {
    product: 'AKSHA Purpose Report',
    customer_name: name,
    customer_email: email,
    birth_date: birthDate,
    // Vacío cuando el cliente no la conoce: el pipeline activa el
    // protocolo de Historia de Vida con valor falsy ('Not provided'
    // truthy lo rompía).
    birth_time: birthTime || '',
    birth_place: birthPlace,
    idioma: idiomaReporte,
    ...metadataResidencia,
    ...(esperaHistoria ? { espera_historia: '1' } : {}),
    ...(cuponAplicado
      ? { cupon: cuponAplicado.codigo, descuento_pct: String(cuponAplicado.pct) }
      : {}),
    ...metadataHistoria,
  };

  try {
    // Cupón 100%: no hay cobro. El PaymentIntent se crea solo como registro
    // del pedido (importe nominal, nunca se confirma como pago). El pipeline
    // NO arranca aquí: la página de gracias pide la historia de vida y su
    // formulario (/api/agregar-historia) lo dispara; si el cliente cierra la
    // pestaña, el cron lo procesa al expirar la ventana de espera.
    if (cuponAplicado?.pct === 100) {
      const pedido = await stripe.paymentIntents.create({
        amount: PRECIO_BASE_CENTAVOS,
        currency: 'usd',
        metadata: { ...metadata, cupon_gratis: '1' },
      });

      console.log(`🎁 [${pedido.id}] Pedido gratis con cupón ${cuponAplicado.codigo}`);
      return res.status(200).json({
        gratis: true,
        paymentIntentId: pedido.id,
        clientSecret: pedido.client_secret,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: cuponAplicado ? precioConCupon(cuponAplicado.pct) : PRECIO_BASE_CENTAVOS,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata,
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ error: 'Failed to create payment intent.' });
  }
}
