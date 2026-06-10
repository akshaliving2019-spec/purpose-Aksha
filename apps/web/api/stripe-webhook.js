import Stripe from 'stripe';
import { waitUntil } from '@vercel/functions';
import { procesarPedido } from './pipeline-reporte.js';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Solo procesamos cuando el pago se completa exitosamente
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('✅ Pago exitoso:', paymentIntent.id);

    // Respondemos a Stripe de inmediato (su timeout es ~10s). El pipeline
    // sigue en background hasta maxDuration. procesarPedido registra estado
    // en la metadata del PaymentIntent: si esta entrega del evento está
    // duplicada, o si algo falla, queda constancia y el cron lo reintenta.
    waitUntil(
      procesarPedido(paymentIntent.id).catch((error) => {
        // procesarPedido ya registró el fallo y envió la alerta interna
        console.error('Pipeline falló para', paymentIntent.id, error);
      })
    );
  }

  return res.status(200).json({ received: true });
}

// Helper para obtener el body raw (necesario para verificar firma de Stripe)
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
