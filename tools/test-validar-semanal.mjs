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
