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
          ? 'Mira un Mapa de Propósito AKSHA real, paso a paso: los números, el análisis, la síntesis y las rutas de acción de un perfil en Nueva York.'
          : 'See a real AKSHA Purpose Map, step by step: the numbers, the analysis, the synthesis and the action routes of a New York profile.'} />
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
                ? 'M.R. · 43 años · Nueva York. Directora de proyectos en Manhattan. Veinte años de carrera sólida y la sensación persistente de estar en el lugar equivocado. Este es su reporte.'
                : 'M.R. · 43 · New York City. Project manager in Manhattan. Twenty years of solid career and the persistent feeling of being in the wrong place. This is her report.'}
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
            title={isEs ? 'Las 4 dimensiones que tu mapa mide' : 'The 4 dimensions your map measures'}
          >
            {/* Contexto ANTES de los números */}
            <div className="rounded-2xl p-6 mb-8"
              style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                {isEs
                  ? 'Antes de los números, qué estás mirando: tu propósito tiene 4 dimensiones, y tu vida ya las está respondiendo aunque nunca te lo hayas preguntado. El mapa mide qué tan activa está cada una hoy.'
                  : 'Before the numbers, what you\'re looking at: your purpose has 4 dimensions, and your life is already answering them even if you never asked. The map measures how active each one is today.'}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { key: isEs ? 'PASIÓN' : 'PASSION', q: isEs ? '¿Qué harías aunque no te pagaran?' : 'What would you do even if unpaid?', c: COLORS.pasion },
                  { key: isEs ? 'PROFESIÓN' : 'PROFESSION', q: isEs ? '¿En qué eres tan buena que te buscan?' : 'What are you so good at people seek you out?', c: COLORS.profesion },
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
                  ? '* El porcentaje muestra qué tan activa está esa dimensión en tu vida HOY.'
                  : '* The percentage shows how active that dimension is in your life TODAY.'}
              </p>
            </div>

            {/* Los 4 números de M.R. */}
            <ModuleCard name={isEs ? 'PASIÓN' : 'PASSION'} pct={87} color={COLORS.pasion}
              phrase={isEs ? 'Sintetizar: convertir lo complejo en algo que cualquiera entiende.' : 'Synthesizing: turning the complex into something anyone can grasp.'}
              detail={isEs ? 'Su energía sube cuando traduce información difícil. Lleva toda la vida haciéndolo gratis, en reuniones, con amigos, sin registrarlo como un don.' : 'Her energy rises when she translates difficult information. She\'s done it free her whole life, in meetings, with friends, never registering it as a gift.'} />
            <ModuleCard name={isEs ? 'PROFESIÓN' : 'PROFESSION'} pct={92} color={COLORS.profesion}
              phrase={isEs ? 'Pensamiento sistémico: ve el todo donde otros ven partes.' : 'Systems thinking: she sees the whole where others see parts.'}
              detail={isEs ? 'Coordina equipos y proyectos con una soltura que sus colegas llaman "natural". Ella asume que cualquiera puede hacerlo. Sus jefes saben que no.' : 'She coordinates teams and projects with an ease her colleagues call "natural." She assumes anyone can do it. Her bosses know better.'} />
            <ModuleCard name={isEs ? 'VOCACIÓN' : 'VOCATION'} pct={78} color={COLORS.vocacion}
              phrase={isEs ? 'Puente entre lo técnico y lo humano, donde pocos saben pararse.' : 'A bridge between the technical and the human, where few can stand.'}
              detail={isEs ? 'Las empresas pagan caro a quien habla el idioma de la tecnología y el de las personas a la vez. M.R. lo hace sin esfuerzo, y por eso mismo lo ha estado regalando.' : 'Companies pay a premium for someone fluent in both technology and people. M.R. does it effortlessly, which is exactly why she\'s been giving it away.'} />
            <ModuleCard name={isEs ? 'MISIÓN' : 'MISSION'} pct={85} color={COLORS.mision}
              phrase={isEs ? 'Que la tecnología siga siendo humana. Esa es su causa.' : 'Keeping technology human. That\'s her cause.'}
              detail={isEs ? 'Mientras la IA automatiza todo lo automatizable, alguien tiene que decidir qué se queda humano. Ese rol existe, y encaja con ella.' : 'While AI automates everything automatable, someone has to decide what stays human. That role exists, and it fits her.'} />
          </Section>

          {/* ══════════════════════════════════════════════════════
              PASO 2 — ANÁLISIS
          ══════════════════════════════════════════════════════ */}
          <Section
            step={isEs ? 'Paso 2' : 'Step 2'}
            label={isEs ? 'Lo que significan' : 'What they mean'}
            title={isEs ? 'Lo que el análisis vio en M.R.' : 'What the analysis saw in M.R.'}
          >
            {[
              {
                titulo: isEs ? 'Su 92% en Profesión lleva décadas construyéndose' : 'Her 92% in Profession took decades to build',
                texto: isEs
                  ? 'De niña organizaba los juegos. En la universidad coordinaba a todos. En cada trabajo termina siendo la persona que "tiene todo claro". Un patrón tan viejo y tan constante deja de ser casualidad: es la materia prima de su carrera, y el reporte lo pone por escrito por primera vez.'
                  : 'As a kid she organized the games. In college she coordinated everyone. In every job she ends up being the person who "has it all clear." A pattern that old and that consistent stops being coincidence: it\'s the raw material of her career, and the report puts it in writing for the first time.',
              },
              {
                titulo: isEs ? 'Su 78% en Vocación esconde dinero sobre la mesa' : 'Her 78% in Vocation hides money left on the table',
                texto: isEs
                  ? 'Sabe que es buena. Aun así cobra menos de lo que el mercado de Nueva York paga por su perfil, porque nunca ha sabido nombrar exactamente qué ofrece. El análisis lo nombra: arquitecta de sistemas humanos. Con ese nombre, la conversación de tarifas cambia de tono.'
                  : 'She knows she\'s good. She still charges less than the New York market pays for her profile, because she\'s never known how to name exactly what she offers. The analysis names it: human systems architect. With that name, the rate conversation changes tone.',
              },
              {
                titulo: isEs ? 'Su 85% en Misión explica la frustración de los últimos 3 años' : 'Her 85% in Mission explains the last 3 years of frustration',
                texto: isEs
                  ? 'Ha pasado por empresas donde el resultado pesa más que las personas, y cada propuesta "más humana" termina en un cajón. El problema nunca fue su criterio. Era el escenario. Una misión de ese tamaño necesita organizaciones que la estén buscando, y existen.'
                  : 'She\'s been through companies where results outweigh people, and every "more human" proposal ends up in a drawer. The problem was never her judgment. It was the stage. A mission that size needs organizations actively looking for it, and they exist.',
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
                ? 'Una sola dirección donde convergen las cuatro dimensiones: lo que la enciende, lo que domina, lo que el mercado paga y la causa que la mueve. Cuando las cuatro apuntan al mismo punto, decidir deja de doler.'
                : 'One single direction where all four dimensions converge: what lights her up, what she masters, what the market pays for and the cause that moves her. When all four point to the same spot, deciding stops hurting.'}
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
                  ? 'Llevas 20 años siendo buena en algo que no sabías nombrar. "Gestión de proyectos" describe tu cargo; "arquitectura de sistemas humanos" describe tu valor. En el mercado, esa diferencia de nombre se paga hasta 3 veces más.'
                  : 'You\'ve spent 20 years being good at something you didn\'t know how to name. "Project management" describes your job title; "human systems architecture" describes your value. The market pays up to 3x more for that difference in name.',
                isEs
                  ? 'Tu frustración nunca fue con tu carrera. Era con entornos donde tu misión no tenía espacio. Cambiar de empresa sin cambiar de tipo de empresa solo habría repetido el ciclo.'
                  : 'Your frustration was never with your career. It was with environments where your mission had no room. Changing companies without changing the type of company would only have repeated the cycle.',
                isEs
                  ? 'Tu mercado real está donde la tecnología y lo humano se negocian ahora mismo: startups de IA, consultoría de transformación, equipos de producto responsable. En Nueva York, ese mercado te queda a tres paradas de metro.'
                  : 'Your real market is where technology and humanity are being negotiated right now: AI startups, transformation consulting, responsible product teams. In New York, that market is three subway stops away.',
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
                ? 'Cada ruta sale directamente de su análisis, con tiempos, costos y un primer paso para esta misma semana.'
                : 'Each route comes straight from her analysis, with timelines, costs and a first step for this very week.'}
            </p>
            <RutaCard num={1}
              title={isEs ? 'Consultora independiente de transformación digital con enfoque humano' : 'Independent digital transformation consultant with human focus'}
              tiempo={isEs ? '3–6 meses para primeros clientes' : '3–6 months to first clients'}
              costo={isEs ? '$0 inversión inicial · tarifa NYC $150–250 USD/hr' : '$0 initial investment · NYC rate $150–250 USD/hr'}
              paso={isEs ? 'Reescribir tu LinkedIn con el lenguaje "arquitecta de sistemas humanos" esta semana.' : 'Rewrite your LinkedIn with "human systems architect" language this week.'} />
            <RutaCard num={2}
              title={isEs ? 'Directora de Operaciones en startup de IA de Nueva York (seed o Serie A)' : 'COO at a New York AI startup (seed or Series A)'}
              tiempo={isEs ? '2–4 meses de búsqueda activa' : '2–4 months of active search'}
              costo={isEs ? '$200 en cursos de IA básica para hablar el lenguaje' : '$200 in basic AI courses to speak the language'}
              paso={isEs ? 'Crear perfil en Wellfound (AngelList) y aplicar a 5 startups de NYC esta semana.' : 'Create a Wellfound (AngelList) profile and apply to 5 NYC startups this week.'} />
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
            className="text-center py-16 px-6 rounded-2xl"
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
                ? 'M.R. necesitaba un nombre para lo que ya sabía hacer. Tú quizá necesitas una dirección, un permiso o un primer paso. Tu reporte responde con tus datos, en los mismos 5 pasos.'
                : 'M.R. needed a name for what she already knew how to do. You might need a direction, a permission or a first step. Your report answers with your data, in the same 5 steps.'}
            </p>

            {/* Anclaje de precio real */}
            <div className="flex items-end justify-center gap-3 mb-2">
              <div className="flex items-start">
                <span className="text-xl font-bold mt-1" style={{ color: '#D4AF37' }}>$</span>
                <span className="text-6xl font-bold leading-none" style={{ color: '#D4AF37', letterSpacing: '-0.04em' }}>47</span>
              </div>
              <span className="text-xl text-white/25 line-through mb-1">$79</span>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-8">
              {isEs ? 'Precio Miembro Fundador · Pago único · Entrega en 24–48 h' : 'Founding Member price · One-time payment · Delivered in 24–48 h'}
            </p>

            <Link to="/pricing">
              <Button size="lg" className="text-base px-8 py-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] active:scale-[0.98]">
                {isEs ? 'Generar Mi Mapa de Propósito' : 'Generate My Purpose Map'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <p className="text-white/35 text-xs mt-6 max-w-sm mx-auto leading-relaxed">
              {isEs
                ? 'Hoy $47, pronto $79. Cuesta menos que una cena en Manhattan y se queda contigo para siempre.'
                : 'Today $47, soon $79. Less than dinner in Manhattan, and it stays with you forever.'}
            </p>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default SampleAnalysisPage;
