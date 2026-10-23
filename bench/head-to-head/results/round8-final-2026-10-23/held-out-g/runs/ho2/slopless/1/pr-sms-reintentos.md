# Añade reintentos con espera exponencial al envío de SMS

## Resumen

Cuando el proveedor de SMS falla, `avisos-api` reintentaba una sola vez a los 3 segundos y se daba por vencido. Esta PR cambia eso: ahora reintenta varias veces y espera más cada vez.

## Cambios

- Se añade `enviar_con_reintentos()` en `avisos/sms.py`. Reintenta hasta 5 veces, con esperas de 2, 4, 8, 16 y 32 segundos.
- Se elimina el reintento fijo de 3 segundos, que podía provocar mensajes duplicados.
- `SMS_MAX_REINTENTOS` pasa a valer 5 por defecto.
- Se añaden 14 pruebas nuevas en `tests/test_sms.py`.

## Resultados

Lo probé en el entorno de preparación el 8 de octubre de 2026:

| Métrica | Antes | Después |
|---|---|---|
| Mensajes perdidos | 2,3 % | 0,1 % |
| Latencia p95 | 4,1 s | 4,4 s |

Se pierden bastantes menos mensajes y la latencia p95 sube apenas 0,3 s.

## Cómo probarlo

Ejecuta `pytest tests/test_sms.py`. Si tienes dudas, coméntalas en el issue #377.
