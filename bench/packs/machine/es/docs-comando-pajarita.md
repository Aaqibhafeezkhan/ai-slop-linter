# `pajarita export`

Exporta un proyecto completo a un archivo ZIP, listo para compartir, archivar o desplegar.

## Sintaxis

```bash
pajarita export [proyecto] [opciones]
```

## Descripción

El comando empaqueta los archivos del proyecto en un único ZIP, conservando la estructura de directorios. Si no se indica `proyecto`, se usa el directorio actual. Por defecto, el archivo resultante se guarda en el directorio de trabajo con el nombre del proyecto, por ejemplo `mi-proyecto.zip`.

## Opciones

| Opción | Descripción |
|---|---|
| `-o, --output <ruta>` | Ruta y nombre del ZIP de salida. |
| `-x, --exclude <patrón>` | Excluye archivos que coincidan con el patrón (se puede repetir). |
| `-l, --level <0-9>` | Nivel de compresión. Por defecto, `6`. |
| `-f, --force` | Sobrescribe el ZIP si ya existe. |
| `-q, --quiet` | Suprime la salida por consola. |
| `-h, --help` | Muestra la ayuda. |

## Ejemplos

Exportar el proyecto actual:

```bash
pajarita export
```

Exportar con nombre personalizado, excluyendo dependencias y registros:

```bash
pajarita export mi-proyecto -o dist/entrega.zip -x "node_modules/**" -x "*.log"
```

Sobrescribir un ZIP existente con máxima compresión:

```bash
pajarita export -l 9 -f
```

## Códigos de salida

- `0`: exportación completada.
- `1`: error general (proyecto no encontrado, sin permisos de escritura).
- `2`: el archivo de salida ya existe y no se usó `--force`.

## Notas

- Los patrones de `--exclude` usan sintaxis glob.
- Verifica el contenido del ZIP antes de compartirlo, para no incluir credenciales ni archivos sensibles.

---

*Nota: no he podido consultar el código de `pajarita`, así que las opciones, valores por defecto y códigos de salida son una propuesta razonable. Conviene contrastarlos con el comportamiento real del comando.*
