// Recibe la historia de vida desde la página de gracias (después del pago) y
// la guarda en la metadata del pedido; con historia vacía solo libera la
// espera (botón "omitir"). El client_secret del PaymentIntent — que Stripe
// añade a la URL de retorno del pago — hace de prueba de propiedad del pedido.
import Stripe from 'stripe';
import { timingSafeEqual } from 'node:crypto';
import { waitUntil } from '@vercel/functions';
import { trocearHistoria } from './_lib/historia-vida.js';
import { procesarPedido } from './_lib/pipeline-reporte.js';

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

  const { paymentIntentId, clientSecret, historiaVida } = req.body || {};

  if (typeof paymentIntentId !== 'string' || !/^pi_[A-Za-z0-9]+$/.test(paymentIntentId) ||
      typeof clientSecret !== 'string' || clientSecret.length > 200 ||
      (historiaVida && (typeof historiaVida !== 'string' || historiaVida.length > 2500))) {
    return res.status(400).json({ error: 'Invalid field format.' });
  }

  let pi;
  try {
    pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const a = Buffer.from(String(pi.client_secret || ''));
  const b = Buffer.from(clientSecret);
  if (!pi.client_secret || a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Not authorized.' });
  }

  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: { ...trocearHistoria(historiaVida), espera_historia: '0' },
  });

  // El pipeline solo arranca con el pago confirmado (o pedido gratis por
  // cupón): sin este guard, un PaymentIntent creado y nunca pagado generaría
  // un reporte gratis. Si el pago aún está en proceso, el webhook lo
  // disparará al confirmarse — ya con la historia guardada.
  if (pi.status === 'succeeded' || pi.metadata?.cupon_gratis === '1') {
    waitUntil(
      procesarPedido(paymentIntentId).catch((error) => {
        // procesarPedido ya registró el fallo y envió la alerta interna;
        // el cron de pendientes lo reintenta.
        console.error('Pipeline falló tras agregar historia', paymentIntentId, error);
      })
    );
  }

  return res.status(200).json({ ok: true });
}
