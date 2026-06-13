import { put } from '@vercel/blob';

// Determinación del elemento más débil del cliente para el plan de 4 semanas.
// El elemento se deriva del propio reporte (no se vuelve a calcular astrología):
// módulo de menor puntuación /20; desempate menor IPN %; segundo desempate por
// orden fijo. Si el reporte es viejo o ilegible, fallback determinista por carta.
//
// Mapeo (decisión del dueño): Pasión=fuego, Profesión=tierra, Vocación=aire,
// Misión=agua. La palabra "elemento" y los nombres fuego/tierra/aire/agua NO
// aparecen jamás en el texto al cliente; son etiquetas internas de routing.

// Orden de desempate (índice menor gana): Vocación > Misión > Pasión > Profesión.
const MODULOS = [
  { clave: 'vocacion', elemento: 'aire',   orden: 0, re: /vocaci[oó]n|vocation/i },
  { clave: 'mision',   elemento: 'agua',   orden: 1, re: /misi[oó]n|mission/i },
  { clave: 'pasion',   elemento: 'fuego',  orden: 2, re: /pasi[oó]n|passion/i },
  { clave: 'profesion',elemento: 'tierra', orden: 3, re: /profesi[oó]n|profession/i },
];

const SIGNO_ELEMENTO = {
  // fuego
  aries: 'fuego', leo: 'fuego', sagitario: 'fuego', sagittarius: 'fuego',
  // tierra
  tauro: 'tierra', taurus: 'tierra', virgo: 'tierra', capricornio: 'tierra', capricorn: 'tierra',
  // aire
  geminis: 'aire', gemini: 'aire', libra: 'aire', acuario: 'aire', aquarius: 'aire',
  // agua
  cancer: 'agua', 'cáncer': 'agua', escorpio: 'agua', scorpio: 'agua',
  piscis: 'agua', pisces: 'agua',
};

const PERSONALES = ['sol', 'sun', 'luna', 'moon', 'mercurio', 'mercury',
  'venus', 'marte', 'mars'];

function normalizar(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Divide el reporte en secciones por encabezado `## ...` y, para cada módulo,
// extrae score /20 e IPN % del cuerpo (regex tolerante es/en).
function parsearModulos(reporteMd) {
  const lineas = String(reporteMd || '').split(/\r?\n/);
  const secciones = [];
  let actual = null;
  for (const linea of lineas) {
    const m = linea.match(/^##(?!#)\s+(.+?)\s*$/);
    if (m) {
      if (actual) secciones.push(actual);
      actual = { titulo: m[1].replace(/\*\*/g, ''), cuerpo: [] };
    } else if (actual) {
      actual.cuerpo.push(linea);
    }
  }
  if (actual) secciones.push(actual);

  const resultado = {};
  for (const sec of secciones) {
    const titNorm = normalizar(sec.titulo);
    const def = MODULOS.find((mod) => mod.re.test(titNorm));
    if (!def || resultado[def.clave]) continue; // primer match por módulo
    const cuerpo = sec.cuerpo.join('\n');
    const mScore = cuerpo.match(/(\d{1,2})\s*\/\s*20/);
    const mIpn = cuerpo.match(/(?:[ií]ndice de potencial natal|natal potential index|ipn)[^0-9]{0,12}(\d{1,3})\s*%/i);
    if (!mScore) continue;
    resultado[def.clave] = {
      score: parseInt(mScore[1], 10),
      ipn: mIpn ? Math.min(100, parseInt(mIpn[1], 10)) : 101, // sin IPN = peor en desempate
      def,
    };
  }
  return resultado;
}

// Fallback: cuenta planetas personales por elemento del signo; el elemento con
// MENOS personales es el débil. Empate → orden fuego>tierra>aire>agua? No: usamos
// el orden de desempate de módulos mapeado a elemento (aire,agua,fuego,tierra).
function elementoPorCarta(carta) {
  const conteo = { fuego: 0, tierra: 0, aire: 0, agua: 0 };
  for (const p of (carta?.planetas || [])) {
    if (!PERSONALES.includes(normalizar(p.nombre))) continue;
    const elem = SIGNO_ELEMENTO[normalizar(p.signo)];
    if (elem) conteo[elem]++;
  }
  // Sin datos utilizables (carta vacía o ilegible): fallback seguro a agua
  // (Misión), el documentado para el caso degenerado.
  const total = conteo.fuego + conteo.tierra + conteo.aire + conteo.agua;
  if (total === 0) return 'agua';
  // Orden de preferencia cuando hay empate de conteo (mismo orden de módulos):
  const preferencia = ['aire', 'agua', 'fuego', 'tierra'];
  let mejor = null;
  for (const elem of preferencia) {
    if (mejor === null || conteo[elem] < conteo[mejor]) mejor = elem;
  }
  return mejor || 'agua';
}

// Devuelve { elemento, modulo, score, ipn, via } donde via ∈ 'parseo'|'fallback'.
export function calcularElementoDebil(reporteMd, carta) {
  const modulos = parsearModulos(reporteMd);
  const presentes = Object.values(modulos);

  if (presentes.length >= 1) {
    presentes.sort((a, b) =>
      (a.score - b.score) || (a.ipn - b.ipn) || (a.def.orden - b.def.orden));
    const ganador = presentes[0];
    return {
      elemento: ganador.def.elemento,
      modulo: ganador.def.clave,
      score: ganador.score,
      ipn: ganador.ipn === 101 ? null : ganador.ipn,
      via: 'parseo',
    };
  }

  const elemento = elementoPorCarta(carta);
  const def = MODULOS.find((mod) => mod.elemento === elemento);
  return { elemento, modulo: def ? def.clave : 'mision', score: null, ipn: null, via: 'fallback' };
}

// Sube SIEMPRE el reporte.md como insumo de los emails semanales. URL
// impredecible (sufijo aleatorio + noindex global de /api y blobs), mismo
// criterio que mapas/ y revisiones/. Devuelve '' si falla (el plan se omite).
export async function guardarReporteMd(paymentIntentId, reporteMd) {
  try {
    const { url } = await put(`reportes-md/${paymentIntentId}.md`, String(reporteMd || ''), {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'text/markdown; charset=utf-8',
    });
    return url;
  } catch (error) {
    console.warn(`⚠️ [${paymentIntentId}] reporte.md no guardado en Blob:`, String(error).slice(0, 200));
    return '';
  }
}

// El avance semanal vive en UNA sola clave plan_log (JSON < 500 chars) para no
// gastar 8 claves de metadata (plan_semana_<n>_at × 4 + plan_intentos_<n> × 4).
export function parsearPlanLog(raw) {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

export function construirPlanLog(logActual, semana, atIso, intentos) {
  const log = { ...(logActual || {}) };
  log[`s${semana}`] = { at: atIso, n: intentos };
  return JSON.stringify(log);
}

// Metadata a escribir cuando el cliente RECIBE el reporte (envío directo o
// aprobación en revisión): fija la base del plan de 4 semanas.
export function metadataBasePlan({ elemento, reporteMdUrl }) {
  return {
    plan_elemento: elemento,
    plan_semana: '0',
    plan_base_at: new Date().toISOString(),
    reporte_md_url: reporteMdUrl || '',
  };
}

const SEMANA_MS = 7 * 24 * 3600 * 1000;
const MAX_INTENTOS_SEMANA = 3;

// ¿Qué semana del plan toca enviar a este pedido ahora? Devuelve 1..4 o 0.
// Regla: reporte enviado, plan_semana<4, y han pasado 7·(plan_semana+1) días
// desde plan_base_at. Si esa semana ya acumuló 3 intentos en plan_log, 0.
export function semanaPendiente(metadata, ahoraMs = Date.now()) {
  const md = metadata || {};
  if (md.reporte_status !== 'enviado') return 0;
  if (!md.plan_base_at) return 0;
  const base = Date.parse(md.plan_base_at);
  if (!Number.isFinite(base)) return 0;
  const hechas = parseInt(md.plan_semana || '0', 10);
  if (!(hechas >= 0) || hechas >= 4) return 0;
  const proxima = hechas + 1;
  if (ahoraMs < base + SEMANA_MS * proxima) return 0;
  const log = parsearPlanLog(md.plan_log);
  const entrada = log[`s${proxima}`];
  if (entrada && Number(entrada.n) >= MAX_INTENTOS_SEMANA) return 0;
  return proxima;
}
