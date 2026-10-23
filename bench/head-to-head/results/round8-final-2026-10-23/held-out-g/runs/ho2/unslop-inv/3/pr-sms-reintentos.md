# Añade reintentos con espera exponencial al envío de SMS

## Resumen

Esta PR cambia cómo `avisos-api` gestiona los fallos del proveedor de SMS: en lugar de un reintento fijo, reintenta con espera exponencial.

## Cambios

- Se añade la función `enviar_con_reintentos()` en `avisos/sms.py`, que reintenta hasta 5 veces con esperas de 2, 4, 8, 16 y 32 segundos.
- Se elimina el reintento fijo de 3 segundos, que podía causar mensajes duplicados.
- Se actualiza la variable `SMS_MAX_REINTENTOS`, cuyo valor por defecto pasa a ser 5.
- Se han añadido 14 pruebas nuevas en `tests/test_sms.py`.

## Resultados

Resultados de las pruebas en el entorno de preparación el 8 de octubre de 2026:

| Métrica | Antes | Después |
|---|---|---|
| Mensajes perdidos | 2,3 % | 0,1 % |
| Latencia p95 | 4,1 s | 4,4 s |

## Cómo probarlo

Ejecuta `pytest tests/test_sms.py`. Las dudas, en el issue #377.
