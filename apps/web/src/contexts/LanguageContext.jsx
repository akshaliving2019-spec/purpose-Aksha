import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const translations = {
  en: {
    nav: {
      home: 'Home',
      science: 'Science',
      sampleAnalysis: 'Sample Analysis',
      pricing: 'Pricing',
      discover: 'Discover',
      login: 'Login',
      getReport: 'Get Your Report',
      logout: 'Logout',
      dashboard: 'Dashboard',
      whyWeExist: 'Why We Exist',
    },
    home: {
      heroTitle: 'The Purpose of Your Life',
      heroSubtitle: 'While AI transforms everything, AKSHA LIFE reveals the one thing it cannot replace — who you uniquely are.',
      discoverBtn: 'Discover Your Purpose',
      scienceBtn: 'The Science Behind AKSHA LIFE',
      whatAkshaTitle: 'What AKSHA LIFE does for you',
      whatAkshaSubtitle: 'Neuroscience. Psychology. Archetypes. Chronobiology.\nAll synthesized around one person: you.',
      revealsTitle: 'Find Out Who You Really Are',
      revealsText: 'Most people spend years figuring out what they\'re naturally built for. You don\'t have to. AKSHA LIFE maps your unique strengths, energy and purpose — and gives you a clear action plan for what\'s next.',
      translatesTitle: 'Stop Guessing. Start Moving.',
      translatesText: 'What if you woke up Monday knowing exactly where to focus your energy? AKSHA LIFE gives you a personalized map of your natural strengths and purpose — so you stop guessing and start moving.',
      ctaTitle: 'Find Out Who',
      ctaHighlight: 'You Really Are',
      ctaSubtitle: 'Enter your birth date. Get a clear map of your natural talents, strengths and purpose.\nEvery discipline studies a part of you. AKSHA LIFE synthesizes them all.',
      ctaBtn: 'Get My Purpose Map',
      reviewsTitle: 'What people discovered about themselves',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      science: 'Ciencia',
      sampleAnalysis: 'Análisis de Muestra',
      pricing: 'Precios',
      discover: 'Descubrir',
      login: 'Entrar',
      getReport: 'Obtener mi Reporte',
      logout: 'Salir',
      dashboard: 'Panel',
      whyWeExist: 'Por Qué Existimos',
    },
    home: {
      heroTitle: 'El Propósito de Tu Vida',
      heroSubtitle: 'Mientras la IA transforma todo, AKSHA LIFE revela lo único que no puede reemplazar — quién eres tú de manera única.',
      discoverBtn: 'Descubre Tu Propósito',
      scienceBtn: 'La Ciencia detrás de AKSHA LIFE',
      whatAkshaTitle: 'Lo que AKSHA LIFE hace por ti',
      whatAkshaSubtitle: 'Neurociencia. Psicología. Arquetipos. Cronobiología.\nTodo sintetizado alrededor de una sola persona: tú.',
      revealsTitle: 'Descubre Quién Eres Realmente',
      revealsText: 'La mayoría de las personas pasan años intentando descubrir para qué están naturalmente hechas. Tú no tienes que hacerlo. AKSHA LIFE mapea tus fortalezas únicas, energía y propósito — y te da un plan de acción claro para lo que sigue.',
      translatesTitle: 'Deja de Adivinar. Empieza a Moverte.',
      translatesText: '¿Y si el lunes supieras exactamente dónde enfocar tu energía? AKSHA LIFE te da un mapa personalizado de tus fortalezas y propósito natural — para que dejes de adivinar y empieces a moverte.',
      ctaTitle: 'Descubre Quién',
      ctaHighlight: 'Eres Realmente',
      ctaSubtitle: 'Introduce tu fecha de nacimiento. Recibe un mapa claro de tus talentos naturales, fortalezas y propósito.\nCada disciplina estudia una parte de ti. AKSHA LIFE las sintetiza todas.',
      ctaBtn: 'Obtener Mi Mapa de Propósito',
      reviewsTitle: 'Lo que otros descubrieron sobre sí mismos',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const toggleLang = () => setLang(prev => prev === 'en' ? 'es' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
