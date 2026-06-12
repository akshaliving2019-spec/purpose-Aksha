// Almacenamiento de resultados para entrenamiento continuo (sección 13 del
// prompt maestro): cada investigación queda guardada como JSON + markdown,
// las alertas se acumulan por año y el índice histórico registra la serie
// temporal (cuándo apareció una oportunidad, en qué países, con qué confianza).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function slug(texto) {
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function leerJson(ruta, porDefecto) {
  if (!existsSync(ruta)) return porDefecto;
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

// Los hallazgos de investigación se guardan apenas termina la fase 1: si la
// clasificación falla después, el trabajo de búsqueda web no se pierde.
export function guardarHallazgosParciales({ fecha, pais, area, hallazgos, dirDatos }) {
  const dirReportes = join(dirDatos, 'reportes');
  mkdirSync(dirReportes, { recursive: true });
  const ruta = join(dirReportes, `${fecha}-${slug(pais)}-${slug(area)}-hallazgos.md`);
  writeFileSync(ruta, hallazgos, 'utf8');
  return ruta;
}

export function guardarResultado({ reporte, markdown, hallazgos, dirDatos }) {
  const base = `${reporte.date}-${slug(reporte.region_or_country)}-${slug(reporte.research_area)}`;
  const dirReportes = join(dirDatos, 'reportes');
  const dirAlertas = join(dirDatos, 'alertas');
  const dirHistorico = join(dirDatos, 'historico');
  for (const dir of [dirReportes, dirAlertas, dirHistorico]) mkdirSync(dir, { recursive: true });

  const rutaJson = join(dirReportes, `${base}.json`);
  const rutaMd = join(dirReportes, `${base}.md`);
  writeFileSync(rutaJson, JSON.stringify(reporte, null, 2), 'utf8');
  writeFileSync(rutaMd, markdown, 'utf8');

  // Los hallazgos crudos de investigación se conservan para auditoría de
  // fuentes y reentrenamiento de la clasificación.
  let rutaHallazgos = null;
  if (hallazgos) {
    rutaHallazgos = join(dirReportes, `${base}-hallazgos.md`);
    writeFileSync(rutaHallazgos, hallazgos, 'utf8');
  }

  let rutaAlertas = null;
  if (reporte.alerts.length > 0) {
    const anio = reporte.date.slice(0, 4);
    rutaAlertas = join(dirAlertas, `${anio}.json`);
    const alertas = leerJson(rutaAlertas, []);
    alertas.push(...reporte.alerts.map((a) => ({ ...a, report_id: reporte.report_id })));
    writeFileSync(rutaAlertas, JSON.stringify(alertas, null, 2), 'utf8');
  }

  const rutaIndice = join(dirHistorico, 'indice.json');
  const indice = leerJson(rutaIndice, []);
  indice.push({
    report_id: reporte.report_id,
    date: reporte.date,
    region_or_country: reporte.region_or_country,
    research_area: reporte.research_area,
    confidence_level: reporte.confidence_level,
    professions: reporte.emerging_professions.map((p) => p.profession_name),
    courses: reporte.emerging_courses_and_certifications.map((c) => c.program_name),
    talents: reporte.human_talents_detected.map((t) => t.talent),
    n_alerts: reporte.alerts.length,
    n_sources: reporte.sources.length,
    archivo: `reportes/${base}.json`,
  });
  writeFileSync(rutaIndice, JSON.stringify(indice, null, 2), 'utf8');

  return { rutaJson, rutaMd, rutaHallazgos, rutaAlertas, rutaIndice };
}
