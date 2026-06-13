// Verifica que construirMensajeCliente añade el bloque de oportunidades sólo
// cuando hay insumo, y que el system prompt y los títulos EN están al día.
import { construirMensajeCliente, PROMPT_SISTEMA_AKSHA } from '../api/_lib/prompt-aksha.js';

const base = {
  nombre: 'Test Client', email: 'test@example.com', birthDate: '13/10/1996',
  birthTime: '01:45', birthPlace: 'Bogotá, Colombia',
  carta: { texto: 'CARTA NATAL (stub)' }, observaciones: '', historiaVida: '',
};

const oportunidades = {
  pais: 'Colombia', area: 'Inteligencia Artificial aplicada',
  profesiones: [
    { nombre: 'Curador de datos de IA', porque: 'Las empresas necesitan datos limpios.', crecimiento: 8, resistencia: 7 },
    { nombre: 'Facilitador de adopción de IA', porque: 'La gente necesita acompañamiento.', crecimiento: 9, resistencia: 8 },
  ],
  cursos: [{ nombre: 'Fundamentos de IA aplicada', proveedor: 'SENA' }],
  talentos: [{ talento: 'Acompañamiento', porque: 'No se automatiza.' }],
  tieneInsumo: true,
};

let fallos = 0;
const espera = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

// System prompt: sección 8 y CIERRE renumerado.
espera('system: sección 8 de oportunidades', /8\.\s+Oportunidades en tu territorio/i.test(PROMPT_SISTEMA_AKSHA));
espera('system: CIERRE renumerado a 9', /9\.\s+CIERRE/.test(PROMPT_SISTEMA_AKSHA));
espera('system: regla cero astrología en la sección', /OPORTUNIDADES|territorio/i.test(PROMPT_SISTEMA_AKSHA));

// Título EN exacto en la lista del bloqueIdioma.
const en = construirMensajeCliente({ ...base, idioma: 'en', oportunidades });
espera('título EN en lista de secciones', en.includes('Opportunities in your territory'));

// Con insumo: el bloque aparece, con país y profesiones.
const conInsumo = construirMensajeCliente({ ...base, oportunidades });
espera('con insumo: bloque presente', conInsumo.includes('OPORTUNIDADES DEL TERRITORIO'));
espera('con insumo: país', conInsumo.includes('Colombia'));
espera('con insumo: profesión', conInsumo.includes('Facilitador de adopción de IA'));
espera('con insumo: curso', conInsumo.includes('Fundamentos de IA aplicada'));
espera('con insumo: talento', conInsumo.includes('Acompañamiento'));

// Sin insumo: el bloque NO aparece (sección se omite).
const sinInsumo = construirMensajeCliente({ ...base, oportunidades: { ...oportunidades, profesiones: [], tieneInsumo: false } });
espera('sin insumo: sin bloque', !sinInsumo.includes('OPORTUNIDADES DEL TERRITORIO'));
const sinArg = construirMensajeCliente({ ...base });
espera('sin argumento: sin bloque', !sinArg.includes('OPORTUNIDADES DEL TERRITORIO'));

// Regresión: el idioma sigue funcionando.
espera('EN sigue activando el bloque de idioma', en.includes('ENTIRE REPORT IN ENGLISH'));

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
