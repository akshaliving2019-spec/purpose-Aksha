# AKSHA — Stripe Setup Guide

## Step 1 — Create your Stripe account
1. Go to https://stripe.com → "Start now"
2. Complete registration

## Step 2 — Get your API Keys
Dashboard → Developers → API Keys

Copy:
- `pk_test_...` → Publishable Key (frontend)
- `sk_test_...` → Secret Key (backend)

## Step 3 — Create your Products in Stripe
Dashboard → Products → Add product

**Product 1: AKSHA Basic**
- Name: AKSHA Basic Purpose Report
- Price: $47.00 USD — One time
- Copy the Price ID: `price_...`

**Product 2: AKSHA Pro**
- Name: AKSHA Pro Purpose Report  
- Price: $97.00 USD — One time
- Copy the Price ID: `price_...`

## Step 4 — Add your keys to the project

**Frontend** → `apps/web/src/pages/CheckoutPage.jsx` line 15:
```
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE';
```
Replace with your actual `pk_test_...` key.

**Backend** → `apps/api/.env`:
```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## Step 5 — Set up Webhook (for production)
Dashboard → Developers → Webhooks → Add endpoint
- URL: https://yourdomain.com/api/webhook
- Events: `payment_intent.succeeded`
- Copy the webhook secret → paste in .env

## Step 6 — Test payment
Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any CVC
- Any ZIP

## Flow
User → /pricing → selects plan → /checkout?plan=basic|pro
→ Stripe Payment Element → payment confirmed
→ redirects to /payment-success?plan=basic|pro
→ Webhook fires → trigger report generation + email
