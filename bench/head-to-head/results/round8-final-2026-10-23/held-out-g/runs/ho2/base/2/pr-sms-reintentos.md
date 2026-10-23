# Añade reintentos con espera exponencial al envío de SMS

## Resumen

Cuando el proveedor de SMS fallaba, `avisos-api` reintentaba una sola vez a los 3 segundos y se rendía. Con esta PR los reintentos usan espera exponencial, así que se pierden bastantes menos mensajes.

## Cambios

- Nueva función `enviar_con_reintentos()` en `avisos/sms.py`. Reintenta hasta 5 veces, con esperas de 2, 4, 8, 16 y 32 segundos.
- Quito el reintento fijo de 3 segundos, que podía provocar mensajes duplicados.
- `SMS_MAX_REINTENTOS` pasa a valer 5 por defecto.
- 14 pruebas nuevas en `tests/test_sms.py`.

## Resultados

Lo probé en el entorno de preparación el 8 de octubre de 2026:

| Métrica | Antes | Después |
|---|---|---|
| Mensajes perdidos | 2,3 % | 0,1 % |
| Latencia p95 | 4,1 s | 4,4 s |

La latencia p95 sube 0,3 s, que me parece un precio razonable por perder muchos menos mensajes.

## Cómo probarlo

Ejecuta `pytest tests/test_sms.py`. Si tienes dudas, comenta en el issue #377.
