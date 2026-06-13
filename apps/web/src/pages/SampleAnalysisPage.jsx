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
              {isEs ? 'Ejemplo real · Perfil D.L.' : 'Real example · Profile D.L.'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.02em' }}>
              {isEs ? <>Así se ve tu <span style={{ color: '#D4AF37' }}>Mapa de Propósito</span></> : <>This is what your <span style={{ color: '#D4AF37' }}>Purpose Map</span> looks like</>}
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
              {isEs
                ? 'Diana López · 41 años · Nueva York. Arquitecta de sistemas en Brooklyn. Veinte años tendiendo puentes entre tecnología y personas, sin un nombre para lo que realmente hace. Este es su mapa.'
                : 'Diana López · 41 · New York City. Systems architect in Brooklyn. Twenty years building bridges between technology and people, without a name for what she actually does. This is her map.'}
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

            {/* Los 4 números de Diana */}
            <ModuleCard name={isEs ? 'PASIÓN' : 'PASSION'} pct={87} color={COLORS.pasion}
              phrase={isEs ? 'Cuando algo tiene sentido, arrancas sin pedir permiso.' : 'When something makes sense, you move without asking permission.'}
              detail={isEs ? 'Tu energía sube cuando el trabajo cierra la brecha entre intención y resultado. Has pasado veinte años haciéndolo —traduciendo, mediando, diseñando soluciones donde nadie creía que las hubiera. Sin registrarlo como lo que es: tu mayor don.' : 'Your energy rises when work closes the gap between intention and result. You\'ve spent twenty years doing it—translating, mediating, designing solutions where nobody thought they existed. Without registering it as what it is: your greatest gift.'} />
            <ModuleCard name={isEs ? 'PROFESIÓN' : 'PROFESSION'} pct={92} color={COLORS.profesion}
              phrase={isEs ? 'Ves la arquitectura de los problemas; otros ven solo síntomas.' : 'You see the architecture of problems; others see only symptoms.'}
              detail={isEs ? 'Cuando algo se rompe, no lo parchas: ves por qué se rompió y lo reconstruyes para que no se rompa igual. Tus colegas lo llaman "natural". Tú sabes que es paciencia: la disposición a sentarte con la complejidad hasta que se vuelve clara. Diana lo hace sin esfuerzo, y por eso mismo el sistema se la ha estado regalando.' : 'When something breaks, you don\'t patch it: you see why it broke and rebuild it so it won\'t break the same way. Your colleagues call it "natural." You know it\'s patience: the willingness to sit with complexity until it becomes clear. Diana does this effortlessly, which is exactly why the system has been stealing it.'} />
            <ModuleCard name={isEs ? 'VOCACIÓN' : 'VOCATION'} pct={78} color={COLORS.vocacion}
              phrase={isEs ? 'Personas te buscan para pensar en voz alta. Empresas para traducir.' : 'People seek you out to think aloud. Companies hire you to translate.'}
              detail={isEs ? 'Eres rara: hablas el idioma de la tecnología y el de las personas. Eso que parece fácil para ti, el mercado de Manhattan lo paga tres veces. Pero has cobrado menos porque aún no sabías exactamente cómo nombrar lo que ofreces. Cuando lo nombres, la conversación cambia de tono.' : 'You\'re rare: you speak both the language of technology and the language of people. What feels easy for you, the Manhattan market pays three times over. But you\'ve charged less because you didn\'t yet know exactly how to name what you offer. When you do, the conversation changes tone.'} />
            <ModuleCard name={isEs ? 'MISIÓN' : 'MISSION'} pct={85} color={COLORS.mision}
              phrase={isEs ? 'Sistemas que sirvan a la gente, no que la usen.' : 'Systems that serve people, not use them.'}
              detail={isEs ? 'Mientras todos automatizaban, tú preguntabas: "¿y el que carga con esto?" Mientras optimizaban procesos, tú optimizabas para que la gente no sufriera. Ese rol existe. En Nueva York lo llaman "responsible technology architect" y es exactamente donde tu oficio se vuelve indispensable.' : 'While everyone automated, you asked: "what about the person carrying this?" While they optimized processes, you optimized so people wouldn\'t suffer. That role exists. In New York they call it "responsible technology architect" and it\'s exactly where your craft becomes indispensable.'} />
          </Section>

          {/* ══════════════════════════════════════════════════════
              PASO 2 — ANÁLISIS
          ══════════════════════════════════════════════════════ */}
          <Section
            step={isEs ? 'Paso 2' : 'Step 2'}
            label={isEs ? 'Lo que significan' : 'What they mean'}
            title={isEs ? 'Lo que el análisis vio en Diana' : 'What the analysis saw in Diana'}
          >
            {[
              {
                titulo: isEs ? 'Su 92% en Profesión es invisibilidad con credenciales' : 'Her 92% in Profession is invisibility with credentials',
                texto: isEs
                  ? 'Desde niña la pusieron a resolver conflictos entre adultos. En la universidad se convirtió en la persona que traduce lo técnico para los no técnicos. En cada empresa termina siendo quien entiende a ambos lados —y ambos lados la dan por sentada. Un talento tan alto y tan invisible es exactamente donde el mercado deja de pagarte por horas y empieza a robarte carrera.'
                  : 'As a kid she was put between adults to solve their conflicts. In college she became the person who translates technical for non-technical. In every company she ends up being the bridge—and both sides take her for granted. A talent that high and that invisible is exactly where the market stops paying you for hours and starts stealing your career.',
              },
              {
                titulo: isEs ? 'Su 78% en Vocación se pierde en traducción de nombre' : 'Her 78% in Vocation is lost in translation of what it\'s called',
                texto: isEs
                  ? 'Arquitecta de sistemas — pero no solo técnicos. Diseña procesos donde la gente y la tecnología no compiten, donde cada una alimenta a la otra. El mercado de Nueva York paga $150–250/hr por eso exactamente. Ella cobra menos porque aún la llama "project management" y "stakeholder coordination". La subestimación empieza en el nombre que usa para sí misma.'
                  : 'Systems architect—but not just technical ones. She designs processes where people and technology don\'t compete, where each feeds the other. The New York market pays $150–250/hr for exactly that. She charges less because she still calls it "project management" and "stakeholder coordination." The underestimation starts with the name she uses for herself.',
              },
              {
                titulo: isEs ? 'Su 85% en Misión explica por qué rechaza dinero' : 'Her 85% in Mission explains why she rejects money',
                texto: isEs
                  ? 'Ha pasado por startups donde el objetivo era rentabilidad a costa de equipo. Por corporativos donde la "transformación digital" era solo tecnología. Por agencias donde quien sufría la mala arquitectura de sistemas era el usuario final. Y cada vez se preguntaba: "¿para qué estoy construyendo esto?" Una misión de ese tamaño —sistemas que sirvan a la gente, no que la usen— necesita espacios donde alguien la esté buscando activamente. En Nueva York existen, pero no les conocía su nombre.'
                  : 'She\'s been through startups where the goal was profit at the expense of team. Corporates where "digital transformation" was just tech. Agencies where the user bore the cost of bad system architecture. And each time she asked: "what am I building this for?" A mission that size—systems that serve people, not use them—needs spaces actively seeking it. They exist in New York, but she didn\'t know their names.',
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
                {isEs ? 'Punto de Convergencia · Diana' : 'Convergence Point · Diana'}
              </p>
              <p className="text-xl md:text-2xl font-light text-white leading-relaxed">
                {isEs
                  ? <>"Arquitecta de sistemas donde la gente no es<br className="hidden md:block"/> <span style={{ color: '#D4AF37', fontStyle: 'italic' }}>un recurso, sino la brújula.</span>"</>
                  : <>"Architect of systems where people aren\'t<br className="hidden md:block"/> <span style={{ color: '#D4AF37', fontStyle: 'italic' }}>a resource, but the compass.</span>"</>
                }
              </p>
            </div>
            <p className="text-white/45 text-sm leading-relaxed text-center">
              {isEs
                ? 'Una sola dirección donde convergen: lo que te enciende (resolver), lo que dominas (arquitectura), lo que el mercado paga ($150+/hr en NYC) y tu causa (que los sistemas sirvan, no que exploten). Cuando las cuatro apuntan al mismo lugar, la decisión deja de doler. Y empiezas a construir diferente.'
                : 'One direction where they all converge: what lights you up (solving), what you master (architecture), what the market pays ($150+/hr in NYC), and your cause (systems that serve, not exploit). When all four point the same way, deciding stops hurting. And you start building differently.'}
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
                {isEs ? 'Lo que Diana vio en su mapa' : 'What Diana saw in her map'}
              </p>
              {[
                isEs
                  ? 'Llevas 20 años diseñando soluciones donde nadie creía que existieran—pero las llamaste "project management" y la gente te pagó por horas. "Arquitecta de sistemas humanos" es el mismo trabajo con otro nombre, y en el mercado de Nueva York esa diferencia se paga 3x más. El trabajo no cambió. El nombre sí.'
                  : 'You\'ve spent 20 years designing solutions people thought impossible—but you called it "project management" and they paid you hourly. "Human systems architect" is the same work, differently named, and the New York market pays 3x more for that difference. The work didn\'t change. The name did.',
                isEs
                  ? 'Tu cansancio no era con la carrera misma. Era con espacios donde tu pregunta "¿y si lo diseñamos para que la gente no sufra?" terminaba en un cajón. Cambiar de empresa sin cambiar de tipo de empresa solo repetía el ciclo. Necesitas un lugar donde esa pregunta sea el punto de partida, no la disrupción.'
                  : 'Your exhaustion wasn\'t with the career itself. It was with spaces where your question "what if we designed this so people don\'t suffer?" ended up in a drawer. Changing companies without changing the type of company just repeats the cycle. You need a place where that question is the starting point, not the disruption.',
                isEs
                  ? 'Tu mercado real está donde la IA y lo humano se diseñan juntos—no donde la IA automátiza y alguien limpia los efectos. En Nueva York, eso es: startups de IA responsable, consultoría de transformación humana, equipos de product que ponen gente antes que métricas. Y esos lugares te buscan a personas como tú.'
                  : 'Your real market is where AI and humanity are designed together—not where AI automates and someone cleans up the effects. In New York, that\'s: responsible AI startups, human-centered transformation consulting, product teams that put people before metrics. And those places are actively looking for people like you.',
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
              title={isEs ? 'Consultora independiente: arquitectura responsable de sistemas (30 clientes/año)' : 'Independent consultant: responsible systems architecture (30 clients/year)'}
              tiempo={isEs ? '3–6 meses para primeros 5 clientes de $5K+' : '3–6 months to first 5 clients at $5K+'}
              costo={isEs ? '$0 inversión · tarifa NYC $150–250 USD/hr = $30–50K/proyecto' : '$0 investment · NYC rate $150–250 USD/hr = $30–50K/project'}
              paso={isEs ? 'Esta semana: crear un case study de un sistema que diseñaste y lo que pasó después. Ponlo en tu portfolio.' : 'This week: document one system you architected and what happened after. Put it in your portfolio.'} />
            <RutaCard num={2}
              title={isEs ? 'Líder de Producto en startup de IA responsable (Serie A)' : 'VP Product at responsible AI startup (Series A)'}
              tiempo={isEs ? '2–3 meses de búsqueda' : '2–3 months of active search'}
              costo={isEs ? '$0 · tu expertise es exactamente lo que buscan' : '$0 · your expertise is exactly what they need'}
              paso={isEs ? 'Crear perfil en Wellfound, pero con enfoque en "responsible AI" y "human-centered product". Aplicar a 3 startups de IA ética esta semana.' : 'Create Wellfound profile with "responsible AI" and "human-centered product" focus. Apply to 3 ethical AI startups this week.'} />
            <RutaCard num={3}
              title={isEs ? 'Documentar tu método: Framework de Arquitectura Humana de Sistemas' : 'Document your method: Human Systems Architecture Framework'}
              tiempo={isEs ? '6–8 semanas · tu expertise se vuelve portable' : '6–8 weeks · your expertise becomes portable'}
              costo={isEs ? '$500–1000 para diseño + hosting' : '$500–1000 for design + hosting'}
              paso={isEs ? 'Esta semana: escribe una guía de 2 páginas sobre cómo diseñas un sistema pensando en la gente. Comparte con un cliente existente para que la valide.' : 'This week: write a 2-page guide about how you design systems with people in mind. Share with one existing client to validate.'} />
            <RutaCard num={4}
              title={isEs ? 'Hablar públicamente: "Arquitectura Humana de Sistemas" en conferencias de NYC' : 'Speaking: "Human Systems Architecture" at NYC tech conferences'}
              tiempo={isEs ? '2–3 talks en 6 meses = 500+ personas viendo tu nombre' : '2–3 talks in 6 months = 500+ people seeing your name'}
              costo={isEs ? '$0 · solo preparación' : '$0 · preparation only'}
              paso={isEs ? 'Esta semana: aplicar a 3 conferencias (Open Source Summit, ThoughtWorks, AI NYC) como speaker. Tu título: "20 años diseñando para la gente: cómo la IA cambió el trabajo".' : 'This week: apply to 3 conferences (Open Source Summit, ThoughtWorks, AI NYC) as a speaker. Your title: "20 years designing for people: how AI changed the work".'} />
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
