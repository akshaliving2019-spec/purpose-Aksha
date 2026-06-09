import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Shield, Clock, Sparkles, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const stripePromise = loadStripe('pk_live_51TfsG96y6I83avZFL6Fcsd8dShmyjOanlq965RPu8wuCXLHfkddQsgKvZ9oFpgImdRUZIkXGERGQQycSvK4QQmET00dx2VOtsN');

const MONTHS_ES = [
  { v:'01', label:'Enero' },{ v:'02', label:'Febrero' },{ v:'03', label:'Marzo' },
  { v:'04', label:'Abril' },{ v:'05', label:'Mayo' },{ v:'06', label:'Junio' },
  { v:'07', label:'Julio' },{ v:'08', label:'Agosto' },{ v:'09', label:'Septiembre' },
  { v:'10', label:'Octubre' },{ v:'11', label:'Noviembre' },{ v:'12', label:'Diciembre' },
];
const MONTHS_EN = [
  { v:'01', label:'January' },{ v:'02', label:'February' },{ v:'03', label:'March' },
  { v:'04', label:'April' },{ v:'05', label:'May' },{ v:'06', label:'June' },
  { v:'07', label:'July' },{ v:'08', label:'August' },{ v:'09', label:'September' },
  { v:'10', label:'October' },{ v:'11', label:'November' },{ v:'12', label:'December' },
];

// ── Payment form (inside Stripe Elements context) ──
const CheckoutForm = ({ name, email, birthDate, birthTime, birthPlace, lang }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const es = lang === 'es';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`,
        payment_method_data: {
          billing_details: { name, email },
        },
      },
    });

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        style={{
          background: loading ? 'rgba(212,175,55,0.6)' : 'linear-gradient(135deg, #D4AF37, #B8942A)',
          color: '#0a0f1e',
          boxShadow: loading ? 'none' : '0 4px 24px rgba(212,175,55,0.35)',
        }}
      >
        <Lock className="w-5 h-5" />
        {loading
          ? (es ? 'Procesando...' : 'Processing...')
          : (es ? 'Pagar $47 — Obtener Mi Reporte' : 'Pay $47 — Get My Report')}
      </button>

      <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {es ? 'SSL Seguro' : 'SSL Secure'}</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {es ? 'Reporte en 24h' : 'Report in 24h'}</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> {es ? 'Único para ti' : 'Unique to you'}</span>
      </div>
    </form>
  );
};

// ── Main checkout page ──
const CheckoutPage = () => {
  const { lang } = useLanguage();
  const es = lang === 'es';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [step, setStep] = useState('info');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MONTHS = es ? MONTHS_ES : MONTHS_EN;
  const birthDate = birthDay && birthMonth && birthYear
    ? `${birthDay.padStart(2,'0')}/${birthMonth}/${birthYear}` : '';

  const handleContinue = async (e) => {
    e.preventDefault();
    setFormError('');
    const day = parseInt(birthDay);
    const year = parseInt(birthYear);

    if (!name || !email || !birthDay || !birthMonth || !birthYear || !birthPlace) {
      setFormError(es ? 'Por favor completa todos los campos requeridos.' : 'Please fill all required fields.');
      return;
    }
    if (day < 1 || day > 31) { setFormError(es ? 'Día inválido (1-31)' : 'Invalid day (1-31)'); return; }
    if (year < 1900 || year > new Date().getFullYear()) { setFormError(es ? 'Año inválido' : 'Invalid year'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setFormError(es ? 'Email inválido' : 'Invalid email'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, birthDate, birthTime, birthPlace }),
      });
      const data = await res.json();
      if (data.error) { setFormError(data.error); setSubmitting(false); return; }
      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch {
      setFormError(es ? 'Error de conexión. Intenta de nuevo.' : 'Connection error. Please try again.');
    }
    setSubmitting(false);
  };

  const inputClass = "w-full h-11 rounded-lg px-4 text-sm outline-none transition-all duration-200";
  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
  };
  const inputFocusStyle = "focus:ring-2 focus:ring-yellow-500/40";

  const stripeAppearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#D4AF37',
      colorBackground: 'rgba(255,255,255,0.04)',
      colorText: '#ffffff',
      colorDanger: '#f87171',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '10px',
    },
    rules: {
      '.Input': { border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)' },
      '.Input:focus': { border: '1px solid rgba(212,175,55,0.6)', boxShadow: '0 0 0 2px rgba(212,175,55,0.2)' },
      '.Label': { color: 'rgba(255,255,255,0.55)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    },
  };

  return (
    <>
      <Helmet>
        <title>{es ? 'Obtener Mi Reporte — AKSHA' : 'Get My Report — AKSHA'}</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="pt-10 pb-6 text-center px-4">
          <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
            {es ? 'Precio Fundador · Un pago único' : 'Founding Price · One-time payment'}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
            {es ? 'Tu Mapa de Propósito' : 'Your Purpose Map'}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-4xl font-bold" style={{ color: '#D4AF37' }}>$47</span>
            <span className="text-xl line-through" style={{ color: 'rgba(255,255,255,0.25)' }}>$79</span>
          </div>
        </div>

        {/* Card */}
        <div className="px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="max-w-md mx-auto rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#0a1828', border: '1.5px solid rgba(212,175,55,0.25)' }}
          >
            {/* Step tabs */}
            <div className="flex" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
              {[
                { key: 'info', label: es ? '1. Tu información' : '1. Your Info' },
                { key: 'payment', label: es ? '2. Pago' : '2. Payment' },
              ].map(tab => (
                <div key={tab.key} className="flex-1 py-3 text-center text-sm font-semibold"
                  style={{
                    color: step === tab.key ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                    borderBottom: step === tab.key ? '2px solid #D4AF37' : '2px solid transparent',
                  }}>
                  {tab.label}
                </div>
              ))}
            </div>

            <div className="p-7">
              {/* ── STEP 1: Personal info ── */}
              {step === 'info' && (
                <form onSubmit={handleContinue} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {es ? 'Nombre completo *' : 'Full name *'}
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder={es ? 'Tu nombre' : 'Your name'}
                      className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {es ? 'Email — tu reporte llegará aquí *' : 'Email — your report arrives here *'}
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {es ? 'Fecha de nacimiento *' : 'Birth date *'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" min="1" max="31" value={birthDay}
                        onChange={e => setBirthDay(e.target.value)}
                        placeholder={es ? 'Día' : 'Day'}
                        className={`${inputClass} ${inputFocusStyle} text-center`} style={inputStyle} />
                      <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)}
                        className={`${inputClass} ${inputFocusStyle}`}
                        style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">{es ? 'Mes' : 'Month'}</option>
                        {MONTHS.map(m => <option key={m.v} value={m.v} style={{ backgroundColor: '#0a1828' }}>{m.label}</option>)}
                      </select>
                      <input type="number" min="1900" max={new Date().getFullYear()} value={birthYear}
                        onChange={e => setBirthYear(e.target.value)}
                        placeholder={es ? 'Año' : 'Year'}
                        className={`${inputClass} ${inputFocusStyle} text-center`} style={inputStyle} />
                    </div>
                    {birthDate && (
                      <p className="text-xs mt-1" style={{ color: '#D4AF37' }}>✓ {birthDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {es ? 'Hora de nacimiento (opcional)' : 'Birth time (optional)'}
                    </label>
                    <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
                      className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {es ? 'Genera un análisis cronobiológico más profundo' : 'Enables deeper chronobiological analysis'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {es ? 'Ciudad y país de nacimiento *' : 'City and country of birth *'}
                    </label>
                    <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)}
                      placeholder={es ? 'Ciudad, País' : 'City, Country'}
                      className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
                  </div>

                  {formError && (
                    <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                      {formError}
                    </div>
                  )}

                  <button type="submit" disabled={submitting}
                    className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #B8942A)', color: '#0a0f1e', boxShadow: '0 4px 24px rgba(212,175,55,0.3)' }}>
                    {submitting
                      ? (es ? 'Un momento...' : 'One moment...')
                      : (es ? 'Continuar al pago →' : 'Continue to payment →')}
                  </button>

                  <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    🔒 {es ? 'Datos protegidos · Encriptado SSL' : 'Protected data · SSL Encrypted'}
                  </p>
                </form>
              )}

              {/* ── STEP 2: Payment ── */}
              {step === 'payment' && (
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-white">{name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{email}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {birthDate}{birthTime ? ` · ${birthTime}` : ''} · {birthPlace}
                        </p>
                      </div>
                      <button onClick={() => setStep('info')} className="text-xs underline ml-4 flex-shrink-0" style={{ color: 'rgba(212,175,55,0.7)' }}>
                        {es ? 'Editar' : 'Edit'}
                      </button>
                    </div>
                  </div>

                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                      <CheckoutForm
                        name={name} email={email}
                        birthDate={birthDate} birthTime={birthTime} birthPlace={birthPlace}
                        lang={lang}
                      />
                    </Elements>
                  ) : (
                    <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {es ? 'Cargando...' : 'Loading...'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Trust badges */}
          <div className="max-w-md mx-auto mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: '📄', text: es ? 'Reporte 5 secciones' : '5-section report' },
              { icon: '⚡', text: es ? 'Entrega en 24h' : 'Delivered in 24h' },
              { icon: '🔒', text: es ? 'Pago seguro' : 'Secure payment' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
                <div className="text-lg mb-1">{item.icon}</div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
