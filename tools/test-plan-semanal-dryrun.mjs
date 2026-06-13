// Prueba de la selección de candidatos del cron semanal (lógica pura).
// Uso: node tools/test-plan-semanal-dryrun.mjs
import { semanaPendiente } from '../apps/web/api/_lib/plan-elemento.js';

let fallos = 0;
const check = (nombre, cond, detalle = '') => {
  console.log(`${cond ? 'OK' : 'FALLA'} — ${nombre}${detalle ? ' :: ' + detalle : ''}`);
  if (!cond) fallos++;
};

const DIA = 24 * 3600 * 1000;
const base = Date.parse('2026-06-12T14:00:00.000Z');
const ahora = (dias) => base + dias * DIA;

// Pedido con base hoy, plan_semana 0: a los 7 días toca semana 1.
const md0 = { reporte_status: 'enviado', plan_semana: '0', plan_base_at: '2026-06-12T14:00:00.000Z' };
check('día 6: aún no toca semana 1', semanaPendiente(md0, ahora(6)) === 0);
check('día 7: toca semana 1', semanaPendiente(md0, ahora(7)) === 1);
check('día 8: sigue tocando semana 1 (no se saltó)', semanaPendiente(md0, ahora(8)) === 1);

// plan_semana 1 ya enviada: a los 14 días toca semana 2.
const md1 = { reporte_status: 'enviado', plan_semana: '1', plan_base_at: '2026-06-12T14:00:00.000Z' };
check('semana 1 hecha, día 13: no toca semana 2', semanaPendiente(md1, ahora(13)) === 0);
check('semana 1 hecha, día 14: toca semana 2', semanaPendiente(md1, ahora(14)) === 2);

// plan_semana 4: programa terminado, nunca toca.
const md4 = { reporte_status: 'enviado', plan_semana: '4', plan_base_at: '2026-06-12T14:00:00.000Z' };
check('semana 4 hecha: nunca toca', semanaPendiente(md4, ahora(60)) === 0);

// reporte no enviado: nunca toca.
const mdNo = { reporte_status: 'en_revision', plan_semana: '0', plan_base_at: '2026-06-12T14:00:00.000Z' };
check('reporte no enviado: nunca toca', semanaPendiente(mdNo, ahora(30)) === 0);

// sin plan_base_at: nunca toca (pedido viejo sin base de plan).
const mdViejo = { reporte_status: 'enviado', plan_semana: '0' };
check('sin plan_base_at: nunca toca', semanaPendiente(mdViejo, ahora(30)) === 0);

// 3 intentos fallidos de la semana 1 (en plan_log): se descarta esa semana.
const mdAgotado = { reporte_status: 'enviado', plan_semana: '0', plan_base_at: '2026-06-12T14:00:00.000Z',
  plan_log: JSON.stringify({ s1: { at: null, n: 3 } }) };
check('semana 1 con 3 intentos: agotada, no toca', semanaPendiente(mdAgotado, ahora(8)) === 0);

if (fallos) { console.error(`\n${fallos} comprobaciones fallaron.`); process.exit(1); }
console.log('\nPrueba superada.');
