import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const dimensions = [
  {
    id: 'energy',
    label: 'ENERGY',
    position: 'left-top',
    color: '#D4AF37',
    definition: 'What naturally drives you.',
    expanded: 'The activities, environments and experiences that activate your motivation and vitality. When you operate from your Energy zone, effort feels natural and time disappears.',
    examples: 'Leading conversations · Creative problem-solving · Building new systems · Deep research',
  },
  {
    id: 'strengths',
    label: 'STRENGTHS',
    position: 'left-bottom',
    color: '#D4AF37',
    definition: 'What you consistently do well.',
    expanded: 'The abilities that repeatedly produce reliable results across different contexts. Strengths are not just skills — they are cognitive and behavioral patterns wired into your design.',
    examples: 'Analytical thinking · Emotional intelligence · Strategic planning · Communication',
  },
  {
    id: 'gift',
    label: 'GIFT',
    position: 'right-top',
    color: '#D4AF37',
    definition: 'What comes naturally to you.',
    expanded: 'Unique talents and cognitive patterns that can be refined and developed into exceptional capabilities. Your Gift is what others notice before you do.',
    examples: 'Seeing patterns others miss · Natural teaching ability · Intuitive leadership · Creative vision',
  },
  {
    id: 'impact',
    label: 'IMPACT',
    position: 'right-bottom',
    color: '#D4AF37',
    definition: 'Where your contribution matters.',
    expanded: 'The areas where your abilities create meaningful value for others. Impact is the intersection of your Gift and the world\'s real needs.',
    examples: 'Education · Technology · Human development · Social innovation · Creative industries',
  },
];

const DNANode = ({ cx, cy, r = 4 }) => (
  <circle cx={cx} cy={cy} r={r} fill="#D4AF37" opacity="0.9" />
);

const HumanBlueprintDiagram = () => {
  const [activePanel, setActivePanel] = useState(null);

  const activeDimension = dimensions.find(d => d.id === activePanel);

  const handleClick = (id) => {
    setActivePanel(prev => prev === id ? null : id);
  };

  return (
    <section className="w-full bg-[#07142F] py-16 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-[#D4AF37] uppercase mb-3">Built on Decades of Human Understanding</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Your <span className="text-[#D4AF37]">Human Blueprint</span></h2>
          <p className="text-sm text-white/50 mt-2">Click any dimension to learn more</p>
        </motion.div>

        {/* MAIN DIAGRAM */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 w-full lg:w-1/4">
            {dimensions.filter(d => d.position.startsWith('left')).map((dim) => (
              <motion.button
                key={dim.id}
                onClick={() => handleClick(dim.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  activePanel === dim.id
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                    : 'border-[#D4AF37]/30 bg-white/5 hover:border-[#D4AF37]/60'
                }`}
              >
                <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-1">{dim.label}</p>
                <p className="text-white/60 text-xs leading-relaxed">{dim.definition}</p>
              </motion.button>
            ))}
          </div>

          {/* CENTER — DNA SVG */}
          <div className="flex-shrink-0 w-full lg:w-2/4 flex flex-col items-center">
            <svg
              viewBox="0 0 200 420"
              className="w-[180px] md:w-[220px] lg:w-[200px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* DNA Strands */}
              {[0,1,2,3,4,5,6,7,8,9,10].map((i) => {
                const y = 20 + i * 36;
                const wave = Math.sin((i / 10) * Math.PI * 2);
                const x1 = 100 + wave * 60;
                const x2 = 100 - wave * 60;
                return (
                  <g key={i}>
                    <line x1={x1} y1={y} x2={x2} y2={y} stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
                    <DNANode cx={x1} cy={y} />
                    <DNANode cx={x2} cy={y} />
                  </g>
                );
              })}

              {/* Left spine */}
              <path
                d="M 40 20 C 40 80, 160 120, 160 210 C 160 300, 40 340, 40 400"
                stroke="#D4AF37" strokeWidth="2" fill="none" opacity="0.7"
              />
              {/* Right spine */}
              <path
                d="M 160 20 C 160 80, 40 120, 40 210 C 40 300, 160 340, 160 400"
                stroke="#D4AF37" strokeWidth="2" fill="none" opacity="0.7"
              />

              {/* Glow dots on spine */}
              {[20, 80, 140, 210, 280, 340, 400].map((y, i) => (
                <circle key={i} cx={i % 2 === 0 ? 40 : 160} cy={y} r="5" fill="#D4AF37" opacity="0.9" />
              ))}

              {/* Center circle — HUMAN BLUEPRINT */}
              <circle cx="100" cy="210" r="38" fill="#07142F" stroke="#D4AF37" strokeWidth="2" />
              <text x="100" y="204" textAnchor="middle" fill="#D4AF37" fontSize="7" fontWeight="bold" letterSpacing="1">HUMAN</text>
              <text x="100" y="214" textAnchor="middle" fill="#D4AF37" fontSize="7" fontWeight="bold" letterSpacing="1">BLUEPRINT</text>
              <text x="100" y="228" textAnchor="middle" fill="white" fontSize="5" opacity="0.6">Your natural pattern</text>

              {/* YOU text at bottom */}
              <text x="100" y="390" textAnchor="middle" fill="#D4AF37" fontSize="11" fontWeight="bold">YOU</text>
              <text x="100" y="402" textAnchor="middle" fill="white" fontSize="5" opacity="0.5">Your Story. Your Patterns.</text>
            </svg>

            {/* CTA BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <Link
                to="/discover"
                className="flex items-center justify-center w-[280px] h-[56px] bg-[#D4AF37] text-[#07142F] font-bold text-[15px] rounded-[12px] shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:scale-[1.02] transition-all duration-300"
              >
                START YOUR JOURNEY →
              </Link>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6 w-full lg:w-1/4">
            {dimensions.filter(d => d.position.startsWith('right')).map((dim) => (
              <motion.button
                key={dim.id}
                onClick={() => handleClick(dim.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  activePanel === dim.id
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                    : 'border-[#D4AF37]/30 bg-white/5 hover:border-[#D4AF37]/60'
                }`}
              >
                <p className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase mb-1">{dim.label}</p>
                <p className="text-white/60 text-xs leading-relaxed">{dim.definition}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* SIDE PANEL — appears when a dimension is clicked */}
        <AnimatePresence>
          {activeDimension && (
            <motion.div
              key={activeDimension.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-10 max-w-2xl mx-auto rounded-2xl border-2 border-[#D4AF37]/50 bg-[#D4AF37]/5 p-8 relative"
            >
              <button
                onClick={() => setActivePanel(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <p className="text-[#D4AF37] font-bold text-xs tracking-[0.3em] uppercase mb-2">{activeDimension.label}</p>
              <h3 className="text-white text-xl font-bold mb-3">{activeDimension.definition}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4">{activeDimension.expanded}</p>
              <div className="border-t border-[#D4AF37]/20 pt-4">
                <p className="text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-2">Examples</p>
                <p className="text-white/60 text-sm">{activeDimension.examples}</p>
              </div>

              <Link
                to="/discover"
                className="mt-6 inline-flex items-center gap-2 text-[#D4AF37] text-sm font-semibold hover:underline"
              >
                Discover your {activeDimension.label} →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESEARCHERS ROW */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-center border-t border-[#D4AF37]/10 pt-10"
        >
          <p className="text-white/30 text-xs tracking-widest uppercase mb-4">Built on the work of</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {['Carl Jung', 'Viktor Frankl', 'Abraham Maslow', 'Howard Gardner', 'Mihaly Csikszentmihalyi', 'James Hillman'].map((name) => (
              <span key={name} className="text-white/40 text-xs">{name}</span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HumanBlueprintDiagram;
