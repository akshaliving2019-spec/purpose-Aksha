// Limpieza puntual: reemplaza caracteres con render de emoji a color por
// glifos monocromos del lenguaje visual AKSHA (estándar editorial 2026).
// Uso: node tools/limpiar-emojis-reportes.mjs
import { readFileSync, writeFileSync } from 'node:fs';

// Reportes Purpose Map (diseño nuevo): solo 3 caracteres con riesgo emoji.
const MAPA_NUEVO = { '▶': '▸', '⚡': '✷', '⭐': '★' };

// Ejemplos antiguos: emojis reales → glifos del diseño nuevo
// (✦ Pasión · ⬡ Profesión · ⟰ Vocación · △ Misión · ⚷ Quirón).
const MAPA_ANTIGUO = {
  '❤': '✦', '⭐': '⬡', '🌀': '⟰', '🌊': '△', '⚡': '✷', '⚕': '⚷',
  '🎭': '◈', '🔄': '↺', '👥': '❖', '🟢': '●', '🟡': '◐', '⚪': '○', '▶': '▸',
};

const ARCHIVOS = [
  ['apps/web/public/reportes/Aaron_AKSHA-1dd36035b4f7.html', MAPA_NUEVO],
  ['apps/web/public/reportes/Aaron_AKSHA_EN-c4884d132620.html', MAPA_NUEVO],
  ['apps/web/public/reportes/Yofred_AKSHA-22fb96e79054.html', MAPA_NUEVO],
  ['apps/web/public/reportes/NRB_AKSHA-c2dfcfaae9c1.html', MAPA_NUEVO],
  ['prompts/Aaron_PurposeMap_AKSHA_EN.html', MAPA_NUEVO],
  ['prompts/Aaron_PurposeMap_AKSHA_ES.html', MAPA_NUEVO],
  ['prompts/NRB_PurposeMap_AKSHA_ES.html', MAPA_NUEVO],
  ['prompts/Yofre_PurposeMap_AKSHA_ES.html', MAPA_NUEVO],
  ['prompts/AKSHA_Aaron_ReporteEjemplo.html', MAPA_ANTIGUO],
  ['prompts/AKSHA_Gabriel_ReporteEjemplo.html', MAPA_ANTIGUO],
];

for (const [ruta, mapa] of ARCHIVOS) {
  let html = readFileSync(ruta, 'utf8');
  let cambios = 0;
  for (const [emoji, glifo] of Object.entries(mapa)) {
    const antes = html.split(emoji).length - 1;
    if (antes > 0) {
      html = html.split(emoji).join(glifo);
      cambios += antes;
    }
  }
  // Selectores de variación emoji que hayan quedado sueltos
  cambios += (html.match(/️/g) || []).length;
  html = html.replace(/️/g, '');
  if (cambios > 0) writeFileSync(ruta, html);
  console.log(`${ruta}: ${cambios} reemplazos`);
}
