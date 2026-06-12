import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

// ─── COLORES MÓDULOS ───────────────────────────────────────────
const COLORS = {
  pasion:    '#E8536A',
  profesion: '#4ECBA0',
  vocacion:  '#7B8FE8',
  mision:    '#B57BF0',
};

// ─── SECCIÓN WRAPPER ───────────────────────────────────────────
const Section = ({ step, label, title, color = '#D4AF37', children }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="mb-20"
  >
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-bold tracking-[0.35em] uppercase px-3 py-1 rounded-full"
        style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}>
        {step}
      </span>
      <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
    </div>
    <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white" style={{ letterSpacing: '-0.01em' }}>{title}</h2>
    {children}
  </motion.div>
);

// ─── MÓDULO CARD ───────────────────────────────────────────────
const ModuleCard = ({ name, pct, phrase, detail, color }) => (
  <div className="rounded-2xl p-6 mb-4"
    style={{ backgroundColor: 'rgba(7,20,47,0.7)', border: `1.5px solid ${color}40` }}>
    <div className="flex justify-between items-center mb-3">
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{name}</span>
      <span className="text-2xl font-bold" style={{ color }}>{pct}%</span>
    </div>
    {/* Barra de progreso */}
    <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: `${color}20` }}>
      <motion.div
        className="h-1.5 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
    <p className="text-white font-semibold text-base mb-2">{phrase}</p>
    <p className="text-white/55 text-sm leading-relaxed">{detail}</p>
  </div>
);

// ─── RUTA CARD ─────────────────────────────────────────────────
const RutaCard = ({ num, title, tiempo, costo, paso, color }) => {
  const { lang } = useLanguage();
  return (
    <div className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: 'rgba(7,20,47,0.6)', border: '1px solid rgba(212,175,55,0.15)' }}>
      <div className="flex items-start gap-4">
        <span className="text-3xl font-bold flex-shrink-0" style={{ color: '#D4AF37', opacity: 0.4 }}>0{num}</span>
        <div className="flex-1">
          <p className="text-white font-bold text-base mb-3">{title}</p>
          <div className="flex flex-wrap gap-3 mb-3">
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.8)', border: '1px solid rgba(212,175,55,0.2)' }}>
              ⏱ {tiempo}
            </span>
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.8)', border: '1px solid rgba(212,175,55,0.2)' }}>
              💰 {costo}
            </span>
          </div>
          <p className="text-white/50 text-xs leading-relaxed">
            <span className="text-white/70 font-semibold">{lang === 'es' ? 'Primer paso: ' : 'First step: '}</span>{paso}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── PÁGINA PRINCIPAL ──────────────────────────────────────────
const SampleAnalysisPage = () => {
  const { lang } = useLanguage();
  const isEs = lang === 'es';

  return (
    <>
      <Helmet>
        <title>{isEs ? 'Ejemplo de Reporte — AKSHA' : 'Sample Report — AKSHA'}</title>
        <meta name="description" content={isEs
          ? 'Así se ve un Mapa de Propósito AKSHA real — Datos, Análisis, Síntesis, Descubrimiento y Acción.'
          : 'This is what a real AKSHA Purpose Map looks like — Data, Analysis, Synthesis, Discovery and Action.'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-24">

          {/* ── HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-xs font-bold tracking-[0.35em] uppercase px-4 py-1.5 rounded-full mb-6 inline-block"
              style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
              {isEs ? 'Ejemplo real · Perfil M.R.' : 'Real example · Profile M.R.'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.02em' }}>
              {isEs ? <>Así se ve tu <span style={{ color: '#D4AF37' }}>Mapa de Propósito</span></> : <>This is what your <span style={{ color: '#D4AF37' }}>Purpose Map</span> looks like</>}
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
              {isEs
                ? 'M.R. — 43 años — Bogotá, Colombia. Directora de proyectos. Sintió durante años que algo no encajaba. Este es su reporte.'
                : 'M.R. — 43 years old — Bogotá, Colombia. Project manager. Felt for years something didn\'t fit. This is her report.'}
            </p>
            <div className="mt-8 flex justify-center">
              <ChevronDown className="w-6 h-6 animate-bounce" style={{ color: 'rgba(212,175,55,0.5)' }} />
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════
              PASO 1 — DATOS
          ══════════════════════════════════════════════════════ */}
          <Section
            step={isEs ? 'Paso 1' : 'Step 1'}
            label={isEs ? 'Los números' : 'The numbers'}
            title={isEs ? 'Tus 4 dimensiones de propósito' : 'Your 4 dimensions of purpose'}
          >
            {/* Contexto ANTES de los números */}
            <div className="rounded-2xl p-6 mb-8"
              style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                {isEs
                  ? 'Antes de ver los números, necesitas saber qué estás mirando. Tu propósito tiene 4 dimensiones — no son categorías, son 4 preguntas que tu vida ya está respondiendo sin que te lo hayas preguntado.'
                  : 'Before seeing the numbers, you need to know what you\'re looking at. Your purpose has 4 dimensions — they\'re not categories, they\'re 4 questions your life is already answering without you realizing it.'}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { key: isEs ? 'PASIÓN' : 'PASSION', q: isEs ? '¿Qué harías aunque no te pagaran?' : 'What would you do even if unpaid?', c: COLORS.pasion },
                  { key: isEs ? 'PROFESIÓN' : 'PROFESSION', q: isEs ? '¿En qué eres tan bueno que te buscan?' : 'What are you so good at people seek you out?', c: COLORS.profesion },
                  { key: isEs ? 'VOCACIÓN' : 'VOCATION', q: isEs ? '¿Qué necesita el mundo que tú puedes dar?' : 'What does the world need that you can give?', c: COLORS.vocacion },
                  { key: isEs ? 'MISIÓN' : 'MISSION', q: isEs ? '¿Por qué causa moverías montañas?' : 'What cause would you move mountains for?', c: COLORS.mision },
                ].map(d => (
                  <div key={d.key} className="rounded-xl p-3" style={{ backgroundColor: `${d.c}10`, border: `1px solid ${d.c}30` }}>
                    <p className="text-xs font-bold tracking-widest mb-1" style={{ color: d.c }}>{d.key}</p>
                    <p className="text-white/55 text-xs leading-snug">{d.q}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-4">
                {isEs
                  ? '* El % no es una calificación. Es qué tan activa está esa dimensión en tu vida HOY.'
                  : '* The % is not a grade. It shows how active that dimension is in your life TODAY.'}
              </p>
            </div>

            {/* Los 4 números de M.R. */}
            <ModuleCard name={isEs ? 'PASIÓN' : 'PASSION'} pct={87} color={COLORS.pasion}
              phrase={isEs ? 'Sintetizar — convertir lo complejo en comprensible.' : 'Synthesizing — turning complex into clear.'}
              detail={isEs ? 'Su energía se activa cuando traduce información difícil para que otros la entiendan. Lo ha hecho toda su vida sin darse cuenta de que es su don.' : 'Her energy peaks when translating complex information so others understand it. She\'s been doing this her whole life without realizing it\'s her gift.'} />
            <ModuleCard name={isEs ? 'PROFESIÓN' : 'PROFESSION'} pct={92} color={COLORS.profesion}
              phrase={isEs ? 'Pensamiento sistémico — ve el todo cuando otros ven partes.' : 'Systems thinking — sees the whole when others see parts.'}
              detail={isEs ? 'Coordina equipos, proyectos y personas con una habilidad que sus colegas describen como "natural". Ella cree que cualquiera puede hacerlo. No es cierto.' : 'She coordinates teams, projects and people with a skill her colleagues describe as "natural." She thinks anyone can do it. They can\'t.'} />
            <ModuleCard name={isEs ? 'VOCACIÓN' : 'VOCATION'} pct={78} color={COLORS.vocacion}
              phrase={isEs ? 'Puente entre lo técnico y lo humano — donde pocos saben estar.' : 'Bridge between technical and human — where few can stand.'}
              detail={isEs ? 'El mercado paga muy bien por personas que hablan el lenguaje de la tecnología Y el de las personas. M.R. lo hace sin esfuerzo.' : 'The market pays very well for people who speak both the language of technology AND people. M.R. does this effortlessly.'} />
            <ModuleCard name={isEs ? 'MISIÓN' : 'MISSION'} pct={85} color={COLORS.mision}
              phrase={isEs ? 'Que la tecnología siga siendo humana — esa es su causa.' : 'Keeping technology human — that\'s her cause.'}
              detail={isEs ? 'A medida que la IA automatiza todo, alguien tiene que asegurarse de que lo que queda sea humano. M.R. nació para ese rol.' : 'As AI automates everything, someone has to ensure what remains is human. M.R. was born for that role.'} />
          </Section>

          {/* ══════════════════════════════════════════════════════
              PASO 2 — ANÁLISIS
          ══════════════════════════════════════════════════════ */}
          <Section
            step={isEs ? 'Paso 2' : 'Step 2'}
            label={isEs ? 'Lo que significan' : 'What they mean'}
            title={isEs ? 'Qué dice el análisis sobre M.R.' : 'What the analysis says about M.R.'}
          >
            {[
              {
                titulo: isEs ? 'Su 92% en Profesión no es un accidente' : 'Her 92% in Profession is not an accident',
                texto: isEs
                  ? 'Desde que era niña organizaba cosas. Sus amigos siempre le pedían que coordinara. En el trabajo siempre es la persona que "tiene todo claro". Eso no es experiencia — es un patrón de comportamiento que lleva décadas activo.'
                  : 'Since she was a child she organized things. Friends always asked her to coordinate. At work she\'s always the person who "has it all clear." That\'s not experience — it\'s a behavioral pattern active for decades.',
              },
              {
                titulo: isEs ? 'Su 78% en Vocación esconde una tensión real' : 'Her 78% in Vocation hides a real tension',
                texto: isEs
                  ? 'Sabe que es buena en lo que hace. Pero nunca ha cobrado lo que vale. Acepta proyectos por debajo de su nivel porque no sabe cómo nombrar exactamente qué ofrece. El análisis lo nombra: es una arquitecta de sistemas humanos — y eso tiene precio en el mercado.'
                  : 'She knows she\'s good at what she does. But she\'s never charged what she\'s worth. She accepts below-level projects because she doesn\'t know how to name what she offers. The analysis names it: she\'s a human systems architect — and that has market price.',
              },
              {
                titulo: isEs ? 'Su 85% en Misión explica su frustración de los últimos 3 años' : 'Her 85% in Mission explains her frustration of the last 3 years',
                texto: isEs
                  ? 'Ha trabajado en empresas donde el resultado importa más que las personas. Cada vez que propone algo "más humano" la ignoran. No es que esté equivocada — es que está en el entorno equivocado. Su misión requiere otro tipo de escenario.'
                  : 'She\'s worked at companies where results matter more than people. Every time she proposes something "more human" she\'s ignored. She\'s not wrong — she\'s in the wrong environment. Her mission requires a different type of stage.',
              },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 mb-4"
                style={{ backgroundColor: 'rgba(7,20,47,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-white font-semibold text-base mb-3">{item.titulo}</p>
                <p className="text-white/55 text-sm leading-relaxed">{item.texto}</p>
              </motion.div>
            ))}
          </Section>

          {/* ══════════════════════════════════════════════════════
              PASO 3 — SÍNTESIS
          ══════════════════════════════════════════════════════ */}
          <Section
            step={isEs ? 'Paso 3' : 'Step 3'}
            label={isEs ? 'El cuadro completo' : 'The full picture'}
            title={isEs ? 'Lo que emerge cuando ves todo junto' : 'What emerges when you see it all together'}
          >
            <div className="rounded-2xl p-8 text-center mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.03) 100%)', border: '1.5px solid rgba(212,175,55,0.25)' }}>
              <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: 'rgba(212,175,55,0.6)' }}>
                {isEs ? 'Punto de Convergencia · M.R.' : 'Convergence Point · M.R.'}
              </p>
              <p className="text-xl md:text-2xl font-light text-white leading-relaxed">
                {isEs
                  ? <>"Construir los sistemas que hacen que la tecnología<br className="hidden md:block"/> <span style={{ color: '#D4AF37', fontStyle: 'italic' }}>siga siendo humana.</span>"</>
                  : <>"Building the systems that keep technology<br className="hidden md:block"/> <span style={{ color: '#D4AF37', fontStyle: 'italic' }}>fundamentally human.</span>"</>
                }
              </p>
            </div>
            <p className="text-white/45 text-sm leading-relaxed text-center">
              {isEs
                ? 'Esta frase no es poética. Es literal. Es el único punto donde su Pasión de sintetizar + su Profesión de coordinar sistemas + su Vocación de puente técnico-humano + su Misión de humanizar la tecnología — se convierten en una sola dirección.'
                : 'This sentence is not poetic. It\'s literal. It\'s the only point where her Passion for synthesizing + her Profession of coordinating systems + her Vocation as a technical-human bridge + her Mission of humanizing technology — become one single direction.'}
            </p>
          </Section>

          {/* ══════════════════════════════════════════════════════
              PASO 4 — DESCUBRIMIENTO
          ══════════════════════════════════════════════════════ */}
          <Section
            step={isEs ? 'Paso 4' : 'Step 4'}
            label={isEs ? 'Lo que M.R. vio' : 'What M.R. saw'}
            title={isEs ? 'El momento de descubrimiento' : 'The discovery moment'}
          >
            <div className="rounded-2xl p-8"
              style={{ backgroundColor: 'rgba(7,20,47,0.8)', border: '1.5px solid rgba(212,175,55,0.2)' }}>
              <p className="text-xs tracking-widest uppercase mb-6" style={{ color: 'rgba(212,175,55,0.5)' }}>
                {isEs ? 'Lo que el reporte reveló' : 'What the report revealed'}
              </p>
              {[
                isEs
                  ? 'Llevas 20 años siendo buena en algo que no sabías nombrar. No es "gestión de proyectos" — es arquitectura de sistemas humanos. Esa diferencia de nombre vale 3 veces más en el mercado.'
                  : 'You\'ve spent 20 years being good at something you didn\'t know how to name. It\'s not "project management" — it\'s human systems architecture. That naming difference is worth 3x more in the market.',
                isEs
                  ? 'Tu frustración no es con tu carrera. Es con los entornos donde tu misión no tiene espacio. El problema no eres tú — es que has estado en las organizaciones equivocadas.'
                  : 'Your frustration is not with your career. It\'s with the environments where your mission has no space. The problem is not you — it\'s that you\'ve been in the wrong organizations.',
                isEs
                  ? 'El mercado que necesitas no es el corporativo tradicional. Es el espacio donde tecnología y humanidad se están negociando ahora mismo — startups de IA, consultoras de transformación digital, ONGs tech. Ahí es donde tu perfil vale más.'
                  : 'The market you need is not traditional corporate. It\'s the space where technology and humanity are being negotiated right now — AI startups, digital transformation consulting, tech NGOs. That\'s where your profile is worth the most.',
              ].map((txt, i) => (
                <div key={i} className="flex gap-4 mb-5 last:mb-0">
                  <span className="text-xl flex-shrink-0" style={{ color: '#D4AF37' }}>→</span>
                  <p className="text-white/75 text-sm leading-relaxed">{txt}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ══════════════════════════════════════════════════════
              PASO 5 — ACCIÓN
          ══════════════════════════════════════════════════════ */}
          <Section
            step={isEs ? 'Paso 5' : 'Step 5'}
            label={isEs ? 'Qué hacer' : 'What to do'}
            title={isEs ? 'Las 4 rutas concretas para M.R.' : 'The 4 concrete routes for M.R.'}
          >
            <p className="text-white/40 text-sm mb-6">
              {isEs
                ? 'Cada ruta está anclada en su análisis. No son sugerencias genéricas — son consecuencias lógicas de todo lo anterior.'
                : 'Each route is anchored in her analysis. These aren\'t generic suggestions — they\'re logical consequences of everything above.'}
            </p>
            <RutaCard num={1}
              title={isEs ? 'Consultora independiente de transformación digital con enfoque humano' : 'Independent digital transformation consultant with human focus'}
              tiempo={isEs ? '3–6 meses para primeros clientes' : '3–6 months to first clients'}
              costo={isEs ? '$0 inversión inicial · tarifa $80–150 USD/hr' : '$0 initial investment · rate $80–150 USD/hr'}
              paso={isEs ? 'Reescribir tu LinkedIn con el lenguaje "arquitecta de sistemas humanos" esta semana.' : 'Rewrite your LinkedIn with "human systems architect" language this week.'} />
            <RutaCard num={2}
              title={isEs ? 'Directora de Operaciones en startup de IA (seed o Serie A)' : 'COO at AI startup (seed or Series A)'}
              tiempo={isEs ? '2–4 meses de búsqueda activa' : '2–4 months of active search'}
              costo={isEs ? '$200 en cursos de IA básica para hablar el lenguaje' : '$200 in basic AI courses to speak the language'}
              paso={isEs ? 'Crear perfil en Wellfound (AngelList) y aplicar a 5 startups esta semana.' : 'Create profile on Wellfound (AngelList) and apply to 5 startups this week.'} />
            <RutaCard num={3}
              title={isEs ? 'Programa de certificación en Diseño Centrado en el Humano (IDEO o Stanford d.school)' : 'Human-Centered Design certification (IDEO or Stanford d.school)'}
              tiempo={isEs ? '6 semanas · online' : '6 weeks · online'}
              costo="$1,200–2,500 USD"
              paso={isEs ? 'Aplicar al programa online de IDEO U — próxima cohorte abre en 30 días.' : 'Apply to IDEO U online program — next cohort opens in 30 days.'} />
            <RutaCard num={4}
              title={isEs ? 'Crear contenido en LinkedIn sobre "humanizar la IA" — construir audiencia de 5K en 6 meses' : 'Create LinkedIn content about "humanizing AI" — build 5K audience in 6 months'}
              tiempo={isEs ? '3 posts por semana · 6 meses' : '3 posts per week · 6 months'}
              costo={isEs ? '$0 · solo tiempo' : '$0 · time only'}
              paso={isEs ? 'Escribir el primer post esta semana: "Lo que 20 años coordinando proyectos me enseñó sobre la IA".' : 'Write the first post this week: "What 20 years coordinating projects taught me about AI".'} />
          </Section>

          {/* ══════════════════════════════════════════════════════
              CTA FINAL
          ══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center py-16 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.03) 100%)', border: '1.5px solid rgba(212,175,55,0.2)' }}
          >
            <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: 'rgba(212,175,55,0.7)' }}>
              {isEs ? 'Tu turno' : 'Your turn'}
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              {isEs ? 'Tu mapa será diferente a este.' : 'Your map will be different from this one.'}
            </h3>
            <p className="text-white/45 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              {isEs
                ? 'Porque tú eres diferente. Mismos 5 pasos — otro perfil, otras rutas, otro descubrimiento. El tuyo.'
                : 'Because you are different. Same 5 steps — different profile, different routes, different discovery. Yours.'}
            </p>
            <Link to="/pricing">
              <Button size="lg" className="text-base px-8 py-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] active:scale-[0.98]">
                {isEs ? 'Generar Mi Mapa de Propósito' : 'Generate My Purpose Map'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default SampleAnalysisPage;
