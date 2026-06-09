import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Activity, Layers, Compass, Zap, BookOpen, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    discover: 'Detrás de cada persona existe una forma natural de pensar, resolver problemas y crear valor. Muchas veces esas fortalezas se vuelven invisibles precisamente porque las usamos todos los días — las damos por sentadas. Este análisis está diseñado para hacerlas visibles.',
    science: 'AKSHA incorpora el concepto de arquetipos desarrollado por Carl Jung y ampliado por décadas de investigación psicológica. Los arquetipos representan patrones recurrentes de comportamiento humano observados en diferentes culturas y generaciones.',
    urgency: 'La IA ya está reemplazando habilidades técnicas a una velocidad que la mayoría no anticipó. Lo que no puede reemplazar — todavía — es tu forma única de pensar y crear. Pero si tú mismo no la conoces con claridad, no puedes defenderla ni desarrollarla. El momento de identificar lo que te hace diferente no es cuando ya te lo hayan quitado.',
  },
  {
    icon: Activity,
    tag: 'Pilar 02',
    title: 'Ciclos y Ritmos de Vida',
    discover: 'No todas las capacidades emergen al mismo tiempo. Algunas aparecen temprano. Otras permanecen ocultas durante años hasta que determinadas experiencias las activan. Entender en qué punto de tu desarrollo te encuentras puede cambiar completamente cómo interpretas lo que estás viviendo ahora.',
    science: 'Este análisis integra investigaciones de psicología del desarrollo humano, estudios sobre ciclos vitales y observaciones longitudinales de décadas sobre cómo evolucionan las personas a lo largo de su vida.',
    urgency: 'Estamos en una época donde millones de personas deberán reinventarse profesionalmente, no una vez, sino varias. Los que lo hagan con claridad sobre su momento evolutivo tomarán decisiones más precisas. Los que no — seguirán reaccionando en lugar de elegir. La diferencia entre ambos no es suerte. Es autoconocimiento.',
  },
  {
    icon: Compass,
    tag: 'Pilar 03',
    title: 'Patrones de Desarrollo',
    discover: 'Cada persona posee una combinación única de talentos y capacidades que evolucionan con el tiempo. Algunas ya están activas. Otras permanecen latentes esperando las circunstancias adecuadas. Este análisis identifica cuáles son tus mayores fortalezas en desarrollo — las que aún no has capitalizado.',
    science: 'AKSHA incorpora principios de psicología del desarrollo, aprendizaje humano y estudios sobre adquisición de competencias a lo largo de la vida.',
    urgency: 'Las profesiones seguirán cambiando. Las herramientas seguirán cambiando. Pero la persona que sabe exactamente qué está aprendiendo a dominar — y por qué — siempre tiene ventaja sobre la que simplemente reacciona al mercado. Conocer tu trayectoria de desarrollo es conocer tu próximo paso con claridad.',
  },
  {
    icon: Brain,
    tag: 'Pilar 04',
    title: 'Psicología de los Cinco Grandes',
    discover: 'Las personas responden de manera diferente al estrés, al cambio, al liderazgo y a la incertidumbre. Comprender esos patrones en ti no es un ejercicio académico — es una ventaja práctica inmediata. Revela los entornos donde puedes prosperar con mayor facilidad y los que te drenan sin razón aparente.',
    science: 'El modelo Big Five es el marco de personalidad más investigado y validado de la psicología moderna. Sus dimensiones predicen con alta precisión comportamientos bajo presión, estilos de aprendizaje y dinámicas de equipo.',
    urgency: 'En un entorno que cambia cada seis meses, la persona que no se conoce a sí misma toma decisiones basadas en lo que cree que debería ser — no en lo que realmente es. Esa brecha tiene un costo enorme. Este análisis cierra esa brecha.',
  },
  {
    icon: Sparkles,
    tag: 'Pilar 05',
    title: 'Marco Junguiano — Motivaciones Profundas',
    discover: 'Muchas personas pasan años persiguiendo objetivos que en realidad pertenecen a expectativas externas — de la familia, la cultura, el mercado. El propósito de este análisis es ayudarte a distinguir lo que verdaderamente te mueve de lo que simplemente aprendiste a perseguir.',
    science: 'Basado en la psicología analítica de Carl Jung, este marco explora patrones profundos de significado, identidad y vocación presentes en la experiencia humana.',
    urgency: 'A medida que la IA transforma el valor de las habilidades técnicas, las motivaciones humanas profundas se vuelven más importantes, no menos. Son ellas las que señalan dónde una persona puede aportar su mayor creatividad, energía e impacto — lo que ningún algoritmo puede replicar. Conocerlas no es un lujo. Es una ventaja competitiva.',
  },
];

const pillarsEN = [
  {
    icon: Layers,
    tag: 'Pillar 01',
    title: 'Personality Archetypes',
    discover: 'Behind every person lies a natural way of thinking, solving problems and creating value. Often those strengths become invisible precisely because we use them every day — we take them for granted. This analysis is designed to make them visible.',
    science: 'AKSHA incorporates the concept of archetypes developed by Carl Jung and expanded by decades of psychological research. Archetypes represent recurring patterns of human behavior observed across different cultures and generations.',
    urgency: 'AI is already replacing technical skills at a speed most people did not anticipate. What it cannot replace — yet — is your unique way of thinking and creating. But if you yourself don\'t know it clearly, you can\'t defend it or develop it. The moment to identify what makes you different is not when it has already been taken from you.',
  },
  {
    icon: Activity,
    tag: 'Pillar 02',
    title: 'Life Cycles & Rhythms',
    discover: 'Not all capacities emerge at the same time. Some appear early. Others remain hidden for years until certain experiences activate them. Understanding where you are in your development can completely change how you interpret what you are living right now.',
    science: 'This analysis integrates research from developmental psychology, life cycle studies and decades of longitudinal observations on how people evolve throughout their lives.',
    urgency: 'We are in an era where millions of people will need to reinvent themselves professionally — not once, but several times. Those who do it with clarity about their evolutionary moment will make more precise decisions. Those who don\'t will keep reacting instead of choosing. The difference is not luck. It is self-knowledge.',
  },
  {
    icon: Compass,
    tag: 'Pillar 03',
    title: 'Developmental Patterns',
    discover: 'Every person has a unique combination of talents and capacities that evolve over time. Some are already active. Others remain latent waiting for the right circumstances. This analysis identifies your greatest strengths in development — the ones you have not yet capitalized on.',
    science: 'AKSHA incorporates principles of developmental psychology, human learning and studies on lifelong competency acquisition.',
    urgency: 'Professions will keep changing. Tools will keep changing. But the person who knows exactly what they are learning to master — and why — always has an advantage over the one who simply reacts to the market. Knowing your development trajectory means knowing your next step clearly.',
  },
  {
    icon: Brain,
    tag: 'Pillar 04',
    title: 'Big Five Psychology',
    discover: 'People respond differently to stress, change, leadership and uncertainty. Understanding those patterns in yourself is not an academic exercise — it is an immediate practical advantage. It reveals the environments where you can thrive with greater ease and the ones that drain you for no apparent reason.',
    science: 'The Big Five model is the most researched and validated personality framework in modern psychology. Its dimensions predict with high accuracy behaviors under pressure, learning styles and team dynamics.',
    urgency: 'In an environment that changes every six months, the person who does not know themselves makes decisions based on who they think they should be — not who they actually are. That gap has an enormous cost. This analysis closes that gap.',
  },
  {
    icon: Sparkles,
    tag: 'Pillar 05',
    title: 'Jungian Framework — Deep Motivations',
    discover: 'Many people spend years pursuing goals that actually belong to external expectations — from family, culture, the market. The purpose of this analysis is to help you distinguish what truly drives you from what you simply learned to pursue.',
    science: 'Based on Carl Jung\'s analytical psychology, this framework explores deep patterns of meaning, identity and vocation present in human experience.',
    urgency: 'As AI transforms the value of technical skills, deep human motivations become more important, not less. They are what point to where a person can contribute their greatest creativity, energy and impact — what no algorithm can replicate. Knowing them is not a luxury. It is a competitive advantage.',
  },
];

// Interactive pillar card
const PillarCard = ({ pillar, index, es }) => {
  const [open, setOpen] = useState(false);
  const Icon = pillar.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ border: open ? '1.5px solid rgba(212,175,55,0.45)' : '1.5px solid rgba(255,255,255,0.07)', backgroundColor: open ? 'rgba(212,175,55,0.04)' : 'rgba(255,255,255,0.02)', transition: 'all 0.3s' }}
      onClick={() => setOpen(v => !v)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: open ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${open ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.3s' }}>
            <Icon className="w-5 h-5" style={{ color: open ? '#D4AF37' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: open ? 'rgba(212,175,55,0.7)' : 'rgba(255,255,255,0.25)' }}>{pillar.tag}</p>
            <h3 className="text-base md:text-lg font-bold" style={{ color: open ? 'white' : 'rgba(255,255,255,0.75)' }}>{pillar.title}</h3>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: open ? '#D4AF37' : 'rgba(255,255,255,0.25)' }} />
        </motion.div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-6 space-y-5" style={{ borderTop: '1px solid rgba(212,175,55,0.12)' }}>
              <div className="pt-5">
                <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'rgba(212,175,55,0.55)' }}>
                  {es ? '¿Qué buscamos descubrir?' : 'What we seek to discover'}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{pillar.discover}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {es ? 'La base científica' : 'The scientific basis'}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{pillar.science}</p>
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#D4AF37' }}>
                  ⚡ {es ? 'Por qué importa ahora' : 'Why it matters now'}
                </p>
                <p className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{pillar.urgency}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SciencePage = () => {
  const { lang } = useLanguage();
  const es = lang === 'es';
  const pillars = es ? pillarsES : pillarsEN;

  return (
    <>
      <Helmet>
        <title>{es ? 'La Ciencia del Propósito — AKSHA LIFE' : 'The Science of Purpose — AKSHA LIFE'}</title>
        <meta name="description" content={es
          ? 'La IA avanza más rápido de lo que percibes. Descubrir tus talentos únicos ya no es opcional — es urgente.'
          : 'AI is moving faster than you perceive. Discovering your unique talents is no longer optional — it is urgent.'} />
      </Helmet>

      <div className="min-h-screen bg-background">

        {/* ── HERO ── */}
        <section className="pt-28 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.p {...fadeUp(0)} className="text-xs uppercase tracking-[0.45em] font-semibold mb-6" style={{ color: 'rgba(212,175,55,0.65)' }}>
              {es ? 'La Ciencia del Propósito' : 'The Science of Purpose'}
            </motion.p>
            <motion.h1 {...fadeUp(0.1)}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight text-white"
              style={{ letterSpacing: '-0.02em' }}>
              {es
                ? <>La IA avanza más rápido<br />de lo que <span className="text-primary">percibes.</span></>
                : <>AI is moving faster<br />than you <span className="text-primary">realize.</span></>}
            </motion.h1>
            <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {es
                ? 'Mientras la mayoría piensa "a mí no me va a afectar todavía" — ya está pasando. Las personas que prosperarán en este nuevo entorno no son las que más herramientas conocen. Son las que mejor se conocen a sí mismas.'
                : 'While most people think "it won\'t affect me yet" — it already is. The people who will thrive in this new environment are not the ones who know the most tools. They are the ones who know themselves best.'}
            </motion.p>
            <motion.p {...fadeUp(0.3)} className="text-base font-semibold" style={{ color: '#D4AF37' }}>
              {es ? 'Eso es exactamente lo que AKSHA está construido para hacer.' : 'That is exactly what AKSHA is built to do.'}
            </motion.p>
          </div>
        </section>

        {/* ── 3 PILLARS SUMMARY ── */}
        <section className="py-16 px-4 border-t border-b" style={{ borderColor: 'rgba(212,175,55,0.1)', backgroundColor: 'rgba(7,20,47,0.5)' }}>
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {(es ? [
                { icon: BookOpen, label: 'El contexto', text: 'Décadas de investigación humana han documentado los patrones que nos hacen únicos. El conocimiento existe — estaba fragmentado.' },
                { icon: Zap, label: 'Lo que cambia', text: 'La IA conecta ese conocimiento en segundos. Lo que antes requería años de estudio especializado, AKSHA lo sintetiza para ti.' },
                { icon: Compass, label: 'La urgencia', text: 'Cada día que pasa sin conocerte profundamente es un día navegando sin mapa en el entorno más cambiante de la historia.' },
              ] : [
                { icon: BookOpen, label: 'The context', text: 'Decades of human research have documented the patterns that make us unique. The knowledge exists — it was fragmented.' },
                { icon: Zap, label: 'What changes', text: 'AI connects that knowledge in seconds. What used to require years of specialized study, AKSHA synthesizes for you.' },
                { icon: Compass, label: 'The urgency', text: 'Every day that passes without knowing yourself deeply is a day navigating without a map in the most changing environment in history.' },
              ]).map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} {...fadeUp(i * 0.12)} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                      <Icon className="w-5 h-5" style={{ color: '#D4AF37' }} />
                    </div>
                    <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#D4AF37' }}>{item.label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── AI SYNTHESIS VISUAL ── */}
        <section className="py-28 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div {...fadeUp(0)} className="text-center mb-20">
              <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-5" style={{ color: 'rgba(212,175,55,0.65)' }}>
                {es ? 'El poder de la síntesis' : 'The power of synthesis'}
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ letterSpacing: '-0.02em' }}>
                {es
                  ? <>Lo que antes tomaba <span className="text-primary">semanas,</span><br />ahora sucede en <span className="text-primary">segundos.</span></>
                  : <>What used to take <span className="text-primary">weeks,</span><br />now happens in <span className="text-primary">seconds.</span></>}
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {es
                  ? 'Un especialista humano necesitaría dominar cinco disciplinas, leer miles de estudios y pasar meses integrando ese conocimiento. La IA lo hace en el momento en que ingresas tu fecha de nacimiento.'
                  : 'A human specialist would need to master five disciplines, read thousands of studies, and spend months integrating that knowledge. AI does it the moment you enter your birth date.'}
              </p>
            </motion.div>

            {/* Radial diagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative flex items-center justify-center"
              style={{ height: '520px' }}
            >
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.15"/>
                  </linearGradient>
                  <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.15"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                {[52, 130, 208, 286, 364].map((y, i) => (
                  <motion.line key={i} x1="210" y1={y} x2="400" y2="260"
                    stroke="url(#lineGrad1)" strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    filter="url(#glow)" />
                ))}
                {[80, 170, 260, 350, 440].map((y, i) => (
                  <motion.line key={i} x1="400" y1="260" x2="590" y2={y}
                    stroke="url(#lineGrad2)" strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }}
                    filter="url(#glow)" />
                ))}
                <motion.circle cx="400" cy="260" r="55" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="1" strokeDasharray="4 6"
                  animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
                <motion.circle cx="400" cy="260" r="75" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="1" strokeDasharray="2 8"
                  animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
              </svg>

              <div className="absolute left-0 flex flex-col gap-3" style={{ width: '200px' }}>
                {(es ? [
                  { label: 'Psicología Junguiana', sub: '100 años' },
                  { label: 'Big Five', sub: '50+ estudios' },
                  { label: 'Cronobiología', sub: 'Ciclos vitales' },
                  { label: 'Arquetipos', sub: 'Patrones universales' },
                  { label: 'Psic. del Desarrollo', sub: 'Trayectorias' },
                ] : [
                  { label: 'Jungian Psychology', sub: '100 years' },
                  { label: 'Big Five', sub: '50+ studies' },
                  { label: 'Chronobiology', sub: 'Life cycles' },
                  { label: 'Archetypes', sub: 'Universal patterns' },
                  { label: 'Dev. Psychology', sub: 'Trajectories' },
                ]).map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                    className="rounded-xl px-3 py-2.5 text-right"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-semibold text-white leading-tight">{item.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="absolute flex flex-col items-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <motion.div
                  animate={{ boxShadow: ['0 0 30px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.1)', '0 0 50px rgba(212,175,55,0.6), 0 0 100px rgba(212,175,55,0.2)', '0 0 30px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.1)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #8B6914 100%)' }}>
                  <Zap className="w-8 h-8 text-black" />
                </motion.div>
                <motion.p animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }}
                  className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#D4AF37' }}>
                  AKSHA AI
                </motion.p>
              </div>

              <div className="absolute right-0 flex flex-col gap-3" style={{ width: '185px' }}>
                {(es ? [
                  'Quién eres en el núcleo',
                  'Tus fortalezas reales',
                  'Tu don específico',
                  'Tu fase de ciclo vital',
                  'Tu dirección de propósito',
                ] : [
                  'Who you are at the core',
                  'Your real strengths',
                  'Your specific gift',
                  'Your life cycle phase',
                  'Your purpose direction',
                ]).map((line, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.04))', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#D4AF37' }} />
                    <p className="text-xs text-white/80 leading-tight">{line}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.p {...fadeUp(0.3)} className="text-center text-sm mt-8 font-medium" style={{ color: 'rgba(212,175,55,0.6)' }}>
              ⚡ {es ? 'Generado en segundos. Lo que antes tomaba semanas.' : 'Generated in seconds. What used to take weeks.'}
            </motion.p>
          </div>
        </section>

        {/* ── INTERACTIVE PILLARS ── */}
        <section className="py-20 px-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
          <div className="max-w-2xl mx-auto">
            <motion.div {...fadeUp(0)} className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: 'rgba(212,175,55,0.65)' }}>
                {es ? 'Los cinco pilares' : 'The five pillars'}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
                {es ? 'Lo que AKSHA integra para ti' : 'What AKSHA integrates for you'}
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {es ? 'Toca cada pilar para descubrir qué revela sobre ti.' : 'Tap each pillar to discover what it reveals about you.'}
              </p>
            </motion.div>

            <div className="space-y-3">
              {pillars.map((pillar, i) => (
                <PillarCard key={i} pillar={pillar} index={i} es={es} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CLOSING CTA ── */}
        <section className="py-28 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />
          <div className="relative z-10 max-w-xl mx-auto">
            <motion.p {...fadeUp(0)} className="text-3xl md:text-4xl font-bold text-white mb-5 leading-snug" style={{ letterSpacing: '-0.02em' }}>
              {es
                ? <>Ya tienes suficiente contexto.<br />La pregunta es si quieres<br /><span className="text-primary">saberlo sobre ti.</span></>
                : <>You have enough context now.<br />The question is whether you want<br /><span className="text-primary">to know it about yourself.</span></>}
            </motion.p>
            <motion.p {...fadeUp(0.1)} className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {es
                ? 'AKSHA integra los cinco pilares en un solo mapa personalizado. No hay otro igual al tuyo.'
                : 'AKSHA integrates the five pillars into one personalized map. There is no other like yours.'}
            </motion.p>
            <motion.div {...fadeUp(0.2)}>
              <Link to="/checkout"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #B8942A)', color: '#0a0f1e' }}>
                {es ? 'Obtener Mi Mapa de Propósito' : 'Get My Purpose Map'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.p {...fadeUp(0.3)} className="mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {es ? '$47 · Entrega en 24h · Un pago único' : '$47 · Delivered in 24h · One-time payment'}
            </motion.p>
          </div>
        </section>

      </div>
    </>
  );
};

export default SciencePage;
