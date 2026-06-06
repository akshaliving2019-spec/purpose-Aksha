import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Zap, Star, Gift, Leaf, MousePointer } from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────────── */
const researchers = [
  { symbol: '◉', title: 'ANALYSIS OF BEHAVIOR',        names: 'B.F. Skinner • John Watson',          tags: 'Behaviorism • Conditioning' },
  { symbol: '∞', title: 'GENERATION OF ARCHETYPES',    names: 'Carl Jung • James Hillman',            tags: 'Archetypes • Collective Unconscious' },
  { symbol: '✦', title: 'NEURO-LINGUISTIC PROGRAMMING',names: 'Richard Bandler • John Grinder',       tags: 'NLP • Language & Mind Patterns' },
  { symbol: '△', title: 'HUMAN MOTIVATION & NEEDS',    names: 'Abraham Maslow • David McClelland',    tags: 'Hierarchy of Needs • Motivation' },
  { symbol: '❋', title: 'MEANING & PURPOSE',           names: 'Viktor Frankl',                        tags: 'Logotherapy • Meaning-Centered Living' },
  { symbol: '◎', title: 'FLOW & OPTIMAL EXPERIENCE',   names: 'Mihaly Csikszentmihalyi',              tags: 'Flow State • Peak Performance' },
  { symbol: '⁙', title: 'MULTIPLE INTELLIGENCES',      names: 'Howard Gardner',                       tags: 'Multiple Ways of Knowing' },
  { symbol: '束', title: 'IKIGAI PHILOSOPHY',           names: 'Japanese Wisdom',                      tags: 'Purpose • Balance • Lifelong Meaning' },
];

const dimensions = [
  {
    id: 'energy', label: 'ENERGY', Icon: Zap, side: 'left', row: 'top',
    definition: 'What naturally drives you.',
    expanded: 'The activities, environments and experiences that naturally activate your motivation and vitality.',
    examples: ['Curiosity', 'Movement', 'Creation', 'Learning', 'Connection'],
  },
  {
    id: 'strengths', label: 'STRENGTHS', Icon: Star, side: 'right', row: 'top',
    definition: 'What you consistently do well.',
    expanded: 'The abilities you consistently express and that produce reliable results.',
    examples: ['Analysis', 'Leadership', 'Empathy', 'Communication', 'Strategy'],
  },
  {
    id: 'gift', label: 'GIFT', Icon: Gift, side: 'left', row: 'bottom',
    definition: 'What comes naturally to you.',
    expanded: 'Your unique talents and cognitive patterns that come naturally and can be refined.',
    examples: ['Intuition', 'Imagination', 'Design', 'Teaching', 'Problem-Solving'],
  },
  {
    id: 'impact', label: 'IMPACT', Icon: Leaf, side: 'right', row: 'bottom',
    definition: 'Where your contribution matters.',
    expanded: 'The areas where your abilities create meaningful value for others and the world.',
    examples: ['Healing', 'Building', 'Inspiring', 'Innovating', 'Serving'],
  },
];

/* ─── DNA SVG ───────────────────────────────────────────── */
const DNAHelix = ({ height = 240 }) => {
  const nodes = 7;
  return (
    <svg viewBox={`0 0 80 ${height}`} style={{ width: 56, height }} xmlns="http://www.w3.org/2000/svg">
      <path d={`M 20 10 C 20 ${height*0.22}, 60 ${height*0.3}, 60 ${height*0.5} C 60 ${height*0.7}, 20 ${height*0.78}, 20 ${height-10}`}
        stroke="#D4AF37" strokeWidth="1.5" fill="none" opacity="0.85" />
      <path d={`M 60 10 C 60 ${height*0.22}, 20 ${height*0.3}, 20 ${height*0.5} C 20 ${height*0.7}, 60 ${height*0.78}, 60 ${height-10}`}
        stroke="#D4AF37" strokeWidth="1.5" fill="none" opacity="0.85" />
      {Array.from({ length: nodes }).map((_, i) => {
        const y = 15 + (i / (nodes - 1)) * (height - 30);
        const wave = Math.sin((i / (nodes - 1)) * Math.PI * 2);
        const x1 = 40 + wave * 20;
        const x2 = 40 - wave * 20;
        return (
          <g key={i}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke="#D4AF37" strokeWidth="0.8" opacity="0.35" />
            <circle cx={x1} cy={y} r="3" fill="#D4AF37" opacity="0.9" />
            <circle cx={x2} cy={y} r="3" fill="#D4AF37" opacity="0.9" />
          </g>
        );
      })}
      {[height * 0.25, height * 0.5, height * 0.75].map((y, i) => (
        <circle key={i} cx={i % 2 === 0 ? 20 : 60} cy={y} r="4.5" fill="#D4AF37" opacity="0.95">
          <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
};

/* ─── DIMENSION CIRCLE ───────────────────────────────────── */
const DimCircle = ({ dim, isActive, onClick }) => {
  const { Icon } = dim;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className={`rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        w-[128px] h-[128px] sm:w-[144px] sm:h-[144px] lg:w-[155px] lg:h-[155px]
        ${isActive
          ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_0_28px_rgba(212,175,55,0.55)]'
          : 'border-[#D4AF37]/45 bg-[#D4AF37]/4 hover:border-[#D4AF37]/75 hover:bg-[#D4AF37]/10'
        }`}
    >
      <Icon className="w-6 h-6 text-[#D4AF37] mb-1" strokeWidth={1.5} />
      <p className="text-[#D4AF37] font-bold text-[11px] tracking-[0.18em] uppercase">{dim.label}</p>
      <p className="text-white/55 text-[9px] text-center mt-1 px-2 leading-tight">{dim.definition}</p>
    </motion.button>
  );
};

/* ─── INFO PANEL ────────────────────────────────────────── */
const InfoPanel = ({ dim, onClose }) => {
  const { Icon } = dim;
  return (
    <motion.div
      key={dim.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="rounded-xl border border-[#D4AF37]/35 bg-[#0a1a35] p-4 relative"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-white/25 hover:text-white/60 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0 bg-[#D4AF37]/10">
          <Icon className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        <p className="text-[#D4AF37] font-bold text-xs tracking-[0.2em] uppercase">{dim.label}</p>
      </div>
      <p className="text-white/65 text-[11px] leading-relaxed mb-2">{dim.expanded}</p>
      <p className="text-[#D4AF37]/60 text-[9px] uppercase tracking-widest mb-1.5">Examples:</p>
      <div className="flex flex-wrap gap-1">
        {dim.examples.map(ex => (
          <span key={ex} className="text-[9px] border border-[#D4AF37]/25 text-white/50 rounded px-1.5 py-0.5">{ex}</span>
        ))}
      </div>
    </motion.div>
  );
};

/* ─── MAIN COMPONENT ────────────────────────────────────── */
const HumanBlueprintDiagram = () => {
  const [open, setOpen] = useState(new Set(['energy', 'strengths', 'gift', 'impact']));
  const toggle = id => setOpen(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const leftDims  = dimensions.filter(d => d.side === 'left');
  const rightDims = dimensions.filter(d => d.side === 'right');

  return (
    <section className="w-full bg-[#07142F] overflow-hidden font-sans">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start px-5 md:px-10 pt-8 pb-3 gap-2">
        <div>
          <p className="text-[#D4AF37] text-[10px] tracking-[0.28em] uppercase font-semibold">Built on Decades of</p>
          <h2 className="text-[#D4AF37] text-2xl md:text-[28px] font-black uppercase tracking-wide leading-tight">Human Understanding</h2>
          <p className="text-white/38 text-[11px] mt-0.5 italic">The research. The exploration. The legacy.</p>
        </div>
        <div className="md:text-right mt-2 md:mt-0">
          <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.2em]">How It Works</p>
          <p className="text-white/40 text-[10px]">Click any dimension to learn more.</p>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex flex-col lg:flex-row gap-4 px-3 md:px-8 pb-4 items-start">

        {/* LEFT — Researchers */}
        <div className="lg:w-[22%] flex-shrink-0 space-y-3 pt-2">
          {researchers.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex gap-2.5 items-start"
            >
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-xs flex-shrink-0 bg-[#D4AF37]/5">
                {r.symbol}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-wide leading-tight">{r.title}</p>
                  <div className="hidden lg:flex items-center gap-0.5 ml-1">
                    <div className="w-3 border-t border-dashed border-[#D4AF37]/20" />
                    <div className="w-1 h-1 rounded-full bg-[#D4AF37]/40" />
                  </div>
                </div>
                <p className="text-white/50 text-[10px] leading-tight">{r.names}</p>
                <p className="text-white/28 text-[9px] leading-tight">{r.tags}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CENTER — 4 Circles + DNA */}
        <div className="lg:w-[42%] flex-shrink-0 flex items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-4">

            {/* LEFT circles column */}
            <div className="flex flex-col gap-3 sm:gap-5 items-end">
              {leftDims.map(dim => (
                <DimCircle key={dim.id} dim={dim} isActive={open.has(dim.id)} onClick={() => toggle(dim.id)} />
              ))}
            </div>

            {/* DNA + center */}
            <div className="flex flex-col items-center gap-0">
              <DNAHelix height={210} />

              <div className="text-center px-3 py-2 my-[-4px]">
                <p className="text-[#D4AF37] font-black text-[15px] sm:text-[18px] uppercase tracking-[0.08em] leading-tight">Human</p>
                <p className="text-[#D4AF37] font-black text-[15px] sm:text-[18px] uppercase tracking-[0.08em] leading-tight">Blueprint</p>
                <p className="text-white/40 text-[9px] mt-1.5 max-w-[130px] leading-relaxed">
                  The map of your natural patterns. A structured view of your potential, patterns and contribution.
                </p>
              </div>

              <DNAHelix height={210} />

              <div className="text-center mt-2">
                <p className="text-[#D4AF37] font-black text-[18px] tracking-widest">YOU</p>
                <p className="text-white/35 text-[9px] leading-tight">Your Story.<br />Your Patterns.<br />Your Potential.</p>
              </div>
            </div>

            {/* RIGHT circles column */}
            <div className="flex flex-col gap-3 sm:gap-5 items-start">
              {rightDims.map(dim => (
                <DimCircle key={dim.id} dim={dim} isActive={open.has(dim.id)} onClick={() => toggle(dim.id)} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Info panels */}
        <div className="lg:w-[36%] flex-shrink-0 flex flex-col gap-2.5 pt-1">
          <AnimatePresence>
            {dimensions.map(dim =>
              open.has(dim.id)
                ? <InfoPanel key={dim.id} dim={dim} onClose={() => toggle(dim.id)} />
                : null
            )}
          </AnimatePresence>
          {open.size === 0 && (
            <p className="text-white/25 text-xs text-center italic mt-6">Click any dimension to see details</p>
          )}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-[#D4AF37]/15 bg-[#040e1f]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-6 md:px-10 py-4">

          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              ✦
            </div>
            <div>
              <p className="text-white/50 text-[11px]">Decades of research. One timeless question.</p>
              <p className="text-[#D4AF37] text-[11px] font-bold">Your discovery starts today.</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/discover"
            className="border-2 border-dashed border-[#D4AF37] text-[#D4AF37] font-bold text-sm px-8 py-3 rounded-lg
              hover:bg-[#D4AF37] hover:text-[#07142F] transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.45)]
              hover:scale-[1.02] whitespace-nowrap"
          >
            START YOUR JOURNEY →
          </Link>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div className="text-center md:text-right">
              <p className="text-white/50 text-[11px]">Discover Your Purpose.</p>
              <p className="text-[#D4AF37] text-[11px] font-semibold">Design Your Best Life.</p>
            </div>
            <div className="border border-[#D4AF37]/30 rounded-lg px-3 py-2 flex items-center gap-2 bg-[#D4AF37]/5">
              <MousePointer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <div>
                <p className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-wider">Interactive</p>
                <p className="text-white/35 text-[8px]">Click any dimension<br />to open details.</p>
              </div>
            </div>
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
