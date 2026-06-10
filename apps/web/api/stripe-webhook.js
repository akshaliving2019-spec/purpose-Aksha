import Stripe from 'stripe';
import { calcularCarta } from './calcular-carta.js';
import { generarReporte } from './generar-reporte.js';
import { enviarReporte } from './enviar-reporte.js';

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
    const metadata = paymentIntent.metadata;

    console.log('✅ Pago exitoso:', paymentIntent.id);
    console.log('📋 Metadata:', metadata);

    const {
      customer_name,
      customer_email,
      birth_date,
      birth_time,
      birth_place,
    } = metadata;

    // Validar que tenemos los datos necesarios
    if (!customer_name || !customer_email || !birth_date || !birth_place) {
      console.error('❌ Datos incompletos en metadata');
      return res.status(200).json({ received: true, warning: 'Datos incompletos' });
    }

    try {
      // 1. Calcular carta natal
      console.log('🔭 Calculando carta natal...');
      const carta = await calcularCarta(birth_date, birth_time, birth_place);

      // 2. Generar reporte con Claude
      console.log('🤖 Generando reporte con Claude...');
      const reporte = await generarReporte({
        nombre: customer_name,
        email: customer_email,
        birthDate: birth_date,
        birthTime: birth_time,
        birthPlace: birth_place,
        carta,
      });

      // 3. Enviar reporte por email
      console.log('📧 Enviando reporte a:', customer_email);
      await enviarReporte({
        nombre: customer_name,
        email: customer_email,
        reporte,
      });

      console.log('✅ Reporte enviado exitosamente a', customer_email);
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      // No fallamos el webhook — Stripe no reintentará innecesariamente
    }
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
