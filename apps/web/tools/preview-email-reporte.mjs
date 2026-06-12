// Vista previa del email del Mapa de Propósito sin enviar nada:
// renderiza la plantilla oficial con el HTML real del email y la guarda en
// ejemplos-privados/ (ignorado por git) para abrirla en el navegador.
//
//   node apps/web/tools/preview-email-reporte.mjs
//
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { formatearEmailHTML } = await import('../api/_lib/enviar-reporte.js');

// Muestra oficial: prompts/plantilla-reporte-top-tier.md (estándar
// .claude/skills/reportes-top-tier — máx 8 hojas, cero astrología visible).
const aqui = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PLANTILLA = path.resolve(aqui, '../../../prompts/plantilla-reporte-top-tier.md');

const reporteMuestra = readFileSync(RUTA_PLANTILLA, 'utf8');

const salidaDir = path.resolve(aqui, '../../../ejemplos-privados');
mkdirSync(salidaDir, { recursive: true });

const cliente = formatearEmailHTML('María Fernanda', reporteMuestra);
writeFileSync(path.join(salidaDir, 'preview-email-cliente.html'), cliente);

const palabras = (reporteMuestra.trim().match(/\S+/g) || []).length;
console.log('Vista previa generada desde', path.relative(process.cwd(), RUTA_PLANTILLA));
console.log(' ', path.join(salidaDir, 'preview-email-cliente.html'));
console.log('  Palabras del reporte:', palabras, '(estándar: 2200-3000)');
console.log('  Tamaño:', (cliente.length / 1024).toFixed(1), 'KB (límite de recorte de Gmail: 102 KB)');
