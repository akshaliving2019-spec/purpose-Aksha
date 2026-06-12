# Agente Global de Inteligencia Humana y Oportunidades Emergentes

MVP (Fase 1 del roadmap) del agente de investigación de AKSHA.life: investiga un país o región y un área temática, detecta profesiones emergentes, cursos y certificaciones, talentos humanos resistentes a la automatización y riesgos de desplazamiento; genera alertas y entrega un reporte en JSON más una versión humana en lenguaje claro. Todos los resultados se guardan para entrenamiento continuo y como insumo de Purpose Maps.

## Uso

```
node agente-global/investigar.mjs --pais "Colombia" --area "Bienestar"
node agente-global/investigar.mjs --pais "España" --area "Educación digital" --prosa
node agente-global/investigar.mjs --listar        # regiones y áreas prioritarias
node agente-global/investigar.mjs --simulado      # prueba el pipeline sin IA
```

Pruebas offline: `node tools/test-agente-global.mjs`

## Motores de IA

El flag `--motor` (por defecto `auto`) elige cómo se ejecuta la inteligencia:

- `api` — Claude API con `ANTHROPIC_API_KEY` (variable de entorno o `apps/web/.env*.local`). Es el motor recomendado: búsqueda web del lado del servidor (hasta 12 búsquedas y 8 lecturas de página por ciclo) y salida JSON garantizada por esquema (`output_config.format`). 2 llamadas por investigación (3 con `--prosa`).
- `claude-code` — CLI de Claude Code en modo headless (`claude -p`), usando la sesión ya iniciada en la máquina: no requiere API key ni facturación por API (consume el plan de suscripción). La búsqueda web usa WebSearch/WebFetch del CLI y el JSON se valida con reintento porque no hay esquema forzado.
- `auto` — usa `api` si encuentra una key; si no, cae a `claude-code`.

Tercera vía sin código adicional: dentro de una sesión de Claude Code, el comando `/investigar <país> [área]` ejecuta la investigación con las herramientas de la sesión y guarda los resultados vía `procesar-json.mjs` (valida, renderiza y almacena cualquier reporte JSON externo).

## Modelos por fase y costo estimado (motor api)

`config/modelos.json` asigna el modelo de cada fase; no todo necesita Opus:

| Fase | Modelo por defecto | Por qué |
|---|---|---|
| Investigación (búsqueda web) | `claude-sonnet-4-6` | Síntesis y filtrado de fuentes de calidad a 40% menos que Opus. Requiere un modelo con búsqueda web (Sonnet u Opus). |
| Clasificación a JSON | `claude-haiku-4-5` | Extracción estructurada mecánica; el esquema forzado y el validador garantizan la forma. Sin thinking adaptativo (no lo soporta). |
| Prosa (opcional, `--prosa`) | `claude-sonnet-4-6` | Reescritura estilística. |

Costo estimado por investigación con esta mezcla: **0,40 a 0,80 USD** (búsquedas: $0,01 c/u, máximo 12 = $0,12; investigación con Sonnet ~$0,30-0,55; clasificación con Haiku ~$0,05-0,10). Un ciclo semanal cuesta ~2-3 USD al mes. Si alguna corrida sale con clasificación pobre (muchas observaciones del validador), sube `clasificacion` a `claude-sonnet-4-6`.

Los reportes de clientes (`apps/web`) son un pipeline aparte y siguen en Opus: ahí la prosa es el producto.

## Flujo del pipeline

```
investigar.mjs (CLI)
  └─ nucleo/pipeline.mjs (Agente Orquestador)
       1. Investigación        Claude + web_search/web_fetch     agentes/investigacion.md
       2. Clasificación        Claude + salida JSON forzada      agentes/clasificacion.md
          al esquema           esquemas/reporte.schema.json
       3. Validación           nucleo/validar.mjs                determinista, sin API
       4. Versión humana       nucleo/renderizar.mjs             determinista
          (--prosa opcional)   Claude reescribe la prosa         agentes/prosa.md
       5. Almacenamiento       nucleo/almacen.mjs                datos/
```

## Mapeo con la arquitectura de agentes del prompt maestro

| Agente del prompt maestro | Implementación en el MVP |
|---|---|
| 2.1 Orquestador | `nucleo/pipeline.mjs` |
| 2.2 Investigación Global | `agentes/investigacion.md` + búsqueda web del lado del servidor |
| 2.3 Fuentes y Verificación | Clasificación de confianza en `investigacion.md` y enum `confidence` del esquema |
| 2.4 Clasificación de Oportunidades | `agentes/clasificacion.md` + `esquemas/reporte.schema.json` |
| 2.5 Talentos Humanos | Campo `human_talents_detected` con categorías de la sección 7 |
| 2.6 Agente IVA | Objeto `iva` (identidad, vocación, aportación) en cada profesión |
| 2.7 Purpose Maps | Los JSON de `datos/reportes/` son el insumo (Fase 2 del roadmap) |
| 2.8 Reportes al Usuario | `nucleo/renderizar.mjs` + pase opcional `--prosa` |
| 2.9 Entrenamiento Continuo | `datos/historico/indice.json` (serie temporal) + hallazgos crudos guardados |

## Datos generados

- `datos/reportes/AAAA-MM-DD-pais-area.json` — reporte estructurado (sección 15 del prompt maestro)
- `datos/reportes/AAAA-MM-DD-pais-area.md` — versión humana
- `datos/reportes/AAAA-MM-DD-pais-area-hallazgos.md` — hallazgos crudos con fuentes (auditoría)
- `datos/alertas/AAAA.json` — alertas acumuladas por año
- `datos/historico/indice.json` — memoria de tendencias: qué apareció, cuándo, dónde y con qué confianza

## Estándar editorial (validación automática)

`nucleo/validar.mjs` rechaza en cualquier texto del reporte: emojis y glifos decorativos (estándar AKSHA 2026), cualquier forma de "ayudar" (se usa "apoyar"), lenguaje determinista ("tú eres", "naciste para", "tu destino es") y afirmaciones médicas sobre prácticas holísticas. Si el pase de prosa viola el estándar, se conserva la versión determinista.

## Pendiente para fases siguientes

- Fase 2: formulario de usuario y Purpose Maps personalizados (cruzar perfil con `datos/`).
- Fase 3: scheduler cada 72 horas por país y área, resumen semanal y panel de alertas.
- Fase 4: retroalimentación de usuarios y pesos dinámicos de fuentes.
