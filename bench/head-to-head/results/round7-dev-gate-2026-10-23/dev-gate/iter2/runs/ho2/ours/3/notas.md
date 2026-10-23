---
title: Notas de la versión 4.2.0
date: 2026-03-14
tags: [release, facturacion]
---

# Notas de la versión 4.2.0 de Facturalia

## Resumen

Facturalia 4.2.0 ya está disponible. Cambia la exportación a CSV, la validación del campo `nif_cliente` y el tiempo de carga del listado, y añade un endpoint para crear facturas por lotes.

## Novedades

- Ahora se pueden exportar hasta 10.000 facturas a CSV en una sola operación (antes el límite era de 2.500).
- El campo `nif_cliente` ya se valida contra el formato del registro oficial, lo que puede reducir los rechazos.
- El listado de facturas carga en 1,2 segundos en lugar de 4,8 segundos.
- Se ha añadido el endpoint `POST /v2/facturas/lote` para crear facturas por lotes.

## Cambios que requieren atención

La variable `FACTURALIA_TIMEOUT` pasa de 30 a 60 segundos. Quienes la fijen manualmente no necesitan hacer nada.

## Cita de un cliente

> "Hemos reducido el cierre mensual de dos días a una tarde." — Marta Olmedo, Tienda Verde SL

## Actualización

Para actualizar, ejecuta `npm install facturalia@4.2.0`. Más información en https://docs.example.com/facturalia/4.2.0.
