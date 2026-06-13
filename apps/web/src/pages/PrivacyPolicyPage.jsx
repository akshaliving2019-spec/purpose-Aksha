import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const content = {
  en: {
    metaTitle: 'Privacy Policy — AKSHA',
    metaDesc: 'How AKSHA LIFE collects, uses and protects your personal data.',
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    updated: 'Last updated: June 12, 2026',
    intro: 'At AKSHA LIFE (aksha.life) your trust matters as much as your purpose. This policy explains what data we collect, why we collect it, and how we protect it.',
    sections: [
      {
        title: '1. Who we are',
        paragraphs: [
          'AKSHA LIFE operates the website aksha.life and creates personalized Purpose Map reports. For any privacy question or request, write to purpose@aksha.life.',
        ],
      },
      {
        title: '2. Data we collect',
        paragraphs: [
          'Report data: your name, email address, birth date, birth place, and optionally your birth time and a short life story you choose to share. This is the information your Purpose Map is built from.',
          'Account data: if you create an account, we store your name, email and an encrypted password so you can access your dashboard and saved profiles.',
          'Payment data: payments are processed by Stripe. Your card number never touches our servers — we only receive a confirmation of payment and the billing name and email you provide.',
          'Technical data: basic logs (such as IP address and browser type) needed to keep the service secure and working.',
        ],
      },
      {
        title: '3. How we use your data',
        paragraphs: [
          'We use your data to generate your personalized Purpose Map, deliver it to your email, process your payment, provide your dashboard, and answer your support requests.',
          'Your birth data and life story are processed with artificial intelligence systems for one purpose only: creating your report. We do not use your personal data to train AI models.',
        ],
      },
      {
        title: '4. Who we share it with',
        paragraphs: [
          'We never sell your personal data. We share it only with the service providers strictly needed to operate: payment processing (Stripe), email delivery, hosting, and the AI infrastructure that generates your report. Each provider receives only what it needs.',
          'We may also disclose data if required by law.',
        ],
      },
      {
        title: '5. How long we keep it',
        paragraphs: [
          'We keep your data while your account is active or while it is needed to provide the service, comply with legal obligations, or resolve disputes. You can request deletion at any time.',
        ],
      },
      {
        title: '6. Your rights',
        paragraphs: [
          'You can request access to, correction of, or deletion of your personal data at any time by writing to purpose@aksha.life. We will respond as soon as possible and always within the timeframes required by applicable law.',
        ],
      },
      {
        title: '7. Security',
        paragraphs: [
          'All communication with aksha.life is encrypted in transit (SSL/TLS). Passwords are stored encrypted. No system is infallible, but we apply reasonable technical and organizational measures to protect your information.',
        ],
      },
      {
        title: '8. Age requirement',
        paragraphs: [
          'AKSHA LIFE is intended for adults. We do not knowingly collect data from anyone under 18. If you believe a minor has provided us data, contact us and we will delete it.',
        ],
      },
      {
        title: '9. Changes to this policy',
        paragraphs: [
          'We may update this policy as the service evolves. The date at the top always reflects the latest version. Material changes will be announced on the site.',
        ],
      },
      {
        title: '10. Contact',
        paragraphs: [
          'Questions about privacy? Write to purpose@aksha.life.',
        ],
      },
    ],
  },
  es: {
    metaTitle: 'Política de Privacidad — AKSHA',
    metaDesc: 'Cómo AKSHA LIFE recopila, usa y protege tus datos personales.',
    eyebrow: 'Legal',
    title: 'Política de Privacidad',
    updated: 'Última actualización: 12 de junio de 2026',
    intro: 'En AKSHA LIFE (aksha.life) tu confianza importa tanto como tu propósito. Esta política explica qué datos recopilamos, para qué los recopilamos y cómo los protegemos.',
    sections: [
      {
        title: '1. Quiénes somos',
        paragraphs: [
          'AKSHA LIFE opera el sitio web aksha.life y crea reportes personalizados de Mapa de Propósito. Para cualquier pregunta o solicitud sobre privacidad, escribe a purpose@aksha.life.',
        ],
      },
      {
        title: '2. Datos que recopilamos',
        paragraphs: [
          'Datos del reporte: tu nombre, email, fecha de nacimiento, lugar de nacimiento y, opcionalmente, tu hora de nacimiento y una breve historia de vida que decidas compartir. Esta es la información con la que se construye tu Mapa de Propósito.',
          'Datos de cuenta: si creas una cuenta, guardamos tu nombre, email y una contraseña cifrada para que accedas a tu panel y perfiles guardados.',
          'Datos de pago: los pagos los procesa Stripe. El número de tu tarjeta nunca pasa por nuestros servidores — solo recibimos la confirmación del pago y el nombre y email de facturación que proporcionas.',
          'Datos técnicos: registros básicos (como dirección IP y tipo de navegador) necesarios para mantener el servicio seguro y en funcionamiento.',
        ],
      },
      {
        title: '3. Cómo usamos tus datos',
        paragraphs: [
          'Usamos tus datos para generar tu Mapa de Propósito personalizado, entregarlo a tu email, procesar tu pago, darte acceso a tu panel y responder tus solicitudes de soporte.',
          'Tus datos de nacimiento y tu historia de vida se procesan con sistemas de inteligencia artificial con un único propósito: crear tu reporte. No usamos tus datos personales para entrenar modelos de IA.',
        ],
      },
      {
        title: '4. Con quién los compartimos',
        paragraphs: [
          'Nunca vendemos tus datos personales. Los compartimos solo con los proveedores estrictamente necesarios para operar: procesamiento de pagos (Stripe), envío de emails, hosting y la infraestructura de IA que genera tu reporte. Cada proveedor recibe solo lo que necesita.',
          'También podemos divulgar datos si la ley lo exige.',
        ],
      },
      {
        title: '5. Cuánto tiempo los conservamos',
        paragraphs: [
          'Conservamos tus datos mientras tu cuenta esté activa o mientras sean necesarios para prestar el servicio, cumplir obligaciones legales o resolver disputas. Puedes solicitar su eliminación en cualquier momento.',
        ],
      },
      {
        title: '6. Tus derechos',
        paragraphs: [
          'Puedes solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento escribiendo a purpose@aksha.life. Responderemos lo antes posible y siempre dentro de los plazos que exija la ley aplicable.',
        ],
      },
      {
        title: '7. Seguridad',
        paragraphs: [
          'Toda la comunicación con aksha.life viaja cifrada (SSL/TLS). Las contraseñas se almacenan cifradas. Ningún sistema es infalible, pero aplicamos medidas técnicas y organizativas razonables para proteger tu información.',
        ],
      },
      {
        title: '8. Requisito de edad',
        paragraphs: [
          'AKSHA LIFE está dirigido a personas adultas. No recopilamos conscientemente datos de menores de 18 años. Si crees que un menor nos ha proporcionado datos, contáctanos y los eliminaremos.',
        ],
      },
      {
        title: '9. Cambios en esta política',
        paragraphs: [
          'Podemos actualizar esta política a medida que el servicio evolucione. La fecha en la parte superior siempre refleja la versión más reciente. Los cambios importantes se anunciarán en el sitio.',
        ],
      },
      {
        title: '10. Contacto',
        paragraphs: [
          '¿Preguntas sobre privacidad? Escribe a purpose@aksha.life.',
        ],
      },
    ],
  },
};

const PrivacyPolicyPage = () => {
  const { lang } = useLanguage();
  const c = content[lang] || content.en;

  return (
    <>
      <Helmet>
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDesc} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="pt-28 pb-12 px-4 text-center">
          <motion.div {...fadeUp(0)} className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.45em] font-semibold mb-5" style={{ color: 'rgba(212,175,55,0.65)' }}>
              {c.eyebrow}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground" style={{ letterSpacing: '-0.02em' }}>
              {c.title}
            </h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.updated}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">{c.intro}</p>
          </motion.div>
        </section>

        <section className="pb-28 px-4">
          <div className="max-w-2xl mx-auto space-y-10">
            {c.sections.map((section, i) => (
              <motion.div key={i} {...fadeUp(Math.min(i * 0.04, 0.2))}
                className="border-b pb-8 last:border-b-0" style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
                <h2 className="text-xl font-semibold text-foreground mb-4">{section.title}</h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-muted-foreground leading-relaxed text-sm mb-3 last:mb-0">{p}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
