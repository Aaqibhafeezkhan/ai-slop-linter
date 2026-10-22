# German tells the linter cannot see

Source: adapted and rewritten from the German word lists and pattern catalog of unslop (https://github.com/jlwin/unslop_ai, commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52, MIT); see `THIRD-PARTY-NOTICES.md`.

The linter ships no German rule (see `docs/LANGUAGES.md`), so for German text this list is the check. Read it after the linter has run and remove what you find by judgement. A word here is a tell when it is stock filler, not when it carries a technical meaning (`robust` in engineering, `Testament` in law). Judge the sentence.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `wir`, `unser`, `ich` or `mein` the source does not use. When a fix needs a detail the source lacks, cut or write the plain version, then run `--compare` again. Keep `du` or `Sie` as the source has it.

## Words: replace on sight when used as filler

Each one stands in for a claim. Say what actually happens, or cut it. Every detail you name (what changes, since when, for whom, which challenge) must come from the source.

- `eintauchen in`, `tauchen wir ein`, `werfen wir einen Blick auf`: announce instead of start. Start with the content.
- `beleuchten` (a topic): use `erklären`, `zeigen`, `untersuchen`.
- `Potenzial entfesseln`, `das volle Potenzial ausschöpfen`, `Potenziale entfalten`: name what becomes possible.
- `auf ein neues Level heben`, `Gamechanger`, `bahnbrechend`, `revolutionär`, `eine neue Ära einläuten`: say what changes, from when.
- `nahtlos`, `ganzheitlich`, `maßgeschneidert`: describe the step that is saved, list what is included, name who it fits.
- `zukunftsweisend`, `wegweisend`, `richtungsweisend`, `Meilenstein` (for a routine event): state the event plainly.
- `die Weichen stellen`, `den Grundstein legen`, `Brücken schlagen`, `Synergien nutzen`, `Mehrwert bieten`: name the decision, the link or the benefit.
- `zeugt von`, `unterstreicht`, `spiegelt wider`, `steht sinnbildlich für`: these add weight, not facts. Use `zeigt`, or state the fact directly.
- `vielfältig`, `facettenreich`, `unverzichtbar`, `essenziell`, `spannend` as all-purpose praise: list the facets, give the reason, or cut.
- `im Herzen von`, `eingebettet in`, `pulsierend`, `lebendig` for places: `liegt in`; say what is there.
- `Herausforderungen meistern`: which ones, and how.

## Words: act when two or more cluster in a paragraph

`optimieren`, `effizient` (with no measure), `innovativ`, `nachhaltig` as a general adjective, `zentral`, `entscheidend`, `maßgeblich`, `umfassend`, `gezielt`, `individuell`, `flexibel`, `transparent`, `agil` as self-praise, `smart`, `digitale Lösungen`, `zeitnah`, `proaktiv`, `niederschwellig`, `praxisnah`, `zielführend`, `auf Augenhöhe`, `360-Grad`, `End-to-End` outside a real process chain. One is normal German. A cluster is a brochure. Keep the one that carries a fact.

## Stock phrases

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

## German special cases

- The `Fazit` ritual: a closing heading `Fazit` that repeats what was said. Keep a closing section only if it adds a consequence, a decision or a next step from the source; otherwise stop earlier.
- Calques from English: `Ich hoffe, diese E-Mail erreicht Sie wohlbehalten`, over-polite openers (`Selbstverständlich unterstütze ich Sie gerne bei`). German business mail opens with the matter.
- Register switch: `du` in one paragraph and `Sie` in the next reads as spliced text. Use the form the source uses most.
- Sham breadth: `Von der Buchhaltung bis zur Cloud`, `Ob Handwerksbetrieb oder Konzern`. The span stands in for a claim. Name the real audience or topics from the source; a real range stays.
- Noun chains: `die Realisierung der Optimierung der Prozesse`. Use a verb: `die Prozesse verbessern`.
- Rhetorical question as scaffolding: `Doch wie funktioniert das?` followed by the answer. Give the answer.
- Realization coda: `Und da wurde mir klar: ...` after a story. End on the event.

## Leave these alone

- A spaced en dash (`–`) is a correct German Gedankenstrich. An unspaced em dash or `--` in German text is the tell; replace it with a comma, a full stop or a colon.
- German quotation marks, the decimal comma, `50 %` with a space, and dates such as `24.08.2026` are correct. Do not convert number formats: `--compare` counts a reformatted number as a change.
- Quotations, names, code and attributed statements stay as written.
