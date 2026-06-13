
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img
                src="/aksha-logo-mark.png"
                alt="AKSHA Logo"
                width="200"
                height="200"
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-md">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-6">{t.footer.explore}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  {t.footer.home}
                </Link>
              </li>
              <li>
                <Link to="/science" className="hover:text-primary transition-colors">
                  {t.footer.science}
                </Link>
              </li>
              <li>
                <Link to="/sample-analysis" className="hover:text-primary transition-colors">
                  {t.footer.sampleAnalysis}
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-primary transition-colors">
                  {t.footer.discover}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-6">{t.footer.contactLegal}</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="mailto:purpose@aksha.life" className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-primary/70" />
                  purpose@aksha.life
                </a>
              </li>
              <li>
                <a href="https://aksha.life" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Globe className="w-4 h-4 text-primary/70" />
                  aksha.life
                </a>
              </li>
              <li className="pt-4 mt-4 border-t border-border">
                <Link to="/privacy" className="hover:text-primary transition-colors block mb-2">
                  {t.footer.privacy}
                </Link>
                <Link to="/terms" className="hover:text-primary transition-colors block">
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} aksha.life. {t.footer.rights}</p>
          <p className="text-muted-foreground/60">{t.footer.motto}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
