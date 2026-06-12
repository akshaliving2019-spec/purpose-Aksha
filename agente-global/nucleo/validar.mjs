// Validación editorial y estructural del Agente Global.
// Estándar editorial AKSHA 2026: tipografía limpia, cero emojis y glifos
// decorativos (mismo patrón que apps/web/api/_lib/validar-reporte.js).
// Reglas de lenguaje del prompt maestro (sección 16): "apoyar" en lugar de
// "ayudar", lenguaje no determinista, sin promesas médicas.

const PATRON_GLIFO_PROHIBIDO =
  /[⁂←-⇿⌀-⏿■-⟿⤀-⥿⬀-⯿︎️\u{1F000}-\u{1FAFF}]/gu;

// Conjugaciones de "ayudar" en voz del reporte. Se excluyen palabras donde
// "ayud" no es el verbo dirigido a la persona (no hay casos comunes; se
// marca todo para revisión editorial).
const PATRON_AYUDAR = /\bayud(?:a|e|o|ar|an|as|en|es|amos|aron|ará|arán|aría|arían|ando|ándote|ándolo|ándola|arte|arles|arle)\b/giu;

const PATRONES_DETERMINISMO = [
  /\btú eres\b/giu,
  /\bnaciste para\b/giu,
  /\btu destino es\b/giu,
  /\bestás destinad[oa]\b/giu,
];

// Afirmaciones médicas: solo combinaciones verbo + dolencia, para no marcar
// falsos positivos como "curador de contenido" o "sanador comunitario" citado
// como práctica cultural.
const PATRON_MEDICO =
  /\b(?:cura|curan|sana|sanan|elimina|eliminan|garantiza(?:n)? la cura de)\s+(?:la\s+|el\s+|las\s+|los\s+)?(?:enfermedad|enfermedades|ansiedad|depresión|cáncer|dolor crónico|trauma)\b/giu;

export function validarTexto(texto) {
  const errores = [];
  const t = String(texto || '');

  const glifos = [...new Set(t.match(PATRON_GLIFO_PROHIBIDO) || [])];
  if (glifos.length > 0) {
    errores.push(`Emojis o glifos decorativos prohibidos: ${glifos.join(' ')}`);
  }
  const ayudar = [...new Set((t.match(PATRON_AYUDAR) || []).map((m) => m.toLowerCase()))];
  if (ayudar.length > 0) {
    errores.push(`Usa "apoyar" en lugar de "ayudar" (encontrado: ${ayudar.join(', ')})`);
  }
  for (const patron of PATRONES_DETERMINISMO) {
    const m = t.match(patron);
    if (m) errores.push(`Lenguaje determinista prohibido: "${m[0]}"`);
  }
  const medico = t.match(PATRON_MEDICO);
  if (medico) errores.push(`Afirmación médica prohibida: "${medico[0]}"`);

  return errores;
}

const NIVELES = ['low', 'medium', 'high'];
const TIPOS_FUENTE = ['academic', 'company', 'job_market', 'certification', 'community', 'government', 'signal'];
const CONFIANZA_FUENTE = ['high', 'medium', 'early_signal', 'needs_verification', 'not_reliable'];
const TIPOS_ALERTA = ['displacement', 'opportunity', 'human_talent', 'regional', 'accessibility', 'entrepreneurship'];
const CATEGORIAS_TALENTO = ['relational', 'creative', 'adaptation', 'teaching', 'purpose', 'holistic_wellbeing'];

function puntajeValido(n) {
  return Number.isInteger(n) && n >= 0 && n <= 10;
}

// Junta recursivamente todos los valores string de un objeto para pasarlos
// por la validación editorial de una sola vez.
function textosDe(valor) {
  if (typeof valor === 'string') return [valor];
  if (Array.isArray(valor)) return valor.flatMap(textosDe);
  if (valor && typeof valor === 'object') return Object.values(valor).flatMap(textosDe);
  return [];
}

export function validarReporteGlobal(reporte) {
  const errores = [];
  const e = (msg) => errores.push(msg);

  if (!reporte || typeof reporte !== 'object') {
    return { ok: false, errores: ['El reporte no es un objeto JSON.'] };
  }

  for (const campo of ['report_id', 'date', 'region_or_country', 'research_area', 'executive_summary']) {
    if (typeof reporte[campo] !== 'string' || !reporte[campo].trim()) e(`Campo requerido vacío: ${campo}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reporte.date || '')) e(`date no tiene formato AAAA-MM-DD: "${reporte.date}"`);
  if (!NIVELES.includes(reporte.confidence_level)) e(`confidence_level inválido: "${reporte.confidence_level}"`);

  // Si algún campo de arreglo no es arreglo, no se puede seguir iterando.
  let arreglosRotos = false;
  for (const campo of [
    'key_findings', 'emerging_professions', 'emerging_courses_and_certifications',
    'human_talents_detected', 'automation_risks', 'opportunities_for_non_technical_people',
    'opportunities_for_holistic_and_human_development_fields', 'recommended_actions',
    'alerts', 'sources', 'next_research_questions',
  ]) {
    if (!Array.isArray(reporte[campo])) {
      e(`Campo requerido no es arreglo: ${campo}`);
      arreglosRotos = true;
    }
  }
  if (arreglosRotos) return { ok: false, errores };

  if (reporte.sources.length === 0) e('El reporte no cita ninguna fuente.');
  for (const f of reporte.sources) {
    if (!TIPOS_FUENTE.includes(f.source_type)) e(`Fuente "${f.title}": source_type inválido "${f.source_type}"`);
    if (!CONFIANZA_FUENTE.includes(f.confidence)) e(`Fuente "${f.title}": confianza inválida "${f.confidence}"`);
  }

  for (const p of reporte.emerging_professions) {
    const nombre = p.profession_name || '(sin nombre)';
    if (!Array.isArray(p.evidence_sources) || p.evidence_sources.length === 0) {
      e(`Profesión "${nombre}" sin fuentes de evidencia.`);
    }
    for (const campo of ['automation_resistance_score', 'growth_potential_score', 'accessibility_score']) {
      if (!puntajeValido(p[campo])) e(`Profesión "${nombre}": ${campo} fuera de rango 0-10 (${p[campo]})`);
    }
    if (!p.iva || !p.iva.identity_fit || !p.iva.vocation_path || !p.iva.contribution) {
      e(`Profesión "${nombre}" sin integración IVA completa.`);
    }
  }

  for (const c of reporte.emerging_courses_and_certifications) {
    const nombre = c.program_name || '(sin nombre)';
    for (const campo of ['accessibility_score', 'credibility_score', 'practical_value_score']) {
      if (!puntajeValido(c[campo])) e(`Curso "${nombre}": ${campo} fuera de rango 0-10 (${c[campo]})`);
    }
  }

  for (const t of reporte.human_talents_detected) {
    if (!CATEGORIAS_TALENTO.includes(t.category)) {
      e(`Talento "${t.talent}": categoría inválida "${t.category}"`);
    }
  }

  for (const a of reporte.alerts) {
    if (!TIPOS_ALERTA.includes(a.alert_type)) e(`Alerta "${a.title}": tipo inválido "${a.alert_type}"`);
    if (!NIVELES.includes(a.urgency)) e(`Alerta "${a.title}": urgencia inválida "${a.urgency}"`);
    if (!Array.isArray(a.evidence_sources) || a.evidence_sources.length === 0) {
      e(`Alerta "${a.title}" sin fuentes de evidencia.`);
    }
  }

  const radar = reporte.opportunity_radar;
  if (!radar || !Array.isArray(radar.immediate) || !Array.isArray(radar.medium_term) || !Array.isArray(radar.exploratory)) {
    e('opportunity_radar incompleto (immediate / medium_term / exploratory).');
  }

  // Validación editorial sobre todo el texto del reporte. Las URLs se
  // excluyen porque pueden contener cualquier cosa.
  const textoCompleto = textosDe(reporte).filter((s) => !/^https?:\/\//.test(s)).join('\n');
  errores.push(...validarTexto(textoCompleto));

  return { ok: errores.length === 0, errores };
}
