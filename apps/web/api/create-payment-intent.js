// Vercel Serverless Function — creates a Stripe PaymentIntent with user birth data
import Stripe from 'stripe';

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

  const { name, email, birthDate, birthTime, birthPlace } = req.body || {};

  if (!name || !email || !birthDate || !birthPlace) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (typeof name !== 'string' || name.length > 200 ||
      typeof email !== 'string' || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email) ||
      typeof birthDate !== 'string' || birthDate.length > 20 ||
      (birthTime && (typeof birthTime !== 'string' || birthTime.length > 20)) ||
      typeof birthPlace !== 'string' || birthPlace.length > 200) {
    return res.status(400).json({ error: 'Invalid field format.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4700, // $47.00
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        product: 'AKSHA Purpose Report',
        customer_name: name,
        customer_email: email,
        birth_date: birthDate,
        birth_time: birthTime || 'Not provided',
        birth_place: birthPlace,
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ error: 'Failed to create payment intent.' });
  }
}
