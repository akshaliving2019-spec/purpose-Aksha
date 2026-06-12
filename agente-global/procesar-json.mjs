#!/usr/bin/env node
// Procesa un reporte JSON ya generado (por ejemplo, por una sesión de Claude
// Code usando el comando /investigar): valida, genera la versión humana y
// guarda en datos/. Permite que cualquier fuente de IA alimente el producto
// mientras el código garantice estructura y estándar editorial.
//
// Uso: node agente-global/procesar-json.mjs <ruta-al-reporte.json> [--sin-guardar]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validarReporteGlobal } from './nucleo/validar.mjs';
import { renderizarReporteHumano } from './nucleo/renderizar.mjs';
import { guardarResultado } from './nucleo/almacen.mjs';

const RAIZ = dirname(fileURLToPath(import.meta.url));

const ruta = process.argv[2];
const guardar = !process.argv.includes('--sin-guardar');
if (!ruta || ruta.startsWith('--')) {
  console.error('Uso: node agente-global/procesar-json.mjs <ruta-al-reporte.json> [--sin-guardar]');
  process.exit(1);
}

let reporte;
try {
  reporte = JSON.parse(readFileSync(ruta, 'utf8'));
} catch (err) {
  console.error(`No se pudo leer el JSON: ${err.message}`);
  process.exit(1);
}

const validacion = validarReporteGlobal(reporte);
if (!validacion.ok) {
  console.log(`Validación: ${validacion.errores.length} observación(es):`);
  for (const e of validacion.errores) console.log(`  - ${e}`);
} else {
  console.log('Validación: reporte estructural y editorialmente correcto.');
}

const markdown = renderizarReporteHumano(reporte);

if (guardar) {
  const rutas = guardarResultado({ reporte, markdown, hallazgos: null, dirDatos: join(RAIZ, 'datos') });
  console.log(`Guardado: ${rutas.rutaJson}`);
  console.log(`          ${rutas.rutaMd}`);
  if (rutas.rutaAlertas) console.log(`Alertas:  ${rutas.rutaAlertas}`);
} else {
  console.log('\n' + markdown);
}

process.exitCode = validacion.ok ? 0 : 2;
