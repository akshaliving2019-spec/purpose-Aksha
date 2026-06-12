// Motor alternativo sin API key: invoca el CLI de Claude Code en modo
// headless (claude -p), que usa la sesión ya iniciada en esta máquina
// (plan de suscripción, no facturación por API). La investigación web usa
// las herramientas WebSearch/WebFetch del propio Claude Code.
//
// El system prompt se pasa por archivo (--system-prompt-file) y el prompt
// de usuario por stdin: así no hay límite de longitud de línea de comandos
// en Windows. --output-format json devuelve un sobre {result, is_error}.
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

export function consultarClaudeCode({
  systemFile,
  prompt,
  permitirWeb = false,
  timeoutMs = 25 * 60 * 1000,
}) {
  return new Promise((resolve, reject) => {
    const args = [
      '-p',
      '--output-format', 'json',
      '--no-session-persistence',
      '--system-prompt-file', systemFile,
    ];
    if (permitirWeb) args.push('--allowedTools', 'WebSearch WebFetch');

    // cwd en agente-global/ para que el CLI no cargue contexto del monorepo.
    const proceso = spawn('claude', args, { cwd: RAIZ, windowsHide: true });

    let stdout = '';
    let stderr = '';
    proceso.stdout.on('data', (d) => { stdout += d; });
    proceso.stderr.on('data', (d) => { stderr += d; });

    const temporizador = setTimeout(() => {
      proceso.kill();
      reject(new Error(`claude -p superó el tiempo límite (${Math.round(timeoutMs / 60000)} min).`));
    }, timeoutMs);

    proceso.on('error', (err) => {
      clearTimeout(temporizador);
      reject(new Error(`No se pudo ejecutar el CLI de Claude Code: ${err.message}`));
    });

    proceso.on('close', (codigo) => {
      clearTimeout(temporizador);
      let sobre;
      try {
        sobre = JSON.parse(stdout);
      } catch {
        return reject(new Error(
          `Salida no parseable de claude -p (código ${codigo}): ${(stderr || stdout).slice(0, 400)}`,
        ));
      }
      if (sobre.is_error || codigo !== 0) {
        return reject(new Error(`claude -p devolvió error: ${String(sobre.result).slice(0, 400)}`));
      }
      resolve({ texto: sobre.result, usage: sobre.usage || null });
    });

    proceso.stdin.write(prompt);
    proceso.stdin.end();
  });
}

// Sin salida estructurada forzada en el CLI, el JSON llega como texto y
// puede venir envuelto en explicaciones o cercos de código.
export function extraerJson(texto) {
  const t = String(texto || '');
  const inicio = t.indexOf('{');
  const fin = t.lastIndexOf('}');
  if (inicio === -1 || fin <= inicio) {
    throw new Error('La respuesta no contiene un objeto JSON.');
  }
  return JSON.parse(t.slice(inicio, fin + 1));
}
