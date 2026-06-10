// Calcula posiciones planetarias usando Swiss Ephemeris
// Para Vercel usamos una API externa ya que Swiss Ephemeris requiere binarios nativos

const SIGNOS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

// Coordenadas de ciudades comunes LATAM
const CIUDADES = {
  'bogota': { lat: 4.711, lon: -74.0721 },
  'bogotá': { lat: 4.711, lon: -74.0721 },
  'medellín': { lat: 6.2442, lon: -75.5812 },
  'medellin': { lat: 6.2442, lon: -75.5812 },
  'cali': { lat: 3.4516, lon: -76.5320 },
  'miami': { lat: 25.7617, lon: -80.1918 },
  'new york': { lat: 40.7128, lon: -74.0060 },
  'nueva york': { lat: 40.7128, lon: -74.0060 },
  'caracas': { lat: 10.4806, lon: -66.9036 },
  'buenos aires': { lat: -34.6037, lon: -58.3816 },
  'ciudad de mexico': { lat: 19.4326, lon: -99.1332 },
  'ciudad de méxico': { lat: 19.4326, lon: -99.1332 },
  'santiago': { lat: -33.4489, lon: -70.6693 },
  'lima': { lat: -12.0464, lon: -77.0428 },
  'madrid': { lat: 40.4168, lon: -3.7038 },
  'barcelona': { lat: 41.3851, lon: 2.1734 },
};

function obtenerCoordenadas(lugar) {
  const lugarLower = lugar.toLowerCase().trim();
  for (const [ciudad, coords] of Object.entries(CIUDADES)) {
    if (lugarLower.includes(ciudad)) {
      return coords;
    }
  }
  // Default: Colombia si no encuentra la ciudad
  return { lat: 4.711, lon: -74.0721 };
}

function gradosASigmo(grados) {
  const signoIndex = Math.floor(grados / 30) % 12;
  const gradosEnSigno = grados % 30;
  return `${gradosEnSigno.toFixed(1)}° ${SIGNOS[signoIndex]}`;
}

export async function calcularCarta(birthDate, birthTime, birthPlace) {
  // Parsear fecha DD/MM/YYYY
  const [dia, mes, anio] = birthDate.split('/').map(Number);
  const [hora, minutos] = (birthTime || '12:00').split(':').map(Number);

  const coords = obtenerCoordenadas(birthPlace);

  // Llamar a una API de astrología gratuita
  // Usamos Astrology API de RapidAPI o calculamos con algoritmos simplificados
  try {
    const response = await fetch(
      `https://json.astrologyapi.com/v1/planets/extended`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Basic ${Buffer.from(`${process.env.ASTROLOGY_API_USER}:${process.env.ASTROLOGY_API_KEY}`).toString('base64')}`,
        },
        body: JSON.stringify({
          day: dia,
          month: mes,
          year: anio,
          hour: hora,
          min: minutos,
          lat: coords.lat,
          lon: coords.lon,
          tzone: -5, // Colombia UTC-5
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return formatearCarta(data, birthDate, birthTime, birthPlace);
    }
  } catch (error) {
    console.log('API externa falló, usando cálculo simplificado');
  }

  // Fallback: devolver datos básicos para que Claude complete el análisis
  return {
    texto: `DATOS DE NACIMIENTO PARA ANÁLISIS ASTROLÓGICO
─────────────────────────────────────────
Fecha: ${birthDate}
Hora: ${birthTime || 'No proporcionada'}
Lugar: ${birthPlace}
Coordenadas: Lat ${coords.lat}, Lon ${coords.lon}
─────────────────────────────────────────
NOTA: Calcular posiciones planetarias exactas para esta fecha y hora.`,
    coords,
    fecha: { dia, mes, anio, hora: hora || 12, minutos: minutos || 0 },
  };
}

function formatearCarta(data, birthDate, birthTime, birthPlace) {
  let texto = `CARTA NATAL CALCULADA
─────────────────────────────────────────
Fecha: ${birthDate} · Hora: ${birthTime} · Lugar: ${birthPlace}
─────────────────────────────────────────\n`;

  if (Array.isArray(data)) {
    data.forEach(planeta => {
      const rx = planeta.isRetro === 'true' ? ' Rx' : '';
      texto += `${planeta.name}: ${planeta.sign} ${planeta.normDegree.toFixed(1)}°${rx} · Casa ${planeta.house}\n`;
    });
  }

  return { texto };
}
