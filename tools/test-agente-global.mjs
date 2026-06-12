// Pruebas offline del Agente Global: validador editorial, validador
// estructural, renderizador y almacenamiento. No llama a la API.
// Ejecutar: node tools/test-agente-global.mjs
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { validarTexto, validarReporteGlobal } from '../agente-global/nucleo/validar.mjs';
import { extraerJson } from '../agente-global/nucleo/motor-claude-code.mjs';
import { resolverMotor } from '../agente-global/nucleo/pipeline.mjs';
import { renderizarReporteHumano } from '../agente-global/nucleo/renderizar.mjs';
import { guardarResultado, guardarHallazgosParciales, slug } from '../agente-global/nucleo/almacen.mjs';
import { reporteSimulado } from '../agente-global/nucleo/simulado.mjs';
import { ejecutarInvestigacion } from '../agente-global/nucleo/pipeline.mjs';

let fallos = 0;
function prueba(nombre, condicion, detalle = '') {
  if (condicion) {
    console.log(`  OK    ${nombre}`);
  } else {
    fallos++;
    console.log(`  FALLO ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  }
}

console.log('Validador editorial (validarTexto):');
prueba('texto limpio pasa', validarTexto('Una ruta posible sería explorar la facilitación.').length === 0);
prueba('detecta emojis', validarTexto('Gran oportunidad 🚀 para ti').length > 0);
prueba('detecta glifos decorativos', validarTexto('Camino → propósito ✦').length > 0);
prueba('detecta "ayudar"', validarTexto('Queremos ayudarte a crecer y te ayudamos siempre').length > 0);
prueba('permite "apoyar"', validarTexto('Queremos apoyar tu proceso de descubrimiento.').length === 0);
prueba('detecta determinismo "tú eres"', validarTexto('Tú eres un líder nato.').length > 0);
prueba('detecta "naciste para"', validarTexto('Naciste para enseñar.').length > 0);
prueba('detecta afirmación médica', validarTexto('Esta práctica cura la ansiedad.').length > 0);
prueba('permite "curador de contenido"', validarTexto('El curador de contenido organiza información.').length === 0);

console.log('\nConfiguración de modelos por fase:');
const modelos = JSON.parse(readFileSync(new URL('../agente-global/config/modelos.json', import.meta.url), 'utf8'));
prueba('define las tres fases', ['investigacion', 'clasificacion', 'prosa'].every((f) => typeof modelos[f] === 'string'));
prueba(
  'la investigación usa un modelo con búsqueda web (sonnet/opus/fable)',
  /^claude-(sonnet-4-6|opus-4-[678]|fable)/.test(modelos.investigacion),
);

console.log('\nMotores (extraerJson y resolverMotor):');
prueba('extrae JSON limpio', extraerJson('{"a":1}').a === 1);
prueba('extrae JSON entre texto y cercos', extraerJson('Aquí está:\n```json\n{"a":{"b":2}}\n```\nListo.').a.b === 2);
prueba('rechaza texto sin JSON', (() => { try { extraerJson('sin json'); return false; } catch { return true; } })());
prueba('motor explícito se respeta', resolverMotor('claude-code') === 'claude-code' && resolverMotor('api') === 'api');
prueba('motor auto resuelve a un motor válido', ['api', 'claude-code'].includes(resolverMotor('auto')));

console.log('\nValidador estructural (validarReporteGlobal):');
const reporte = reporteSimulado({ pais: 'Colombia', area: 'Bienestar', fecha: '2026-06-11' });
const val = validarReporteGlobal(reporte);
prueba('reporte simulado es válido', val.ok, val.errores.join(' | '));

const roto = JSON.parse(JSON.stringify(reporte));
roto.confidence_level = 'altísima';
roto.emerging_professions[0].evidence_sources = [];
roto.emerging_professions[0].growth_potential_score = 15;
roto.alerts[0].urgency = 'urgente';
const valRoto = validarReporteGlobal(roto);
prueba('detecta confidence_level inválido', valRoto.errores.some((e) => e.includes('confidence_level')));
prueba('detecta profesión sin evidencia', valRoto.errores.some((e) => e.includes('sin fuentes de evidencia')));
prueba('detecta puntaje fuera de rango', valRoto.errores.some((e) => e.includes('fuera de rango')));
prueba('detecta urgencia inválida', valRoto.errores.some((e) => e.includes('urgencia inválida')));

console.log('\nRenderizador (renderizarReporteHumano):');
const markdown = renderizarReporteHumano(reporte);
prueba('markdown cumple estándar editorial', validarTexto(markdown).length === 0, validarTexto(markdown).join(' | '));
for (const seccion of [
  'Resumen ejecutivo', 'Profesiones emergentes', 'Radar de oportunidades',
  'Riesgos de automatización', 'Fuentes consultadas', 'Lectura IVA',
]) {
  prueba(`contiene sección "${seccion}"`, markdown.includes(seccion));
}
prueba('contiene la frase guía AKSHA', markdown.includes('AKSHA.life no pretende decirte quién debes ser'));

console.log('\nAlmacenamiento (guardarResultado):');
prueba('slug normaliza acentos', slug('España · Educación') === 'espana-educacion');
const dirTemp = mkdtempSync(join(tmpdir(), 'aksha-agente-'));
try {
  const rutaParcial = guardarHallazgosParciales({
    fecha: '2026-06-11', pais: 'Colombia', area: 'Bienestar', hallazgos: 'parcial', dirDatos: dirTemp,
  });
  prueba('guarda hallazgos parciales tras la fase 1', existsSync(rutaParcial));
  const rutas = guardarResultado({ reporte, markdown, hallazgos: 'hallazgos de prueba', dirDatos: dirTemp });
  prueba('escribe el JSON', existsSync(rutas.rutaJson));
  prueba('escribe el markdown', existsSync(rutas.rutaMd));
  prueba('escribe los hallazgos', existsSync(rutas.rutaHallazgos));
  prueba('acumula alertas del año', existsSync(rutas.rutaAlertas));
  const indice = JSON.parse(readFileSync(rutas.rutaIndice, 'utf8'));
  prueba('índice histórico registra la corrida', indice.length === 1 && indice[0].report_id === reporte.report_id);

  // Segunda corrida: el índice y las alertas deben acumular, no sobrescribir.
  guardarResultado({ reporte, markdown, hallazgos: null, dirDatos: dirTemp });
  const indice2 = JSON.parse(readFileSync(rutas.rutaIndice, 'utf8'));
  const alertas = JSON.parse(readFileSync(rutas.rutaAlertas, 'utf8'));
  prueba('índice acumula corridas', indice2.length === 2);
  prueba('alertas acumulan por año', alertas.length === 2);

  console.log('\nPipeline completo en modo simulado:');
  const resultado = await ejecutarInvestigacion({
    pais: 'Colombia',
    area: 'Bienestar',
    simulado: true,
    dirDatos: dirTemp,
    log: () => {},
  });
  prueba('pipeline simulado valida correcto', resultado.validacion.ok, resultado.validacion.errores.join(' | '));
  prueba('pipeline simulado guarda resultados', existsSync(resultado.rutas.rutaJson));
} finally {
  rmSync(dirTemp, { recursive: true, force: true });
}

console.log(fallos === 0 ? '\nTodas las pruebas pasaron.' : `\n${fallos} prueba(s) fallaron.`);
process.exit(fallos === 0 ? 0 : 1);
