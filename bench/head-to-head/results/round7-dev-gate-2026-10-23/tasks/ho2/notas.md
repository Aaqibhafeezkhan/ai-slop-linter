---
title: Notas de la versión 4.2.0
date: 2026-03-14
tags: [release, facturacion]
---

# Notas de la versión 4.2.0 de Facturalia

¡Claro! Aquí tienes unas notas de la versión completas y bien estructuradas.

## Resumen

Nos complace anunciar el lanzamiento de la versión 4.2.0 de Facturalia, una actualización clave que revoluciona la forma de emitir facturas. En el panorama actual, cada vez más empresas necesitan una solución robusta y sin fisuras — y esta versión la ofrece.

## Novedades

- Una experiencia de exportación totalmente renovada: ahora se pueden exportar hasta 10.000 facturas a CSV en una sola operación (antes el límite era de 2.500).
- Es importante destacar que el campo `nif_cliente` ya se valida contra el formato del registro oficial, lo que podría reducir los rechazos.
- Se ha mejorado significativamente el rendimiento: el listado de facturas carga en 1,2 segundos en lugar de 4,8 segundos.
- Se ha añadido el endpoint `POST /v2/facturas/lote` para crear facturas por lotes.

## Cambios que requieren atención

La variable `FACTURALIA_TIMEOUT` pasa de 30 a 60 segundos. Cabe destacar que quienes la fijen manualmente no necesitan hacer nada.

## Cita de un cliente

> "Hemos reducido el cierre mensual de dos días a una tarde." — Marta Olmedo, Tienda Verde SL

## Actualización

Para actualizar, ejecuta `npm install facturalia@4.2.0`. Más información en https://docs.example.com/facturalia/4.2.0. En definitiva, esta versión marca un antes y un después. ¡No dudes en contactarnos si tienes alguna pregunta!
