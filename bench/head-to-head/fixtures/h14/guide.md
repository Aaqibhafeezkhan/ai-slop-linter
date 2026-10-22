---
title: Writing localized help text
lang: en
updated: 2026-08-12
---

# Writing localized help text

In today's fast-paced world, shipping help text in several languages is a testament to a team's commitment to its users. This guide delves into the pivotal steps of a seamless, robust localization workflow — and it will help you leverage every one of them.

## Why it matters

Localized help text isn't just a nice-to-have, it's a game-changer. Teams that ship 14 languages see 38% fewer support tickets in the first 30 days, and the 9 translators we surveyed reported 1,200 strings reviewed per week. It is important to note that every string should be reviewed within 48 hours.

Navigating the ever-evolving landscape of global support can feel daunting, but a vibrant, holistic process unlocks a rich tapestry of happy readers.

## What to prepare

- **Source strings:** Export all 1,200 strings from the `strings/en.json` file, ensuring nothing is left behind.
- **Glossary:** Build a glossary of 40 terms, a robust foundation that empowers every translator to elevate the final text.
- **Budget:** Plan for $4,500 per quarter, showcasing your commitment to quality.
- **Deadline:** Send the batch by 2026-09-01 so the review lands before release v2.3.

## Languages and status

| Language | Status | Notes |
| --- | --- | --- |
| Spanish | Done | A seamless, game-changing rollout |
| German | In review | Delves into 3 legal terms, a pivotal step |
| French | Done | Showcases a vibrant tone of voice |
| Turkish | Planned | Unlocks a robust new market |

Taken together, these rows paint a holistic picture of a robust, forward-thinking program. Please let us know if a language needs more time, as we are deeply committed to delivering a seamless experience for all 4 regions.

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

Run these commands in order — the second one needs the file from the first:

```sh
# Export every string — one file per language
kestrel i18n export --lang all
# Send the files to the translators — keep the placeholders intact
kestrel i18n send --team translators
```

## Next steps

Pick your 3 target languages, export the strings, and send them to a translator. In conclusion, this isn't just a process, it's a journey, and the future of localization looks bright. I hope this helps! Let me know if you have any questions.
