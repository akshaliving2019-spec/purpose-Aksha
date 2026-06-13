// Prueba del cálculo del elemento débil: parseo de marcadores (es/en),
// desempates y fallback determinista por carta.
// Uso: node tools/test-plan-elemento.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { calcularElementoDebil } from '../apps/web/api/_lib/plan-elemento.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reporteJohan = readFileSync(
  join(__dirname, '../ejemplos-privados/ensayo-johan/reporte.md'), 'utf8',
);

let fallos = 0;
const check = (nombre, cond, detalle = '') => {
  console.log(`${cond ? 'OK' : 'FALLA'} — ${nombre}${detalle ? ' :: ' + detalle : ''}`);
  if (!cond) fallos++;
};

// 1) Reporte real de Johan → Misión 8/20 → agua, por parseo.
const johan = calcularElementoDebil(reporteJohan, null);
check('Johan: elemento agua (Misión 8/20)', johan.elemento === 'agua',
  `elemento=${johan.elemento} modulo=${johan.modulo} via=${johan.via}`);
check('Johan: vía parseo (no fallback)', johan.via === 'parseo');

// 2) Reporte en inglés con Profession como menor /20 → tierra.
const reporteEn = `## Passion · What you love
9/20 · FLOW · ACTIVE
IPN 70%. reading line.
## Profession · What you are good at
6/20 · TENSION · IN DEVELOPMENT
IPN 50%. reading line.
## Vocation · What you can be paid for
8/20 · FLOW · ACTIVE
IPN 40%. reading line.
## Mission · What the world needs
8/20 · FLOW · ACTIVE
IPN 60%. reading line.`;
const en = calcularElementoDebil(reporteEn, null);
check('EN: Profession 6/20 → tierra', en.elemento === 'tierra',
  `elemento=${en.elemento} modulo=${en.modulo}`);

// 3) Empate de puntuación → desempata el IPN menor.
//    Pasión y Misión ambas 8/20; IPN Misión 30% < Pasión 55% → agua.
const empateIpn = `## Pasión · Lo que amas
8/20 · TENSIÓN · ACTIVO
IPN 55%. linea.
## Profesión · En lo que eres bueno
15/20 · FLUJO · ACTIVO
IPN 80%. linea.
## Vocación · Por lo que te pagan
12/20 · FRENO · EN DESARROLLO
IPN 60%. linea.
## Misión · Lo que el mundo necesita
8/20 · FLUJO · EN DESARROLLO
IPN 30%. linea.`;
const e1 = calcularElementoDebil(empateIpn, null);
check('Empate /20 → desempata IPN menor (Misión=agua)', e1.elemento === 'agua',
  `elemento=${e1.elemento}`);

// 4) Empate de /20 y de IPN → orden Vocación > Misión > Pasión > Profesión.
//    Vocación y Misión 8/20 e IPN 40% → gana Vocación (aire).
const empateOrden = `## Pasión · Lo que amas
15/20 · FLUJO · ACTIVO
IPN 80%. linea.
## Profesión · En lo que eres bueno
15/20 · FLUJO · ACTIVO
IPN 80%. linea.
## Vocación · Por lo que te pagan
8/20 · FRENO · EN DESARROLLO
IPN 40%. linea.
## Misión · Lo que el mundo necesita
8/20 · FLUJO · EN DESARROLLO
IPN 40%. linea.`;
const e2 = calcularElementoDebil(empateOrden, null);
check('Empate /20 e IPN → orden gana Vocación (aire)', e2.elemento === 'aire',
  `elemento=${e2.elemento}`);

// 5) Reporte ilegible → fallback por carta. Carta con personales casi todos
//    en signos de agua (Cáncer/Escorpio/Piscis), ninguno en aire → débil = aire.
const cartaAire = { planetas: [
  { nombre: 'Sol', signo: 'Cáncer' }, { nombre: 'Luna', signo: 'Escorpio' },
  { nombre: 'Mercurio', signo: 'Piscis' }, { nombre: 'Venus', signo: 'Aries' },
  { nombre: 'Marte', signo: 'Tauro' },
] };
const fb = calcularElementoDebil('texto sin marcadores', cartaAire);
check('Fallback: ningún personal en aire → débil aire', fb.elemento === 'aire',
  `elemento=${fb.elemento} via=${fb.via}`);
check('Fallback: vía fallback', fb.via === 'fallback');

// 6) Sin reporte y sin carta → fallback seguro a 'agua' (Misión, último módulo).
const vacio = calcularElementoDebil('', null);
check('Sin datos → fallback seguro a agua', vacio.elemento === 'agua', `via=${vacio.via}`);

// ── plan_log: empaquetado/lectura en una sola clave ──
import { construirPlanLog, parsearPlanLog, metadataBasePlan } from '../apps/web/api/_lib/plan-elemento.js';

const log0 = parsearPlanLog(undefined);
check('plan_log vacío → objeto vacío', JSON.stringify(log0) === '{}');

const log1 = construirPlanLog(log0, 1, '2026-06-19T14:00:00.000Z', 1);
check('plan_log tras semana 1 tiene s1.at', log1.includes('"s1"') && log1.includes('2026-06-19'));
const leido = parsearPlanLog(log1);
check('plan_log s1.n = 1', leido.s1 && leido.s1.n === 1);

const log2 = construirPlanLog(parsearPlanLog(log1), 1, '2026-06-19T14:00:00.000Z', 2);
check('plan_log reintento semana 1 → s1.n = 2', parsearPlanLog(log2).s1.n === 2);
check('plan_log se mantiene bajo 500 chars', construirPlanLog(
  { s1: { at: '2026-06-19T14:00:00.000Z', n: 3 }, s2: { at: '2026-06-26T14:00:00.000Z', n: 3 },
    s3: { at: '2026-07-03T14:00:00.000Z', n: 3 }, s4: { at: '2026-07-10T14:00:00.000Z', n: 3 } },
  4, '2026-07-10T14:00:00.000Z', 3).length < 500);

const base = metadataBasePlan({ elemento: 'agua', reporteMdUrl: 'https://blob/reportes-md/x.md' });
check('metadataBasePlan fija plan_semana 0', base.plan_semana === '0');
check('metadataBasePlan fija plan_elemento', base.plan_elemento === 'agua');
check('metadataBasePlan incluye reporte_md_url', base.reporte_md_url === 'https://blob/reportes-md/x.md');
check('metadataBasePlan fija plan_base_at ISO', /^\d{4}-\d\d-\d\dT/.test(base.plan_base_at));

if (fallos) { console.error(`\n${fallos} comprobaciones fallaron.`); process.exit(1); }
console.log('\nPrueba superada.');
