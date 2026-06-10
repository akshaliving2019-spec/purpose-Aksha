// Servicio de email usando Resend (gratis hasta 3,000 emails/mes)
// Instalar: npm install resend

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function enviarReporte({ nombre, email, reporte }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY no configurada');
    // Por ahora enviamos a tu email como respaldo
    await enviarNotificacionInterna({ nombre, email, reporte });
    return;
  }

  const primerNombre = nombre.split(' ')[0];

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AKSHA LIFE <reportes@aksha.life>',
      to: [email],
      subject: `${primerNombre}, tu Mapa de Propósito está listo ✨`,
      html: formatearEmailHTML(nombre, reporte),
      text: reporte,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error enviando email: ${error}`);
  }

  console.log('✅ Email enviado a:', email);
  return await response.json();
}

// Notificación interna mientras Resend no está configurado
async function enviarNotificacionInterna({ nombre, email, reporte }) {
  console.log('📧 REPORTE GENERADO — enviar manualmente a:', email);
  console.log('👤 Cliente:', nombre);
  console.log('📄 Reporte:', reporte.substring(0, 500) + '...');

  // También notificamos a AKSHA con los datos
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Sistema AKSHA <sistema@aksha.life>',
      to: ['Purpose@aksha.life'],
      subject: `🔔 Nuevo reporte generado — ${nombre}`,
      text: `Nuevo cliente: ${nombre}\nEmail: ${email}\n\nREPORTE:\n${reporte}`,
    }),
  });
}

function formatearEmailHTML(nombre, reporte) {
  const primerNombre = escapeHtml(nombre.split(' ')[0]);
  // Convertir el Markdown ligero del reporte a HTML básico
  // (escapado primero; títulos antes de convertir saltos de línea)
  const reporteHTML = escapeHtml(reporte)
    .replace(/^### (.+)$/gm, '<h3 style="color:#D4AF37">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#D4AF37">$1</h2>')
    .replace(/^# (.+)$/gm, '<h2 style="color:#D4AF37">$1</h2>')
    .replace(/^(?:---+|─{3,})$/gm, '<hr style="border:none;border-top:1px solid rgba(212,175,55,0.3)">')
    .replace(/^- (.+)$/gm, '<div style="margin:4px 0 4px 16px">• $1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #07142F; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 680px; margin: 0 auto; padding: 40px 24px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { color: #D4AF37; font-size: 28px; font-weight: bold; letter-spacing: 4px; }
    .subtitle { color: rgba(212,175,55,0.7); font-size: 14px; letter-spacing: 2px; }
    .greeting { font-size: 22px; color: #ffffff; margin-bottom: 8px; }
    .intro { color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.8; margin-bottom: 32px; }
    .reporte { color: rgba(255,255,255,0.85); font-size: 15px; line-height: 1.9; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(212,175,55,0.2); text-align: center; }
    .footer p { color: rgba(255,255,255,0.4); font-size: 13px; }
    h2 { color: #D4AF37; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">AKSHA LIFE</div>
      <div class="subtitle">TU MAPA DE PROPÓSITO</div>
    </div>

    <p class="greeting">${primerNombre},</p>
    <p class="intro">
      Tu Mapa de Propósito ha sido generado. Lo que encontrarás en este reporte
      es el resultado de conectar los patrones únicos de tu nacimiento con el contexto
      actual del mundo — para que puedas actuar con claridad.
    </p>

    <div class="reporte">
      ${reporteHTML}
    </div>

    <div class="footer">
      <p>AKSHA LIFE · aksha.life</p>
      <p>Si tienes preguntas, escríbenos a Purpose@aksha.life</p>
      <p style="color:rgba(212,175,55,0.5); margin-top:16px;">
        "La IA no crea el conocimiento. Lo conecta."
      </p>
    </div>
  </div>
</body>
</html>`;
}
