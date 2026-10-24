# Dutch tells the linter cannot see

Source: the families follow the English catalog in `en.md` (adapted from everwrite, MIT, see `THIRD-PARTY-NOTICES.md`), translated by us. No measured evidence supports the Dutch phrases: no public labelled Dutch corpus with downloadable text was found (docs/RESEARCH-R8-corpora.md), and the Dutch Wikipedia has no page of tells, only one editors' thread (Wikipedia:De kroeg, July 2025) that names euphemistic role claims such as `was belangrijk voor de muziek`, `had een groot aandeel` and `wordt nog altijd beschouwd als`; its editors also say style alone is an unreliable test. Treat every entry as a candidate.

The linter ships no Dutch phrase catalog (only the `hedge` check of `--verify` covers Dutch, see `SKILL.md`), so for Dutch text this list and the read-back by class are the check. Read it after the linter has run. A Dutch writer may use any of these in a sentence that needs it: judge the sentence, not the phrase.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `wij`, `we`, `ons`, `onze`, `ik`, `mijn` or `jullie` the source does not use. When a fix needs a detail the source lacks, cut the claim or write the plain version, then run `--compare` again. Keep `je` or `u` as the source has it, and keep the number format (`€1.250,50`, `4,8 seconden`).

## Act on one sighting

### Assistant wrappers

- `Natuurlijk!`, `Zeker!`, `Hier is`, `Ik hoop dat dit helpt`, `Laat het me weten als`, `Aarzel niet om`, `Als AI-model`; `Hier is` only at the start of a reply. Delete the wrapper and keep the content.

### Announcements and closers

- `Laten we erin duiken`, `In dit artikel gaan we`, `Zonder verder oponthoud`. Start with the first fact from the source.
- `Kortom` or `Concluderend` as a recap of what the paragraph just said, `De toekomst ziet er rooskleurig uit`, `Blijf op de hoogte`. End on the last fact.

### Inflated importance

- `speelt een cruciale rol`, `een keerpunt`. Say what the thing does, with the measure from the source.
- `in de huidige snelle wereld`, `in het steeds veranderende landschap`, `in het digitale tijdperk`. Cut, or name the real context.
- Euphemistic role claims about a person or place with no fact behind them: `speelde een belangrijke rol in`, `had een groot aandeel in`. Give the fact from the source or cut.

### Hedge stacks and vague links

- `zou mogelijk kunnen helpen om`, `zou mogelijk kunnen verbeteren`, `lijkt samen te hangen met`, `lijkt te wijzen op`. One hedge where the source is unsure, in the degree the source has; remove it where the source gives no reason for the doubt. Never turn it into a certain claim.
- `experts stellen dat`, `onderzoek toont aan`, `velen geloven`. Name the source or drop the claim.

### Parallelism and sham breadth

- `niet alleen ... maar ook ...`, `niet slechts ... maar`: say the second part directly.
- `van ... tot ...` when the two ends are not a real range in the source.

## Act only when several appear

Each is normal in a sentence that needs it. Several in one paragraph, or next to a first-tier entry, read as model text. Keep the one that carries a fact.

- Didactic disclaimers: `het is belangrijk om op te merken dat`, `het is de moeite waard om te vermelden`, `een bewijs van`. Normal in formal Dutch; act when they stand in for a fact.
- Praise words: `robuust`, `naadloos`, `veelzijdig`, `uitgebreid`, `dynamisch`, `innovatief`, `cruciaal`, `essentieel`, `indrukwekkend`.
- Process verbs: `benutten`, `stimuleren`, `faciliteren`, `optimaliseren` with no measure, `waarborgen`.
- Stacked openers: `Bovendien,`, `Daarnaast,`, `Tevens,`, `Verder,` at the start of sentences in a row.
- A triad of adjectives for rhythm when the source supports fewer.

## Leave these alone

- The dot as thousands mark and the comma as decimal mark are correct. Do not reformat a number: `--compare` counts it as a change. Month names (`oktober`) and dates stay as written.
- Quotations, names, code and attributed statements stay as written.
- A text with none of the first-tier entries stays byte-identical.
