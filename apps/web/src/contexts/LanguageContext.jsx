import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const translations = {
  en: {
    // Navigation
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
    // Home page
    home: {
      heroTitle: 'The Purpose of Your Life',
      heroSubtitle: 'While AI transforms everything, AKSHA reveals the one thing it cannot replace — who you uniquely are.',
      discoverBtn: 'Discover Your Purpose',
      scienceBtn: 'The Science Behind AKSHA',
      whatAkshaTitle: 'What AKSHA does',
      whatAkshaSubtitle: 'AKSHA acts as a mirror for your highest potential. By analyzing your unique temporal coordinates, we translate complex energetic patterns into clear, actionable life guidance.',
      revealsTitle: 'Reveals Your Authentic Path',
      revealsText: 'We cut through societal conditioning and familial expectations to reveal what you were genuinely designed to do. AKSHA helps you pivot from surviving to thriving by identifying the exact arenas where your natural gifts shine.',
      translatesTitle: 'Translates Insight into Action',
      translatesText: 'Insight without action is merely entertainment. AKSHA bridges the gap between deep self-awareness and practical reality, providing you with a structured roadmap to align your career and relationships with your true purpose.',
      ctaTitle: 'Discover Your',
      ctaHighlight: 'Human Blueprint',
      ctaSubtitle: 'Transform your birth data into practical insights about your Energy, Strengths, Gifts, and Impact.',
      ctaBtn: 'Generate My Purpose Profile',
    },
  },
  es: {
    // Navegación
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
    // Página de inicio
    home: {
      heroTitle: 'El Propósito de Tu Vida',
      heroSubtitle: 'Mientras la IA transforma todo, AKSHA revela lo único que no puede reemplazar — quién eres tú de manera única.',
      discoverBtn: 'Descubre Tu Propósito',
      scienceBtn: 'La Ciencia detrás de AKSHA',
      whatAkshaTitle: 'Qué hace AKSHA',
      whatAkshaSubtitle: 'AKSHA actúa como un espejo de tu máximo potencial. Al analizar tus coordenadas temporales únicas, traducimos patrones energéticos complejos en orientación de vida clara y accionable.',
      revealsTitle: 'Revela Tu Camino Auténtico',
      revealsText: 'Atravesamos el condicionamiento social y las expectativas familiares para revelar para qué fuiste genuinamente diseñado. AKSHA te ayuda a pasar de sobrevivir a prosperar, identificando las áreas exactas donde brillan tus dones naturales.',
      translatesTitle: 'Transforma el Conocimiento en Acción',
      translatesText: 'El conocimiento sin acción es simplemente entretenimiento. AKSHA cierra la brecha entre la autoconciencia profunda y la realidad práctica, brindándote una hoja de ruta estructurada para alinear tu carrera y relaciones con tu verdadero propósito.',
      ctaTitle: 'Descubre Tu',
      ctaHighlight: 'Mapa Humano',
      ctaSubtitle: 'Transforma tu fecha de nacimiento en conocimientos prácticos sobre tu Energía, Fortalezas, Dones e Impacto.',
      ctaBtn: 'Generar Mi Perfil de Propósito',
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
