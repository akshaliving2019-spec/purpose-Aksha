
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img 
                src="https://horizons-cdn.hostinger.com/3b1220b8-90b4-4363-97a3-2c8f1d706937/59d9dbf7e952f6b63f78ee82c7a83d1e.png" 
                alt="AKSHA Logo" 
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-md">
              Discover your Human Blueprint in an AI-driven world. AKSHA transforms birth data into insights about your Energy, Strengths, Gifts, and Impact.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-6">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/science" className="hover:text-primary transition-colors">
                  The Science
                </Link>
              </li>
              <li>
                <Link to="/sample-analysis" className="hover:text-primary transition-colors">
                  Sample Analysis
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-primary transition-colors">
                  Discover
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-6">Contact & Legal</h3>
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
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-primary transition-colors block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} aksha.life. All rights reserved.</p>
          <p className="text-muted-foreground/60">Illuminating human potential in the digital age</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
