// Cliente Claude del Agente Global. Mismo patrón que apps/web/api/_lib/
// generar-reporte.js: la key puede venir con texto extra pegado alrededor
// (saltos de línea rompen el header HTTP), así que se extrae estrictamente
// el patrón sk-ant-...
import { readFileSync, existsSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';

const MODELO = 'claude-opus-4-8';

// El thinking adaptativo solo existe en Opus 4.6+, Sonnet 4.6 y Fable;
// en Haiku el parámetro provocaría un 400, así que se omite.
function soportaThinkingAdaptativo(modelo) {
  return /^claude-(opus-4-[678]|sonnet-4-6|fable)/.test(modelo);
}

function cargarKey() {
  const candidatos = [
    process.env.ANTHROPIC_API_KEY || '',
    ...['apps/web/.env.local', 'apps/web/.env.production.local', '.env']
      .filter((ruta) => existsSync(ruta))
      .map((ruta) => readFileSync(ruta, 'utf8')),
  ];
  for (const texto of candidatos) {
    const m = texto.match(/sk-ant-[A-Za-z0-9_-]{20,}/);
    if (m) return m[0];
  }
  return null;
}

export function hayApiKey() {
  return cargarKey() !== null;
}

let cliente = null;

export function crearCliente() {
  if (cliente) return cliente;
  const apiKey = cargarKey();
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY no encontrada (variable de entorno o apps/web/.env*.local). ' +
      'Usa --simulado para probar el pipeline sin llamadas a la API.',
    );
  }
  cliente = new Anthropic({ apiKey, maxRetries: 3 });
  return cliente;
}

// Llamada con streaming (los reportes superan lo que un request sin streaming
// genera antes del timeout HTTP del SDK). Si la respuesta termina en
// pause_turn (límite de iteraciones de herramientas del servidor), se reenvía
// la conversación para que el servidor continúe donde quedó.
export async function consultarClaude({ system, mensajes, tools, outputFormat, model = MODELO, maxTokens = 32000 }) {
  const claude = crearCliente();
  const historial = [...mensajes];

  for (let intento = 0; intento < 6; intento++) {
    const stream = claude.messages.stream({
      model,
      max_tokens: maxTokens,
      ...(soportaThinkingAdaptativo(model) ? { thinking: { type: 'adaptive' } } : {}),
      system,
      messages: historial,
      ...(tools ? { tools } : {}),
      ...(outputFormat ? { output_config: { format: outputFormat } } : {}),
    });
    const mensaje = await stream.finalMessage();

    if (mensaje.stop_reason === 'pause_turn') {
      historial.push({ role: 'assistant', content: mensaje.content });
      continue;
    }
    if (mensaje.stop_reason === 'refusal') {
      throw new Error('Claude rechazó la solicitud (stop_reason: refusal).');
    }
    if (mensaje.stop_reason === 'max_tokens') {
      throw new Error(`Respuesta truncada por max_tokens (${maxTokens}).`);
    }

    const texto = mensaje.content
      .filter((bloque) => bloque.type === 'text')
      .map((bloque) => bloque.text)
      .join('\n');
    if (!texto) {
      throw new Error(`Claude no devolvió texto (stop_reason: ${mensaje.stop_reason}).`);
    }
    return { texto, usage: mensaje.usage, stop_reason: mensaje.stop_reason };
  }
  throw new Error('La investigación no terminó tras 6 continuaciones (pause_turn).');
}

export { MODELO };
