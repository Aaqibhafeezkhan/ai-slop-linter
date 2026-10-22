# Tramelo 2.3.0

Cette version introduit le mode simulation et corrige plusieurs bugs qui affectaient la fiabilité des synchronisations.

## Nouveautés

**Option `--dry-run`** : vous pouvez maintenant simuler une synchronisation sans toucher à aucun fichier. Tramelo affiche la liste des copies, des mises à jour et des suppressions qu'il effectuerait, puis s'arrête. C'est le moyen le plus sûr de vérifier le résultat avant de lancer une synchronisation importante, en particulier avec une option de suppression.

```
tramelo --dry-run ~/Documents /mnt/sauvegarde/Documents
```

## Corrections de bugs

- Les fichiers dont le nom contient des caractères accentués ou des espaces ne sont plus traités à tort comme nouveaux à chaque exécution.
- Une synchronisation interrompue ne laisse plus de fichiers temporaires partiels dans le dossier de destination.
- Les liens symboliques cassés ne provoquent plus l'arrêt brutal de la synchronisation. Ils sont signalés par un avertissement.
- Les dates de modification sont désormais correctement conservées lors de la copie, ce qui évite des mises à jour inutiles lors des passages suivants.
- Les messages d'erreur indiquent maintenant le chemin complet du fichier concerné.

## Mise à jour

Cette version est compatible avec les précédentes : aucune modification de vos commandes ou scripts existants n'est nécessaire.

Merci à toutes les personnes qui ont signalé des problèmes et testé les versions préliminaires.
