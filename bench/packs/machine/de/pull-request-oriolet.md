## Korrektur der ISO-Kalenderwochen-Berechnung

### Problem
`isoWeek()` lieferte rund um den Jahreswechsel falsche Ergebnisse. So wurde etwa der 31. Dezember 2024 als Woche 53 des Jahres 2024 ausgegeben, obwohl er laut ISO 8601 zu Woche 1 des Jahres 2025 gehört. Ebenso landete der 1. Januar 2027 fälschlich in Woche 1 statt in Woche 53 von 2026. Ursache war, dass die Woche anhand des Kalenderjahres bestimmt wurde und nicht anhand des Donnerstags der jeweiligen Woche.

### Lösung
- Die Woche wird nun über den Donnerstag bestimmt: Das Jahr, in das dieser Tag fällt, ist das ISO-Wochenjahr.
- Die Wochennummer ergibt sich aus der Anzahl der Tage seit dem 1. Januar dieses Jahres, geteilt durch sieben.
- `isoWeekYear()` gibt jetzt das korrekte Wochenjahr zurück und ist nicht mehr identisch mit `year()`.

### Tests
- Neue Testfälle für alle Jahre von 2015 bis 2030, einschließlich der Jahre mit 53 Wochen (2015, 2020, 2026).
- Randfälle: 29. Dezember bis 4. Januar sowie Schaltjahre.
- Abgleich mit einer Referenzimplementierung.

### Hinweis
Das Verhalten ändert sich für Daten um den Jahreswechsel. Das ist eine Fehlerkorrektur, sollte aber im Changelog erwähnt werden.
