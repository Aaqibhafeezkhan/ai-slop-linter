# Añade reintentos con espera exponencial al envío de SMS

## Resumen

Cuando el proveedor de SMS fallaba, `avisos-api` perdía mensajes. Con esta PR reintenta el envío, esperando cada vez más entre un intento y el siguiente.

## Cambios

- Nueva función `enviar_con_reintentos()` en `avisos/sms.py`. Reintenta hasta 5 veces, con esperas de 2, 4, 8, 16 y 32 segundos.
- Elimino el reintento fijo de 3 segundos, que podía provocar mensajes duplicados.
- `SMS_MAX_REINTENTOS` pasa a valer 5 por defecto.
- 14 pruebas nuevas en `tests/test_sms.py`.

## Resultados

Lo probé en el entorno de preparación el 8 de octubre de 2026:

| Métrica | Antes | Después |
|---|---|---|
| Mensajes perdidos | 2,3 % | 0,1 % |
| Latencia p95 | 4,1 s | 4,4 s |

Se pierden muchos menos mensajes, a cambio de 0,3 s más de latencia p95.

## Cómo probarlo

Ejecuta `pytest tests/test_sms.py`. Si tienes dudas, escríbelas en el issue #377.
