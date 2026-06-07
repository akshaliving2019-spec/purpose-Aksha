import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Check, ArrowLeft, Lock, Loader2 } from 'lucide-react';

// ─── REPLACE THIS with your Stripe Publishable Key ───────────────────────────
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Tec6RK1mEqS5EO4P5RpHKqvJOBLPdJQQIkOEPej7q7mO5VcIpBJS7RZAS1j62P3k70qjK7WSvbCA5rz8qeoswvB00sqykh6yC';
// ─────────────────────────────────────────────────────────────────────────────

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const PLANS = {
  basic: {
    name: 'Basic',
    price: 47,
    features: ['Core Archetypal Profile', 'Emotional Processing Pattern', 'Talent Pattern Suite', 'Developmental Destiny Vector', '25-page Purpose Report (PDF)'],
  },
  pro: {
    name: 'Pro',
    price: 97,
    features: ['Everything in Basic', 'Expansion & Structure Patterns', 'Archetypal Vitality Index (IVA%)', '40+ page Complete Report', 'Activation Roadmap (90-day)', 'Spanish version included'],
  },
};

// ─── INNER PAYMENT FORM ───────────────────────────────────────────────────────
const CheckoutForm = ({ plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?plan=${plan}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
    // On success, Stripe redirects to return_url
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#c9a84c',
              colorBackground: '#1a2340',
              colorText: '#e8e8f0',
              colorDanger: '#ff6b6b',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              borderRadius: '8px',
              spacingUnit: '4px',
            },
          },
        }}
      />

      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!stripe || isProcessing}
        className="w-full text-base py-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(200,168,75,0.35)] active:scale-[0.98] disabled:opacity-60"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay ${PLANS[plan]?.price} — Get My Report
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        Secured by Stripe · 256-bit SSL encryption
      </p>
    </form>
  );
};

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('plan') || 'pro';
  const plan = PLANS[planId] || PLANS.pro;

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    // Call your backend to create a PaymentIntent
    // Replace '/api/create-payment-intent' with your actual API endpoint
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setFetchError('Could not initialize payment. Please try again.');
        }
        setLoading(false);
      })
      .catch(() => {
        setFetchError('Connection error. Please try again.');
        setLoading(false);
      });
  }, [planId]);

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#c9a84c',
        colorBackground: '#1a2340',
        colorText: '#e8e8f0',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>Checkout — AKSHA {plan.name} Report</title>
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-5xl mx-auto">

          {/* BACK */}
          <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to pricing
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* ORDER SUMMARY — left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="border-border/50 bg-card/80 sticky top-8">
                <CardHeader className="pb-0 pt-8 px-8">
                  <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                    Order Summary
                  </p>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    AKSHA {plan.name}
                  </h2>
                  <p className="text-muted-foreground text-sm">Purpose Mapping Report</p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="my-6 h-px bg-border/50" />

                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className={f === 'Everything in Basic' ? 'text-primary font-medium' : 'text-foreground/80'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="h-px bg-border/50 mb-6" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">One-time payment · Refunds only if report not yet generated</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* PAYMENT FORM — right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Card className="border-border/50 bg-card/80">
                <CardHeader className="pb-0 pt-8 px-8">
                  <h3 className="text-xl font-bold text-foreground mb-1">Payment details</h3>
                  <p className="text-sm text-muted-foreground">Your information is encrypted and secure.</p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="my-6 h-px bg-border/50" />

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Initializing secure payment...</p>
                    </div>
                  ) : fetchError ? (
                    <div className="py-8 text-center">
                      <p className="text-destructive text-sm mb-4">{fetchError}</p>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        Try again
                      </Button>
                    </div>
                  ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={stripeOptions}>
                      <CheckoutForm plan={planId} />
                    </Elements>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
