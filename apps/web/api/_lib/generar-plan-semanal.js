import Anthropic from '@anthropic-ai/sdk';
import {
  PROMPT_SISTEMA_PLAN_SEMANAL, construirMensajePlanSemanal,
} from './prompt-plan-semanal.js';

// Misma defensa que generar-reporte.js: extraer estrictamente la key sk-ant-...
const RAW_KEY = process.env.ANTHROPIC_API_KEY || '';
const API_KEY = (RAW_KEY.match(/sk-ant-[A-Za-z0-9_-]{20,}/) || [RAW_KEY.trim()])[0];

const client = new Anthropic({ apiKey: API_KEY, maxRetries: 3 });

// El plan semanal corre en Sonnet (más barato/rápido); el reporte principal
// sigue en Opus (generar-reporte.js).
export async function generarPlanSemanal({ nombre, reporteMd, elemento, semana, idioma }) {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: PROMPT_SISTEMA_PLAN_SEMANAL,
    messages: [
      {
        role: 'user',
        content: construirMensajePlanSemanal({ nombre, reporteMd, elemento, semana, idioma }),
      },
    ],
  });

  const mensaje = await stream.finalMessage();
  const texto = mensaje.content
    .filter((bloque) => bloque.type === 'text')
    .map((bloque) => bloque.text)
    .join('\n');

  if (!texto) {
    throw new Error(`Claude no devolvió texto para el plan semanal (stop_reason: ${mensaje.stop_reason})`);
  }

  console.log(
    `🤖 Plan semana ${semana} generado: ${texto.length} caracteres · ` +
    `tokens out: ${mensaje.usage?.output_tokens} · stop: ${mensaje.stop_reason}`,
  );
  return texto;
}
