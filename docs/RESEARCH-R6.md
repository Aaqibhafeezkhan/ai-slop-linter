# R6 research: multilingual AI-writing tells, hedges and softeners

Date: 2026-10-22. Scope: read-only research for ai-slop-linter. About 36 fetches. Output files: this file and `candidates.tsv` (71 rows, 8 columns; every regex was self-tested against its own example sentence).

Catalog check: "in_catalog" compares against `skills/ai-slop-linter/references/*.tells.txt` and `*.md` only. There is no pt, nl, it, tr, pl, ru, ja or id reference file, so every row for those languages is "no".

## 1. Source families

### 1.1 Wikipedia "Signs of AI writing" and language versions
- en: https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing. Licence CC BY-SA 4.0. Usable as a source of facts about patterns (we adapt facts, not prose). Gave: hedge disclaimers (WP:AIDISCLAIMER), didactic disclaimers (WP:DIDACTIC), vague association, vague attribution, collaborative-communication openers (WP:COLLABCOMM), corrective framings. The page is 228k characters. I read characters 0 to 200000; the last 28k were not read.
- de: https://de.wikipedia.org/wiki/Wikipedia:Anzeichen_für_KI-generierte_Inhalte. CC BY-SA 4.0. Rich: hedges, vague evidentials, reassurance, openers, closers.
- fr: https://fr.wikipedia.org/wiki/Aide:Identifier_l'usage_d'une_IA_générative. CC BY-SA 4.0. Thin on literal phrases (mostly structural and typographic tells).
- pt: https://pt.wikipedia.org/wiki/Wikipédia:Sinais_de_texto_gerado_por_inteligência_artificial. CC BY-SA 4.0. Rich. It says `tende a` and `talvez` are more typical of human writing; the TSV keeps that note.
- ru: https://ru.wikipedia.org/wiki/Википедия:Признаки_сгенерированности_текста. CC BY-SA 4.0. Rich, including knowledge-cutoff disclaimers.
- The English page's language links list only de, fi, fr, he, pt, ru, th, zh. No es, nl, it, tr, pl, ja or id version exists.
- Caveat: the pages say none of these phrases is proof alone. Treat hits as review prompts.
- Method caveat: WebFetch summarises pages with a small model, so quoted phrases came through a summariser, not a raw text dump. Spot-check before shipping any pattern.

### 1.2 Wikipedia community discussions (weak, single-thread sources)
- nl: https://nl.wikipedia.org/wiki/Wikipedia:De_kroeg/Archief/20250714. Editors name euphemistic role claims ("was belangrijk voor de muziek", "had een groot aandeel", "wordt nog altijd beschouwd als"). Several editors say style-based detection is unreliable. One usable pattern family only.
- es: https://es.wikipedia.org/wiki/Wikipedia:Café/Portal/Archivo/Propuestas/2025/03. One editor lists tells ("ofrece a los visitantes una visión integral", "Claro, aquí tienes", "Lo siento, ... modelo de lenguaje de IA no puedo", single words such as vibrante, crucial). Another editor argues similar prose is not proof. The list is described as incomplete.
- ja: https://ja.wikipedia.org/wiki/Wikipedia:コメント依頼/A2198useuser (search snippet only; page body not fetched). Tells: asterisks, bold, rules, fullwidth-colon labels, sentences ending in an abstract noun.
- tr, pl, id, it: searches of project namespaces found no page that lists tells (pl and id have only deletion and abuse threads). Nothing usable.

### 1.3 Competitor catalogs (MIT; idea and attribution only; read from /tmp/r6-research/clones)
- conorbronsdon/avoid-ai-writing (MIT): English hedge-stack ("could potentially", "may eventually unlock") and counted-list openers ("Three key takeaways", "Five things to know", "Here are the top seven"; SKILL.full.md near lines 438 and 701). English only. Its README links community adaptations.
- blader/humanizer (MIT): hedged fact after an availability disclaimer ("appears to have been established sometime in the 1990s", SKILL.md line 331; stacked qualifiers, line 172).
- jlwin/unslop_ai (MIT): German word lists (`skills/unslop/references/word-lists.md`). Already largely mirrored in our de.tells.txt. Not re-listed in the TSV except where Wikipedia independently confirms a phrase.
- berelevant-ai/slopless (MIT): English signposts only ("let's dive in", "as we explore"). No other languages.
- m4bwav/everwrite, yasyf/slop-cop: no non-English hedge material found.

### 1.4 Community multilingual adaptation (licence problem)
- https://github.com/jurigis/avoid-ai-writing-multilingual (SKILL-DE, -FR, -IT, -RO, -SV). The GitHub API reports licence `NOASSERTION` ("Other"). I read only SKILL-IT.md. Italian rows in the TSV come from it and are marked idea-only: do not copy its text; obtain a second independent source before shipping. SKILL-FR.md and SKILL-DE.md were not read; they are the best next fetch for fr.
- https://github.com/mariorabeloneto/evitar-escrita-ia (European Portuguese). Has a LICENSE file (type not checked); its README calls the vocabulary tables editorial hypotheses. Not read beyond the file list.

## 2. Per-language summary (full rows in candidates.tsv)

Counts: en 13, de 12, pt 12, ru 12, it 10, es 6, fr 3, ja 2, nl 1. No rows for tr, pl, id (no sources found). The target of 8 to 20 per language is met only for en, de, pt, ru, it.

### en
Classes: hedge-modal (modal + adverb stack; "efforts are ongoing"; "can be challenging"), vague-link (associated with / in connection with; experts argue / industry reports), reassurance-qualifier (while details are limited; based on available information), counting-opener (here are N; key takeaways), wrapper, closer, other (corrective framing). New to our catalog: availability hedges, the "important to note" family, counted openers, "Answer: Here are several".

### de
Hedges: Obwohl spezifische Details begrenzt/rar; basierend auf verfügbaren Informationen; nicht allgemein dokumentiert. Evidentials: Branchenberichte, Beobachter haben zitiert, Einige Kritiker argumentieren. Openers and closers: Natürlich!, hier ist ein, detailliertere Aufschlüsselung, Möchten Sie, gibt es noch etwas. Already in de.tells.txt: Es ist wichtig zu beachten (partial), Ich hoffe, das hilft, lassen Sie es mich wissen (partial). The rest are new.

### pt (no catalog yet)
Hedges: pode variar; tende a / talvez (weak). Evidentials: especialistas apontam, alguns críticos argumentam, diversos veículos noticiaram. Didactic: é importante notar, vale ressaltar/destacar. Connectors: além disso, nesse sentido, adicionalmente, por conseguinte. Stock: papel crucial/fundamental, marco importante, reflete uma mudança mais ampla, consolidou seu legado. Closers: em suma, em conclusão, espero que isso ajude. Parallelism: não apenas ... mas também.

### ru (no catalog yet)
Evidentials: По словам экспертов, Некоторые критики утверждают. Hedges: может быть различным, могут варьироваться. Availability hedge: Хотя подробности не задокументированы широко. Didactic: Однако важно отметить. Stock: играет важную роль, неизгладимый след, может похвастаться. Cutoff: На момент моего обучения. Openers: В этой статье мы рассмотрим, Ниже представлен. Closers: Подводя итог, Надеюсь, это помогло.

### it (no catalog yet; single source, licence unclear)
Modal stack (potrebbe eventualmente contribuire a), softeners (In linea generale, In sostanza), evidentials (gli esperti affermano, studi dimostrano), reassurance (Ottima domanda!), counted openers (5 motivi per cui, Vediamo passo per passo), stock, closers, cutoff disclaimer. The source states it has no "sembra essere legato" entry and no "ecco tre/cinque" entry.

### es
Wrappers: Claro, aquí tienes; Lo siento, como modelo de lenguaje. Stock: ofrece a los visitantes una visión integral; es una excelente opción; vibrante/versátil/crucial. Existing es.tells.txt already has es importante destacar que, cabe señalar que, espero que esto te ayude, en conclusión, no solo ... sino también. No es source found for hedge-modal or vague-link.

### fr
Three weak rows only: Voici une version complète, le plus sûr reste de vérifier, and a style marker with no literal phrase. Existing fr.tells.txt is already broader than this source.

### nl, tr, pl, id, ja
nl: one pattern family. ja: two structural tells (need morphology). tr, pl, id: no sourced pattern; dropped.

## 3. Language-independent deterministic detection ideas

All proposals need review-level severity, not automatic rewrite.

1. Modal x vagueness stack. A per-language modal lexicon (en could/may/might; de könnte/dürfte; fr pourrait; es podría; pt poderia; it potrebbe; nl zou kunnen; tr -ebilir; ru может) within 3 tokens of a hedge adverb (potentially/possibly/eventually; möglicherweise/eventuell; potentiellement; potencialmente; eventualmente; mogelijk; muhtemelen; возможно). Support: WP en ("could potentially impact"), conorbronsdon, jurigis-it. False-positive risk: medium in scientific and legal text, where the stack can be legitimate; low in marketing copy. In rewrite mode, require that the source has no such hedge.
2. Vague-link evidential. Link verb or participle (associated with, linked to; assoziiert mit, im Zusammenhang mit; lié à; asociado a; associado a; legato a; gerelateerd aan; ilişkili; связан с) crossed with a hedge verb (seems/appears to be; scheint; semble; parece; sembra; lijkt; görünüyor; кажется). The combined "seems to be related to" shape has direct support only in English (WP en vague connection, blader example); I found no non-English source for the combined shape. False-positive risk: medium to high, since seems/appears alone is common in honest prose. Require both halves.
3. Unnamed authority + opinion verb (experts/critics/observers/industry reports; Experten, Kritiker, Branchenberichte; especialistas; esperti; эксперты). Support: en, de, pt, ru, it. False-positive risk: medium; raise it when no name or citation follows in the same sentence.
4. Availability disclaimer (while details are limited; not widely documented; based on available information). Support: en, de, ru. False-positive risk: low; strong signal, because the text reports missing data instead of data.
5. Reassurance or affirmation at sentence start (Certainly!, Natürlich!, Claro, Конечно, Ottima domanda!). False-positive risk: low at the start of a document or paragraph; high in dialogue and interviews.
6. Counted-list announcer: number word or digit followed by a list noun (things, ways, reasons, tips; motivi, strategie) or "here is/are". Cheap per-language regex. False-positive risk: medium (headlines, recipes). Raise severity only when the following lines are a list that repeats the number.
7. Didactic disclaimer: "it is important to" + note/remember/consider in each language (see pt, de, ru, it rows). False-positive risk: low to medium.
8. Sentence-initial connector density (além disso, additionally, Zusätzlich) as a count per 100 words, not as single hits. False-positive risk per hit is high; use a density threshold.
9. Missing-source booster: any of 1 to 4 with no digit, name or date in the same sentence raises confidence.

## 4. Sources that gave nothing
- arXiv API, five queries (multilingual hedging, epistemic markers, hedge detection, marker words): three returned zero results; two returned only English example markers ("I think it's"). No lexicon released.
- Hugging Face datasets search ("hedge cue"): empty response. No licence recorded, nothing used.
- GitHub repository search (multilingual humanizer; Turkish): zero results.
- Guessed titles for weasel-word pages on de, fr, es, nl and it Wikipedia: all 404 (five wasted fetches). Titles should come from the langlinks of the English "Weasel word" article.
- Wikipedia tr, pl, id searches: discussion pages only, no tell lists.
- Open hedge lexicons (CoNLL-2010, BioScope, Hyland) and Spanish, Portuguese, Dutch, German or French attenuation lists were not fetched. The fetch budget went to tell sources. This is the largest remaining gap for hedge-modal and vague-link in nl, tr, es and fr.

## 5. Licence notes
- Wikipedia text: CC BY-SA 4.0. The TSV records short phrases as facts about patterns and uses our own example sentences; no prose is copied. Cite the page URL if an entry needs attribution.
- jurigis/avoid-ai-writing-multilingual: NOASSERTION. Italian rows are idea-only until a second source confirms them.
- MIT competitor repos: attribution required if text is copied; only ideas were taken.

## 6. Controller note (added when the research was committed, before any code)

The research agent read no benchmark file. Cost of the research run: 0.755 US dollars (`total_cost_usd`). Relevant result for the design: no independent source lists a Spanish modal-hedge phrase of the "could reduce" kind, nor a Portuguese "seems to be related to" phrase; the combined "seems to be related to" shape has an independent source for English only (section 3, idea 2). Therefore no phrase of that kind is added as a literal for es or pt (see the addendum to "Round 6 design" in `docs/HEAD-TO-HEAD.md`).
