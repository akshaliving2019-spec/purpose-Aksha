
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
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

        {/* THE HUMAN CHALLENGE SECTION */}
        <section className="py-24 bg-background border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-foreground leading-tight text-balance">
                  The human challenge in the age of AI
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    We are standing at the threshold of the greatest technological shift in human history. As artificial intelligence rapidly masters logic, calculation, and execution, the skills that once guaranteed a secure career are becoming commoditized overnight.
                  </p>
                  <p>
                    This profound transition is creating a crisis of meaning for millions. When a machine can do your job faster and more efficiently, what is left for you? The answer lies not in competing with machines on efficiency, but in leaning into what makes you fundamentally irreplaceable.
                  </p>
                  <p>
                    Your humanity, your nuanced lived experience, and your unique energetic blueprint are the only assets that cannot be replicated by an algorithm. The challenge of this era is no longer just finding a job—it is discovering your true vocation.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col items-center justify-center text-center mt-12 lg:mt-0"
              >
                <img 
                  src="https://horizons-cdn.hostinger.com/3b1220b8-90b4-4363-97a3-2c8f1d706937/193aeeb3e72e575f992bc83eb9d6715a.png" 
                  alt="Human Fingerprint" 
                  className="w-[456px] h-[456px] object-contain mb-8"
                />
                <h3 className="text-4xl font-bold text-primary mb-4">
                  Reveal Your Human Fingerprint
                </h3>
                <p className="text-xl text-foreground mb-8">
                  AI can replicate skills. It cannot replicate who you are.
                </p>
                <Link to="/discover">
                  <Button size="lg" className="text-lg px-8 py-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                    Discover Your Blueprint
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

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

        {/* BUILT ON DECADES OF HUMAN UNDERSTANDING SECTION */}
        <section className="w-full bg-background pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-col items-center gap-12"
          >
            <img 
              src="https://horizons-cdn.hostinger.com/3b1220b8-90b4-4363-97a3-2c8f1d706937/d4472caf462d8f74a31f2eef33a2c977.png" 
              alt="Built on Decades of Human Understanding - Discover Your Life Purpose" 
              className="w-full h-auto block"
            />
            
            <Link 
              to="/discover" 
              className="flex items-center justify-center w-[360px] h-[64px] bg-[#D4AF37] text-[#07142F] font-[700] text-[18px] rounded-[14px] shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:scale-[1.02] transition-all duration-300"
            >
              START YOUR JOURNEY →
            </Link>
          </motion.div>
        </section>

        {/* YOUR PURPOSE PROFILE INCLUDES SECTION */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-16 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-balance">
                Your Purpose Profile includes
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
                A comprehensive, highly personalized dossier detailing every facet of your innate potential.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileIncludes.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="h-full border-border/40 bg-card hover:border-primary/40 transition-colors">
                      <CardHeader>
                        <Icon className="w-8 h-8 text-primary mb-4" />
                        <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-muted-foreground">
                          {item.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* WHY BIRTH DATA MATTERS SECTION */}
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
                  Why birth data matters
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="prose prose-lg prose-invert max-w-none text-muted-foreground"
              >
                <p className="mb-6 leading-relaxed">
                  For millennia, diverse cultures across the globe have understood that time is not merely a linear progression, but a cycle of recurring qualities. The exact moment and location of your birth is more than just historical data; it is a highly specific coordinate in space and time that captures the energetic signature of your beginning.
                </p>
                <p className="mb-6 leading-relaxed">
                  Modern chronobiology and epigenetic studies are increasingly revealing how early environmental factors influence lifelong development. Similarly, the ancient systems utilized by AKSHA track macro-patterns of human personality and societal roles. By mapping your specific temporal coordinates against these proven archetypal frameworks, we can extract incredibly precise insights about your inherent nature.
                </p>
                <p className="leading-relaxed">
                  We don't ask for this data to predict the future. We use it to decode your structural foundation. Just as a seed contains the entire blueprint of the tree it will become, your birth data holds the codified map of your highest potential. AKSHA translates this map into a language you can use today.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* START YOUR ANALYSIS CTA */}
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
                Ready to discover what makes you <span className="text-primary">irreplaceable</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed text-balance">
                Join thousands who have found profound clarity, fierce direction, and unshakeable purpose in the digital age.
              </p>
              <Link to="/discover">
                <Button size="lg" className="text-lg px-10 py-7 transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,168,75,0.3)] active:scale-[0.98]">
                  Start Your Analysis
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
