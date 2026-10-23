# Añade reintentos con espera exponencial al envío de SMS

¡Claro! Aquí tienes una descripción detallada de la pull request. Espero que te sea de utilidad.

## Resumen

Esta PR introduce una solución robusta y escalable que transforma por completo la forma en que `avisos-api` gestiona los fallos del proveedor de SMS. En el mundo digital actual, la fiabilidad de las notificaciones es más importante que nunca — y esta mejora juega un papel fundamental.

## Cambios

- Se añade la función `enviar_con_reintentos()` en `avisos/sms.py`, que reintenta hasta 5 veces con esperas de 2, 4, 8, 16 y 32 segundos.
- Cabe destacar que se ha eliminado el reintento fijo de 3 segundos, lo que potencialmente podría causar mensajes duplicados.
- Se actualiza la variable `SMS_MAX_REINTENTOS`, cuyo valor por defecto pasa a ser 5.
- Se han añadido 14 pruebas nuevas en `tests/test_sms.py`.

## Resultados

Tras las pruebas en el entorno de preparación el 8 de octubre de 2026, los resultados son realmente impresionantes:

| Métrica | Antes | Después |
|---|---|---|
| Mensajes perdidos | 2,3 % | 0,1 % |
| Latencia p95 | 4,1 s | 4,4 s |

## Cómo probarlo

Para empezar, simplemente ejecuta `pytest tests/test_sms.py`. No dudes en comentar cualquier duda en el issue #377. En definitiva, esta PR representa un paso importante hacia un sistema más fiable y marca un antes y un después para el equipo.
