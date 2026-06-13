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

// Reporte-insumo SIN palabras de elemento, para aislar el andamiaje del prompt
// del contenido del reporte embebido: la prosa normal de un reporte puede usar
// "aire"/"agua" ("pedir aire", "te falta calma") sin que eso sea una fuga del
// programa, y la propia instrucción de prohibición del sistema necesariamente
// nombra fuego/tierra/aire/agua para prohibirlos.
const reporteLimpio = '## Misión\n\nUn área pide trabajo: los cierres, los límites y lo que sostienes por otros. Es tu mayor margen de crecimiento ahora.';

const es1 = construirMensajePlanSemanal({
  nombre: 'Johan Rocuts', reporteMd: reporteJohan, elemento: 'agua', semana: 1, idioma: 'es',
});
check('es semana 1 incluye el nombre', es1.includes('Johan'));
check('es semana 1 marca SEMANA 1', /semana\s*1|week\s*1/i.test(es1));
check('es semana 1 incrusta el reporte como insumo', es1.includes('Misión'));

// El andamiaje del mensaje (sin contar el reporte embebido) jamás nombra el elemento.
const es1Limpio = construirMensajePlanSemanal({
  nombre: 'Johan Rocuts', reporteMd: reporteLimpio, elemento: 'agua', semana: 1, idioma: 'es',
});
check('es semana 1: andamiaje sin palabras de elemento', !prohibidas.test(es1Limpio), 'fuga de vocabulario en el andamiaje');

const en4 = construirMensajePlanSemanal({
  nombre: 'Johan Rocuts', reporteMd: reporteJohan, elemento: 'aire', semana: 4, idioma: 'en',
});
check('en semana 4 pide inglés', /english/i.test(en4) || /in english/i.test(PROMPT_SISTEMA_PLAN_SEMANAL));
check('en semana 4 marca semana 4', /week\s*4|semana\s*4/i.test(en4));

const en4Limpio = construirMensajePlanSemanal({
  nombre: 'Johan Rocuts', reporteMd: reporteLimpio, elemento: 'aire', semana: 4, idioma: 'en',
});
check('en semana 4: andamiaje sin palabras de elemento', !prohibidas.test(en4Limpio));

// El prompt de sistema SÍ debe prohibir explícitamente el vocabulario de elemento
// (por eso lo nombra: una prohibición nombra lo que prohíbe).
check('prompt sistema prohíbe nombrar el elemento', /fuego\/tierra\/aire\/agua/i.test(PROMPT_SISTEMA_PLAN_SEMANAL));
check('prompt sistema fija rango 600-900', /600|900/.test(PROMPT_SISTEMA_PLAN_SEMANAL));

if (fallos) { console.error(`\n${fallos} comprobaciones fallaron.`); process.exit(1); }
console.log('\nPrueba superada.');
