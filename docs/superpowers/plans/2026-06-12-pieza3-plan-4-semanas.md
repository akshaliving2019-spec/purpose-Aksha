# Pieza 3 — Plan de 4 semanas por elemento débil · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tras enviar el Mapa de Propósito al cliente, determinar su elemento más débil parseando los marcadores del propio reporte, guardar el reporte.md en Blob y enviar automáticamente 4 emails semanales (+7/14/21/28 días) generados por IA con `claude-sonnet-4-6`, en su idioma, sin base de datos nueva — todo el estado vive en la metadata del PaymentIntent.

**Architecture:** Un helper compartido `_lib/plan-elemento.js` calcula el elemento débil (parseo de marcadores con fallback determinista por carta) y sube el reporte.md a Blob; lo invocan los DOS puntos donde el cliente recibe el reporte (envío directo en `pipeline-reporte.js` y aprobación en revisión en `aprobar-reporte.js`). Un cron diario nuevo `api/plan-semanal.js` (14:00 UTC) lista PaymentIntents que tocan email semanal, genera el contenido con un prompt nuevo `_lib/prompt-plan-semanal.js`, lo valida con `validarReporte` parametrizado (min 400 / max 1100) y lo envía con una plantilla nueva `enviarPlanSemanal` en `enviar-reporte.js`. Sin estados nuevos en la máquina de Stripe.

**Tech Stack:** Node ESM (`"type": "module"`), Vercel serverless functions, Stripe SDK (`stripe@16`), `@vercel/blob@2`, `@anthropic-ai/sdk@0.39`, Resend (vía `fetch`), tests = scripts node planos (`node tools/test-*.mjs`).

**Convenciones del repo (respetar):**
- Tests = scripts node planos en `tools/`, importan desde `../apps/web/api/_lib/...`, imprimen líneas legibles y hacen `process.exit(1)` al fallar. Modelo: `tools/test-validador-glifos.mjs`.
- El estado del pedido vive en `metadata` del PaymentIntent (sin DB). Cada valor de metadata Stripe ≤ 500 chars; máx 50 claves por objeto.
- Blob `put`: patrón `generarMapaWeb` (`pipeline-reporte.js:22-35`) — `access:'public'`, `addRandomSuffix:true`, `contentType`.
- Resend: helper `enviarConResend(payload, descripcion)` (`enviar-reporte.js:26-51`), from cliente `'AKSHA LIFE <reportes@aksha.life>'`.
- Idioma: `md.idioma === 'en' ? 'en' : 'es'` (defensivo, default 'es').
- Cron auth: Bearer `CRON_SECRET` con `timingSafeEqual` (`reprocesar-pendientes.js:19-34`).

**Riesgos contemplados (del mapa del equipo):**
- Presupuesto Stripe metadata ajustado. Para no multiplicar claves por 4 (`plan_semana_<n>_at`, `plan_intentos_<n>`), este plan usa UNA sola clave `plan_log` (JSON comprimido < 500 chars) en lugar de 8 claves separadas. Claves nuevas de Pieza 3: `reporte_md_url`, `plan_elemento`, `plan_semana`, `plan_base_at`, `plan_log`, `plan_error` = 6 claves fijas.
- El elemento débil se fija cuando el CLIENTE recibe el reporte: en directo desde `pipeline-reporte.js` (al pasar a 'enviado'); en revisión desde `aprobar-reporte.js` (al aprobar), NO en el update de 'en_revision'. Lógica única en `_lib/plan-elemento.js`.
- Parseo bilingüe (es/en) con fallback determinista por carta (conteo de planetas personales por elemento del signo).
- `maxDuration 300` para el cron; N=5 por invocación.
- `validarReporte` se parametriza con `{min,max}` sin romper las llamadas existentes (default = límites del reporte principal).

---

## File Structure

**Crear:**
- `apps/web/api/_lib/plan-elemento.js` — determinar elemento débil (parseo marcadores + fallback carta), mapear módulo→elemento, persistir reporte.md a Blob, construir/leer `plan_log`. Una sola responsabilidad: la lógica de "base del plan".
- `apps/web/api/_lib/prompt-plan-semanal.js` — prompt sistema + `construirMensajePlanSemanal({...})` de los 4 emails semanales.
- `apps/web/api/_lib/generar-plan-semanal.js` — llamada a Claude (`claude-sonnet-4-6`) para un email semanal (análogo a `generar-reporte.js`).
- `apps/web/api/plan-semanal.js` — endpoint cron diario (14:00 UTC): lista candidatos, procesa N=5, genera+valida+envía+actualiza metadata.
- `tools/test-plan-elemento.mjs` — test del cálculo de elemento débil (parseo + fallback + desempates) y del `plan_log`.
- `tools/test-prompt-plan-semanal.mjs` — test de construcción del mensaje (es/en, sin "elemento"/fuego/tierra/aire/agua, nombre del cliente, semana correcta).
- `tools/test-validar-semanal.mjs` — test de `validarReporte` con límites semanales (min 400 / max 1100) + reutilización del chequeo astro/glifos.
- `tools/test-plan-semanal-dryrun.mjs` — test del filtrado de candidatos del cron (lógica pura, sin Stripe real).
- `tools/ensayo-johan-plan-semanal.mjs` — ensayo E2E con la carta de Johan (genera semanas 1 y 4 en es y en, valida, render email; requiere `ANTHROPIC_API_KEY`).

**Modificar:**
- `apps/web/api/_lib/validar-reporte.js` — parametrizar `validarReporte(reporte, carta, opciones)` con `{min,max}`.
- `apps/web/api/_lib/enviar-reporte.js` — añadir `enviarPlanSemanal({...})` + textos bilingües del semanal.
- `apps/web/api/_lib/pipeline-reporte.js` — invocar el helper de plan tras pasar a 'enviado' (rama directa).
- `apps/web/api/aprobar-reporte.js` — invocar el helper de plan tras aprobar (rama revisión).
- `apps/web/vercel.json` — `functions["api/plan-semanal.js"].maxDuration=300` + segundo cron 14:00 UTC.

---

## Task 1: Parametrizar `validarReporte` con límites de palabras

**Files:**
- Modify: `apps/web/api/_lib/validar-reporte.js:126-156`
- Test: `tools/test-validar-semanal.mjs`

Hoy `PALABRAS_MAX=3300`/`PALABRAS_MIN=1600` son constantes de módulo usadas dentro de `validarEstandarEditorial`. El semanal necesita min 400 / max 1100. Parametrizamos con un tercer argumento `opciones` que por defecto usa los límites del reporte principal, así NO se rompe ninguna llamada existente (`pipeline-reporte.js:117`, `aprobar` no llama validar, revisión sí). El chequeo astro (`TERMINOS_ASTRO`) y de glifos se reutilizan tal cual.

- [ ] **Step 1: Write the failing test**

Crear `tools/test-validar-semanal.mjs`:

```js
// Prueba de validarReporte con límites del plan semanal (min 400 / max 1100)
// y de que el chequeo astrológico/glifos se reutiliza sin cambios.
// Uso: node tools/test-validar-semanal.mjs
import { validarReporte } from '../apps/web/api/_lib/validar-reporte.js';

const carta = { planetas: [{ nombre: 'Sol', signo: 'Aries', casa: 1 }], cuspides_casas: {} };

const palabra = 'palabra ';
const corto = palabra.repeat(300).trim();   // 300 palabras → bajo el mínimo 400
const ok = palabra.repeat(700).trim();       // 700 palabras → dentro de 400..1100
const largo = palabra.repeat(1300).trim();   // 1300 palabras → sobre el máximo 1100

const rCorto = validarReporte(corto, carta, { min: 400, max: 1100 });
const rOk = validarReporte(ok, carta, { min: 400, max: 1100 });
const rLargo = validarReporte(largo, carta, { min: 400, max: 1100 });

// Sin opciones, el reporte principal sigue usando 1600..3300:
const rPrincipal700 = validarReporte(ok, carta); // 700 palabras < 1600 → debe fallar por mínimo

// Astro EN debe seguir atrapándose con límites semanales:
const conAstro = palabra.repeat(700).trim() + ' the Sun in Libra trine the Moon';
const rAstro = validarReporte(conAstro, carta, { min: 400, max: 1100 });

let fallos = 0;
const check = (nombre, cond, detalle = '') => {
  console.log(`${cond ? 'OK' : 'FALLA'} — ${nombre}${detalle ? ' :: ' + detalle : ''}`);
  if (!cond) fallos++;
};

check('300 palabras viola el mínimo semanal', !rCorto.ok, rCorto.errores.join(' | '));
check('700 palabras pasa con límites semanales', rOk.ok, rOk.errores.join(' | '));
check('1300 palabras viola el máximo semanal', !rLargo.ok, rLargo.errores.join(' | '));
check('700 palabras viola el mínimo del principal (1600)', !rPrincipal700.ok);
check('astro EN se atrapa también con límites semanales',
  !rAstro.ok && rAstro.errores.some((e) => /astrol/i.test(e)));

if (fallos) { console.error(`\n${fallos} comprobaciones fallaron.`); process.exit(1); }
console.log('\nPrueba superada.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/test-validar-semanal.mjs`
Expected: FALLA — al pasar el 3er argumento `{min,max}` hoy se ignora; `700 palabras pasa con límites semanales` fallará (700 < 1600 lo marca como demasiado corto). El proceso sale con código 1.

- [ ] **Step 3: Write minimal implementation**

En `apps/web/api/_lib/validar-reporte.js`, reemplazar las constantes y la firma de `validarEstandarEditorial` para aceptar límites. Reemplazar el bloque de líneas 121-151:

```js
// Máximo 8 hojas: objetivo 2200-3000 palabras; tolerancia de validación 3300.
// Un reporte muy corto delata truncamiento o secciones faltantes. Estos son
// los límites del reporte principal; el plan semanal pasa sus propios límites.
const PALABRAS_MAX = 3300;
const PALABRAS_MIN = 1600;

function validarEstandarEditorial(reporte, { min = PALABRAS_MIN, max = PALABRAS_MAX } = {}) {
  const errores = [];
  const texto = normalizar(reporte || '');

  const astro = [...new Set(texto.match(TERMINOS_ASTRO) || [])];
  if (astro.length > 0) {
    errores.push(
      `El reporte menciona términos astrológicos (${astro.join(', ')}) — el estándar ` +
      'top-tier exige traducirlos a situación vivida, sin vocabulario de carta.',
    );
  }

  const palabras = (String(reporte || '').trim().match(/\S+/g) || []).length;
  if (palabras > max) {
    errores.push(
      `El reporte tiene ${palabras} palabras — excede el máximo de ${max}. ` +
      'Cortar secciones, no adjetivos.',
    );
  } else if (palabras > 0 && palabras < min) {
    errores.push(
      `El reporte tiene solo ${palabras} palabras — por debajo del mínimo de ${min} ` +
      '(posible truncamiento o secciones faltantes).',
    );
  }
  return errores;
}
```

Y reemplazar la firma de `validarReporte` (línea 153) y la llamada interna a `validarEstandarEditorial` (línea 156):

```js
export function validarReporte(reporte, carta, opciones = {}) {
  const erroresEstilo = [
    ...detectarGlifosProhibidos(reporte),
    ...validarEstandarEditorial(reporte, opciones),
  ];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/test-validar-semanal.mjs`
Expected: PASS — todas las líneas `OK`, termina con `Prueba superada.`

- [ ] **Step 5: Verify no regression on existing tests**

Run: `node tools/test-validador-glifos.mjs`
Expected: `Prueba superada.` (la llamada sin 3er argumento usa los defaults 1600/3300).

- [ ] **Step 6: Commit**

```bash
git add apps/web/api/_lib/validar-reporte.js tools/test-validar-semanal.mjs
git commit -m "feat(pieza3): parametrizar validarReporte con limites de palabras min/max

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Helper `plan-elemento.js` — cálculo del elemento débil

**Files:**
- Create: `apps/web/api/_lib/plan-elemento.js`
- Test: `tools/test-plan-elemento.mjs`

Este helper centraliza TODA la lógica de la base del plan, para no duplicarla entre `pipeline-reporte.js` y `aprobar-reporte.js`. En esta tarea solo la parte PURA: parsear el reporte.md, elegir módulo débil, mapear a elemento, con fallback determinista por carta. La persistencia a Blob + Stripe va en la Task 3.

Reglas (decisión del dueño, no reabrir):
- Módulo débil = menor puntuación /20; desempate 1: menor IPN %; desempate 2: orden Vocación > Misión > Pasión > Profesión.
- Mapeo: Pasión=fuego, Profesión=tierra, Vocación=aire, Misión=agua.
- Parseo bilingüe (mismo estilo que `plantilla-reporte-web.js:159-162`).
- Fallback si el parseo no encuentra los 4 módulos: contar planetas personales (Sol, Luna, Mercurio, Venus, Marte) por elemento del signo; el elemento con MENOS planetas es el débil.

Para Johan (`ejemplos-privados/ensayo-johan/reporte.md`) el parseo debe dar Misión 8/20 → **agua**.

- [ ] **Step 1: Write the failing test**

Crear `tools/test-plan-elemento.mjs`:

```js
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

if (fallos) { console.error(`\n${fallos} comprobaciones fallaron.`); process.exit(1); }
console.log('\nPrueba superada.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/test-plan-elemento.mjs`
Expected: FALLA con `ERR_MODULE_NOT_FOUND` o `calcularElementoDebil is not a function` — el módulo aún no existe.

- [ ] **Step 3: Write minimal implementation**

Crear `apps/web/api/_lib/plan-elemento.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/test-plan-elemento.mjs`
Expected: PASS — todas `OK`, termina con `Prueba superada.`

- [ ] **Step 5: Commit**

```bash
git add apps/web/api/_lib/plan-elemento.js tools/test-plan-elemento.mjs
git commit -m "feat(pieza3): helper calcularElementoDebil (parseo marcadores + fallback carta)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Helper `plan-elemento.js` — persistencia (Blob + metadata) y `plan_log`

**Files:**
- Modify: `apps/web/api/_lib/plan-elemento.js`
- Test: `tools/test-plan-elemento.mjs` (ampliar)

Añadimos: (a) `guardarReporteMd(paymentIntentId, reporteMd)` → sube a Blob `reportes-md/<pi>.md` con sufijo aleatorio (URL impredecible = "privado-aleatorio" suficiente, mismo criterio que `mapas/`); (b) `construirPlanLog()` / `parsearPlanLog()` para empaquetar el avance semanal en UNA clave `plan_log` JSON < 500 chars (evita multiplicar `plan_semana_<n>_at`/`plan_intentos_<n>` por 4); (c) `metadataBasePlan({elemento, reporteMdUrl})` que arma el objeto de metadata a escribir cuando el cliente recibe el reporte.

`plan_log` formato: `{"s1":{"at":"2026-06-19T...","n":1},"s2":{...}}` — `n` = intentos de esa semana; `at` = ISO del envío. Compacto, una entrada por semana enviada.

- [ ] **Step 1: Write the failing test (ampliar el de Task 2)**

Añadir al FINAL de `tools/test-plan-elemento.mjs`, justo antes del bloque `if (fallos)`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/test-plan-elemento.mjs`
Expected: FALLA — `construirPlanLog is not a function` (aún no exportado).

- [ ] **Step 3: Write minimal implementation**

Añadir al final de `apps/web/api/_lib/plan-elemento.js`:

```js
import { put } from '@vercel/blob';

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
```

> NOTA: mover el `import { put } from '@vercel/blob';` al inicio del archivo junto a los demás imports de módulo si el linter del repo exige imports al tope (`eslint-plugin-import`). Colocarlo en la línea 1 del archivo:
> ```js
> import { put } from '@vercel/blob';
> ```
> y borrar el `import` repetido del bloque de arriba.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/test-plan-elemento.mjs`
Expected: PASS — todas `OK`, `Prueba superada.`

- [ ] **Step 5: Lint**

Run: `cd apps/web && npx eslint api/_lib/plan-elemento.js --quiet`
Expected: sin salida (sin errores). Si marca `import/first`, mover el import como indica la nota.

- [ ] **Step 6: Commit**

```bash
git add apps/web/api/_lib/plan-elemento.js tools/test-plan-elemento.mjs
git commit -m "feat(pieza3): persistencia del plan — Blob reporte.md, plan_log y metadataBasePlan

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Anclar la base del plan en el envío directo (`pipeline-reporte.js`)

**Files:**
- Modify: `apps/web/api/_lib/pipeline-reporte.js:10-17` (import) y `:162-176` (rama directa)
- Test: manual (lógica idéntica ya cubierta por Task 2/3; aquí solo cableado)

Tras `enviarReporte` y junto al `update` que pone `reporte_status:'enviado'` (líneas 165-173), calculamos el elemento débil del `reporte` ya generado, lo guardamos a Blob y añadimos la base del plan a la metadata. NO se añaden estados nuevos a la máquina de Stripe. Si algo del plan falla, NO debe romper el envío del reporte (que ya salió): envolver en try/catch propio.

- [ ] **Step 1: Add import**

En `apps/web/api/_lib/pipeline-reporte.js`, tras la línea 17 (`import { GRACIA_HISTORIA_MS } from './historia-vida.js';`), añadir:

```js
import { calcularElementoDebil, guardarReporteMd, metadataBasePlan } from './plan-elemento.js';
```

- [ ] **Step 2: Wire the plan base in the direct-send branch**

Reemplazar el bloque de líneas 162-176 (desde `console.log(`📧 ...` hasta `return { estado: 'enviado', resend_id: envio?.id };`) por:

```js
    console.log(`📧 [${paymentIntentId}] Enviando reporte a:`, customer_email);
    const envio = await enviarReporte({ nombre: customer_name, email: customer_email, reporte, urlWeb, idioma });

    // Base del plan de 4 semanas: el cliente YA recibió el reporte, así que
    // fijamos su elemento débil y guardamos el reporte.md como insumo. Si algo
    // de esto falla, el reporte ya salió: no rompemos el envío (cron lo retoma).
    let metaPlan = {};
    try {
      const debil = calcularElementoDebil(reporte, carta);
      const reporteMdUrl = await guardarReporteMd(paymentIntentId, reporte);
      metaPlan = metadataBasePlan({ elemento: debil.elemento, reporteMdUrl });
      console.log(`🗓️ [${paymentIntentId}] Plan 4 semanas — elemento débil: ${debil.elemento} (${debil.modulo}, vía ${debil.via})`);
    } catch (planError) {
      console.warn(`⚠️ [${paymentIntentId}] No se pudo fijar la base del plan:`, String(planError).slice(0, 200));
    }

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        reporte_status: 'enviado',
        reporte_web_url: urlWeb,
        reporte_resend_id: envio?.id || '',
        reporte_enviado_at: new Date().toISOString(),
        reporte_error: '',
        ...metaPlan,
      },
    });

    console.log(`✅ [${paymentIntentId}] Reporte enviado a`, customer_email);
    return { estado: 'enviado', resend_id: envio?.id };
```

- [ ] **Step 3: Lint**

Run: `cd apps/web && npx eslint api/_lib/pipeline-reporte.js --quiet`
Expected: sin salida.

- [ ] **Step 4: Syntax/import smoke test**

Run: `node --input-type=module -e "import('/Users/rocuts/Documents/GitHub/purpose-Aksha/apps/web/api/_lib/plan-elemento.js').then(m => console.log('exports:', Object.keys(m).join(', ')))"`
Expected: `exports: calcularElementoDebil, guardarReporteMd, parsearPlanLog, construirPlanLog, metadataBasePlan`

- [ ] **Step 5: Commit**

```bash
git add apps/web/api/_lib/pipeline-reporte.js
git commit -m "feat(pieza3): anclar base del plan de 4 semanas en envio directo

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Anclar la base del plan en la aprobación (`aprobar-reporte.js`)

**Files:**
- Modify: `apps/web/api/aprobar-reporte.js:5-7` (import) y `:81-96` (tras enviar + update)
- Test: manual (lógica de cálculo ya cubierta)

En modo revisión el cliente recibe el reporte AL APROBAR, no al pasar a 'en_revision'. Aquí el `reporte` ya está en la variable `reporte` (descargado de `md.reporte_blob_url`, línea 77). Reutilizamos esa variable. NO tenemos `carta` aquí, así que el fallback determinista por carta no aplica; pasamos `null` (el reporte recién revisado siempre trae marcadores, así que el parseo gana; si fallara, `calcularElementoDebil('...', null)` cae a 'agua' por su fallback seguro).

- [ ] **Step 1: Add import**

En `apps/web/api/aprobar-reporte.js`, tras la línea 7 (`import { enviarReporte } from './_lib/enviar-reporte.js';`), añadir:

```js
import { calcularElementoDebil, guardarReporteMd, metadataBasePlan } from './_lib/plan-elemento.js';
```

- [ ] **Step 2: Wire the plan base after approval send**

Reemplazar el bloque de líneas 89-96 (el `await stripe.paymentIntents.update(String(pi), {...})`) por:

```js
  // Base del plan de 4 semanas: en revisión, el cliente recibe el reporte AL
  // aprobar. Reutilizamos el reporte ya descargado de Blob. No hay carta a mano:
  // el reporte recién revisado trae marcadores, así que el parseo manda.
  let metaPlan = {};
  try {
    const debil = calcularElementoDebil(reporte, null);
    const reporteMdUrl = await guardarReporteMd(String(pi), reporte);
    metaPlan = metadataBasePlan({ elemento: debil.elemento, reporteMdUrl });
    console.log(`🗓️ [${pi}] Plan 4 semanas — elemento débil: ${debil.elemento} (${debil.modulo}, vía ${debil.via})`);
  } catch (planError) {
    console.warn(`⚠️ [${pi}] No se pudo fijar la base del plan:`, String(planError).slice(0, 200));
  }

  await stripe.paymentIntents.update(String(pi), {
    metadata: {
      reporte_status: 'enviado',
      reporte_resend_id: envio?.id || '',
      reporte_enviado_at: new Date().toISOString(),
      reporte_error: '',
      ...metaPlan,
    },
  });
```

- [ ] **Step 3: Lint**

Run: `cd apps/web && npx eslint api/aprobar-reporte.js --quiet`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add apps/web/api/aprobar-reporte.js
git commit -m "feat(pieza3): anclar base del plan en aprobacion de revision (helper compartido)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Prompt maestro del plan semanal (`prompt-plan-semanal.js`)

**Files:**
- Create: `apps/web/api/_lib/prompt-plan-semanal.js`
- Test: `tools/test-prompt-plan-semanal.mjs`

Prompt único para los 4 emails (misma estructura, distinta sustancia por semana y por elemento). Reglas top-tier iguales al reporte (cero astrología, cero emojis, anti-plantilla, tuteo, nombre del cliente, en su idioma). La palabra "elemento" y fuego/tierra/aire/agua NO aparecen. Recibe el reporte.md como insumo y el elemento débil (interno) + la semana (1-4). 600-900 palabras, Markdown ligero.

Mapeo interno elemento → "cómo se vive" (para que el prompt nombre el área por su vivencia, no por el elemento):
- fuego (Pasión): el entusiasmo, lo que enciende, el arranque, lo que amas.
- tierra (Profesión): el oficio, lo que construyes, aquello en lo que eres bueno.
- aire (Vocación): la palabra, el vínculo, el puente, por lo que te buscan.
- agua (Misión): el fondo, las crisis, lo que el mundo necesita de ti.

- [ ] **Step 1: Write the failing test**

Crear `tools/test-prompt-plan-semanal.mjs`:

```js
// Prueba de construcción del mensaje del plan semanal.
// Uso: node tools/test-prompt-plan-semanal.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  PROMPT_SISTEMA_PLAN_SEMANAL, construirMensajePlanSemanal,
} from '../apps/web/api/_lib/prompt-plan-semanal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reporteJohan = readFileSync(
  join(__dirname, '../ejemplos-privados/ensayo-johan/reporte.md'), 'utf8',
);

let fallos = 0;
const check = (nombre, cond, detalle = '') => {
  console.log(`${cond ? 'OK' : 'FALLA'} — ${nombre}${detalle ? ' :: ' + detalle : ''}`);
  if (!cond) fallos++;
};

const prohibidas = /\b(elemento|fuego|tierra|aire|agua|fire|earth|water|element)\b/i;

const es1 = construirMensajePlanSemanal({
  nombre: 'Johan Rocuts', reporteMd: reporteJohan, elemento: 'agua', semana: 1, idioma: 'es',
});
check('es semana 1 incluye el nombre', es1.includes('Johan'));
check('es semana 1 marca SEMANA 1', /semana\s*1|week\s*1/i.test(es1));
check('es semana 1 sin palabras de elemento', !prohibidas.test(es1), 'fuga de vocabulario');
check('es semana 1 incrusta el reporte como insumo', es1.includes('Misión'));

const en4 = construirMensajePlanSemanal({
  nombre: 'Johan Rocuts', reporteMd: reporteJohan, elemento: 'aire', semana: 4, idioma: 'en',
});
check('en semana 4 pide inglés', /english/i.test(en4) || /in english/i.test(PROMPT_SISTEMA_PLAN_SEMANAL));
check('en semana 4 marca semana 4', /week\s*4|semana\s*4/i.test(en4));
check('en semana 4 sin palabras de elemento', !prohibidas.test(en4));

check('prompt sistema sin palabras de elemento', !prohibidas.test(PROMPT_SISTEMA_PLAN_SEMANAL));
check('prompt sistema fija rango 600-900', /600|900/.test(PROMPT_SISTEMA_PLAN_SEMANAL));

if (fallos) { console.error(`\n${fallos} comprobaciones fallaron.`); process.exit(1); }
console.log('\nPrueba superada.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/test-prompt-plan-semanal.mjs`
Expected: FALLA con `ERR_MODULE_NOT_FOUND` — el módulo no existe.

- [ ] **Step 3: Write minimal implementation**

Crear `apps/web/api/_lib/prompt-plan-semanal.js`:

```js
// Prompt maestro del PLAN DE 4 SEMANAS (emails de seguimiento del Mapa de
// Propósito). Mismo prompt para los 4 elementos en estructura, distinto en
// sustancia. Embebido como módulo JS para que viaje con la función serverless.
//
// REGLAS TOP-TIER (idénticas al reporte principal, .claude/skills/reportes-top-tier):
// cero astrología visible, cero emojis ni glifos, anti-plantilla, tuteo, nombre
// del cliente, en su idioma. La palabra "elemento" y los nombres
// fuego/tierra/aire/agua JAMÁS aparecen: se nombra el área por cómo se vive.

export const PROMPT_SISTEMA_PLAN_SEMANAL = `
Eres AKSHA, sistema experto de AKSHA LIFE (aksha.life). El cliente ya recibió su
"Mapa de Propósito" completo. Ahora escribes UNO de los cuatro emails de un
programa de seguimiento de cuatro semanas, enfocado en su área de mayor
oportunidad de crecimiento (la que en su mapa salió más floja).

═══════════════════════════════════════════
REGLA DE ORO — CERO ASTROLOGÍA, CERO JERGA INTERNA
═══════════════════════════════════════════
Prohibido mencionar astrología en cualquier forma: planetas, signos, casas,
aspectos, tránsitos, Ascendente, Medio Cielo, carta natal, zodiaco, Quirón.
PROHIBIDO también nombrar el "elemento" o decir fuego/tierra/aire/agua: ese es
routing interno. Nombras el área SIEMPRE por cómo se vive, igual que el mapa
(vida, no motor). Nada de emojis ni glifos decorativos: tipografía limpia.

═══════════════════════════════════════════
TONO Y FORMA
═══════════════════════════════════════════
- Tuteo, cálido, directo, de tú a tú. Usa el nombre del cliente al menos una vez.
- 600 a 900 palabras. Markdown ligero: un título con ##, párrafos, a lo sumo una
  lista corta con guiones. Sin tablas, sin marcadores /20, sin IPN, sin secciones
  numeradas como el reporte.
- Anti-plantilla: nada que sirva a cualquier persona. Todo se ancla en lo que el
  insumo (su mapa) dice de ESTE cliente: sus dones fuertes, sus desafíos, su
  herida, su camino. Cita situaciones vividas, no rasgos genéricos.
- No menciones que esto es "la semana N de un programa por tu elemento débil".
  Es una carta que continúa la conversación del mapa.
- Cierra SIEMPRE con la firma exacta en su idioma:
  ES: "AKSHA LIFE · La IA no crea el conocimiento. Lo conecta."
  EN: "AKSHA LIFE · AI does not create knowledge. It connects it."

═══════════════════════════════════════════
ARCO DEL PROGRAMA (cuatro semanas)
═══════════════════════════════════════════
Recibirás el número de semana. Escribe SOLO esa semana:
- Semana 1 — RECONOCER EL PATRÓN: ayúdale a ver, en su vida concreta, cómo se
  manifiesta hoy el área más floja de su mapa. Sin práctica todavía: nombrar y
  reconocer, con ejemplos sacados de su propio mapa.
- Semana 2 — UNA PRÁCTICA CONCRETA: propón UNA sola práctica pequeña, medible y
  realizable esta semana, hecha a la medida de su patrón. Específica, no consejos
  generales. Dile cómo sabrá que la hizo.
- Semana 3 — INTEGRAR CON SUS DONES FUERTES: cruza el área floja con los dones
  más fuertes de su mapa (los módulos con mejor marcador). Muéstrale cómo apoyar
  lo débil en lo que ya domina.
- Semana 4 — CONSOLIDAR Y MEDIR: cierre del programa. Cómo medir el avance de
  estas semanas, qué conservar, qué sigue. Tono de cierre, sin abrir temas nuevos.

═══════════════════════════════════════════
USO DEL INSUMO
═══════════════════════════════════════════
Recibirás el texto íntegro de su Mapa de Propósito. Es tu única fuente sobre el
cliente: úsalo para anclar todo. No inventes datos que no estén ahí. No cites el
mapa textualmente ni digas "según tu mapa": habla como quien ya lo conoce.
`;

// Nombre interno del área por cómo se vive (nunca se escribe el elemento).
const AREA_POR_ELEMENTO = {
  fuego: 'lo que te enciende y entusiasma — tu pasión, tu manera de arrancar las cosas',
  tierra: 'tu oficio y lo que construyes — aquello en lo que eres bueno',
  aire: 'la palabra, el vínculo y el puente — aquello por lo que te buscan',
  agua: 'el fondo y las crisis — lo que el mundo necesita de ti y lo que te toca sostener',
};

const NUM_SEMANA = {
  es: { 1: 'SEMANA 1', 2: 'SEMANA 2', 3: 'SEMANA 3', 4: 'SEMANA 4' },
  en: { 1: 'WEEK 1', 2: 'WEEK 2', 3: 'WEEK 3', 4: 'WEEK 4' },
};

export function construirMensajePlanSemanal({ nombre, reporteMd, elemento, semana, idioma = 'es' }) {
  const lang = idioma === 'en' ? 'en' : 'es';
  const area = AREA_POR_ELEMENTO[elemento] || AREA_POR_ELEMENTO.agua;
  const insumo = String(reporteMd || '').replace(/[─═━]/g, '-').trim();
  const etiquetaSemana = (NUM_SEMANA[lang] || NUM_SEMANA.es)[semana] || `SEMANA ${semana}`;

  const bloqueIdioma = lang !== 'en' ? '' : `

LANGUAGE: Write this entire email IN ENGLISH — natural, warm, native-level
English, not a literal translation. Apply every rule above. Use the exact
English closing signature.`;

  return `CLIENTE:
─────────────────────────────────────────
Nombre: ${nombre}
Semana del programa a escribir: ${etiquetaSemana} (número ${semana})
Área de mayor oportunidad de este cliente (descríbela SIEMPRE por cómo se vive,
nunca la nombres por su categoría interna): ${area}
─────────────────────────────────────────${bloqueIdioma}

MAPA DE PROPÓSITO DE ${nombre} (insumo; tu única fuente sobre el cliente):
─────────────────────────────────────────
${insumo}
─────────────────────────────────────────

Escribe ahora ÚNICAMENTE el email de la ${etiquetaSemana} para ${nombre},
siguiendo el arco del programa y todas las reglas de tono, forma y cero
astrología. 600-900 palabras. Termina con la firma exacta en su idioma.`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/test-prompt-plan-semanal.mjs`
Expected: PASS — todas `OK`, `Prueba superada.`

- [ ] **Step 5: Commit**

```bash
git add apps/web/api/_lib/prompt-plan-semanal.js tools/test-prompt-plan-semanal.mjs
git commit -m "feat(pieza3): prompt maestro del plan semanal (4 semanas, bilingue, cero astrologia)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Generador del email semanal (`generar-plan-semanal.js`)

**Files:**
- Create: `apps/web/api/_lib/generar-plan-semanal.js`
- Test: cubierto por el ensayo E2E (Task 11); aquí solo smoke de import (no llama a la API en CI)

Análogo a `generar-reporte.js` pero con `claude-sonnet-4-6`, `max_tokens` menor (8000 basta para ~900 palabras), y usando el prompt nuevo. Streaming como el principal.

- [ ] **Step 1: Create the module**

Crear `apps/web/api/_lib/generar-plan-semanal.js`:

```js
import Anthropic from '@anthropic-ai/sdk';
import {
  PROMPT_SISTEMA_PLAN_SEMANAL, construirMensajePlanSemanal,
} from './prompt-plan-semanal.js';

// Misma defensa que generar-reporte.js: extraer estrictamente la key sk-ant-...
const RAW_KEY = process.env.ANTHROPIC_API_KEY || '';
const API_KEY = (RAW_KEY.match(/sk-ant-[A-Za-z0-9_-]{20,}/) || [RAW_KEY.trim()])[0];

const client = new Anthropic({ apiKey: API_KEY, maxRetries: 3 });

// El plan semanal corre en Sonnet (más barato/rápido); el reporte principal
// sigue en Opus (generar-reporte.js).
export async function generarPlanSemanal({ nombre, reporteMd, elemento, semana, idioma }) {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: PROMPT_SISTEMA_PLAN_SEMANAL,
    messages: [
      {
        role: 'user',
        content: construirMensajePlanSemanal({ nombre, reporteMd, elemento, semana, idioma }),
      },
    ],
  });

  const mensaje = await stream.finalMessage();
  const texto = mensaje.content
    .filter((bloque) => bloque.type === 'text')
    .map((bloque) => bloque.text)
    .join('\n');

  if (!texto) {
    throw new Error(`Claude no devolvió texto para el plan semanal (stop_reason: ${mensaje.stop_reason})`);
  }

  console.log(
    `🤖 Plan semana ${semana} generado: ${texto.length} caracteres · ` +
    `tokens out: ${mensaje.usage?.output_tokens} · stop: ${mensaje.stop_reason}`,
  );
  return texto;
}
```

- [ ] **Step 2: Smoke test (import resolves)**

Run: `node --input-type=module -e "import('/Users/rocuts/Documents/GitHub/purpose-Aksha/apps/web/api/_lib/generar-plan-semanal.js').then(m => console.log('exports:', Object.keys(m).join(', ')))"`
Expected: `exports: generarPlanSemanal`

- [ ] **Step 3: Lint**

Run: `cd apps/web && npx eslint api/_lib/generar-plan-semanal.js --quiet`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add apps/web/api/_lib/generar-plan-semanal.js
git commit -m "feat(pieza3): generador del email semanal con claude-sonnet-4-6

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

> **Nota para el dueño / verificar antes de activar:** confirmar que `claude-sonnet-4-6` está habilitado en la cuenta Anthropic de `ANTHROPIC_API_KEY` (el pipeline principal usa `claude-opus-4-8`). Ver openQuestions.

---

## Task 8: Plantilla de email del plan semanal (`enviarPlanSemanal`)

**Files:**
- Modify: `apps/web/api/_lib/enviar-reporte.js` (añadir textos + función al final, antes del bloque de render o tras `enviarReporteRevision`)
- Test: `tools/test-enviar-plan-semanal.mjs` (genera HTML, sin enviar)

Añadimos un diccionario `TEXTOS_PLAN_SEMANAL` (asuntos/intro por semana 1-4, es/en) y `enviarPlanSemanal({nombre,email,contenidoMd,semana,idioma})` que reutiliza `reporteAHtml` para el cuerpo y una variante simple de `formatearEmailHTML`. From: `reportes@aksha.life`. SIN BCC de auditoría (decisión: los semanales son derivados, no el reporte principal; ver openQuestions si el dueño quiere auditarlos).

Para no duplicar `formatearEmailHTML` entero, añadimos `formatearEmailPlanHTML(nombre, contenidoMd, semana, idioma)` reutilizando `reporteAHtml`, `FUENTE_SERIF` y la estética ya definida.

- [ ] **Step 1: Write the failing test**

Crear `tools/test-enviar-plan-semanal.mjs`:

```js
// Prueba del render del email del plan semanal (no envía nada).
// Uso: node tools/test-enviar-plan-semanal.mjs
import { formatearEmailPlanHTML, TEXTOS_PLAN_SEMANAL } from '../apps/web/api/_lib/enviar-reporte.js';

let fallos = 0;
const check = (nombre, cond, detalle = '') => {
  console.log(`${cond ? 'OK' : 'FALLA'} — ${nombre}${detalle ? ' :: ' + detalle : ''}`);
  if (!cond) fallos++;
};

const md = `## Esta semana\nJohan, esto es un párrafo de prueba con **negrita**.\n\n- un punto\n- otro punto\n\nAKSHA LIFE · La IA no crea el conocimiento. Lo conecta.`;

const htmlEs = formatearEmailPlanHTML('Johan Rocuts', md, 1, 'es');
check('html es contiene el nombre', htmlEs.includes('Johan'));
check('html es lang=es', /<html lang="es"/.test(htmlEs));
check('html es convierte markdown a <p>', /<p /.test(htmlEs));
check('html es trae el lema', htmlEs.includes('La IA no crea el conocimiento'));

const htmlEn = formatearEmailPlanHTML('Johan Rocuts', md, 4, 'en');
check('html en lang=en', /<html lang="en"/.test(htmlEn));

check('textos es semana 1 tiene asunto función', typeof TEXTOS_PLAN_SEMANAL.es[1].asunto === 'function');
check('textos es asunto interpola nombre', TEXTOS_PLAN_SEMANAL.es[1].asunto('Johan').includes('Johan'));
check('textos en tiene 4 semanas', [1,2,3,4].every((n) => TEXTOS_PLAN_SEMANAL.en[n]));

if (fallos) { console.error(`\n${fallos} comprobaciones fallaron.`); process.exit(1); }
console.log('\nPrueba superada.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/test-enviar-plan-semanal.mjs`
Expected: FALLA — `formatearEmailPlanHTML`/`TEXTOS_PLAN_SEMANAL` no exportados.

- [ ] **Step 3: Write minimal implementation**

En `apps/web/api/_lib/enviar-reporte.js`, añadir el diccionario tras `TEXTOS_EMAIL` (después de la línea 203, antes de `const ESTILO`):

```js
// Textos bilingües del plan de 4 semanas (asunto + intro por semana).
export const TEXTOS_PLAN_SEMANAL = {
  es: {
    producto: 'Tu programa de 4 semanas',
    contacto: 'Si tienes preguntas, escríbenos a',
    lema: 'La IA no crea el conocimiento. Lo conecta.',
    1: { asunto: (n) => `${n}, empieza tu programa de 4 semanas`,
         intro: 'Tu Mapa de Propósito abrió el mapa. Estas cuatro semanas lo ponen a caminar, una pieza a la vez.' },
    2: { asunto: (n) => `${n}, semana 2 — una práctica para esta semana`,
         intro: 'Lo que reconociste la semana pasada, esta semana se trabaja con un solo movimiento concreto.' },
    3: { asunto: (n) => `${n}, semana 3 — apóyate en lo que ya dominas`,
         intro: 'Esta semana cruzamos lo que cuesta con tus dones más fuertes.' },
    4: { asunto: (n) => `${n}, semana 4 — cierre de tu programa`,
         intro: 'Última semana: medir lo avanzado y dejar el camino marcado.' },
  },
  en: {
    producto: 'Your 4-week program',
    contacto: 'Questions? Write to us at',
    lema: 'AI does not create knowledge. It connects it.',
    1: { asunto: (n) => `${n}, your 4-week program begins`,
         intro: 'Your Purpose Map opened the territory. These four weeks set it in motion, one piece at a time.' },
    2: { asunto: (n) => `${n}, week 2 — one practice for this week`,
         intro: 'What you recognized last week becomes a single, concrete move this week.' },
    3: { asunto: (n) => `${n}, week 3 — lean on what you already master`,
         intro: 'This week we cross what is hard with your strongest gifts.' },
    4: { asunto: (n) => `${n}, week 4 — closing your program`,
         intro: 'Final week: measure the progress and leave the path marked.' },
  },
};
```

Y añadir, tras `formatearEmailHTML` (después de la línea 349, al final del archivo), la variante del plan + la función de envío:

```js
// Variante simple de formatearEmailHTML para los emails semanales: mismo look,
// sin botón de "Abrir tu Mapa" (el semanal es texto autocontenido).
export function formatearEmailPlanHTML(nombre, contenidoMd, semana, idioma = 'es') {
  idioma = idioma === 'en' ? 'en' : 'es';
  const t = TEXTOS_PLAN_SEMANAL[idioma] || TEXTOS_PLAN_SEMANAL.es;
  const tSem = t[semana] || t[1];
  const primerNombre = escapeHtml(nombre.split(' ')[0]);
  const cuerpoHTML = reporteAHtml(contenidoMd);

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
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#07142F" style="background-color:#07142F;">
    <tr>
      <td align="center" style="padding:8px 12px 48px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;">
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
              <p style="margin:0;color:#A9AEB9;font-family:${FUENTE_SERIF};font-size:16px;line-height:1.85;">${escapeHtml(tSem.intro)}</p>
            </td>
          </tr>
          <tr>
            <td class="pad-lateral" style="padding:10px 36px 0;">
              ${cuerpoHTML}
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

// Envía un email del plan semanal al cliente. From reportes@aksha.life, igual
// que el reporte principal. SIN BCC de auditoría (derivado, no el principal).
export async function enviarPlanSemanal({ nombre, email, contenidoMd, semana, idioma = 'es' }) {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY no configurada — email semanal no enviado');
    throw new Error('RESEND_API_KEY no configurada — email semanal no enviado');
  }
  const primerNombre = nombre.split(' ')[0];
  const lang = idioma === 'en' ? 'en' : 'es';
  const t = TEXTOS_PLAN_SEMANAL[lang] || TEXTOS_PLAN_SEMANAL.es;
  const tSem = t[semana] || t[1];

  const resultado = await enviarConResend({
    from: 'AKSHA LIFE <reportes@aksha.life>',
    to: [email],
    subject: tSem.asunto(primerNombre),
    html: formatearEmailPlanHTML(nombre, contenidoMd, semana, lang),
    text: contenidoMd,
  }, `email plan semana ${semana} a ${email}`);

  console.log(`✅ Email plan semana ${semana} enviado a:`, email);
  return resultado;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/test-enviar-plan-semanal.mjs`
Expected: PASS — todas `OK`, `Prueba superada.`

- [ ] **Step 5: Lint**

Run: `cd apps/web && npx eslint api/_lib/enviar-reporte.js --quiet`
Expected: sin salida.

- [ ] **Step 6: Commit**

```bash
git add apps/web/api/_lib/enviar-reporte.js tools/test-enviar-plan-semanal.mjs
git commit -m "feat(pieza3): plantilla de email enviarPlanSemanal (bilingue, sin BCC)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Selección de candidatos del cron (lógica pura) en `pipeline`-style helper

**Files:**
- Modify: `apps/web/api/_lib/plan-elemento.js` (añadir `semanaPendiente`)
- Test: `tools/test-plan-semanal-dryrun.mjs`

Antes de escribir el endpoint, aislamos la decisión "¿a este pedido le toca email esta semana?" en una función pura testeable sin Stripe: dado `metadata` y `ahora` (ms), devuelve la semana a enviar (1-4) o 0 si ninguna. Regla del spec: `reporte_status=enviado`, `plan_semana < 4`, y `plan_base_at + 7·(plan_semana+1) días <= hoy`. Tope de reintentos por semana: 3 (leído de `plan_log`).

- [ ] **Step 1: Write the failing test**

Crear `tools/test-plan-semanal-dryrun.mjs`:

```js
// Prueba de la selección de candidatos del cron semanal (lógica pura).
// Uso: node tools/test-plan-semanal-dryrun.mjs
import { semanaPendiente } from '../apps/web/api/_lib/plan-elemento.js';

let fallos = 0;
const check = (nombre, cond, detalle = '') => {
  console.log(`${cond ? 'OK' : 'FALLA'} — ${nombre}${detalle ? ' :: ' + detalle : ''}`);
  if (!cond) fallos++;
};

const DIA = 24 * 3600 * 1000;
const base = Date.parse('2026-06-12T14:00:00.000Z');
const ahora = (dias) => base + dias * DIA;

// Pedido con base hoy, plan_semana 0: a los 7 días toca semana 1.
const md0 = { reporte_status: 'enviado', plan_semana: '0', plan_base_at: '2026-06-12T14:00:00.000Z' };
check('día 6: aún no toca semana 1', semanaPendiente(md0, ahora(6)) === 0);
check('día 7: toca semana 1', semanaPendiente(md0, ahora(7)) === 1);
check('día 8: sigue tocando semana 1 (no se saltó)', semanaPendiente(md0, ahora(8)) === 1);

// plan_semana 1 ya enviada: a los 14 días toca semana 2.
const md1 = { reporte_status: 'enviado', plan_semana: '1', plan_base_at: '2026-06-12T14:00:00.000Z' };
check('semana 1 hecha, día 13: no toca semana 2', semanaPendiente(md1, ahora(13)) === 0);
check('semana 1 hecha, día 14: toca semana 2', semanaPendiente(md1, ahora(14)) === 2);

// plan_semana 4: programa terminado, nunca toca.
const md4 = { reporte_status: 'enviado', plan_semana: '4', plan_base_at: '2026-06-12T14:00:00.000Z' };
check('semana 4 hecha: nunca toca', semanaPendiente(md4, ahora(60)) === 0);

// reporte no enviado: nunca toca.
const mdNo = { reporte_status: 'en_revision', plan_semana: '0', plan_base_at: '2026-06-12T14:00:00.000Z' };
check('reporte no enviado: nunca toca', semanaPendiente(mdNo, ahora(30)) === 0);

// sin plan_base_at: nunca toca (pedido viejo sin base de plan).
const mdViejo = { reporte_status: 'enviado', plan_semana: '0' };
check('sin plan_base_at: nunca toca', semanaPendiente(mdViejo, ahora(30)) === 0);

// 3 intentos fallidos de la semana 1 (en plan_log): se descarta esa semana.
const mdAgotado = { reporte_status: 'enviado', plan_semana: '0', plan_base_at: '2026-06-12T14:00:00.000Z',
  plan_log: JSON.stringify({ s1: { at: null, n: 3 } }) };
check('semana 1 con 3 intentos: agotada, no toca', semanaPendiente(mdAgotado, ahora(8)) === 0);

if (fallos) { console.error(`\n${fallos} comprobaciones fallaron.`); process.exit(1); }
console.log('\nPrueba superada.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/test-plan-semanal-dryrun.mjs`
Expected: FALLA — `semanaPendiente is not a function`.

- [ ] **Step 3: Write minimal implementation**

Añadir a `apps/web/api/_lib/plan-elemento.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/test-plan-semanal-dryrun.mjs`
Expected: PASS — todas `OK`, `Prueba superada.`

- [ ] **Step 5: Re-run earlier helper tests (no regression)**

Run: `node tools/test-plan-elemento.mjs`
Expected: `Prueba superada.`

- [ ] **Step 6: Commit**

```bash
git add apps/web/api/_lib/plan-elemento.js tools/test-plan-semanal-dryrun.mjs
git commit -m "feat(pieza3): semanaPendiente — seleccion pura de candidatos del cron semanal

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Endpoint cron `plan-semanal.js` + `vercel.json`

**Files:**
- Create: `apps/web/api/plan-semanal.js`
- Modify: `apps/web/vercel.json:44-54`
- Test: smoke de import + dry run del filtrado ya cubierto (Task 9)

Endpoint cron: guard Bearer `CRON_SECRET` (idéntico a `reprocesar-pendientes.js`), lista PaymentIntents `succeeded` de los últimos 45 días, filtra con `semanaPendiente`, procesa N=5: baja `reporte_md_url`, genera con `generarPlanSemanal`, valida con `validarReporte(..., {min:400,max:1100})` (necesita una carta para no fallar el "carta no verificable"; el semanal NO menciona posiciones, así que pasamos una carta mínima válida `{planetas:[...],cuspides_casas:{}}` derivada de... — NO: el semanal no tiene carta a mano. Solución: validar SOLO estilo/longitud con una carta-stub mínima que pase la guarda). Tras enviar, escribe `plan_semana`, `plan_log` (incrementa intentos/at), `plan_error`.

Decisión sobre validación del semanal: el chequeo astrológico de posiciones requiere una `carta` real; el semanal no la tiene. Pasamos una carta-stub `{ planetas: [{ nombre: '∅', signo: '∅', casa: 0 }], cuspides_casas: {} }` para satisfacer la guarda `Array.isArray(carta.planetas)`; como el semanal nunca afirma posiciones, los bucles de posición no encuentran nada y solo corren los chequeos de glifos/astro-términos/longitud. Esto es exactamente lo que el spec pide ("el semanal no toca posiciones, así que el chequeo astrológico y de glifos se reutilizan tal cual").

- [ ] **Step 1: Create the endpoint**

Crear `apps/web/api/plan-semanal.js`:

```js
// Cron diario (14:00 UTC) del plan de 4 semanas. Para cada pedido cuyo cliente
// ya recibió el reporte, envía el email semanal que toca (+7/14/21/28 días).
// Estado en metadata del PaymentIntent (sin base de datos). Guard Bearer
// CRON_SECRET, igual que reprocesar-pendientes.js.
//   GET  ?dry=1   → lista candidatos, no envía nada
//   POST          → procesa hasta N=5 candidatos

import Stripe from 'stripe';
import { timingSafeEqual } from 'node:crypto';
import {
  semanaPendiente, parsearPlanLog, construirPlanLog,
} from './_lib/plan-elemento.js';
import { generarPlanSemanal } from './_lib/generar-plan-semanal.js';
import { enviarPlanSemanal } from './_lib/enviar-reporte.js';
import { validarReporte } from './_lib/validar-reporte.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const VENTANA_DIAS = 45;
const MAX_POR_CORRIDA = 5;
// El semanal no afirma posiciones: una carta-stub satisface la guarda de
// validarReporte y deja correr solo los chequeos de estilo (glifos, astro, largo).
const CARTA_STUB = { planetas: [{ nombre: '_', signo: '_', casa: 0 }], cuspides_casas: {} };

function tokenValido(recibido, esperado) {
  const a = Buffer.from(String(recibido));
  const b = Buffer.from(String(esperado));
  return a.length === b.length && timingSafeEqual(a, b);
}

async function candidatos() {
  const desde = Math.floor(Date.now() / 1000) - VENTANA_DIAS * 24 * 3600;
  const lista = await stripe.paymentIntents.list({ created: { gte: desde }, limit: 100 });
  const ahora = Date.now();
  return lista.data
    .map((pi) => ({ pi, semana: semanaPendiente(pi.metadata || {}, ahora) }))
    .filter((c) => c.semana > 0);
}

async function procesarUno(pi, semana) {
  const md = pi.metadata || {};
  const idioma = md.idioma === 'en' ? 'en' : 'es';
  const log = parsearPlanLog(md.plan_log);
  const intentosPrevios = Number(log[`s${semana}`]?.n || 0);

  try {
    const resp = await fetch(md.reporte_md_url);
    if (!resp.ok) throw new Error(`No se pudo bajar reporte.md (HTTP ${resp.status})`);
    const reporteMd = await resp.text();

    const contenido = await generarPlanSemanal({
      nombre: md.customer_name,
      reporteMd,
      elemento: md.plan_elemento || 'agua',
      semana,
      idioma,
    });

    const validacion = validarReporte(contenido, CARTA_STUB, { min: 400, max: 1100 });
    if (!validacion.ok) {
      throw new Error(`Validación del semanal falló: ${validacion.errores.join(' | ')}`);
    }

    const envio = await enviarPlanSemanal({
      nombre: md.customer_name,
      email: md.customer_email,
      contenidoMd: contenido,
      semana,
      idioma,
    });

    const nuevoLog = construirPlanLog(log, semana, new Date().toISOString(), intentosPrevios + 1);
    await stripe.paymentIntents.update(pi.id, {
      metadata: { plan_semana: String(semana), plan_log: nuevoLog, plan_error: '' },
    });

    return { id: pi.id, semana, estado: 'enviado', resend_id: envio?.id };
  } catch (error) {
    const detalle = String(error).slice(0, 400);
    const nuevoLog = construirPlanLog(log, semana, log[`s${semana}`]?.at || null, intentosPrevios + 1);
    await stripe.paymentIntents
      .update(pi.id, { metadata: { plan_log: nuevoLog, plan_error: detalle } })
      .catch((e) => console.error('No se pudo registrar el fallo del semanal:', e));
    console.error(`❌ [${pi.id}] Plan semana ${semana} falló:`, detalle);
    return { id: pi.id, semana, estado: 'fallido', error: detalle };
  }
}

export default async function handler(req, res) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) {
    console.error('❌ CRON_SECRET no configurado — endpoint bloqueado');
    return res.status(503).json({ error: 'Servicio no configurado' });
  }
  const auth = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!tokenValido(auth, secreto)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const dryRun = req.query?.dry === '1' || req.query?.dry === 'true';

  try {
    const todos = await candidatos();
    const lote = todos.slice(0, MAX_POR_CORRIDA);

    if (dryRun) {
      return res.status(200).json({
        dryRun: true,
        total: todos.length,
        candidatos: lote.map((c) => ({
          id: c.pi.id, cliente: c.pi.metadata.customer_name, semana: c.semana,
          elemento: c.pi.metadata.plan_elemento,
        })),
      });
    }

    const resultados = [];
    for (const c of lote) {
      resultados.push(await procesarUno(c.pi, c.semana));
    }
    console.log('🗓️ Plan semanal:', JSON.stringify(resultados));
    return res.status(200).json({ total: todos.length, procesados: resultados });
  } catch (error) {
    console.error('❌ Error en plan-semanal:', error);
    return res.status(500).json({ error: String(error) });
  }
}
```

- [ ] **Step 2: Smoke test (import resolves)**

Run: `node --input-type=module -e "import('/Users/rocuts/Documents/GitHub/purpose-Aksha/apps/web/api/plan-semanal.js').then(m => console.log('default handler:', typeof m.default))"`
Expected: `default handler: function`

- [ ] **Step 3: Update `vercel.json`**

En `apps/web/vercel.json`, añadir a `functions` (tras la línea 50, la entrada de `aprobar-reporte.js`) — añadir una coma a esa línea y la nueva entrada:

```json
    "api/aprobar-reporte.js": { "maxDuration": 60 },
    "api/plan-semanal.js": { "maxDuration": 300 }
```

Y añadir el segundo cron al array `crons` (línea 53) — añadir coma y la nueva entrada:

```json
  "crons": [
    { "path": "/api/reprocesar-pendientes", "schedule": "0 13 * * *" },
    { "path": "/api/plan-semanal", "schedule": "0 14 * * *" }
  ]
```

- [ ] **Step 4: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('/Users/rocuts/Documents/GitHub/purpose-Aksha/apps/web/vercel.json','utf8')); console.log('vercel.json OK')"`
Expected: `vercel.json OK`

- [ ] **Step 5: Lint**

Run: `cd apps/web && npx eslint api/plan-semanal.js --quiet`
Expected: sin salida.

- [ ] **Step 6: Commit**

```bash
git add apps/web/api/plan-semanal.js apps/web/vercel.json
git commit -m "feat(pieza3): endpoint cron plan-semanal + vercel.json (14:00 UTC, maxDuration 300)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Ensayo E2E con la carta de Johan (validación final de la pieza)

**Files:**
- Create: `tools/ensayo-johan-plan-semanal.mjs`
- Requiere: `ANTHROPIC_API_KEY` en el entorno. Se corre a mano (no en CI), igual que la Pieza 1.

Genera semanas 1 y 4 en es y en a partir del reporte de Johan, valida cada una (min 400/max 1100), renderiza el HTML del email y deja todo en `ejemplos-privados/ensayo-johan/`. Imprime un resumen para el panel de jueces (cero astrología, anti-plantilla, sin vocabulario de elemento, nombre del cliente).

- [ ] **Step 1: Create the ensayo script**

Crear `tools/ensayo-johan-plan-semanal.mjs`:

```js
// Ensayo E2E del plan de 4 semanas con la carta/reporte de Johan.
// Genera semanas 1 y 4 (es y en), valida y renderiza el email.
// Requiere ANTHROPIC_API_KEY. Uso: node tools/ensayo-johan-plan-semanal.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { calcularElementoDebil } from '../apps/web/api/_lib/plan-elemento.js';
import { generarPlanSemanal } from '../apps/web/api/_lib/generar-plan-semanal.js';
import { validarReporte } from '../apps/web/api/_lib/validar-reporte.js';
import { formatearEmailPlanHTML } from '../apps/web/api/_lib/enviar-reporte.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '../ejemplos-privados/ensayo-johan');
const reporteMd = readFileSync(join(dir, 'reporte.md'), 'utf8');

const CARTA_STUB = { planetas: [{ nombre: '_', signo: '_', casa: 0 }], cuspides_casas: {} };
const prohibidas = /\b(elemento|fuego|tierra|aire|agua|fire|earth|water|element)\b/i;

const debil = calcularElementoDebil(reporteMd, null);
console.log(`Elemento débil de Johan: ${debil.elemento} (${debil.modulo}, ${debil.score}/20, vía ${debil.via})`);
if (debil.elemento !== 'agua') {
  console.error('❌ Se esperaba Misión=agua para Johan.'); process.exit(1);
}

let fallos = 0;
for (const [idioma, semanas] of [['es', [1, 4]], ['en', [1, 4]]]) {
  for (const semana of semanas) {
    console.log(`\n── Generando semana ${semana} (${idioma}) ──`);
    const contenido = await generarPlanSemanal({
      nombre: 'Johan Rocuts', reporteMd, elemento: debil.elemento, semana, idioma,
    });
    const palabras = (contenido.trim().match(/\S+/g) || []).length;
    const val = validarReporte(contenido, CARTA_STUB, { min: 400, max: 1100 });
    const fugaElemento = prohibidas.test(contenido);
    const tieneNombre = /Johan/.test(contenido);

    console.log(`palabras: ${palabras} · validación: ${val.ok ? 'OK' : 'FALLA → ' + val.errores.join(' | ')}`);
    console.log(`sin vocabulario de elemento: ${!fugaElemento} · nombra a Johan: ${tieneNombre}`);

    const mdPath = join(dir, `plan-s${semana}-${idioma}.md`);
    const htmlPath = join(dir, `plan-s${semana}-${idioma}.html`);
    writeFileSync(mdPath, contenido);
    writeFileSync(htmlPath, formatearEmailPlanHTML('Johan Rocuts', contenido, semana, idioma));
    console.log(`escrito: ${mdPath} · ${htmlPath}`);

    if (!val.ok || fugaElemento || !tieneNombre) fallos++;
  }
}

if (fallos) { console.error(`\n❌ ${fallos} semanas no pasaron los chequeos automáticos.`); process.exit(1); }
console.log('\n✅ Ensayo E2E del plan semanal superado. Revisar los .html con el panel de jueces.');
```

- [ ] **Step 2: Run the ensayo**

Run: `ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" node tools/ensayo-johan-plan-semanal.mjs`
Expected:
- Primera línea: `Elemento débil de Johan: agua (mision, 8/20, vía parseo)`
- Cuatro bloques (s1/s4 × es/en) con `validación: OK`, `sin vocabulario de elemento: true`, `nombra a Johan: true`, cada uno entre 400 y 1100 palabras.
- Última línea: `✅ Ensayo E2E del plan semanal superado.`
- Archivos nuevos en `ejemplos-privados/ensayo-johan/`: `plan-s1-es.{md,html}`, `plan-s4-es.{md,html}`, `plan-s1-en.{md,html}`, `plan-s4-en.{md,html}`.

- [ ] **Step 3: Panel de jueces (manual, igual que Pieza 1)**

Abrir los 4 `.html` en el navegador y revisar contra la skill `reportes-top-tier`:
- Cero astrología visible (ni un planeta/signo/casa/aspecto, ni en EN).
- Cero emojis/glifos.
- Anti-plantilla: cada email se ancla en el mapa de Johan (su herida del valor, su don de construir, etc.), no en generalidades.
- Semana 1 reconoce el patrón de la Misión (el fondo, sostener crisis, recibir ayuda); semana 4 consolida y mide.
- Firma exacta al cierre, en el idioma correcto.

Si el panel detecta fugas, ajustar `PROMPT_SISTEMA_PLAN_SEMANAL` (Task 6) y re-correr este ensayo antes de continuar.

- [ ] **Step 4: Commit (script de ensayo; los .html generados quedan fuera de git si así está el repo)**

```bash
git add tools/ensayo-johan-plan-semanal.mjs
git commit -m "test(pieza3): ensayo E2E del plan semanal con la carta de Johan (es/en, semanas 1 y 4)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

> Si `ejemplos-privados/` está versionado y el dueño quiere conservar las salidas como referencia, añadir también los `plan-s*-*.{md,html}` al commit. Verificar con `git check-ignore ejemplos-privados/ensayo-johan/plan-s1-es.html` antes.

---

## Task 12: Suite de regresión de la pieza completa

**Files:**
- Test: todos los `tools/test-*.mjs` de la pieza + los preexistentes que tocamos.

- [ ] **Step 1: Run the full Pieza 3 test suite**

Run:
```bash
node tools/test-validar-semanal.mjs && \
node tools/test-plan-elemento.mjs && \
node tools/test-prompt-plan-semanal.mjs && \
node tools/test-enviar-plan-semanal.mjs && \
node tools/test-plan-semanal-dryrun.mjs && \
node tools/test-validador-glifos.mjs
```
Expected: cada script imprime `Prueba superada.` y el comando encadenado sale con código 0.

- [ ] **Step 2: Lint de todos los archivos tocados/creados**

Run:
```bash
cd apps/web && npx eslint \
  api/_lib/plan-elemento.js api/_lib/prompt-plan-semanal.js \
  api/_lib/generar-plan-semanal.js api/_lib/enviar-reporte.js \
  api/_lib/validar-reporte.js api/_lib/pipeline-reporte.js \
  api/aprobar-reporte.js api/plan-semanal.js --quiet
```
Expected: sin salida (sin errores de lint).

- [ ] **Step 3: Confirmar presupuesto de metadata Stripe**

Verificar manualmente que las claves nuevas de Pieza 3 son solo 6 (`reporte_md_url`, `plan_elemento`, `plan_semana`, `plan_base_at`, `plan_log`, `plan_error`) y que `plan_log` se mantiene < 500 chars (cubierto por `test-plan-elemento.mjs`). Con esto el peor caso del mapa del equipo (~44-45/50 con 8 claves) baja a ~38-39/50: holgura recuperada.

- [ ] **Step 4: Commit (si hubo ajustes)**

```bash
git add -A
git commit -m "chore(pieza3): suite de regresion verde + verificacion de presupuesto de metadata

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (cobertura del spec "Pieza 3")

| Requisito del spec | Tarea |
|---|---|
| Parsear 4 marcadores /20 e IPN% con regex tolerante (es/en) | Task 2 |
| Módulo débil = menor /20; desempate menor IPN; orden Vocación>Misión>Pasión>Profesión | Task 2 |
| Mapeo Pasión=fuego, Profesión=tierra, Vocación=aire, Misión=agua | Task 2 |
| Fallback determinista por carta (planetas personales por elemento) | Task 2 |
| Persistir `plan_elemento`, `plan_semana:'0'`, `plan_base_at`; reporte.md a Blob `reportes-md/<pi>.md`; `reporte_md_url` | Task 3 |
| Anclar base en envío directo (al pasar a 'enviado') | Task 4 |
| Anclar base en aprobación de revisión (NO en 'en_revision') vía helper compartido | Task 5 |
| Cron diario 14:00 UTC, maxDuration 300, ventana 45 días, N=5 | Task 9 + Task 10 |
| Filtro `enviado` + `plan_semana<4` + `base + 7·(semana+1)d <= hoy` | Task 9 |
| Generar con `claude-sonnet-4-6`, prompt nuevo, 4 semanas (reconocer/practicar/integrar/consolidar) | Task 6 + Task 7 |
| 600-900 palabras, Markdown ligero, cero astrología/emojis, sin "elemento"/fuego/tierra/aire/agua, tuteo, nombre | Task 6 |
| Validar con límites propios (min 400/max 1100) | Task 1 + Task 10 |
| Plantilla Resend bilingüe nueva, from reportes@aksha.life | Task 8 |
| Estado avance: `plan_semana`, equivalente de `plan_semana_<n>_at`/`plan_intentos_<n>` (consolidado en `plan_log`), `plan_error`; máx 3 intentos/semana | Task 3 + Task 9 + Task 10 |
| Bilingüe (idioma de metadata manda) | Task 6, Task 7, Task 8, Task 10 |
| Sin estados nuevos en la máquina de Stripe; reintento natural al día siguiente | Task 9 + Task 10 (sin nuevos estados; cron diario reentra) |
| Ensayo E2E carta de Johan (Misión=agua 8/20, semanas 1 y 4 es/en, validar, render, panel jueces) | Task 11 |

**Placeholder scan:** sin "TBD"/"similar a Task N"/handlers vacíos — todo el código va completo en cada paso.

**Type consistency:** `calcularElementoDebil(reporteMd, carta)` devuelve `{elemento, modulo, score, ipn, via}` y se consume así en Tasks 4/5/11. `metadataBasePlan({elemento, reporteMdUrl})`, `guardarReporteMd(pi, md)`, `semanaPendiente(metadata, ahoraMs)`, `parsearPlanLog(raw)`, `construirPlanLog(log, semana, atIso, intentos)` — firmas idénticas en definición (Tasks 2/3/9) y en uso (Tasks 4/5/10). `generarPlanSemanal({nombre, reporteMd, elemento, semana, idioma})`, `enviarPlanSemanal({nombre, email, contenidoMd, semana, idioma})`, `construirMensajePlanSemanal({nombre, reporteMd, elemento, semana, idioma})`, `formatearEmailPlanHTML(nombre, contenidoMd, semana, idioma)` — consistentes entre definición y llamada.

---

## Execution Handoff

Plan completo y guardado. Dos opciones de ejecución:

1. **Subagent-Driven (recomendado):** un subagente fresco por tarea, revisión entre tareas.
2. **Inline Execution:** ejecutar las tareas en esta sesión con checkpoints.

(El `git push` lo hace el controlador al final; este plan no lo incluye.)
