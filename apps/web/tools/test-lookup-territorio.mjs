// Verifica el lookup híbrido con dependencias inyectadas (sin Blob ni API).
import { buscarOportunidades, esFresco } from '../api/_lib/lookup-territorio.js';

let fallos = 0;
const espera = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

const reporteFalso = {
  region_or_country: 'Colombia',
  research_area: 'Inteligencia Artificial aplicada',
  date: '2026-06-12',
  emerging_professions: [{ profession_name: 'Curador de IA', why_it_matters: 'x', growth_potential_score: 8 }],
  emerging_courses_and_certifications: [],
  human_talents_detected: [],
};

// esFresco: <30 días desde la fecha del índice.
espera('esFresco hoy', esFresco('2026-06-12', new Date('2026-06-20')) === true);
espera('esFresco 29 días', esFresco('2026-06-12', new Date('2026-07-11')) === true);
espera('esFresco 31 días → false', esFresco('2026-06-12', new Date('2026-07-13')) === false);
espera('esFresco fecha basura → false', esFresco('no-fecha', new Date()) === false);

// HIT fresco: usa el JSON del banco, NO investiga.
let investigado = false;
const hit = await buscarOportunidades('Colombia', {
  ahora: new Date('2026-06-20'),
  leerIndice: async () => [{ pais: 'Colombia', area: 'Inteligencia Artificial aplicada', fecha: '2026-06-12', url: 'https://blob/x.json' }],
  descargarJson: async () => reporteFalso,
  investigar: async () => { investigado = true; return { reporte: reporteFalso }; },
  persistir: async () => {},
  log: () => {},
});
espera('HIT comprime el banco', hit.tieneInsumo === true && hit.profesiones[0].nombre === 'Curador de IA');
espera('HIT no investiga', investigado === false);

// MISS: investiga, persiste ANTES de comprimir, devuelve insumo.
let persistido = null;
const miss = await buscarOportunidades('Perú', {
  ahora: new Date('2026-06-20'),
  leerIndice: async () => [],
  descargarJson: async () => { throw new Error('no debería bajar nada'); },
  investigar: async (pais, area) => ({ reporte: { ...reporteFalso, region_or_country: pais, research_area: area } }),
  persistir: async (reporte) => { persistido = reporte; },
  log: () => {},
});
espera('MISS investiga y comprime', miss.tieneInsumo === true);
espera('MISS persiste ANTES de comprimir', persistido && persistido.region_or_country === 'Perú');

// FALLO de investigación dos veces → sin insumo (la sección se omite).
const fallo = await buscarOportunidades('Bolivia', {
  ahora: new Date('2026-06-20'),
  leerIndice: async () => [],
  investigar: async () => { throw new Error('API caída'); },
  persistir: async () => {},
  log: () => {},
});
espera('FALLO → tieneInsumo false', fallo.tieneInsumo === false);

// País vacío → sin insumo, sin investigar.
let investigadoVacio = false;
const sinPais = await buscarOportunidades('', {
  investigar: async () => { investigadoVacio = true; return { reporte: reporteFalso }; },
});
espera('país vacío → tieneInsumo false', sinPais.tieneInsumo === false);
espera('país vacío → no investiga', investigadoVacio === false);

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
