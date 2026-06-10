// Calcula la carta natal llamando a la función Python de Swiss Ephemeris
// (api/calcular_carta.py, desplegada como Serverless Function de Vercel).
// Ya no depende de APIs externas de astrología.

function urlBase() {
  if (process.env.CARTA_API_URL) return process.env.CARTA_API_URL;
  if (process.env.VERCEL_ENV === 'production') return 'https://aksha.life';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function calcularCarta(birthDate, birthTime, birthPlace, opciones = {}) {
  const hoy = new Date().toISOString().slice(0, 10);

  const headers = { 'Content-Type': 'application/json' };
  // Permite llamadas internas cuando la protección de despliegues está activa
  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  }

  const respuesta = await fetch(`${urlBase()}/api/calcular_carta`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fecha: birthDate,
      hora: birthTime || '12:00',
      lugar: birthPlace,
      nombre: opciones.nombre,
      transitos: opciones.transitos || hoy,
      lugar_transitos: opciones.lugarTransitos || 'Miami',
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '');
    console.error('❌ Swiss Ephemeris API falló:', respuesta.status, detalle);
    return cartaFallback(birthDate, birthTime, birthPlace);
  }

  const carta = await respuesta.json();
  console.log('🔭 Carta calculada con', carta.efemerides);
  return carta;
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
