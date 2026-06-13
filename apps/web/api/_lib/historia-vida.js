// La historia de vida viaja en la metadata del PaymentIntent troceada en
// historia_vida_1..N (Stripe limita cada valor a 500 caracteres); el pipeline
// la rearma. Compartido por create-payment-intent (pedidos que aún la traen)
// y agregar-historia (formulario post-pago en la página de gracias).

export function trocearHistoria(historiaVida) {
  const historia = (historiaVida || '').trim();
  const metadata = {};
  for (let inicio = 0, n = 1; inicio < historia.length; n++) {
    let fin = Math.min(inicio + 450, historia.length);
    // No partir un par sustituto (emoji) en el borde del trozo
    if (fin < historia.length && /[\uD800-\uDBFF]/.test(historia[fin - 1])) fin--;
    metadata[`historia_vida_${n}`] = historia.slice(inicio, fin);
    inicio = fin;
  }
  return metadata;
}

// Ventana tras crear el pedido para que el cliente añada su historia en
// /thank-you antes de que el pipeline arranque solo. El formulario (enviar u
// omitir) lo dispara al instante; si cierra la pestaña, al expirar la ventana
// el cron diario lo procesa sin historia.
export const GRACIA_HISTORIA_MS = 45 * 60 * 1000;
