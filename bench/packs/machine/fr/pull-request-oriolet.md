## Correction du calcul des semaines ISO

### Contexte
Le calcul du numéro de semaine ISO 8601 était incorrect autour du changement d'année. Pour certaines dates, la méthode renvoyait la semaine 0 ou 53 au lieu de la bonne valeur. Par exemple, le 1er janvier 2027 est dans la semaine 53 de 2026, et le 29 décembre 2025 appartient à la semaine 1 de 2026.

### Cause
L'ancienne implémentation déduisait la semaine à partir du jour de l'année, en supposant que la semaine 1 commençait toujours le 1er janvier. Elle ne tenait pas compte de la règle ISO : la semaine 1 est celle qui contient le premier jeudi de l'année, et les semaines commencent le lundi.

### Changements
- Le calcul se fonde désormais sur le jeudi de la semaine courante, qui détermine l'année ISO.
- `isoWeek()` et `isoWeekYear()` sont cohérentes entre elles.
- Les années à 53 semaines sont correctement détectées.
- Ajout de tests couvrant les limites d'année (2015, 2020, 2021, 2026, 2027) et les années bissextiles.

### Impact
Aucun changement d'API. Seuls les résultats erronés sont modifiés. Les utilisateurs qui contournaient ce bug devront peut-être retirer leur correctif.

### Vérification
Tous les tests passent, y compris les nouveaux cas.
