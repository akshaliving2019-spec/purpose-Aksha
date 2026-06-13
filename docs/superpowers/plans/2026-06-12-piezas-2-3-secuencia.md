# Piezas 2 y 3 — Secuencia de integración anti-conflicto

> **Rol:** documento del integrador. No reemplaza los planes de cada pieza; los
> ordena para que dos sesiones (o dos pasadas) no se pisen en los archivos
> compartidos. Cada pieza conserva su TDD y sus commits; aquí se fija EL ORDEN
> y la PARTICIÓN de los archivos que ambas tocan.

- **Pieza 2** (Profesiones del Agente Global en el reporte):
  `docs/superpowers/plans/2026-06-12-pieza2-profesiones.md`
- **Pieza 3** (Plan de 4 semanas por elemento débil):
  `docs/superpowers/plans/2026-06-12-pieza3-plan-4-semanas.md`

Ambas declaran explícitamente que comparten archivos del pipeline y deben
secuenciarse (Pieza 2: *"La Pieza 3 NO se toca aquí, aunque comparta archivos"*;
Pieza 3: *"el reporte recién revisado trae marcadores"*). Este documento es la
fuente de verdad de ese cruce.

---

## 1. Archivos que ambas piezas tocan

De los 5 archivos señalados por el integrador, sólo **DOS** son tocados por
ambas piezas. Los otros tres los toca una sola pieza (sin conflicto), pero se
listan para dejar constancia de por qué NO necesitan partición.

| Archivo | Pieza 2 | Pieza 3 | ¿Conflicto? | Estrategia |
|---|---|---|---|---|
| `apps/web/api/_lib/validar-reporte.js` | Task 7: techo condicional 3300/3600 según sección territorio (reescribe constantes 121-124, cuerpo de `validarEstandarEditorial` 126-149) | Task 1: parametriza `validarReporte(reporte, carta, opciones)` con `{min,max}` (reescribe constantes 121-124 + firma 153 + firma de `validarEstandarEditorial`) | **SÍ — solapan en el MISMO bloque** | **MERGE en un solo paso (Fase 2A).** No es secuenciable como dos parches independientes: ambos reescriben las mismas líneas con intenciones distintas. Se aplica UNA edición combinada (ver §3). |
| `apps/web/api/_lib/pipeline-reporte.js` | Task 9: import de `buscarOportunidades`/`paisDesdeLugar` (tras línea 17); lookup entre `calcularCarta` y `generarReporte`; campo `oportunidades` en la llamada a `generarReporte` | Task 4: import de `plan-elemento` (tras línea 17); base del plan tras `enviarReporte`; `...metaPlan` en el `metadata` del update a 'enviado' (líneas 162-176) | **SÍ — hunks distintos del mismo archivo + misma línea de import** | **SECUENCIAL por hunks que NO se solapan (Fase 3).** Los cuerpos editados son disjuntos (Pieza 2: zona carta→generación, ~96-112; Pieza 3: zona envío→update, 162-176). El único punto común real es el bloque de imports (tras línea 17): se aplica Pieza 2 primero, luego Pieza 3 añade su import en línea contigua. |
| `apps/web/api/_lib/enviar-reporte.js` | — (no la toca) | Task 8: `TEXTOS_PLAN_SEMANAL` + `formatearEmailPlanHTML` + `enviarPlanSemanal` (al final del archivo) | No | Sólo Pieza 3. Sin partición. |
| `apps/web/api/_lib/prompt-aksha.js` | Task 6: sección 8 + título EN + firma/bloque de `construirMensajeCliente` | — (no la toca) | No | Sólo Pieza 2. Sin partición. |
| `apps/web/api/_lib/plantilla-reporte-web.js` | Task 8: `TEXTOS` + `clasificarTitulo` + `renderOportunidades` + bucle | — (no la toca) | No | Sólo Pieza 2. Sin partición. |
| `apps/web/vercel.json` | — (no la toca) | Task 10: `api/plan-semanal.js` maxDuration + 2º cron | No | Sólo Pieza 3. Sin partición. |

**Archivos compartidos REALES: 2** (`validar-reporte.js`, `pipeline-reporte.js`).
Los demás del listado del integrador (`enviar-reporte.js`, `prompt-aksha.js`,
`plantilla-reporte-web.js`, `vercel.json`) son de una sola pieza.

Otros archivos exclusivos sin cruce, para referencia:
- Pieza 2 sólo: `generar-reporte.js`, `create-payment-intent.js`, `pais-residencia.js`, `oportunidades-territorio.js`, `lookup-territorio.js`, `publicar-banco-agente.mjs` (raíz).
- Pieza 3 sólo: `aprobar-reporte.js`, `plan-elemento.js`, `prompt-plan-semanal.js`, `generar-plan-semanal.js`, `plan-semanal.js`.

---

## 2. Diagrama de fases

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 0 · Base común (bloqueante para todo lo demás)                       │
│   2A-pre  validar-reporte.js: MERGE techo-condicional + {min,max}         │
│           (un único editor; ver §3). Es el cimiento de Pieza 2-Task7,     │
│           Pieza 3-Task1 y de toda validación posterior.                   │
└─────────────────────────────────────────────────────────────────────────┘
                                   │ (todo lo de abajo depende de Fase 0)
        ┌──────────────────────────┴──────────────────────────┐
        ▼                                                      ▼
┌───────────────────────────────────┐      ┌───────────────────────────────────┐
│ FASE 1A · ARCHIVOS NUEVOS Pieza 2  │      │ FASE 1B · ARCHIVOS NUEVOS Pieza 3  │
│ (en PARALELO con 1B — disjuntos)   │      │ (en PARALELO con 1A — disjuntos)   │
│  · pais-residencia.js  (P2-T1)     │      │  · plan-elemento.js     (P3-T2,T3, │
│  · publicar-banco-agente.mjs(P2-T3)│      │                          T9)       │
│  · oportunidades-territorio.js(T4) │      │  · prompt-plan-semanal.js (P3-T6)  │
│  · lookup-territorio.js  (P2-T5)   │      │  · generar-plan-semanal.js(P3-T7)  │
│    (depende de T3+T4 internas P2)  │      │  · enviar-reporte.js: bloque nuevo │
│  · create-payment-intent.js (T2)   │      │    al FINAL (P3-T8) — exclusivo P3 │
│    (exclusivo P2)                  │      │                                    │
│  + sus test-*.mjs                  │      │  + sus test-*.mjs                  │
└───────────────────────────────────┘      └───────────────────────────────────┘
        │                                                      │
        └──────────────────────────┬───────────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 2 · EDICIONES A archivos de PROMPT/PLANTILLA (exclusivos, paralelos) │
│   2B  prompt-aksha.js          (P2-T6)  ── exclusivo Pieza 2              │
│   2C  plantilla-reporte-web.js (P2-T8)  ── exclusivo Pieza 2              │
│   (no comparten archivo; pueden ir en paralelo con Fase 1B residual)      │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 3 · pipeline-reporte.js (SECUENCIAL · un solo paso por archivo)      │
│   3A  Pieza 2 (P2-T9): import + lookup carta→generación + generar-reporte │
│        .js (firma oportunidades, exclusivo P2)                            │
│   3B  Pieza 3 (P3-T4): import contiguo + base del plan en branch envío    │
│        + ...metaPlan en el update 'enviado'                               │
│   3A SIEMPRE antes que 3B. Ambos sobre el MISMO archivo, hunks disjuntos. │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 4 · CABLEADO restante exclusivo                                      │
│   4A  aprobar-reporte.js   (P3-T5)  ── exclusivo Pieza 3                  │
│   4B  plan-semanal.js + vercel.json (P3-T10) ── exclusivo Pieza 3        │
│   (paralelizables entre sí; no tocan archivos de Pieza 2)                 │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 5 · GATES DE REGRESIÓN OFFLINE (suite completa, sin red)             │
│   P2-T10  suite web Pieza 2 + publicador                                  │
│   P3-T12  suite Pieza 3 + lint de todos los archivos tocados              │
│   Cruce obligatorio: re-correr test-validar-reporte (P2) Y                │
│   test-validar-semanal (P3) JUNTOS — el archivo merged debe pasar ambos.  │
└─────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FASE 6 · ENSAYOS E2E (al final, requieren credenciales, no en CI)         │
│   6A  P2-T11  Banco real Colombia → publicar → HIT del lookup             │
│   6B  P2-T12  Ensayo Johan con sección territorio + panel de jueces       │
│   6C  P3-T11  Ensayo Johan plan semanal (s1/s4 × es/en) + panel de jueces │
│   Orden: 6A antes que 6B (6B consume el banco). 6C independiente de 6A/6B.│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detalle de la edición MERGED de `validar-reporte.js` (Fase 0 / 2A-pre)

Este es el ÚNICO punto donde aplicar los dos planes "tal cual" produce un
choque irreconciliable: ambos reescriben las constantes 121-124 y el cuerpo de
`validarEstandarEditorial`, con propósitos diferentes. La integración correcta
combina las dos intenciones en una sola firma y un solo cuerpo:

- **De Pieza 3 (Task 1):** firma `validarReporte(reporte, carta, opciones = {})`
  y `validarEstandarEditorial(reporte, { min, max } = {})` con defaults
  `PALABRAS_MIN`/`PALABRAS_MAX`. Esto NO rompe llamadas existentes.
- **De Pieza 2 (Task 7):** cuando NO se pasa `max` explícito (caso del reporte
  principal), el techo por defecto debe subir a 3600 SI el texto contiene la
  sección de territorio (regex `PATRON_SECCION_TERRITORIO`).

**Regla de merge:** el parámetro `opciones.max` explícito (lo usa el plan
semanal con `{min:400,max:1100}`) SIEMPRE manda. Cuando `max` NO viene, el
default se calcula como en Pieza 2: `3600` si hay sección de territorio, `3300`
si no. Es decir:

```js
const PALABRAS_MAX = 3300;
const PALABRAS_MAX_CON_TERRITORIO = 3600;   // Pieza 2
const PALABRAS_MIN = 1600;
const PATRON_SECCION_TERRITORIO = /oportunidades en tu territorio|opportunities in your territory/i; // Pieza 2

function validarEstandarEditorial(reporte, { min = PALABRAS_MIN, max } = {}) { // Pieza 3 firma
  // ...astro igual...
  const palabras = (String(reporte || '').trim().match(/\S+/g) || []).length;
  // max explícito manda (semanal); si no, default territorio-aware (Pieza 2).
  const techo = max ?? (PATRON_SECCION_TERRITORIO.test(String(reporte || ''))
    ? PALABRAS_MAX_CON_TERRITORIO
    : PALABRAS_MAX);
  if (palabras > techo) {
    errores.push(`El reporte tiene ${palabras} palabras — excede el máximo de ${techo} ...`);
  } else if (palabras > 0 && palabras < min) {
    errores.push(`El reporte tiene solo ${palabras} palabras — por debajo del mínimo de ${min} ...`);
  }
  return errores;
}

export function validarReporte(reporte, carta, opciones = {}) { // Pieza 3 firma
  const erroresEstilo = [
    ...detectarGlifosProhibidos(reporte),
    ...validarEstandarEditorial(reporte, opciones),
  ];
  // ...resto sin cambios...
```

El mensaje de exceso conserva la subcadena `excede` (lo verifica el test de
Pieza 2) y se reporta el `techo` real (lo verifica el test de Pieza 3 con `max`).

**Tests que deben pasar tras el merge (los DOS, juntos):**
- `apps/web/tools/test-validar-reporte.mjs` (Pieza 2: techo condicional 3300/3600 + aserción directa).
- `tools/test-validar-semanal.mjs` (Pieza 3: `{min:400,max:1100}` + default 1600/3300 sin opciones).
- `tools/test-validador-glifos.mjs` (regresión: llamada sin 3er argumento usa defaults).

Quien implemente: aplicar el merge UNA vez, luego correr los tres tests antes de
seguir. NO aplicar Task 1 de Pieza 3 y Task 7 de Pieza 2 por separado.

---

## 4. Detalle de la partición de `pipeline-reporte.js` (Fase 3)

Hunks disjuntos, pero comparten la zona de imports. Orden fijo **3A → 3B**:

**3A · Pieza 2 (Task 9):**
- Imports: tras línea 17 añade
  `import { buscarOportunidades } from './lookup-territorio.js';`
  `import { paisDesdeLugar } from './pais-residencia.js';`
- Cuerpo: entre `calcularCarta` (~98) y `generarReporte` (~101) inserta el
  lookup; añade `oportunidades` al objeto de `generarReporte`.
- También toca `generar-reporte.js` (firma + `construirMensaje`), archivo
  exclusivo de Pieza 2 — va en el mismo paso 3A.

**3B · Pieza 3 (Task 4):**
- Imports: añade en línea contigua a las de 3A
  `import { calcularElementoDebil, guardarReporteMd, metadataBasePlan } from './plan-elemento.js';`
- Cuerpo: reescribe el bloque 162-176 (envío + update 'enviado') para calcular
  el elemento débil, guardar reporte.md a Blob y añadir `...metaPlan` al
  `metadata`. Esta zona NO se solapa con la de 3A.

Como Pieza 3 reescribe el bloque `162-176` que incluye el `stripe.paymentIntents
.update(...'enviado'...)`, y Pieza 2 NO toca ese bloque (sólo la zona
carta→generación), no hay colisión de líneas. El único cuidado es que 3B parta
del archivo **ya con los imports de 3A presentes** (de ahí el orden 3A→3B), para
que su edición de imports caiga en una región estable.

Verificación tras 3A y tras 3B:
`node --check api/_lib/pipeline-reporte.js && node --check api/_lib/generar-reporte.js`.

---

## 5. executionOrder concreto

1. **Fase 0 — `validar-reporte.js` MERGED** (bloqueante; un solo editor). Correr los 3 tests de validación.
2. **Fase 1A ∥ 1B — archivos nuevos aislados, EN PARALELO** (no comparten archivo):
   - 1A (Pieza 2): `pais-residencia.js` (+test), `create-payment-intent.js`, `publicar-banco-agente.mjs` (+test), `oportunidades-territorio.js` (+test), `lookup-territorio.js` (+test). Orden interno P2: T1→T2→T3→T4→T5.
   - 1B (Pieza 3): `plan-elemento.js` (T2+T3+T9, +test), `prompt-plan-semanal.js` (+test), `generar-plan-semanal.js`, `enviar-reporte.js` bloque nuevo (T8, +test). Orden interno P3: T2→T3→T6→T7→T8→T9.
3. **Fase 2 — prompt/plantilla exclusivos de Pieza 2, EN PARALELO entre sí**: `prompt-aksha.js` (P2-T6), `plantilla-reporte-web.js` (P2-T8).
4. **Fase 3 — `pipeline-reporte.js` SECUENCIAL, un paso por archivo**: 3A Pieza 2 (T9 + `generar-reporte.js`) → luego 3B Pieza 3 (T4).
5. **Fase 4 — cableado exclusivo Pieza 3, paralelizable**: 4A `aprobar-reporte.js` (P3-T5); 4B `plan-semanal.js` + `vercel.json` (P3-T10).
6. **Fase 5 — gates de regresión offline**: P2-T10 (suite web + publicador) y P3-T12 (suite + lint); cruce obligatorio: correr `test-validar-reporte.mjs` Y `test-validar-semanal.mjs` juntos contra el `validar-reporte.js` merged.
7. **Fase 6 — ensayos E2E al final** (credenciales, fuera de CI): 6A P2-T11 (banco real Colombia → publicar → HIT) → 6B P2-T12 (ensayo Johan + territorio + jueces); 6C P3-T11 (ensayo Johan plan semanal + jueces), independiente.

**Paralelizan:** 1A∥1B; dentro de Fase 2 (2B∥2C); dentro de Fase 4 (4A∥4B); 6C respecto a 6A/6B.
**Estrictamente secuencial:** Fase 0 antes que todo; Fase 3 3A→3B; 6A antes que 6B.

---

## 6. Open Questions consolidadas (deduplicadas)

Ninguno de los dos planes tiene un encabezado "Open Questions" formal; ambos
las referencian en línea. Consolidadas:

1. **Banco real del Agente Global pendiente de credenciales/tools** (Pieza 2, Tasks 11): la corrida real de investigación para Colombia + área MVP requiere `ANTHROPIC_API_KEY` y tools de búsqueda web habilitadas. Si no están, se valida sólo el camino de datos con `--simulado` y la corrida real queda como paso operativo.
2. **Publicación real del banco a Blob pendiente de token** (Pieza 2, Task 11): la publicación a Vercel Blob requiere `BLOB_READ_WRITE_TOKEN`. Sin él, sólo `--dry-run`; la publicación real queda anotada como paso operativo.
3. **Confirmar `claude-sonnet-4-6` habilitado en la cuenta Anthropic** (Pieza 3, Task 7): el plan semanal usa Sonnet mientras el reporte principal usa `claude-opus-4-8`; verificar disponibilidad del modelo en la cuenta de `ANTHROPIC_API_KEY` antes de activar el cron.
4. **¿Auditar los emails semanales con BCC?** (Pieza 3, Task 8): decisión actual = SIN BCC de auditoría (los semanales son derivados, no el reporte principal). Reabrir sólo si el dueño quiere auditarlos al buzón interno (`Purpose@aksha.life`).
5. **¿Versionar las salidas privadas del ensayo?** (Pieza 2 Task 12 / Pieza 3 Task 11): los artefactos en `ejemplos-privados/ensayo-johan/` contienen datos personales y no se commitean por defecto. Confirmar con el dueño si quiere conservar las salidas como referencia (verificando `git check-ignore` primero).

---

## 7. Notas de integración para quien ejecute

- **No hay nuevos estados en la máquina de Stripe** en ninguna pieza; ambas viven en `metadata`. Presupuesto de claves: Pieza 2 añade 2 (`pais_residencia`, `ciudad_residencia`); Pieza 3 añade 6 (`reporte_md_url`, `plan_elemento`, `plan_semana`, `plan_base_at`, `plan_log`, `plan_error`). Total +8 claves combinadas: verificar holgura del tope de 50/objeto en Fase 5.
- **`construirMensajeCliente` y la cadena de generación** sólo las toca Pieza 2; el `validarReporte` parametrizado de Pieza 3 no afecta esa cadena (el pipeline principal sigue llamando `validarReporte(reporte, carta)` sin opciones, que tras el merge usa el default territorio-aware).
- **El cron `plan-semanal` valida con `{min:400,max:1100}`**: ese `max` explícito hace que el merge NUNCA aplique el techo de 3600 al semanal. Confirmado por el test `test-validar-semanal.mjs`.
- **Commits**: cada pieza conserva sus mensajes de commit; el integrador no
  introduce commits propios salvo el del merge de `validar-reporte.js`, que debe
  llevar ambas intenciones en el mensaje. `git push` lo hace el controlador al
  final (ninguna pieza lo incluye).
