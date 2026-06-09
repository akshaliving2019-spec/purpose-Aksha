import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Activity, Layers, Compass, Zap, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay },
});

const pillarsES = [
  {
    icon: Layers,
    tag: 'Pilar 01',
    title: 'Arquetipos de Personalidad',
    what: '¿Qué son los arquetipos?',
    whatText: 'Un arquetipo es un patrón universal de comportamiento humano. No es un estereotipo ni una etiqueta — es una estructura profunda que define cómo piensas, cómo resuelves problemas y cómo te relacionas con el mundo. Carl Jung los identificó como los "moldes" fundamentales del carácter humano, presentes en todas las culturas a lo largo de la historia.',
    why: 'Por qué importa para ti',
    whyText: 'Conocer tu arquetipo central no te encasilla — te libera. Cuando entiendes el patrón desde el que operas naturalmente, dejas de luchar contra tu propia naturaleza y empiezas a construir desde tus fortalezas reales.',
  },
  {
    icon: Activity,
    tag: 'Pilar 02',
    title: 'Ciclos y Ritmos de Vida',
    what: '¿Qué son los ciclos vitales?',
    whatText: 'El desarrollo humano no es una línea recta hacia arriba. Funciona en ciclos — períodos de expansión, consolidación, transformación e integración. Desde Erikson hasta los estudios modernos de cronobiología, la ciencia confirma que los seres humanos pasamos por fases predecibles de desarrollo a lo largo de la vida.',
    why: 'Por qué importa para ti',
    whyText: 'Saber en qué fase del ciclo estás cambia todo. Una decisión que sería perfecta a los 28 puede ser un error a los 45 — no porque seas distinto, sino porque estás en un momento diferente. AKSHA calcula tu posición en ese mapa temporal.',
  },
  {
    icon: Compass,
    tag: 'Pilar 03',
    title: 'Patrones de Desarrollo',
    what: '¿Qué son los patrones de desarrollo?',
    whatText: 'Cada persona tiene una trayectoria única de crecimiento — habilidades que emergen temprano, otras que maduran con el tiempo, y capacidades que solo se activan bajo ciertas condiciones. La psicología del desarrollo lleva décadas mapeando estas trayectorias en millones de personas.',
    why: 'Por qué importa para ti',
    whyText: 'En un mundo donde la IA automatiza tareas, lo que no se puede automatizar es tu trayectoria única de desarrollo. Entender qué habilidades estás naturalmente programado para dominar es la diferencia entre adaptarte y quedar fuera.',
  },
  {
    icon: Brain,
    tag: 'Pilar 04',
    title: 'Psicología de los Cinco Grandes',
    what: '¿Qué son los Cinco Grandes rasgos?',
    whatText: 'El modelo Big Five es el marco de personalidad más estudiado y replicado de la psicología moderna. Identifica cinco dimensiones fundamentales del comportamiento: Apertura a la experiencia, Responsabilidad, Extraversión, Amabilidad y Estabilidad emocional. No es un test — es una cartografía del comportamiento humano respaldada por décadas de investigación intercultural.',
    why: 'Por qué importa para ti',
    whyText: 'Estos cinco rasgos predicen con alta precisión cómo funciones bajo presión, cómo aprendes, cómo lideras y cómo colaboras. Son la base científica que da credibilidad a todo lo demás.',
  },
  {
    icon: Sparkles,
    tag: 'Pilar 05',
    title: 'Marco Junguiano',
    what: '¿Qué es el marco junguiano?',
    whatText: 'Carl Jung propuso que más allá de la personalidad visible existe una capa más profunda de motivaciones, valores y vocaciones que raramente articulamos con claridad. Su psicología analítica lleva casi un siglo ayudando a entender por qué las personas se sienten atraídas hacia ciertos caminos, incluso cuando no pueden explicar racionalmente por qué.',
    why: 'Por qué importa para ti',
    whyText: 'La mayoría de las personas vive respondiendo a expectativas externas — de la familia, la cultura, el mercado. El marco junguiano ayuda a separar lo que genuinamente eres de lo que te dijeron que debías ser. Esa distinción es, con frecuencia, el punto de partida del propósito.',
  },
];

const pillarsEN = [
  {
    icon: Layers,
    tag: 'Pillar 01',
    title: 'Personality Archetypes',
    what: 'What are archetypes?',
    whatText: 'An archetype is a universal pattern of human behavior. It is not a stereotype or a label — it is a deep structure that defines how you think, how you solve problems, and how you relate to the world. Carl Jung identified them as the fundamental "templates" of human character, present across all cultures throughout history.',
    why: 'Why it matters for you',
    whyText: 'Knowing your core archetype does not box you in — it sets you free. When you understand the pattern from which you naturally operate, you stop fighting your own nature and start building from your real strengths.',
  },
  {
    icon: Activity,
    tag: 'Pillar 02',
    title: 'Life Cycles & Rhythms',
    what: 'What are life cycles?',
    whatText: 'Human development is not a straight line upward. It works in cycles — periods of expansion, consolidation, transformation and integration. From Erikson to modern chronobiology, science confirms that human beings go through predictable phases of development throughout life.',
    why: 'Why it matters for you',
    whyText: 'Knowing which phase of the cycle you are in changes everything. A decision that would be perfect at 28 might be a mistake at 45 — not because you are different, but because you are at a different moment. AKSHA calculates your position on that temporal map.',
  },
  {
    icon: Compass,
    tag: 'Pillar 03',
    title: 'Developmental Patterns',
    what: 'What are developmental patterns?',
    whatText: 'Each person has a unique growth trajectory — skills that emerge early, others that mature over time, and capacities that only activate under certain conditions. Developmental psychology has spent decades mapping these trajectories across millions of people.',
    why: 'Why it matters for you',
    whyText: 'In a world where AI automates tasks, what cannot be automated is your unique development trajectory. Understanding which skills you are naturally wired to master is the difference between adapting and being left behind.',
  },
  {
    icon: Brain,
    tag: 'Pillar 04',
    title: 'Big Five Psychology',
    what: 'What is the Big Five?',
    whatText: 'The Big Five model is the most studied and replicated personality framework in modern psychology. It identifies five fundamental dimensions of behavior: Openness to experience, Conscientiousness, Extraversion, Agreeableness and Emotional stability. It is not a test — it is a mapping of human behavior backed by decades of cross-cultural research.',
    why: 'Why it matters for you',
    whyText: 'These five traits predict with high accuracy how you function under pressure, how you learn, how you lead and how you collaborate. They are the scientific foundation that gives credibility to everything else.',
  },
  {
    icon: Sparkles,
    tag: 'Pillar 05',
    title: 'Jungian Framework',
    what: 'What is the Jungian framework?',
    whatText: 'Carl Jung proposed that beyond the visible personality there is a deeper layer of motivations, values and vocations that we rarely articulate clearly. His analytical psychology has spent nearly a century helping people understand why they feel drawn to certain paths, even when they cannot rationally explain why.',
    why: 'Why it matters for you',
    whyText: 'Most people live responding to external expectations — from family, culture, the market. The Jungian framework helps separate what you genuinely are from what you were told you should be. That distinction is, more often than not, the starting point of purpose.',
  },
];

const SciencePage = () => {
  const { lang } = useLanguage();
  const es = lang === 'es';
  const pillars = es ? pillarsES : pillarsEN;

  return (
    <>
      <Helmet>
        <title>{es ? 'La Ciencia del Propósito — AKSHA LIFE' : 'The Science of Purpose — AKSHA LIFE'}</title>
        <meta name="description" content={es
          ? 'La hipótesis AKSHA: la IA no crea el conocimiento sobre el ser humano — lo conecta. Descubre los cinco pilares científicos detrás de tu Mapa de Propósito.'
          : 'The AKSHA hypothesis: AI does not create knowledge about human beings — it connects it. Discover the five scientific pillars behind your Purpose Map.'} />
      </Helmet>

      <div className="min-h-screen bg-background">

        {/* ── HERO ── */}
        <section className="pt-28 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.p {...fadeUp(0)}
              className="text-xs uppercase tracking-[0.45em] font-semibold mb-6"
              style={{ color: 'rgba(212,175,55,0.65)' }}>
              {es ? 'La Ciencia del Propósito' : 'The Science of Purpose'}
            </motion.p>
            <motion.h1 {...fadeUp(0.1)}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight text-white"
              style={{ letterSpacing: '-0.02em' }}>
              {es ? <>La IA no crea el conocimiento.<br /><span className="text-primary">Lo conecta.</span></> : <>AI does not create knowledge.<br /><span className="text-primary">It connects it.</span></>}
            </motion.h1>
            <motion.p {...fadeUp(0.2)}
              className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              {es
                ? 'Durante décadas, el conocimiento sobre el ser humano ha existido fragmentado en disciplinas que raramente se hablaban entre sí. AKSHA utiliza inteligencia artificial para integrar ese conocimiento en un solo mapa, único para ti.'
                : 'For decades, knowledge about human beings has existed fragmented across disciplines that rarely spoke to each other. AKSHA uses artificial intelligence to integrate that knowledge into a single map, unique to you.'}
            </motion.p>
          </div>
        </section>

        {/* ── HYPOTHESIS BLOCK ── */}
        <section className="py-16 px-4 border-t border-b" style={{ borderColor: 'rgba(212,175,55,0.1)', backgroundColor: 'rgba(7,20,47,0.5)' }}>
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {(es ? [
                { icon: BookOpen, label: 'El contexto', text: 'Los seres humanos tienen patrones relativamente estables de comportamiento, motivación y desarrollo. Décadas de investigación los han documentado.' },
                { icon: Zap, label: 'Lo que cambia', text: 'Hasta hace poco, integrar ese conocimiento requería años de estudio especializado. La IA lo hace en segundos.' },
                { icon: Compass, label: 'La propuesta', text: 'AKSHA sintetiza múltiples marcos de comprensión humana para generar un mapa personalizado de quién eres y hacia dónde puedes ir.' },
              ] : [
                { icon: BookOpen, label: 'The context', text: 'Human beings have relatively stable patterns of behavior, motivation and development. Decades of research have documented them.' },
                { icon: Zap, label: 'What changes', text: 'Until recently, integrating that knowledge required years of specialized study. AI does it in seconds.' },
                { icon: Compass, label: 'The proposal', text: 'AKSHA synthesizes multiple frameworks of human understanding to generate a personalized map of who you are and where you can go.' },
              ]).map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} {...fadeUp(i * 0.12)} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                      <Icon className="w-5 h-5" style={{ color: '#D4AF37' }} />
                    </div>
                    <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#D4AF37' }}>{item.label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeUp(0)} className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: 'rgba(212,175,55,0.65)' }}>
                {es ? 'Los cinco pilares' : 'The five pillars'}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                {es ? 'El conocimiento que AKSHA integra' : 'The knowledge AKSHA integrates'}
              </h2>
            </motion.div>

            <div className="space-y-16">
              {pillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <motion.div key={i} {...fadeUp(0.1)}
                    className="border-t pt-12"
                    style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                        <Icon className="w-5 h-5" style={{ color: '#D4AF37' }} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: 'rgba(212,175,55,0.5)' }}>{pillar.tag}</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-white" style={{ letterSpacing: '-0.01em' }}>{pillar.title}</h3>
                      </div>
                    </div>

                    <div className="ml-14 space-y-6">
                      <div>
                        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(212,175,55,0.6)' }}>
                          {pillar.what}
                        </p>
                        <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          {pillar.whatText}
                        </p>
                      </div>
                      <div className="rounded-xl p-5"
                        style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#D4AF37' }}>
                          {pillar.why}
                        </p>
                        <p className="text-base leading-relaxed text-white/80">
                          {pillar.whyText}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CLOSING STATEMENT ── */}
        <section className="py-24 px-4 border-t text-center" style={{ borderColor: 'rgba(212,175,55,0.1)', backgroundColor: 'rgba(7,20,47,0.4)' }}>
          <div className="max-w-2xl mx-auto">
            <motion.p {...fadeUp(0)}
              className="text-2xl md:text-3xl font-light leading-relaxed mb-6"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              {es
                ? <>AKSHA no es <span className="text-white font-semibold">otro test de personalidad.</span></>
                : <>AKSHA is not <span className="text-white font-semibold">another personality test.</span></>}
            </motion.p>
            <motion.p {...fadeUp(0.1)}
              className="text-lg leading-relaxed mb-10"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              {es
                ? 'Es un sistema de síntesis de conocimiento humano, aumentado por inteligencia artificial, para ayudarte a comprender quién eres y cómo puedes aportar valor en un mundo que cambia rápidamente.'
                : 'It is a human knowledge synthesis system, augmented by artificial intelligence, to help you understand who you are and how you can contribute value in a rapidly changing world.'}
            </motion.p>
            <motion.div {...fadeUp(0.2)}>
              <a href="/checkout"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.35)]"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #B8942A)', color: '#0a0f1e' }}>
                {es ? 'Obtener Mi Mapa de Propósito' : 'Get My Purpose Map'}
              </a>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
};

export default SciencePage;
