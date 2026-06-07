import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const WhyWeExistPage = () => {
  const { lang } = useLanguage();

  const content = {
    en: {
      meta: 'Why We Exist | AKSHA',
      metaDesc: 'If you are here, it is because — like us — you are a seeker. Welcome to the experience.',
      eyebrow: 'Why We Exist',
      headline: 'If you are here,\nit is because you are a seeker.',
      intro: 'Just like us.',
      p1: 'Many people live their entire lives without ever clearly discovering who they truly are. We are not our conditioning. We are not the roles assigned to us in childhood. Beneath all of that — beneath the noise — lives our real consciousness, on its own search, on its own journey of self-knowledge.',
      p2: 'And that journey is not easy.',
      layersHeadline: 'We arrive in this world whole.\nThen life begins to add layers.',
      layersText: 'From childhood, we acquire conditioning. Sometimes dozens of layers. Sometimes thousands. Family expectations. Cultural scripts. Societal pressures. Fear. Comparison. Survival patterns that no longer serve us.',
      onionLabel: 'The Onion Metaphor',
      onionText: 'Discovering who you truly are is like peeling a giant onion. Layer by layer. Sometimes with tears. Always with courage.',
      aiHeadline: 'AI cannot replace who you are.\nBut it can help you find yourself — faster.',
      aiText: 'AKSHA was built at the intersection of decades of human understanding and the speed of artificial intelligence. We use AI not to replace your humanity — but to accelerate the process of uncovering it. What once took years of therapy, journaling, and deep inner work, we begin to illuminate in a single report.',
      notAloneHeadline: 'You are not alone.',
      notAloneText: 'There are millions like you — people who feel the pull toward something more meaningful, more aligned, more true. This project exists to serve that search. To remove layers at the speed only AI makes possible. To help you encounter your true nature.',
      missionLabel: 'Our Mission',
      missionText: 'To give every human being on Earth access to a clear map of who they are — so they can stop surviving and start living with purpose.',
      cta: 'Welcome to the experience.',
      ctaBtn: 'Discover Your Purpose',
    },
    es: {
      meta: 'Por Qué Existimos | AKSHA',
      metaDesc: 'Si estás aquí, es porque — como nosotros — eres un buscador. Bienvenido a la experiencia.',
      eyebrow: 'Por Qué Existimos',
      headline: 'Si estás aquí,\nes porque eres un buscador.',
      intro: 'Al igual que nosotros.',
      p1: 'Muchas personas transcurren toda su vida sin descubrirlo claramente. No somos nuestro condicionamiento. No somos los roles que nos asignaron en la infancia. Debajo de todo eso — debajo del ruido — vive nuestra conciencia real, en su propia búsqueda, en su propio camino de autoconocimiento.',
      p2: 'Y ese camino no es fácil.',
      layersHeadline: 'Llegamos a este mundo completos.\nLuego la vida empieza a añadir capas.',
      layersText: 'Desde niños adquirimos condicionamientos. A veces decenas de capas. A veces miles. Expectativas familiares. Guiones culturales. Presiones sociales. Miedo. Comparación. Patrones de supervivencia que ya no nos sirven.',
      onionLabel: 'La Metáfora de la Cebolla',
      onionText: 'Descubrir quién realmente eres es como pelar una cebolla gigante. Capa por capa. A veces con lágrimas. Siempre con valentía.',
      aiHeadline: 'La IA no puede reemplazar quién eres.\nPero puede ayudarte a encontrarte — más rápido.',
      aiText: 'AKSHA fue construido en la intersección de décadas de comprensión humana y la velocidad de la inteligencia artificial. Usamos la IA no para reemplazar tu humanidad — sino para acelerar el proceso de descubrirla. Lo que antes tomaba años de terapia, journaling y trabajo interior profundo, comenzamos a iluminarlo en un solo reporte.',
      notAloneHeadline: 'No estás solo.',
      notAloneText: 'Hay millones como tú — personas que sienten el llamado hacia algo más significativo, más alineado, más verdadero. Este proyecto existe para servir a esa búsqueda. Para eliminar capas a la velocidad que solo la IA hace posible. Para ayudarte a encontrar tu verdadera naturaleza.',
      missionLabel: 'Nuestra Misión',
      missionText: 'Dar a cada ser humano en la Tierra acceso a un mapa claro de quién es — para que deje de sobrevivir y comience a vivir con propósito.',
      cta: 'Bienvenido a la experiencia.',
      ctaBtn: 'Descubre Tu Propósito',
    },
  };

  const c = content[lang] || content.en;

  return (
    <>
      <Helmet>
        <title>{c.meta}</title>
        <meta name="description" content={c.metaDesc} />
      </Helmet>

      <div className="bg-background min-h-screen">

        {/* HERO */}
        <section className="relative pt-36 pb-28 px-4 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />

          <div className="max-w-3xl mx-auto text-center relative z-10">

            {/* MANIFESTO STATEMENT */}
            <motion.div
              {...fadeUp}
              className="mb-12 pb-12 border-b"
              style={{ borderColor: 'rgba(212,175,55,0.15)' }}
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-snug text-foreground/60 italic">
                {lang === 'es'
                  ? <>El mayor desafío de la era de la IA<br/>no es tecnológico.<br/><span className="font-bold text-foreground not-italic">Es humano.</span></>
                  : <>The greatest challenge of the AI era<br/>is not technological.<br/><span className="font-bold text-foreground not-italic">It is human.</span></>
                }
              </p>
            </motion.div>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-xs uppercase tracking-[0.4em] mb-6 font-semibold"
              style={{ color: 'rgba(212,175,55,0.7)' }}
            >
              {c.eyebrow}
            </motion.p>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground"
              style={{ letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}
            >
              {c.headline}
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-2xl md:text-3xl font-light italic"
              style={{ color: '#D4AF37' }}
            >
              {c.intro}
            </motion.p>
          </div>
        </section>

        {/* SECTION 1 — THE SEARCH */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto space-y-7">
            <motion.p {...fadeUp} className="text-xl md:text-2xl text-foreground/80 leading-relaxed">
              {c.p1}
            </motion.p>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-2xl md:text-3xl font-semibold"
              style={{ color: '#D4AF37' }}
            >
              {c.p2}
            </motion.p>
          </div>
        </section>

        {/* SECTION 2 — LAYERS / ONION */}
        <section className="py-20 px-4 border-y" style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
          <div className="max-w-2xl mx-auto">
            <motion.h2
              {...fadeUp}
              className="text-3xl md:text-4xl font-bold mb-10 leading-snug"
              style={{ whiteSpace: 'pre-line', letterSpacing: '-0.02em' }}
            >
              {c.layersHeadline}
            </motion.h2>

            <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-lg text-foreground/70 leading-relaxed mb-10">
              {c.layersText}
            </motion.p>

            {/* Onion visual */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: 'rgba(212,175,55,0.06)', border: '1.5px solid rgba(212,175,55,0.2)' }}
            >
              {/* Concentric circles */}
              <div className="relative flex items-center justify-center mb-6" style={{ height: '160px' }}>
                {[140, 110, 80, 50].map((size, i) => (
                  <div
                    key={size}
                    className="absolute rounded-full"
                    style={{
                      width: size,
                      height: size,
                      border: `1.5px solid rgba(212,175,55,${0.15 + i * 0.15})`,
                      backgroundColor: `rgba(212,175,55,${0.02 + i * 0.02})`,
                    }}
                  />
                ))}
                <span className="relative text-xs font-bold tracking-widest uppercase" style={{ color: '#D4AF37' }}>YOU</span>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-2" style={{ color: 'rgba(212,175,55,0.6)' }}>
                {c.onionLabel}
              </p>
              <p className="text-base text-foreground/70 leading-relaxed max-w-sm mx-auto italic">
                {c.onionText}
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3 — AI + HUMAN */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.h2
              {...fadeUp}
              className="text-3xl md:text-4xl font-bold mb-8 leading-snug"
              style={{ whiteSpace: 'pre-line', letterSpacing: '-0.02em' }}
            >
              {c.aiHeadline}
            </motion.h2>
            <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-lg text-foreground/70 leading-relaxed">
              {c.aiText}
            </motion.p>
          </div>
        </section>

        {/* SECTION 4 — NOT ALONE */}
        <section className="py-20 px-4" style={{ backgroundColor: 'rgba(7,20,47,0.4)' }}>
          <div className="max-w-2xl mx-auto">
            <motion.h2
              {...fadeUp}
              className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              {c.notAloneHeadline}
            </motion.h2>
            <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-lg text-foreground/70 leading-relaxed mb-12">
              {c.notAloneText}
            </motion.p>

            {/* Mission box */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-2xl p-8"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.04) 100%)', border: '1.5px solid rgba(212,175,55,0.35)' }}
            >
              <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: 'rgba(212,175,55,0.7)' }}>
                {c.missionLabel}
              </p>
              <p className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                {c.missionText}
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 px-4 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-xl mx-auto">
            <motion.p
              {...fadeUp}
              className="text-3xl md:text-4xl font-bold mb-10 text-foreground"
              style={{ letterSpacing: '-0.01em' }}
            >
              {c.cta}
            </motion.p>
            <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.15 }}>
              <Link to="/discover">
                <Button size="lg" className="text-lg px-10 py-7 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] active:scale-[0.98]">
                  {c.ctaBtn}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
};

export default WhyWeExistPage;
