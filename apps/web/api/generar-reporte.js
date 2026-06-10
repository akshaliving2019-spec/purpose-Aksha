import Anthropic from '@anthropic-ai/sdk';
import { PROMPT_SISTEMA_AKSHA, construirMensajeCliente } from './prompt-aksha.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generarReporte({ nombre, email, birthDate, birthTime, birthPlace, carta }) {
  // Streaming obligatorio: el reporte completo supera con holgura lo que un
  // request sin streaming puede generar antes del timeout HTTP del SDK.
  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 32000,
    thinking: { type: 'adaptive' },
    system: PROMPT_SISTEMA_AKSHA,
    messages: [
      {
        role: 'user',
        content: construirMensajeCliente({ nombre, email, birthDate, birthTime, birthPlace, carta }),
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
