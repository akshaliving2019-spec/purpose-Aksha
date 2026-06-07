
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import HumanBlueprintDiagram from '@/components/HumanBlueprintDiagram';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Compass, Sparkles, Fingerprint, Layers, Target, Users, Map, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const profileIncludes = [
    {
      icon: Compass,
      title: 'Core Vocation',
      description: 'The fundamental drive and overarching mission that brings sustained meaning to your life.'
    },
    {
      icon: Fingerprint,
      title: 'Natural Talents',
      description: 'Inherent skills and cognitive advantages that require less effort for you than others.'
    },
    {
      icon: Shield,
      title: 'Shadow Traits',
      description: 'Hidden challenges and psychological blind spots that, once integrated, become your greatest strengths.'
    },
    {
      icon: Map,
      title: 'Career Roadmap',
      description: 'Actionable steps to align your current professional trajectory with your authentic purpose.'
    },
    {
      icon: Users,
      title: 'Relational Dynamics',
      description: 'How your unique energy interacts with others, highlighting ideal collaborators and partners.'
    },
    {
      icon: Layers,
      title: 'Optimal Environments',
      description: 'The specific cultural, physical, and organizational settings where you naturally thrive.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>AKSHA - Discover Your Unique Purpose</title>
        <meta name="description" content="While AI transforms everything, AKSHA reveals the one thing it cannot replace — who you uniquely are. Discover your purpose in an AI-driven economy." />
      </Helmet>

      <div className="bg-background flex flex-col min-h-screen">

        {/* HERO SECTION */}
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-5xl mx-auto"
          >
            <div className="flex justify-center mb-[40px]">
              <img 
                src="https://horizons-cdn.hostinger.com/3b1220b8-90b4-4363-97a3-2c8f1d706937/6b15f23e170eb99dcdc5ea015f4e0729.png" 
                alt="AKSHA Logo" 
                className="w-[100px] md:w-[120px] h-auto object-contain filter drop-shadow-[0_0_15px_rgba(200,168,75,0.4)]"
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-[30px] leading-tight text-foreground text-balance" style={{ letterSpacing: '-0.02em' }}>
              The Purpose of Your Life
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-[40px] leading-relaxed max-w-3xl mx-auto text-balance">
              While AI transforms everything, AKSHA reveals the one thing it cannot replace — who you uniquely are.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto">
              <Link to="/discover" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-lg px-8 py-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                  Discover Your Purpose
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/science" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-lg px-8 py-6 border-primary/50 text-primary hover:bg-primary/10 transition-all duration-300 active:scale-[0.98]">
                  The Science Behind AKSHA
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* HUMAN BLUEPRINT INTERACTIVE DIAGRAM */}
        <HumanBlueprintDiagram />

        {/* WHAT AKSHA DOES SECTION */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-balance">
                What AKSHA does
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AKSHA acts as a mirror for your highest potential. By analyzing your unique temporal coordinates, we translate complex energetic patterns into clear, actionable life guidance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full border-border/50 bg-card hover:border-primary/30 transition-colors p-8">
                  <Target className="w-12 h-12 text-primary mb-6" />
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Reveals Your Authentic Path</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We cut through societal conditioning and familial expectations to reveal what you were genuinely designed to do. AKSHA helps you pivot from surviving to thriving by identifying the exact arenas where your natural gifts shine.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full border-border/50 bg-card hover:border-primary/30 transition-colors p-8">
                  <Sparkles className="w-12 h-12 text-primary mb-6" />
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Translates Insight into Action</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Insight without action is merely entertainment. AKSHA bridges the gap between deep self-awareness and practical reality, providing you with a structured roadmap to align your career and relationships with your true purpose.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WHAT YOUR MAP REVEALS SECTION */}
        <section className="w-full bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full flex justify-center px-4 md:px-8 py-8"
          >
            <img
              src="/lo-que-el-mapa-revela.jpg"
              alt="Lo que el mapa revela acerca de ti"
              className="w-full max-w-[88%] h-auto block rounded-xl"
            />
          </motion.div>
        </section>

        {/* YOUR PURPOSE PROFILE SECTION */}
        <section className="py-24 bg-muted/30 border-t border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-balance">
                  Your Purpose Profile
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  AKSHA uses your birth date, time, and location as temporal coordinates. Using precise astronomical calculations and integrating decades of research in psychology, archetypal studies, and human motivation, AKSHA transforms complex data into practical personal insights.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-4 italic">
                  Birth data is used as a temporal reference point, not as a prediction system.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {[
                  { label: 'Energy', desc: 'What naturally drives you. The activities, environments and experiences that activate your motivation and vitality.' },
                  { label: 'Strengths', desc: 'What you consistently do well. The abilities that repeatedly produce reliable results.' },
                  { label: 'Gift', desc: 'What comes naturally to you. Unique talents and cognitive patterns that can be refined and developed.' },
                  { label: 'Impact', desc: 'Where your contribution matters. The areas where your abilities create meaningful value for others.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="rounded-xl border-2 border-primary/40 bg-card p-6 flex flex-col gap-3 hover:border-primary transition-colors duration-300"
                  >
                    <span className="text-primary font-bold text-lg">{item.label}</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 p-5 rounded-lg border border-primary/20 bg-primary/5 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-semibold">Don't know your birth time?</span> No problem. You can still receive your Purpose Profile. Birth time improves precision of certain dimensions, but it is not required to begin your journey.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* DISCOVER YOUR HUMAN BLUEPRINT CTA */}
        <section className="py-32 bg-background relative overflow-hidden border-t border-border/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground text-balance" style={{ letterSpacing: '-0.02em' }}>
                Discover Your <span className="text-primary">Human Blueprint</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed text-balance">
                Transform your birth data into practical insights about your Energy, Strengths, Gifts, and Impact.
              </p>
              <Link to="/discover">
                <Button size="lg" className="text-lg px-10 py-7 transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                  Generate My Purpose Profile
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
};

export default HomePage;
