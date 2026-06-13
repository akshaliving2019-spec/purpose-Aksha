// Compresor del reporte del Agente Global (esquema de
// agente-global/esquemas/reporte.schema.json) al insumo compacto que recibe
// el prompt del Mapa de Propósito (Pieza 2). El cruce fino con los módulos del
// cliente lo hace el prompt; aquí sólo se selecciona y resume.
//
// Sin insumo útil (reporte ausente o sin profesiones) → tieneInsumo:false: el
// prompt no escribe la sección y el presupuesto de palabras no cambia.

const MAX_PROFESIONES = 8;
const MAX_CURSOS = 5;
const MAX_TALENTOS = 6;

export function comprimirOportunidades(reporte) {
  const profesionesRaw = Array.isArray(reporte?.emerging_professions) ? reporte.emerging_professions : [];
  const cursosRaw = Array.isArray(reporte?.emerging_courses_and_certifications) ? reporte.emerging_courses_and_certifications : [];
  const talentosRaw = Array.isArray(reporte?.human_talents_detected) ? reporte.human_talents_detected : [];

  const profesiones = profesionesRaw
    .slice()
    .sort((a, b) => (Number(b?.growth_potential_score) || 0) - (Number(a?.growth_potential_score) || 0))
    .slice(0, MAX_PROFESIONES)
    .map((p) => ({
      nombre: String(p?.profession_name || '').trim(),
      porque: String(p?.why_it_matters || '').trim(),
      crecimiento: Number(p?.growth_potential_score) || 0,
      resistencia: Number(p?.automation_resistance_score) || 0,
    }))
    .filter((p) => p.nombre);

  const cursos = cursosRaw
    .slice(0, MAX_CURSOS)
    .map((c) => ({
      nombre: String(c?.program_name || '').trim(),
      proveedor: String(c?.provider || '').trim(),
    }))
    .filter((c) => c.nombre);

  const talentos = talentosRaw
    .slice(0, MAX_TALENTOS)
    .map((t) => ({
      talento: String(t?.talent || '').trim(),
      porque: String(t?.why_valuable || '').trim(),
    }))
    .filter((t) => t.talento);

  return {
    pais: String(reporte?.region_or_country || '').trim(),
    area: String(reporte?.research_area || '').trim(),
    profesiones,
    cursos,
    talentos,
    tieneInsumo: profesiones.length > 0,
  };
}
