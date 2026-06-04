import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 47,
      priceId: 'STRIPE_PRICE_ID_BASIC', // Replace with your Stripe Price ID
      badge: null,
      tagline: 'Your core purpose map',
      description: 'Everything you need to understand your fundamental behavioral profile and life direction.',
      features: [
        'Core Archetypal Profile',
        'Emotional Processing Pattern',
        'Talent Pattern Suite (3 dimensions)',
        'Developmental Destiny Vector',
        '25-page Purpose Report (PDF)',
        'Gemini AI Synthesis',
        'Swiss Ephemeris Precision',
        '7-day money-back guarantee',
      ],
      cta: 'Get Basic Report',
      color: 'border-border/50 hover:border-primary/40',
      buttonVariant: 'outline',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 97,
      priceId: 'STRIPE_PRICE_ID_PRO', // Replace with your Stripe Price ID
      badge: 'Most Complete',
      tagline: 'Your complete purpose system',
      description: 'The full behavioral coordinate map with activation roadmap and Archetypal Vitality Index.',
      features: [
        'Everything in Basic',
        'Expansion & Structure Patterns',
        'Archetypal Vitality Index (IVA%)',
        '40+ page Complete Report (PDF)',
        'Activation Roadmap (90-day plan)',
        'Spanish version included',
        'Priority AI processing',
        '7-day money-back guarantee',
      ],
      cta: 'Get Pro Report',
      color: 'border-primary/60 hover:border-primary',
      buttonVariant: 'default',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Pricing — AKSHA Purpose Mapping System</title>
        <meta name="description" content="Discover your life purpose with AKSHA. Basic $47 or Pro $97 — one-time payment, lifetime access to your personalized Purpose Report." />
      </Helmet>

      <div className="min-h-screen bg-background">

        {/* HERO */}
        <section className="pt-24 pb-16 px-4 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 max-w-2xl mx-auto"
          >
            <Badge variant="outline" className="border-primary/40 text-primary mb-6 px-4 py-1.5 text-xs tracking-widest uppercase">
              One-time payment · Lifetime access
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Choose Your <span className="text-primary">Purpose Map</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A single investment in understanding who you are and where you are going.
              No subscriptions. No recurring charges.
            </p>
          </motion.div>
        </section>

        {/* PRICING CARDS */}
        <section className="pb-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <Card
                    className={`h-full relative border-2 transition-all duration-300 cursor-pointer bg-card ${plan.color} ${
                      selectedPlan === plan.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold tracking-widest uppercase shadow-[0_0_20px_rgba(200,168,75,0.4)]">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-0 pt-8 px-8">
                      <div className="mb-6">
                        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                      </div>

                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-2xl font-bold text-muted-foreground">$</span>
                        <span className="text-7xl font-bold text-foreground leading-none" style={{ letterSpacing: '-0.03em' }}>
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground tracking-widest uppercase mb-6">One-time payment</p>

                      <div className="h-px bg-border/50 mb-6" />

                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {plan.description}
                      </p>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className={feature === 'Everything in Basic' ? 'text-primary font-medium' : 'text-foreground/80'}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <Link to={`/checkout?plan=${plan.id}`}>
                        <Button
                          size="lg"
                          variant={plan.buttonVariant}
                          className={`w-full text-base py-6 transition-all duration-300 active:scale-[0.98] ${
                            plan.buttonVariant === 'default'
                              ? 'hover:shadow-[0_0_25px_rgba(200,168,75,0.35)]'
                              : 'border-primary/50 text-primary hover:bg-primary/10'
                          }`}
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* TRUST SIGNALS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {[
                { icon: Shield, title: '7-Day Guarantee', desc: 'Full refund if your report doesn\'t resonate. No questions asked.' },
                { icon: Zap, title: 'Instant Delivery', desc: 'Your Purpose Report arrives by email within 15–60 minutes.' },
                { icon: Sparkles, title: 'Unique to You', desc: 'No templates. Every report is generated fresh by Gemini AI.' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-lg border border-border/40 bg-card/50">
                  <item.icon className="w-6 h-6 text-primary mb-3" />
                  <p className="font-semibold text-foreground text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-24 border-t border-border/40 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
                What's included in each plan
              </h2>
            </motion.div>

            <div className="overflow-hidden rounded-lg border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left p-4 text-muted-foreground font-medium">Feature</th>
                    <th className="text-center p-4 text-primary font-semibold">Basic · $47</th>
                    <th className="text-center p-4 text-primary font-semibold">Pro · $97</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Core Archetypal Profile', true, true],
                    ['Emotional Processing Pattern', true, true],
                    ['Talent Pattern Suite', true, true],
                    ['Developmental Destiny Vector', true, true],
                    ['Expansion & Structure Patterns', false, true],
                    ['Archetypal Vitality Index (IVA%)', false, true],
                    ['Activation Roadmap (90-day)', false, true],
                    ['Spanish version included', false, true],
                    ['Report pages', '25 pages', '40+ pages'],
                    ['Processing priority', 'Standard', 'Priority'],
                    ['Money-back guarantee', '7 days', '7 days'],
                  ].map(([feature, basic, pro], i) => (
                    <tr key={i} className={`border-b border-border/30 ${i % 2 === 0 ? 'bg-card/30' : ''}`}>
                      <td className="p-4 text-foreground/80">{feature}</td>
                      <td className="p-4 text-center">
                        {typeof basic === 'boolean' ? (
                          basic ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-muted-foreground/40">—</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">{basic}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof pro === 'boolean' ? (
                          pro ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-muted-foreground/40">—</span>
                        ) : (
                          <span className="text-primary font-medium text-xs">{pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 border-t border-border/40 px-4 bg-muted/20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12" style={{ letterSpacing: '-0.02em' }}>
              Questions about pricing
            </h2>
            <div className="space-y-8">
              {[
                {
                  q: 'Is this a one-time payment?',
                  a: 'Yes. You pay once and receive your Purpose Report permanently. No subscriptions, no renewals, no hidden fees.'
                },
                {
                  q: 'Can I upgrade from Basic to Pro later?',
                  a: 'Yes. If you start with Basic and want the full Pro report, contact us and we\'ll apply your $47 toward the Pro price — you only pay the $50 difference.'
                },
                {
                  q: 'What if my report doesn\'t resonate?',
                  a: 'We offer a full 7-day money-back guarantee. If your report doesn\'t feel accurate or useful, email us and we\'ll refund you completely — no questions asked.'
                },
                {
                  q: 'Which plan is right for me?',
                  a: 'If you want to understand your core purpose and direction, Basic is perfect. If you want the full system — including your Archetypal Vitality Index, 90-day activation roadmap, and Spanish version — choose Pro.'
                },
              ].map((item, i) => (
                <div key={i} className="border-b border-border/40 pb-8">
                  <p className="font-semibold text-foreground mb-3">{item.q}</p>
                  <p className="text-muted-foreground leading-relaxed text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 px-4 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
              Your purpose is already <span className="text-primary">written</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              It's time to read the map.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/checkout?plan=basic">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/50 text-primary hover:bg-primary/10 transition-all duration-300 active:scale-[0.98]">
                  Basic — $47
                </Button>
              </Link>
              <Link to="/checkout?plan=pro">
                <Button size="lg" className="text-lg px-8 py-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                  Pro — $97
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
    </>
  );
};

export default PricingPage;
