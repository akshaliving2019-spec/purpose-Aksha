#!/usr/bin/env node
// CLI del Agente Global de Inteligencia Humana y Oportunidades Emergentes.
//
// Uso:
//   node agente-global/investigar.mjs --pais "Colombia" --area "Bienestar"
//   node agente-global/investigar.mjs --pais "España" --area "Educación digital" --prosa
//   node agente-global/investigar.mjs --pais "Chile" --motor claude-code   (sin API key)
//   node agente-global/investigar.mjs --simulado            (prueba sin API ni CLI)
//   node agente-global/investigar.mjs --listar              (regiones y áreas)
//
// Motor "auto": usa la Claude API si hay ANTHROPIC_API_KEY; si no, el CLI de
// Claude Code en modo headless (sesión local, sin facturación por API).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ejecutarInvestigacion } from './nucleo/pipeline.mjs';

const RAIZ = dirname(fileURLToPath(import.meta.url));

function parsearArgs(argv) {
  const args = { pais: null, area: null, motor: 'auto', simulado: false, prosa: false, guardar: true, listar: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pais' || a === '--region') args.pais = argv[++i];
    else if (a === '--area') args.area = argv[++i];
    else if (a === '--motor') {
      args.motor = argv[++i];
      if (!['auto', 'api', 'claude-code'].includes(args.motor)) {
        console.error(`Motor no reconocido: ${args.motor} (usa auto, api o claude-code)`);
        process.exit(1);
      }
    }
    else if (a === '--simulado') args.simulado = true;
    else if (a === '--prosa') args.prosa = true;
    else if (a === '--sin-guardar') args.guardar = false;
    else if (a === '--listar') args.listar = true;
    else if (a === '--ayuda' || a === '--help') args.listar = true;
    else {
      console.error(`Argumento no reconocido: ${a}`);
      process.exit(1);
    }
  }
  return args;
}

const args = parsearArgs(process.argv.slice(2));

if (args.listar) {
  const regiones = JSON.parse(readFileSync(join(RAIZ, 'config/regiones.json'), 'utf8'));
  const areas = JSON.parse(readFileSync(join(RAIZ, 'config/areas.json'), 'utf8'));
  console.log('Regiones y países prioritarios:\n');
  for (const [region, paises] of Object.entries(regiones)) {
    console.log(`  ${region.replace(/_/g, ' ')}: ${paises.join(', ')}`);
  }
  console.log('\nÁreas temáticas prioritarias:\n');
  for (const area of areas) console.log(`  - ${area}`);
  console.log(
    '\nUso: node agente-global/investigar.mjs --pais "Colombia" --area "Bienestar" ' +
    '[--motor auto|api|claude-code] [--prosa] [--simulado] [--sin-guardar]',
  );
  process.exit(0);
}

const pais = args.pais || (args.simulado ? 'Colombia' : null);
const area = args.area || (args.simulado ? 'Bienestar' : 'Panorama general de oportunidades emergentes');

if (!pais) {
  console.error('Falta --pais. Ejecuta con --listar para ver las regiones prioritarias.');
  process.exit(1);
}

try {
  const { validacion } = await ejecutarInvestigacion({
    pais,
    area,
    motor: args.motor,
    simulado: args.simulado,
    prosa: args.prosa,
    guardar: args.guardar,
  });
  process.exitCode = validacion.ok ? 0 : 2;
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exitCode = 1;
}
