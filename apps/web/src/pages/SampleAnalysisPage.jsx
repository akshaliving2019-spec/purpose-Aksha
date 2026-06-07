import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Map, Target, Compass, Sparkles, Star, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const SampleAnalysisPage = () => {
  const { lang } = useLanguage();
  const isEs = lang === 'es';

  const modules = [
    {
      title: 'Passion',
      icon: Heart,
      score: 87,
      description: isEs ? 'Tus impulsos innatos y lo que te da energía.' : 'Your innate drives and what brings you energy.',
      insight: isEs
        ? 'Muestras un profundo impulso para sintetizar información compleja en narrativas comprensibles. Tu energía alcanza su punto máximo cuando facilitas el entendimiento entre grupos dispares.'
        : 'You show a profound drive for synthesizing complex information into digestible narratives. Your energy peaks when facilitating understanding between disparate groups.',
    },
    {
      title: 'Profession',
      icon: Briefcase,
      score: 92,
      description: isEs ? 'Las habilidades prácticas en las que naturalmente sobresales.' : 'The practical skills and competencies you naturally excel at.',
      insight: isEs
        ? 'Fuerte aptitud natural para el pensamiento sistémico, la planificación estratégica y el liderazgo empático. Captas naturalmente la macrovisión manteniendo la dinámica interpersonal del equipo.'
        : 'Strong natural aptitude for systems thinking, strategic planning, and empathic leadership. You naturally grasp the macro-vision while maintaining the interpersonal dynamics of a team.',
    },
    {
      title: 'Vocation',
      icon: Map,
      score: 78,
      description: isEs ? 'Cómo el mundo percibe tu valor y por qué te pueden pagar.' : 'How the world perceives your value and what you can be paid for.',
      insight: isEs
        ? 'El mercado valora enormemente tu capacidad de tender puentes entre la ejecución técnica y el diseño centrado en el ser humano. Los roles que requieren empatía profunda combinada con habilidades analíticas son tu terreno natural.'
        : 'The market highly values your ability to bridge the gap between technical execution and human-centric design. Roles requiring deep empathy paired with analytical skills are prime targets.',
    },
    {
      title: 'Mission',
      icon: Target,
      score: 85,
      description: isEs ? 'Tu impacto más amplio y tu contribución al mundo.' : 'Your broader impact and contribution to the world.',
      insight: isEs
        ? 'Tu misión apunta hacia elevar la conciencia humana a través de la tecnología o el diseño, asegurando que a medida que los sistemas se automatizan, permanezcan fundamentalmente humanos.'
        : 'Your overarching mission points toward elevating human consciousness through technology or design, ensuring that as systems become more automated, they remain fundamentally human.',
    },
  ];

  const recommendations = [
    {
      role: isEs ? 'Estratega de IA Ética' : 'Ethical AI Strategist',
      match: '94%',
      description: isEs
        ? 'Guiar a organizaciones para implementar tecnología que potencie en lugar de reemplazar el potencial humano.'
        : 'Guiding organizations to implement technology that enhances rather than replaces human potential.',
    },
    {
      role: isEs ? 'Arquitecto Organizacional' : 'Organizational Architect',
      match: '89%',
      description: isEs
        ? 'Diseñar estructuras y culturas empresariales que prioricen el florecimiento humano y la eficiencia sistémica.'
        : 'Designing company structures and cultures that prioritize human flourishing and systemic efficiency.',
    },
    {
      role: isEs ? 'Líder de Diseño Centrado en el Humano' : 'Human-Centered Design Lead',
      match: '85%',
      description: isEs
        ? 'Liderar equipos de producto para crear soluciones que resuenen profundamente con las necesidades psicológicas y emocionales humanas.'
        : 'Leading product teams to create solutions that deeply resonate with psychological and emotional human needs.',
    },
  ];

  // Reviews — fill with real data when available
  const reviews = [
    {
      name: 'M.R.',
      location: isEs ? 'Ciudad de México' : 'Mexico City',
      avatar: null, // replace with image path when available
      initials: 'MR',
      text: isEs
        ? '"El reporte describió patrones de mi vida que yo nunca había podido articular. Fue como leer algo que ya sabía pero nunca había visto escrito."'
        : '"The report described patterns in my life I had never been able to articulate. It was like reading something I already knew but had never seen written."',
      module: 'Passion · 89%',
    },
    {
      name: 'A.L.',
      location: isEs ? 'Bogotá, Colombia' : 'Bogotá, Colombia',
      avatar: null,
      initials: 'AL',
      text: isEs
        ? '"Lo que más me sorprendió fue la precisión. No era genérico. Hablaba de cómo yo específicamente proceso las decisiones bajo presión."'
        : '"What surprised me most was the precision. It wasn\'t generic. It spoke to how I specifically process decisions under pressure."',
      module: 'Profession · 91%',
    },
    {
      name: 'C.V.',
      location: isEs ? 'Miami, FL' : 'Miami, FL',
      avatar: null,
      initials: 'CV',
      text: isEs
        ? '"Llevaba años sabiendo que algo no encajaba en mi carrera. El reporte me dio el lenguaje para entender por qué — y hacia dónde moverme."'
        : '"I had known for years something didn\'t fit in my career. The report gave me the language to understand why — and which direction to move."',
      module: 'Vocation · 82%',
    },
    {
      name: 'R.M.',
      location: isEs ? 'Madrid, España' : 'Madrid, Spain',
      avatar: null,
      initials: 'RM',
      text: isEs
        ? '"La sección de Misión me dejó sin palabras. Describía exactamente el tipo de contribución que siempre sentí que debía hacer pero no sabía cómo nombrar."'
        : '"The Mission section left me speechless. It described exactly the kind of contribution I always felt I should make but didn\'t know how to name."',
      module: 'Mission · 88%',
    },
    {
      name: 'S.P.',
      location: isEs ? 'Caracas, Venezuela' : 'Caracas, Venezuela',
      avatar: null,
      initials: 'SP',
      text: isEs
        ? '"Pensé que sería otro test de personalidad. No lo es. Es algo diferente — más profundo, más personal, más útil."'
        : '"I thought it would be another personality test. It\'s not. It\'s something different — deeper, more personal, more useful."',
      module: 'Passion · 85%',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{isEs ? 'Análisis de Muestra — AKSHA' : 'Sample Analysis — AKSHA'}</title>
        <meta name="description" content={isEs
          ? 'Ve un ejemplo del Reporte de Propósito AKSHA — cómo el análisis de IA revela tu camino único.'
          : 'View a sample AKSHA Purpose Report to see how our AI-driven analysis reveals your unique path.'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">

            {/* HERO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-primary border-primary/30 bg-primary/5 uppercase tracking-wider font-semibold">
                {isEs ? 'Perfil de Muestra' : 'Sample Profile'}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                {isEs ? <>Dentro de un <span className="text-primary">Análisis AKSHA</span></> : <>Inside an AKSHA <span className="text-primary">Analysis</span></>}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {isEs
                  ? 'Este es un ejemplo generalizado de los profundos conocimientos personalizados generados por nuestro sistema. Tu perfil real estará adaptado enteramente a tus datos únicos.'
                  : 'This is a generalized example of the profound, personalized insights generated by our engine. Your actual profile will be tailored entirely to your unique data inputs.'}
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto">

              {/* 4 MODULES */}
              <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
                <Compass className="w-8 h-8 text-primary" />
                {isEs ? 'Los 4 Módulos de Propósito' : 'The 4 Modules of Purpose'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {modules.map((mod, index) => {
                  const Icon = mod.icon;
                  return (
                    <motion.div key={index}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                      <Card className="h-full border-border/50 bg-card shadow-sm hover:border-primary/40 transition-colors">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-primary">{mod.score}%</div>
                              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">IVA Match</div>
                            </div>
                          </div>
                          <CardTitle className="text-xl mb-1">{mod.title}</CardTitle>
                          <CardDescription className="text-sm">{mod.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                            <p className="text-sm text-foreground/90 leading-relaxed">"{mod.insight}"</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* CAREER TRAJECTORIES */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="mb-24"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                  {isEs ? 'Trayectorias Profesionales Alineadas' : 'Aligned Career Trajectories'}
                </h2>
                <div className="space-y-6">
                  {recommendations.map((rec, idx) => (
                    <Card key={idx} className="border-border/50 bg-card overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-32 bg-muted/30 p-6 flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-border/50">
                          <div className="text-2xl font-bold text-primary">{rec.match}</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold text-center mt-1">
                            {isEs ? 'Alineación' : 'Alignment'}
                          </div>
                        </div>
                        <div className="p-6 flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-2">{rec.role}</h3>
                          <p className="text-muted-foreground leading-relaxed">{rec.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>

              {/* ── REVIEWS SECTION ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <div className="text-center mb-12">
                  <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-3" style={{ color: 'rgba(212,175,55,0.7)' }}>
                    {isEs ? 'Lo que dicen quienes lo han vivido' : 'From those who have lived it'}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>
                    {isEs ? 'Experiencias reales' : 'Real experiences'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map((review, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="rounded-2xl p-6 flex flex-col gap-4"
                      style={{ backgroundColor: 'rgba(7,20,47,0.6)', border: '1px solid rgba(212,175,55,0.18)' }}>

                      {/* Stars */}
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className="w-4 h-4 fill-current" style={{ color: '#D4AF37' }} />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-sm text-white/75 leading-relaxed flex-1 italic">{review.text}</p>

                      {/* Module badge */}
                      <span className="text-xs px-3 py-1 rounded-full self-start font-medium"
                        style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: 'rgba(212,175,55,0.8)', border: '1px solid rgba(212,175,55,0.2)' }}>
                        {review.module}
                      </span>

                      {/* Person */}
                      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.name}
                            className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: 'rgba(212,175,55,0.3)' }} />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: 'rgba(212,175,55,0.15)', border: '1.5px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                            {review.initials}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{review.name}</p>
                          <p className="text-xs text-white/40">{review.location}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="text-center py-16 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.03) 100%)', border: '1.5px solid rgba(212,175,55,0.2)' }}
              >
                <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: 'rgba(212,175,55,0.7)' }}>
                  {isEs ? 'Tu turno' : 'Your turn'}
                </p>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
                  {isEs ? 'Descubre tu propio mapa.' : 'Discover your own map.'}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {isEs
                    ? 'Tu reporte es único — construido desde tus datos de nacimiento, no desde una plantilla.'
                    : 'Your report is unique — built from your birth data, not from a template.'}
                </p>
                <Link to="/pricing">
                  <Button size="lg" className="text-base px-8 py-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] active:scale-[0.98]">
                    {isEs ? 'Obtener Mi Reporte — $47' : 'Get My Report — $47'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SampleAnalysisPage;
