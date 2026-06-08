
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Activity, Layers, Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const methodologiesES = [
  {
    icon: Layers,
    title: 'Arquetipos de Personalidad',
    description: 'Nos basamos en modelos psicológicos bien establecidos para mapear las estructuras fundamentales de tu carácter. Al comprender tu arquetipo central, podemos predecir cómo interactúas naturalmente con el mundo, resuelves problemas y encuentras plenitud.',
  },
  {
    icon: Activity,
    title: 'Ciclos y Ritmos de Vida',
    description: 'El desarrollo humano no es lineal; opera en ciclos. Nuestro sistema calcula en qué punto de tu línea de tiempo de desarrollo te encuentras actualmente, ayudándote a alinear tus transiciones de carrera y decisiones de vida con tus períodos naturales de crecimiento e introspección.',
  },
  {
    icon: Compass,
    title: 'Patrones de Desarrollo',
    description: 'Al analizar hitos clave del desarrollo, mapeamos la trayectoria de tu crecimiento. Esto ayuda a identificar las habilidades que estás naturalmente programado para dominar y el valor único que puedes ofrecer en un mundo cada vez más automatizado.',
  },
  {
    icon: Brain,
    title: 'Psicología de los Cinco Grandes',
    description: 'Integrando principios de los Cinco Grandes rasgos de personalidad (Apertura, Responsabilidad, Extraversión, Amabilidad y Neuroticismo), proporcionamos una base científicamente fundamentada para entender tu estilo de trabajo, respuestas al estrés y dinámica de equipo.',
  },
  {
    icon: Sparkles,
    title: 'Marco Junguiano',
    description: 'Enraizado en la psicología analítica de Carl Jung, exploramos los impulsores más profundos, a menudo inconscientes, de tu comportamiento. Este marco ayuda a descubrir tu verdadera vocación, separando las expectativas sociales de tus motivaciones auténticas e intrínsecas.',
  }
];

const methodologiesEN = [
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

const SciencePage = () => {
  const { lang } = useLanguage();
  const methodologies = lang === 'es' ? methodologiesES : methodologiesEN;

  return (
    <>
      <Helmet>
        <title>{lang === 'es' ? 'La Ciencia detrás de AKSHA — Metodología' : 'The Science Behind AKSHA - Methodology'}</title>
        <meta name="description" content={lang === 'es'
          ? 'Descubre los marcos psicológicos y metodologías científicas que impulsan el motor de descubrimiento de propósito de AKSHA.'
          : 'Discover the psychological frameworks and scientific methodologies powering AKSHA\'s purpose discovery engine.'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center mb-20"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                {lang === 'es'
                  ? <>{`La Ciencia del `}<span className="text-primary">Propósito</span></>
                  : <>{'The Science of '}<span className="text-primary">Purpose</span></>
                }
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {lang === 'es'
                  ? 'AKSHA combina marcos psicológicos establecidos con teorías avanzadas del desarrollo para crear un mapa holístico y altamente preciso de tu potencial innato.'
                  : 'AKSHA combines established psychological frameworks with advanced developmental theories to create a holistic, highly accurate map of your innate potential.'
                }
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
