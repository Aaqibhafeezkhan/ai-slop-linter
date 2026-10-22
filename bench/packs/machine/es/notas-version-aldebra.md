# Aldebra 4.1: notas de la versión

Nos complace anunciar la publicación de Aldebra 4.1, una actualización centrada en la fiabilidad de la lectura de datos y en la compatibilidad con más formatos de hojas de cálculo.

## Novedades

### Soporte para archivos ODS

Aldebra ya puede leer archivos en formato OpenDocument Spreadsheet (`.ods`), el estándar abierto utilizado por LibreOffice y otras aplicaciones. La interfaz es la misma que ya conoces para otros formatos, así que no necesitas cambiar tu código existente:

```python
import aldebra

libro = aldebra.abrir("datos.ods")
hoja = libro["Ventas"]
```

Se admiten múltiples hojas, celdas combinadas y los tipos de datos habituales: texto, números, booleanos y fechas.

## Correcciones

### Lectura de fechas

Hemos corregido un fallo que provocaba que algunas fechas se interpretaran de forma incorrecta al leer una hoja de cálculo. En determinados casos, los valores de fecha se devolvían desplazados o como números en lugar de objetos de fecha. Ahora las fechas se convierten correctamente y se devuelven con el tipo esperado.

Si habías añadido soluciones temporales para compensar este comportamiento, te recomendamos revisarlas y retirarlas, ya que podrían producir resultados erróneos tras actualizar.

## Actualización

Puedes actualizar con:

```
pip install --upgrade aldebra
```

Esta versión no introduce cambios incompatibles con la serie 4.x.

## Agradecimientos

Gracias a todas las personas que reportaron el fallo de las fechas y probaron las versiones preliminares del soporte ODS. Vuestras aportaciones hacen que Aldebra sea mejor en cada versión.
