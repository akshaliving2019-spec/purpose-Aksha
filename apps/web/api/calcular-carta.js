// Calcula la carta natal llamando al microservicio Python de Swiss Ephemeris
// (proyecto Vercel "aksha-carta", código en apps/carta-service).
// Ya no depende de APIs externas de astrología.

const CARTA_ENDPOINT =
  process.env.CARTA_API_URL || 'https://aksha-carta.vercel.app/api/index';

// Secreto compartido con el microservicio (CARTA_SHARED_SECRET en ambos
// proyectos de Vercel). Si está configurado, se envía como Bearer token.
const CARTA_SECRET = (process.env.CARTA_SHARED_SECRET || '').trim();

export async function calcularCarta(birthDate, birthTime, birthPlace, opciones = {}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const cuerpo = JSON.stringify({
    fecha: birthDate,
    hora: birthTime || '12:00',
    lugar: birthPlace,
    nombre: opciones.nombre,
    transitos: opciones.transitos || hoy,
    lugar_transitos: opciones.lugarTransitos || 'Miami',
  });

  for (let intento = 1; intento <= 3; intento++) {
    try {
      const respuesta = await fetch(CARTA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(CARTA_SECRET ? { Authorization: `Bearer ${CARTA_SECRET}` } : {}),
        },
        body: cuerpo,
      });
      if (respuesta.ok) {
        const carta = await respuesta.json();
        console.log('🔭 Carta calculada con', carta.efemerides);
        return carta;
      }
      const detalle = await respuesta.text().catch(() => '');
      // 400 = datos de nacimiento inválidos; reintentar no lo arregla
      if (respuesta.status < 500) {
        throw new Error(`Carta inválida (${respuesta.status}): ${detalle}`);
      }
      console.warn(`Swiss Ephemeris ${respuesta.status}, reintento ${intento}/3...`);
    } catch (error) {
      if (String(error).startsWith('Error: Carta inválida')) throw error;
      console.warn(`Swiss Ephemeris no respondió (intento ${intento}/3):`, String(error));
    }
    await new Promise((r) => setTimeout(r, intento * 2000));
  }

  console.error('❌ Swiss Ephemeris agotó reintentos — usando fallback');
  return cartaFallback(birthDate, birthTime, birthPlace);
}

// Respaldo si la función Python no responde: Claude recibe los datos crudos
// y la instrucción de calcular posiciones (menos preciso — solo emergencia).
function cartaFallback(birthDate, birthTime, birthPlace) {
  return {
    texto: `DATOS DE NACIMIENTO PARA ANÁLISIS ASTROLÓGICO
─────────────────────────────────────────
Fecha: ${birthDate}
Hora: ${birthTime || 'No proporcionada'}
Lugar: ${birthPlace}
─────────────────────────────────────────
NOTA: El motor Swiss Ephemeris no respondió. Calcular posiciones planetarias
aproximadas para esta fecha y hora, indicando en el reporte que los grados
exactos serán confirmados.`,
    fallback: true,
  };
}
