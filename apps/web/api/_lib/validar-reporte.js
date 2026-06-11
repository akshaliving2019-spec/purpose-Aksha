// Validación automática del reporte generado contra la carta Swiss Ephemeris.
// Lineamiento AKSHA: ningún reporte puede afirmar una posición (planeta en
// signo o en casa, ASC/MC) que no coincida con el cálculo verificado. Las
// posiciones de tránsito del día también cuentan como válidas, porque el
// reporte las interpreta en su sección de tránsitos.
//
// El chequeo es deliberadamente estricto en patrones ("X en Signo", "X en la
// Casa N") para no dar falsos positivos con lenguaje interpretativo libre.

const SIGNOS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis',
];

function normalizar(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const SIGNOS_NORM = SIGNOS.map(normalizar);

// Casa Placidus de una longitud eclíptica dada (mismo algoritmo que index.py)
function casaDe(longitud, cuspides) {
  const lon = ((longitud % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const c1 = ((cuspides[i] % 360) + 360) % 360;
    const c2 = ((cuspides[(i + 1) % 12] % 360) + 360) % 360;
    if (c1 <= c2) {
      if (c1 <= lon && lon < c2) return i + 1;
    } else if (lon >= c1 || lon < c2) {
      return i + 1;
    }
  }
  return 0;
}

// Consolida qué signos y casas son válidos para cada punto de la carta
// (posición natal + posición de tránsito si existe).
function construirPuntos(carta) {
  const puntos = new Map(); // nombreNorm -> { etiqueta, signos:Set, casas:Set }

  const agregar = (nombre, signo, casa) => {
    const clave = normalizar(nombre);
    if (!puntos.has(clave)) {
      puntos.set(clave, { etiqueta: nombre, signos: new Set(), casas: new Set() });
    }
    const p = puntos.get(clave);
    if (signo) p.signos.add(normalizar(signo));
    if (casa) p.casas.add(Number(casa));
  };

  for (const p of carta.planetas || []) agregar(p.nombre, p.signo, p.casa);
  for (const p of carta.asteroides || []) agregar(p.nombre, p.signo, p.casa);
  for (const p of carta.puntos_adicionales || []) agregar(p.nombre, p.signo, p.casa);
  for (const e of carta.estrellas_fijas || []) agregar(e.nombre, e.signo, null);

  const cuspides = Object.values(carta.cuspides_casas || {});
  for (const t of carta.transitos?.posiciones || []) {
    const casaTransito = cuspides.length === 12 ? casaDe(t.longitud, cuspides) : null;
    agregar(t.nombre, t.signo, casaTransito);
  }

  if (carta.ascendente?.signo) {
    agregar('Ascendente', carta.ascendente.signo, null);
    agregar('ASC', carta.ascendente.signo, null);
  }
  if (carta.medio_cielo?.signo) {
    agregar('Medio Cielo', carta.medio_cielo.signo, null);
    agregar('MC', carta.medio_cielo.signo, null);
  }
  return puntos;
}

export function validarReporte(reporte, carta) {
  if (!reporte || !carta || carta.fallback || !Array.isArray(carta.planetas)) {
    return {
      ok: false,
      errores: ['Carta no verificable: sin datos de Swiss Ephemeris (fallback o respuesta incompleta).'],
    };
  }

  const texto = normalizar(reporte);
  const puntos = construirPuntos(carta);
  const errores = [];
  const grupoSignos = SIGNOS_NORM.join('|');

  for (const [clave, punto] of puntos) {
    // "Júpiter en Aries", "Luna natal en Escorpio", "Sol está en el signo de Leo",
    // "Venus a 26° de Cáncer"
    const patronSigno = new RegExp(
      `\\b${clave}(?:\\s+natal)?(?:\\s+retrogrado|\\s+rx)?` +
      `(?:\\s+esta|\\s+ubicad[oa])?\\s+(?:en|a)\\s+` +
      `(?:el\\s+|la\\s+|tu\\s+)?(?:signo\\s+de\\s+)?(?:\\d{1,2}[°º]\\s*(?:\\d{1,2}'?)?\\s*(?:de\\s+)?)?` +
      `(${grupoSignos})\\b`,
      'g',
    );
    for (const m of texto.matchAll(patronSigno)) {
      if (!punto.signos.has(m[1])) {
        errores.push(
          `${punto.etiqueta} mencionado en ${m[1]} — la carta dice ${[...punto.signos].join(' / ') || '(sin posición)'}.`,
        );
      }
    }

    // "Sol en la Casa 8", "Luna ... Casa 10" (ventana corta sin otro punto en medio)
    const patronCasa = new RegExp(`\\b${clave}\\b([^.;\\n]{0,45}?)\\bcasa\\s+(\\d{1,2})\\b`, 'g');
    for (const m of texto.matchAll(patronCasa)) {
      const otroEnMedio = [...puntos.keys()].some(
        (otro) => otro !== clave && new RegExp(`\\b${otro}\\b`).test(m[1]),
      );
      if (otroEnMedio) continue;
      if (punto.casas.size > 0 && !punto.casas.has(Number(m[2]))) {
        errores.push(
          `${punto.etiqueta} mencionado en Casa ${m[2]} — la carta dice Casa ${[...punto.casas].join(' / ')}.`,
        );
      }
    }
  }

  return { ok: errores.length === 0, errores };
}
