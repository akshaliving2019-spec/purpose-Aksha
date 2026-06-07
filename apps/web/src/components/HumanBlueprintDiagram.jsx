import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Zap, Star, Gift, Leaf } from 'lucide-react';

const dimensions = [
  {
    id: 'energy', label: 'ENERGY', Icon: Zap,
    // Right panel overlays
    panelTop: '7%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'What naturally drives you.',
    expanded: 'ENERGY is the fuel behind everything you do. It\'s not about caffeine or willpower — it\'s about the activities, environments and experiences that naturally activate your motivation and vitality from the inside out.',
    deep: 'When you operate inside your natural energy, time disappears. Tasks feel lighter. Results multiply. AKSHA maps your specific energy patterns so you stop forcing and start flowing.',
    examples: ['Curiosity', 'Movement', 'Creation', 'Learning', 'Connection'],
    question: 'What lights you up without needing external motivation?',
  },
  {
    id: 'strengths', label: 'STRENGTHS', Icon: Star,
    panelTop: '30%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'What you consistently do well.',
    expanded: 'STRENGTHS are the abilities you express repeatedly and that produce reliable results — often things you take for granted because they feel natural to you.',
    deep: 'The problem is most people don\'t recognize their own strengths. They assume everyone can do what they do. AKSHA reveals what truly sets you apart — your repeatable advantage.',
    examples: ['Analysis', 'Leadership', 'Empathy', 'Communication', 'Strategy'],
    question: 'What do others consistently come to you for?',
  },
  {
    id: 'gift', label: 'GIFT', Icon: Gift,
    panelTop: '52%', panelLeft: '67%', panelWidth: '28%', panelHeight: '21%',
    color: '#D4AF37',
    definition: 'What comes naturally to you.',
    expanded: 'Your GIFT is your deepest natural intelligence — the cognitive pattern that processes reality differently. It\'s not learned, it\'s inherent. And when developed, it becomes your greatest contribution.',
    deep: 'Gifts are often invisible to their owner. They feel "too easy" to be valuable. But your gift is exactly what the world needs most — in its raw or refined form.',
    examples: ['Intuition', 'Imagination', 'Design', 'Teaching', 'Problem-Solving'],
    question: 'What comes so naturally you almost feel guilty charging for it?',
  },
  {
    id: 'impact', label: 'IMPACT', Icon: Leaf,
    panelTop: '74%', panelLeft: '67%', panelWidth: '28%', panelHeight: '18%',
    color: '#D4AF37',
    definition: 'Where your contribution matters.',
    expanded: 'IMPACT is the intersection where your abilities meet the world\'s needs. It\'s where what you do creates meaningful change — for people, communities, or systems.',
    deep: 'Without impact, purpose feels hollow. AKSHA maps the specific areas where your unique combination of Energy, Strengths and Gift creates the most value — so you invest your life where it truly matters.',
    examples: ['Healing', 'Building', 'Inspiring', 'Innovating', 'Serving'],
    question: 'Where does your work create a ripple beyond yourself?',
  },
];

// Popup modal with deep content
const Popup = ({ dim, onClose }) => {
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(212,175,55,0.15)', border: '1.5px solid rgba(212,175,55,0.5)' }}>
            <Icon className="w-6 h-6" style={{ color: '#D4AF37' }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] text-white/40 uppercase mb-0.5">Dimension</p>
            <h3 className="text-xl font-bold tracking-[0.15em] uppercase" style={{ color: '#D4AF37' }}>
              {dim.label}
            </h3>
          </div>
        </div>

        {/* Definition */}
        <p className="text-white font-semibold text-base mb-3">{dim.definition}</p>

        {/* Expanded */}
        <p className="text-white/65 text-sm leading-relaxed mb-4">{dim.expanded}</p>

        {/* Deep insight */}
        <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-white/80 text-sm leading-relaxed italic">{dim.deep}</p>
        </div>

        {/* Question */}
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.6)' }}>Reflect on this:</p>
        <p className="text-white/70 text-sm italic mb-5">"{dim.question}"</p>

        {/* Examples */}
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.6)' }}>Examples:</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {dim.examples.map(ex => (
            <span key={ex} className="text-xs rounded-full px-3 py-1 text-white/60"
              style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
              {ex}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/discover"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          style={{ backgroundColor: '#D4AF37', color: '#07142F' }}
        >
          Discover My {dim.label} →
        </Link>
      </motion.div>
    </motion.div>
  );
};

const HumanBlueprintDiagram = () => {
  const [activePopup, setActivePopup] = useState(null);
  const activeDim = dimensions.find(d => d.id === activePopup);

  return (
    <section className="w-full bg-[#07142F] overflow-hidden">

      {/* IMAGE + CLICKABLE OVERLAYS */}
      <div className="relative w-full flex justify-center px-4 md:px-8 py-4">
        <div className="relative w-full max-w-[88%]">
          <img
            src="/human-blueprint.jpg"
            alt="AKSHA Human Blueprint — Built on Decades of Human Understanding"
            className="w-full h-auto block rounded-xl"
          />

          {/* Navy overlay to match website background tone */}
          <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ backgroundColor: 'rgba(7,20,47,0.18)' }} />

          {/* Clickable overlays over RIGHT SIDE panels */}
          {dimensions.map(dim => (
            <motion.button
              key={dim.id}
              onClick={() => setActivePopup(dim.id)}
              whileHover={{ backgroundColor: 'rgba(212,175,55,0.12)' }}
              className="absolute rounded-xl cursor-pointer transition-all duration-300"
              style={{
                top: dim.panelTop,
                left: dim.panelLeft,
                width: dim.panelWidth,
                height: dim.panelHeight,
                border: '2px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.border = '2px solid rgba(212,175,55,0.8)'}
              onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}
              title={`Learn more about ${dim.label}`}
            />
          ))}
        </div>
      </div>

      {/* POPUP */}
      <AnimatePresence>
        {activeDim && (
          <Popup dim={activeDim} onClose={() => setActivePopup(null)} />
        )}
      </AnimatePresence>

    </section>
  );
};

export default HumanBlueprintDiagram;
