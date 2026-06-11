// Prueba rápida del detector de glifos prohibidos del validador.
// Uso: node tools/test-validador-glifos.mjs
import { validarReporte } from '../apps/web/api/_lib/validar-reporte.js';

const carta = {
  planetas: [{ nombre: 'Sol', signo: 'Aries', casa: 1 }],
  cuspides_casas: {},
};

const limpio = `## Tu Mapa de Propósito
PASIÓN — 14/20 · Semáforo: FLUJO · Diagnóstico: ACTIVO
El Sol en Aries a 12° impulsa tu manera de empezar las cosas — directa, sin rodeos.
- Don 1: Iniciativa natural · Sol en Aries en Casa 1
AKSHA LIFE · La IA no crea el conocimiento. Lo conecta.`;

const sucio = `## ❤️ PASIÓN — 14/20 🟢 FLUJO
El Sol ⚡EXACTO en Aries ✦ te impulsa → adelante 🌊 con fuerza ⭐.`;

const r1 = validarReporte(limpio, carta);
const r2 = validarReporte(sucio, carta);

console.log('Reporte limpio →', r1.ok ? 'OK (pasa)' : `FALLA: ${r1.errores.join(' | ')}`);
console.log('Reporte con emojis →', r2.ok ? 'ERROR: debería fallar' : `detectado: ${r2.errores.join(' | ')}`);

if (!r1.ok || r2.ok) process.exit(1);
console.log('Prueba superada.');
