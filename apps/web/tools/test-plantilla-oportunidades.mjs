// La plantilla web clasifica y renderiza la sección de oportunidades como
// tarjeta propia (no como prosa genérica), en es y en.
import { renderReporteWeb } from '../api/_lib/plantilla-reporte-web.js';

const reporteEs = `## Apertura

Test, este mapa lee cuatro áreas de tu vida.

## Oportunidades en tu territorio

En Colombia, tu facilidad para acompañar encuentra eco en el rol de facilitador de adopción de IA, donde tu criterio importa más que el código.

## Cierre

Test, tu mapa dibuja a alguien que empieza visible.

AKSHA LIFE · La IA no crea el conocimiento. Lo conecta.`;

const reporteEn = reporteEs
  .replace('## Apertura', '## Opening')
  .replace('## Oportunidades en tu territorio', '## Opportunities in your territory')
  .replace('## Cierre', '## Closing')
  .replace('AKSHA LIFE · La IA no crea el conocimiento. Lo conecta.', 'AKSHA LIFE · AI does not create knowledge. It connects it.');

let fallos = 0;
const espera = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

const htmlEs = renderReporteWeb({ nombre: 'Test', reporte: reporteEs });
espera('ES: tarjeta de oportunidades (clase converge)', (htmlEs.match(/class="converge"/g) || []).length >= 1);
espera('ES: overline de oportunidades', htmlEs.includes('Oportunidades en tu territorio') || htmlEs.includes('En tu territorio'));
espera('ES: contenido presente', htmlEs.includes('facilitador de adopción de IA'));

const htmlEn = renderReporteWeb({ nombre: 'Test', reporte: reporteEn, idioma: 'en' });
espera('EN: tarjeta de oportunidades', (htmlEn.match(/class="converge"/g) || []).length >= 1);
espera('EN: overline EN', htmlEn.includes('In your territory') || htmlEn.includes('Opportunities'));

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
