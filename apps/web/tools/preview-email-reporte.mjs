// Vista previa del email del Mapa de Propósito sin enviar nada:
// renderiza un reporte de muestra con la plantilla real y lo guarda en
// ejemplos-privados/ (ignorado por git) para abrirlo en el navegador.
//
//   node apps/web/tools/preview-email-reporte.mjs
//
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { formatearEmailHTML } = await import('../api/_lib/enviar-reporte.js');

const REPORTE_MUESTRA = `## Apertura — El mapa que tienes en las manos

Nydia, este mapa no viene a decirte quién eres: viene a mostrarte lo que ya
has vivido, con otra luz. A tus 52 años estás en plena etapa de INTEGRACIÓN —
la etapa en la que los caminos recorridos empiezan a converger y lo aprendido
pide ser transmitido.

Lo que sigue conecta los patrones de tu nacimiento con el momento actual del
mundo, para que cada decisión que tomes este año tenga raíz y dirección.

## Pasión — Lo que amas

**Puntuación: 14/20** — Presencia 7 · Fuerza 3 · Dispositor activo +1 · base 3

Semáforo: TENSIÓN. Tu Sol en Sagitario en Casa 5 es un motor de fuego puro,
pero la cuadratura de Saturno le ha puesto disciplina — y a veces freno — a
tu espontaneidad creativa.

Diagnóstico: ACTIVO. La pasión nunca se apagó; aprendió a esperar su momento.

Desde niña hubo algo en ti que se encendía al crear, al enseñar, al compartir
lo que descubrías. Esa chispa chocó más de una vez con la voz interna que
pedía prudencia. Hoy sabes que ambas fuerzas son tuyas: el fuego y la forma.

### Dones de nacimiento

- **Entusiasmo que contagia** — Sol en Sagitario en Casa 5: cuando hablas de lo que amas, la gente se inclina hacia adelante.
- **Creatividad con oficio** — Sol cuadratura Saturno: tu inspiración sabe terminar lo que empieza.
- **Visión de largo alcance** — Júpiter trígono Luna: intuyes hacia dónde van las cosas antes de que sean evidentes.
- **Generosidad de maestra** — Venus en Casa 9: disfrutas más cuando lo que sabes se vuelve útil para otros.

### Desafíos de nacimiento

- **El juez interno** — Sol cuadratura Saturno: la voz que dice "todavía no es suficiente". Integrada, se convierte en excelencia sin parálisis.
- **Dispersión del fuego** — Marte en Géminis: muchos intereses a la vez. Integrado, es versatilidad con foco.

IPN del módulo: 72% — potencial medio-alto, listo para activarse.

---

## Resumen de los 4 módulos

PASIÓN — 14/20 · TENSIÓN · ACTIVO · freno principal: Sol cuadratura Saturno
PROFESIÓN — 16/20 · FLUJO · ACTIVO · sin frenos mayores
VOCACIÓN — 11/20 · TENSIÓN · EN DESARROLLO · freno: Luna oposición Neptuno
MISIÓN — 9/20 · FRENO · BLOQUEADO · freno: Quirón cuadratura MC

Tu puerta de entrada al Ikigai es la PROFESIÓN. Tu mayor potencial de
transformación está en la MISIÓN — regla Kamiya: donde hay freno, hay
profundidad esperando.

## Tránsitos activos — Qué está pasando ahora

Júpiter transita exacto sobre tu Medio Cielo. Esta es una ventana de
expansión profesional que se abre pocas veces por década: lo que muestres
ahora al mundo tiende a crecer.

- Júpiter conjunción MC, exacto: visibilidad y reconocimiento profesional.
- Saturno trígono Sol, orbe 1°: estructura que sostiene en lugar de frenar.

## Cierre

Nydia, tu mapa no describe un destino: describe un terreno. El terreno es
fértil y la estación es buena. Lo que siembres este año — con el fuego de tu
Sagitario y la paciencia que Saturno te enseñó — tiene todas las condiciones
para crecer.

AKSHA LIFE · La IA no crea el conocimiento. Lo conecta.`;

const aqui = path.dirname(fileURLToPath(import.meta.url));
const salidaDir = path.resolve(aqui, '../../../ejemplos-privados');
mkdirSync(salidaDir, { recursive: true });

const cliente = formatearEmailHTML('Nydia Restrepo', REPORTE_MUESTRA);
writeFileSync(path.join(salidaDir, 'preview-email-cliente.html'), cliente);

console.log('Vista previa generada:');
console.log(' ', path.join(salidaDir, 'preview-email-cliente.html'));
console.log('  Tamaño:', (cliente.length / 1024).toFixed(1), 'KB (límite de recorte de Gmail: 102 KB)');
