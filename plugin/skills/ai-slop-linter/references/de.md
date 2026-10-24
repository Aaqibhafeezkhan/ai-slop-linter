# German tells the linter cannot see

Source: adapted and rewritten from the German word lists and pattern catalog of unslop (https://github.com/jlwin/unslop_ai, commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52, MIT), including its load-bearing metaphor and participle tail entries; the second-tier word list adds words that Juzek (2026, https://github.com/tjuzek/ai-34-languages, commit 0cf18ff2458007fe51a14059a73d9e7468ed4da9, data CC0 1.0) measured as overused by a language model in German news text; see `THIRD-PARTY-NOTICES.md`.

The linter ships no German rule (see `docs/LANGUAGES.md`), so for German text this list is the check. Read it after the linter has run and remove what you find by judgement. A word here is a tell when it is stock filler, not when it carries a technical meaning (`robust` in engineering, `Testament` in law). Judge the sentence.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `wir`, `unser`, `ich` or `mein` the source does not use. When a fix needs a detail the source lacks, cut or write the plain version, then run `--compare` again. Keep `du` or `Sie` as the source has it.

The entries come in two tiers. The first tier is a tell on one sighting when it is used as filler. The second tier is normal German one at a time: act only when several appear in one paragraph, or next to a first-tier entry. A sentence that holds no entry stays as it is.

## Act on one sighting

### Words used as filler

Each one stands in for a claim. Say what actually happens, or cut it. Every detail you name (what changes, since when, for whom, which challenge) must come from the source.

- `eintauchen in`, `tauchen wir ein`, `werfen wir einen Blick auf`: announce instead of start. Start with the content.
- `beleuchten` (a topic): use `erklären`, `zeigen`, `untersuchen`.
- `Potenzial entfesseln`, `das volle Potenzial ausschöpfen`, `Potenziale entfalten`: name what becomes possible.
- `auf ein neues Level heben`, `Gamechanger`, `bahnbrechend`, `revolutionär`, `eine neue Ära einläuten`: say what changes, from when.
- `nahtlos`, `ganzheitlich`, `maßgeschneidert`: describe the step that is saved, list what is included, name who it fits.
- `zukunftsweisend`, `wegweisend`, `richtungsweisend`, `Meilenstein` (for a routine event): state the event plainly.
- `die Weichen stellen`, `den Grundstein legen`, `Brücken schlagen`, `Synergien nutzen`, `Mehrwert bieten`: name the decision, the link or the benefit.
- `zeugt von`, `unterstreicht`, `spiegelt wider`, `steht sinnbildlich für`: these add weight, not facts. Use `zeigt`, or state the fact directly.
- `im Herzen von`, `eingebettet in`, `pulsierend` for places: `liegt in`; say what is there.
- `Herausforderungen meistern`: which ones, and how.

### Load-bearing metaphors

- A verb of weight in place of a result: `das trägt`, `das Konzept trägt`, `trägt Früchte`, `zahlt sich aus`, `greift` (`die Maßnahme greift`), `hält` (`das Argument hält`), `steht und fällt mit`. It sounds decisive and names no measure. Write the plain verb with the criterion from the source (`die Fehlerquote sank von 4 auf 2 %`), or cut the sentence. Do not reach for another image.
- The same weight as a noun, when it names no function: `das Rückgrat`, `das Fundament`, `das Herzstück`, `die tragende Säule`. Say what the part does.
- Literal uses stay: `die Wand trägt das Dach`, `die Datei trägt den Namen`, `das Gesetz greift ab 1. Januar` with a date.

### Participle tails

- A trailing clause that grades the sentence before it: `..., was die Bedeutung von X unterstreicht`, `..., was das Engagement des Teams zeigt`, `..., womit X einen wichtigen Beitrag leistet`, `..., und setzt damit ein Zeichen`. Cut it, or give it its own sentence with a fact from the source.
- A trailing clause that states a fact stays: `..., was die Kosten um 12 % senkte`.

### Tools that decide on their own

- A tool, software or system given a will of its own: `Unser Tool entscheidet selbst`, `Die Software entscheidet selbst`, `Das System entscheidet automatisch`, `Das Tool entscheidet, welches Modell antwortet`, `Die KI weiß, was du brauchst`, `Die Regeln aktualisieren sich selbst`. It sounds like a feature and names no mechanism. Say what the software does and by which rule, from the source (`Das Tool wählt das Modell nach der Länge der Anfrage`), or name who decides. Add no mechanism, number or owner the source lacks; when the source gives none, write the plain verb (`wählt`, `setzt`) without a reason. Ordinary technical verbs stay: `der Parser liest die Datei`, `der Test schlägt fehl`.

### Stock phrases

- Openers: `In der heutigen digitalen Welt`, `In unserer schnelllebigen Zeit`, `Im Zeitalter von`, `Immer mehr Unternehmen`, `Wir alle wissen`, `Kennen Sie das?`, `Stellen Sie sich vor` in place of the argument. Start with the first fact.
- Transitions: `Es ist wichtig zu beachten, dass`, `Dabei gilt es zu berücksichtigen`, `Hierbei spielt ... eine entscheidende Rolle`, `Doch was bedeutet das konkret?`, `Die Antwort lautet:`, `Hier kommt X ins Spiel`, `Interessanterweise`. State the point.
- Contrast against nobody: `nicht nur ... sondern auch` when the first half is not in doubt, `Das heißt nicht, dass ...`, `Man könnte meinen ...`, `Versteh mich nicht falsch`. Say the second half directly.
- Reader steering: `Das ist wichtiger, als es klingt`, `Entscheidend dabei:`, `Wichtig zu verstehen:`, `Und genau das ist der Punkt`, `Anders gesagt` after a clear sentence. Cut the aside.
- Faux insight: `Was die meisten übersehen`, `Was dir niemand sagt`, `Die unbequeme Wahrheit ist`. Make the claim on its own.
- Staged emphasis: `Lies das nochmal.`, `Lass das mal sacken.`, a word in capitals for weight, `Und das Beste daran?`, `Der Clou:`, `Spoiler:`. Write the plain sentence.
- False agency: `Die Zahlen sprechen für sich`, `Die Daten erzählen eine Geschichte`, `zeichnet ein klares Bild`. Give the number or name who decided, from the source.
- Slogans and templates: `Weniger X. Mehr Y.`, `Drei zentrale Erkenntnisse`, `Obwohl X vielversprechend ist, bleibt Y eine Herausforderung`, `Einerseits ... andererseits` with no verdict, `In diesem Beitrag schauen wir uns ... an`.
- Closers: `Zusammenfassend lässt sich sagen`, `Unterm Strich`, `Am Ende des Tages`, `Es bleibt abzuwarten`, `Die Zukunft bleibt spannend`, `Eines steht fest:`, `Sind Sie bereit für ...?`, `Lust auf mehr?`. End on the last fact.
- Chat residue: `Gerne erstelle ich Ihnen`, `Ich hoffe, das hilft!`, `Lassen Sie es mich wissen, falls`, `Selbstverständlich!`, `Das ist eine gute Frage`, `Soll ich weitermachen?`, `Gehen wir das Schritt für Schritt durch`. Delete the wrapper, keep the content.

### German special cases

- The `Fazit` ritual: a closing heading `Fazit` that repeats what was said. Keep a closing section only if it adds a consequence, a decision or a next step from the source; otherwise stop earlier.
- Calques from English: `Ich hoffe, diese E-Mail erreicht Sie wohlbehalten`, over-polite openers (`Selbstverständlich unterstütze ich Sie gerne bei`). German business mail opens with the matter.
- Register switch: `du` in one paragraph and `Sie` in the next reads as spliced text. Use the form the source uses most.
- Sham breadth: `Von der Buchhaltung bis zur Cloud`, `Ob Handwerksbetrieb oder Konzern`. The span stands in for a claim. Name the real audience or topics from the source; a real range stays.
- Rhetorical question as scaffolding: `Doch wie funktioniert das?` followed by the answer. Give the answer.
- Realization coda: `Und da wurde mir klar: ...` after a story. End on the event.

## Act only when several appear

One of these is normal German. A cluster is a brochure. Keep the one that carries a fact, and cut or plainly restate the rest.

- Praise and process words: `optimieren`, `effizient` (with no measure), `innovativ`, `nachhaltig` as a general adjective, `zentral`, `entscheidend`, `maßgeblich`, `umfassend`, `gezielt`, `individuell`, `flexibel`, `transparent`, `agil` as self-praise, `smart`, `digitale Lösungen`, `zeitnah`, `proaktiv`, `niederschwellig`, `praxisnah`, `zielführend`, `auf Augenhöhe`, `360-Grad`, `End-to-End` outside a real process chain.
- All-purpose praise: `vielfältig`, `facettenreich`, `unverzichtbar`, `essenziell`, `spannend`, `lebendig`.
- Words a model overuses in German news text (Juzek 2026, CC0): `betonen`, `hervorheben`, `insbesondere`, `zudem`, `beeindruckend`, `vielversprechend`, `präzise`, `sorgfältig`, `tiefgründig`, `kontinuierlich`, `ausgewogen`, `harmonisch`, `kunstvoll`, `eingängig`, `unerlässlich`, `Herausforderung`, `Transparenz`, `Gemeinschaftsgefühl`, `Vielseitigkeit`. Several in one paragraph point to generated text; one says nothing.
- Noun chains: `die Realisierung der Optimierung der Prozesse`. Use a verb: `die Prozesse verbessern`.
- Parataxis chains: `Kurzer Satz. Noch einer. Und noch einer.` Join them with a conjunction where the source gives the link.
- Stacked hedges: `könnte möglicherweise`, `unter Umständen eventuell`. One hedge, where the source is unsure.

## Leave these alone

- A spaced en dash (`–`) is a correct German Gedankenstrich. An unspaced em dash or `--` in German text is the tell; replace it with a comma, a full stop or a colon.
- German quotation marks, the decimal comma, `50 %` with a space, and dates such as `24.08.2026` are correct. Do not convert number formats: `--compare` counts a reformatted number as a change.
- Quotations, names, code and attributed statements stay as written.
