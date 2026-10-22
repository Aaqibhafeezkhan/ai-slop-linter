# kiwipan export

Exportiert ein Projekt als ZIP-Archiv.

## Syntax

```
kiwipan export [PROJEKT] [Optionen]
```

## Beschreibung

Der Befehl `kiwipan export` packt alle Dateien eines Projekts in ein einzelnes ZIP-Archiv. So können Sie ein Projekt sichern, weitergeben oder auf einem anderen Rechner weiterverwenden. Wird kein Projekt angegeben, exportiert kiwipan das Projekt im aktuellen Verzeichnis.

## Optionen

| Option | Beschreibung |
|---|---|
| `-o, --output <Pfad>` | Zielpfad der ZIP-Datei. Standard: `<Projektname>.zip` im aktuellen Verzeichnis. |
| `--exclude <Muster>` | Schließt Dateien aus, die dem Muster entsprechen (mehrfach verwendbar). |
| `--force` | Überschreibt eine vorhandene Zieldatei ohne Rückfrage. |
| `-q, --quiet` | Unterdrückt Statusmeldungen. |
| `-h, --help` | Zeigt die Hilfe an. |

## Beispiele

Aktuelles Projekt exportieren:

```
kiwipan export
```

Bestimmtes Projekt mit eigenem Dateinamen exportieren:

```
kiwipan export mein-projekt -o backup/mein-projekt-2026.zip
```

Temporäre Dateien ausschließen:

```
kiwipan export --exclude "*.tmp" --exclude "cache/"
```

## Hinweise

- Existiert die Zieldatei bereits, fragt kiwipan vor dem Überschreiben nach, sofern `--force` nicht gesetzt ist.
- Der Befehl beendet sich mit Exit-Code `0` bei Erfolg und mit einem Wert ungleich `0` bei Fehlern.

*Hinweis: Die Optionen und das Verhalten oben habe ich als plausible Vorlage formuliert, da im Arbeitsverzeichnis keine Quelle für `kiwipan` vorhanden ist. Bitte gleichen Sie sie mit der tatsächlichen Implementierung ab.*
