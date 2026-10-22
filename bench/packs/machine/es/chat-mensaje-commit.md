```
feat(http): añade caché de peticiones HTTP y corrige fuga de memoria

Añade una caché en memoria para las respuestas de peticiones GET del
cliente HTTP de Burbuja. Las respuestas se reutilizan mientras no
caduquen, lo que reduce las llamadas repetidas al servidor y mejora
el tiempo de carga.

Corrige también una fuga de memoria en el mismo módulo: los oyentes
y las referencias a peticiones finalizadas no se liberaban, así que
los objetos se acumulaban durante sesiones largas. Ahora se liberan
al completarse o cancelarse la petición.
```

Si quiere una versión más corta, sin cuerpo, sería esta: `feat(http): añade caché de peticiones y corrige fuga de memoria en el cliente`.

Los detalles del cuerpo, como que la caché solo cubre GET, que caduca y que se liberan los oyentes, son supuestos míos, porque no he visto el diff. Ajústelos a lo que hace realmente el cambio.
