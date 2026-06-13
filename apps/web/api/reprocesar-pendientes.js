// Red de seguridad del negocio: busca pagos exitosos cuyos reportes NO se
// enviaron (fallo, timeout, deploy a mitad de proceso...) y los reprocesa.
// - Lo invoca el cron diario de Vercel (vercel.json → crons).
// - También se puede invocar a mano:
//     GET  ?dry=1           → solo lista pendientes, no procesa nada
//     POST                  → procesa 1 pendiente (cada pipeline tarda ~4 min)
//     POST ?id=pi_xxx       → procesa ese pedido específico (respeta estado)
//     POST ?id=pi_xxx&forzar=1 → lo procesa ignorando estado e intentos
//       (rescate de pedidos viejos fuera de la ventana de 3 días del cron,
//       p. ej. los afectados por el bug de birth_time='Not provided')
// Exige Authorization: Bearer <CRON_SECRET> (Vercel lo añade automáticamente
// a las invocaciones del cron). Sin CRON_SECRET configurado el endpoint se
// bloquea: la respuesta dry incluye nombres y emails de clientes y no puede
// quedar abierta al público.

import { timingSafeEqual } from 'node:crypto';
import { procesarPedido, reprocesarPendientes } from './_lib/pipeline-reporte.js';

function tokenValido(recibido, esperado) {
  const a = Buffer.from(String(recibido));
  const b = Buffer.from(String(esperado));
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) {
    console.error('❌ CRON_SECRET no configurado — endpoint bloqueado');
    return res.status(503).json({ error: 'Servicio no configurado' });
  }
  const auth = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!tokenValido(auth, secreto)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const dryRun = req.query?.dry === '1' || req.query?.dry === 'true';
  const id = req.query?.id;
  const forzar = req.query?.forzar === '1' || req.query?.forzar === 'true';

  try {
    if (id) {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Reprocesar por id requiere POST' });
      }
      if (!/^pi_[A-Za-z0-9]+$/.test(id)) {
        return res.status(400).json({ error: 'id inválido (se espera pi_...)' });
      }
      const resultado = await procesarPedido(id, { forzar });
      console.log(`🔁 Reproceso manual de ${id} (forzar=${forzar}):`, JSON.stringify(resultado));
      return res.status(200).json({ id, forzar, ...resultado });
    }

    const resultado = await reprocesarPendientes({ maxPedidos: 1, dryRun });
    console.log('🔁 Reprocesamiento:', JSON.stringify(resultado));
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Error reprocesando pendientes:', error);
    return res.status(500).json({ error: String(error) });
  }
}
