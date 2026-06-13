# Pieza 1: Idioma del reporte (es/en) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que un cliente que compró en inglés reciba el Mapa de Propósito (markdown, web y email) en inglés, con validación bilingüe, sin cambiar nada para los pedidos en español.

**Architecture:** El idioma viaja del LanguageContext → checkout → metadata del PaymentIntent → pipeline → prompt (instrucción de idioma en el mensaje, no en el system) → validador (listas ES+EN) → plantilla web (parser y textos bilingües) → email (textos bilingües). Fallback universal: 'es'.

**Tech Stack:** Vercel serverless (Node ESM), Stripe metadata, React (checkout), sin framework de tests (scripts `node tools/test-*.mjs` que ya usa el repo).

**Spec:** `docs/superpowers/specs/2026-06-12-idioma-profesiones-plan-4-semanas-design.md` (Pieza 1)

**Convención de trabajo:** todos los comandos se corren desde `apps/web/`. El test de validador necesita una carta real: usar `../../ejemplos-privados/ensayo-johan/carta.json` (existe; si falta, regenerar con el venv de `/tmp/aksha-venv` según la memoria del proyecto).

---

### Task 1: Arreglar el test de regresión del validador (hoy está en rojo)

El test `tools/test-validar-reporte.mjs` es anterior al estándar editorial: sus
casos "correctos" mencionan astrología y hoy disparan los errores de estilo.
Hay que separar lo que verifica cada caso: los casos de posiciones deben mirar
solo errores de posición ("mencionado en"), no `resultado.ok`.

**Files:**
- Modify: `apps/web/tools/test-validar-reporte.mjs`

- [ ] **Step 1: Ver el rojo actual**

Run: `node tools/test-validar-reporte.mjs ../../ejemplos-privados/ensayo-johan/carta.json`
Expected: `2 CASO(S) FALLARON` (los dos primeros casos).

- [ ] **Step 2: Reescribir el runner para soportar chequeo por tipo de error**

Reemplazar el bloque final del archivo (desde `let fallos = 0;` hasta el
`process.exit`) por:

```js
// esperaOk: el reporte pasa completo (posiciones + estilo editorial).
// esperaSinErroresPosicion: solo exige que no haya errores de posición
// ("mencionado en"), ignorando los de estilo/extensión — para casos legacy
// que prueban el cruce de posiciones con texto astrológico deliberado.
let fallos = 0;
for (const caso of casos) {
  const resultado = validarReporte(caso.texto, caso.carta || carta);
  const erroresPosicion = resultado.errores.filter((e) => e.includes('mencionado en'));
  const paso = 'esperaSinErroresPosicion' in caso
    ? (erroresPosicion.length === 0) === caso.esperaSinErroresPosicion
    : resultado.ok === caso.esperaOk;
  if (!paso) fallos++;
  console.log(`${paso ? '✅' : '❌'} ${caso.nombre}`);
  if (!paso) {
    for (const e of resultado.errores) console.log(`     · ${e}`);
  }
}

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
```

- [ ] **Step 3: Reclasificar los casos legacy**

En el array `casos`, los dos primeros casos (los que tienen `esperaOk: true` y
texto astrológico) cambian `esperaOk: true` por
`esperaSinErroresPosicion: true`. Los casos con `esperaOk: false` que prueban
posiciones equivocadas ("error clásico: Júpiter en Capricornio", "signo
equivocado para el Sol", "casa equivocada para la Luna", "Ascendente
equivocado") cambian a `esperaSinErroresPosicion: false` (su intención es
detectar la posición falsa, no el estilo). El caso "carta fallback" conserva
`esperaOk: false` (prueba el camino completo).

- [ ] **Step 4: Verificar verde**

Run: `node tools/test-validar-reporte.mjs ../../ejemplos-privados/ensayo-johan/carta.json`
Expected: `TODOS LOS CASOS PASAN`

- [ ] **Step 5: Commit**

```bash
git add tools/test-validar-reporte.mjs
git commit -m "Test del validador: separar chequeo de posiciones del estándar editorial"
```

---

### Task 2: El checkout envía el idioma a Stripe

**Files:**
- Modify: `apps/web/src/pages/CheckoutPage.jsx:149` (body del fetch)
- Modify: `apps/web/api/create-payment-intent.js:22-35,55-66`

- [ ] **Step 1: Enviar `idioma` desde el frontend**

En `CheckoutPage.jsx`, el componente ya tiene `const { lang } = useLanguage();`
(línea 110). En el fetch a `/api/create-payment-intent` (línea ~149) cambiar:

```js
body: JSON.stringify({ name, email, birthDate, birthTime, birthPlace, historiaVida }),
```

por:

```js
body: JSON.stringify({ name, email, birthDate, birthTime, birthPlace, historiaVida, idioma: lang }),
```

- [ ] **Step 2: Recibir y validar en la función serverless**

En `create-payment-intent.js`:

Línea 22, añadir `idioma` al destructuring:

```js
const { name, email, birthDate, birthTime, birthPlace, historiaVida, idioma } = req.body || {};
```

Después del bloque de validación (tras la línea 35), añadir:

```js
// Idioma del reporte: 'es' o 'en'. Cualquier otra cosa (o ausencia) cae a
// 'es' — los pedidos viejos no traen este campo y no deben romperse.
const idiomaReporte = idioma === 'en' ? 'en' : 'es';
```

En el objeto `metadata` del `paymentIntents.create` (líneas 55-66), añadir:

```js
        idioma: idiomaReporte,
```

- [ ] **Step 3: Verificación estática**

Run: `node --check api/create-payment-intent.js && npx vite build --logLevel error > /dev/null && echo BUILD_OK`
Expected: `BUILD_OK` (sin errores de sintaxis ni de build).

- [ ] **Step 4: Commit**

```bash
git add src/pages/CheckoutPage.jsx api/create-payment-intent.js
git commit -m "Checkout: el idioma del cliente viaja a la metadata de Stripe"
```

---

### Task 3: Instrucción de idioma en el mensaje del prompt

El system prompt (`PROMPT_SISTEMA_AKSHA`) no se toca: la instrucción de idioma
va en el mensaje, con el vocabulario oficial EN para no romper parsers.

**Files:**
- Modify: `apps/web/api/_lib/prompt-aksha.js:182` (firma y cuerpo de `construirMensajeCliente`)
- Test: `apps/web/tools/test-prompt-idioma.mjs` (nuevo)

- [ ] **Step 1: Escribir el test que falla**

Crear `tools/test-prompt-idioma.mjs`:

```js
// Verifica que construirMensajeCliente añade el bloque de idioma EN solo
// cuando idioma === 'en', con el vocabulario oficial completo.
import { construirMensajeCliente } from '../api/_lib/prompt-aksha.js';

const base = {
  nombre: 'Test Client', email: 'test@example.com', birthDate: '13/10/1996',
  birthTime: '01:45', birthPlace: 'Bogotá, Colombia',
  carta: { texto: 'CARTA NATAL (stub)' }, observaciones: '', historiaVida: '',
};

let fallos = 0;
const espera = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

const es = construirMensajeCliente({ ...base, idioma: 'es' });
const sin = construirMensajeCliente({ ...base });
const en = construirMensajeCliente({ ...base, idioma: 'en' });

espera('es: sin bloque de inglés', !es.includes('ENTIRE REPORT IN ENGLISH'));
espera('sin idioma: sin bloque de inglés', !sin.includes('ENTIRE REPORT IN ENGLISH'));
espera('en: bloque de inglés presente', en.includes('ENTIRE REPORT IN ENGLISH'));
espera('en: semáforo oficial', en.includes('FLOW / TENSION / BRAKE'));
espera('en: dones oficiales', en.includes('Birth gifts.') && en.includes('Birth challenges.'));
espera('en: IPN conserva sigla', en.includes('Natal Potential Index (IPN)'));
espera('en: etapas oficiales', en.includes('Exploration stage'));
espera('en: firma oficial', en.includes('AKSHA LIFE · AI does not create knowledge. It connects it.'));
espera('en: títulos de sección', en.includes('The wound that becomes a gift'));

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
```

Run: `node tools/test-prompt-idioma.mjs`
Expected: FAIL (el bloque EN no existe todavía).

- [ ] **Step 2: Implementar el bloque de idioma**

En `prompt-aksha.js`, cambiar la firma (línea 182):

```js
export function construirMensajeCliente({ nombre, email, birthDate, birthTime, birthPlace, carta, observaciones, historiaVida, idioma }) {
```

Antes del `return`, añadir:

```js
  const bloqueIdioma = idioma !== 'en' ? '' : `

LANGUAGE OF THE REPORT (NON-NEGOTIABLE):
Write the ENTIRE REPORT IN ENGLISH — natural, warm, native-level English, not
a literal translation. Every rule of the system prompt applies unchanged.
Official English vocabulary (exact strings, the rendering pipeline parses them):
- Traffic light, always as a WORD: FLOW / TENSION / BRAKE.
- Diagnosis: ACTIVE / IN DEVELOPMENT / BLOCKED / TRANSCENDED.
- Gifts and challenges blocks open exactly with "Birth gifts." and
  "Birth challenges." (prose follows on the same line).
- The index keeps its initials: "Natal Potential Index (IPN)"; each module
  line keeps the format "IPN 60%. <one reading line>". The word "natal" may
  ONLY appear inside "Natal Potential Index".
- Life stages: Exploration / Construction / Revision / Integration / Legacy.
  In the opening, name the client's stage with the exact phrase
  "<Stage> stage" (e.g. "you are closing the Exploration stage").
- Section titles, exactly: "Opening" · "Passion · What you love" ·
  "Profession · What you are good at" · "Vocation · What you can be paid
  for" · "Mission · What the world needs" · "The wound that becomes a gift" ·
  "Summary of your map" · "Synthesis · Gifts and challenges" ·
  "What is activating now" · "Your path in 2026" · "Closing".
- Never "problem" (use "challenge"), never "weakness" (use "growth area").
- Closing signature, exactly:
  "AKSHA LIFE · AI does not create knowledge. It connects it."`;
```

Y en el `return`, insertar `${bloqueIdioma}` inmediatamente después de
`${avisoSinHora}${bloqueHistoriaVida}` (misma línea, antes del salto a
`${carta.texto}`).

- [ ] **Step 3: Verificar verde**

Run: `node tools/test-prompt-idioma.mjs`
Expected: `TODOS LOS CASOS PASAN`

- [ ] **Step 4: Commit**

```bash
git add api/_lib/prompt-aksha.js tools/test-prompt-idioma.mjs
git commit -m "Prompt: instruccion de idioma EN con vocabulario oficial parseable"
```

---

### Task 4: El pipeline propaga el idioma

**Files:**
- Modify: `apps/web/api/_lib/pipeline-reporte.js:44,52,89-99,109,21-34,150`
- Modify: `apps/web/api/_lib/generar-reporte.js:15-17,29`

- [ ] **Step 1: Leer idioma de metadata y propagarlo**

En `pipeline-reporte.js`:

Línea 44, añadir `idioma` a la lectura de metadata (justo tras la línea del
destructuring existente):

```js
  const { customer_name, customer_email, birth_date, birth_time, birth_place, producto } = md;
  // Idioma del reporte ('es'|'en'); pedidos antiguos no lo traen → 'es'.
  const idioma = md.idioma === 'en' ? 'en' : 'es';
```

En la llamada a `generarReporte` (líneas 89-99), añadir `idioma`:

```js
    const reporte = await generarReporte({
      nombre: customer_name,
      email: customer_email,
      birthDate: birth_date,
      birthTime,
      birthPlace: birth_place,
      carta,
      observaciones,
      historiaVida,
      producto,
      idioma,
    });
```

En `generarMapaWeb` (líneas 21-34): cambiar la firma y la llamada para pasar
idioma:

```js
async function generarMapaWeb(paymentIntentId, nombre, reporte, idioma) {
  try {
    const html = renderReporteWeb({ nombre, reporte, idioma });
```

y en el cuerpo de `procesarPedido` (línea ~109):

```js
    const urlWeb = await generarMapaWeb(paymentIntentId, customer_name, reporte, idioma);
```

En la llamada a `enviarReporte` (línea ~150), añadir `idioma`:

```js
    const envio = await enviarReporte({ nombre: customer_name, email: customer_email, reporte, urlWeb, idioma });
```

- [ ] **Step 2: generar-reporte.js pasa idioma al constructor del mensaje**

En `generar-reporte.js`, firma (líneas 15-17):

```js
export async function generarReporte({
  nombre, email, birthDate, birthTime, birthPlace, carta, observaciones, historiaVida, producto, idioma,
}) {
```

y la llamada (línea 29):

```js
        content: prod.construirMensaje({ nombre, email, birthDate, birthTime, birthPlace, carta, observaciones, historiaVida, idioma }),
```

(`renderReporteWeb` y `enviarReporte` ignoran `idioma` hasta las Tasks 6 y 7;
recibir una propiedad extra no rompe nada.)

- [ ] **Step 3: Verificación estática**

Run: `node --check api/_lib/pipeline-reporte.js && node --check api/_lib/generar-reporte.js && echo OK`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add api/_lib/pipeline-reporte.js api/_lib/generar-reporte.js
git commit -m "Pipeline: propaga el idioma del pedido a prompt, plantilla y email"
```

---

### Task 5: Validador bilingüe

**Files:**
- Modify: `apps/web/api/_lib/validar-reporte.js`
- Modify: `apps/web/tools/test-validar-reporte.mjs` (casos EN nuevos)

- [ ] **Step 1: Escribir los casos EN que fallan**

En `tools/test-validar-reporte.mjs`, añadir al array `casos` (antes del caso
"carta fallback"):

```js
  {
    nombre: 'EN: términos astrológicos detectados',
    texto: 'Your trine to the midheaven shows talent, and the ascendant confirms it.',
    esperaOk: false,
  },
  {
    nombre: 'EN: posición correcta no marca error de posición',
    texto: `The Sun in ${SIGNOS_EN_TEST[natal.Sol.signo]} drives your work.`,
    esperaSinErroresPosicion: true,
  },
  {
    nombre: 'EN: signo equivocado para el Sol',
    texto: 'The Sun in Virgo makes you meticulous.',
    esperaSinErroresPosicion: false,
  },
  {
    nombre: 'EN: casa equivocada',
    texto: 'The Moon in the 5th house speaks of creativity.',
    esperaSinErroresPosicion: false,
  },
```

Y arriba del array, el mapa de signos para el caso correcto:

```js
const SIGNOS_EN_TEST = {
  Aries: 'Aries', Tauro: 'Taurus', 'Géminis': 'Gemini', 'Cáncer': 'Cancer',
  Leo: 'Leo', Virgo: 'Virgo', Libra: 'Libra', Escorpio: 'Scorpio',
  Sagitario: 'Sagittarius', Capricornio: 'Capricorn', Acuario: 'Aquarius',
  Piscis: 'Pisces',
};
```

Run: `node tools/test-validar-reporte.mjs ../../ejemplos-privados/ensayo-johan/carta.json`
Expected: FAIL en los casos EN (el validador aún no conoce inglés).
Nota: el Sol del ensayo está en Libra ("Sun in Libra" — Libra se escribe igual
en ambos idiomas pero el nombre del punto "sun" no existe aún en el validador,
por eso el caso correcto también falla antes de implementar).

- [ ] **Step 2: Implementar el soporte EN en validar-reporte.js**

Añadir tras la definición de `SIGNOS_NORM` (línea 19):

```js
// Equivalencias EN→ES para validar reportes en inglés con la misma carta.
const SIGNOS_EN = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];
const SIGNO_EN_A_ES = Object.fromEntries(SIGNOS_EN.map((s, i) => [s, SIGNOS_NORM[i]]));
const NOMBRES_EN = {
  sun: 'sol', moon: 'luna', mercury: 'mercurio', venus: 'venus',
  mars: 'marte', jupiter: 'jupiter', saturn: 'saturno', uranus: 'urano',
  neptune: 'neptuno', pluto: 'pluton', 'north node': 'nodo norte',
  'south node': 'nodo sur', chiron: 'quiron', ascendant: 'ascendente',
  midheaven: 'medio cielo', lilith: 'lilith',
};
```

Ampliar `TERMINOS_ASTRO` (líneas 96-101) añadiendo al final del primer grupo
los términos EN inequívocos y los patrones EN:

```js
const TERMINOS_ASTRO = new RegExp(
  '\\b(trigono|cuadratura|sextil|quincuncio|ascendente|medio cielo|dispositor|' +
  'quiron|carta natal|zodiaco|zodiacal|efemerides|swiss ephemeris|luminaria|' +
  'trine|sextile|quincunx|ascendant|midheaven|natal chart|zodiac|ephemeris|' +
  'chiron|luminary)\\b' +
  `|\\bcasa\\s+\\d{1,2}\\b|\\ben\\s+(?:${SIGNOS_NORM.join('|')})\\b` +
  `|\\bin\\s+the\\s+\\d{1,2}(?:st|nd|rd|th)\\s+house\\b` +
  `|\\b(?:${Object.keys(NOMBRES_EN).join('|')})\\s+in\\s+(?:${SIGNOS_EN.join('|')})\\b`,
  'g',
);
```

En `validarReporte`, después del loop existente de `puntos` (líneas 156-187),
añadir el cruce de posiciones EN:

```js
  // Posiciones afirmadas en inglés: se traducen al nombre/signo ES y se
  // cruzan contra los mismos puntos de la carta.
  for (const [nombreEn, claveEs] of Object.entries(NOMBRES_EN)) {
    const punto = puntos.get(claveEs);
    if (!punto) continue;
    const patronSignoEn = new RegExp(
      `\\b(?:the\\s+)?${nombreEn}(?:\\s+is)?\\s+in\\s+(?:the\\s+sign\\s+of\\s+)?(${SIGNOS_EN.join('|')})\\b`,
      'g',
    );
    for (const m of texto.matchAll(patronSignoEn)) {
      if (!punto.signos.has(SIGNO_EN_A_ES[m[1]])) {
        errores.push(
          `${punto.etiqueta} mencionado en ${m[1]} — la carta dice ${[...punto.signos].join(' / ') || '(sin posición)'}.`,
        );
      }
    }
    const patronCasaEn = new RegExp(
      `\\b${nombreEn}\\b([^.;\\n]{0,45}?)\\bthe\\s+(\\d{1,2})(?:st|nd|rd|th)\\s+house\\b`,
      'g',
    );
    for (const m of texto.matchAll(patronCasaEn)) {
      if (punto.casas.size > 0 && !punto.casas.has(Number(m[2]))) {
        errores.push(
          `${punto.etiqueta} mencionado en Casa ${m[2]} — la carta dice Casa ${[...punto.casas].join(' / ')}.`,
        );
      }
    }
  }
```

- [ ] **Step 3: Verificar verde (casos ES y EN)**

Run: `node tools/test-validar-reporte.mjs ../../ejemplos-privados/ensayo-johan/carta.json`
Expected: `TODOS LOS CASOS PASAN`

- [ ] **Step 4: Commit**

```bash
git add api/_lib/validar-reporte.js tools/test-validar-reporte.mjs
git commit -m "Validador bilingue: terminos astrologicos y posiciones en ingles"
```

---

### Task 6: Plantilla web bilingüe

**Files:**
- Modify: `apps/web/api/_lib/plantilla-reporte-web.js`
- Test: `apps/web/tools/test-plantilla-web-en.mjs` (nuevo)

- [ ] **Step 1: Escribir el test que falla**

Crear `tools/test-plantilla-web-en.mjs`:

```js
// La plantilla web debe parsear y renderizar un reporte EN con el
// vocabulario oficial (FLOW/BRAKE, Birth gifts, IPN, Exploration stage).
import { renderReporteWeb } from '../api/_lib/plantilla-reporte-web.js';

const reporteEn = `# Purpose Map

## Opening

Test, this map reads four areas of your life.

How to read the markers. Score out of 20, the traffic light, the diagnosis,
and the Natal Potential Index (IPN). At 29 you are closing the Exploration stage.

## Passion · What you love

Score 13/20 · TENSION · ACTIVE

When something excites you, people notice before you say it.

The tension of this area lives between drive and ideals.

Birth gifts. An initiative that opens roads for others.

Birth challenges. You idealize projects until reality feels small.

IPN 60%. Six out of ten parts of this area's potential are available.

## Mission · What the world needs

Score 8/20 · FLOW · IN DEVELOPMENT

Other people's crises do not scare you.

It moves without internal resistance.

Birth gifts. Steadiness in difficulty.

Birth challenges. You carry alone what belongs to many.

IPN 57%. Most of this area's potential already responds.

## The wound that becomes a gift

There is an old wound around your own worth.

It heals by doing.

## What is activating now

A deep reorganization window is open.

A strong current pushes you to redefine how you show up.

## Closing

Test, your map draws someone who starts visibly and builds patiently.

AKSHA LIFE · AI does not create knowledge. It connects it.`;

let fallos = 0;
const espera = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

const html = renderReporteWeb({ nombre: 'Test Client', reporte: reporteEn, idioma: 'en' });

espera('detecta 2 módulos', (html.match(/class="modulo/g) || []).length === 2);
espera('score 13/20 parseado', html.includes('13<small>/20'));
espera('semáforo FLOW sin acento', html.includes('FLOW') && !html.includes('TENSIÓN'));
espera('IPN 60% parseado', html.includes('60<small>% IPN'));
espera('Birth gifts en ficha', html.includes('Birth gifts'));
espera('etapa EXPLORATION', html.includes('EXPLORATION'));
espera('lang="en"', html.includes('<html lang="en">'));
espera('título Purpose Map', html.includes('· Purpose Map</title>'));
espera('overline EN de apertura', html.includes('Before you begin'));
espera('lema EN', html.includes('AI does not create knowledge. It connects it.'));

// Regresión ES: el render español no cambia.
const htmlEs = renderReporteWeb({ nombre: 'Test', reporte: '## Apertura\n\nHola.\n\n## Cierre\n\nAdiós.\n\nAKSHA LIFE · La IA no crea el conocimiento. Lo conecta.' });
espera('ES sigue con lang es y lema es', htmlEs.includes('<html lang="es">') && htmlEs.includes('La IA no crea el conocimiento. Lo conecta.'));

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
```

Run: `node tools/test-plantilla-web-en.mjs`
Expected: FAIL (varios casos).

- [ ] **Step 2: Implementar el soporte EN en plantilla-reporte-web.js**

2a. Diccionario de textos fijos, tras `ETIQUETAS_MODULO` (línea 30):

```js
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
```

2b. `clasificarTitulo` (líneas 49-63) acepta títulos EN — reemplazar el cuerpo:

```js
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
```

2c. `parsearModulo` (líneas 96-144) — tres cambios:

- Marcador y diagnóstico bilingües (líneas 110-111):

```js
    const mSem = norm.match(/\b(flujo|tension|freno|flow|brake)\b/);
    const mDiag = norm.match(/\b(activo|en desarrollo|bloqueado|trascendido|active|in development|blocked|transcended)\b/);
```

- El semáforo solo recibe acento en español. Donde hoy dice
  `.toUpperCase().replace('TENSION', 'TENSIÓN')` (líneas 116 y 136), usar una
  función auxiliar definida junto a `normalizar`:

```js
function etiquetaSemaforo(palabra, idioma) {
  const up = palabra.toUpperCase();
  return idioma === 'en' ? up : up.replace('TENSION', 'TENSIÓN');
}
```

  `parsearModulo` necesita el idioma: cambiar la firma a
  `function parsearModulo(seccion, idioma)` y las dos líneas a
  `mod.semaforo = etiquetaSemaforo(mSem[1], idioma);`.

- Dones/desafíos bilingües (líneas 120-127):

```js
    if (/^(dones de nacimiento|birth gifts)/i.test(norm)) {
      mod.dones = plano.replace(/^(dones de nacimiento|birth gifts)[.:]?\s*/i, '');
      continue;
    }
    if (/^(desaf|birth challenges)/i.test(norm)) {
      mod.desafios = plano.replace(/^(desaf[íi]os de nacimiento|birth challenges)[.:]?\s*/i, '');
      continue;
    }
```

- El regex del IPN (línea 112) ya acepta "ipn"; ampliarlo por claridad:

```js
    const mIpn = plano.match(/(?:índice de potencial natal|natal potential index|ipn)[^0-9]{0,12}(\d{1,3})\s*%/i);
```

2d. `renderReporteWeb` (línea 296) — recibir idioma y usarlo:

```js
export function renderReporteWeb({ nombre, reporte, idioma = 'es', fecha = new Date() }) {
  const t = TEXTOS[idioma] || TEXTOS.es;
  const etiquetasModulo = idioma === 'en' ? ETIQUETAS_MODULO_EN : ETIQUETAS_MODULO;
```

- Pasar `idioma` a `parsearModulo` (línea 300): `modulos.push(parsearModulo(s, idioma));`
- La etapa (líneas 307-309) acepta EN — reemplazar por:

```js
  const mEtapa = normalizar(apertura?.texto || '').match(
    /etapa de (exploracion|construccion|revision|integracion|legado)|(exploration|construction|revision|integration|legacy) stage/,
  );
  const etapaCruda = mEtapa ? (mEtapa[1] || mEtapa[2]) : '';
  const ETAPAS = {
    exploracion: 'EXPLORACIÓN', construccion: 'CONSTRUCCIÓN', revision: 'REVISIÓN',
    integracion: 'INTEGRACIÓN', legado: 'LEGADO',
    exploration: 'EXPLORATION', construction: 'CONSTRUCTION',
    integration: 'INTEGRATION', legacy: 'LEGACY',
  };
  const etapa = etapaCruda ? (ETAPAS[etapaCruda] || etapaCruda.toUpperCase()) : '';
```

  (ojo: en EN, `revision` debe quedar "REVISION" sin acento — al venir por la
  rama EN del regex, `mEtapa[2]` será 'revision' y `ETAPAS.revision` daría
  acento; para evitarlo, anteponer la clave con prefijo de rama:
  `const claveEtapa = mEtapa && mEtapa[2] ? 'en:' + mEtapa[2] : etapaCruda;`
  y añadir entradas `'en:revision': 'REVISION'`, etc. Implementación final:

```js
  const ETAPAS = {
    exploracion: 'EXPLORACIÓN', construccion: 'CONSTRUCCIÓN', revision: 'REVISIÓN',
    integracion: 'INTEGRACIÓN', legado: 'LEGADO',
    'en:exploration': 'EXPLORATION', 'en:construction': 'CONSTRUCTION',
    'en:revision': 'REVISION', 'en:integration': 'INTEGRATION', 'en:legacy': 'LEGACY',
  };
  const claveEtapa = mEtapa ? (mEtapa[2] ? `en:${mEtapa[2]}` : mEtapa[1]) : '';
  const etapa = claveEtapa ? (ETAPAS[claveEtapa] || '') : '';
```
  )

- `fecha` del hero: `new Intl.DateTimeFormat(idioma === 'en' ? 'en' : 'es', ...)` (línea 316).
- Reemplazar los textos fijos del HTML por el diccionario `t`:
  - `<html lang="es">` → `<html lang="${idioma}">`
  - `<title>AKSHA · ${...} · Mapa de Propósito</title>` → `· ${t.tituloDoc}</title>`
  - `marca-sub`: `Mapa de Propósito · ${mesAnoCap}` → `${t.tituloDoc} · ${mesAnoCap}`
  - `hero-meta`: `mapa activo` → `${t.mapaActivo}`
  - etapa: `Etapa de vida` → `${t.etapaVida}`
  - overline apertura: `Antes de empezar <span class="dim">· cómo leer tu mapa</span>` → `${t.antesDeEmpezar}`
  - `renderNumeros`: overline `Primero · los números` → `${t.primeroNumeros}`, h2 → `${t.dimensiones}`, intro → `${t.dimensionesIntro}`
  - `renderModulo`: `<h4>Dones de nacimiento</h4>` → `<h4>${t.dones}</h4>`, ídem desafíos
  - `renderAhora`: `Ventanas abiertas` → `${t.ventanas}`
  - `renderCierre`: overline `Cierre` → `${t.cierre}`, lema → `${t.lema}`

  Las funciones `renderNumeros`, `renderModulo`, `renderAhora` y `renderCierre`
  necesitan recibir `t` (y `renderNumeros`/`renderModulo` también
  `etiquetasModulo`): cambiar sus firmas a
  `renderNumeros(modulos, t, etiquetasModulo)`,
  `renderModulo(mod, indice, t, etiquetasModulo)`, `renderAhora(seccion, t)`,
  `renderCierre(seccion, t)` y actualizar las llamadas dentro de
  `renderReporteWeb`; dentro de ellas, reemplazar `ETIQUETAS_MODULO[...]` por
  `etiquetasModulo[...]`.
  El filtro de firma en `bloques()` (línea 93) ya cubre ambos idiomas porque
  la firma EN también empieza con "AKSHA LIFE ·".

- [ ] **Step 3: Verificar verde + regresión del preview ES**

Run: `node tools/test-plantilla-web-en.mjs && node tools/preview-reporte-web.mjs && echo PREVIEW_OK`
Expected: `TODOS LOS CASOS PASAN` y `PREVIEW_OK` (el preview ES se genera sin errores).

- [ ] **Step 4: Commit**

```bash
git add api/_lib/plantilla-reporte-web.js tools/test-plantilla-web-en.mjs
git commit -m "Plantilla web bilingue: parser y textos fijos es/en"
```

---

### Task 7: Email bilingüe

**Files:**
- Modify: `apps/web/api/_lib/enviar-reporte.js:44-63,230-307`

- [ ] **Step 1: Textos del email según idioma**

En `enviar-reporte.js`, añadir tras `const FUENTE_SERIF = ...` (línea 161):

```js
const TEXTOS_EMAIL = {
  es: {
    asunto: (nombre) => `${nombre}, tu Mapa de Propósito está listo`,
    producto: 'Mapa de Propósito',
    preheader: 'Tu lectura completa: los cuatro módulos Ikigai, tus dones y desafíos de nacimiento y las ventanas de este ciclo.',
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
```

Cambiar `enviarReporte` (líneas 44-63) para aceptar y usar idioma:

```js
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
    subject: t.asunto(primerNombre),
    html: formatearEmailHTML(nombre, reporte, '', urlWeb, idioma),
    text: (urlWeb ? `${t.abrirWeb} ${urlWeb}\n\n` : '') + reporte,
  }, `email a ${email}`);

  console.log('✅ Email enviado a:', email);
  return resultado;
}
```

Cambiar `formatearEmailHTML` (línea 230) a:

```js
export function formatearEmailHTML(nombre, reporte, encabezadoExtra = '', urlWeb = '', idioma = 'es') {
  const t = TEXTOS_EMAIL[idioma] || TEXTOS_EMAIL.es;
```

y dentro reemplazar los textos fijos: el botón (`Abrir tu Mapa en la web` →
`${t.botonMapa}`, la nota → `${t.botonNota}`), `const preheader = ...` →
`const preheader = t.preheader;`, `<html lang="es">` → `<html lang="${idioma}">`,
`<title>AKSHA · Mapa de Propósito</title>` → `<title>AKSHA · ${t.producto}</title>`,
el sub del logo (`Mapa de Propósito` → `${t.producto}`), el párrafo intro
(reemplazar el texto entre `<p style="margin:0;color:#A9AEB9...">` y `</p>`
por `${t.intro}`), la línea de contacto (`Si tienes preguntas, escríbenos a`
→ `${t.contacto}`) y el lema final → `${t.lema}`.
(`enviarReporteRevision` queda en español: la revisora es interna.)

- [ ] **Step 2: Verificación estática + humo**

Run: `node --check api/_lib/enviar-reporte.js && node --input-type=module -e "
const { formatearEmailHTML } = await import('./api/_lib/enviar-reporte.js');
const en = formatearEmailHTML('Test Client', '## Opening\n\nHello.', '', 'https://x.test', 'en');
const es = formatearEmailHTML('Test Cliente', '## Apertura\n\nHola.');
if (!en.includes('your Purpose Map is ready') && !en.includes('Open your Map on the web')) throw new Error('EN no aplicado');
if (!en.includes('lang=\"en\"') || !en.includes('It connects it.')) throw new Error('EN incompleto');
if (!es.includes('Abrir tu Mapa') === false && !es.includes('lang=\"es\"')) throw new Error('ES roto');
console.log('EMAIL_OK');
"`
Expected: `EMAIL_OK`

- [ ] **Step 3: Commit**

```bash
git add api/_lib/enviar-reporte.js
git commit -m "Email del reporte bilingue (asunto, intro, boton y lema es/en)"
```

---

### Task 8: Ensayo E2E en inglés (gate antes de desplegar)

Sin esto no se despliega. Reproduce el ensayo validado el 2026-06-12 (memoria
`ensayo-e2e-reportes-aksha`), ahora en inglés.

**Files:**
- Create: `ejemplos-privados/ensayo-johan/mensaje-en.txt` (generado)
- Create: `ejemplos-privados/ensayo-johan/reporte-en.md` (generado)
- Create: `ejemplos-privados/ensayo-johan/mapa-johan-en.html` (generado)

- [ ] **Step 1: Construir el mensaje EN de producción**

Run (desde `apps/web/`):

```bash
node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';
const { construirMensajeCliente } = await import('./api/_lib/prompt-aksha.js');
const carta = JSON.parse(readFileSync('../../ejemplos-privados/ensayo-johan/carta.json', 'utf8'));
const mensaje = construirMensajeCliente({
  nombre: 'Johan Alexander Espinosa Rocuts', email: 'developer@basileasystems.com',
  birthDate: '13/10/1996', birthTime: '01:45', birthPlace: 'Bogotá, Colombia',
  carta, observaciones: '', historiaVida: '', idioma: 'en',
});
writeFileSync('../../ejemplos-privados/ensayo-johan/mensaje-en.txt', mensaje);
console.log('mensaje-en.txt OK', mensaje.length);
"
```

Expected: `mensaje-en.txt OK <n>` con el bloque "LANGUAGE OF THE REPORT" dentro.

- [ ] **Step 2: Generar el reporte EN**

Despachar un agente generador con `sistema.txt` como system prompt y
`mensaje-en.txt` como mensaje (idéntico al ensayo ES), que escriba
`ejemplos-privados/ensayo-johan/reporte-en.md`. Si el agente no está
disponible, generar inline siguiendo el prompt maestro + skill
reportes-top-tier.

- [ ] **Step 3: Validar y renderizar**

```bash
node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';
const { validarReporte } = await import('./api/_lib/validar-reporte.js');
const { renderReporteWeb } = await import('./api/_lib/plantilla-reporte-web.js');
const reporte = readFileSync('../../ejemplos-privados/ensayo-johan/reporte-en.md', 'utf8');
const carta = JSON.parse(readFileSync('../../ejemplos-privados/ensayo-johan/carta.json', 'utf8'));
const v = validarReporte(reporte, carta);
console.log('validarReporte ok:', v.ok); if (!v.ok) v.errores.forEach(e => console.log(' -', e));
const html = renderReporteWeb({ nombre: 'Johan Alexander Espinosa Rocuts', reporte, idioma: 'en' });
writeFileSync('../../ejemplos-privados/ensayo-johan/mapa-johan-en.html', html);
console.log('módulos:', (html.match(/class=\"modulo/g)||[]).length, '· barras:', (html.match(/class=\"bar\"/g)||[]).length);
"
```

Expected: `validarReporte ok: true`, 4 módulos, 4 barras.

- [ ] **Step 4: Panel de jueces sobre el reporte EN**

Despachar 2 jueces adversariales (mismos prompts del ensayo ES, adaptados):
(1) anti-plantilla/molde sintáctico sobre `reporte-en.md`; (2) coherencia
motor↔reporte con `mensaje-en.txt`. Criterio de salida: APRUEBA de ambos
(corregir y re-auditar si no).

- [ ] **Step 5: Commit del ensayo (sin datos sensibles fuera de ejemplos-privados)**

```bash
git status --short  # verificar que ejemplos-privados/ está fuera de git (gitignore)
git log --oneline -3
```

Si `ejemplos-privados/` no está ignorado, NO commitearlo: contiene datos
personales. Solo verificar.

---

## Self-review (hecho al escribir el plan)

- Cobertura del spec Pieza 1: checkout ✓ (Task 2), prompt EN ✓ (Task 3),
  pipeline ✓ (Task 4), vocabulario oficial ✓ (Task 3), plantilla ✓ (Task 6),
  validador ✓ (Task 5), emails ✓ (Task 7), fallback es ✓ (Tasks 2/4/6/7),
  prueba E2E con test negativo "trine"/"Sun in Virgo" ✓ (Tasks 5/8).
- Sin placeholders; el único paso no mecanizable (generación del reporte EN)
  declara el procedimiento exacto del ensayo ES.
- Tipos consistentes: `idioma` viaja como string 'es'|'en' por todas las
  firmas; `renderReporteWeb({ nombre, reporte, idioma })`;
  `enviarReporte({ ..., idioma })`; `construirMensajeCliente({ ..., idioma })`.
