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
