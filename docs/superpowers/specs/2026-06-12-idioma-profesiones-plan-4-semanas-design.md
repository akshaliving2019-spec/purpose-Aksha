# Diseño: idioma del reporte, profesiones del Agente Global y plan de 4 semanas

Fecha: 2026-06-12 · Estado: aprobado por Johan
Alcance: tres piezas independientes que se construyen en este orden. Cada una
se puede desplegar por separado; ninguna rompe los pedidos existentes.

Decisiones del dueño (2026-06-12):
- Profesiones: modo híbrido (banco pre-investigado + investigación en vivo si
  falta), país detectado por IP sin fricción (sin campo extra ni cookies).
- Plan 4 semanas: programa progresivo del elemento más débil del cliente.
- Contenido semanal: generado por IA para cada cliente (no plantillas fijas).
- El plan de 4 semanas va incluido en la compra actual del Mapa de Propósito.

---

## Pieza 1 — Idioma del reporte (es/en)

### Problema
La web es bilingüe (`LanguageContext`, 'es'/'en') pero el checkout no envía el
idioma; todos los reportes salen en español aunque el cliente compró en inglés.

### Diseño
1. **Checkout** (`src` → `api/create-payment-intent.js`): el body incluye
   `idioma` ('es'|'en', tomado del LanguageContext). Validación estricta; valor
   ausente o inválido → 'es'. Se guarda en metadata del PaymentIntent como
   `idioma`.
2. **Pipeline** (`pipeline-reporte.js` → `generar-reporte.js` → producto):
   `construirMensajeCliente` recibe `idioma` y, cuando es 'en', añade al
   mensaje una instrucción de idioma: el reporte completo se escribe en inglés
   natural (no traducido literal), conservando estructura y marcadores.
3. **Vocabulario oficial EN** (innegociable, para no romper parsers):
   - Semáforo: FLOW / TENSION / BRAKE (palabras, igual que en es).
   - "Dones de nacimiento" → "Birth gifts" · "Desafíos de nacimiento" →
     "Birth challenges".
   - El IPN conserva la sigla: "Natal Potential Index (IPN)". La línea de
     módulo mantiene el formato `IPN 60%. <lectura>`.
   - Etapas: EXPLORATION / CONSTRUCTION / REVISION / INTEGRATION / LEGACY.
   - Firma: "AKSHA LIFE · AI does not create knowledge. It connects it."
4. **`plantilla-reporte-web.js`**: los regex de parseo aceptan ambos idiomas
   (`flujo|tension|freno|flow|brake`, `dones de nacimiento|birth gifts`,
   `desaf|birth challenges`, `etapa de|stage of`, títulos de sección
   `apertura|opening`, `herida|wound`, `sintesis|synthesis`,
   `ahora|activando|now|activating`, `camino|2026|path`, `cierre|closing`).
   Los textos fijos del HTML (overlines "Antes de empezar", "Cierre",
   "Primero · los números", lema) salen de un diccionario es/en elegido por
   el parámetro `idioma` que `pipeline-reporte.js` pasa a `renderReporteWeb`.
5. **`validar-reporte.js`**: lista EN de términos astrológicos prohibidos,
   solo los inequívocos (trine, sextile, quincunx, ascendant, midheaven,
   natal chart, zodiac, ephemeris, chiron, luminary); "square" y "opposition"
   quedan fuera por ambiguos en prosa normal, igual que "casa"/"oposición"
   en español. Se añaden los patrones `\b<planeta EN>\s+in\s+<signo EN>\b` y
   `in the (\d+)(st|nd|rd|th) house`. "natal" solo se permite dentro de
   "Natal Potential Index".
6. **Emails** (`enviar-reporte.js`): asuntos y textos fijos según `idioma`.

### Fallback y compatibilidad
Pedidos sin `idioma` en metadata → 'es' en todas las capas. Nada cambia para
los pedidos existentes.

---

## Pieza 2 — Profesiones del Agente Global en el reporte

### Problema
`agente-global/` investiga profesiones emergentes por país/área pero no está
conectado al pipeline del cliente; el reporte no incluye oportunidades reales
del territorio del cliente (Fase 2 pendiente del README del agente).

### Diseño
1. **País sin fricción**: `create-payment-intent.js` lee el header
   `x-vercel-ip-country` (y `x-vercel-ip-city` si está) y los guarda en
   metadata (`pais_residencia`, `ciudad_residencia`). Sin campo de formulario
   ni cookies. Respaldo en pipeline: país extraído del `birth_place`.
2. **Banco en Vercel Blob**: los JSON del Agente Global se publican en Blob
   bajo `agente-global/<pais>/<area>.json` con un índice
   `agente-global/indice.json` ({pais, area, fecha, url}). Un script/cron
   (`tools/publicar-banco-agente.mjs`) sube los `datos/reportes/*.json`
   existentes y los nuevos.
3. **Lookup híbrido en el pipeline** (paso nuevo antes de generar):
   - Hit (<30 días para el país del cliente): usar.
   - Miss: ejecutar la investigación en vivo (motor `api` del agente-global;
     ~2-4 min, ~0.40-0.80 USD), **persistir a Blob primero** y luego seguir
     con la generación. Área para el MVP: una sola área transversal por país
     (la primera de `config/areas.json`, hoy la prioritaria del agente); el
     cruce fino con los módulos del cliente lo hace el prompt, no el lookup.
   - Presupuesto de tiempo: si investigación + generación amenaza el límite
     de 300s de la función, la invocación muere y el reintento existente
     (cron `reprocesar-pendientes` / timeout de 'procesando' a los 10 min)
     vuelve a entrar, encuentra el banco ya poblado y termina rápido. No se
     añaden estados nuevos a la máquina de Stripe.
   - Si la investigación falla 2 veces: el reporte sale sin la sección (el
     prompt la marca como opcional) y se registra en el log.
4. **Inyección al prompt**: `construirMensajeCliente` recibe `oportunidades`
   (resumen compacto del JSON: top 5-8 profesiones emergentes con demanda y
   horizonte, 3-5 cursos/certificaciones, talentos resistentes) en un bloque
   delimitado "OPORTUNIDADES DEL TERRITORIO (insumo verificado)". El prompt
   maestro gana una sección: "Oportunidades en tu territorio" (máx 250
   palabras, después de "Tu camino en 2026"): cruza las profesiones del
   territorio con los módulos fuertes del cliente; mismas reglas (cero
   astrología, cero listas genéricas, nada que no esté en el insumo). Sin
   insumo, la sección no se escribe y el presupuesto de palabras no cambia.
5. **Plantilla web**: `clasificarTitulo` reconoce
   `/oportunidades|territorio|opportunities|territory/` → bloque visual
   propio (estilo tarjeta, como síntesis).
6. **Validación**: `validarReporte` no necesita cambios (la sección no
   menciona posiciones); el límite de palabras global sube de 3300 a 3600
   solo si la sección está presente.

---

## Pieza 3 — Plan de 4 semanas por elemento débil

### Problema
El cliente recibe un solo reporte. Se quiere un programa de seguimiento de 4
emails semanales, más simples, enfocados en su mayor debilidad, incluido en la
compra, en su idioma, sin base de datos nueva.

### Diseño
1. **Determinación del elemento débil** (en `pipeline-reporte.js`, al pasar a
   'enviado' o al aprobarse en revisión):
   - Parsear del reporte.md los 4 marcadores (puntuación /20 e IPN %) con
     regex tolerante (mismo estilo que `plantilla-reporte-web.js`).
   - Módulo débil = menor puntuación; desempate: menor IPN; segundo
     desempate: orden Vocación > Misión > Pasión > Profesión.
   - Mapeo a elemento: Pasión=fuego, Profesión=tierra, Vocación=aire,
     Misión=agua.
   - Persistencia en metadata del PaymentIntent: `plan_elemento`,
     `plan_semana: '0'`, `plan_base_at` (ISO del envío del reporte). El
     reporte.md se guarda SIEMPRE en Blob (`reportes-md/<pi>.md`, acceso
     privado-aleatorio) como insumo de los semanales; la URL va en metadata
     (`reporte_md_url`).
   - Si el parseo falla (reporte viejo o formato roto): fallback determinista
     por carta (conteo de planetas personales por elemento) y log de aviso.
2. **Cron semanal** (`api/plan-semanal.js`, cron diario 14:00 UTC,
   maxDuration 300):
   - Lista PaymentIntents succeeded de los últimos 45 días con
     `reporte_status=enviado`, `plan_semana < 4` y
     `plan_base_at + 7·(semana+1) días <= hoy`.
   - Procesa máximo N=5 por invocación (cada uno ~1 min con Sonnet).
   - Por cliente: baja el reporte.md de Blob, genera el email de la semana
     que toca con `claude-sonnet-4-6` (prompt nuevo
     `_lib/prompt-plan-semanal.js`), valida, envía con Resend
     (plantilla nueva en `enviar-reporte.js`), actualiza
     `plan_semana`, `plan_semana_<n>_at`. Error → `plan_error` en metadata y
     reintento natural al día siguiente (máx 3 por semana,
     `plan_intentos_<n>`).
3. **Contenido del programa** (mismo para los 4 elementos en estructura,
   distinto en sustancia; el prompt define los 4 programas):
   - Semana 1: reconocer el patrón del elemento débil en su vida concreta.
   - Semana 2: una práctica concreta de la semana (pequeña, medible).
   - Semana 3: integración con sus dones fuertes (los del reporte).
   - Semana 4: consolidación y medida de avance, cierre del programa.
   - 600-900 palabras por email, Markdown ligero, mismas reglas editoriales
     top-tier (cero astrología, cero emojis, anti-plantilla, en su idioma,
     tuteo, nombre del cliente). La palabra "elemento" y los nombres
     fuego/tierra/aire/agua NO aparecen: se nombra por cómo se vive (igual
     que el reporte principal: vida, no motor).
   - `validarReporte` con límites propios del semanal (mín 400, máx 1100).
4. **Idioma**: `idioma` de metadata manda; el prompt semanal y la plantilla
   de email son bilingües.
5. **Costo**: ~4 emails × ~$0.05-0.15 (Sonnet) por cliente. El principal
   sigue en Opus.

### Estados en metadata (resumen)
`idioma` · `pais_residencia` · `ciudad_residencia` · `reporte_md_url` ·
`plan_elemento` · `plan_semana` · `plan_base_at` · `plan_semana_<n>_at` ·
`plan_intentos_<n>` · `plan_error`. Stripe permite 50 claves por objeto; con
historia_vida_1..6 y los reporte_* existentes quedamos en ~30. Holgura
suficiente.

---

## Pruebas (antes de activar cada pieza)

1. **Idioma**: ensayo E2E (carta de Johan) en inglés: generar, validar con la
   lista EN, renderizar plantilla web EN, panel de jueces (cero astrología EN,
   anti-plantilla). El validador EN debe atrapar un reporte sembrado con
   "trine"/"Sun in Libra" (test negativo en `tools/test-validar-reporte.mjs`).
2. **Profesiones**: corrida del agente para Colombia + publicación a Blob +
   pipeline de prueba con `test-pipeline.js`; verificar la sección en md y en
   la plantilla web; verificar el camino "miss → investiga → persiste →
   reintento encuentra banco".
3. **Plan 4 semanas**: con el reporte de Johan: parseo de marcadores (debe dar
   Misión=agua como módulo más débil, 8/20), generación de las semanas 1 y 4
   en es y en, validación, render del email; cron en seco (dry run) contra
   pagos de prueba.
4. Nada se activa en producción sin pasar por modo revisión con un caso real.

## Fuera de alcance (YAGNI)

- Panel de administración del plan; upsell separado; más idiomas que es/en;
  scheduler de investigación cada 72h (Fase 3 del agente); recálculo de
  tránsitos en los semanales; base de datos.
