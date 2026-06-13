// Cupones de lanzamiento AKSHA. Viven en código (no como promotion codes del
// dashboard) porque el checkout usa PaymentIntents, donde los promotion codes
// de Stripe no se canjean solos. El tope de usos se hace cumplir contando en
// Stripe los pedidos que llevan el cupón en su metadata:
//   - pago con descuento: PaymentIntent con status succeeded
//   - regalo 100%: PaymentIntent marcado cupon_gratis='1' (nunca se confirma
//     ni se cobra; es el registro del pedido y el pipeline corre igual)
// La búsqueda de Stripe tiene consistencia eventual (~1 min): dos canjes en el
// mismo minuto podrían colar un uso de más; aceptable para códigos de
// lanzamiento con tope de 15.

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PRECIO_BASE_CENTAVOS = 4700;

export const CUPONES = {
  'AKSHA100-T4KP': { pct: 100, maxUsos: 15 },
  'AKSHA20-R7MX': { pct: 20, maxUsos: 15 },
};

export function normalizarCupon(codigo) {
  return String(codigo || '').trim().toUpperCase();
}

export function precioConCupon(pct) {
  return Math.round((PRECIO_BASE_CENTAVOS * (100 - pct)) / 100);
}

// Pedidos que ya canjearon el cupón (pagados, o regalos 100% ya emitidos).
// El código llega aquí ya verificado contra CUPONES (literal nuestro), nunca
// texto libre del cliente: sin riesgo de inyección en el query de búsqueda.
async function pedidosConCupon(codigo) {
  const usados = [];
  let pagina;
  do {
    pagina = await stripe.paymentIntents.search({
      query: `metadata['cupon']:'${codigo}'`,
      limit: 100,
      ...(pagina?.next_page ? { page: pagina.next_page } : {}),
    });
    for (const pi of pagina.data) {
      if (pi.status === 'succeeded' || pi.metadata?.cupon_gratis === '1') usados.push(pi);
    }
  } while (pagina.has_more && pagina.next_page);
  return usados;
}

// Valida código y cupo restante. Con email, además impide que el mismo email
// canjee dos veces el cupón gratis. Si Stripe no responde, el error se
// propaga y el endpoint rechaza (fail closed): mejor pedir reintento que
// regalar usos de más.
export async function validarCupon(codigo, { email } = {}) {
  const code = normalizarCupon(codigo);
  const def = CUPONES[code];
  if (!def) return { valido: false, motivo: 'no_existe' };

  const usos = await pedidosConCupon(code);
  if (usos.length >= def.maxUsos) return { valido: false, motivo: 'agotado' };

  if (def.pct === 100 && email) {
    const emailNorm = String(email).trim().toLowerCase();
    if (usos.some((pi) => (pi.metadata?.customer_email || '').toLowerCase() === emailNorm)) {
      return { valido: false, motivo: 'ya_usado' };
    }
  }

  return { valido: true, codigo: code, pct: def.pct, usados: usos.length, maxUsos: def.maxUsos };
}

export function mensajeCuponInvalido(motivo, idioma) {
  const es = idioma !== 'en';
  if (motivo === 'agotado') {
    return es
      ? 'Este cupón ya alcanzó su límite de usos.'
      : 'This coupon has reached its redemption limit.';
  }
  if (motivo === 'ya_usado') {
    return es
      ? 'Este cupón ya fue canjeado con este email.'
      : 'This coupon was already redeemed with this email.';
  }
  return es ? 'Cupón no válido.' : 'Invalid coupon code.';
}
