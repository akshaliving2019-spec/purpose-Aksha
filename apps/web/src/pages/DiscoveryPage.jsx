
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { pocketbaseClient as pb } from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import IntegratedAiChat from '@/components/integrated-ai-chat';
import { Calendar, Clock, MapPin, Sparkles, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Human silhouette — dark left half / outline right half + onion layers
const HumanSilhouette = () => {
  // Full human body path centered at cx=140, designed to look like the reference image
  const bodyPath = `
    M140,30
    C128,30 118,40 118,53 C118,66 128,76 140,76 C152,76 162,66 162,53 C162,40 152,30 140,30 Z
    M118,78 C105,82 96,90 92,102 C88,114 86,126 85,136 L82,158 C80,162 78,178 80,182 L86,182 L90,158 L92,182 L98,182 L100,160
    L108,220 L106,270 L100,290 L108,292 L114,272 L118,240
    L122,290 L130,292 L126,270 L124,220
    L132,160 L134,182 L140,182 L140,160
    L148,182 L154,182 L156,158 L160,182 L166,182 C168,178 166,162 164,158 L161,136 C160,126 158,114 154,102 C150,90 141,82 128,78 Z
  `;

  return (
    <div className="flex justify-center my-8">
      <svg viewBox="60 15 160 290" width="180" height="320" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="humanLeft">
            <rect x="0" y="0" width="140" height="400" />
          </clipPath>
          <clipPath id="humanRight">
            <rect x="140" y="0" width="200" height="400" />
          </clipPath>
          <radialGradient id="goldGlow2" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow */}
        <ellipse cx="140" cy="160" rx="85" ry="130" fill="url(#goldGlow2)" />

        {/* Onion layers — concentric ellipses */}
        {[
          { rx: 78, ry: 122, op: 0.18, dash: '5 4' },
          { rx: 65, ry: 105, op: 0.14, dash: '4 4' },
          { rx: 52, ry: 88,  op: 0.11, dash: '3 4' },
          { rx: 40, ry: 72,  op: 0.08, dash: '2 4' },
        ].map((l, i) => (
          <ellipse key={i} cx="140" cy="163" rx={l.rx} ry={l.ry}
            fill="none"
            stroke={`rgba(212,175,55,${l.op})`}
            strokeWidth="1.2"
            strokeDasharray={l.dash}
          />
        ))}

        {/* Dark left half */}
        <g clipPath="url(#humanLeft)">
          <path d={bodyPath} fill="rgba(10,20,50,0.97)" />
        </g>

        {/* Outline right half */}
        <g clipPath="url(#humanRight)">
          <path d={bodyPath} fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" />
        </g>

        {/* Center dividing line */}
        <line x1="140" y1="25" x2="140" y2="295"
          stroke="rgba(212,175,55,0.4)" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* Left labels — layers life adds */}
        <text x="136" y="108" textAnchor="end" fontSize="6.5" fill="rgba(255,255,255,0.35)" fontFamily="sans-serif">miedos</text>
        <text x="136" y="128" textAnchor="end" fontSize="6.5" fill="rgba(255,255,255,0.28)" fontFamily="sans-serif">expectativas</text>
        <text x="136" y="148" textAnchor="end" fontSize="6.5" fill="rgba(255,255,255,0.22)" fontFamily="sans-serif">creencias</text>
        <text x="136" y="168" textAnchor="end" fontSize="6.5" fill="rgba(255,255,255,0.16)" fontFamily="sans-serif">decepciones</text>

        {/* Right labels — authentic self */}
        <text x="144" y="108" textAnchor="start" fontSize="6.5" fill="rgba(212,175,55,0.75)" fontFamily="sans-serif">energía</text>
        <text x="144" y="128" textAnchor="start" fontSize="6.5" fill="rgba(212,175,55,0.65)" fontFamily="sans-serif">fortalezas</text>
        <text x="144" y="148" textAnchor="start" fontSize="6.5" fill="rgba(212,175,55,0.55)" fontFamily="sans-serif">don</text>
        <text x="144" y="168" textAnchor="start" fontSize="6.5" fill="rgba(212,175,55,0.5)" fontFamily="sans-serif">propósito</text>
      </svg>
    </div>
  );
};

const DiscoveryPage = () => {
  const { currentUser } = useAuth();
  const { lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [saving, setSaving] = useState(false);

  const birthDate = birthDay && birthMonth && birthYear
    ? `${birthDay.padStart(2,'0')}/${birthMonth.padStart(2,'0')}/${birthYear}`
    : '';

  const MONTHS_ES = [
    { v:'01', label:'Enero' }, { v:'02', label:'Febrero' },
    { v:'03', label:'Marzo' }, { v:'04', label:'Abril' },
    { v:'05', label:'Mayo' }, { v:'06', label:'Junio' },
    { v:'07', label:'Julio' }, { v:'08', label:'Agosto' },
    { v:'09', label:'Septiembre' }, { v:'10', label:'Octubre' },
    { v:'11', label:'Noviembre' }, { v:'12', label:'Diciembre' },
  ];

  const MONTHS_EN = [
    { v:'01', label:'January' }, { v:'02', label:'February' },
    { v:'03', label:'March' }, { v:'04', label:'April' },
    { v:'05', label:'May' }, { v:'06', label:'June' },
    { v:'07', label:'July' }, { v:'08', label:'August' },
    { v:'09', label:'September' }, { v:'10', label:'October' },
    { v:'11', label:'November' }, { v:'12', label:'December' },
  ];

  const MONTHS = lang === 'es' ? MONTHS_ES : MONTHS_EN;

  const handleStartAnalysis = (e) => {
    e.preventDefault();
    const day = parseInt(birthDay);
    const year = parseInt(birthYear);
    if (!birthDay || !birthMonth || !birthYear || !birthPlace) {
      toast.error(lang === 'es' ? 'Por favor completa todos los campos requeridos' : 'Please fill all required fields');
      return;
    }
    if (day < 1 || day > 31) { toast.error(lang === 'es' ? 'Día inválido (1-31)' : 'Invalid day (1-31)'); return; }
    if (year < 1900 || year > new Date().getFullYear()) { toast.error(lang === 'es' ? 'Año inválido' : 'Invalid year'); return; }
    setStep(2);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) {
      toast.error(lang === 'es' ? 'Inicia sesión para guardar tu perfil' : 'Please login to save your profile');
      return;
    }
    setSaving(true);
    try {
      await pb.collection('userProfiles').create({
        userId: currentUser.id,
        birthDate,
        birthTime,
        birthPlace,
      }, { $autoCancel: false });
      toast.success(lang === 'es' ? 'Perfil guardado correctamente' : 'Profile saved successfully');
    } catch (err) {
      toast.error(err.message || (lang === 'es' ? 'Error al guardar' : 'Failed to save profile'));
    } finally {
      setSaving(false);
    }
  };

  const es = lang === 'es';

  return (
    <>
      <Helmet>
        <title>{es ? 'Descubre Tu Propósito — AKSHA LIFE' : 'Discover Your Purpose — AKSHA LIFE'}</title>
        <meta name="description" content={es
          ? 'Introduce tu fecha de nacimiento y descubre tu propósito, fortalezas y energía única. Sin astrología. Sin dogmas.'
          : 'Enter your birth date and discover your unique purpose, strengths and energy. No astrology. No dogma.'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                  {es ? 'Descubre quién eres realmente' : 'Find out who you really are'}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-prose mx-auto">
                  {es
                    ? 'Introduce tu fecha de nacimiento. Nosotros hacemos el resto — sin astrología, sin dogmas.'
                    : 'Enter your birth date. We do the rest — no astrology, no dogma.'}
                </p>
              </div>

              {/* Human silhouette with layers */}
              <div className="rounded-2xl p-6 mb-8 text-center" style={{ backgroundColor: 'rgba(7,20,47,0.6)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <p className="text-lg font-semibold text-white mb-1">
                  {es ? 'La vida añade capas a cada uno de nosotros.' : 'Life adds layers to each of us.'}
                </p>
                <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {es
                    ? 'Expectativas, miedos, responsabilidades, decepciones, creencias y experiencias.'
                    : 'Expectations, fears, responsibilities, disappointments, beliefs and experiences.'}
                </p>

                <HumanSilhouette />

                <p className="text-sm italic mt-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                  {es
                    ? 'Es como pelar una cebolla gigante — el camino de regreso a nosotros mismos puede tomar años, a veces toda una vida.'
                    : 'Like peeling a giant onion — the journey back to ourselves can take years, sometimes a lifetime.'}
                </p>
                <p className="text-sm mt-4 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {es
                    ? 'Sin embargo, debajo de esas capas vive algo que nunca ha desaparecido: '
                    : 'Yet beneath those layers lives something that never disappeared: '}
                  <span className="font-bold text-white">
                    {es ? 'tu consciencia original.' : 'your original self.'}
                  </span>
                </p>
                <p className="text-xs mt-3 tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                  {es ? 'Neurociencia · Psicología · Arquetipos · Cronobiología' : 'Neuroscience · Psychology · Archetypes · Chronobiology'}
                </p>
              </div>

              {/* Form */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {es ? 'Tus datos de nacimiento' : 'Your Birth Data'}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {es
                      ? 'Esta información genera tu Mapa de Propósito personalizado'
                      : 'This information generates your personalized Purpose Map'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStartAnalysis} className="space-y-6">
                    {/* Birth Date */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        {es ? 'Fecha de Nacimiento *' : 'Birth Date *'}
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="birthDay" className="text-xs text-muted-foreground">{es ? 'Día' : 'Day'}</Label>
                          <Input
                            id="birthDay"
                            type="number"
                            min="1" max="31"
                            placeholder="5"
                            value={birthDay}
                            onChange={(e) => setBirthDay(e.target.value)}
                            required
                            className="text-foreground bg-background border-border focus-visible:ring-primary text-center text-lg font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="birthMonth" className="text-xs text-muted-foreground">{es ? 'Mes' : 'Month'}</Label>
                          <select
                            id="birthMonth"
                            value={birthMonth}
                            onChange={(e) => setBirthMonth(e.target.value)}
                            required
                            className="w-full h-10 rounded-md border border-border bg-background px-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">—</option>
                            {MONTHS.map(m => <option key={m.v} value={m.v}>{m.label}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="birthYear" className="text-xs text-muted-foreground">{es ? 'Año' : 'Year'}</Label>
                          <Input
                            id="birthYear"
                            type="number"
                            min="1900" max={new Date().getFullYear()}
                            placeholder="1985"
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
                            required
                            className="text-foreground bg-background border-border focus-visible:ring-primary text-center text-lg font-medium"
                          />
                        </div>
                      </div>
                      {birthDate && (
                        <p className="text-xs text-primary mt-1">✓ {es ? 'Fecha registrada' : 'Date recorded'}: {birthDate}</p>
                      )}
                    </div>

                    {/* Birth Time */}
                    <div className="space-y-2">
                      <Label htmlFor="birthTime" className="flex items-center gap-2 text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {es ? 'Hora de Nacimiento (opcional)' : 'Birth Time (optional)'}
                      </Label>
                      <Input
                        id="birthTime"
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="text-foreground bg-background border-border focus-visible:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        {es ? 'Una hora más precisa genera perspectivas más profundas' : 'More accurate time provides deeper insights'}
                      </p>
                    </div>

                    {/* Birth Place */}
                    <div className="space-y-2">
                      <Label htmlFor="birthPlace" className="flex items-center gap-2 text-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        {es ? 'Lugar de Nacimiento *' : 'Birth Place *'}
                      </Label>
                      <Input
                        id="birthPlace"
                        type="text"
                        placeholder={es ? 'Ciudad, País' : 'City, Country'}
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        required
                        className="text-foreground bg-background border-border focus-visible:ring-primary"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20"
                    >
                      {es ? 'Comenzar Mi Análisis' : 'Start My Analysis'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                      {es ? 'Tu Análisis de Propósito' : 'Your Purpose Analysis'}
                    </h1>
                    <p className="text-muted-foreground">
                      {es ? 'Fecha' : 'Birth Date'}: {birthDate} {birthTime && `${es ? 'a las' : 'at'} ${birthTime}`} • {birthPlace}
                    </p>
                  </div>
                  {currentUser && (
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      variant="outline"
                      className="transition-all duration-200 active:scale-[0.98] border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? (es ? 'Guardando...' : 'Saving...') : (es ? 'Guardar Perfil' : 'Save Profile')}
                    </Button>
                  )}
                </div>

                <Card className="mb-6 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      {es ? 'Análisis con IA — AKSHA LIFE' : 'AI-Powered Guidance — AKSHA LIFE'}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {es
                        ? 'Pregúntale a AKSHA LIFE sobre tu propósito, carrera o cualquier perspectiva de tu perfil'
                        : 'Ask AKSHA LIFE about your purpose, career path, or any insights from your profile'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[600px]">
                    <IntegratedAiChat />
                  </CardContent>
                </Card>

                <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                  <h3 className="font-semibold mb-3 text-foreground">
                    {es ? 'Qué puedes preguntarle a AKSHA LIFE:' : 'What to ask AKSHA LIFE:'}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(es ? [
                      '¿Cuáles son mis fortalezas principales?',
                      '¿Qué carreras se alinean con mi propósito único?',
                      '¿Cómo puedo desarrollar mi potencial en la era de la IA?',
                      '¿Qué me hace irremplazable por la inteligencia artificial?',
                      '¿Cuál es mi mayor don que no estoy usando?',
                    ] : [
                      'What are my core strengths based on my profile?',
                      'Which career paths align with my unique purpose?',
                      'How can I develop my potential in an AI-driven world?',
                      'What makes me irreplaceable by artificial intelligence?',
                      'What is my greatest gift that I\'m not using?',
                    ]).map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DiscoveryPage;
