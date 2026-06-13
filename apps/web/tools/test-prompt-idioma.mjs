// Verifica que construirMensajeCliente añade el bloque de idioma EN solo
// cuando idioma === 'en', con el vocabulario oficial completo.
import { construirMensajeCliente } from '../api/_lib/prompt-aksha.js';

const base = {
  nombre: 'Test Client', email: 'test@example.com', birthDate: '13/10/1996',
  birthTime: '01:45', birthPlace: 'Bogotá, Colombia',
  carta: { texto: 'CARTA NATAL (stub)' }, observaciones: '', historiaVida: '',
};

let fallos = 0;
const espera = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

const es = construirMensajeCliente({ ...base, idioma: 'es' });
const sin = construirMensajeCliente({ ...base });
const en = construirMensajeCliente({ ...base, idioma: 'en' });

espera('es: sin bloque de inglés', !es.includes('ENTIRE REPORT IN ENGLISH'));
espera('sin idioma: sin bloque de inglés', !sin.includes('ENTIRE REPORT IN ENGLISH'));
espera('es y sin-idioma idénticos', es === sin);
espera('es: sin firma EN', !es.includes('AI does not create knowledge'));
espera('en: bloque de inglés presente', en.includes('ENTIRE REPORT IN ENGLISH'));
espera('en: semáforo oficial', en.includes('FLOW / TENSION / BRAKE'));
espera('en: dones oficiales', en.includes('Birth gifts.') && en.includes('Birth challenges.'));
espera('en: IPN conserva sigla', en.includes('Natal Potential Index (IPN)'));
espera('en: etapas oficiales', en.includes('Exploration stage'));
espera('en: firma oficial', en.includes('AKSHA LIFE · AI does not create knowledge. It connects it.'));
espera('en: títulos de sección', en.includes('The wound that becomes a gift'));
espera('en: título oficial', en.includes('"Purpose Map"'));

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
