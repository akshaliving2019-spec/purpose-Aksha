import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Zap, Star, Gift, Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const dimensionsES = [
  {
    id: 'energy', label: 'ENERGÍA', Icon: Zap,
    panelTop: '7%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'Lo que te mueve de forma natural.',
    expanded: 'La ENERGÍA es el combustible detrás de todo lo que haces. No se trata de cafeína ni de fuerza de voluntad — se trata de las actividades, entornos y experiencias que activan tu motivación desde adentro.',
    deep: 'Cuando operas dentro de tu energía natural, el tiempo desaparece. Las tareas se sienten más ligeras. Los resultados se multiplican. AKSHA LIFE mapea tus patrones de energía específicos para que dejes de forzar y empieces a fluir.',
    examples: ['Curiosidad', 'Movimiento', 'Creación', 'Aprendizaje', 'Conexión'],
    question: '¿Qué te activa sin necesitar motivación externa?',
    dimensionLabel: 'Dimensión',
    reflectLabel: 'Reflexiona sobre esto:',
    examplesLabel: 'Ejemplos:',
    cta: 'Descubrir Mi ENERGÍA',
  },
  {
    id: 'strengths', label: 'FORTALEZAS', Icon: Star,
    panelTop: '30%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'Lo que haces bien de forma consistente.',
    expanded: 'Las FORTALEZAS son las habilidades que expresas repetidamente y que producen resultados confiables — a menudo cosas que das por sentadas porque se sienten naturales.',
    deep: 'El problema es que la mayoría de las personas no reconocen sus propias fortalezas. Asumen que todos pueden hacer lo que ellas hacen. AKSHA LIFE revela lo que realmente te distingue — tu ventaja repetible.',
    examples: ['Análisis', 'Liderazgo', 'Empatía', 'Comunicación', 'Estrategia'],
    question: '¿Para qué vienen a buscarte constantemente los demás?',
    dimensionLabel: 'Dimensión',
    reflectLabel: 'Reflexiona sobre esto:',
    examplesLabel: 'Ejemplos:',
    cta: 'Descubrir Mis FORTALEZAS',
  },
  {
    id: 'gift', label: 'DON', Icon: Gift,
    panelTop: '52%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'Lo que te sale de forma innata.',
    expanded: 'Tu DON es tu inteligencia natural más profunda — el patrón cognitivo que procesa la realidad de manera diferente. No se aprende, es inherente. Y cuando se desarrolla, se convierte en tu mayor contribución.',
    deep: 'Los dones suelen ser invisibles para quien los tiene. Se sienten "demasiado fáciles" para ser valiosos. Pero tu don es exactamente lo que el mundo más necesita — en su forma bruta o refinada.',
    examples: ['Intuición', 'Imaginación', 'Diseño', 'Enseñanza', 'Resolución de problemas'],
    question: '¿Qué te sale tan natural que casi te da pena cobrar por ello?',
    dimensionLabel: 'Dimensión',
    reflectLabel: 'Reflexiona sobre esto:',
    examplesLabel: 'Ejemplos:',
    cta: 'Descubrir Mi DON',
  },
  {
    id: 'impact', label: 'IMPACTO', Icon: Leaf,
    panelTop: '74%', panelLeft: '67%', panelWidth: '28%', panelHeight: '18%',
    color: '#D4AF37',
    definition: 'Dónde tu contribución importa.',
    expanded: 'El IMPACTO es la intersección donde tus habilidades se encuentran con las necesidades del mundo. Es donde lo que haces crea un cambio significativo — para personas, comunidades o sistemas.',
    deep: 'Sin impacto, el propósito se siente vacío. AKSHA LIFE mapea las áreas específicas donde tu combinación única de Energía, Fortalezas y Don crea el mayor valor — para que inviertas tu vida donde realmente importa.',
    examples: ['Sanar', 'Construir', 'Inspirar', 'Innovar', 'Servir'],
    question: '¿Dónde crea tu trabajo un efecto más allá de ti mismo?',
    dimensionLabel: 'Dimensión',
    reflectLabel: 'Reflexiona sobre esto:',
    examplesLabel: 'Ejemplos:',
    cta: 'Descubrir Mi IMPACTO',
  },
];

const dimensionsEN = [
  {
    id: 'energy', label: 'ENERGY', Icon: Zap,
    panelTop: '7%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'What moves you naturally.',
    expanded: 'ENERGY is the fuel behind everything you do. It\'s not about caffeine or willpower — it\'s about the activities, environments, and experiences that activate your motivation from within.',
    deep: 'When you operate within your natural energy, time disappears. Tasks feel lighter. Results multiply. AKSHA LIFE maps your specific energy patterns so you stop forcing and start flowing.',
    examples: ['Curiosity', 'Movement', 'Creation', 'Learning', 'Connection'],
    question: 'What activates you without needing external motivation?',
    dimensionLabel: 'Dimension',
    reflectLabel: 'Reflect on this:',
    examplesLabel: 'Examples:',
    cta: 'Discover My ENERGY',
  },
  {
    id: 'strengths', label: 'STRENGTHS', Icon: Star,
    panelTop: '30%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'What you do consistently well.',
    expanded: 'STRENGTHS are the skills you repeatedly express that produce reliable results — often things you take for granted because they feel natural.',
    deep: 'The problem is most people don\'t recognize their own strengths. They assume everyone can do what they do. AKSHA LIFE reveals what truly sets you apart — your repeatable advantage.',
    examples: ['Analysis', 'Leadership', 'Empathy', 'Communication', 'Strategy'],
    question: 'What do people constantly come to you for?',
    dimensionLabel: 'Dimension',
    reflectLabel: 'Reflect on this:',
    examplesLabel: 'Examples:',
    cta: 'Discover My STRENGTHS',
  },
  {
    id: 'gift', label: 'GIFT', Icon: Gift,
    panelTop: '52%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'What comes to you innately.',
    expanded: 'Your GIFT is your deepest natural intelligence — the cognitive pattern that processes reality differently. It\'s not learned, it\'s inherent. And when developed, it becomes your greatest contribution.',
    deep: 'Gifts are often invisible to the person who has them. They feel "too easy" to be valuable. But your gift is exactly what the world needs most — in its raw or refined form.',
    examples: ['Intuition', 'Imagination', 'Design', 'Teaching', 'Problem-solving'],
    question: 'What comes so naturally you\'d almost feel guilty charging for it?',
    dimensionLabel: 'Dimension',
    reflectLabel: 'Reflect on this:',
    examplesLabel: 'Examples:',
    cta: 'Discover My GIFT',
  },
  {
    id: 'impact', label: 'IMPACT', Icon: Leaf,
    panelTop: '74%', panelLeft: '67%', panelWidth: '28%', panelHeight: '18%',
    color: '#D4AF37',
    definition: 'Where your contribution matters.',
    expanded: 'IMPACT is the intersection where your abilities meet the world\'s needs. It\'s where what you do creates meaningful change — for people, communities, or systems.',
    deep: 'Without impact, purpose feels empty. AKSHA LIFE maps the specific areas where your unique combination of Energy, Strengths, and Gift creates the most value — so you invest your life where it truly matters.',
    examples: ['Healing', 'Building', 'Inspiring', 'Innovating', 'Serving'],
    question: 'Where does your work create an effect beyond yourself?',
    dimensionLabel: 'Dimension',
    reflectLabel: 'Reflect on this:',
    examplesLabel: 'Examples:',
    cta: 'Discover My IMPACT',
  },
];

const Popup = ({ dim, onClose, lang }) => {
  const { Icon } = dim;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(7,20,47,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-lg rounded-2xl p-7 shadow-[0_0_60px_rgba(212,175,55,0.25)]"
        style={{ backgroundColor: '#07142F', border: '1.5px solid rgba(212,175,55,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(212,175,55,0.15)', border: '1.5px solid rgba(212,175,55,0.5)' }}>
            <Icon className="w-6 h-6" style={{ color: '#D4AF37' }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] text-white/40 uppercase mb-0.5">{dim.dimensionLabel}</p>
            <h3 className="text-xl font-bold tracking-[0.15em] uppercase" style={{ color: '#D4AF37' }}>
              {dim.label}
            </h3>
          </div>
        </div>

        <p className="text-white font-semibold text-base mb-3">{dim.definition}</p>
        <p className="text-white/65 text-sm leading-relaxed mb-4">{dim.expanded}</p>

        <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-white/80 text-sm leading-relaxed italic">{dim.deep}</p>
        </div>

        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.6)' }}>{dim.reflectLabel}</p>
        <p className="text-white/70 text-sm italic mb-5">"{dim.question}"</p>

        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.6)' }}>{dim.examplesLabel}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {dim.examples.map(ex => (
            <span key={ex} className="text-xs rounded-full px-3 py-1 text-white/60"
              style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
              {ex}
            </span>
          ))}
        </div>

        <Link
          to="/discover"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          style={{ backgroundColor: '#D4AF37', color: '#07142F' }}
        >
          {dim.cta} →
        </Link>
      </motion.div>
    </motion.div>
  );
};

const HumanBlueprintDiagram = () => {
  const [activePopup, setActivePopup] = useState(null);
  const { lang } = useLanguage();
  const dimensions = lang === 'es' ? dimensionsES : dimensionsEN;
  const activeDim = dimensions.find(d => d.id === activePopup);
  const hintText = lang === 'es' ? '👆 Toca cada sección para explorar tu perfil' : '👆 Tap each section to explore your profile';

  return (
    <section className="w-full bg-[#07142F] overflow-hidden">
      <div className="relative w-full flex justify-center px-4 md:px-8 py-4">
        <div className="relative w-full max-w-4xl mx-auto">
          <img
            src="/human-blueprint.jpg"
            alt="AKSHA LIFE — Mapa de Propósito Humano"
            className="w-full h-auto block rounded-xl"
          />
          <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ backgroundColor: 'rgba(7,20,47,0.18)' }} />

          {dimensions.map((dim, i) => (
            <motion.button
              key={dim.id}
              onClick={() => setActivePopup(dim.id)}
              className="absolute rounded-xl cursor-pointer"
              style={{
                top: dim.panelTop,
                left: dim.panelLeft,
                width: dim.panelWidth,
                height: dim.panelHeight,
              }}
              whileHover={{ backgroundColor: 'rgba(212,175,55,0.15)', scale: 1.02 }}
              title={`${lang === 'es' ? 'Ver más sobre' : 'Learn more about'} ${dim.label}`}
            >
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ border: '2px solid rgba(212,175,55,0.7)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-1 right-1 text-[10px] pointer-events-none"
                style={{ color: 'rgba(212,175,55,0.9)' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }}
              >
                👆
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.p
        className="text-center text-xs tracking-widest uppercase pb-6"
        style={{ color: 'rgba(212,175,55,0.5)' }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {hintText}
      </motion.p>

      <AnimatePresence>
        {activeDim && (
          <Popup dim={activeDim} onClose={() => setActivePopup(null)} lang={lang} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default HumanBlueprintDiagram;
