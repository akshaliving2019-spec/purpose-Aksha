import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Button } from '@/components/ui/button';
import { User, LogOut, Menu, X } from 'lucide-react';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t.nav.home },
    { path: '/science', label: t.nav.science },
    { path: '/sample-analysis', label: t.nav.sampleAnalysis },
    { path: '/pricing', label: t.nav.pricing },
    { path: '/discover', label: t.nav.discover },
    { path: '/why-we-exist', label: t.nav.whyWeExist },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex py-4 md:py-6 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <img
              src="https://horizons-cdn.hostinger.com/3b1220b8-90b4-4363-97a3-2c8f1d706937/a66a354821956cff37d05e5c46b27d1b.png"
              alt="AKSHA Logo"
              className="w-[40px] md:w-[50px] h-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ path, label }) => (
              <Link key={path} to={path}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(path) ? 'text-primary' : 'text-foreground/80'}`}>
                {label}
              </Link>
            ))}
            {currentUser && (
              <Link to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/dashboard') ? 'text-primary' : 'text-foreground/80'}`}>
                {t.nav.dashboard}
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button onClick={toggleLang}
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-200 hover:border-primary/60 hover:text-primary"
              style={{ borderColor: 'rgba(212,175,55,0.3)', color: 'rgba(212,175,55,0.8)' }}>
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
                <Link to="/checkout" className="hidden md:inline-block">
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
                <Button variant="ghost" size="sm" onClick={logout}
                  className="transition-all duration-200 active:scale-[0.98] hover:text-primary hover:bg-primary/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline-block">{t.nav.logout}</span>
                </Button>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-primary/10"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" style={{ color: 'rgba(212,175,55,0.8)' }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: 'rgba(212,175,55,0.15)', backgroundColor: 'rgba(7,14,35,0.98)' }}>
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ path, label }) => (
              <Link key={path} to={path}
                onClick={() => setMenuOpen(false)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${isActive(path) ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-primary hover:bg-primary/5'}`}>
                {label}
              </Link>
            ))}
            {currentUser && (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-primary hover:bg-primary/5'}`}>
                {t.nav.dashboard}
              </Link>
            )}
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
              <Link to="/checkout" onClick={() => setMenuOpen(false)}>
                <Button className="w-full font-bold">
                  {t.nav.getReport}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
