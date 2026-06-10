import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generarReporte({ nombre, email, birthDate, birthTime, birthPlace, carta }) {
  // Leer el Prompt Maestro
  let promptMaestro = '';
  try {
    const promptPath = path.join(process.cwd(), 'prompts', 'PromptMaestro5.26.9;41pm_Fase2_AKSHA_V2_0.md');
    promptMaestro = fs.readFileSync(promptPath, 'utf8');
  } catch (error) {
    console.log('Prompt maestro no encontrado, usando prompt base');
    promptMaestro = PROMPT_BASE;
  }

  const datosCliente = `
DATOS DEL CLIENTE:
─────────────────────────────────────────
Nombre completo: ${nombre}
Email: ${email}
Fecha de nacimiento: ${birthDate}
Hora de nacimiento: ${birthTime || 'No proporcionada'}
Lugar de nacimiento: ${birthPlace}
─────────────────────────────────────────

${carta.texto}
`;

  const instrucciones = `
Basándote en el Prompt Maestro AKSHA y los datos del cliente arriba, genera un reporte completo de AKSHA LIFE que incluya:

1. Los 4 MÓDULOS IKIGAI:
   - ❤️ PASIÓN — Lo que amas
   - ⭐ PROFESIÓN — En lo que eres bueno
   - ■ VOCACIÓN — Por lo que te pagan
   - ✦ MISIÓN — Lo que el mundo necesita

2. Para cada módulo con puntuación baja incluye:
   - Terapias holísticas recomendadas
   - Bloqueo energético y chakra afectado
   - Recursos AI para acelerar el proceso
   - Cursos y recursos específicos

3. ETAPA DE VIDA ACTIVA y su implicación

4. DONES Y DESAFÍOS de nacimiento

5. SECCIÓN "TU CAMINO REAL CON AI" — recursos específicos por módulo

6. SECCIÓN "EL CONTEXTO GLOBAL" — qué está pasando en el mundo laboral que es relevante para esta persona

IMPORTANTE:
- Usar el nombre: ${nombre}
- Lenguaje cálido, profundo y esperanzador
- NO decir "problema" → usar "desafío" o "reto"
- NO decir "debilidad" → usar "área de crecimiento"
- El reporte debe sonar a reconocimiento, no a descripción técnica
- La persona debe leer y pensar "esto describe algo que ya viví"
`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `${promptMaestro}\n\n${datosCliente}\n\n${instrucciones}`,
      },
    ],
  });

  return message.content[0].text;
}

// Prompt base de respaldo si no encuentra el archivo
const PROMPT_BASE = `Eres AKSHA, sistema experto en Astrología Vocacional y análisis de propósito de vida.
Tu misión es revelar los patrones únicos de cada persona combinando:
- Astrología (Ikigai natal: Pasión, Profesión, Vocación, Misión)
- Contexto de la era de la IA y desplazamiento laboral
- Terapias holísticas para activar módulos bloqueados
- Recursos prácticos de AI para acelerar el proceso de autoconocimiento

Genera análisis profundos, cálidos y orientados a la acción.`;
