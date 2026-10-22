Una **API REST** es una forma de que dos programas se comuniquen a través de internet usando las mismas reglas que utiliza la web.

Imagina un restaurante: tú (el cliente) no entras a la cocina, sino que le pides al camarero lo que quieres y él te trae el resultado. La API es ese camarero: recibe tus peticiones, las lleva al servidor y te devuelve la respuesta.

En una API REST, cada cosa que puedes consultar (usuarios, productos, pedidos) tiene una dirección o URL, por ejemplo `/usuarios/5`. Para actuar sobre ella usas los verbos del protocolo HTTP:

- **GET**: obtener datos.
- **POST**: crear algo nuevo.
- **PUT/PATCH**: modificar algo existente.
- **DELETE**: eliminarlo.

Las respuestas suelen venir en formato **JSON**, un texto ordenado y fácil de leer tanto para personas como para programas.

Otra característica clave es que es *sin estado*: cada petición lleva toda la información necesaria, y el servidor no recuerda las anteriores.

Gracias a esto, una misma API puede servir a una web, una aplicación móvil o cualquier otro sistema, sin importar el lenguaje en que estén programados.
