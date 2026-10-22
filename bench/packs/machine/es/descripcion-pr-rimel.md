**Corrige el cálculo de las semanas ISO 8601**

## Contexto

`Rimel` calculaba mal el número de semana ISO en los días cercanos al cambio de año. Por ejemplo, el 1 de enero de 2021 devolvía la semana 1 de 2021, cuando según ISO 8601 pertenece a la semana 53 de 2020. El 31 de diciembre de 2024 tenía un error similar, en sentido contrario.

## Cambios

- El año ISO se calcula ahora a partir del jueves de la semana, como establece el estándar, en lugar de usar el año del calendario.
- Se corrige el número de semana para los años de 53 semanas.
- `semana_iso()` y `anio_iso()` pasan a usar la misma lógica, para que nunca devuelvan valores incoherentes entre sí.

## Pruebas

- Se añaden casos para los límites de año entre 2015 y 2030.
- Se comprueban los años que empiezan en jueves y los bisiestos.
- Los tests existentes siguen pasando.

## Compatibilidad

El cambio altera resultados que antes eran incorrectos. Quien dependiera del comportamiento anterior verá valores distintos en los primeros y últimos días del año. Conviene mencionarlo en el registro de cambios.

Cierra #
