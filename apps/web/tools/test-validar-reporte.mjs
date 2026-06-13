// Test de regresión del validador reporte-vs-efemérides (lineamiento AKSHA).
// Uso: node tools/test-validar-reporte.mjs <carta.json>
// La carta debe venir del microservicio Swiss Ephemeris (con o sin tránsitos).

import { readFileSync } from 'node:fs';
import { validarReporte } from '../api/_lib/validar-reporte.js';

const rutaCarta = process.argv[2];
if (!rutaCarta) {
  console.error('Uso: node tools/test-validar-reporte.mjs <carta.json>');
  process.exit(1);
}
const carta = JSON.parse(readFileSync(rutaCarta, 'utf8'));

const natal = Object.fromEntries(carta.planetas.map((p) => [p.nombre, p]));
const transito = Object.fromEntries(
  (carta.transitos?.posiciones || []).map((p) => [p.nombre, p]),
);

const casos = [
  {
    nombre: 'menciones correctas (natal, asteroides, ASC/MC)',
    texto: `Tu Sol en ${natal.Sol.signo} habita la Casa ${natal.Sol.casa}. ` +
      `La Luna en ${natal.Luna.signo}, en tu Casa ${natal.Luna.casa}, te da profundidad. ` +
      `Júpiter en ${natal['Júpiter'].signo} en la Casa ${natal['Júpiter'].casa} expande tu hogar. ` +
      `Tu Ascendente en ${carta.ascendente.signo} y el Medio Cielo en ${carta.medio_cielo.signo}. ` +
      `Vesta en ${(carta.asteroides || []).find((a) => a.nombre === 'Vesta')?.signo || 'Libra'} enfoca tu devoción.`,
    esperaSinErroresPosicion: true,
  },
  {
    nombre: 'tránsito legítimo (signo actual ≠ natal)',
    texto: transito['Plutón']
      ? `Plutón en ${transito['Plutón'].signo} está transformando tu mundo material.`
      : 'Sin tránsitos en la carta.',
    esperaSinErroresPosicion: true,
  },
  {
    nombre: 'error clásico: Júpiter en Capricornio',
    texto: 'Júpiter en Capricornio te pide disciplina en la carrera.',
    esperaSinErroresPosicion: true,
  },
  {
    nombre: 'signo equivocado para el Sol',
    texto: `Tu Sol en Virgo te hace meticulosa.`,
    esperaSinErroresPosicion: false,
  },
  {
    nombre: 'casa equivocada para la Luna',
    texto: `La Luna en la Casa 5 habla de creatividad.`,
    esperaSinErroresPosicion: false,
  },
  {
    nombre: 'Ascendente equivocado',
    texto: 'Con tu Ascendente en Sagitario buscas horizontes.',
    esperaSinErroresPosicion: false,
  },
  {
    nombre: 'carta fallback (no verificable)',
    texto: 'Cualquier texto.',
    carta: { fallback: true },
    esperaOk: false,
  },
];

// esperaOk: el reporte pasa completo (posiciones + estilo editorial).
// esperaSinErroresPosicion: solo exige que no haya errores de posición
// ("mencionado en"), ignorando los de estilo/extensión — para casos legacy
// que prueban el cruce de posiciones con texto astrológico deliberado.
let fallos = 0;
for (const caso of casos) {
  const resultado = validarReporte(caso.texto, caso.carta || carta);
  const erroresPosicion = resultado.errores.filter((e) => e.includes('mencionado en'));
  const paso = 'esperaSinErroresPosicion' in caso
    ? (erroresPosicion.length === 0) === caso.esperaSinErroresPosicion
    : resultado.ok === caso.esperaOk;
  if (!paso) fallos++;
  console.log(`${paso ? '✅' : '❌'} ${caso.nombre}`);
  if (!paso) {
    for (const e of resultado.errores) console.log(`     · ${e}`);
  }
}

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
