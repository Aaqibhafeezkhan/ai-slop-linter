# Tramelo 2.3.0 – Versionshinweise

Mit Tramelo 2.3.0 gibt es eine neue Option zum gefahrlosen Ausprobieren von Synchronisationen sowie mehrere Fehlerkorrekturen, die den Abgleich zweier Ordner zuverlässiger machen.

## Neu

### Option `--dry-run`

Mit `--dry-run` zeigt Tramelo an, welche Dateien kopiert, aktualisiert oder gelöscht würden, ohne tatsächlich etwas zu verändern. So lässt sich prüfen, ob eine Synchronisation das gewünschte Ergebnis liefert, bevor sie wirklich ausgeführt wird. Das ist besonders nützlich bei neuen Ordnerpaaren oder bei Läufen, die Dateien im Zielordner entfernen.

```
tramelo --dry-run quelle/ ziel/
```

Die Ausgabe entspricht dem normalen Lauf, jede Zeile ist jedoch als Vorschau gekennzeichnet. Der Exit-Code bleibt unverändert, sodass sich die Option auch in Skripten verwenden lässt.

## Fehlerkorrekturen

- Dateien mit Leerzeichen oder Sonderzeichen im Namen werden nun korrekt erkannt und synchronisiert.
- Leere Unterordner im Quellordner werden jetzt auch im Zielordner angelegt.
- Zeitstempel werden beim Kopieren zuverlässig übernommen, sodass unveränderte Dateien nicht mehr unnötig erneut übertragen werden.
- Ein Absturz bei symbolischen Links, die ins Leere zeigen, wurde behoben. Solche Links werden übersprungen und mit einer Warnung gemeldet.
- Fehlermeldungen bei fehlenden Zugriffsrechten nennen jetzt den betroffenen Pfad.

## Hinweis zum Update

Es sind keine Änderungen an bestehenden Konfigurationen nötig. Wir empfehlen, nach dem Update einen ersten Lauf mit `--dry-run` durchzuführen.
