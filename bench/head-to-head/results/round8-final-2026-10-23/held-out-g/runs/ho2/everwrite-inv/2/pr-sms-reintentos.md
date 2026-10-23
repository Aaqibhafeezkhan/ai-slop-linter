# Añade reintentos con espera exponencial al envío de SMS

## Resumen

Cuando el proveedor de SMS falla, `avisos-api` ahora reintenta el envío con esperas cada vez más largas en lugar de rendirse o repetir a intervalo fijo.

## Cambios

- Se añade la función `enviar_con_reintentos()` en `avisos/sms.py`. Reintenta hasta 5 veces, con esperas de 2, 4, 8, 16 y 32 segundos.
- Se elimina el reintento fijo de 3 segundos, que podía provocar mensajes duplicados.
- La variable `SMS_MAX_REINTENTOS` pasa a valer 5 por defecto.
- Se añaden 14 pruebas nuevas en `tests/test_sms.py`.

## Resultados

Probado en el entorno de preparación el 8 de octubre de 2026:

| Métrica | Antes | Después |
|---|---|---|
| Mensajes perdidos | 2,3 % | 0,1 % |
| Latencia p95 | 4,1 s | 4,4 s |

Los mensajes perdidos bajan mucho. A cambio, la latencia p95 sube 0,3 s.

## Cómo probarlo

Ejecuta `pytest tests/test_sms.py`. Las dudas, en el issue #377.
