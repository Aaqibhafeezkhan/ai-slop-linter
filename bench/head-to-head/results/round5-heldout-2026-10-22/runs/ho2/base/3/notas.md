---
title: Notas de la versión 4.2.0
date: 2026-03-14
tags: [release, facturacion]
---

# Notas de la versión 4.2.0 de Facturalia

## Resumen

Ya está disponible la versión 4.2.0 de Facturalia. Trae una exportación más generosa, una validación de NIF más estricta y un listado de facturas bastante más rápido.

## Novedades

- Exportación a CSV: ahora se pueden exportar hasta 10.000 facturas en una sola operación (antes el límite era de 2.500).
- El campo `nif_cliente` se valida contra el formato del registro oficial, lo que debería reducir los rechazos.
- El listado de facturas carga en 1,2 segundos en lugar de 4,8 segundos.
- Nuevo endpoint `POST /v2/facturas/lote` para crear facturas por lotes.

## Cambios que requieren atención

La variable `FACTURALIA_TIMEOUT` pasa de 30 a 60 segundos. Si ya la fijas a mano, no tienes que hacer nada.

## Cita de un cliente

> "Hemos reducido el cierre mensual de dos días a una tarde." — Marta Olmedo, Tienda Verde SL

## Actualización

Para actualizar, ejecuta `npm install facturalia@4.2.0`. Tienes más información en https://docs.example.com/facturalia/4.2.0. Si tienes alguna duda, escríbenos.
