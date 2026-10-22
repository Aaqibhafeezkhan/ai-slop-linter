# Por qué aparece `KeyError: 'nombre'`

## Qué significa

Al leer un JSON con `json.load()` o `json.loads()`, Python lo convierte en un diccionario (o una lista de diccionarios). Si accedes con `datos["nombre"]` y esa clave no existe en ese diccionario, Python lanza `KeyError: 'nombre'`.

## Causas más habituales

1. **La clave no existe o está escrita distinto.** Por ejemplo, el archivo tiene `"Nombre"`, `"name"` o `"nombre "` (con un espacio). Python distingue mayúsculas y minúsculas.
2. **El JSON es una lista, no un objeto.** Si el archivo es `[{"nombre": "Ana"}, ...]`, `datos["nombre"]` falla, porque `datos` es una lista. Hay que recorrerla.
3. **La clave está en un nivel anidado.** Por ejemplo, `{"persona": {"nombre": "Ana"}}` requiere `datos["persona"]["nombre"]`.
4. **Algunos elementos no tienen la clave.** En una lista de objetos, uno puede carecer de `"nombre"`.
5. **BOM o codificación.** Si el archivo tiene BOM, la primera clave puede leerse como `'\ufeffnombre'`. Se evita abriendo con `encoding="utf-8-sig"`.

## Cómo diagnosticarlo

```python
import json

with open("datos.json", encoding="utf-8") as f:
    datos = json.load(f)

print(type(datos))   # ¿dict o list?
print(datos)         # o datos.keys() si es un dict
```

## Cómo corregirlo

**Si es un diccionario y la clave puede faltar:**

```python
nombre = datos.get("nombre", "desconocido")
```

**Si es una lista de objetos:**

```python
for persona in datos:
    print(persona.get("nombre", "sin nombre"))
```

**Si está anidada:**

```python
nombre = datos["persona"]["nombre"]
# o, de forma segura:
nombre = datos.get("persona", {}).get("nombre")
```

**Si prefieres capturar el error:**

```python
try:
    nombre = datos["nombre"]
except KeyError:
    print("Falta la clave 'nombre'. Claves disponibles:", list(datos))
```

## Resumen

El error significa que la clave `'nombre'` no está en el diccionario que consultas. Imprime `type(datos)` y `datos` para ver la estructura real, ajusta el acceso (índice de lista, nivel anidado o ortografía exacta) y usa `.get()` si la clave es opcional.

Si me pegas un fragmento del JSON y tu código, te indico la línea exacta que falla.
