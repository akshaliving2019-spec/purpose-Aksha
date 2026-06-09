
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import HumanBlueprintDiagram from '@/components/HumanBlueprintDiagram';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const questionsEN = [
  'What do I do now?',
  'Am I still useful?',
  'Where do I fit?',
  'What do I have that a machine doesn\'t?',
];
const questionsES = [
  '¿Qué hago ahora?',
  '¿Sigo siendo útil?',
  '¿Dónde encajo?',
  '¿Qué tengo yo que una máquina no tiene?',
];

const RotatingQuestion = ({ lang }) => {
  const questions = lang === 'es' ? questionsES : questionsEN;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % questions.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [questions.length]);

  return (
    <div className="h-10 flex items-center justify-center overflow-hidden mb-10">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="text-base md:text-lg italic text-center px-4"
          style={{ color: 'rgba(212,175,55,0.75)' }}
        >
          {questions[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

// Placeholder reviews — replace with real ones from Aaron, Yofred, NRB
const reviewsEN = [
  {
    name: 'Aaron B.',
    country: 'USA',
    text: 'I never connected the dots between my different skills until AKSHA LIFE showed me how they all fit together.',
    stars: 5,
  },
  {
    name: 'Yofred G.',
    country: 'Venezuela',
    text: 'The report revealed something about me I had always felt but never been able to put into words.',
    stars: 5,
  },
  {
    name: 'Ricardo C.',
    country: 'Colombia',
    text: 'For the first time I have a clear direction — not based on what others expect, but on who I actually am.',
    stars: 5,
  },
];

const reviewsES = [
  {
    name: 'Aaron B.',
    country: 'EE.UU.',
    text: 'Nunca conecté los puntos entre mis diferentes habilidades hasta que AKSHA LIFE me mostró cómo encajan.',
    stars: 5,
  },
  {
    name: 'Yofred G.',
    country: 'Venezuela',
    text: 'El informe reveló algo sobre mí que siempre había sentido pero nunca había podido poner en palabras.',
    stars: 5,
  },
  {
    name: 'Ricardo C.',
    country: 'Colombia',
    text: 'Por primera vez tengo una dirección clara — no basada en lo que otros esperan, sino en quién realmente soy.',
    stars: 5,
  },
];

const ReviewCard = ({ review }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="rounded-2xl p-6 flex flex-col gap-3"
    style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
  >
    <div className="flex gap-1">
      {Array.from({ length: review.stars }).map((_, i) => (
        <span key={i} style={{ color: '#D4AF37' }}>★</span>
      ))}
    </div>
    <p className="text-white/75 text-sm leading-relaxed italic">"{review.text}"</p>
    <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.6)' }}>
      — {review.name} · {review.country}
    </p>
  </motion.div>
);

const HomePage = () => {
  const { t, lang } = useLanguage();
  const reviews = lang === 'es' ? reviewsES : reviewsEN;

  return (
    <>
      <Helmet>
        <title>AKSHA LIFE - {t.home.heroTitle}</title>
        <meta name="description" content={t.home.heroSubtitle} />
      </Helmet>

      <div className="bg-background flex flex-col min-h-screen">

        {/* HERO SECTION */}
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-5xl mx-auto"
          >
            <RotatingQuestion lang={lang} />

            <div className="flex justify-center mb-[40px]">
              <img
                src="/aksha-logo-hero.png"
                alt="AKSHA LIFE Logo"
                className="w-[190px] md:w-[230px] h-auto object-contain filter drop-shadow-[0_0_15px_rgba(200,168,75,0.4)]"
              />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-[30px] leading-tight text-foreground text-balance" style={{ letterSpacing: '-0.02em' }}>
              {t.home.heroTitle}
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-[40px] leading-relaxed max-w-3xl mx-auto text-balance">
              {t.home.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto">
              <Link to="/discover" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-lg px-8 py-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                  {t.home.discoverBtn}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/science" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-lg px-8 py-6 border-primary/50 text-primary hover:bg-primary/10 transition-all duration-300 active:scale-[0.98]">
                  {t.home.scienceBtn}
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* MANIFESTO BANNER */}
        <section className="py-16 px-4 border-y" style={{ borderColor: 'rgba(212,175,55,0.12)', backgroundColor: 'rgba(7,20,47,0.5)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-2xl md:text-3xl lg:text-4xl leading-snug font-light"
              style={{ color: 'rgba(255,255,255,0.55)' }}>
              {lang === 'es'
                ? <>{`El mayor desafío de la era de la IA\nno es tecnológico.`}<br /><span className="font-bold text-white">Es humano.</span></>
                : <>{`The greatest challenge of the AI era\nis not technological.`}<br /><span className="font-bold text-white">It is human.</span></>
              }
            </p>
          </motion.div>
        </section>

        {/* HUMAN BLUEPRINT INTERACTIVE DIAGRAM */}
        <HumanBlueprintDiagram />

        {/* WHAT AKSHA LIFE DOES */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
                {t.home.whatAkshaTitle}
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed whitespace-pre-line max-w-2xl mx-auto">
                {t.home.whatAkshaSubtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{t.home.revealsTitle}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t.home.revealsText}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{t.home.translatesTitle}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t.home.translatesText}</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* WHAT YOUR MAP REVEALS IMAGE */}
        <section className="w-full bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full flex justify-center px-4 md:px-8 py-8"
          >
            <img
              src="/lo-que-el-mapa-revela.jpg"
              alt={lang === 'es' ? 'Lo que el mapa revela acerca de ti' : 'What your map reveals about you'}
              className="w-full max-w-[88%] h-auto block rounded-xl"
            />
          </motion.div>
        </section>

        {/* HUELLA + REVIEWS */}
        <section className="py-24 bg-background border-t" style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

            {/* HUELLA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center mb-16"
            >
              <img
                src="/aksha-huella.png"
                alt="Tu Huella de Propósito"
                className="w-48 h-48 md:w-64 md:h-64 object-contain filter drop-shadow-[0_0_30px_rgba(212,175,55,0.45)] mb-6"
              />
              <p className="text-lg md:text-xl max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {lang === 'es'
                  ? 'Tu propósito es tan único como tu huella digital.\nNadie más tiene exactamente la tuya.'
                  : 'Your purpose is as unique as your fingerprint.\nNo one else has exactly yours.'
                }
              </p>
            </motion.div>

            {/* REVIEWS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
                {t.home.reviewsTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((review, i) => (
                  <ReviewCard key={i} review={review} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 bg-background relative overflow-hidden border-t border-border/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground text-balance" style={{ letterSpacing: '-0.02em' }}>
                {t.home.ctaTitle} <span className="text-primary">{t.home.ctaHighlight}</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed whitespace-pre-line text-balance">
                {t.home.ctaSubtitle}
              </p>
              <Link to="/discover">
                <Button size="lg" className="text-lg px-10 py-7 transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                  {t.home.ctaBtn}
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
};

export default HomePage;
