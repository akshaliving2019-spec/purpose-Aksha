import { Router } from 'express';
import Stripe from 'stripe';

// ─── REPLACE with your Stripe Secret Key ─────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY_HERE');
// ─────────────────────────────────────────────────────────────────────────────

const PRICES = {
  basic: 4700,  // $47.00 in cents
  pro:   9700,  // $97.00 in cents
};

const router = Router();

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !PRICES[plan]) {
      return res.status(400).json({ error: 'Invalid plan. Must be "basic" or "pro".' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRICES[plan],
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        plan,
        product: 'AKSHA Purpose Report',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint — for post-payment automation (send email, save to DB, etc.)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { plan } = paymentIntent.metadata;

    // TODO: trigger report generation & email delivery here
    console.log(`✅ Payment succeeded — Plan: ${plan}, Amount: $${paymentIntent.amount / 100}`);
  }

  res.json({ received: true });
});

export default router;
