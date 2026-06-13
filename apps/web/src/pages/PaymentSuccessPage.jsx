import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

// Historia de vida post-pago: el checkout se mantiene ligero y estas preguntas
// aparecen aquí, cuando el cliente ya compró. Enviar (u omitir) libera la
// generación del reporte al instante vía /api/agregar-historia; si cierra la
// pestaña sin responder, el pedido se procesa solo al expirar la ventana.
const HistoriaVidaForm = ({ paymentIntentId, clientSecret, lang }) => {
  const es = lang === 'es';
  const [historia, setHistoria] = useState('');
  const [estado, setEstado] = useState('pendiente'); // pendiente | enviando | enviado | omitido
  const [error, setError] = useState('');

  const enviar = async (historiaVida) => {
    setEstado('enviando');
    setError('');
    try {
      const res = await fetch('/api/agregar-historia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, clientSecret, historiaVida }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'failed');
      setEstado(historiaVida ? 'enviado' : 'omitido');
    } catch {
      setEstado('pendiente');
      setError(es ? 'No se pudo enviar. Intenta de nuevo.' : 'Could not send. Please try again.');
    }
  };

  if (estado === 'enviado' || estado === 'omitido') {
    return (
      <div className="p-6 rounded-lg border border-border/50 bg-card/50 mb-8 text-left">
        <p className="text-sm text-foreground/90 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
          {estado === 'enviado'
            ? (es ? 'Recibido. Tu historia ya forma parte de tu mapa.' : 'Received. Your story is now part of your map.')
            : (es ? 'Listo. Tu reporte sigue su curso.' : 'All set. Your report is on its way.')}
        </p>
      </div>
    );
  }

  const preguntas = es
    ? [
        '¿Qué eventos marcaron tu camino? (carrera, mudanzas, relaciones, logros — con fechas aproximadas)',
        '¿Qué se te repite una y otra vez?',
        '¿Cómo reaccionas bajo presión?',
        '¿Dónde fluyes sin esfuerzo y dónde te frenas?',
      ]
    : [
        'Which events shaped your path? (career, moves, relationships, achievements — with approximate dates)',
        'What keeps repeating in your life?',
        'How do you react under pressure?',
        'Where do you flow effortlessly, and where do you hold back?',
      ];

  return (
    <div className="p-6 rounded-lg border mb-8 text-left"
      style={{ borderColor: 'rgba(212,175,55,0.35)', backgroundColor: 'rgba(212,175,55,0.06)' }}>
      <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
        {es ? 'Un paso opcional: haz tu mapa aún más tuyo' : 'One optional step: make your map even more yours'}
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        {es
          ? 'Tu experiencia vivida también alimenta el análisis. Si quieres, responde lo que resuene:'
          : 'Your lived experience also feeds the analysis. If you like, answer whatever resonates:'}
      </p>
      <ul className="text-xs text-muted-foreground space-y-1 mb-4">
        {preguntas.map((q, i) => <li key={i}>· {q}</li>)}
      </ul>
      <textarea value={historia} onChange={e => setHistoria(e.target.value)}
        maxLength={2500} rows={5}
        placeholder={es
          ? 'Escribe aquí tu historia, en tus palabras...'
          : 'Write your story here, in your own words...'}
        className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200 resize-none bg-background/60 border border-border focus:ring-2 focus:ring-primary/40 text-foreground" />
      {error && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button onClick={() => enviar(historia.trim())} disabled={estado === 'enviando' || !historia.trim()}
          className="flex-1">
          {estado === 'enviando'
            ? (es ? 'Enviando...' : 'Sending...')
            : (es ? 'Añadir a mi mapa' : 'Add to my map')}
        </Button>
        <Button variant="ghost" onClick={() => enviar('')} disabled={estado === 'enviando'}
          className="text-muted-foreground">
          {es ? 'Omitir por ahora' : 'Skip for now'}
        </Button>
      </div>
    </div>
  );
};

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { t, lang } = useLanguage();
  const plan = searchParams.get('plan') || 'basic';
  const planName = plan === 'pro' ? t.paymentSuccess.planPro : t.paymentSuccess.planBasic;
  const minutes = plan === 'pro' ? '60' : '30';

  // Stripe añade estos parámetros al volver del pago (el flujo de cupón 100%
  // los pasa igual); con ellos el formulario de historia puede autenticarse.
  const paymentIntentId = searchParams.get('payment_intent') || '';
  const piClientSecret = searchParams.get('payment_intent_client_secret') || '';

  return (
    <>
      <Helmet>
        <title>{t.paymentSuccess.metaTitle}</title>
        <meta name="description" content={t.paymentSuccess.metaDesc} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="max-w-lg w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
              {t.paymentSuccess.confirmed}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              {t.paymentSuccess.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t.paymentSuccess.thanksBefore}
              <strong className="text-foreground">{t.paymentSuccess.planReport.replace('{plan}', planName)}</strong>.{' '}
              {t.paymentSuccess.arrivalNote.replace('{minutes}', minutes)}
            </p>

            {paymentIntentId && piClientSecret && (
              <HistoriaVidaForm paymentIntentId={paymentIntentId} clientSecret={piClientSecret} lang={lang} />
            )}

            <div className="p-6 rounded-lg border border-border/50 bg-card/50 mb-8 text-left space-y-3">
              {[t.paymentSuccess.bullet1, t.paymentSuccess.bullet2, t.paymentSuccess.bullet3].map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm text-foreground/80">{line}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/discover">
                <Button size="lg" className="text-base px-8 py-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                  {t.paymentSuccess.startBtn}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 border-primary/40 text-primary hover:bg-primary/10 transition-all active:scale-[0.98]">
                  {t.paymentSuccess.homeBtn}
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
