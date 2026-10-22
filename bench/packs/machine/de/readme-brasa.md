# Brasa

**Brasa** fasst Fehlerprotokolle auf der Kommandozeile zusammen. Statt tausende Zeilen Log-Ausgabe durchzuscrollen, zeigt Brasa, was wirklich schiefgelaufen ist: gruppiert, gezählt und nach Häufigkeit sortiert.

## Funktionen

- Erkennt und gruppiert gleichartige Fehlermeldungen, auch wenn sich Zeitstempel, IDs oder Pfade unterscheiden
- Zeigt für jede Gruppe Anzahl, erstes und letztes Auftreten
- Liest Dateien, Verzeichnisse oder Standardeingabe (`stdin`)
- Ausgabe als Text, JSON oder Markdown

## Installation

Mit Homebrew:

```bash
brew install brasa
```

Oder mit Cargo:

```bash
cargo install brasa
```

Prüfen, ob die Installation funktioniert hat:

```bash
brasa --version
```

## Beispiel

Angenommen, `app.log` enthält mehrere tausend Zeilen. Dann genügt:

```bash
brasa app.log --level error --top 3
```

Mögliche Ausgabe:

```
Brasa – Zusammenfassung von app.log (12.480 Zeilen, 3 Fehlergruppen)

 1. 842×  ConnectionTimeout: db-primary:5432 nicht erreichbar
          erstmals 08:14:02 · zuletzt 09:57:41
 2. 117×  NullPointerException in OrderService.process()
          erstmals 08:31:55 · zuletzt 09:12:08
 3.  23×  Datei nicht gefunden: /var/cache/<pfad>
          erstmals 09:01:17 · zuletzt 09:44:30
```

Auch Pipes funktionieren:

```bash
kubectl logs mein-pod | brasa --format json
```

## Optionen

| Option | Beschreibung |
|---|---|
| `--level <stufe>` | Mindestlevel (`warn`, `error`, `fatal`) |
| `--top <n>` | Nur die n häufigsten Gruppen |
| `--since <zeit>` | Nur Einträge ab diesem Zeitpunkt |
| `--format <fmt>` | `text`, `json` oder `markdown` |

## Lizenz

MIT
