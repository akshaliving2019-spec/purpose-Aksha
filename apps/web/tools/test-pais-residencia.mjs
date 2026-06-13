// Verifica la derivación de país desde el lugar de nacimiento y la
// normalización de país/ciudad (header de Vercel puede venir URL-encoded).
import { paisDesdeLugar, normalizarPaisCiudad } from '../api/_lib/pais-residencia.js';

let fallos = 0;
const espera = (nombre, real, esperado) => {
  const ok = real === esperado;
  console.log(`${ok ? '✅' : '❌'} ${nombre}${ok ? '' : ` (real: ${JSON.stringify(real)} · esperado: ${JSON.stringify(esperado)})`}`);
  if (!ok) fallos++;
};

// paisDesdeLugar: último segmento separado por coma, sin espacios.
espera('lugar "Bogotá, Colombia"', paisDesdeLugar('Bogotá, Colombia'), 'Colombia');
espera('lugar con provincia', paisDesdeLugar('Córdoba, Andalucía, España'), 'España');
espera('lugar sin coma', paisDesdeLugar('Montevideo'), '');
espera('lugar vacío', paisDesdeLugar(''), '');
espera('lugar null', paisDesdeLugar(null), '');
espera('recorta espacios', paisDesdeLugar('Lima ,  Perú '), 'Perú');

// normalizarPaisCiudad: decodifica %XX y recorta; valores ausentes → ''.
espera('ciudad URL-encoded', normalizarPaisCiudad('Bogot%C3%A1').ciudad, 'Bogotá');
espera('país plano', normalizarPaisCiudad(undefined, 'CO').pais, 'CO');
espera('ambos ausentes → pais ""', normalizarPaisCiudad(undefined, undefined).pais, '');
espera('ambos ausentes → ciudad ""', normalizarPaisCiudad(undefined, undefined).ciudad, '');
espera('ciudad mal codificada no rompe', normalizarPaisCiudad('Sao %E0%Paulo').ciudad, 'Sao %E0%Paulo');

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
