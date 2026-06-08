
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

// Human silhouette — single-path figure with arms integrated, matching reference image
const HumanSilhouette = () => {
  const { lang } = useLanguage();

  // ViewBox 0 0 280 580, center x=140
  // Single path traces: neck → shoulder → outer arm → hand → inner arm → armpit →
  // torso → hip → outer leg → foot → inner leg → crotch → mirror right → close

  const HEAD_CX = 140, HEAD_CY = 48, HEAD_R = 37;

  // TORSO + LEGS — shoulder at x=90 to leave visible gap from arm inner (x≈78)
  const TORSO = `M112,86 C98,90 90,98 88,110 C86,122 88,152 90,178 C92,204 90,228 88,248 C86,268 84,286 84,306 C82,322 82,336 88,346 L82,422 L78,486 L74,532 L70,562 L70,572 L108,572 L104,562 L100,532 L98,486 L102,422 L112,352 C122,338 132,332 140,334 C148,332 158,338 168,352 L178,422 L182,486 L180,532 L176,562 L176,572 L210,572 L210,562 L206,532 L202,486 L198,422 L192,346 C198,336 198,322 196,306 C196,286 194,268 192,248 C190,228 188,204 190,178 C192,152 194,122 192,110 C190,98 182,90 168,86 C161,88 151,90 140,90 C129,90 119,88 112,86 Z`;

  // LEFT ARM — narrow ~24px wide, inner x≈76-80, outer x≈52-56, gap from torso=12px
  const LEFT_ARM = `M78,110 C64,116 52,146 48,182 C44,216 46,252 52,278 C56,294 64,304 72,302 C80,300 84,286 82,268 C78,242 74,206 76,178 C78,152 84,124 86,114 C82,108 78,108 78,110 Z`;

  // RIGHT ARM — exact mirror (x → 280-x)
  const RIGHT_ARM = `M202,110 C202,108 198,108 194,114 C196,124 202,152 204,178 C206,206 202,242 198,268 C196,286 200,300 208,302 C216,304 224,294 228,278 C234,252 236,216 232,182 C228,146 216,116 202,110 Z`;

  const leftLabels = lang === 'es'
    ? ['miedos', 'expectativas', 'creencias', 'decepciones', 'prisión']
    : ['fears', 'expectations', 'beliefs', 'disappointments', 'prison'];

  const rightLabels = lang === 'es'
    ? ['energía', 'fortalezas', 'don', 'propósito']
    : ['energy', 'strengths', 'gift', 'purpose'];

  const leftY  = [150, 196, 242, 286, 340];
  const rightY = [150, 196, 242, 286];

  return (
    <div className="flex justify-center my-10 px-4">
      <div className="rounded-3xl overflow-hidden shadow-xl"
        style={{ backgroundColor: '#f5f2ec', padding: '28px 18px' }}>
        <svg viewBox="20 8 240 570" width="200" height="475" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="sil-left-v4">
              <rect x="0" y="0" width="140" height="590" />
            </clipPath>
            <clipPath id="sil-right-v4">
              <rect x="140" y="0" width="140" height="590" />
            </clipPath>
          </defs>

          {/* Concentric dashed oval rings — gray like reference image */}
          {[
            { rx: 122, ry: 214 },
            { rx: 100, ry: 178 },
            { rx: 78,  ry: 144 },
            { rx: 56,  ry: 110 },
          ].map((ring, i) => (
            <ellipse key={i} cx="140" cy="316"
              rx={ring.rx} ry={ring.ry}
              fill="none"
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1.5"
              strokeDasharray="7 5"
            />
          ))}

          {/* LEFT HALF — solid black */}
          <g clipPath="url(#sil-left-v4)">
            <circle cx={HEAD_CX} cy={HEAD_CY} r={HEAD_R} fill="#0d0d0d" />
            <path d={LEFT_ARM}  fill="#0d0d0d" />
            <path d={RIGHT_ARM} fill="#0d0d0d" />
            <path d={TORSO}     fill="#0d0d0d" />
          </g>

          {/* RIGHT HALF — outline only */}
          <g clipPath="url(#sil-right-v4)">
            <circle cx={HEAD_CX} cy={HEAD_CY} r={HEAD_R} fill="none" stroke="#0d0d0d" strokeWidth="2.5" />
            <path d={LEFT_ARM}  fill="none" stroke="#0d0d0d" strokeWidth="2.5" />
            <path d={RIGHT_ARM} fill="none" stroke="#0d0d0d" strokeWidth="2.5" />
            <path d={TORSO}     fill="none" stroke="#0d0d0d" strokeWidth="2.5" />
          </g>

          {/* Left labels */}
          {leftLabels.map((label, i) => (
            <text key={i} x="132" y={leftY[i]}
              textAnchor="end" fontSize="10"
              fill="rgba(30,30,30,0.55)"
              fontFamily="Georgia, serif">
              {label}
            </text>
          ))}

          {/* Right labels — gold */}
          {rightLabels.map((label, i) => (
            <text key={i} x="148" y={rightY[i]}
              textAnchor="start" fontSize="10"
              fill="#8B6914"
              fontFamily="Georgia, serif">
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
