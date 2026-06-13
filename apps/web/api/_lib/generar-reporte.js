import Anthropic from '@anthropic-ai/sdk';
import { obtenerProducto } from './productos.js';

// La variable de entorno puede venir con texto extra pegado alrededor de la
// key (saltos de línea rompen el header HTTP → "Connection error" del SDK).
// Extraemos estrictamente el patrón sk-ant-...
const RAW_KEY = process.env.ANTHROPIC_API_KEY || '';
const API_KEY = (RAW_KEY.match(/sk-ant-[A-Za-z0-9_-]{20,}/) || [RAW_KEY.trim()])[0];

const client = new Anthropic({
  apiKey: API_KEY,
  maxRetries: 3, // errores 429/5xx transitorios se reintentan solos
});

export async function generarReporte({
  nombre, email, birthDate, birthTime, birthPlace, carta, observaciones, historiaVida, producto, idioma, oportunidades,
}) {
  const prod = obtenerProducto(producto);
  // Streaming obligatorio: el reporte completo supera con holgura lo que un
  // request sin streaming puede generar antes del timeout HTTP del SDK.
  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 32000,
    thinking: { type: 'adaptive' },
    system: prod.promptSistema,
    messages: [
      {
        role: 'user',
        content: prod.construirMensaje({ nombre, email, birthDate, birthTime, birthPlace, carta, observaciones, historiaVida, idioma, oportunidades }),
      },
    ],
  });

  const mensaje = await stream.finalMessage();

  const texto = mensaje.content
    .filter((bloque) => bloque.type === 'text')
    .map((bloque) => bloque.text)
    .join('\n');

  if (!texto) {
    throw new Error(`Claude no devolvió texto (stop_reason: ${mensaje.stop_reason})`);
  }

  console.log(
    `🤖 Reporte generado: ${texto.length} caracteres · ` +
    `tokens out: ${mensaje.usage?.output_tokens} · stop: ${mensaje.stop_reason}`
  );
  return texto;
}
