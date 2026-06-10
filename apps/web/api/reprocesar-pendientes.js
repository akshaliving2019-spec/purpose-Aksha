// Red de seguridad del negocio: busca pagos exitosos cuyos reportes NO se
// enviaron (fallo, timeout, deploy a mitad de proceso...) y los reprocesa.
// - Lo invoca el cron diario de Vercel (vercel.json → crons).
// - También se puede invocar a mano:
//     GET  ?dry=1  → solo lista pendientes, no procesa nada
//     POST         → procesa 1 pendiente (cada pipeline tarda ~4 min)
// Si CRON_SECRET está configurado, exige Authorization: Bearer <CRON_SECRET>
// (Vercel lo añade automáticamente a las invocaciones del cron).

import { reprocesarPendientes } from './pipeline-reporte.js';

export default async function handler(req, res) {
  const secreto = process.env.CRON_SECRET;
  if (secreto) {
    const auth = (req.headers['authorization'] || '').replace('Bearer ', '');
    if (auth !== secreto) {
      return res.status(401).json({ error: 'No autorizado' });
    }
  }

  const dryRun = req.query?.dry === '1' || req.query?.dry === 'true';

  try {
    const resultado = await reprocesarPendientes({ maxPedidos: 1, dryRun });
    console.log('🔁 Reprocesamiento:', JSON.stringify(resultado));
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Error reprocesando pendientes:', error);
    return res.status(500).json({ error: String(error) });
  }
}
