// Verifica el compresor JSON del Agente Global → resumen `oportunidades`.
import { comprimirOportunidades } from '../api/_lib/oportunidades-territorio.js';

let fallos = 0;
const espera = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

const reporte = {
  region_or_country: 'Colombia',
  research_area: 'Inteligencia Artificial aplicada',
  emerging_professions: Array.from({ length: 10 }, (_, i) => ({
    profession_name: `Profesión ${i + 1}`,
    why_it_matters: `Razón ${i + 1}.`,
    growth_potential_score: i, // 0..9: el orden debe priorizar los mayores
    automation_resistance_score: 5,
  })),
  emerging_courses_and_certifications: Array.from({ length: 8 }, (_, i) => ({
    program_name: `Curso ${i + 1}`,
    provider: `Proveedor ${i + 1}`,
  })),
  human_talents_detected: [
    { talent: 'Acompañamiento', why_valuable: 'Sostiene el vínculo humano.' },
    { talent: 'Criterio ético', why_valuable: 'No se automatiza.' },
  ],
};

const r = comprimirOportunidades(reporte);

espera('incluye país y área', r.pais === 'Colombia' && r.area === 'Inteligencia Artificial aplicada');
espera('máx 8 profesiones', r.profesiones.length === 8);
espera('ordena por crecimiento desc', r.profesiones[0].crecimiento === 9 && r.profesiones[1].crecimiento === 8);
espera('cada profesión trae nombre y por qué', r.profesiones[0].nombre === 'Profesión 10' && !!r.profesiones[0].porque);
espera('máx 5 cursos', r.cursos.length === 5);
espera('curso con nombre y proveedor', r.cursos[0].nombre === 'Curso 1' && r.cursos[0].proveedor === 'Proveedor 1');
espera('talentos resistentes presentes', r.talentos.length === 2 && r.talentos[0].talento === 'Acompañamiento');
espera('tieneInsumo true con datos', r.tieneInsumo === true);

// Reporte vacío / inválido → sin insumo (la sección se omite).
const vacio = comprimirOportunidades(null);
espera('null → tieneInsumo false', vacio.tieneInsumo === false);
espera('null → arrays vacíos', vacio.profesiones.length === 0 && vacio.cursos.length === 0);

const sinProfesiones = comprimirOportunidades({ region_or_country: 'X', research_area: 'Y', emerging_professions: [] });
espera('sin profesiones → tieneInsumo false', sinProfesiones.tieneInsumo === false);

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
