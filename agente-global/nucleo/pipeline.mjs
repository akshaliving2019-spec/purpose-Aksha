// Orquestador del Agente Global (rol 2.1 del prompt maestro): coordina
// investigación con búsqueda web, clasificación a JSON, validación editorial,
// versión humana del reporte y almacenamiento para entrenamiento continuo.
//
// Dos motores intercambiables:
//   - "api": Claude API (requiere ANTHROPIC_API_KEY; salida JSON forzada por esquema)
//   - "claude-code": CLI de Claude Code headless (usa la sesión iniciada en la
//     máquina, sin API key; el JSON se pide por prompt y se reintenta si no valida)
// En modo "auto" se prefiere la API si hay key; si no, Claude Code.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { consultarClaude, hayApiKey } from './cliente.mjs';
import { consultarClaudeCode, extraerJson } from './motor-claude-code.mjs';
import { validarReporteGlobal, validarTexto } from './validar.mjs';
import { renderizarReporteHumano } from './renderizar.mjs';
import { guardarResultado, guardarHallazgosParciales, slug } from './almacen.mjs';
import { reporteSimulado, HALLAZGOS_SIMULADOS } from './simulado.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

function leer(ruta) {
  return readFileSync(join(RAIZ, ruta), 'utf8');
}

const ESQUEMA_REPORTE = JSON.parse(leer('esquemas/reporte.schema.json'));

// Modelo por fase (solo motor api): la investigación necesita búsqueda web
// (Sonnet u Opus); la clasificación es extracción estructurada y va en Haiku.
const MODELOS = JSON.parse(leer('config/modelos.json'));

export function resolverMotor(motor = 'auto') {
  if (motor === 'api' || motor === 'claude-code') return motor;
  return hayApiKey() ? 'api' : 'claude-code';
}

// Fase 1: investigación con búsqueda web. En la API son herramientas del
// servidor (max_uses acota el costo); en Claude Code son WebSearch/WebFetch.
async function investigar({ motor, pais, area, fecha }) {
  const prompt =
    `Fecha de hoy: ${fecha}.\n` +
    `País o región a investigar: ${pais}.\n` +
    `Área temática prioritaria: ${area}.\n\n` +
    'Investiga con las herramientas de búsqueda web y entrega los hallazgos en el formato indicado.';

  if (motor === 'api') {
    return consultarClaude({
      model: MODELOS.investigacion,
      system: leer('agentes/investigacion.md'),
      tools: [
        { type: 'web_search_20260209', name: 'web_search', max_uses: 12 },
        { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 8 },
      ],
      mensajes: [{ role: 'user', content: prompt }],
    });
  }
  return consultarClaudeCode({
    systemFile: join(RAIZ, 'agentes/investigacion.md'),
    prompt,
    permitirWeb: true,
  });
}

// Fase 2: clasificación estructurada al esquema de la sección 15.
async function clasificar({ motor, hallazgos, pais, area, fecha, log }) {
  const encabezado =
    `Fecha de hoy: ${fecha}. País o región: ${pais}. Área: ${area}.\n` +
    `report_id sugerido: ${fecha}-${slug(pais)}-${slug(area)}.\n\n` +
    `Hallazgos de investigación:\n\n${hallazgos}`;

  if (motor === 'api') {
    // output_config.format garantiza JSON parseable (sin búsqueda web aquí,
    // así que no hay conflicto con citations).
    const { texto } = await consultarClaude({
      model: MODELOS.clasificacion,
      system: leer('agentes/clasificacion.md'),
      outputFormat: { type: 'json_schema', schema: ESQUEMA_REPORTE },
      mensajes: [{ role: 'user', content: encabezado }],
    });
    return JSON.parse(texto);
  }

  // Claude Code no fuerza el esquema, así que va en el prompt y se valida;
  // un reintento devuelve los errores al modelo para que corrija.
  const prompt =
    `${encabezado}\n\n` +
    'Devuelve únicamente un objeto JSON válido (sin cercos de código ni texto adicional) ' +
    'que cumpla exactamente este esquema JSON Schema:\n\n' +
    JSON.stringify(ESQUEMA_REPORTE, null, 2);

  let ultimoError = null;
  for (let intento = 1; intento <= 2; intento++) {
    const { texto } = await consultarClaudeCode({
      systemFile: join(RAIZ, 'agentes/clasificacion.md'),
      prompt: ultimoError
        ? `${prompt}\n\nTu intento anterior tuvo estos problemas; corrígelos:\n${ultimoError}`
        : prompt,
    });
    try {
      const reporte = extraerJson(texto);
      const validacion = validarReporteGlobal(reporte);
      if (validacion.ok || intento === 2) return reporte;
      ultimoError = validacion.errores.join('\n');
      log(`  Clasificación con ${validacion.errores.length} observación(es); reintentando...`);
    } catch (err) {
      if (intento === 2) throw err;
      ultimoError = `JSON inválido: ${err.message}`;
      log('  JSON no parseable; reintentando...');
    }
  }
  throw new Error('La clasificación no produjo JSON válido tras 2 intentos.');
}

// Fase 3 (opcional): pase de prosa sobre el markdown determinista.
async function refinarProsa({ motor, markdown }) {
  if (motor === 'api') {
    const { texto } = await consultarClaude({
      model: MODELOS.prosa,
      system: leer('agentes/prosa.md'),
      mensajes: [{ role: 'user', content: markdown }],
    });
    return texto;
  }
  const { texto } = await consultarClaudeCode({
    systemFile: join(RAIZ, 'agentes/prosa.md'),
    prompt: markdown,
  });
  return texto;
}

export async function ejecutarInvestigacion({
  pais,
  area,
  motor = 'auto',
  simulado = false,
  prosa = false,
  guardar = true,
  dirDatos = join(RAIZ, 'datos'),
  log = console.log,
}) {
  const fecha = new Date().toISOString().slice(0, 10);

  let hallazgos;
  let reporte;
  if (simulado) {
    log('[simulado] Usando datos de ejemplo, sin llamadas a la API.');
    hallazgos = HALLAZGOS_SIMULADOS;
    reporte = reporteSimulado({ pais, area, fecha });
  } else {
    const motorActivo = resolverMotor(motor);
    log(motorActivo === 'api'
      ? `Motor: Claude API (investigación: ${MODELOS.investigacion} · clasificación: ${MODELOS.clasificacion})`
      : 'Motor: Claude Code CLI (sesión local, sin API key)');

    log(`Fase 1/3 — Investigando ${pais} · ${area} (búsqueda web)...`);
    const inv = await investigar({ motor: motorActivo, pais, area, fecha });
    hallazgos = inv.texto;
    log(`  Hallazgos: ${hallazgos.length} caracteres`);
    if (guardar) {
      const rutaParcial = guardarHallazgosParciales({ fecha, pais, area, hallazgos, dirDatos });
      log(`  Hallazgos guardados: ${rutaParcial}`);
    }

    log('Fase 2/3 — Clasificando hallazgos al esquema AKSHA...');
    reporte = await clasificar({ motor: motorActivo, hallazgos, pais, area, fecha, log });
    log(
      `  Profesiones: ${reporte.emerging_professions?.length ?? 0} · ` +
      `Cursos: ${reporte.emerging_courses_and_certifications?.length ?? 0} · ` +
      `Alertas: ${reporte.alerts?.length ?? 0} · Confianza: ${reporte.confidence_level}`,
    );
  }

  const validacion = validarReporteGlobal(reporte);
  if (!validacion.ok) {
    log(`Validación: ${validacion.errores.length} observación(es):`);
    for (const err of validacion.errores) log(`  - ${err}`);
  } else {
    log('Validación: reporte estructural y editorialmente correcto.');
  }

  log('Fase 3/3 — Generando versión humana del reporte...');
  let markdown = renderizarReporteHumano(reporte);
  if (prosa && !simulado) {
    const refinado = await refinarProsa({ motor: resolverMotor(motor), markdown });
    const erroresProsa = validarTexto(refinado);
    if (erroresProsa.length === 0) {
      markdown = refinado;
    } else {
      log('  El pase de prosa violó el estándar editorial; se conserva la versión determinista:');
      for (const err of erroresProsa) log(`  - ${err}`);
    }
  }

  let rutas = null;
  if (guardar) {
    rutas = guardarResultado({ reporte, markdown, hallazgos, dirDatos });
    log(`Guardado: ${rutas.rutaJson}`);
    log(`          ${rutas.rutaMd}`);
    if (rutas.rutaAlertas) log(`Alertas:  ${rutas.rutaAlertas}`);
  }

  return { reporte, markdown, hallazgos, validacion, rutas };
}
