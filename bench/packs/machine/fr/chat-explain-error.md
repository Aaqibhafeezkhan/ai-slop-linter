# Pourquoi `KeyError: 'nom'` apparaît

Cette erreur signifie que Python cherche la clé `'nom'` dans un dictionnaire, mais que **cette clé n'existe pas** à cet endroit. Un fichier JSON lu avec `json.load()` devient un `dict` (ou une `list` de `dict`), et accéder à `data['nom']` échoue si la clé est absente.

## Causes les plus fréquentes

1. **Faute de frappe ou de casse** : le fichier contient `"Nom"`, `"name"` ou `"nom "` (avec un espace) au lieu de `"nom"`. Python distingue majuscules et minuscules.

2. **Mauvais niveau d'imbrication** : la clé est dans un objet interne.
   ```json
   {"personne": {"nom": "Alice"}}
   ```
   Ici, `data['nom']` échoue ; il faut `data['personne']['nom']`.

3. **Le JSON est une liste, pas un dictionnaire** :
   ```json
   [{"nom": "Alice"}, {"nom": "Bob"}]
   ```
   Il faut alors parcourir la liste : `data[0]['nom']` ou `for p in data: p['nom']`.

4. **Clé absente pour certains éléments** : la plupart des entrées ont `"nom"`, mais une seule ne l'a pas, et le script plante dessus.

5. **Mauvais fichier ou fichier vide/incomplet** : vous lisez un autre fichier que prévu, ou `{}`.

## Comment diagnostiquer

Affichez ce que vous avez réellement lu :

```python
import json

with open("fichier.json", encoding="utf-8") as f:
    data = json.load(f)

print(type(data))   # dict ou list ?
print(data)         # contenu réel
if isinstance(data, dict):
    print(data.keys())   # clés disponibles (repérez espaces et casse)
```

## Comment corriger

**Utiliser `.get()` avec une valeur par défaut** (pas d'erreur si la clé manque) :
```python
nom = data.get("nom", "inconnu")
```

**Tester la présence de la clé** :
```python
if "nom" in data:
    print(data["nom"])
```

**Gérer l'exception** :
```python
try:
    nom = data["nom"]
except KeyError:
    print("La clé 'nom' est absente du JSON")
```

**Adapter le chemin d'accès** à la structure réelle :
```python
nom = data["personne"]["nom"]          # imbriqué
noms = [p.get("nom") for p in data]    # liste de dictionnaires
```

## Pour aller plus loin

Si vous me collez le début de votre fichier JSON et les lignes de code qui le lisent, je pourrai vous indiquer précisément quelle cause s'applique et la correction exacte.
