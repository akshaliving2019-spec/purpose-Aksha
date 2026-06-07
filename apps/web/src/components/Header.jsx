import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t.nav.home },
    { path: '/science', label: t.nav.science },
    { path: '/sample-analysis', label: t.nav.sampleAnalysis },
    { path: '/pricing', label: t.nav.pricing },
    { path: '/discover', label: t.nav.discover },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex py-4 md:py-6 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://horizons-cdn.hostinger.com/3b1220b8-90b4-4363-97a3-2c8f1d706937/a66a354821956cff37d05e5c46b27d1b.png"
              alt="AKSHA Logo"
              className="w-[40px] md:w-[50px] h-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(path) ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {label}
              </Link>
            ))}
            {currentUser && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/dashboard') ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {t.nav.dashboard}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">

            {/* Language toggle EN/ES */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-200 hover:border-primary/60 hover:text-primary"
              style={{ borderColor: 'rgba(212,175,55,0.3)', color: 'rgba(212,175,55,0.8)' }}
              title={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
            >
              <span>{lang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
              <span>{lang === 'en' ? 'EN' : 'ES'}</span>
              <span className="text-white/30">|</span>
              <span className="text-white/40">{lang === 'en' ? 'ES' : 'EN'}</span>
            </button>

            {!currentUser ? (
              <>
                <Link to="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="sm" className="transition-all duration-200 active:scale-[0.98]">
                    {t.nav.getReport}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-foreground/80">
                  <User className="w-4 h-4 text-primary" />
                  <span>{currentUser.name || currentUser.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="transition-all duration-200 active:scale-[0.98] hover:text-primary hover:bg-primary/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline-block">{t.nav.logout}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
