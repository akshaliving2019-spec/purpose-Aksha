import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const plan = searchParams.get('plan') || 'basic';
  const planName = plan === 'pro' ? t.paymentSuccess.planPro : t.paymentSuccess.planBasic;
  const minutes = plan === 'pro' ? '60' : '30';

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
