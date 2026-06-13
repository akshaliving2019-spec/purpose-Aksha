#!/usr/bin/env node
// Publicador del banco del Agente Global a Vercel Blob (Pieza 2).
//
// Sube los reportes JSON de agente-global/datos/reportes/*.json a Blob bajo
//   agente-global/<pais-slug>/<area-slug>.json
// y mantiene un índice plano en agente-global/indice.json:
//   [{ pais, area, fecha, url }]
// que el pipeline del cliente consulta (hit <30 días → usa; miss → investiga).
//
// Idempotente: una clave fija por país+área (sin addRandomSuffix), de modo que
// volver a publicar reemplaza el JSON y refresca la fecha en el índice. El
// índice es público porque sólo contiene país/área/fecha/URL, no datos
// personales.
//
// Uso (desde la raíz del repo):
//   node tools/publicar-banco-agente.mjs            (publica todo datos/reportes)
//   node tools/publicar-banco-agente.mjs --dry-run  (lista lo que subiría)
//
// Requiere BLOB_READ_WRITE_TOKEN en el entorno (o vercel env pull).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { put, list } from '@vercel/blob';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_REPORTES = join(RAIZ, 'agente-global', 'datos', 'reportes');

export function slugPais(texto) {
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function claveBlob(pais, area) {
  return `agente-global/${slugPais(pais)}/${slugPais(area)}.json`;
}

export function entradaIndice(reporte, url) {
  return {
    pais: reporte.region_or_country,
    area: reporte.research_area,
    fecha: reporte.date,
    url,
  };
}

// Lee los reportes finales (descarta *-hallazgos.md y cualquier no-JSON).
function leerReportes() {
  if (!existsSync(DIR_REPORTES)) return [];
  return readdirSync(DIR_REPORTES)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(DIR_REPORTES, f), 'utf8')))
    .filter((r) => r.region_or_country && r.research_area && r.date);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const reportes = leerReportes();
  if (reportes.length === 0) {
    console.log('No hay reportes en agente-global/datos/reportes/. Nada que publicar.');
  }

  const indice = [];
  for (const reporte of reportes) {
    const clave = claveBlob(reporte.region_or_country, reporte.research_area);
    if (dryRun) {
      console.log(`[dry-run] subiría ${clave} (${reporte.region_or_country} · ${reporte.research_area} · ${reporte.date})`);
      indice.push(entradaIndice(reporte, `https://dry-run/${clave}`));
      continue;
    }
    const { url } = await put(clave, JSON.stringify(reporte), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
      allowOverwrite: true,
    });
    console.log(`Publicado: ${clave} -> ${url}`);
    indice.push(entradaIndice(reporte, url));
  }

  if (dryRun) {
    console.log(`[dry-run] índice tendría ${indice.length} entrada(s).`);
    return;
  }

  const { url: urlIndice } = await put('agente-global/indice.json', JSON.stringify(indice, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
    allowOverwrite: true,
  });
  console.log(`Índice publicado (${indice.length} entrada(s)): ${urlIndice}`);
  // list() confirma de paso que el token tiene permiso de lectura.
  const { blobs } = await list({ prefix: 'agente-global/' });
  console.log(`Blobs bajo agente-global/: ${blobs.length}`);
}

// Sólo ejecuta main si se invoca directamente (no al importarlo desde el test).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('Error publicando el banco:', err.message);
    process.exit(1);
  });
}
