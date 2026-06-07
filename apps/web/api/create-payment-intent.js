// Vercel Serverless Function — creates a Stripe PaymentIntent
// Deployed automatically at: /api/create-payment-intent

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price map — matches plan IDs to amounts in cents
const PRICES = {
  basic: 4700,  // $47.00
  pro:   9700,  // $97.00
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan } = req.body;

  if (!plan || !PRICES[plan]) {
    return res.status(400).json({ error: 'Invalid plan. Use "basic" or "pro".' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRICES[plan],
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        plan,
        product: `AKSHA ${plan.charAt(0).toUpperCase() + plan.slice(1)} Purpose Report`,
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ error: 'Failed to create payment intent.' });
  }
}
