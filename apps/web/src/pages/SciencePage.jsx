
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Activity, Layers, Compass } from 'lucide-react';

const SciencePage = () => {
  const methodologies = [
    {
      icon: Layers,
      title: 'Personality Archetypes',
      description: 'We draw upon well-established psychological models to map out the foundational structures of your character. By understanding your core archetype, we can predict how you naturally interact with the world, solve problems, and find fulfillment.',
    },
    {
      icon: Activity,
      title: 'Life Cycles & Rhythms',
      description: 'Human development isn\'t linear; it operates in cycles. Our system calculates where you currently stand in your developmental timeline, helping you align your career transitions and life choices with your natural periods of growth and introspection.',
    },
    {
      icon: Compass,
      title: 'Developmental Patterns',
      description: 'By analyzing key developmental milestones, we map the trajectory of your growth. This helps identify the skills you are naturally wired to master and the unique value you can offer in an increasingly automated world.',
    },
    {
      icon: Brain,
      title: 'Big Five Psychology',
      description: 'Integrating principles from the Big Five personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism), we provide a scientifically grounded baseline to understand your working style, stress responses, and team dynamics.',
    },
    {
      icon: Sparkles,
      title: 'Jungian Framework',
      description: 'Rooted in Carl Jung\'s analytical psychology, we explore the deeper, often unconscious drivers of your behavior. This framework helps uncover your true calling, separating societal expectations from your authentic, intrinsic motivations.',
    }
  ];

  return (
    <>
      <Helmet>
        <title>The Science Behind AKSHA - Methodology</title>
        <meta name="description" content="Discover the psychological frameworks and scientific methodologies powering AKSHA's purpose discovery engine." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="py-24 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center mb-20"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                The Science of <span className="text-primary">Purpose</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                AKSHA combines established psychological frameworks with advanced developmental theories to create a holistic, highly accurate map of your innate potential.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-8">
              {methodologies.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-colors duration-300">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-8 md:w-1/4 flex flex-col items-center justify-center bg-muted/30 border-b md:border-b-0 md:border-r border-border/50">
                          <div className="p-4 rounded-full bg-primary/10 border border-primary/20 mb-4">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                        </div>
                        <div className="p-8 md:w-3/4">
                          <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-2xl text-foreground">{method.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <p className="text-muted-foreground leading-relaxed">
                              {method.description}
                            </p>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SciencePage;
