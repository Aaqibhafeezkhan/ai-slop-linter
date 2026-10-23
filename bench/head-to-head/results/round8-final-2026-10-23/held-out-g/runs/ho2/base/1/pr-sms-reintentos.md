# Añade reintentos con espera exponencial al envío de SMS

## Resumen

Cuando el proveedor de SMS falla, `avisos-api` ahora reintenta el envío con esperas cada vez más largas en lugar de insistir cada 3 segundos. Con eso se pierden muchos menos mensajes.

## Cambios

- Se añade la función `enviar_con_reintentos()` en `avisos/sms.py`, que reintenta hasta 5 veces con esperas de 2, 4, 8, 16 y 32 segundos.
- Se elimina el reintento fijo de 3 segundos, que podía provocar mensajes duplicados.
- La variable `SMS_MAX_REINTENTOS` pasa a tener 5 como valor por defecto.
- Se añaden 14 pruebas nuevas en `tests/test_sms.py`.

## Resultados

Lo probé en el entorno de preparación el 8 de octubre de 2026:

| Métrica | Antes | Después |
|---|---|---|
| Mensajes perdidos | 2,3 % | 0,1 % |
| Latencia p95 | 4,1 s | 4,4 s |

## Cómo probarlo

Ejecuta `pytest tests/test_sms.py`. Si tienes dudas, coméntalas en el issue #377.
