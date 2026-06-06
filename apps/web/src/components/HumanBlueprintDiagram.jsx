import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Zap, Star, Gift, Leaf } from 'lucide-react';

const dimensions = [
  {
    id: 'energy', label: 'ENERGY', Icon: Zap,
    top: '14%', left: '30%', width: '13%', height: '22%',
    definition: 'What naturally drives you.',
    expanded: 'The activities, environments and experiences that naturally activate your motivation and vitality.',
    examples: ['Curiosity', 'Movement', 'Creation', 'Learning', 'Connection'],
  },
  {
    id: 'strengths', label: 'STRENGTHS', Icon: Star,
    top: '14%', left: '55%', width: '13%', height: '22%',
    definition: 'What you consistently do well.',
    expanded: 'The abilities you consistently express and that produce reliable results.',
    examples: ['Analysis', 'Leadership', 'Empathy', 'Communication', 'Strategy'],
  },
  {
    id: 'gift', label: 'GIFT', Icon: Gift,
    top: '54%', left: '30%', width: '13%', height: '22%',
    definition: 'What comes naturally to you.',
    expanded: 'Your unique talents and cognitive patterns that come naturally and can be refined.',
    examples: ['Intuition', 'Imagination', 'Design', 'Teaching', 'Problem-Solving'],
  },
  {
    id: 'impact', label: 'IMPACT', Icon: Leaf,
    top: '54%', left: '55%', width: '13%', height: '22%',
    definition: 'Where your contribution matters.',
    expanded: 'The areas where your abilities create meaningful value for others and the world.',
    examples: ['Healing', 'Building', 'Inspiring', 'Innovating', 'Serving'],
  },
];

const InfoPanel = ({ dim, onClose }) => {
  const { Icon } = dim;
  return (
    <motion.div
      key={dim.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-[#D4AF37]/40 bg-[#07142F]/95 backdrop-blur-sm p-5 relative shadow-[0_0_30px_rgba(212,175,55,0.15)]"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0 bg-[#D4AF37]/10">
          <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        <p className="text-[#D4AF37] font-bold text-sm tracking-[0.2em] uppercase">{dim.label}</p>
      </div>
      <p className="text-white/70 text-sm leading-relaxed mb-3">{dim.expanded}</p>
      <p className="text-[#D4AF37]/60 text-[10px] uppercase tracking-widest mb-2">Examples:</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {dim.examples.map(ex => (
          <span key={ex} className="text-[11px] border border-[#D4AF37]/25 text-white/55 rounded px-2 py-0.5">{ex}</span>
        ))}
      </div>
      <Link to="/discover" className="inline-flex items-center gap-1 text-[#D4AF37] text-xs font-semibold hover:underline">
        Discover your {dim.label} →
      </Link>
    </motion.div>
  );
};

const HumanBlueprintDiagram = () => {
  const [activePanel, setActivePanel] = useState(null);
  const toggle = (id) => setActivePanel(prev => prev === id ? null : id);
  const activeDim = dimensions.find(d => d.id === activePanel);

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

        {/* Clickable invisible circles over each dimension */}
        {dimensions.map(dim => (
          <motion.button
            key={dim.id}
            onClick={() => toggle(dim.id)}
            whileHover={{ backgroundColor: 'rgba(212,175,55,0.10)' }}
            className={`absolute rounded-full border-2 transition-all duration-300 cursor-pointer ${
              activePanel === dim.id
                ? 'border-[#D4AF37]/70 shadow-[0_0_25px_rgba(212,175,55,0.4)]'
                : 'border-transparent hover:border-[#D4AF37]/40'
            }`}
            style={{ top: dim.top, left: dim.left, width: dim.width, height: dim.height }}
            title={`Learn about ${dim.label}`}
          />
        ))}
      </div>
      </div>

      {/* INFO PANEL */}
      <AnimatePresence>
        {activeDim && (
          <div className="px-4 md:px-10 py-5 bg-[#07142F]">
            <div className="max-w-xl mx-auto">
              <InfoPanel dim={activeDim} onClose={() => setActivePanel(null)} />
            </div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default HumanBlueprintDiagram;
