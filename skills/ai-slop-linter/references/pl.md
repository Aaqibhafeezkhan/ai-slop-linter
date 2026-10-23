# Polish tells the linter cannot see

Source: the families follow the English catalog in `en.md` (adapted from everwrite, MIT, see `THIRD-PARTY-NOTICES.md`), translated by us. No measured evidence supports the Polish phrases: no public labelled Polish corpus with downloadable text was found (docs/RESEARCH-R8-corpora.md), and the Polish Wikipedia has no page of tells. Treat every entry as a candidate. The correct-typography rates for Polish are in `docs/LANGUAGES.md`.

The linter ships no Polish phrase catalog, so for Polish text this list and the read-back by class are the check. Pass `--language pl` to the linter and to `--compare`. A Polish writer may use any of these in a sentence that needs it: judge the sentence, not the phrase.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `my`, `nasz`, `ja` or a first-person past form (`zrobiliśmy`) the source does not use. When a fix needs a detail the source lacks, cut the claim or write the plain version, then run `--compare` again. Keep `Ty` or `Pan/Pani` as the source has it, and keep the number format (`1 250,50`, `4,8 sekundy`) and the genitive month (`3 listopada`).

## Act on one sighting

### Assistant wrappers

- `Oczywiście!`, `Z pewnością!`, `Oto` at the start of a reply, `Mam nadzieję, że to pomoże`, `Daj znać, jeśli`, `Nie wahaj się`, `Jako model językowy`. Delete the wrapper and keep the content.

### Announcements and closers

- `Zanurzmy się w`, `W tym artykule omówimy`, `Bez zbędnych ceregieli`. Start with the first fact from the source.
- `Podsumowując` or `Reasumując` as a recap of what the paragraph just said, `Przyszłość rysuje się w jasnych barwach`, `Bądź na bieżąco`. End on the last fact.

### Inflated importance

- `odgrywa kluczową rolę`, `stanowi świadectwo`, `punkt zwrotny`. Say what the thing does, with the measure from the source.
- `w dzisiejszym dynamicznym świecie`, `w erze cyfrowej`, `w stale zmieniającym się krajobrazie`. Cut, or name the real context.

### Hedge stacks and vague links

- `mogłoby potencjalnie pomóc`, `mogłoby potencjalnie poprawić`, `wydaje się być powiązane z`, `wydaje się wskazywać na`. One hedge where the source is unsure, in the degree the source has; remove it where the source gives no reason for the doubt. Never turn it into a certain claim. `wydaje się być` is also an English calque: `wydaje się` alone is Polish.
- `eksperci twierdzą`, `badania pokazują`, `wielu uważa`. Name the source or drop the claim.

### Parallelism and sham breadth

- `nie tylko ... ale także ...`, `nie tylko ... lecz również ...`: say the second part directly.
- `od ... do ...` when the two ends are not a real range in the source.

## Act only when several appear

Each is normal in a sentence that needs it. Several in one paragraph, or next to a first-tier entry, read as model text. Keep the one that carries a fact.

- Didactic disclaimers: `warto podkreślić`, `należy zauważyć, że`, `warto zaznaczyć`. Normal in formal Polish; act when they stand in for a fact.
- Praise words: `kluczowy`, `istotny`, `solidny`, `kompleksowy`, `innowacyjny`, `płynnie`, `wszechstronny`, `dynamiczny`, `imponujący`.
- Process verbs: `wykorzystać potencjał`, `usprawnić`, `zoptymalizować` with no measure, `zapewnić`, `wspierać`, `napędzać`.
- Stacked openers: `Ponadto,`, `Dodatkowo,`, `Co więcej,`, `Należy również` at the start of sentences in a row.
- Nominal style built on `w obszarze`, `w zakresie`, `w kontekście`, when a plain verb would do.
- A triad of adjectives for rhythm when the source supports fewer.

## Leave these alone

- The Polish dash (pauza) and dialogue dashes, the quotation marks `„ ”` and the genitive months are correct. Numbers use a space (or no-break space) as thousands mark and a comma as decimal mark: do not reformat a number, `--compare` counts it as a change.
- Quotations, names, code and attributed statements stay as written.
- A text with none of the first-tier entries stays byte-identical.
