import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const questionsEN = ['What do I do now?','Am I still useful?','Where do I fit?','What do I have that a machine doesn\'t?','What was I born to do?'];
const questionsES = ['¿Qué hago ahora?','¿Sigo siendo útil?','¿Dónde encajo?','¿Qué tengo yo que una máquina no tiene?','¿Para qué nací realmente?'];

const RotatingQuestion = ({ lang }) => {
  const questions = lang === 'es' ? questionsES : questionsEN;
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % questions.length), 2800);
    return () => clearInterval(t);
  }, [questions.length]);
  return (
    <div className="h-10 flex items-center justify-center overflow-hidden mb-12">
      <AnimatePresence mode="wait">
        <motion.p key={index}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="text-lg md:text-xl italic text-center"
          style={{ color: 'rgba(212,175,55,0.75)' }}>
          {questions[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

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
      meta: 'Why We Exist | AKSHA — Your Purpose Map',
      metaDesc: 'AI is rewriting every job and every plan. AKSHA exists for one reason: to show you the one thing it can never replace — who you are.',
      eyebrow: 'Why We Exist',
      manifesto1: 'The biggest risk of the AI era is not losing your job.',
      manifesto2: 'It is never finding out who you are.',
      pullQuote: '"The most expensive thing you will ever pay for is not knowing what you were born to do."',
      p1: 'If you are here, you already feel it. The world is changing faster than anyone can keep up — and the only stable ground left is knowing exactly who you are.',
      p2: 'Here is what nobody tells you: self-discovery was never a level playing field.',
      p3: 'Some people are handed mentors, options, and a map. The rest of us spend decades just surviving — postponing the one question that decides everything: what am I actually here to do?',
      p4: 'You did not get a head start. That changes today.',
      layersTitle: 'Your real potential is buried under layers — and that is not your fault.',
      p5: 'Other people\'s expectations. Old fears. Responsibilities, disappointments, beliefs you never chose. Year after year the layers pile up — until even you cannot see what is underneath.',
      onionText: 'Most people spend twenty years or more peeling these layers alone, through trial, error, and expensive detours. AKSHA was built to compress that journey into days.',
      p6: 'Because beneath every layer, one thing never disappeared:',
      p6bold: 'your unique gifts, talents, drives, and potential — fully intact, waiting to be named.',
      aiTitle: 'AI changed the rules. Knowing yourself is the new advantage.',
      p7: 'Machines can now write, code, design, and analyze. The one thing they cannot copy is you: your exact combination of talents, motivations, and timing. In the next decade, the people who thrive will not be the ones who compete with AI — they will be the ones who know precisely what makes them irreplaceable.',
      missionTitle: 'That is why AKSHA exists.',
      p8: 'AKSHA exists to give you what most people never get: a clear, personal map of who you are. Not generic advice. Not another personality quiz. A Purpose Map built around one person — you — synthesizing neuroscience, psychology, archetypes, and chronobiology into answers you can act on the same day you read them.',
      p9: 'We cannot choose your path for you. We can do something better: show you the one you were already built for.',
      cta: 'Stop guessing who you are. Start knowing.',
      ctaOffer: 'Your personal Purpose Map — Founding Member price $47 (soon $79). Delivered to your inbox within 24–48 hours.',
      ctaBtn: 'Get My Purpose Map',
    },
    es: {
      meta: 'Por Qué Existimos | AKSHA — Tu Mapa de Propósito',
      metaDesc: 'La IA está reescribiendo cada trabajo y cada plan. AKSHA existe por una razón: mostrarte lo único que nunca podrá reemplazar — quién eres tú.',
      eyebrow: 'Por Qué Existimos',
      manifesto1: 'El mayor riesgo de la era de la IA no es perder tu trabajo.',
      manifesto2: 'Es no descubrir nunca quién eres.',
      pullQuote: '"Lo más caro que pagarás en tu vida es no saber para qué naciste."',
      p1: 'Si estás aquí, ya lo sientes. El mundo cambia más rápido de lo que nadie puede seguir — y el único terreno firme que queda es saber exactamente quién eres.',
      p2: 'Esto es lo que nadie te dice: el autodescubrimiento nunca fue un juego justo.',
      p3: 'A algunos les entregan mentores, opciones y un mapa. El resto pasamos décadas simplemente sobreviviendo — posponiendo la única pregunta que lo decide todo: ¿para qué estoy aquí realmente?',
      p4: 'No naciste con ventaja. Eso cambia hoy.',
      layersTitle: 'Tu verdadero potencial está enterrado bajo capas — y no es tu culpa.',
      p5: 'Las expectativas de otros. Miedos viejos. Responsabilidades, decepciones, creencias que nunca elegiste. Año tras año las capas se acumulan — hasta que ni tú mismo puedes ver lo que hay debajo.',
      onionText: 'La mayoría pasa veinte años o más pelando estas capas a solas, entre prueba, error y desvíos costosos. AKSHA fue creado para comprimir ese viaje en días.',
      p6: 'Porque debajo de cada capa, hay algo que nunca desapareció:',
      p6bold: 'tus dones, talentos, motivaciones y potencial únicos — intactos, esperando ser nombrados.',
      aiTitle: 'La IA cambió las reglas. Conocerte es la nueva ventaja.',
      p7: 'Las máquinas ya escriben, programan, diseñan y analizan. Lo único que no pueden copiar eres tú: tu combinación exacta de talentos, motivaciones y momento. En la próxima década, las personas que prosperen no serán las que compitan contra la IA — serán las que sepan con precisión qué las hace irreemplazables.',
      missionTitle: 'Para eso existe AKSHA.',
      p8: 'AKSHA existe para darte lo que la mayoría nunca recibe: un mapa claro y personal de quién eres. No consejos genéricos. No otro test de personalidad. Un Mapa de Propósito construido alrededor de una sola persona — tú — que sintetiza neurociencia, psicología, arquetipos y cronobiología en respuestas que puedes aplicar el mismo día que las lees.',
      p9: 'No podemos elegir tu camino por ti. Podemos hacer algo mejor: mostrarte el que ya estaba hecho para ti.',
      cta: 'Deja de adivinar quién eres. Empieza a saberlo.',
      ctaOffer: 'Tu Mapa de Propósito personal — precio de Miembro Fundador: $47 (pronto $79). Entregado en tu correo en 24–48 horas.',
      ctaBtn: 'Quiero Mi Mapa de Propósito',
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

            {/* LOGO */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center mb-10"
            >
              <img
                src="/aksha-logo-hero.png"
                alt="AKSHA"
                className="w-[140px] md:w-[180px] h-auto object-contain filter drop-shadow-[0_0_20px_rgba(212,175,55,0.45)]"
              />
            </motion.div>

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

            {/* Rotating question hook */}
            <RotatingQuestion lang={lang} />

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
                  style={{ color: '#D4AF37' }}>{lang === 'es' ? 'TÚ' : 'YOU'}</span>
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
              className="text-3xl md:text-4xl font-bold mb-6 text-foreground leading-snug"
              style={{ letterSpacing: '-0.01em' }}>
              {c.cta}
            </motion.p>
            <motion.p {...fadeUp(0.1)}
              className="text-base md:text-lg leading-relaxed mb-10"
              style={{ color: 'rgba(212,175,55,0.85)' }}>
              {c.ctaOffer}
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
