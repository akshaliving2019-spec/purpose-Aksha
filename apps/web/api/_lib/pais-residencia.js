// Derivación de país/ciudad de residencia para la Pieza 2 (Profesiones del
// Agente Global). Dos fuentes:
//   1. headers de Vercel (x-vercel-ip-country / x-vercel-ip-city) en el
//      checkout — sin campo de formulario ni cookie. La ciudad puede venir
//      URL-encoded (p. ej. "Bogot%C3%A1").
//   2. respaldo en el pipeline: el país extraído del lugar de nacimiento.
// Lógica pura, sin red: testeable con un script node plano.

// País = último segmento separado por coma del lugar de nacimiento.
// "Bogotá, Colombia" → "Colombia". Sin coma o vacío → '' (no hay respaldo).
export function paisDesdeLugar(lugar) {
  const partes = String(lugar || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return partes.length >= 2 ? partes[partes.length - 1] : '';
}

// Normaliza los headers de IP: decodifica %XX, recorta y devuelve '' cuando
// faltan. Una decodificación inválida no rompe: se conserva el valor crudo.
function decodificarSeguro(valor) {
  const crudo = String(valor || '').trim();
  if (!crudo) return '';
  try {
    return decodeURIComponent(crudo);
  } catch {
    return crudo;
  }
}

export function normalizarPaisCiudad(ciudad, pais) {
  return {
    ciudad: decodificarSeguro(ciudad),
    pais: decodificarSeguro(pais),
  };
}
