// Versión humana del reporte en markdown, generada de forma determinista a
// partir del JSON validado. Garantiza estructura estable y tipografía limpia;
// el pase opcional de prosa con Claude (--prosa) solo mejora la redacción.

const ETIQUETA_CONFIANZA = {
  high: 'confianza alta',
  medium: 'confianza media',
  early_signal: 'señal temprana',
  needs_verification: 'requiere verificación',
  not_reliable: 'no confiable',
};

const ETIQUETA_NIVEL = { low: 'baja', medium: 'media', high: 'alta' };

const ETIQUETA_ALERTA = {
  displacement: 'Desplazamiento',
  opportunity: 'Oportunidad',
  human_talent: 'Talento humano',
  regional: 'Regional',
  accessibility: 'Accesibilidad',
  entrepreneurship: 'Emprendimiento',
};

function lista(items, vacio = 'Sin evidencia suficiente en este ciclo de investigación.') {
  if (!items || items.length === 0) return `${vacio}\n`;
  return items.map((i) => `- ${i}`).join('\n') + '\n';
}

function seccionProfesion(p) {
  const lineas = [
    `### ${p.profession_name}`,
    '',
    `${p.description}`,
    '',
    `Por qué importa: ${p.why_it_matters}`,
    '',
    `- Categoría: ${p.category} · Detectada en: ${p.country_or_region_detected}`,
    `- Resistencia a la automatización: ${p.automation_resistance_score}/10 · Potencial de crecimiento: ${p.growth_potential_score}/10 · Accesibilidad: ${p.accessibility_score}/10`,
    `- Tiempo estimado de aprendizaje: ${p.time_to_learn || 'sin dato'}`,
  ];
  if (p.human_talents_required?.length) lineas.push(`- Talentos humanos: ${p.human_talents_required.join(', ')}`);
  if (p.technical_skills_required?.length) lineas.push(`- Habilidades técnicas: ${p.technical_skills_required.join(', ')}`);
  if (p.ai_tools_related?.length) lineas.push(`- Herramientas de IA relacionadas: ${p.ai_tools_related.join(', ')}`);
  if (p.possible_income_paths?.length) lineas.push(`- Rutas de ingreso posibles: ${p.possible_income_paths.join('; ')}`);
  if (p.risks_or_limitations?.length) lineas.push(`- Riesgos o limitaciones: ${p.risks_or_limitations.join('; ')}`);
  lineas.push(
    '',
    'Lectura IVA (Identidad, Vocación, Aportación):',
    '',
    `- Identidad: ${p.iva.identity_fit}`,
    `- Vocación: ${p.iva.vocation_path}`,
    `- Aportación: ${p.iva.contribution}`,
    '',
    `Fuentes: ${p.evidence_sources.join(' · ')}`,
  );
  return lineas.join('\n');
}

function seccionCurso(c) {
  const costo = { free: 'gratuito', low: 'costo bajo', medium: 'costo medio', high: 'costo alto', unknown: 'costo por confirmar' }[c.cost_estimate] || c.cost_estimate;
  const nivel = { beginner: 'inicial', intermediate: 'intermedio', advanced: 'avanzado' }[c.level] || c.level;
  return [
    `### ${c.program_name} (${c.provider})`,
    '',
    `- Área: ${c.area} · Nivel: ${nivel} · Duración: ${c.duration || 'sin dato'} · ${costo}`,
    `- Tipo de credencial: ${c.credential_type} · Idioma: ${c.language} · Alcance: ${c.country_or_global}`,
    `- Habilidades que desarrolla: ${c.skills_developed.join(', ') || 'sin dato'}`,
    `- Talentos humanos que apoya: ${c.human_talents_supported.join(', ') || 'sin dato'}`,
    `- Caminos profesionales que apoya: ${c.profession_paths_supported.join(', ') || 'sin dato'}`,
    `- Accesibilidad: ${c.accessibility_score}/10 · Credibilidad: ${c.credibility_score}/10 · Valor práctico: ${c.practical_value_score}/10`,
    `- Fuente: ${c.source_url}`,
  ].join('\n');
}

export function renderizarReporteHumano(r) {
  const partes = [];
  const p = (s = '') => partes.push(s);

  p('AKSHA.LIFE — RADAR GLOBAL DE OPORTUNIDADES');
  p('');
  p(`${r.region_or_country} · ${r.research_area} · ${r.date}`);
  p(`Identificador: ${r.report_id} · Nivel de confianza de este reporte: ${ETIQUETA_NIVEL[r.confidence_level] || r.confidence_level}`);
  p('');
  p('## 1. Resumen ejecutivo');
  p('');
  p(r.executive_summary);
  p('');
  p('## 2. Hallazgos clave');
  p('');
  p(lista(r.key_findings));
  p('## 3. Profesiones emergentes');
  p('');
  if (r.emerging_professions.length === 0) p(lista([]));
  else p(r.emerging_professions.map(seccionProfesion).join('\n\n'));
  p('');
  p('## 4. Cursos y certificaciones detectados');
  p('');
  if (r.emerging_courses_and_certifications.length === 0) p(lista([]));
  else p(r.emerging_courses_and_certifications.map(seccionCurso).join('\n\n'));
  p('');
  p('## 5. Talentos humanos en alza');
  p('');
  p(lista(r.human_talents_detected.map(
    (t) => `${t.talent}: ${t.why_valuable} Oportunidades relacionadas: ${t.related_opportunities.join(', ') || 'por explorar'}.`,
  )));
  p('## 6. Riesgos de automatización');
  p('');
  p(lista(r.automation_risks.map(
    (a) => `${a.affected_profession} (${a.region}) — severidad ${ETIQUETA_NIVEL[a.severity] || a.severity}, horizonte ${a.timeframe}. Evidencia: ${a.evidence}`,
  ), 'No se detectaron riesgos de desplazamiento con evidencia suficiente en este ciclo.'));
  p('## 7. Oportunidades para personas no técnicas');
  p('');
  p(lista(r.opportunities_for_non_technical_people));
  p('## 8. Oportunidades en desarrollo humano, bienestar y creatividad');
  p('');
  p(lista(r.opportunities_for_holistic_and_human_development_fields));
  p('## 9. Radar de oportunidades');
  p('');
  p('Inmediatas (puedes explorarlas hoy):');
  p('');
  p(lista(r.opportunity_radar.immediate));
  p('A mediano plazo (requieren preparación):');
  p('');
  p(lista(r.opportunity_radar.medium_term));
  p('Exploratorias (señales que vale la pena observar):');
  p('');
  p(lista(r.opportunity_radar.exploratory));
  p('## 10. Acciones recomendadas');
  p('');
  p(lista(r.recommended_actions));
  if (r.alerts.length > 0) {
    p('## 11. Alertas activas');
    p('');
    p(r.alerts.map((a) => [
      `### ${ETIQUETA_ALERTA[a.alert_type] || a.alert_type}: ${a.title}`,
      '',
      a.summary,
      '',
      `- Urgencia: ${ETIQUETA_NIVEL[a.urgency] || a.urgency} · Región: ${a.region} · Área: ${a.area}`,
      `- A quién le conviene prestar atención: ${a.who_should_pay_attention.join(', ')}`,
      `- Acción recomendada: ${a.recommended_action}`,
      `- Evidencia: ${a.evidence_sources.join(' · ')}`,
    ].join('\n')).join('\n\n'));
    p('');
  }
  p('## Fuentes consultadas');
  p('');
  p(lista(r.sources.map(
    (f) => `${f.title} — ${f.url} — ${f.source_type} — ${ETIQUETA_CONFIANZA[f.confidence] || f.confidence}`,
  ), 'Sin fuentes registradas.'));
  p('## Próximas preguntas de investigación');
  p('');
  p(lista(r.next_research_questions));
  p('---');
  p('');
  p('AKSHA.life no pretende decirte quién debes ser. Pretende apoyar tu proceso de descubrir quién eres, qué talentos puedes desarrollar y cómo puedes aportar valor en un mundo que está cambiando rápidamente.');
  p('');
  p('AKSHA LIFE · La IA no crea el conocimiento. Lo conecta.');

  return partes.join('\n');
}
