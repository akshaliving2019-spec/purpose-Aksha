import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Zap, Star, Gift, Leaf } from 'lucide-react';

const dimensions = [
  {
    id: 'energy', label: 'ENERGY', Icon: Zap,
    // Position over the ENERGY circle in the SVG (top-left circle)
    // SVG is 2000x1334, we express as percentages
    top: '13%', left: '29%', width: '14%', height: '21%',
    definition: 'What naturally drives you.',
    expanded: 'The activities, environments and experiences that naturally activate your motivation and vitality.',
    examples: ['Curiosity', 'Movement', 'Creation', 'Learning', 'Connection'],
  },
  {
    id: 'strengths', label: 'STRENGTHS', Icon: Star,
    top: '13%', left: '55%', width: '14%', height: '21%',
    definition: 'What you consistently do well.',
    expanded: 'The abilities you consistently express and that produce reliable results.',
    examples: ['Analysis', 'Leadership', 'Empathy', 'Communication', 'Strategy'],
  },
  {
    id: 'gift', label: 'GIFT', Icon: Gift,
    top: '55%', left: '29%', width: '14%', height: '21%',
    definition: 'What comes naturally to you.',
    expanded: 'Your unique talents and cognitive patterns that come naturally and can be refined.',
    examples: ['Intuition', 'Imagination', 'Design', 'Teaching', 'Problem-Solving'],
  },
  {
    id: 'impact', label: 'IMPACT', Icon: Leaf,
    top: '55%', left: '55%', width: '14%', height: '21%',
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
      transition={{ duration: 0.22 }}
      className="rounded-xl border border-[#D4AF37]/35 bg-[#07142F]/95 backdrop-blur-sm p-4 relative"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0 bg-[#D4AF37]/10">
          <Icon className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        <p className="text-[#D4AF37] font-bold text-xs tracking-[0.2em] uppercase">{dim.label}</p>
      </div>
      <p className="text-white/70 text-[11px] leading-relaxed mb-2">{dim.expanded}</p>
      <p className="text-[#D4AF37]/60 text-[9px] uppercase tracking-widest mb-1.5">Examples:</p>
      <div className="flex flex-wrap gap-1">
        {dim.examples.map(ex => (
          <span key={ex} className="text-[9px] border border-[#D4AF37]/25 text-white/50 rounded px-1.5 py-0.5">{ex}</span>
        ))}
      </div>
      <Link to="/discover" className="mt-3 inline-flex items-center gap-1 text-[#D4AF37] text-[10px] font-semibold hover:underline">
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

      {/* ── DIAGRAM with logo overlay + clickable areas ── */}
      <div className="relative w-full">

        {/* Blueprint SVG image */}
        <img
          src="/human-blueprint.svg"
          alt="AKSHA Human Blueprint Diagram"
          className="w-full h-auto block"
          style={{ maxWidth: '100%' }}
        />

        {/* AKSHA Logo overlay — covers the star in top-left */}
        <div className="absolute top-[1%] left-[1%] w-[6%]">
          <img
            src="https://horizons-cdn.hostinger.com/3b1220b8-90b4-4363-97a3-2c8f1d706937/59d9dbf7e952f6b63f78ee82c7a83d1e.png"
            alt="AKSHA Logo"
            className="w-full h-auto"
          />
        </div>

        {/* Clickable invisible areas over each dimension circle */}
        {dimensions.map(dim => (
          <motion.button
            key={dim.id}
            onClick={() => toggle(dim.id)}
            whileHover={{ backgroundColor: 'rgba(212,175,55,0.08)' }}
            className={`absolute rounded-full border-2 transition-all duration-300 cursor-pointer ${
              activePanel === dim.id
                ? 'border-[#D4AF37]/60 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                : 'border-transparent hover:border-[#D4AF37]/30'
            }`}
            style={{
              top: dim.top,
              left: dim.left,
              width: dim.width,
              height: dim.height,
            }}
            title={`Click to learn about ${dim.label}`}
          />
        ))}
      </div>

      {/* ── INFO PANEL ── */}
      <AnimatePresence>
        {activeDim && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 md:px-10 py-4 bg-[#07142F]"
          >
            <div className="max-w-2xl mx-auto">
              <InfoPanel dim={activeDim} onClose={() => setActivePanel(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-[#D4AF37]/15 bg-[#040e1f]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-6 md:px-10 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] flex-shrink-0">✦</div>
            <div>
              <p className="text-white/50 text-[11px]">Decades of research. One timeless question.</p>
              <p className="text-[#D4AF37] text-[11px] font-bold">Your discovery starts today.</p>
            </div>
          </div>
          <Link
            to="/discover"
            className="border-2 border-dashed border-[#D4AF37] text-[#D4AF37] font-bold text-sm px-8 py-3 rounded-lg
              hover:bg-[#D4AF37] hover:text-[#07142F] transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.45)]
              hover:scale-[1.02] whitespace-nowrap"
          >
            START YOUR JOURNEY →
          </Link>
          <div className="text-center md:text-right">
            <p className="text-white/50 text-[11px]">Discover Your Purpose.</p>
            <p className="text-[#D4AF37] text-[11px] font-semibold">Design Your Best Life.</p>
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="px-6 md:px-10 py-3 text-center bg-[#040e1f] border-t border-[#D4AF37]/8">
        <p className="text-white/22 text-[10px] max-w-3xl mx-auto">
          AKSHA does not attempt to replace these traditions. • It builds upon them, organizing multiple human frameworks into a modern Human Blueprint for the age of AI.
        </p>
      </div>

    </section>
  );
};

export default HumanBlueprintDiagram;
