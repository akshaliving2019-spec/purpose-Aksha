// Registro de productos AKSHA: cada producto tiene su propio prompt de
// sistema y su constructor de mensaje. El producto del pedido viaja en la
// metadata del PaymentIntent (campo "producto"); si falta, se usa fase2
// (el Mapa de Propósito actual), así los pedidos existentes no cambian.
//
// Para integrar una fase nueva: extraer su prompt maestro (los PDFs de
// /prompts), crear el módulo en _lib/ y registrarla aquí. NUNCA registrar
// un prompt sin validarlo con la revisora (modo revisión + caso Nydia).

import { PROMPT_SISTEMA_AKSHA, construirMensajeCliente } from './prompt-aksha.js';

export const PRODUCTOS = {
  fase2: {
    id: 'fase2',
    nombre: 'Mapa de Propósito (Fase 2 — tránsitos)',
    promptSistema: PROMPT_SISTEMA_AKSHA,
    construirMensaje: construirMensajeCliente,
  },
  // fase0, fase1, fase3, ikigai: pendientes de extraer de /prompts (PDFs)
  // y de validar con la dueña antes de venderse.
};

export function obtenerProducto(id) {
  return PRODUCTOS[id] || PRODUCTOS.fase2;
}
