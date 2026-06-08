
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

// Human silhouette — realistic standing figure, dark left / outline right, onion layers
const HumanSilhouette = () => {
  const { lang } = useLanguage();

  // ViewBox: 0 0 280 580, center x=140
  // HEAD circle: cx=140 cy=46 r=36

  // BODY: torso + hips + legs (no arms — arms are separate shapes)
  const BODY = `M108,84 C90,90 72,104 64,116 C62,126 64,155 66,175 C68,200 70,220 70,238 C70,255 68,275 68,295 C68,312 74,326 82,330 L78,428 L74,498 L70,528 L66,538 L98,538 L92,528 L96,498 L100,428 L104,334 L140,334 L176,334 L180,428 L184,498 L188,528 L182,538 L214,538 L210,528 L206,498 L202,428 L198,330 C206,326 212,312 212,295 C212,275 210,255 210,238 C210,220 212,200 214,175 C216,155 218,126 216,116 C208,104 190,90 172,84 C163,86 153,88 140,88 C127,88 117,86 108,84 Z`;

  // LEFT ARM: hangs slightly outward from left shoulder (64,116)
  const LEFT_ARM = `M64,116 C52,124 42,152 38,186 C34,220 36,256 40,280 C44,296 52,306 62,306 C70,306 76,296 76,280 C74,254 70,218 72,185 C74,154 80,128 84,118 C80,112 72,110 64,116 Z`;

  // RIGHT ARM: mirror of left arm (right shoulder at 216,116)
  const RIGHT_ARM = `M216,116 C208,110 200,112 196,118 C200,128 206,154 208,185 C210,218 206,254 204,280 C204,296 210,306 218,306 C228,306 236,296 240,280 C244,256 246,220 242,186 C238,152 228,124 216,116 Z`;

  const leftLabels = lang === 'es'
    ? ['miedos', 'expectativas', 'creencias', 'decepciones', 'prisión']
    : ['fears', 'expectations', 'beliefs', 'disappointments', 'prison'];

  const rightLabels = lang === 'es'
    ? ['energía', 'fortalezas', 'don', 'propósito']
    : ['energy', 'strengths', 'gift', 'purpose'];

  const leftY  = [148, 192, 238, 280, 338];
  const rightY = [148, 192, 238, 280];

  return (
    <div className="flex justify-center my-10 px-4">
      {/* White card — matches reference image style */}
      <div className="rounded-3xl overflow-hidden shadow-xl"
        style={{ backgroundColor: '#f5f2ec', padding: '24px 16px' }}>
        <svg viewBox="10 0 260 568" width="220" height="470" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="sil-left-v3">
              <rect x="0" y="0" width="140" height="580" />
            </clipPath>
            <clipPath id="sil-right-v3">
              <rect x="140" y="0" width="140" height="580" />
            </clipPath>
          </defs>

          {/* Concentric dashed oval rings (gray, like reference) */}
          {[
            { rx: 115, ry: 208 },
            { rx: 95,  ry: 174 },
            { rx: 74,  ry: 142 },
            { rx: 54,  ry: 110 },
          ].map((ring, i) => (
            <ellipse key={i} cx="140" cy="308"
              rx={ring.rx} ry={ring.ry}
              fill="none"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
          ))}

          {/* LEFT HALF — solid black fill */}
          <g clipPath="url(#sil-left-v3)">
            <circle cx="140" cy="46" r="36" fill="#0f0f0f" />
            <path d={LEFT_ARM}  fill="#0f0f0f" />
            <path d={RIGHT_ARM} fill="#0f0f0f" />
            <path d={BODY}      fill="#0f0f0f" />
          </g>

          {/* RIGHT HALF — outline only (black stroke, no fill) */}
          <g clipPath="url(#sil-right-v3)">
            <circle cx="140" cy="46" r="36" fill="none" stroke="#0f0f0f" strokeWidth="2.2" />
            <path d={LEFT_ARM}  fill="none" stroke="#0f0f0f" strokeWidth="2.2" />
            <path d={RIGHT_ARM} fill="none" stroke="#0f0f0f" strokeWidth="2.2" />
            <path d={BODY}      fill="none" stroke="#0f0f0f" strokeWidth="2.2" />
          </g>

          {/* Left labels — gray, layers that cover us */}
          {leftLabels.map((label, i) => (
            <text key={i} x="132" y={leftY[i]}
              textAnchor="end" fontSize="11"
              fill="rgba(40,40,40,0.6)"
              fontFamily="Georgia, 'Times New Roman', serif">
              {label}
            </text>
          ))}

          {/* Right labels — gold, authentic self */}
          {rightLabels.map((label, i) => (
            <text key={i} x="148" y={rightY[i]}
              textAnchor="start" fontSize="11"
              fill="#8B6914"
              fontFamily="Georgia, 'Times New Roman', serif">
              {label}
            </text>
          ))}
        </svg>
      </div>
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
                    ? 'Introduce tu fecha de nacimiento. Neurociencia · Psicología · Arquetipos · Cronobiología.'
                    : 'Enter your birth date. Neuroscience · Psychology · Archetypes · Chronobiology.'}
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
