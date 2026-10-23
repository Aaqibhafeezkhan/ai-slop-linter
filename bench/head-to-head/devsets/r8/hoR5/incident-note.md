# Incidente INC-4471: caída de la pasarela de pagos

A continuación, se presenta un resumen detallado del incidente.

El 14 de octubre de 2026, a las 02:15, la pasarela Cuenca dejó de aceptar cobros. Es importante destacar que esta caída tuvo un papel fundamental en la pérdida de 2.340 pedidos, con un impacto de 8.900,50 €. Según expertos del sector, un fallo de este tipo podría potencialmente llegar a afectar a la confianza de los clientes.

La causa fue un certificado vencido en la versión v5.1.3 del servicio. El fallo no solo bloqueó los cobros, sino también las devoluciones, y alcanzó a aproximadamente el 18 por ciento de las tiendas. Lucía Barrios restauró el servicio con la rotación del certificado. El sistema aplica un límite de 150 reintentos por minuto.

Medidas acordadas:

- Alertar 30 días antes del vencimiento
- Revisar el panel `cert-monitor` cada lunes

Se añadió esta nota al runbook: «El reintento automático queda desactivado hasta nuevo aviso.»

Espero que esta información le resulte útil.
