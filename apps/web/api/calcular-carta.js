// Calcula la carta natal llamando al microservicio Python de Swiss Ephemeris
// (proyecto Vercel "aksha-carta", código en apps/carta-service).
// Ya no depende de APIs externas de astrología.

const CARTA_ENDPOINT =
  process.env.CARTA_API_URL || 'https://aksha-carta.vercel.app/api/index';

export async function calcularCarta(birthDate, birthTime, birthPlace, opciones = {}) {
  const hoy = new Date().toISOString().slice(0, 10);

  const respuesta = await fetch(CARTA_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
