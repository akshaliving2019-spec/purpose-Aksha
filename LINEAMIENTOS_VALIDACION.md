# Lineamientos de validación astrológica — AKSHA LIFE

Reglas que el software aplica automáticamente para que ningún reporte salga
con datos astrológicos incorrectos. Vigentes desde junio 2026.

## 1. Sin efemérides verificadas no hay reporte
Toda carta natal se calcula con **Swiss Ephemeris** (microservicio
`aksha-carta`, `apps/carta-service/api/index.py`): casas Placidus, aspectos
con orbes AKSHA, tránsitos del día. Si el motor no responde tras 3 intentos,
el pedido queda **fallido** y el cron diario lo reintenta (máx. 3 veces) —
**nunca** se le pide a la IA que calcule posiciones por su cuenta
(`apps/web/api/calcular-carta.js`).

## 2. La IA interpreta, no calcula
El prompt recibe la carta ya calculada como texto verificado y tiene
prohibido declarar aspectos fuera de la tabla. Los asteroides (Ceres, Pallas,
Juno, Vesta) se incluyen con posición, signo y casa, pero **fuera** de la
tabla de aspectos: el semáforo y la "Libertad aspectual" están calibrados con
los 12 puntos clásicos.

## 3. Validación automática del texto generado
Antes de cualquier envío, `apps/web/api/validar-reporte.js` compara el
reporte contra la carta:
- Cada "**planeta en signo**" mencionado debe coincidir con la posición natal
  **o** la de tránsito del día (ambas son legítimas en el reporte).
- Cada "**planeta en Casa N**" debe coincidir con la casa natal o la casa
  natal que el tránsito ocupa.
- **Ascendente** y **Medio Cielo** solo admiten su signo natal.
- Una carta en fallback o incompleta **nunca** valida.

Consecuencias:
- **Envío directo**: una discrepancia bloquea el email al cliente; el pedido
  queda fallido con el detalle del error y el cron lo reintenta con una
  generación nueva.
- **Modo revisión**: el reporte llega a la revisora con la lista de
  discrepancias en rojo (o el ✅ de validación) para decidir antes de aprobar.

Test de regresión: `node tools/test-validar-reporte.mjs <carta.json>`
(desde `apps/web`; el JSON sale del microservicio o del CLI Python).

## 4. Modo revisión (primeros ~30 reportes)
Mientras `REVISION_EMAIL` esté configurada en Vercel, ningún reporte va
directo al cliente: la revisora recibe el texto completo con el resultado de
la validación y un botón "Aprobar y enviar" (`/api/aprobar-reporte`, link
firmado con HMAC). El cliente recibe exactamente la versión aprobada.
Para volver al envío directo, eliminar `REVISION_EMAIL`.

## 5. Ciclo de mejora continua
El sistema no "aprende solo": mejora con las observaciones de la revisora,
que quedan registradas y se incorporan de forma controlada.
- El email de revisión tiene dos botones: **"✅ Aprobar y enviar"** y
  **"✍️ Observaciones / Rechazar"** (`/api/feedback-reporte`, link firmado).
- El formulario registra área(s) a mejorar + descripción. Cada entrada se
  guarda en el **registro de mejoras** (Vercel Blob, prefijo `mejoras/`) y se
  avisa a Purpose@aksha.life.
- Si se marca "regenerar", el reporte se vuelve a generar **incorporando las
  observaciones** (sin mencionarlas) y llega de nuevo a revisión.
- Cada cierto número de reportes, las entradas del registro se revisan y las
  recurrentes se convierten en reglas permanentes del prompt maestro
  (`apps/web/api/prompt-aksha.js`) o del validador. Así cada corrección de la
  revisora mejora TODOS los reportes futuros.
- Registro acumulado: `/api/feedback-reporte?listar=1&token=<HMAC de
  "listado-mejoras" con REVISION_SECRET>`.

## 6. Caso de referencia
Nydia Edith Castro Bermúdez (28/07/1963 16:00 Bogotá): Sol 05°03' Leo C8,
Luna 08°36' Escorpio C10, ASC 04°18' Capricornio, MC 07°20' Libra,
Júpiter 19°15' **Aries** C4 (la referencia manual decía "Capricornio" — el
validador detecta y bloquea exactamente ese tipo de error).
