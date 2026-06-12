// Datos de ejemplo para el modo --simulado: permiten probar clasificación,
// validación, renderizado y almacenamiento sin llamadas a la API. El
// contenido es ilustrativo y está marcado como simulado en el report_id.

export function reporteSimulado({ pais = 'Colombia', area = 'Bienestar', fecha }) {
  const date = fecha || new Date().toISOString().slice(0, 10);
  return {
    report_id: `simulado-${date}-${pais.toLowerCase()}-${area.toLowerCase().replace(/\s+/g, '-')}`,
    date,
    region_or_country: pais,
    research_area: area,
    executive_summary:
      'Reporte simulado para pruebas del pipeline. En este ciclo se observan dos movimientos: ' +
      'la demanda de facilitadores que acompañen procesos de adaptación al cambio tecnológico, ' +
      'y la aparición de certificaciones cortas en colaboración humano-IA accesibles en español. ' +
      'Ambos podrían apoyar la reinvención de personas no técnicas desde sus talentos de relación y enseñanza.',
    key_findings: [
      'Las plataformas educativas en español amplían su oferta de cursos cortos sobre productividad con IA.',
      'Crece la búsqueda de acompañamiento humano para transiciones laborales causadas por la automatización.',
    ],
    emerging_professions: [
      {
        profession_name: 'Facilitador de transición laboral humano-IA',
        category: 'Human Development',
        country_or_region_detected: pais,
        source_type: 'community',
        description:
          'Acompaña a personas y equipos que atraviesan cambios laborales impulsados por la automatización, ' +
          'combinando escucha, diseño de rutas de aprendizaje y uso básico de herramientas de IA.',
        why_it_matters:
          'El ritmo de cambio tecnológico supera la velocidad de adaptación de las personas; el acompañamiento ' +
          'humano se vuelve un servicio con demanda creciente.',
        human_talents_required: ['Escucha profunda', 'Mentoría', 'Crear rutas de aprendizaje'],
        technical_skills_required: ['Uso básico de asistentes de IA', 'Diseño de talleres'],
        ai_tools_related: ['Asistentes conversacionales', 'Herramientas de productividad con IA'],
        automation_resistance_score: 8,
        growth_potential_score: 7,
        accessibility_score: 7,
        time_to_learn: '3 a 6 meses',
        recommended_courses: ['Curso introductorio de colaboración humano-IA (simulado)'],
        recommended_certifications: [],
        best_fit_for_personality_or_talent: ['Personas con vocación de acompañamiento', 'Educadores', 'Coaches'],
        possible_income_paths: ['Talleres para empresas', 'Acompañamiento individual', 'Programas comunitarios'],
        risks_or_limitations: ['Mercado aún en formación; los ingresos pueden ser irregulares al inicio'],
        iva: {
          identity_fit: 'Podría haber afinidad con personas que disfrutan escuchar y orientar a otras en momentos de cambio.',
          vocation_path: 'Una ruta posible sería combinar experiencia previa en educación o coaching con formación corta en herramientas de IA.',
          contribution: 'Este camino podría aportar calma y dirección a comunidades que enfrentan la automatización.',
        },
        evidence_sources: ['https://ejemplo.simulado/tendencias-acompanamiento'],
      },
    ],
    emerging_courses_and_certifications: [
      {
        program_name: 'Colaboración humano-IA para no técnicos (simulado)',
        provider: 'Plataforma educativa de ejemplo',
        country_or_global: 'Global',
        language: 'Español',
        area: 'Colaboración humano-IA',
        level: 'beginner',
        duration: '4 semanas',
        cost_estimate: 'low',
        credential_type: 'certificate',
        skills_developed: ['Uso de asistentes de IA', 'Pensamiento crítico aplicado'],
        human_talents_supported: ['Aprendizaje continuo', 'Traducir complejidad'],
        profession_paths_supported: ['Facilitador de transición laboral humano-IA'],
        accessibility_score: 8,
        credibility_score: 6,
        practical_value_score: 7,
        source_url: 'https://ejemplo.simulado/curso-colaboracion-ia',
        date_detected: date,
        last_verified: date,
      },
    ],
    human_talents_detected: [
      {
        talent: 'Escucha profunda',
        category: 'relational',
        why_valuable: 'La automatización no reemplaza la presencia humana en procesos de cambio personal.',
        related_opportunities: ['Facilitación de transiciones laborales', 'Mentoría'],
        possible_income_paths: ['Sesiones de acompañamiento', 'Facilitación de grupos'],
      },
    ],
    automation_risks: [
      {
        affected_profession: 'Tareas administrativas repetitivas',
        region: pais,
        severity: 'medium',
        timeframe: '1 a 3 años',
        evidence: 'Adopción creciente de herramientas de automatización de oficina (dato simulado).',
      },
    ],
    opportunities_for_non_technical_people: [
      'Formación corta en productividad con IA aplicada al oficio actual.',
      'Servicios de acompañamiento a personas en transición laboral.',
    ],
    opportunities_for_holistic_and_human_development_fields: [
      'Talleres de regulación emocional para equipos en procesos de cambio tecnológico.',
      'Facilitación de círculos de aprendizaje comunitario sobre adaptación.',
    ],
    opportunity_radar: {
      immediate: [
        'Curso introductorio de colaboración humano-IA en español.',
        'Aplicar IA a la productividad del oficio actual.',
        'Unirse a comunidades locales de aprendizaje sobre IA.',
      ],
      medium_term: [
        'Construir un servicio de facilitación de transiciones laborales.',
        'Certificación en diseño de experiencias de aprendizaje.',
        'Portafolio de talleres para pequeñas empresas.',
      ],
      exploratory: [
        'Nichos de bienestar digital para trabajadores remotos.',
        'Mentoría intergeneracional sobre tecnología.',
        'Economía de creadores en español sobre adaptación al cambio.',
      ],
    },
    recommended_actions: [
      'Explorar un curso corto y gratuito antes de invertir en certificaciones pagas.',
      'Conversar con tres personas que ya trabajen en el área de interés.',
    ],
    alerts: [
      {
        alert_type: 'accessibility',
        title: 'Cursos gratuitos de IA en español (simulado)',
        summary: 'Se detecta una ruta de aprendizaje gratuita en español para personas no técnicas.',
        region: pais,
        area: 'Educación digital',
        urgency: 'medium',
        who_should_pay_attention: ['Personas en transición laboral', 'Educadores'],
        recommended_action: 'Revisar el curso y evaluar si se alinea con los talentos propios.',
        related_courses: ['Colaboración humano-IA para no técnicos (simulado)'],
        related_professions: ['Facilitador de transición laboral humano-IA'],
        human_talents_related: ['Aprendizaje continuo'],
        evidence_sources: ['https://ejemplo.simulado/curso-colaboracion-ia'],
        date_detected: date,
      },
    ],
    sources: [
      {
        title: 'Tendencias de acompañamiento laboral (dato simulado)',
        url: 'https://ejemplo.simulado/tendencias-acompanamiento',
        source_type: 'community',
        confidence: 'early_signal',
      },
      {
        title: 'Catálogo de cursos de colaboración humano-IA (dato simulado)',
        url: 'https://ejemplo.simulado/curso-colaboracion-ia',
        source_type: 'certification',
        confidence: 'medium',
      },
    ],
    confidence_level: 'low',
    next_research_questions: [
      '¿Qué programas públicos de reconversión laboral existen actualmente en el país?',
      '¿Qué plataformas locales están creciendo más rápido en cursos de IA en español?',
    ],
  };
}

export const HALLAZGOS_SIMULADOS = [
  '## Resumen de la investigación',
  '',
  'Hallazgos simulados para pruebas del pipeline sin llamadas a la API.',
  '',
  '## Fuentes consultadas',
  '',
  'Tendencias de acompañamiento laboral — https://ejemplo.simulado/tendencias-acompanamiento — community — SEÑAL TEMPRANA',
].join('\n');
