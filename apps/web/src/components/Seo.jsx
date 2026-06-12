import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const SITE_URL = 'https://aksha.life';

// Metadatos comunes a todas las rutas: canonical único por ruta (sin
// query/hash) y atributo lang sincronizado con el idioma activo. Los og:*
// viven estáticos en index.html porque los scrapers sociales no ejecutan JS.
// Cada página sigue definiendo su <title> y description en su propio Helmet,
// que react-helmet fusiona sobre este.
const Seo = () => {
  const { pathname } = useLocation();
  const { lang } = useLanguage();

  const canonical = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;

  return (
    <Helmet>
      <html lang={lang} />
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
};

export default Seo;
