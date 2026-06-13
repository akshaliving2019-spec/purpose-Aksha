// La plantilla web debe parsear y renderizar un reporte EN con el
// vocabulario oficial (FLOW/BRAKE, Birth gifts, IPN, Exploration stage).
import { renderReporteWeb } from '../api/_lib/plantilla-reporte-web.js';

const reporteEn = `# Purpose Map

## Opening

Test, this map reads four areas of your life.

How to read the markers. Score out of 20, the traffic light, the diagnosis,
and the Natal Potential Index (IPN). At 29 you are closing the Exploration stage.

## Passion · What you love

Score 13/20 · TENSION · ACTIVE

When something excites you, people notice before you say it.

The tension of this area lives between drive and ideals.

Birth gifts. An initiative that opens roads for others.

Birth challenges. You idealize projects until reality feels small.

IPN 60%. Six out of ten parts of this area's potential are available.

## Profession · What you are good at

Score 15/20 · TENSION · IN DEVELOPMENT

You work best when the result can be touched.

The raw material is plentiful.

Birth gifts. You build things that last.

Birth challenges. You doubt your own judgment.

IPN 53%. A little over half of this area's potential is available.

## Mission · What the world needs

Score 8/20 · FLOW · IN DEVELOPMENT

Other people's crises do not scare you.

It moves without internal resistance.

Birth gifts. Steadiness in difficulty.

Birth challenges. You carry alone what belongs to many.

IPN 57%. Most of this area's potential already responds.

## The wound that becomes a gift

There is an old wound around your own worth.

It heals by doing.

## What is activating now

A deep reorganization window is open.

A strong current pushes you to redefine how you show up.

## Closing

Test, your map draws someone who starts visibly and builds patiently.

AKSHA LIFE · AI does not create knowledge. It connects it.`;

let fallos = 0;
const espera = (nombre, cond) => {
  console.log(`${cond ? '✅' : '❌'} ${nombre}`);
  if (!cond) fallos++;
};

const html = renderReporteWeb({ nombre: 'Test Client', reporte: reporteEn, idioma: 'en' });

espera('detecta 3 módulos', (html.match(/class="modulo/g) || []).length === 3);
espera('score 13/20 parseado', html.includes('13<small>/20'));
espera('semáforo FLOW sin acento', html.includes('FLOW') && !html.includes('TENSIÓN'));
espera('IPN 60% parseado', html.includes('60<small>% IPN'));
espera('Birth gifts en ficha', html.includes('<h4>Birth gifts</h4>'));
espera('etapa EXPLORATION', html.includes('EXPLORATION'));
espera('lang="en"', html.includes('<html lang="en">'));
espera('título Purpose Map', html.includes('· Purpose Map</title>'));
espera('overline EN de apertura', html.includes('Before you begin'));
espera('lema EN', html.includes('AI does not create knowledge. It connects it.'));
espera('ventanas EN', html.includes('Open windows'));

// Regresión ES: el render español no cambia.
const htmlEs = renderReporteWeb({ nombre: 'Test', reporte: '## Apertura\n\nHola.\n\n## Cierre\n\nAdiós.\n\nAKSHA LIFE · La IA no crea el conocimiento. Lo conecta.' });
espera('ES sigue con lang es y lema es', htmlEs.includes('<html lang="es">') && htmlEs.includes('La IA no crea el conocimiento. Lo conecta.'));

console.log(fallos === 0 ? '\nTODOS LOS CASOS PASAN' : `\n${fallos} CASO(S) FALLARON`);
process.exit(fallos === 0 ? 0 : 1);
