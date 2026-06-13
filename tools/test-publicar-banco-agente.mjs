// Prueba las funciones puras del publicador del banco (sin tocar Blob).
import { slugPais, claveBlob, entradaIndice } from './publicar-banco-agente.mjs';

let fallos = 0;
const espera = (nombre, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  console.log(`${ok ? '✅' : '❌'} ${nombre}${ok ? '' : ` (real: ${JSON.stringify(real)})`}`);
  if (!ok) fallos++;
};

espera('slug de país con acento', slugPais('Colombia'), 'colombia');
espera('slug de país con espacio', slugPais('Costa Rica'), 'costa-rica');
espera('clave de Blob', claveBlob('Colombia', 'Inteligencia Artificial aplicada'),
  'agente-global/colombia/inteligencia-artificial-aplicada.json');

const reporte = {
  region_or_country: 'Colombia',
  research_area: 'Inteligencia Artificial aplicada',
  date: '2026-06-12',
};
const e = entradaIndice(reporte, 'https://blob.test/agente-global/colombia/x.json');
espera('entrada de índice', e, {
  pais: 'Colombia',
  area: 'Inteligencia Artificial aplicada',
  fecha: '2026-06-12',
  url: 'https://blob.test/agente-global/colombia/x.json',
});

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
