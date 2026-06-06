import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Zap, Star, Gift, Leaf } from 'lucide-react';

const researchers = [
  {
    symbol: '◉',
    title: 'ANALYSIS OF BEHAVIOR',
    names: 'B.F. Skinner • John Watson',
    tags: 'Behaviorism • Conditioning',
  },
  {
    symbol: '∞',
    title: 'GENERATION OF ARCHETYPES',
    names: 'Carl Jung • James Hillman',
    tags: 'Archetypes • Collective Unconscious',
  },
  {
    symbol: '✦',
    title: 'NEURO-LINGUISTIC PROGRAMMING',
    names: 'Richard Bandler • John Grinder',
    tags: 'NLP • Language & Mind Patterns',
  },
  {
    symbol: '△',
    title: 'HUMAN MOTIVATION & NEEDS',
    names: 'Abraham Maslow • David McClelland',
    tags: 'Hierarchy of Needs • Motivation',
  },
  {
    symbol: '❋',
    title: 'MEANING & PURPOSE',
    names: 'Viktor Frankl',
    tags: 'Logotherapy • Meaning-Centered Living',
  },
  {
    symbol: '◎',
    title: 'FLOW & OPTIMAL EXPERIENCE',
    names: 'Mihaly Csikszentmihalyi',
    tags: 'Flow State • Peak Performance',
  },
  {
    symbol: '⁙',
    title: 'MULTIPLE INTELLIGENCES',
    names: 'Howard Gardner',
    tags: 'Multiple Ways of Knowing',
  },
  {
    symbol: '束',
    title: 'IKIGAI PHILOSOPHY',
    names: 'Japanese Wisdom',
    tags: 'Purpose • Balance • Lifelong Meaning',
  },
];

const dimensions = [
  {
    id: 'energy',
    label: 'ENERGY',
    Icon: Zap,
    position: 'top-left',
    definition: 'What naturally drives you.',
    expanded: 'The activities, environments and experiences that naturally activate your motivation and vitality.',
    examples: ['Curiosity', 'Movement', 'Creation', 'Learning', 'Connection'],
  },
  {
    id: 'strengths',
    label: 'STRENGTHS',
    Icon: Star,
    position: 'top-right',
    definition: 'What you consistently do well.',
    expanded: 'The abilities you consistently express and that produce reliable results.',
    examples: ['Analysis', 'Leadership', 'Empathy', 'Communication', 'Strategy'],
  },
  {
    id: 'gift',
    label: 'GIFT',
    Icon: Gift,
    position: 'bottom-left',
    definition: 'What comes naturally to you.',
    expanded: 'Your unique talents and cognitive patterns that come naturally and can be refined.',
    examples: ['Intuition', 'Imagination', 'Design', 'Teaching', 'Problem-Solving'],
  },
  {
    id: 'impact',
    label: 'IMPACT',
    Icon: Leaf,
    position: 'bottom-right',
    definition: 'Where your contribution matters.',
    expanded: 'The areas where your abilities create meaningful value for others and the world.',
    examples: ['Healing', 'Building', 'Inspiring', 'Innovating', 'Serving'],
  },
];

const GOLD = '#D4AF37';
const NAVY = '#07142F';

const DNAHelix = () => (
  <svg viewBox="0 0 80 320" className="w-[60px] md:w-[80px]" xmlns="http://www.w3.org/2000/svg">
    {/* Left spine */}
    <path d="M 20 10 C 20 50, 60 70, 60 110 C 60 150, 20 170, 20 210 C 20 250, 60 270, 60 310"
      stroke={GOLD} strokeWidth="1.5" fill="none" opacity="0.8" />
    {/* Right spine */}
    <path d="M 60 10 C 60 50, 20 70, 20 110 C 20 150, 60 170, 60 210 C 60 250, 20 270, 20 310"
      stroke={GOLD} strokeWidth="1.5" fill="none" opacity="0.8" />
    {/* Cross rungs */}
    {[0,1,2,3,4,5,6,7,8].map((i) => {
      const y = 20 + i * 36;
      const wave = Math.sin((i / 8) * Math.PI * 2);
      const x1 = 40 + wave * 20;
      const x2 = 40 - wave * 20;
      return (
        <g key={i}>
          <line x1={x1} y1={y} x2={x2} y2={y} stroke={GOLD} strokeWidth="1" opacity="0.4" />
          <circle cx={x1} cy={y} r="3" fill={GOLD} opacity="0.9" />
          <circle cx={x2} cy={y} r="3" fill={GOLD} opacity="0.9" />
        </g>
      );
    })}
    {/* Glow dots on crossings */}
    {[55, 110, 165, 220, 275].map((y, i) => (
      <circle key={i} cx={i % 2 === 0 ? 20 : 60} cy={y} r="4" fill={GOLD} opacity="1">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

const DimensionCircle = ({ dim, isActive, onClick }) => {
  const { Icon } = dim;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 w-[130px] h-[130px] md:w-[150px] md:h-[150px] ${
        isActive
          ? 'border-[#D4AF37] bg-[#D4AF37]/20 shadow-[0_0_30px_rgba(212,175,55,0.6)]'
          : 'border-[#D4AF37]/50 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/12 hover:border-[#D4AF37]/80'
      }`}
    >
      <Icon className="w-7 h-7 text-[#D4AF37] mb-1" strokeWidth={1.5} />
      <p className="text-[#D4AF37] font-bold text-xs tracking-[0.15em] uppercase">{dim.label}</p>
      <p className="text-white/55 text-[10px] text-center mt-1 px-2 leading-tight">{dim.definition}</p>
    </motion.button>
  );
};

const InfoPanel = ({ dim, onClose }) => {
  const { Icon } = dim;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 p-4 relative"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase">{dim.label}</p>
      </div>
      <p className="text-white/70 text-xs leading-relaxed mb-3">{dim.expanded}</p>
      <div>
        <p className="text-[#D4AF37]/60 text-[10px] uppercase tracking-widest mb-2">Examples:</p>
        <div className="flex flex-wrap gap-1">
          {dim.examples.map(ex => (
            <span key={ex} className="text-[10px] border border-[#D4AF37]/30 text-white/60 rounded px-2 py-0.5">{ex}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const HumanBlueprintDiagram = () => {
  const [activePanels, setActivePanels] = useState(new Set(['energy', 'strengths', 'gift', 'impact']));

  const togglePanel = (id) => {
    setActivePanels(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const topDims = dimensions.filter(d => d.position.startsWith('top'));
  const bottomDims = dimensions.filter(d => d.position.startsWith('bottom'));

  return (
    <section className="w-full bg-[#07142F] overflow-hidden">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start px-6 md:px-10 pt-10 pb-4 gap-4">
        <div>
          <p className="text-[#D4AF37] text-xs tracking-[0.25em] uppercase font-medium">Built on Decades of</p>
          <h2 className="text-[#D4AF37] text-2xl md:text-3xl font-black uppercase tracking-wide leading-tight">Human Understanding</h2>
          <p className="text-white/40 text-xs mt-1 italic">The research. The exploration. The legacy.</p>
        </div>
        <div className="text-right">
          <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">How It Works</p>
          <p className="text-white/40 text-xs">Click any dimension to learn more.</p>
        </div>
      </div>

      {/* ── MAIN 3-COLUMN ── */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-8 py-4 items-start">

        {/* LEFT — Researchers */}
        <div className="lg:w-1/4 space-y-4 flex-shrink-0">
          {researchers.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex gap-3 items-start"
            >
              <div className="w-9 h-9 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-sm flex-shrink-0 bg-[#D4AF37]/5">
                {r.symbol}
              </div>
              <div className="relative pl-2">
                {/* Connector line (desktop) */}
                <div className="hidden lg:block absolute right-[-2rem] top-1/2 w-8 border-t border-dashed border-[#D4AF37]/20" />
                <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-wide leading-tight">{r.title}</p>
                <p className="text-white/55 text-[11px]">{r.names}</p>
                <p className="text-white/30 text-[10px]">{r.tags}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CENTER — DNA + 4 circles */}
        <div className="lg:w-[42%] flex-shrink-0 flex flex-col items-center">
          {/* Top circles */}
          <div className="flex justify-center gap-4 md:gap-8">
            {topDims.map(dim => (
              <DimensionCircle
                key={dim.id}
                dim={dim}
                isActive={activePanels.has(dim.id)}
                onClick={() => togglePanel(dim.id)}
              />
            ))}
          </div>

          {/* DNA + center text */}
          <div className="flex flex-col items-center my-2">
            <DNAHelix />
            <div className="mt-[-10px] mb-[-10px] text-center">
              <p className="text-[#D4AF37] font-black text-lg md:text-xl uppercase tracking-[0.1em] leading-tight">Human</p>
              <p className="text-[#D4AF37] font-black text-lg md:text-xl uppercase tracking-[0.1em] leading-tight">Blueprint</p>
              <p className="text-white/50 text-[11px] mt-1 max-w-[160px] leading-relaxed">The map of your natural patterns. A structured view of your potential, patterns and contribution.</p>
            </div>
            <DNAHelix />
          </div>

          {/* Bottom circles */}
          <div className="flex justify-center gap-4 md:gap-8">
            {bottomDims.map(dim => (
              <DimensionCircle
                key={dim.id}
                dim={dim}
                isActive={activePanels.has(dim.id)}
                onClick={() => togglePanel(dim.id)}
              />
            ))}
          </div>

          {/* YOU */}
          <div className="text-center mt-4">
            <p className="text-[#D4AF37] font-black text-2xl tracking-widest">YOU</p>
            <p className="text-white/40 text-xs">Your Story. Your Patterns. Your Potential.</p>
          </div>
        </div>

        {/* RIGHT — Info panels */}
        <div className="lg:w-1/4 flex-shrink-0 flex flex-col gap-3">
          <AnimatePresence>
            {dimensions.map(dim =>
              activePanels.has(dim.id) ? (
                <InfoPanel key={dim.id} dim={dim} onClose={() => togglePanel(dim.id)} />
              ) : null
            )}
          </AnimatePresence>
          {activePanels.size === 0 && (
            <p className="text-white/30 text-xs text-center mt-8 italic">Click any dimension to see details</p>
          )}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="mt-6 border-t border-[#D4AF37]/15 bg-[#051020] px-6 md:px-10 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[#D4AF37] text-xl">✦</span>
            <div>
              <p className="text-white/60 text-xs">Decades of research. One timeless question.</p>
              <p className="text-[#D4AF37] text-xs font-bold">Your discovery starts today.</p>
            </div>
          </div>

          <Link
            to="/discover"
            className="flex items-center justify-center px-8 py-3 bg-[#D4AF37] text-[#07142F] font-bold text-sm rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.55)] hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
          >
            START YOUR JOURNEY →
          </Link>

          <div className="text-center md:text-right">
            <p className="text-white/60 text-xs">Discover Your Purpose.</p>
            <p className="text-[#D4AF37] text-xs font-semibold">Design Your Best Life.</p>
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="px-6 md:px-10 py-4 text-center border-t border-[#D4AF37]/10">
        <p className="text-white/25 text-[11px] leading-relaxed max-w-3xl mx-auto">
          AKSHA does not attempt to replace these traditions. • It builds upon them, organizing multiple human frameworks into a modern Human Blueprint for the age of AI.
        </p>
      </div>

    </section>
  );
};

export default HumanBlueprintDiagram;
