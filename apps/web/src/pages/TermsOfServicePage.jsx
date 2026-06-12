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
    metaTitle: 'Terms of Service — AKSHA',
    metaDesc: 'The terms that govern your use of AKSHA LIFE and your Purpose Map report.',
    eyebrow: 'Legal',
    title: 'Terms of Service',
    updated: 'Last updated: June 12, 2026',
    intro: 'These terms govern your use of aksha.life and the AKSHA Purpose Map. By using the site or purchasing a report, you accept them.',
    sections: [
      {
        title: '1. The service',
        paragraphs: [
          'AKSHA LIFE creates a personalized Purpose Map: a report generated from the birth data and optional life story you provide, synthesizing frameworks from psychology, archetypes and chronobiology with artificial intelligence.',
          'The report is delivered to the email address you provide, normally within 24–48 hours of purchase.',
        ],
      },
      {
        title: '2. What the report is — and is not',
        paragraphs: [
          'Your Purpose Map is a tool for self-knowledge and personal development. It is not medical, psychological, psychiatric, financial or legal advice, and it is not a clinical diagnostic instrument.',
          'Decisions you make based on your report are your own responsibility. If you need professional help, consult a qualified professional.',
        ],
      },
      {
        title: '3. Payment and pricing',
        paragraphs: [
          'The Purpose Map is a one-time payment in US dollars — no subscriptions, no renewals, no hidden fees. Payments are processed securely by Stripe.',
          'Promotional prices (such as the Founding Member price) are available for a limited time and may change without notice. The price shown at checkout is the price you pay.',
        ],
      },
      {
        title: '4. Refund policy',
        paragraphs: [
          'Refunds are available only if your report has not yet been generated. Because each report is a unique, personalized product created specifically for you, once it has been generated and delivered all sales are final.',
          'If you have questions before purchasing, write to purpose@aksha.life.',
        ],
      },
      {
        title: '5. Your information',
        paragraphs: [
          'The quality of your report depends on the accuracy of the data you provide. You are responsible for providing accurate birth information, a valid email address, and truthful account details.',
          'How we handle your data is described in our Privacy Policy.',
        ],
      },
      {
        title: '6. Accounts',
        paragraphs: [
          'If you create an account, you are responsible for keeping your credentials secure and for all activity under your account. Notify us immediately at purpose@aksha.life if you suspect unauthorized access.',
        ],
      },
      {
        title: '7. Intellectual property',
        paragraphs: [
          'The site, its content, design and methodology belong to AKSHA LIFE. Your personal report is yours to keep and use for personal, non-commercial purposes. You may not resell, republish or redistribute reports or site content without written permission.',
        ],
      },
      {
        title: '8. Acceptable use',
        paragraphs: [
          'You agree not to misuse the service: no attempts to disrupt it, access other people\'s data, submit someone else\'s personal data without their consent, or use the service for unlawful purposes.',
        ],
      },
      {
        title: '9. Limitation of liability',
        paragraphs: [
          'The service is provided "as is". To the maximum extent permitted by law, AKSHA LIFE is not liable for indirect or consequential damages arising from the use of the site or the report. Our total liability is limited to the amount you paid for the service.',
        ],
      },
      {
        title: '10. Changes to these terms',
        paragraphs: [
          'We may update these terms as the service evolves. The date at the top always reflects the latest version. Continued use of the service after changes means you accept the updated terms.',
        ],
      },
      {
        title: '11. Contact',
        paragraphs: [
          'Questions about these terms? Write to purpose@aksha.life.',
        ],
      },
    ],
  },
  es: {
    metaTitle: 'Términos del Servicio — AKSHA',
    metaDesc: 'Los términos que rigen tu uso de AKSHA LIFE y tu reporte de Mapa de Propósito.',
    eyebrow: 'Legal',
    title: 'Términos del Servicio',
    updated: 'Última actualización: 12 de junio de 2026',
    intro: 'Estos términos rigen tu uso de aksha.life y del Mapa de Propósito AKSHA. Al usar el sitio o comprar un reporte, los aceptas.',
    sections: [
      {
        title: '1. El servicio',
        paragraphs: [
          'AKSHA LIFE crea un Mapa de Propósito personalizado: un reporte generado a partir de los datos de nacimiento y la historia de vida opcional que proporcionas, sintetizando marcos de psicología, arquetipos y cronobiología con inteligencia artificial.',
          'El reporte se entrega al email que proporcionas, normalmente dentro de las 24–48 horas posteriores a la compra.',
        ],
      },
      {
        title: '2. Qué es el reporte — y qué no es',
        paragraphs: [
          'Tu Mapa de Propósito es una herramienta de autoconocimiento y desarrollo personal. No es consejo médico, psicológico, psiquiátrico, financiero ni legal, y no es un instrumento de diagnóstico clínico.',
          'Las decisiones que tomes basándote en tu reporte son tu responsabilidad. Si necesitas ayuda profesional, consulta a un profesional calificado.',
        ],
      },
      {
        title: '3. Pago y precios',
        paragraphs: [
          'El Mapa de Propósito es un pago único en dólares estadounidenses — sin suscripciones, sin renovaciones, sin cargos ocultos. Los pagos los procesa Stripe de forma segura.',
          'Los precios promocionales (como el precio de Miembro Fundador) están disponibles por tiempo limitado y pueden cambiar sin aviso. El precio que ves al pagar es el precio que pagas.',
        ],
      },
      {
        title: '4. Política de reembolso',
        paragraphs: [
          'Los reembolsos están disponibles solo si tu reporte aún no ha sido generado. Como cada reporte es un producto único y personalizado creado específicamente para ti, una vez generado y entregado todas las ventas son finales.',
          'Si tienes preguntas antes de comprar, escribe a purpose@aksha.life.',
        ],
      },
      {
        title: '5. Tu información',
        paragraphs: [
          'La calidad de tu reporte depende de la precisión de los datos que proporcionas. Eres responsable de entregar información de nacimiento correcta, un email válido y datos de cuenta veraces.',
          'Cómo tratamos tus datos está descrito en nuestra Política de Privacidad.',
        ],
      },
      {
        title: '6. Cuentas',
        paragraphs: [
          'Si creas una cuenta, eres responsable de mantener tus credenciales seguras y de toda la actividad realizada con tu cuenta. Avísanos de inmediato a purpose@aksha.life si sospechas de un acceso no autorizado.',
        ],
      },
      {
        title: '7. Propiedad intelectual',
        paragraphs: [
          'El sitio, su contenido, diseño y metodología pertenecen a AKSHA LIFE. Tu reporte personal es tuyo para conservarlo y usarlo con fines personales y no comerciales. No puedes revender, republicar ni redistribuir reportes o contenido del sitio sin permiso escrito.',
        ],
      },
      {
        title: '8. Uso aceptable',
        paragraphs: [
          'Te comprometes a no hacer mal uso del servicio: no intentar interrumpirlo, no acceder a datos de otras personas, no enviar datos personales de terceros sin su consentimiento y no usar el servicio con fines ilícitos.',
        ],
      },
      {
        title: '9. Limitación de responsabilidad',
        paragraphs: [
          'El servicio se ofrece "tal cual". En la máxima medida permitida por la ley, AKSHA LIFE no es responsable de daños indirectos o consecuentes derivados del uso del sitio o del reporte. Nuestra responsabilidad total se limita al monto que pagaste por el servicio.',
        ],
      },
      {
        title: '10. Cambios en estos términos',
        paragraphs: [
          'Podemos actualizar estos términos a medida que el servicio evolucione. La fecha en la parte superior siempre refleja la versión más reciente. Seguir usando el servicio después de un cambio implica que aceptas los términos actualizados.',
        ],
      },
      {
        title: '11. Contacto',
        paragraphs: [
          '¿Preguntas sobre estos términos? Escribe a purpose@aksha.life.',
        ],
      },
    ],
  },
};

const TermsOfServicePage = () => {
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

export default TermsOfServicePage;
