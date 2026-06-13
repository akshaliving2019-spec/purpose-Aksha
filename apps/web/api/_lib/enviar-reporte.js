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

// La variable puede venir con texto extra pegado; extraemos la key re_...
const RESEND_API_KEY = ((process.env.RESEND_API_KEY || '').match(/re_[A-Za-z0-9_-]{10,}/) ||
  [(process.env.RESEND_API_KEY || '').trim()])[0];

// Copia oculta de auditoría/compliance (pedida por el dueño): cada reporte
// que sale a un cliente — envío directo o aprobado en revisión — llega
// también a este buzón, idéntico a lo que recibió el cliente. Se cambia con
// AUDITORIA_EMAIL; ponerla en '0' lo apaga.
const EMAIL_AUDITORIA = (() => {
  const valor = (process.env.AUDITORIA_EMAIL ?? 'developer@basileasystems.com').trim();
  return valor && valor !== '0' ? valor : '';
})();

async function enviarConResend(payload, descripcion) {
  let ultimoError;
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) return await response.json();
      const cuerpo = await response.text();
      ultimoError = new Error(`Resend ${response.status}: ${cuerpo}`);
      // 4xx no se resuelve reintentando (key inválida, destinatario mal, etc.)
      if (response.status < 500) throw ultimoError;
    } catch (error) {
      ultimoError = error;
      if (String(error).includes('Resend 4')) throw error;
    }
    console.warn(`Reintentando ${descripcion} (intento ${intento}/3)...`);
    await new Promise((r) => setTimeout(r, intento * 2000));
  }
  throw ultimoError;
}

export async function enviarReporte({ nombre, email, reporte, urlWeb = '', idioma = 'es' }) {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY no configurada');
    await enviarNotificacionInterna({ nombre, email, reporte });
    throw new Error('RESEND_API_KEY no configurada — email no enviado');
  }

  const primerNombre = nombre.split(' ')[0];
  const t = TEXTOS_EMAIL[idioma] || TEXTOS_EMAIL.es;

  const resultado = await enviarConResend({
    from: 'AKSHA LIFE <reportes@aksha.life>',
    to: [email],
    ...(EMAIL_AUDITORIA && EMAIL_AUDITORIA.toLowerCase() !== email.toLowerCase()
      ? { bcc: [EMAIL_AUDITORIA] }
      : {}),
    subject: t.asunto(primerNombre),
    html: formatearEmailHTML(nombre, reporte, '', urlWeb, idioma),
    text: (urlWeb ? `${t.abrirWeb} ${urlWeb}\n\n` : '') + reporte,
  }, `email a ${email}`);

  console.log('✅ Email enviado a:', email);
  return resultado;
}

// Reporte en modo revisión: va a la revisora (no al cliente) con el reporte
// completo tal como lo recibiría el cliente y un botón "Aprobar y enviar".
export async function enviarReporteRevision({
  nombre, emailCliente, emailRevisora, reporte, urlWeb = '', linkAprobacion, linkFeedback, paymentIntentId, validacion,
}) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY no configurada — email de revisión no enviado');
  }

  const bloqueValidacion = !validacion
    ? ''
    : validacion.ok
      ? `<p style="color:#7DDF9A;font-size:14px;margin:0 0 16px;">Validación automática: posiciones coherentes con Swiss Ephemeris y estilo editorial limpio (sin emojis).</p>`
      : `<div style="background-color:#211931;border:1px solid #712835;border-radius:6px;padding:12px 16px;margin:0 0 16px;">
          <p style="color:#FF9B9B;font-size:14px;margin:0 0 8px;"><strong>La validación automática (efemérides + estilo) encontró observaciones:</strong></p>
          ${validacion.errores.map((e) => `<p style="color:#FF9B9B;font-size:13px;margin:0 0 4px;">&#8226; ${escapeHtml(e)}</p>`).join('')}
          <p style="color:#8E94A6;font-size:12px;margin:8px 0 0;">Revisa estos puntos antes de aprobar.</p>
        </div>`;

  const banner = `
    <div style="background-color:#172031;border:1px solid #635A33;border-radius:8px;padding:22px 24px;margin-bottom:8px;">
      <p style="color:#C9A84C;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 10px;"><strong>Modo revisión — aún no enviado al cliente</strong></p>
      <p style="color:#D9D5C9;font-size:14px;margin:0 0 4px;">Cliente: <strong>${escapeHtml(nombre)}</strong> &lt;${escapeHtml(emailCliente)}&gt;</p>
      <p style="color:#D9D5C9;font-size:14px;margin:0 0 16px;">Pedido: ${escapeHtml(paymentIntentId || '')}</p>
      ${bloqueValidacion}
      ${urlWeb ? `<p style="color:#D9D5C9;font-size:14px;margin:0 0 16px;">Versión web que verá el cliente: <a href="${urlWeb}" style="color:#E8C97A;">abrir el Mapa</a></p>` : ''}
      <a href="${linkAprobacion}" style="display:inline-block;background-color:#C9A84C;color:#07142F;font-weight:bold;font-size:15px;padding:12px 24px;border-radius:6px;text-decoration:none;margin:0 12px 10px 0;">Aprobar y enviar al cliente</a>
      ${linkFeedback ? `<a href="${linkFeedback}" style="display:inline-block;background-color:transparent;border:1px solid #C9A84C;color:#C9A84C;font-weight:bold;font-size:15px;padding:11px 24px;border-radius:6px;text-decoration:none;margin:0 0 10px;">Observaciones / Rechazar</a>` : ''}
      <p style="color:#8E94A6;font-size:12px;margin:8px 0 0;">Con "Observaciones" registras qué mejorar y, si quieres, el reporte se regenera incorporándolas.</p>
    </div>`;

  const resultado = await enviarConResend({
    from: 'Sistema AKSHA <sistema@aksha.life>',
    to: [emailRevisora],
    subject: `Para tu revisión: Mapa de Propósito de ${nombre.split(' ')[0]}`,
    html: formatearEmailHTML(nombre, reporte, banner),
    text:
      `REVISIÓN PENDIENTE — ${nombre} <${emailCliente}>\n` +
      `Pedido: ${paymentIntentId || ''}\n` +
      `Aprobar y enviar al cliente: ${linkAprobacion}\n` +
      (linkFeedback ? `Observaciones / rechazar: ${linkFeedback}\n` : '') +
      `\n${reporte}`,
  }, `email de revisión a ${emailRevisora}`);

  console.log('✅ Email de revisión enviado a:', emailRevisora);
  return resultado;
}

// Aviso operativo al buzón interno de AKSHA (fallos del pipeline, etc.)
export async function enviarAlertaInterna({ asunto, texto }) {
  if (!RESEND_API_KEY) {
    console.error('❌ Sin RESEND_API_KEY — alerta interna solo en logs:', asunto);
    return;
  }
  return enviarConResend({
    from: 'Sistema AKSHA <sistema@aksha.life>',
    to: ['Purpose@aksha.life'],
    subject: asunto,
    text: texto,
  }, 'alerta interna');
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

// ─────────────────────────────────────────────────────────────────────────────
// Render del reporte (Markdown ligero → HTML de email)
//
// Paleta y tipografía alineadas con los Purpose Maps publicados en
// /public/reportes (navy #07142F, oro #C9A84C/#E8C97A, marfil #F0ECE4).
// Todo va con estilos inline y layout de tablas porque los clientes de correo
// (Gmail, Outlook) recortan o ignoran <style>; los webfonts no cargan en email,
// por eso Georgia hace de serif editorial.

const FUENTE_SERIF = "Georgia,'Times New Roman',serif";

const TEXTOS_EMAIL = {
  es: {
    asunto: (nombre) => `${nombre}, tu Mapa de Propósito está listo`,
    producto: 'Mapa de Propósito',
    preheader: 'Tu lectura completa: los cuatro módulos Ikigai, tus dones y desafíos de nacimiento, Quirón y los tránsitos de este ciclo.',
    intro: `Tu Mapa de Propósito está listo. Lo que vas a leer es el resultado de conectar
                los patrones únicos de tu nacimiento con el contexto actual del mundo —
                para que puedas actuar con claridad.`,
    botonMapa: 'Abrir tu Mapa en la web',
    botonNota: 'La misma lectura, en su versión interactiva. Abajo la tienes completa en este correo.',
    abrirWeb: 'Abre tu Mapa en la web:',
    contacto: 'Si tienes preguntas, escríbenos a',
    lema: 'La IA no crea el conocimiento. Lo conecta.',
  },
  en: {
    asunto: (nombre) => `${nombre}, your Purpose Map is ready`,
    producto: 'Purpose Map',
    preheader: 'Your full reading: the four Ikigai modules, your birth gifts and challenges, and the windows of this cycle.',
    intro: `Your Purpose Map is ready. What you are about to read connects the unique
                patterns of your birth with the world as it is today —
                so you can act with clarity.`,
    botonMapa: 'Open your Map on the web',
    botonNota: 'The same reading, in its interactive version. The full text is below in this email.',
    abrirWeb: 'Open your Map on the web:',
    contacto: 'Questions? Write to us at',
    lema: 'AI does not create knowledge. It connects it.',
  },
};

const ESTILO = {
  p: `margin:0 0 18px;color:#D9D5C9;font-family:${FUENTE_SERIF};font-size:16px;line-height:1.85;`,
  h2: `margin:38px 0 16px;padding:30px 0 0;border-top:1px solid #1C2B4D;color:#C9A84C;font-family:${FUENTE_SERIF};font-size:23px;line-height:1.35;font-weight:normal;letter-spacing:0.03em;`,
  h3: `margin:28px 0 10px;color:#E8C97A;font-family:${FUENTE_SERIF};font-size:18px;line-height:1.45;font-weight:bold;letter-spacing:0.02em;`,
  ul: `margin:0 0 20px;padding:0 0 0 22px;`,
  li: `margin:0 0 10px;color:#C9A84C;font-family:${FUENTE_SERIF};font-size:16px;line-height:1.8;`,
  liTexto: `color:#D9D5C9;`,
  hr: `border:none;border-top:1px solid #1C2B4D;margin:34px 0;font-size:0;line-height:0;`,
  strong: `color:#F3EFE3;`,
};

// Convierte el Markdown ligero del reporte (##/###, **negritas**, listas con -,
// separadores ---) en bloques HTML reales: párrafos con aire, listas agrupadas
// y jerarquía tipográfica, en lugar de un muro de <br>.
export function reporteAHtml(reporte) {
  const negritas = (s) => s.replace(/\*\*([^*]+)\*\*/g, `<strong style="${ESTILO.strong}">$1</strong>`);
  const lineas = escapeHtml(reporte).split(/\r?\n/);

  const bloques = [];
  let parrafo = [];
  let lista = [];

  const cerrarParrafo = () => {
    if (!parrafo.length) return;
    bloques.push(`<p style="${ESTILO.p}">${parrafo.map(negritas).join('<br>')}</p>`);
    parrafo = [];
  };
  const cerrarLista = () => {
    if (!lista.length) return;
    const items = lista
      .map((item) => `<li style="${ESTILO.li}"><span style="${ESTILO.liTexto}">${negritas(item)}</span></li>`)
      .join('');
    bloques.push(`<ul style="${ESTILO.ul}">${items}</ul>`);
    lista = [];
  };

  for (const cruda of lineas) {
    const linea = cruda.trim();
    if (!linea) {
      cerrarParrafo();
      cerrarLista();
      continue;
    }
    let m;
    if ((m = linea.match(/^###\s+(.+)$/))) {
      cerrarParrafo(); cerrarLista();
      bloques.push(`<h3 style="${ESTILO.h3}">${negritas(m[1])}</h3>`);
    } else if ((m = linea.match(/^##?\s+(.+)$/))) {
      cerrarParrafo(); cerrarLista();
      bloques.push(`<h2 style="${ESTILO.h2}">${negritas(m[1])}</h2>`);
    } else if (/^(?:-{3,}|─{3,}|═{3,}|_{3,})$/.test(linea)) {
      cerrarParrafo(); cerrarLista();
      bloques.push(`<hr style="${ESTILO.hr}">`);
    } else if ((m = linea.match(/^[-•·]\s+(.+)$/))) {
      cerrarParrafo();
      lista.push(m[1]);
    } else {
      cerrarLista();
      parrafo.push(linea);
    }
  }
  cerrarParrafo();
  cerrarLista();

  return bloques.join('\n');
}

export function formatearEmailHTML(nombre, reporte, encabezadoExtra = '', urlWeb = '', idioma = 'es') {
  const t = TEXTOS_EMAIL[idioma] || TEXTOS_EMAIL.es;
  const primerNombre = escapeHtml(nombre.split(' ')[0]);
  const reporteHTML = reporteAHtml(reporte);
  const botonMapa = urlWeb ? `
          <tr>
            <td align="center" class="pad-lateral" style="padding:34px 36px 0;">
              <a href="${urlWeb}" style="display:inline-block;background-color:#C9A84C;color:#07142F;font-family:${FUENTE_SERIF};font-weight:bold;font-size:16px;letter-spacing:0.04em;padding:15px 34px;border-radius:8px;text-decoration:none;">${t.botonMapa}</a>
              <p style="margin:14px 0 0;color:#8E94A6;font-family:${FUENTE_SERIF};font-size:13px;">${t.botonNota}</p>
            </td>
          </tr>` : '';
  const preheader = t.preheader;

  return `<!DOCTYPE html>
<html lang="${idioma}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>AKSHA · ${t.producto}</title>
  <style>
    body { margin:0; padding:0; background-color:#07142F; }
    a { color:#E8C97A; }
    @media (max-width:520px) {
      .pad-lateral { padding-left:22px !important; padding-right:22px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#07142F;" bgcolor="#07142F">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#07142F" style="background-color:#07142F;">
    <tr>
      <td align="center" style="padding:8px 12px 48px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;">
          ${encabezadoExtra ? `<tr><td class="pad-lateral" style="padding:32px 36px 0;">${encabezadoExtra}</td></tr>` : ''}
          <tr>
            <td align="center" class="pad-lateral" style="padding:56px 36px 0;">
              <div style="color:#C9A84C;font-family:${FUENTE_SERIF};font-size:26px;font-weight:bold;letter-spacing:0.4em;">AKSHA&nbsp;LIFE</div>
              <div style="color:#8E94A6;font-family:${FUENTE_SERIF};font-size:11px;letter-spacing:0.34em;text-transform:uppercase;margin-top:12px;">${t.producto}</div>
              <div style="width:64px;border-top:1px solid #C9A84C;margin:28px auto 0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="pad-lateral" style="padding:46px 36px 0;">
              <p style="margin:0 0 14px;color:#F0ECE4;font-family:${FUENTE_SERIF};font-size:25px;line-height:1.3;">${primerNombre},</p>
              <p style="margin:0;color:#A9AEB9;font-family:${FUENTE_SERIF};font-size:16px;line-height:1.85;">
                ${t.intro}
              </p>
            </td>
          </tr>${botonMapa}
          <tr>
            <td class="pad-lateral" style="padding:10px 36px 0;">
              ${reporteHTML}
            </td>
          </tr>
          <tr>
            <td align="center" class="pad-lateral" style="padding:44px 36px 0;">
              <div style="width:64px;border-top:1px solid #1C2B4D;margin:0 auto 26px;font-size:0;line-height:0;">&nbsp;</div>
              <p style="margin:0 0 8px;color:#8E94A6;font-family:${FUENTE_SERIF};font-size:13px;letter-spacing:0.08em;">AKSHA LIFE · aksha.life</p>
              <p style="margin:0 0 20px;color:#8E94A6;font-family:${FUENTE_SERIF};font-size:13px;">
                ${t.contacto}
                <a href="mailto:Purpose@aksha.life" style="color:#C9A84C;text-decoration:none;">Purpose@aksha.life</a>
              </p>
              <p style="margin:0;color:#C9A84C;font-family:${FUENTE_SERIF};font-size:14px;font-style:italic;">${t.lema}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
