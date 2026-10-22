---
title: Writing localized help text
lang: en
updated: 2026-08-12
---

# Writing localized help text

This guide covers the steps for shipping help text in several languages.

## Why it matters

Teams that ship 14 languages see 38% fewer support tickets in the first 30 days, and the 9 translators we surveyed reported 1,200 strings reviewed per week. Every string should be reviewed within 48 hours.

## What to prepare

- Source strings: export all 1,200 strings from the `strings/en.json` file.
- Glossary: build a glossary of 40 terms for the translators to work from.
- Budget: plan for $4,500 per quarter.
- Deadline: send the batch by 2026-09-01 so the review lands before release v2.3.

## Languages and status

| Language | Status | Notes |
| --- | --- | --- |
| Spanish | Done | Shipped |
| German | In review | Covers 3 legal terms |
| French | Done | Shipped |
| Turkish | Planned | New market |

If a language needs more time, tell us. The program covers 4 regions.

## Examples of correct punctuation

Spanish dialogue opens each turn with a raya:

— ¿Cuánto tarda el envío? —pregunta Lucía.
— Unos cuatro días —responde Mateo—, pero depende del puerto.

Turkish quotes may use an en dash:

Müdür toplantıda şunu söyledi: "Çeviri bitmeden yayına çıkmayız – söz veriyorum."

German uses a spaced en dash and low quotation marks:

Der Support schrieb: „Wir melden uns innerhalb von 24 Stunden – versprochen“.

French sets quotations in guillemets and dashes with spaces:

La directrice a déclaré : « Je viens — enfin presque — demain présenter la version finale ».

## Exporting the strings

Run these commands in order. The second one needs the file from the first:

```sh
# Export every string — one file per language
kestrel i18n export --lang all
# Send the files to the translators — keep the placeholders intact
kestrel i18n send --team translators
```

## Next steps

Pick your 3 target languages, export the strings, and send them to a translator.
