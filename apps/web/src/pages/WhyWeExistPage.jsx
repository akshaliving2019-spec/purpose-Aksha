import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.75, delay },
});

const WhyWeExistPage = () => {
  const { lang } = useLanguage();

  const c = {
    en: {
      meta: 'Why We Exist | AKSHA',
      metaDesc: 'If you are here, perhaps you are a seeker, just like us. Welcome to the journey of remembering who you are.',
      eyebrow: 'Why We Exist',
      manifesto1: 'The greatest challenge of the AI era is not technological.',
      manifesto2: 'It is human.',
      pullQuote: '"When survival becomes the priority, self-discovery is often postponed."',
      p1: 'If you are here, perhaps you are a seeker, just like us.',
      p2: 'The journey of self-discovery is not the same for everyone.',
      p3: 'Some are born surrounded by opportunity, guidance, and support. Others spend much of their lives simply trying to survive.',
      p4: 'We do not all begin from the same starting line.',
      layersTitle: 'Life adds layers to each of us.',
      p5: 'Expectations, fears, responsibilities, disappointments, beliefs, and experiences. For some, those layers are few. For others, they can feel endless.',
      onionText: 'Like peeling a giant onion, the journey back to ourselves can take years, sometimes a lifetime.',
      p6: 'Yet beneath those layers lives something that has never disappeared:',
      p6bold: 'your unique gifts, talents, motivations, and potential.',
      aiTitle: 'A new kind of challenge.',
      p7: 'As artificial intelligence transforms the world around us, knowing who we truly are may become one of the most important challenges of our time.',
      missionTitle: 'Why AKSHA was created.',
      p8: 'AKSHA was created to help people reconnect with that deeper part of themselves — not by telling them who to become, but by helping them discover what has been there all along.',
      p9: 'Because your path may be different from mine, but your uniqueness matters just as much.',
      cta: 'Welcome to the journey of remembering who you are.',
      ctaBtn: 'Begin Your Journey',
    },
    es: {
      meta: 'Por Qué Existimos | AKSHA',
      metaDesc: 'Si estás aquí, quizás eres un buscador, al igual que nosotros. Bienvenido al viaje de recordar quién eres.',
      eyebrow: 'Por Qué Existimos',
      manifesto1: 'El mayor desafío de la era de la IA no es tecnológico.',
      manifesto2: 'Es humano.',
      pullQuote: '"Cuando la supervivencia se convierte en la prioridad, el autodescubrimiento suele posponerse."',
      p1: 'Si estás aquí, quizás eres un buscador, al igual que nosotros.',
      p2: 'El viaje del autodescubrimiento no es igual para todos.',
      p3: 'Algunos nacen rodeados de oportunidades, guía y apoyo. Otros pasan gran parte de su vida simplemente tratando de sobrevivir.',
      p4: 'No todos comenzamos desde la misma línea de salida.',
      layersTitle: 'La vida añade capas a cada uno de nosotros.',
      p5: 'Expectativas, miedos, responsabilidades, decepciones, creencias y experiencias. Para algunos, esas capas son pocas. Para otros, pueden parecer interminables.',
      onionText: 'Como pelar una cebolla gigante, el camino de regreso a nosotros mismos puede tomar años, a veces toda una vida.',
      p6: 'Sin embargo, debajo de esas capas vive algo que nunca ha desaparecido:',
      p6bold: 'tus dones únicos, talentos, motivaciones y potencial.',
      aiTitle: 'Un nuevo tipo de desafío.',
      p7: 'A medida que la inteligencia artificial transforma el mundo a nuestro alrededor, saber quiénes somos realmente puede convertirse en uno de los desafíos más importantes de nuestra época.',
      missionTitle: 'Por qué se creó AKSHA.',
      p8: 'AKSHA fue creado para ayudar a las personas a reconectarse con esa parte más profunda de sí mismas — no diciéndoles en quiénes convertirse, sino ayudándoles a descubrir lo que siempre ha estado ahí.',
      p9: 'Porque tu camino puede ser diferente al mío, pero tu singularidad importa igual.',
      cta: 'Bienvenido al viaje de recordar quién eres.',
      ctaBtn: 'Comenzar Mi Viaje',
    },
  }[lang] || {};

  return (
    <>
      <Helmet>
        <title>{c.meta}</title>
        <meta name="description" content={c.metaDesc} />
      </Helmet>

      <div className="bg-background min-h-screen">

        {/* ── HERO: MANIFESTO ── */}
        <section className="relative pt-36 pb-24 px-4 overflow-hidden text-center">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.p {...fadeUp(0)} className="text-xs uppercase tracking-[0.45em] mb-10 font-semibold"
              style={{ color: 'rgba(212,175,55,0.65)' }}>
              {c.eyebrow}
            </motion.p>

            {/* Manifesto statement */}
            <motion.div {...fadeUp(0.1)} className="mb-16">
              <p className="text-3xl md:text-4xl lg:text-5xl font-light leading-snug mb-3"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                {c.manifesto1}
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                style={{ letterSpacing: '-0.02em' }}>
                {c.manifesto2}
              </p>
            </motion.div>

            {/* Questions that move the floor */}
            <motion.div {...fadeUp(0.15)} className="flex flex-wrap justify-center gap-3 mb-14">
              {(lang === 'es'
                ? ['¿Qué hago ahora?', '¿Sigo siendo útil?', '¿Dónde encajo?', '¿Qué tengo yo que una máquina no tiene?']
                : ['What do I do now?', 'Am I still useful?', 'Where do I fit?', 'What do I have that a machine doesn\'t?']
              ).map((q, i) => (
                <motion.span
                  key={q}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="text-sm md:text-base px-4 py-2 rounded-full italic"
                  style={{
                    color: 'rgba(212,175,55,0.85)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    backgroundColor: 'rgba(212,175,55,0.05)',
                  }}
                >
                  {q}
                </motion.span>
              ))}
            </motion.div>

            {/* Opening line */}
            <motion.p {...fadeUp(0.2)}
              className="text-xl md:text-2xl text-foreground/70 leading-relaxed font-light italic max-w-xl mx-auto">
              {c.p1}
            </motion.p>
          </div>
        </section>

        {/* ── SECTION 1: NOT THE SAME STARTING LINE ── */}
        <section className="py-20 px-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
          <div className="max-w-2xl mx-auto space-y-8">
            <motion.p {...fadeUp(0)} className="text-xl md:text-2xl text-foreground/80 leading-relaxed">
              {c.p2}
            </motion.p>

            <motion.p {...fadeUp(0.1)} className="text-lg text-foreground/65 leading-relaxed">
              {c.p3}
            </motion.p>

            {/* Pull quote */}
            <motion.blockquote {...fadeUp(0.2)}
              className="border-l-4 pl-6 py-2 my-8"
              style={{ borderColor: '#D4AF37' }}>
              <p className="text-xl md:text-2xl font-semibold italic leading-relaxed"
                style={{ color: '#D4AF37' }}>
                {c.pullQuote}
              </p>
            </motion.blockquote>

            <motion.p {...fadeUp(0.3)}
              className="text-xl md:text-2xl font-semibold text-foreground leading-snug"
              style={{ letterSpacing: '-0.01em' }}>
              {c.p4}
            </motion.p>
          </div>
        </section>

        {/* ── SECTION 2: THE ONION LAYERS ── */}
        <section className="py-20 px-4" style={{ backgroundColor: 'rgba(7,20,47,0.45)' }}>
          <div className="max-w-2xl mx-auto">
            <motion.h2 {...fadeUp(0)}
              className="text-3xl md:text-4xl font-bold mb-8 leading-tight"
              style={{ letterSpacing: '-0.02em' }}>
              {c.layersTitle}
            </motion.h2>

            <motion.p {...fadeUp(0.1)} className="text-lg text-foreground/65 leading-relaxed mb-12">
              {c.p5}
            </motion.p>

            {/* Visual: onion rings */}
            <motion.div {...fadeUp(0.2)}
              className="rounded-2xl p-10 text-center mb-10"
              style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1.5px solid rgba(212,175,55,0.18)' }}>
              <div className="relative flex items-center justify-center mb-7" style={{ height: '170px' }}>
                {[160, 126, 92, 58, 28].map((size, i) => (
                  <div key={size} className="absolute rounded-full" style={{
                    width: size, height: size,
                    border: `1.5px solid rgba(212,175,55,${0.1 + i * 0.12})`,
                    backgroundColor: `rgba(212,175,55,${0.01 + i * 0.015})`,
                  }} />
                ))}
                <span className="relative text-[10px] font-bold tracking-[0.3em] uppercase"
                  style={{ color: '#D4AF37' }}>YOU</span>
              </div>
              <p className="text-base md:text-lg text-foreground/70 leading-relaxed max-w-md mx-auto italic">
                {c.onionText}
              </p>
            </motion.div>

            {/* The core that remains */}
            <motion.p {...fadeUp(0.3)} className="text-lg text-foreground/65 leading-relaxed">
              {c.p6}{' '}
              <span className="font-semibold text-white">{c.p6bold}</span>
            </motion.p>
          </div>
        </section>

        {/* ── SECTION 3: AI CHALLENGE ── */}
        <section className="py-20 px-4 border-t border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
          <div className="max-w-2xl mx-auto">
            <motion.h2 {...fadeUp(0)}
              className="text-3xl md:text-4xl font-bold mb-8 leading-tight"
              style={{ letterSpacing: '-0.02em' }}>
              {c.aiTitle}
            </motion.h2>
            <motion.p {...fadeUp(0.1)} className="text-lg text-foreground/70 leading-relaxed">
              {c.p7}
            </motion.p>
          </div>
        </section>

        {/* ── SECTION 4: MISSION ── */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.h2 {...fadeUp(0)}
              className="text-3xl md:text-4xl font-bold mb-8 leading-tight"
              style={{ letterSpacing: '-0.02em' }}>
              {c.missionTitle}
            </motion.h2>

            <motion.div {...fadeUp(0.1)}
              className="rounded-2xl p-8 mb-10"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.04) 100%)', border: '1.5px solid rgba(212,175,55,0.3)' }}>
              <p className="text-xl md:text-2xl text-foreground leading-relaxed">
                {c.p8}
              </p>
            </motion.div>

            <motion.p {...fadeUp(0.2)} className="text-lg text-foreground/65 leading-relaxed italic">
              {c.p9}
            </motion.p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 px-4 text-center relative overflow-hidden border-t"
          style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />
          <div className="relative z-10 max-w-xl mx-auto">
            <motion.p {...fadeUp(0)}
              className="text-3xl md:text-4xl font-bold mb-10 text-foreground leading-snug"
              style={{ letterSpacing: '-0.01em' }}>
              {c.cta}
            </motion.p>
            <motion.div {...fadeUp(0.15)}>
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
