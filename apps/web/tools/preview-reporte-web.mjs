// Vista previa de la versión web del Mapa (plantilla top-tier) sin tocar
// Blob ni Stripe: renderiza prompts/plantilla-reporte-top-tier.md con el
// módulo real de producción y la guarda en ejemplos-privados/.
//
//   node apps/web/tools/preview-reporte-web.mjs
//
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { renderReporteWeb } = await import('../api/_lib/plantilla-reporte-web.js');

const aqui = path.dirname(fileURLToPath(import.meta.url));
const reporte = readFileSync(path.resolve(aqui, '../../../prompts/plantilla-reporte-top-tier.md'), 'utf8');

const html = renderReporteWeb({ nombre: 'María Fernanda', reporte });

const salidaDir = path.resolve(aqui, '../../../ejemplos-privados');
mkdirSync(salidaDir, { recursive: true });
const salida = path.join(salidaDir, 'preview-mapa-web.html');
writeFileSync(salida, html);

console.log('Vista previa del Mapa web generada:');
console.log(' ', salida);
console.log('  Tamaño:', (html.length / 1024).toFixed(1), 'KB');
