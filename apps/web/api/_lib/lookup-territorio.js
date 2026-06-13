// Lookup híbrido del banco del Agente Global (Pieza 2).
//
// Dado el país del cliente y el área MVP transversal:
//   - HIT (índice de Blob con fecha <30 días): baja el JSON y lo comprime.
//   - MISS: invoca la investigación en vivo (motor `api`), PERSISTE a Blob
//     ANTES de comprimir/devolver, para que el reintento natural (cron /
//     timeout 'procesando') la encuentre si esta invocación expira a 300s.
//   - Si la investigación falla 2 veces: devuelve sin insumo (la sección se
//     omite). No se añaden estados nuevos a la máquina de Stripe.
//
// Las dependencias externas (Blob, Agente Global) se inyectan: el módulo es
// testeable offline y el pipeline pasa las reales.
import { put, list } from '@vercel/blob';
import { comprimirOportunidades } from './oportunidades-territorio.js';
import { slugPais, claveBlob } from '../../../../tools/publicar-banco-agente.mjs';

// Área MVP: la primera de agente-global/config/areas.json (transversal).
export const AREA_MVP = 'Inteligencia Artificial aplicada';

const FRESCO_MS = 30 * 24 * 60 * 60 * 1000;
const SIN_INSUMO = { pais: '', area: '', profesiones: [], cursos: [], talentos: [], tieneInsumo: false };

export function esFresco(fechaISO, ahora = new Date()) {
  const t = Date.parse(fechaISO);
  if (Number.isNaN(t)) return false;
  return ahora.getTime() - t < FRESCO_MS;
}

// Dependencias reales por defecto (sustituibles en tests).
async function leerIndiceReal() {
  const { blobs } = await list({ prefix: 'agente-global/indice.json' });
  if (blobs.length === 0) return [];
  const res = await fetch(blobs[0].url);
  if (!res.ok) return [];
  return res.json();
}

async function descargarJsonReal(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Blob ${url} respondió ${res.status}`);
  return res.json();
}

async function persistirReal(reporte) {
  const clave = claveBlob(reporte.region_or_country, reporte.research_area);
  await put(clave, JSON.stringify(reporte), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
    allowOverwrite: true,
  });
}

async function investigarReal(pais, area) {
  // Import dinámico: el Agente Global resuelve sus rutas vía import.meta.url
  // (funciona invocado en proceso). guardar:false porque el disco serverless
  // es efímero; la persistencia va a Blob desde aquí.
  const { ejecutarInvestigacion } = await import('../../../../agente-global/nucleo/pipeline.mjs');
  return ejecutarInvestigacion({ pais, area, motor: 'api', guardar: false, log: () => {} });
}

export async function buscarOportunidades(pais, deps = {}) {
  const {
    area = AREA_MVP,
    ahora = new Date(),
    leerIndice = leerIndiceReal,
    descargarJson = descargarJsonReal,
    investigar = investigarReal,
    persistir = persistirReal,
    log = console.log,
  } = deps;

  if (!pais) return { ...SIN_INSUMO };

  // 1. HIT: índice fresco para este país (cualquier área del MVP sirve).
  try {
    const indice = await leerIndice();
    const slug = slugPais(pais);
    const hit = (indice || []).find(
      (e) => slugPais(e.pais) === slug && esFresco(e.fecha, ahora),
    );
    if (hit) {
      const reporte = await descargarJson(hit.url);
      const resumen = comprimirOportunidades(reporte);
      if (resumen.tieneInsumo) {
        log(`🌍 Banco HIT para ${pais} (${hit.area}, ${hit.fecha})`);
        return resumen;
      }
    }
  } catch (error) {
    log(`⚠️ Banco: lookup falló (${String(error).slice(0, 120)}); se intenta investigación en vivo.`);
  }

  // 2. MISS: investigar en vivo hasta 2 intentos, persistir ANTES de devolver.
  for (let intento = 1; intento <= 2; intento++) {
    try {
      log(`🌍 Banco MISS para ${pais}: investigando ${area} (intento ${intento}/2)...`);
      const { reporte } = await investigar(pais, area);
      try {
        await persistir(reporte);
      } catch (errPersist) {
        log(`⚠️ Banco: no se pudo persistir a Blob (${String(errPersist).slice(0, 120)}); se sigue con el insumo en memoria.`);
      }
      const resumen = comprimirOportunidades(reporte);
      if (resumen.tieneInsumo) return resumen;
    } catch (error) {
      log(`⚠️ Banco: investigación falló (intento ${intento}/2): ${String(error).slice(0, 160)}`);
    }
  }

  log(`🌍 Banco: sin insumo para ${pais}; el reporte se genera sin la sección de territorio.`);
  return { ...SIN_INSUMO };
}
