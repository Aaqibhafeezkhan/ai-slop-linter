# `kiwipan export`

Exporte un projet kiwipan sous la forme d'une archive ZIP, prête à être partagée, sauvegardée ou transférée vers une autre machine.

## Syntaxe

```
kiwipan export [projet] [options]
```

Si `projet` est omis, la commande utilise le projet du répertoire courant.

## Options

| Option | Description |
|---|---|
| `-o, --output <chemin>` | Chemin du fichier ZIP généré. Par défaut : `<nom-du-projet>.zip` dans le répertoire courant. |
| `--exclude <motif>` | Exclut les fichiers correspondant au motif (peut être répété). |
| `--force` | Écrase le fichier de destination s'il existe déjà. |
| `-q, --quiet` | N'affiche aucune sortie, sauf en cas d'erreur. |

## Exemples

Exporter le projet courant :

```
kiwipan export
```

Exporter un projet précis vers un emplacement personnalisé :

```
kiwipan export mon-projet -o ~/archives/mon-projet.zip
```

Exclure les journaux et les fichiers temporaires :

```
kiwipan export --exclude "*.log" --exclude "tmp/*"
```

## Codes de retour

- `0` : export réussi.
- `1` : erreur (projet introuvable, fichier de destination déjà présent sans `--force`, droits d'écriture insuffisants).

## Remarques

L'archive conserve l'arborescence du projet. Les options, motifs et comportements ci-dessus sont à vérifier par rapport à l'implémentation réelle de la commande, que je n'ai pas consultée.
