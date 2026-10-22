# Brasa

**Brasa** es una herramienta de línea de comandos que lee tus registros de errores y los condensa en un resumen claro: agrupa los fallos repetidos, destaca los más frecuentes y te muestra qué ocurrió primero y qué ocurrió por última vez.

## Características

- Agrupa errores similares aunque cambien los identificadores, fechas o rutas.
- Ordena los problemas por frecuencia y gravedad.
- Admite archivos de texto, JSON por líneas y entrada estándar.
- Genera salida en texto, JSON o Markdown.
- Funciona con archivos de varios gigabytes sin cargarlos en memoria.

## Instalación

Necesitas Python 3.9 o superior. Instala Brasa con `pip`:

```bash
pip install brasa
```

Comprueba que todo funciona:

```bash
brasa --version
```

## Ejemplo de uso

Resume un archivo de registros:

```bash
brasa resumir app.log --top 3
```

Salida:

```text
Brasa · app.log · 12 480 líneas · 3 grupos de error

1. ConnectionTimeout: base de datos no responde   (842 veces)
   primera: 2026-10-20 03:12   última: 2026-10-21 08:47
2. KeyError: 'user_id'                            (97 veces)
   primera: 2026-10-20 14:05   última: 2026-10-21 08:31
3. PermissionDenied: /var/data/cache              (12 veces)
   primera: 2026-10-21 02:40   última: 2026-10-21 07:58
```

También puedes leer desde otro comando y exportar el resultado:

```bash
tail -n 5000 app.log | brasa resumir - --formato markdown > informe.md
```

## Opciones principales

| Opción | Descripción |
|---|---|
| `--top N` | Muestra solo los N grupos principales |
| `--formato` | `texto`, `json` o `markdown` |
| `--desde` | Filtra errores a partir de una fecha |
| `--nivel` | Nivel mínimo (`WARN`, `ERROR`, `FATAL`) |

## Licencia

MIT
