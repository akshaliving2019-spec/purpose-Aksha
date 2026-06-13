
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { pocketbaseClient as pb } from '@/lib/pocketbaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PurposeCard from '@/components/PurposeCard.jsx';
import CareerRoadmapCard from '@/components/CareerRoadmapCard.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { Target, Trash2, Calendar, Flame, Fingerprint, Star, Heart, Network } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const pillarsEN = [
  {
    icon: Flame,
    title: 'What Keeps You Going',
    description: 'What keeps you moving when everything changes? The ones who survive disruption are the strongest — they are the ones who know exactly why they get up.',
  },
  {
    icon: Fingerprint,
    title: 'What Lights You Up',
    description: 'There is something you do so naturally you barely count it as a talent. It is usually where you have helped others most without noticing.',
  },
  {
    icon: Star,
    title: 'What You Do Best',
    description: 'Your greatest advantage may not be what you have learned. It may be what comes naturally to you when you stop trying to be someone else.',
  },
  {
    icon: Heart,
    title: 'What The World Needs',
    description: 'Behind every meaningful achievement in your life, there was something that mattered more than the result. That deeper motivation does not disappear. It becomes clearer with time.',
  },
  {
    icon: Network,
    title: 'Where Everything Connects',
    description: 'The things that move you deeply are not random. They point toward the place where your strengths, purpose, and contribution become one.',
  },
  {
    icon: Calendar,
    title: 'Your 4-Week Journey',
    description: 'Your report is only the beginning. Receive four weeks of guidance, reflections, and micro-actions designed around what your profile needs most.',
  },
];

const pillarsES = [
  {
    icon: Flame,
    title: 'Lo Que Te Mantiene En Pie',
    description: '¿Qué te mantiene en movimiento cuando todo cambia? Los que sobreviven a la disrupción no son los más fuertes — son los que saben exactamente por qué se levantan.',
  },
  {
    icon: Fingerprint,
    title: 'Lo Que Te Enciende',
    description: 'Hay algo que haces con tanta naturalidad que apenas lo cuentas como talento. Suele ser donde más has ayudado a otros sin darte cuenta.',
  },
  {
    icon: Star,
    title: 'Lo Que Mejor Haces',
    description: 'Tu mayor ventaja puede no ser lo que has aprendido. Puede ser lo que te sale natural cuando dejas de intentar ser otra persona.',
  },
  {
    icon: Heart,
    title: 'Lo Que El Mundo Necesita',
    description: 'Detrás de cada logro significativo de tu vida hubo algo que importaba más que el resultado. Esa motivación profunda no desaparece. Se vuelve más clara con el tiempo.',
  },
  {
    icon: Network,
    title: 'Donde Todo Se Conecta',
    description: 'Las cosas que te mueven profundamente no son aleatorias. Apuntan hacia el lugar donde tus fortalezas, propósito y contribución se vuelven uno.',
  },
  {
    icon: Calendar,
    title: 'Tu Viaje de 4 Semanas',
    description: 'Tu reporte es solo el comienzo. Recibe cuatro semanas de guía, reflexiones y microacciones diseñadas alrededor de lo que tu perfil más necesita.',
  },
];

const roadmapEN = [
  {
    title: 'Develop Creative Skills',
    timeline: 'Next 3 months',
    priority: 'high',
    actions: [
      'Enroll in advanced design thinking course',
      'Build portfolio of creative projects',
      'Join creative community groups',
    ],
  },
  {
    title: 'Build Technical Foundation',
    timeline: '3-6 months',
    priority: 'medium',
    actions: [
      'Learn AI collaboration tools',
      'Complete data analysis certification',
      'Practice with real-world datasets',
    ],
  },
  {
    title: 'Network and Mentor',
    timeline: '6-12 months',
    priority: 'medium',
    actions: [
      'Attend industry conferences',
      'Find a mentor in your field',
      'Start mentoring others',
    ],
  },
];

const roadmapES = [
  {
    title: 'Desarrolla Habilidades Creativas',
    timeline: 'Próximos 3 meses',
    priority: 'high',
    actions: [
      'Inscríbete en un curso avanzado de design thinking',
      'Construye un portafolio de proyectos creativos',
      'Únete a comunidades creativas',
    ],
  },
  {
    title: 'Construye una Base Técnica',
    timeline: '3-6 meses',
    priority: 'medium',
    actions: [
      'Aprende herramientas de colaboración con IA',
      'Completa una certificación en análisis de datos',
      'Practica con datos del mundo real',
    ],
  },
  {
    title: 'Red de Contactos y Mentoría',
    timeline: '6-12 meses',
    priority: 'medium',
    actions: [
      'Asiste a conferencias del sector',
      'Encuentra un mentor en tu campo',
      'Empieza a ser mentor de otros',
    ],
  },
];

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { t, lang } = useLanguage();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, [currentUser]);

  const loadProfiles = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const records = await pb.collection('userProfiles').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setProfiles(records);
    } catch (err) {
      toast.error(err.message || t.dashboard.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.dashboard.confirmDelete)) {
      return;
    }

    try {
      await pb.collection('userProfiles').delete(id, { $autoCancel: false });
      setProfiles(profiles.filter(p => p.id !== id));
      toast.success(t.dashboard.deleted);
    } catch (err) {
      toast.error(err.message || t.dashboard.deleteFailed);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const mockPillars = lang === 'es' ? pillarsES : pillarsEN;
  const mockRoadmap = lang === 'es' ? roadmapES : roadmapEN;

  return (
    <>
      <Helmet>
        <title>{t.dashboard.metaTitle}</title>
        <meta name="description" content={t.dashboard.metaDesc} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                {t.dashboard.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-prose">
                {t.dashboard.subtitle}
              </p>
            </div>

            {profiles.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <div className="flex justify-center mb-4">
                    <Target className="w-16 h-16 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{t.dashboard.emptyTitle}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t.dashboard.emptyText}
                  </p>
                  <Button onClick={() => window.location.href = '/discover'} className="hover:shadow-lg hover:shadow-primary/20">
                    {t.dashboard.emptyBtn}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-2 leading-snug text-foreground">
                    {t.dashboard.revealsTitle}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                    {t.dashboard.revealsSubtitle}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockPillars.map((pillar, index) => (
                      <PurposeCard key={index} {...pillar} index={index} />
                    ))}
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-snug text-foreground">
                    {t.dashboard.roadmapTitle}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockRoadmap.map((item, index) => (
                      <CareerRoadmapCard key={index} {...item} index={index} />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-snug text-foreground">
                    {t.dashboard.savedTitle}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profiles.map((profile, index) => (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="border-border/50 hover:border-primary/50 transition-colors h-full flex flex-col">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-foreground">{profile.birthPlace}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  {profile.birthDate}
                                  {profile.birthTime && ` ${t.dashboard.atTime} ${profile.birthTime}`}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(profile.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="mt-auto pt-4">
                            <p className="text-sm text-muted-foreground">
                              {t.dashboard.created} {new Date(profile.created).toLocaleDateString(lang === 'es' ? 'es' : 'en')}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
