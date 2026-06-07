import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Shield, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const features = {
  en: [
    'Complete Human Blueprint Analysis',
    'Core Archetypal Profile',
    'Emotional Processing Pattern',
    'Talent Pattern Suite (4 dimensions)',
    'Developmental Destiny Vector',
    'Energy · Strengths · Gift · Impact Map',
    '30+ page personalized Purpose Report (PDF)',
    'AI-synthesized — unique to your birth data',
    'Delivered to your email within 24 hours',
  ],
  es: [
    'Análisis Completo del Mapa Humano',
    'Perfil Arquetípico Central',
    'Patrón de Procesamiento Emocional',
    'Suite de Patrones de Talento (4 dimensiones)',
    'Vector de Destino de Desarrollo',
    'Mapa de Energía · Fortalezas · Don · Impacto',
    'Reporte de Propósito de 30+ páginas (PDF)',
    'Sintetizado por IA — único según tu fecha de nacimiento',
    'Entregado a tu email en menos de 24 horas',
  ],
};

const faqs = {
  en: [
    {
      q: 'What is the Founding Member price?',
      a: 'We are in our early access phase. The first people who believe in this project get the report at $47 — before the price moves to $79. No discount code needed. Just act before the price changes.',
    },
    {
      q: 'Is this a one-time payment?',
      a: 'Yes. You pay once and your report is yours forever. No subscriptions, no renewals, no hidden fees.',
    },
    {
      q: 'How is this different from other personality tests?',
      a: 'AKSHA is not a test. It is a map built from your unique birth data — day, time, and place. Every report is generated fresh by AI, synthesizing decades of research into a deeply personal document.',
    },
    {
      q: 'What is your refund policy?',
      a: 'Refunds are available only if the report has not yet been generated. Once your report has been created and delivered, all sales are final. If you have questions before purchasing, write to purpose@aksha.life.',
    },
  ],
  es: [
    {
      q: '¿Qué es el precio de Miembro Fundador?',
      a: 'Estamos en nuestra fase de acceso temprano. Las primeras personas que creen en este proyecto obtienen el reporte a $47 — antes de que el precio suba a $79. No se necesita código de descuento. Solo actúa antes de que cambie el precio.',
    },
    {
      q: '¿Es un pago único?',
      a: 'Sí. Pagas una vez y tu reporte es tuyo para siempre. Sin suscripciones, sin renovaciones, sin cargos ocultos.',
    },
    {
      q: '¿En qué se diferencia de otros tests de personalidad?',
      a: 'AKSHA no es un test. Es un mapa construido desde tus datos únicos de nacimiento — día, hora y lugar. Cada reporte es generado por IA, sintetizando décadas de investigación en un documento profundamente personal.',
    },
    {
      q: '¿Cuál es su política de reembolso?',
      a: 'Los reembolsos están disponibles solo si el reporte aún no ha sido generado. Una vez creado y entregado, todas las ventas son finales. Si tienes preguntas antes de comprar, escríbenos a purpose@aksha.life.',
    },
  ],
};

const PricingPage = () => {
  const { lang } = useLanguage();
  const f = features[lang] || features.en;
  const faq = faqs[lang] || faqs.en;

  const isEs = lang === 'es';

  return (
    <>
      <Helmet>
        <title>{isEs ? 'Precios — AKSHA Mapa de Propósito' : 'Pricing — AKSHA Purpose Map'}</title>
        <meta name="description" content={isEs
          ? 'Acceso Fundador a $47 — pronto $79. Reporte de Propósito personalizado único para ti.'
          : 'Founding Member access at $47 — soon $79. Your unique personalized Purpose Report.'} />
      </Helmet>

      <div className="min-h-screen bg-background">

        {/* HERO */}
        <section className="pt-28 pb-10 px-4 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="relative z-10 max-w-2xl mx-auto"
          >
            <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-5"
              style={{ color: 'rgba(212,175,55,0.7)' }}>
              {isEs ? 'Un pago único · Acceso de por vida' : 'One-time payment · Lifetime access'}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-foreground leading-tight"
              style={{ letterSpacing: '-0.02em' }}>
              {isEs ? <>Tu <span className="text-primary">Mapa de Propósito</span></> : <>Your <span className="text-primary">Purpose Map</span></>}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isEs
                ? 'Una inversión única para entender quién eres y hacia dónde vas.'
                : 'A single investment in understanding who you are and where you are going.'}
            </p>
          </motion.div>
        </section>

        {/* SINGLE PRICING CARD */}
        <section className="pb-20 px-4">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* FOUNDING MEMBER BANNER */}
              <div className="rounded-t-2xl px-6 py-3 text-center flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(212,175,55,0.15)', border: '1.5px solid rgba(212,175,55,0.4)', borderBottom: 'none' }}>
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#D4AF37' }} />
                <p className="text-sm font-semibold" style={{ color: '#D4AF37' }}>
                  {isEs ? '⚡ Precio Miembro Fundador — pronto será $79' : '⚡ Founding Member Price — soon $79'}
                </p>
              </div>

              {/* CARD */}
              <div className="rounded-b-2xl p-8"
                style={{ backgroundColor: '#0a1828', border: '1.5px solid rgba(212,175,55,0.4)', borderTop: 'none' }}>

                {/* Price */}
                <div className="flex items-end gap-3 mb-1">
                  <div className="flex items-start">
                    <span className="text-2xl font-bold mt-2" style={{ color: '#D4AF37' }}>$</span>
                    <span className="text-8xl font-bold leading-none" style={{ color: '#D4AF37', letterSpacing: '-0.04em' }}>47</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl text-white/25 line-through">$79</span>
                  </div>
                </div>

                <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
                  {isEs ? 'Pago único · Sin suscripciones' : 'One-time payment · No subscriptions'}
                </p>

                <div className="h-px mb-6" style={{ backgroundColor: 'rgba(212,175,55,0.15)' }} />

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {f.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                      <span className="text-white/80">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to="/checkout?plan=basic">
                  <Button size="lg" className="w-full text-base py-6 font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-[0.98]">
                    {isEs ? 'Obtener Mi Reporte Ahora →' : 'Get My Report Now →'}
                  </Button>
                </Link>

                <p className="text-center text-xs text-white/30 mt-4">
                  {isEs
                    ? 'Reembolso disponible solo si el reporte aún no ha sido generado.'
                    : 'Refunds available only if report has not yet been generated.'}
                </p>
              </div>
            </motion.div>

            {/* TRUST SIGNALS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 grid grid-cols-3 gap-3"
            >
              {[
                { icon: Shield, label: isEs ? 'Pago seguro' : 'Secure payment' },
                { icon: Zap, label: isEs ? 'Entrega en 24h' : 'Delivered in 24h' },
                { icon: Sparkles, label: isEs ? 'Único para ti' : 'Unique to you' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <item.icon className="w-5 h-5 mb-2" style={{ color: '#D4AF37' }} />
                  <p className="text-xs text-white/60 leading-tight">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
          <div className="max-w-2xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold text-foreground text-center mb-12" style={{ letterSpacing: '-0.02em' }}>
              {isEs ? 'Preguntas frecuentes' : 'Common questions'}
            </motion.h2>
            <div className="space-y-8">
              {faq.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="border-b pb-8" style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
                  <p className="font-semibold text-foreground mb-3">{item.q}</p>
                  <p className="text-muted-foreground leading-relaxed text-sm">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-28 px-4 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative z-10 max-w-xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
              {isEs
                ? <>Tu propósito ya está <span className="text-primary">escrito.</span></>
                : <>Your purpose is already <span className="text-primary">written.</span></>}
            </h2>
            <p className="text-lg text-muted-foreground mb-3 leading-relaxed">
              {isEs ? 'Es hora de leer el mapa.' : "It's time to read the map."}
            </p>
            <p className="text-sm mb-10 font-medium" style={{ color: 'rgba(212,175,55,0.7)' }}>
              {isEs ? '$47 ahora · $79 pronto' : '$47 now · $79 soon'}
            </p>
            <Link to="/checkout?plan=basic">
              <Button size="lg" className="text-lg px-10 py-7 transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                {isEs ? 'Obtener Mi Reporte — $47' : 'Get My Report — $47'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

      </div>
    </>
  );
};

export default PricingPage;
