
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { pocketbaseClient as pb } from '@/lib/pocketbaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PurposeCard from '@/components/PurposeCard.jsx';
import CareerRoadmapCard from '@/components/CareerRoadmapCard.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { Target, Trash2, Calendar, Flame, Fingerprint, Star, Heart, Network } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { currentUser } = useAuth();
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
      toast.error(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      await pb.collection('userProfiles').delete(id, { $autoCancel: false });
      setProfiles(profiles.filter(p => p.id !== id));
      toast.success('Profile deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete profile');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const mockPillars = [
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

  const mockRoadmap = [
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

  return (
    <>
      <Helmet>
        <title>Dashboard - AKSHA</title>
        <meta name="description" content="View your purpose profile, career roadmap, and personalized insights." />
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
                Your Purpose Dashboard
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-prose">
                Track your journey and explore personalized insights
              </p>
            </div>

            {profiles.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <div className="flex justify-center mb-4">
                    <Target className="w-16 h-16 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">No profiles yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your discovery journey to create your first purpose profile
                  </p>
                  <Button onClick={() => window.location.href = '/discover'} className="hover:shadow-lg hover:shadow-primary/20">
                    Discover Your Purpose
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-2 leading-snug text-foreground">
                    What Your Map Reveals About You
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                    A comprehensive, highly personalized dossier detailing every facet of your innate potential.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockPillars.map((pillar, index) => (
                      <PurposeCard key={index} {...pillar} index={index} />
                    ))}
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-snug text-foreground">
                    Your Career Roadmap
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockRoadmap.map((item, index) => (
                      <CareerRoadmapCard key={index} {...item} index={index} />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-snug text-foreground">
                    Saved Profiles
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
                                  {profile.birthTime && ` at ${profile.birthTime}`}
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
                              Created {new Date(profile.created).toLocaleDateString()}
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
