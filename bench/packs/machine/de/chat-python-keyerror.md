# Warum `KeyError: 'name'` auftritt

## Die Ursache

Der Fehler bedeutet: Du greifst auf einen Dictionary-Schlüssel `'name'` zu, der in den geladenen Daten **nicht existiert**. Beim Lesen einer JSON-Datei mit `json.load()` entsteht ein normales Python-Dictionary (oder eine Liste von Dictionaries). Zugriffe wie `daten["name"]` schlagen fehl, wenn der Schlüssel fehlt.

Typische Gründe:

1. **Der Schlüssel heißt anders**, z. B. `"Name"`, `"NAME"`, `"name "` (mit Leerzeichen) oder `"first_name"`. Groß-/Kleinschreibung zählt.
2. **Die Struktur ist anders als erwartet.** Beispiel: Die JSON-Datei enthält eine **Liste** oder ein **verschachteltes Objekt**:
   ```json
   {"users": [{"name": "Anna"}, {"name": "Ben"}]}
   ```
   Dann ist `daten["name"]` falsch, richtig wäre `daten["users"][0]["name"]`.
3. **Nicht jeder Eintrag hat den Schlüssel.** Bei einer Liste von Objekten fehlt `name` vielleicht bei einem einzigen Element, und genau das löst den Fehler aus.
4. **Falsche Datei oder leere Struktur**, z. B. `{}`.
5. **BOM oder unsichtbare Zeichen** am Dateianfang, sodass der Schlüssel eigentlich `"\ufeffname"` heißt (selten, aber möglich bei Windows-Dateien).

## So findest du die Ursache

Schau dir zuerst an, was wirklich geladen wurde:

```python
import json

with open("datei.json", encoding="utf-8") as f:
    daten = json.load(f)

print(type(daten))   # dict oder list?
print(daten)         # ganzen Inhalt ansehen

if isinstance(daten, dict):
    print(daten.keys())   # welche Schlüssel gibt es wirklich?
```

## So behebst du den Fehler

**1. Struktur korrekt ansteuern**
```python
# Liste von Objekten
for eintrag in daten["users"]:
    print(eintrag["name"])
```

**2. `.get()` verwenden, wenn der Schlüssel fehlen darf**
```python
name = eintrag.get("name", "unbekannt")
```

**3. Vorher prüfen**
```python
if "name" in eintrag:
    print(eintrag["name"])
```

**4. Fehler abfangen**
```python
try:
    print(eintrag["name"])
except KeyError:
    print("Eintrag ohne 'name':", eintrag)
```

**5. Bei BOM-Problemen** die Datei mit `encoding="utf-8-sig"` öffnen.

## Fazit

Python sagt dir: „In diesem Dictionary gibt es keinen Schlüssel `'name'`." Lass dir mit `print(daten)` bzw. `daten.keys()` die tatsächliche Struktur anzeigen und passe den Zugriff daran an. Wenn du mir dein Skript und einen Ausschnitt der JSON-Datei zeigst, sage ich dir gern genau, wo das Problem liegt.
