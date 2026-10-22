---
title: Notas de la versión 4.2.0
date: 2026-03-14
tags: [release, facturacion]
---

# Notas de la versión 4.2.0 de Facturalia

## Resumen

La versión 4.2.0 de Facturalia cambia la exportación, la validación del NIF y la velocidad del listado, y añade la creación de facturas por lotes.

## Novedades

- Se pueden exportar hasta 10.000 facturas a CSV de una vez. Antes el límite era de 2.500.
- El campo `nif_cliente` ya se valida contra el formato del registro oficial, así que debería haber menos rechazos.
- El listado de facturas carga en 1,2 segundos. Antes tardaba 4,8.
- Nuevo endpoint `POST /v2/facturas/lote` para crear facturas por lotes.

## Cambios que requieren atención

La variable `FACTURALIA_TIMEOUT` pasa de 30 a 60 segundos. Si ya la fijas a mano, no tienes que hacer nada.

## Cita de un cliente

> "Hemos reducido el cierre mensual de dos días a una tarde." — Marta Olmedo, Tienda Verde SL

## Actualización

Para actualizar, ejecuta `npm install facturalia@4.2.0`. Más información en https://docs.example.com/facturalia/4.2.0.
