// Plantilla web definitiva del Mapa de Propósito (estándar top-tier 2026).
// Toma el reporte en Markdown que genera el modelo (estructura del prompt
// maestro) y lo vierte en la página aprobada en /reporte plantilla/
// reporte-top-tier-2026.html: huella de fondo, logo, módulos con color
// propio, barras de IPN, herida editorial y cierre.
//
// Diseño a prueba de variaciones: cada sección del markdown se clasifica por
// su título; lo que no se reconoce se renderiza como prosa estilizada. El
// render NUNCA lanza por contenido inesperado — si algo falla, el pipeline
// sigue y el cliente recibe su email normal.
//
// Assets autohospedados (CSP img-src 'self'): /reportes/mapa-logo.png y
// /reportes/mapa-huella.png. Como el HTML también vive en Vercel Blob, las
// referencias van absolutas a aksha.life.

const BASE_ASSETS = (process.env.APP_BASE_URL || 'https://aksha.life').replace(/\/$/, '');

const COLORES_MODULO = {
  pasion: 'var(--pasion)',
  profesion: 'var(--profesion)',
  vocacion: 'var(--vocacion)',
  mision: 'var(--mision)',
};

const ETIQUETAS_MODULO = {
  pasion: ['Pasión', 'lo que amas'],
  profesion: ['Profesión', 'en lo que eres buena'],
  vocacion: ['Vocación', 'por lo que te pagan'],
  mision: ['Misión', 'lo que el mundo necesita'],
};

const ETIQUETAS_MODULO_EN = {
  pasion: ['Passion', 'what you love'],
  profesion: ['Profession', 'what you are good at'],
  vocacion: ['Vocation', 'what you can be paid for'],
  mision: ['Mission', 'what the world needs'],
};

const TEXTOS = {
  es: {
    tituloDoc: 'Mapa de Propósito',
    mapaActivo: 'mapa activo',
    etapaVida: 'Etapa de vida',
    antesDeEmpezar: 'Antes de empezar <span class="dim">· cómo leer tu mapa</span>',
    primeroNumeros: 'Primero <span class="dim">· los números</span>',
    dimensiones: 'Tus cuatro dimensiones, medidas',
    dimensionesIntro: 'El detalle de cada una viene después. Esta es la foto completa.',
    dones: 'Dones de nacimiento',
    desafios: 'Desafíos de nacimiento',
    ventanas: 'Ventanas abiertas',
    cierre: 'Cierre',
    lema: 'La IA no crea el conocimiento. Lo conecta.',
  },
  en: {
    tituloDoc: 'Purpose Map',
    mapaActivo: 'active map',
    etapaVida: 'Life stage',
    antesDeEmpezar: 'Before you begin <span class="dim">· how to read your map</span>',
    primeroNumeros: 'First <span class="dim">· the numbers</span>',
    dimensiones: 'Your four dimensions, measured',
    dimensionesIntro: 'The detail of each one comes later. This is the full picture.',
    dones: 'Birth gifts',
    desafios: 'Birth challenges',
    ventanas: 'Open windows',
    cierre: 'Closing',
    lema: 'AI does not create knowledge. It connects it.',
  },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// **negritas** sobre texto ya escapado
function inline(str) {
  return escapeHtml(str).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function normalizar(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// El semáforo solo lleva acento en español (TENSIÓN); en inglés queda tal cual.
function etiquetaSemaforo(palabra, idioma) {
  const up = palabra.toUpperCase();
  return idioma === 'en' ? up : up.replace('TENSION', 'TENSIÓN');
}

// ── Parser ──────────────────────────────────────────────────────────────────

function clasificarTitulo(titulo) {
  const t = normalizar(titulo);
  if (/pasion|passion/.test(t)) return 'pasion';
  if (/profesion|profession/.test(t)) return 'profesion';
  if (/vocacion|vocation/.test(t)) return 'vocacion';
  if (/mision|mission/.test(t)) return 'mision';
  if (/apertura|opening/.test(t)) return 'apertura';
  if (/herida|wound/.test(t)) return 'herida';
  if (/resumen|summary|glance/.test(t)) return 'resumen';
  if (/sintesis|synthesis/.test(t)) return 'sintesis';
  if (/activando|ahora|transito|activating|now/.test(t)) return 'ahora';
  if (/camino|2026|contexto|path/.test(t)) return 'camino';
  if (/cierre|closing/.test(t)) return 'cierre';
  return 'otra';
}

// Divide el markdown en secciones por encabezados ## (los ### quedan dentro)
function seccionar(markdown) {
  const lineas = String(markdown || '').split(/\r?\n/);
  const secciones = [];
  let actual = { titulo: '', cuerpo: [] };
  for (const linea of lineas) {
    const m = linea.match(/^##(?!#)\s+(.+?)\s*$/);
    if (m) {
      if (actual.titulo || actual.cuerpo.some((l) => l.trim())) secciones.push(actual);
      actual = { titulo: m[1].replace(/\*\*/g, ''), cuerpo: [] };
    } else {
      actual.cuerpo.push(linea);
    }
  }
  if (actual.titulo || actual.cuerpo.some((l) => l.trim())) secciones.push(actual);
  return secciones.map((s) => ({ ...s, tipo: clasificarTitulo(s.titulo), texto: s.cuerpo.join('\n').trim() }));
}

// Bloques de texto separados por línea en blanco (ignora ###, --- y firma)
function bloques(texto) {
  return String(texto)
    .split(/\n\s*\n/)
    .map((b) => b
      .split('\n')
      .filter((l) => !/^\s*#{2,3}\s/.test(l) && !/^\s*(?:-{3,}|─{3,}|═{3,})\s*$/.test(l))
      .join('\n')
      .trim())
    .filter(Boolean)
    .filter((b) => !/AKSHA LIFE\s*·/i.test(b));
}

function parsearModulo(seccion, idioma) {
  const todos = bloques(seccion.texto);
  const mod = {
    tipo: seccion.tipo,
    score: null, semaforo: null, diagnostico: null, ipn: null,
    elementales: [], lectura: [], dones: '', desafios: '', ipnTexto: '',
  };

  for (const b of todos) {
    const plano = b.replace(/\*\*/g, '');
    const norm = normalizar(plano);

    const esMarcador = plano.length < 90 && /\d{1,2}\s*\/\s*20/.test(plano);
    const mScore = plano.match(/(\d{1,2})\s*\/\s*20/);
    const mSem = norm.match(/\b(flujo|tension|freno|flow|brake)\b/);
    const mDiag = norm.match(/\b(activo|en desarrollo|bloqueado|trascendido|active|in development|blocked|transcended)\b/);
    const mIpn = plano.match(/(?:índice de potencial natal|natal potential index|ipn)[^0-9]{0,12}(\d{1,3})\s*%/i);

    if (esMarcador) {
      if (mScore) mod.score = mScore[1];
      if (mSem) mod.semaforo = etiquetaSemaforo(mSem[1], idioma);
      if (mDiag) mod.diagnostico = mDiag[1].toUpperCase();
      continue;
    }
    if (/^(dones de nacimiento|birth gifts)/i.test(norm)) {
      mod.dones = plano.replace(/^(dones de nacimiento|birth gifts)[.:]?\s*/i, '');
      continue;
    }
    if (/^(desaf|birth challenges)/i.test(norm)) {
      mod.desafios = plano.replace(/^(desaf[íi]os de nacimiento|birth challenges)[.:]?\s*/i, '');
      continue;
    }
    if (mIpn) {
      mod.ipn = Math.min(100, parseInt(mIpn[1], 10));
      mod.ipnTexto = plano.replace(/^[^.]*?(\d{1,3})\s*%\.?\s*/i, '');
      continue;
    }
    // Detección suelta de marcadores fuera de bloque corto
    if (!mod.score && mScore && plano.length < 200) {
      mod.score = mScore[1];
      if (mSem) mod.semaforo = etiquetaSemaforo(mSem[1], idioma);
      if (mDiag) mod.diagnostico = mDiag[1].toUpperCase();
    }
    // Los primeros 1-2 bloques narrativos son las oraciones elementales
    if (mod.elementales.length < 2 && !mod.lectura.length) mod.elementales.push(plano);
    else mod.lectura.push(plano);
  }
  return mod;
}

function primeraFrase(texto, max = 95) {
  const limpio = String(texto || '').replace(/\*\*/g, '').trim();
  const punto = limpio.indexOf('.');
  if (punto > 15 && punto < max + 30) return limpio.slice(0, punto);
  // Sin punto cercano: cortar en la coma o espacio más razonable y elidir
  const coma = limpio.lastIndexOf(',', max);
  let frase = coma > max * 0.55 ? limpio.slice(0, coma) : limpio.slice(0, limpio.lastIndexOf(' ', max));
  frase = frase.replace(/[,;:\s]+$/, '');
  return frase.length < limpio.length ? `${frase}…` : frase;
}

// ── Render de piezas ────────────────────────────────────────────────────────

function prosa(textos, claseP = '') {
  return textos.map((b) => `<p${claseP ? ` class="${claseP}"` : ''}>${inline(b).replace(/\n/g, '<br>')}</p>`).join('\n');
}

function seccionProsa(seccion) {
  const partes = bloques(seccion.texto);
  if (!partes.length) return '';
  return `
<section class="tight"><div class="wrap rv">
  <div class="overline">${inline(seccion.titulo)}</div>
  <div class="prosa">${prosa(partes)}</div>
</div></section>`;
}

function renderNumeros(modulos, t, etiquetasModulo) {
  const conDatos = modulos.filter((m) => m.ipn != null || m.score != null);
  if (conDatos.length < 3) return '';
  const tarjetas = conDatos.map((m) => {
    const [nombre, pregunta] = etiquetasModulo[m.tipo];
    const color = COLORES_MODULO[m.tipo];
    const ipn = m.ipn != null ? m.ipn : '';
    const titular = inline(primeraFrase(m.elementales[0] || nombre));
    const resumen = m.lectura[0] ? inline(primeraFrase(m.lectura[0], 150)) + '.' : '';
    return `
      <article class="medida rv" style="--c:${color};--w:${ipn || 0}%">
        <div class="medida-top"><span class="medida-nombre">${nombre} · ${pregunta}</span>
        ${ipn !== '' ? `<span class="medida-num">${ipn}<small>% IPN</small></span>` : ''}</div>
        ${ipn !== '' ? '<div class="bar"><i></i></div>' : ''}
        <h3>${titular}</h3>
        ${resumen ? `<p>${resumen}</p>` : ''}
        <div class="estado">${m.score ? `${m.score}/20 · ` : ''}<b>${m.semaforo || ''}</b>${m.diagnostico ? ` · ${m.diagnostico.toLowerCase()}` : ''}</div>
      </article>`;
  }).join('\n');

  return `
<section><div class="wrap">
  <div class="rv">
    <div class="overline">${t.primeroNumeros}</div>
    <h2 class="sec-title">${t.dimensiones}</h2>
    <p class="sec-intro">${t.dimensionesIntro}</p>
  </div>
  <div class="medidas">${tarjetas}</div>
</div></section>`;
}

function renderModulo(mod, indice, t, etiquetasModulo) {
  const [nombre, pregunta] = etiquetasModulo[mod.tipo];
  const color = COLORES_MODULO[mod.tipo];
  const flip = indice % 2 === 1 ? ' flip' : '';
  const titulo = inline(primeraFrase(mod.elementales[0] || nombre));
  const tieneFicha = mod.dones || mod.desafios || mod.ipn != null;

  const ficha = tieneFicha ? `
    <aside class="col-side rv"><div class="ficha">
      <div class="ficha-head">
        <span class="v">${mod.score || '·'}<small>/20</small></span>
        <span class="sem">${[mod.semaforo, mod.diagnostico ? mod.diagnostico.toLowerCase() : ''].filter(Boolean).join(' · ')}</span>
      </div>
      <div class="ficha-body">
        ${mod.dones ? `<h4>${t.dones}</h4><p>${inline(mod.dones)}</p>` : ''}
        ${mod.desafios ? `<h4>${t.desafios}</h4><p>${inline(mod.desafios)}</p>` : ''}
        ${mod.ipn != null ? `<div class="ipn-line"><b>IPN ${mod.ipn}%</b>${mod.ipnTexto ? ` · ${inline(mod.ipnTexto)}` : ''}</div>` : ''}
      </div>
    </div></aside>` : '';

  return `
<section class="modulo${flip}" style="--c:${color}">
  <div class="wrap grid${tieneFicha ? '' : ' una-col'}">
    <div class="col-lead rv">
      <div class="mod-overline">${nombre} <span class="q">· ${pregunta}</span></div>
      <h2>${titulo}</h2>
      ${prosa(mod.elementales, 'elemental')}
      ${mod.lectura.length ? `<div class="mod-lectura">${prosa(mod.lectura)}</div>` : ''}
    </div>
    ${ficha}
  </div>
</section>`;
}

function renderHerida(seccion) {
  const partes = bloques(seccion.texto);
  if (!partes.length) return '';
  const ultimo = partes[partes.length - 1];
  const vuelta = ultimo.length < 220 ? partes.pop() : null;
  return `
<section class="herida"><div class="wrap rv">
  <div class="overline">${inline(seccion.titulo)}</div>
  <h2>${inline(primeraFrase(partes[0] || seccion.titulo, 120))}</h2>
  ${prosa(partes)}
  ${vuelta ? `<p class="vuelta">${inline(vuelta)}</p>` : ''}
</div></section>`;
}

function renderSintesis(seccion) {
  const partes = bloques(seccion.texto);
  if (!partes.length) return '';
  return `
<section class="converge"><div class="wrap rv">
  <div class="converge-card">
    <span class="overline">${inline(seccion.titulo)}</span>
    <div class="converge-nota" style="text-align:left">${prosa(partes)}</div>
  </div>
</div></section>`;
}

function renderAhora(seccion, t) {
  const partes = bloques(seccion.texto);
  if (!partes.length) return '';
  if (partes.length < 2 || partes.length > 5) return seccionProsa(seccion);
  const romanos = ['I', 'II', 'III', 'IV', 'V'];
  const ventanas = partes.map((b, i) => `
    <div class="ventana rv"><span class="num">${romanos[i]}</span>
      <div><p>${inline(b)}</p></div>
    </div>`).join('\n');
  return `
<section class="tight"><div class="wrap">
  <div class="rv"><div class="overline">${inline(seccion.titulo)}</div>
  <h2 class="sec-title">${t.ventanas}</h2></div>
  <div class="ventanas">${ventanas}</div>
</div></section>`;
}

function renderCierre(seccion, t) {
  const partes = bloques(seccion.texto);
  return `
<section class="cierre"><div class="wrap rv">
  <div class="overline">${t.cierre}</div>
  ${prosa(partes)}
  <div class="firma">
    <div class="sello">AKSHA LIFE</div>
    <div class="lema">${t.lema}</div>
  </div>
</div></section>`;
}

// ── Render principal ────────────────────────────────────────────────────────

export function renderReporteWeb({ nombre, reporte, idioma = 'es', fecha = new Date() }) {
  const t = TEXTOS[idioma] || TEXTOS.es;
  const etiquetasModulo = idioma === 'en' ? ETIQUETAS_MODULO_EN : ETIQUETAS_MODULO;

  const secciones = seccionar(reporte);
  const modulos = [];
  for (const s of secciones) {
    if (COLORES_MODULO[s.tipo]) modulos.push(parsearModulo(s, idioma));
  }

  const apertura = secciones.find((s) => s.tipo === 'apertura');
  const bloquesApertura = apertura ? bloques(apertura.texto) : [];
  const heroFrase = bloquesApertura[0] || '';
  const restoApertura = bloquesApertura.slice(1);
  const mEtapa = normalizar(apertura?.texto || '').match(
    /etapa de (exploracion|construccion|revision|integracion|legado)|(exploration|construction|revision|integration|legacy) stage/,
  );
  const ETAPAS = {
    exploracion: 'EXPLORACIÓN', construccion: 'CONSTRUCCIÓN', revision: 'REVISIÓN',
    integracion: 'INTEGRACIÓN', legado: 'LEGADO',
    'en:exploration': 'EXPLORATION', 'en:construction': 'CONSTRUCTION',
    'en:revision': 'REVISION', 'en:integration': 'INTEGRATION', 'en:legacy': 'LEGACY',
  };
  const claveEtapa = mEtapa ? (mEtapa[2] ? `en:${mEtapa[2]}` : mEtapa[1]) : '';
  const etapa = claveEtapa ? (ETAPAS[claveEtapa] || '') : '';

  const partesNombre = String(nombre || '').trim().split(/\s+/);
  const nombreHtml = partesNombre.length > 1
    ? `${escapeHtml(partesNombre[0])} <span class="apellido">${escapeHtml(partesNombre.slice(1).join(' '))}</span>`
    : escapeHtml(nombre || '');

  const mesAno = new Intl.DateTimeFormat(idioma === 'en' ? 'en' : 'es', { month: 'long', year: 'numeric' }).format(fecha);
  const mesAnoCap = mesAno.charAt(0).toUpperCase() + mesAno.slice(1);

  // Cuerpo: cada sección se renderiza según su tipo, en el orden original
  let indiceModulo = 0;
  let numerosPuestos = false;
  const cuerpo = [];
  for (const s of secciones) {
    if (s.tipo === 'apertura') {
      if (restoApertura.length) {
        cuerpo.push(`
<section class="tight"><div class="wrap rv">
  <div class="overline">${t.antesDeEmpezar}</div>
  <div class="prosa">${prosa(restoApertura)}</div>
</div></section>`);
      }
      continue;
    }
    if (COLORES_MODULO[s.tipo]) {
      if (!numerosPuestos) {
        cuerpo.push(renderNumeros(modulos, t, etiquetasModulo));
        numerosPuestos = true;
      }
      cuerpo.push(renderModulo(modulos[indiceModulo], indiceModulo, t, etiquetasModulo));
      indiceModulo++;
      continue;
    }
    if (s.tipo === 'herida') { cuerpo.push(renderHerida(s)); continue; }
    if (s.tipo === 'sintesis') { cuerpo.push(renderSintesis(s)); continue; }
    if (s.tipo === 'ahora') { cuerpo.push(renderAhora(s, t)); continue; }
    if (s.tipo === 'cierre') { cuerpo.push(renderCierre(s, t)); continue; }
    cuerpo.push(seccionProsa(s)); // resumen, camino, otras
  }

  return `<!DOCTYPE html>
<html lang="${idioma}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>AKSHA · ${escapeHtml(partesNombre[0] || '')} · ${t.tituloDoc}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#080d19;--bg-2:#0a1020;--card:#0d1530;--card-soft:rgba(18,28,58,.55);
  --line:rgba(201,168,76,.16);--line-soft:rgba(154,161,181,.14);
  --ink:#ece9e0;--ink-2:#c9cdd9;--muted:#8d94aa;
  --gold:#c9a84c;--gold-2:#e8c97a;
  --pasion:#ff6b6e;--profesion:#3ddc97;--vocacion:#7e9cff;--mision:#b07bff;
  --serif:'Cormorant Garamond',Georgia,serif;--sans:'DM Sans',-apple-system,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink-2);font-family:var(--sans);font-size:17px;line-height:1.75;font-weight:300;overflow-x:hidden}
body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(1100px 600px at 50% -120px,rgba(201,168,76,.07),transparent 60%),radial-gradient(900px 700px at 85% 38%,rgba(126,156,255,.045),transparent 60%),radial-gradient(900px 700px at 12% 72%,rgba(176,123,255,.04),transparent 60%)}
body::after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.035'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
main{position:relative;z-index:1}
.wrap{max-width:880px;margin:0 auto;padding:0 32px}
.fondo-huella{position:absolute;top:0;left:0;right:0;height:96vh;z-index:0;pointer-events:none;background:url("${BASE_ASSETS}/reportes/mapa-huella.png") center 22%/cover no-repeat;mix-blend-mode:screen;opacity:.6;-webkit-mask-image:linear-gradient(180deg,#000 36%,transparent 94%);mask-image:linear-gradient(180deg,#000 36%,transparent 94%)}
@media(max-width:780px){.fondo-huella{opacity:.45;height:88vh}}
h1,h2,h3{font-family:var(--serif);font-weight:500;color:var(--ink);line-height:1.16}
.overline{font-family:var(--sans);font-size:11px;font-weight:600;letter-spacing:.32em;text-transform:uppercase;color:var(--gold)}
.overline .dim{color:var(--muted);font-weight:500}
.sec-title{font-size:clamp(34px,5vw,46px);margin:14px 0 18px;letter-spacing:.01em}
.sec-intro{font-size:18px;color:var(--muted);max-width:620px;font-weight:300}
.prosa{margin-top:26px;max-width:660px}
.prosa p{margin-bottom:16px;font-size:16.5px}
.rv{opacity:0;transform:translateY(26px);transition:opacity .9s cubic-bezier(.22,.61,.36,1),transform .9s cubic-bezier(.22,.61,.36,1)}
.rv.on{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}.bar i{transition:none !important}}
.hero{min-height:92vh;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:90px 0 70px;position:relative}
.hero::after{content:"";position:absolute;left:50%;bottom:42px;transform:translateX(-50%);width:1px;height:54px;background:linear-gradient(var(--gold),transparent);opacity:.6}
.logo-hero{width:190px;height:190px;display:block;margin:0 auto 34px;filter:drop-shadow(0 0 38px rgba(201,168,76,.3))}
.marca-sub{font-size:10.5px;letter-spacing:.34em;text-transform:uppercase;color:var(--muted);margin-bottom:64px;font-weight:600}
.hero h1{font-size:clamp(50px,8.4vw,100px);font-weight:400;letter-spacing:.01em;margin-bottom:18px}
.hero h1 .apellido{color:var(--gold-2)}
.hero-meta{font-family:var(--serif);font-style:italic;font-size:21px;color:var(--muted);margin-bottom:46px}
.hero-frase{font-family:var(--serif);font-size:clamp(23px,3.2vw,30px);line-height:1.45;color:var(--ink);max-width:680px;margin:0 auto;font-weight:400}
.etapa{display:inline-flex;align-items:center;gap:14px;margin:54px auto 0;padding:10px 26px;border:1px solid var(--line);border-radius:999px;font-size:11.5px;letter-spacing:.26em;text-transform:uppercase;color:var(--ink-2)}
.etapa b{color:var(--gold);font-weight:600}
.etapa span.sep{width:3px;height:3px;border-radius:50%;background:var(--gold);opacity:.7}
.hero .ld{opacity:0;transform:translateY(18px);animation:ld 1.1s cubic-bezier(.22,.61,.36,1) forwards}
.hero .ld:nth-child(1){animation-delay:.05s}.hero .ld:nth-child(2){animation-delay:.24s}
.hero .ld:nth-child(3){animation-delay:.42s}.hero .ld:nth-child(4){animation-delay:.6s}
.hero .ld:nth-child(5){animation-delay:.78s}.hero .ld:nth-child(6){animation-delay:.98s}
@keyframes ld{to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.hero .ld{animation:none;opacity:1;transform:none}}
section{padding:108px 0;position:relative;z-index:1}
section.tight{padding:84px 0}
.medidas{display:flex;flex-direction:column;gap:18px;margin-top:54px}
.medida{border:1px solid var(--line-soft);border-left:2px solid var(--c,var(--gold));border-radius:12px;padding:26px 30px 30px;background:var(--card-soft);backdrop-filter:blur(6px)}
.medida-top{display:flex;align-items:baseline;justify-content:space-between;gap:18px;margin-bottom:4px}
.medida-nombre{font-size:12px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:var(--c,var(--gold))}
.medida-num{font-family:var(--serif);font-size:44px;color:var(--ink);line-height:1}
.medida-num small{font-size:19px;color:var(--muted);font-family:var(--sans);font-weight:300;margin-left:6px}
.bar{height:3px;background:rgba(141,148,170,.18);border-radius:99px;margin:16px 0 18px;overflow:hidden}
.bar i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--c),color-mix(in srgb,var(--c) 55%,#fff 18%));transition:width 1.6s cubic-bezier(.22,.61,.36,1) .15s}
.on .bar i{width:var(--w)}
.medida h3{font-size:25px;margin-bottom:6px}
.medida p{font-size:15.5px;color:var(--muted);max-width:640px}
.medida .estado{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-2);margin-top:14px}
.medida .estado b{color:var(--c);font-weight:600}
.modulo{padding:96px 0;border-top:1px solid var(--line-soft)}
.modulo .grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:64px;align-items:start}
.modulo .grid.una-col{grid-template-columns:1fr}
.modulo.flip .grid:not(.una-col){grid-template-columns:minmax(0,1fr) minmax(0,1.25fr)}
.modulo.flip .col-lead{order:2}
.modulo.flip .col-side{order:1}
@media(max-width:840px){.modulo .grid,.modulo.flip .grid:not(.una-col){grid-template-columns:1fr}.modulo.flip .col-lead{order:1}.modulo.flip .col-side{order:2}}
.mod-overline{display:flex;align-items:center;gap:12px;font-size:11px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:var(--c)}
.mod-overline::before{content:"";width:26px;height:1px;background:var(--c)}
.mod-overline .q{color:var(--muted);font-weight:500;letter-spacing:.18em}
.modulo h2{font-size:clamp(30px,4.2vw,40px);margin:16px 0 24px;max-width:560px}
.elemental{font-family:var(--serif);font-size:21.5px;line-height:1.6;color:var(--ink);font-weight:400}
.elemental + .elemental{margin-top:14px}
.mod-lectura{margin-top:30px;font-size:16px;color:var(--ink-2)}
.mod-lectura p+p{margin-top:14px}
.ficha{border:1px solid var(--line-soft);border-radius:14px;overflow:hidden;background:var(--card-soft)}
.ficha-head{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;border-bottom:1px solid var(--line-soft)}
.ficha-head .v{font-family:var(--serif);font-size:30px;color:var(--ink)}
.ficha-head .v small{font-size:15px;color:var(--muted);font-family:var(--sans)}
.ficha-head .sem{font-size:11px;font-weight:600;letter-spacing:.24em;color:var(--c);text-transform:uppercase}
.ficha-body{padding:22px 24px 26px}
.ficha-body h4{font-size:11px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);margin:18px 0 8px}
.ficha-body h4:first-child{margin-top:0}
.ficha-body p{font-size:15px;line-height:1.7;color:var(--ink-2)}
.ipn-line{margin-top:22px;padding-top:18px;border-top:1px solid var(--line-soft);font-size:14px;color:var(--muted)}
.ipn-line b{color:var(--ink);font-weight:500;font-family:var(--serif);font-size:19px}
.herida{text-align:center;padding:130px 0;position:relative}
.herida::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(640px 380px at 50% 42%,rgba(201,168,76,.07),transparent 70%)}
.herida h2{font-size:clamp(34px,5vw,48px);max-width:720px;margin:18px auto 40px}
.herida p{max-width:600px;margin:0 auto 22px;font-size:17.5px;text-align:left}
.herida .vuelta{font-family:var(--serif);font-style:italic;font-size:24px;color:var(--gold-2);max-width:560px;margin:44px auto 0;line-height:1.5;text-align:center}
.converge{padding:120px 0;text-align:center}
.converge-card{border:1px solid var(--line);border-radius:18px;padding:64px 56px;background:linear-gradient(180deg,rgba(201,168,76,.05),rgba(13,21,48,.4));position:relative;overflow:hidden}
.converge-card::before{content:"";position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--gold-2),transparent)}
.converge-card .overline{margin-bottom:26px;display:block}
.converge-nota{font-size:15.5px;color:var(--ink-2);max-width:620px;margin:0 auto}
.converge-nota p{margin-bottom:14px}
.ventanas{margin-top:50px;display:flex;flex-direction:column}
.ventana{display:grid;grid-template-columns:72px 1fr;gap:26px;padding:34px 8px;border-top:1px solid var(--line-soft);align-items:start}
.ventana:last-child{border-bottom:1px solid var(--line-soft)}
.ventana .num{font-family:var(--serif);font-size:40px;color:var(--gold);opacity:.55;line-height:1}
.ventana p{font-size:15.5px;color:var(--ink-2);max-width:620px}
.cierre{text-align:center;padding:140px 0 120px}
.cierre p{max-width:580px;margin:0 auto 20px;font-size:17.5px}
.firma{margin-top:70px}
.firma .sello{font-family:var(--serif);letter-spacing:.5em;text-transform:uppercase;font-size:13px;color:var(--gold)}
.firma .lema{margin-top:10px;font-family:var(--serif);font-style:italic;font-size:16px;color:var(--muted)}
strong{color:var(--ink);font-weight:500}
@media print{
  body{background:#fff;color:#1c2233;font-size:11.5pt}
  body::before,body::after,.fondo-huella{display:none}
  .hero{min-height:auto;padding:40px 0}
  section,.modulo,.herida,.converge,.cierre{padding:28px 0;page-break-inside:avoid}
  .rv,.hero .ld{opacity:1;transform:none;animation:none}
  h1,h2,h3,.elemental{color:#141a2e}
  .medida,.ficha,.converge-card{background:#fff;border-color:#d8d3c4}
}
</style>
</head>
<body>
<div class="fondo-huella" aria-hidden="true"></div>
<main>
<header class="hero wrap">
  <img class="ld logo-hero" src="${BASE_ASSETS}/reportes/mapa-logo.png" width="190" height="190" alt="AKSHA">
  <div class="ld marca-sub">${t.tituloDoc} · ${escapeHtml(mesAnoCap)}</div>
  <h1 class="ld">${nombreHtml}</h1>
  <div class="ld hero-meta">${t.mapaActivo}</div>
  ${heroFrase ? `<p class="ld hero-frase">${inline(heroFrase)}</p>` : ''}
  ${etapa ? `<div class="ld" style="display:flex;justify-content:center"><span class="etapa">${t.etapaVida} <span class="sep"></span> <b>${etapa}</b></span></div>` : ''}
</header>
${cuerpo.join('\n')}
</main>
<script>
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}})},{threshold:.18,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
</script>
</body>
</html>`;
}
