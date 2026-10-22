# Pattern candidates for the language packs

Every pattern measured for the French, Spanish and German packs, with the counts it got. The tables are copied from the review notes of 21 October 2026, which were not committed. A row is a candidate, not a rule: only the rules listed in `src/rules/fr.ts` ship, and a verdict says why each other candidate was dropped.

Read the columns this way:

- H: human hits, written as hits / files. The human corpus is the files under `bench/packs/human/<lang>/` and the `bench/typography/<lang>-*.md` excerpts.
- M: machine hits, written as hits / files. The machine corpus is the files under `bench/packs/machine/<lang>/`.
- negatives fired: how many hand-written ordinary sentences the candidate also matched. A candidate whose negatives fire is an ordinary phrase, not a tell.
- verdict: why the candidate was kept or dropped. "Dropped: one product" means every machine hit came from one product's files.

The counts come from one model (`claude-sonnet-5-5`), mostly on invented products and documents. They are not detection rates. Corpus sizes and provenance are in `bench/packs/MANIFEST.md`, and the current table of rules per language is in `bench/PACKS.md`.

## Sources of the candidates

- French: the h1 fixture of the head-to-head benchmark (`bench/head-to-head/fixtures/h1/note.md`), and phrases that recur in the machine corpus. unslop has no French list.
- Spanish: the Spanish banned-word list of anti-ai-writing (`skills/anti-ai-writing/references/banned-list.md`), and phrases that recur in the machine corpus.
- German: unslop's German word tiers and stock phrases, and phrases that recur in the machine corpus.

Licences and attribution: `THIRD-PARTY-NOTICES.md`.

## The shipping limit

A rule ships in a pack only if all of these hold, which `test/packs.test.mjs` checks for every registered pack:

1. It produces zero findings on every human file of its language.
2. It produces at least one finding on the machine corpus of its language.
3. The human corpus has at least 500 words and the machine corpus at least 300.

The review also rejected a candidate with a human hit, a hit only in one product's files, a single sentence as its only machine hit, or a frame fitted to the hits it was measured on. Those are judgement calls, and the verdict column says which one applied.

## How to propose a pattern

1. Write the pattern and at least three ordinary sentences in the language that it must not match.
2. Measure it as described below. It must pass the shipping limit on the current corpora.
3. Open an issue with the pattern, the counts and the source of the phrase (for example a published style guide, or the Wikipedia page on signs of AI writing). A list drawn from your own reading does not go in, as `CONTRIBUTING.md` says.
4. Add the rule to `src/rules/<lang>.ts`, register it in `languageRules` in `src/index.ts`, and run `node bench/packs.mjs` to regenerate `bench/PACKS.md`.

## How to re-measure

1. Run `node bench/packs.mjs --check`. It fails when the committed `bench/PACKS.md` is stale, and passes on the current corpora.
2. Write the candidate as a rule object of the same shape as the rules in `src/rules/fr.ts`: an `id` and a `check(doc)` function over the prepared document.
3. In a scratch script at the repository root, import `measure` and `corpusFor` from `bench/packs-lib.mjs`, then call `measure([rule], corpusFor("fr").human)` and `measure([rule], corpusFor("fr").machine)`. `measure` returns the word count and, per rule id, the number of findings and the number of files that had one.
4. Run the same call on your negative sentences, as `measure([rule], [{ name: "negatives.md", text }])`, and confirm they produce no finding.

Replace `"fr"` with `"es"` or `"de"` for the other languages.

## French (`fr`)

Human corpus: 14 files, 40,160 words. Machine corpus: 22 files, 4,373 words. One rule ships: `fr/closer`, provisional, from the candidate `dès aujourd'hui` after a call to act.

| candidate | human words hit (H) / files | machine hits (M) / files | verdict |
|---|---:|---:|---|
| `nb-ce-n-est-pas-c-est` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence; the frame would also match ordinary 'n'est pas seulement ..., c'est aussi' (not run) |
| `nb-n-est-pas-mais` | 0 / 0 | 0 / 0 | dropped: no machine hit; 'pas seulement ..., mais' is ordinary French (review negative) |
| `nb-non-seulement` | 2 / 2 | 0 / 0 | dropped: human hits (wiki-logiciel-libre, git-wikipedia) |
| `nb-non-seulement-aussi` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `nb-pas-seulement-c-est-aussi` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `nb-c-est-une-after` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `v-plongeons` | 0 / 0 | 0 / 0 | dropped: no machine hit (h1 tell, not covered) |
| `v-veritable-revolution` | 0 / 0 | 0 / 0 | dropped: no machine hit (h1 tell, not covered) |
| `v-revolution-bare` | 3 / 2 | 2 / 2 | dropped: human hits; also the historical noun |
| `v-revolution-la-de` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `v-revolutionnaire` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence; 'les armes révolutionnaires' is ordinary |
| `v-robuste-et` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence (review negative 'un pont robuste et économique' shows the frame is ordinary) |
| `v-robuste-bare` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `v-sans-faille` | 0 / 0 | 0 / 0 | dropped: no machine hit (h1 tell, not covered) |
| `v-fluide-bare` | 0 / 0 | 2 / 2 | dropped: Fastq only; the bare word is also the physics noun |
| `v-fluide-frame` | 0 / 0 | 2 / 2 | dropped: Fastq files only (both hits in Fastq article and README) |
| `v-tisser` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-paysage` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-temoignage` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-incontournable` | 1 / 1 | 0 / 0 | dropped: human hit (wiki-marketing: ordinary use) |
| `v-a-la-pointe` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-au-coeur` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-devoiler` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-liberer-puissance` | 0 / 0 | 3 / 3 | dropped: 3 hits, all in the Fastq files (suspect, one product) |
| `v-liberer-any` | 0 / 0 | 3 / 3 | dropped: same 3 Fastq hits; bare verb too broad |
| `v-exploiter-potentiel` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-monde-constante` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-monde-mutation` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `v-dans-un-monde-ou` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `v-bond-avant` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `v-ravi-annoncer` | 0 / 0 | 1 / 1 | dropped: one sentence (linkedin-verigo) |
| `v-simplifie-la-vie` | 0 / 0 | 1 / 1 | dropped: one sentence (product-page-calbo) |
| `v-sans-compromis` | 0 / 0 | 2 / 2 | dropped: Fastq files only |
| `v-a-toute-epreuve` | 0 / 0 | 3 / 3 | dropped: Fastq files only (3 of 3 hits) |
| `v-fini-les` | 0 / 0 | 4 / 4 | NOT SHIPPED, reported: 4 hits in 4 products, 0 human. Only a frame that excludes the review negative 'Fini les travaux...' is an adjective list fitted to these four hits; not validated, so not shipped |
| `v-fini-les-complexes` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `v-au-service-de` | 2 / 1 | 0 / 0 | dropped: human hits (wiki-doctolib, ordinary) |
| `c-n-hesitez` | 0 / 0 | 1 / 1 | dropped: one sentence (school notice); a normal phrase in letters |
| `c-avenir` | 0 / 0 | 0 / 0 | dropped: no machine hit (h1 tell, not covered) |
| `c-en-conclusion-start` | 0 / 0 | 0 / 0 | dropped: no machine hit (h1 tell, not covered) |
| `c-en-conclusion-any` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `c-espere-aide` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `c-dites-nous` | 0 / 0 | 1 / 1 | dropped: Fastq only (review negative 'Dites-nous ce que vous en pensez : ...' shows the frame is ordinary) |
| `c-suivez-le-guide` | 0 / 0 | 1 / 1 | dropped: Fastq only; review negative 'Suivez le guide, il connaît le chemin du refuge.' |
| `c-rejoignez-communaute` | 0 / 0 | 4 / 3 | dropped: all 3 files Fastq; review negative 'Rejoignez la communauté de communes' |
| `c-rejoignez-any` | 0 / 0 | 4 / 3 | dropped: all 3 files Fastq; bare verb too broad |
| `c-ensemble-construisons` | 0 / 0 | 1 / 1 | dropped: Fastq only |
| `cb-en-tant-qu-ia` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `cb-bien-sur-excl` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `cb-voici-version` | 0 / 0 | 1 / 1 | dropped: one sentence (chat-rewrite-paragraph) |
| `cb-voici-bare` | 3 / 1 | 1 / 1 | dropped: human hits (py-docs-logging, ordinary 'Voici le') |
| `cb-espere-vous` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `cb-hesitez-demander` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `cb-je-ne-connais-pas-de` | 0 / 0 | 1 / 1 | dropped: Fastq only (one sentence) |
| `cb-je-ne-connais-pas-any` | 0 / 0 | 1 / 1 | dropped: Fastq only; review negative 'Je ne connais pas de projet de loi' fires on the bare frame |
| `cb-si-vous-mindiquez` | 0 / 0 | 1 / 1 | dropped: Fastq only; review negative 'Si vous m'indiquez votre adresse, je vous envoie le colis.' has the same frame |
| `cb-souhaitez-vous` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `cb-je-peux-vous-aider` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `a-dans-cet-article-nous` | 0 / 0 | 2 / 2 | dropped: review negative 'Dans cet article, nous reviendrons sur la décision du 4 mars.' fires; the signpost is ordinary French, so no tightening keeps it without fitting |
| `a-dans-cet-article-any` | 0 / 0 | 2 / 2 | dropped: same frame; review negative fires |
| `a-important-noter` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `a-convient-souligner` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `a-sans-plus-tarder` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `s-de-pointe` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `s-inegale` | 1 / 1 | 0 / 0 | dropped: human hit |
| `s-sans-precedent` | 0 / 0 | 0 / 0 | dropped: no machine hit |
| `s-repousser` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence; review negative 'Il veut repousser les frontières du parc national.' |
| `s-partenaire` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `s-vous-en-avez-assez` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `s-vous-en-avez-assez-any` | 0 / 0 | 1 / 1 | dropped: one Fastq sentence |
| `dès aujourd'hui` after a call-to-act verb (new, from the machine files) | 0 / 0 | 4 / 4 | **SHIPPED** as fr/closer: frame `(essayez\|installez\|adoptez\|découvrez\|testez\|lancez-vous\|téléchargez\|profitez\|commencez) ... dès aujourd'hui`; 3 products (Fastq, Verigo, Calbo) |
| `dès aujourd'hui` bare | 0 / 0 | 4 / 4 | dropped as a bare phrase: ordinary French ('disponible dès aujourd'hui') |


## Spanish (`es`)

Human corpus: 8 files, 19,198 words. Machine corpus: 26 files, 5,152 words. No rule ships. Eleven machine files were regenerated on 21 October 2026 (see "Repairs" in `bench/packs/MANIFEST.md`), so the machine counts below are the counts on the repaired corpus where they are marked "re-measured".

### Structural tells and the ai-vocabulary list

| candidate | H | M | verdict |
|---|---:|---:|---|
| no solo ... sino (que) también | 0/0 | 0/0 | no hit |
| no solo ... sino | 2/2 | 0/0 | dropped: human hits (Historia de Internet, Software libre) |
| no es solo ... es | 0/0 | 0/0 | no hit |
| sumérgete en (and variants) | 0/0 | 0/0 | no hit |
| en el vertiginoso mundo | 0/0 | 0/0 | no hit |
| en el (vertiginoso/competitivo/cambiante/acelerado/digital) mundo (actual/de) | 0/0 | 0/0 | no hit |
| en el panorama actual | 0/0 | 0/0 | no hit |
| un testimonio de | 0/0 | 0/0 | no hit |
| desbloquear el potencial | 0/0 | 0/0 | no hit |
| liberar el potencial de | 0/0 | 0/0 | no hit |
| sin fisuras | 0/0 | 0/0 | no hit |
| tapiz / tapices | 0/0 | 0/0 | no hit |
| cabe destacar/mencionar/señalar/resaltar | 4/1 | 0/0 | dropped: human hits, machine none |
| es importante señalar/destacar/recordar | 0/0 | 0/0 | no hit |
| no dudes en | 0/0 | 0/0 | no hit |
| espero que esto te ayude | 0/0 | 0/0 | no hit |
| como modelo de lenguaje | 0/0 | 0/0 | no hit |
| el futuro es prometedor | 0/0 | 0/0 | no hit |
| en la actualidad | 1/1 | 0/0 | dropped: human hit, machine none |
| en el mundo actual | 0/0 | 0/0 | no hit |
| en el competitivo mundo de | 0/0 | 0/0 | no hit |
| hoy en día más que nunca | 0/0 | 0/0 | no hit |
| vale la pena mencionar que | 0/0 | 0/0 | no hit |
| marcar la diferencia | 0/0 | 0/0 | no hit |
| llevar al siguiente nivel | 0/0 | 0/0 | no hit |
| aprovechar al máximo | 0/0 | 0/0 | no hit |
| potenciar al máximo | 0/0 | 0/0 | no hit |
| además, | 8/3 | 0/0 | dropped: human hits, machine none |
| por otra parte, | 1/1 | 0/0 | dropped: human hit, machine none |
| cabe mencionar | 0/0 | 0/0 | no hit |
| en definitiva / en conclusión / sin lugar a dudas / de cara a / a fin de / punto de partida / de principio a fin / en la era digital / nos enorgullece / un nuevo nivel / pieza clave / es fundamental | 0/0 | 0/0 | no hit |
| en resumen | 1/1 | 0/0 | dropped: human hit |
| más allá de | 1/1 | 0/0 | dropped: human hit |
| en el corazón de | 1/1 | 0/0 | dropped: human hit |
| sin duda | 1/1 | 0/0 | dropped: human hit |
| de manera fluida/sencilla/eficiente | 1/1 | 0/0 | dropped: human hit |
| transformar la forma (en que) / revolucionar la forma | 0/0 | 1/1 | dropped: one sentence (readme-section, Fastq) |

### Single words from the Spanish word list

| word | H | M | verdict |
|---|---:|---:|---|
| adentrarse en | 0/0 | 0/0 | no hit |
| aprovechar / aprovechemos | 0/0 | 0/0 | no hit |
| brindar | 0/0 | 0/0 | no hit |
| crucial | 1/1 | 0/0 | dropped: human hit |
| desarrollar (forms) | 28/4 | 2/2 | dropped: human hits (ordinary "desarrollo") |
| diverso/a(s) | 5/2 | 0/0 | dropped: human hits |
| dinámico/a | 1/1 | 0/0 | dropped: human hit |
| empoderar | 0/0 | 0/0 | no hit |
| enriquecer | 0/0 | 0/0 | no hit |
| esencial | 0/0 | 0/0 | no hit |
| estimular | 1/1 | 0/0 | dropped: human hit |
| excepcional | 0/0 | 1/1 | dropped: one product (Fastq, readme-section) |
| explorar | 0/0 | 1/1 | dropped: one product (Fastq, docs-page) |
| fomentar | 4/2 | 1/1 | dropped: human hits |
| fortalecer | 0/0 | 0/0 | no hit |
| fundamental | 6/3 | 0/0 | dropped: human hits |
| holístico | 0/0 | 0/0 | no hit |
| imprescindible | 1/1 | 1/1 | dropped: human hit |
| innovador | 1/1 | 0/0 (re-measured; was 1/1) | dropped: human hit |
| integrar | 2/1 | 1/1 | dropped: human hits |
| interactuar | 0/0 | 0/0 | no hit |
| maximizar | 0/0 | 0/0 | no hit |
| multifacético | 0/0 | 0/0 | no hit |
| navegar | 1/1 | 0/0 | dropped: human hit (literal use) |
| notable | 0/0 | 1/1 | dropped: one product (Fastq, pull-request) |
| optimizar | 1/1 | 2/2 | dropped: human hit (optimización) |
| panorama | 0/0 | 0/0 | no hit |
| paradigma | 1/1 | 0/0 | dropped: human hit |
| permitirá | 0/0 | 0/0 | no hit |
| potenciar | 3/1 | 1/1 | dropped: human hits |
| potencial | 2/1 | 0/0 | dropped: human hits |
| relevante | 0/0 | 0/0 | no hit |
| revolucionario | 0/0 | 1/1 | dropped: one product (Fastq, docs-page) |
| robusto | 1/1 | 0/0 | dropped: human hit |
| sinergia | 0/0 | 0/0 | no hit |
| sólido | 3/1 | 0/0 (re-measured; was 1/1) | dropped: human hits |
| subrayar | 1/1 | 0/0 | dropped: human hit |
| transformar | 8/4 | 3/3 | dropped: human hits |
| tapiz / pivotal | 0/0 | 0/0 | no hit |

### Recurring phrases in the machine corpus

These were found by counting bigrams and trigrams that occur in at least three machine files and in no human file. Each was then tested against ordinary Spanish.

| candidate | H | M | negatives fired | verdict |
|---|---:|---:|---:|---|
| en (solo/apenas/unos) minutos | 0/0 | 5/5 (4 Fastq files, 1 Verbo) | 3/3 | dropped: bare phrase fires on ordinary narrative; a frame that excludes it is fitted to the 5 hits in 2 products (same reasoning as the French "fini les" candidate) |
| cualquier duda/pregunta/consulta | 0/0 | 2/2 (re-measured; was 3/3) | 3/3 | dropped: fires on ordinary administrative text; closing offer, the chatbot-residue class the French MANIFEST excludes |
| gracias por | 0/0 | 3/3 (re-measured; was 5/4) | 3/3 | dropped: ordinary letter closing; fires on ordinary negatives |
| pensado para | 0/0 | 3/3 | 3/3 | dropped: ordinary Spanish (the negative "un libro pensado para niños" fires) |
| datos reales | 0/0 | 2/2 (re-measured; was 4/4) | 3/3 | dropped: ordinary; the machine hits are placeholder-data disclaimers, residue |
| he redactado | 0/0 | 0/0 (re-measured; was 3/3) | 3/3 | dropped: no machine hit on the repaired corpus; ordinary "he redactado el acta" fires |
| si quieres que (redacte/...) | 0/0 | 0/0 (re-measured; was 3/3) | 3/3 | dropped: no machine hit on the repaired corpus; it was chatbot offer residue |
| permiso de escritura | 0/0 | 0/0 (re-measured; was 6/5) | n/a | no machine hit now. The earlier hits were the refused file writes of the first run, an artefact of the run, not Spanish; those files were regenerated |
| quieres que (alone) | 1/1 | 0/0 (re-measured; was 8/8) | n/a | dropped: human hit; no machine hit on the repaired corpus |
| es importante | 1/1 | 1/1 (re-measured; was 2/2) | 3/3 | dropped: human hit |
| descubre/descubra | 0/0 | 2/2 (Fastq docs-page and readme-section) | 2/3 | dropped: one product, ordinary verb |
| sin complicaciones / sin esfuerzo / fácil de usar / empieza hoy mismo | 0/0 | 1/1 each | n/a | dropped: one file each |

### Re-measurement after the corpus repairs

The eleven regenerated Spanish machine files changed the machine side of the Spanish table. The per-row
counts above were first measured with candidate patterns that were not committed, so this check was
done with reconstructed patterns (a case-insensitive phrase or word-stem match on the masked text) and
compared with the same patterns on the files as they stood before the repair. Rows whose machine count
differs from the first-round table are marked "re-measured" above; the others are unchanged to within
the reconstruction. The checks that matter for the shipping limit:

- Every candidate with zero human hits and machine hits in two or more files still fails: the hits are
  in one product's files (`descubre`), or ordinary Spanish fires on the hand-written negatives
  (`en minutos`, `cualquier duda`, `gracias por`, `pensado para`, `datos reales`).
- The residue candidates (`si quieres que`, `he redactado`, `permiso de escritura`) have no machine hit
  on the repaired corpus, so nothing in the Spanish table can pass on refusal or chatbot residue.
- No Spanish rule ships, as before. The French and German corpora were not changed in this round, so
  their tables and `fr/closer` (0 human hits; 4 hits in 4 files of 4,373 words) stand.

## German (`de`)

Human corpus: 8 files, 20,748 words. Machine corpus: 30 files, 5,343 words. No rule ships.

| candidate | H (hits/files) | M (hits/files) | negatives fired | machine files | verdict |
|---|---:|---:|---:|---|---|
| nicht nur ... sondern auch | 2/2 | 0/0 | n/a | none | dropped: human hits |
| eintauchen / tauchen wir ein | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| in der heutigen (digitalen oder schnelllebigen) Welt/Zeit | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| ein Beweis für | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| nahtlos | 0/0 | 2/2 | 3/3 | article-intro.md, readme-section.md | dropped: negatives fire (ordinary German) |
| robust(e) Lösung | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Teppich | 1/1 | 0/0 | n/a | none | dropped: human hits |
| es ist wichtig zu beachten | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| zögern Sie nicht | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| ich hoffe, das hilft | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| als KI-Sprachmodell | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Zukunft sieht rosig aus | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| ganzheitlich | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| wegweisend | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| maßgeschneidert | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Gamechanger/bahnbrechend/revolutionär | 0/0 | 1/1 | 2/3 | pull-request.md | dropped: negatives fire (ordinary German) |
| das volle Potenzial | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Potenzial entfalten/entfesseln | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| auf ein neues Level | 0/0 | 1/1 | 2/3 | pull-request.md | dropped: negatives fire (ordinary German) |
| beleuchten (Thema) | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| spannend | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Meilenstein | 0/0 | 1/1 | 3/3 | chat-zusammenfassung-besprechung.md | dropped: negatives fire (ordinary German) |
| Weichen stellen / Grundstein legen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Brücken schlagen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Synergien | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| zeugt von/unterstreicht/spiegelt wider | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| sinnbildlich | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| vielfältig/facettenreich | 8/4 | 0/0 | n/a | none | dropped: human hits |
| unverzichtbar/essenziell | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| im Herzen von / eingebettet in | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| pulsierend/lebendig | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Mehrwert bieten/schaffen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Herausforderungen meistern | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Tier2 optimieren | 3/2 | 1/1 | n/a | pull-request.md | dropped: human hits |
| effizient | 1/1 | 0/0 | n/a | none | dropped: human hits |
| innovativ | 1/1 | 0/0 | n/a | none | dropped: human hits |
| nachhaltig | 2/2 | 2/2 | n/a | antrag-zusammenfassung-garten.md, pressemitteilung-lunaris.md | dropped: human hits |
| zentral | 7/3 | 1/1 | n/a | chat-zusammenfassung-besprechung.md | dropped: human hits |
| entscheidend | 2/2 | 1/1 | n/a | chat-kuendigungsfrist-mieter.md | dropped: human hits |
| maßgeblich | 2/2 | 1/1 | n/a | formular-erlaeuterung-kita.md | dropped: human hits |
| umfassend | 5/2 | 1/1 | n/a | pressemitteilung-lunaris.md | dropped: human hits |
| fundiert | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| gezielt | 1/1 | 0/0 | n/a | none | dropped: human hits |
| individuell | 2/2 | 0/0 | n/a | none | dropped: human hits |
| flexibel | 0/0 | 1/1 | n/a | docs-page.md | dropped: one product only or residue |
| transparent | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| agil | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| smart | 1/1 | 0/0 | n/a | none | dropped: human hits |
| digital | 182/5 | 0/0 | n/a | none | dropped: human hits |
| zeitnah | 1/1 | 0/0 | n/a | none | dropped: human hits |
| proaktiv | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| niederschwellig | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| praxisnah | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| zielführend | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| wertschätzend | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| auf Augenhöhe | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Tier3 wichtig | 14/4 | 5/5 | n/a | artikel-einleitung-mirabel.md, chat-erklaere-rest-api.md, chat-kuendigungsfrist-mieter.md, chat-zusammenfassung-besprechung.md, pull-request.md | dropped: human hits |
| relevant | 3/3 | 0/0 | n/a | none | dropped: human hits |
| modern | 5/2 | 2/2 | n/a | article-intro.md, stellenanzeige-pollenette.md | dropped: human hits |
| professionell | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| hochwertig | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| erfolgreich | 0/0 | 1/1 | n/a | pull-request.md | dropped: one product only or residue |
| einzigartig | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| beeindruckend | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| deutlich | 9/4 | 0/0 | n/a | none | dropped: human hits |
| erheblich | 5/2 | 1/1 | n/a | pressemitteilung-lunaris.md | dropped: human hits |
| optimal | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| ideal | 3/2 | 1/1 | n/a | stellenanzeige-pollenette.md | dropped: human hits |
| perfekt | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Ob X oder Y / Ganz gleich ob | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Stellen Sie sich vor | 0/0 | 1/1 | 3/3 | article-intro.md | dropped: negatives fire (ordinary German) |
| Kennen Sie das | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Immer mehr Unternehmen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Dabei gilt es zu berücksichtigen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Hierbei spielt eine entscheidende Rolle | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Werfen wir einen Blick | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Die Antwort lautet | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Kurz gesagt | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Fazit: | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Zusammenfassend lässt sich sagen | 1/1 | 0/0 | n/a | none | dropped: human hits |
| Unterm Strich | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Am Ende des Tages | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Es bleibt abzuwarten | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Die Zukunft bleibt spannend | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Eines steht fest | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Denn eines ist klar | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Sind Sie bereit für | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Lust auf mehr | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Gerne erstelle ich Ihnen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Lassen Sie es mich wissen, falls | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Selbstverständlich! | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Das ist eine gute Frage | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Soll ich weitermachen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Schritt für Schritt durchgehen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Um deine Frage zu beantworten | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Was die meisten übersehen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Das ist wichtiger, als es klingt | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Entscheidend dabei: | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Wichtig zu verstehen: | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Wie man sieht | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Anders gesagt | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Und genau das ist der Punkt | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Damit will ich nicht sagen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Versteh mich nicht falsch | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Um es klar zu sagen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Man könnte meinen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Lass das mal sacken | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Hand aufs Herz | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Die unbequeme Wahrheit | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Im Zeitalter von | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Wir alle wissen | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Ganz gleich, | 0/0 | 0/0 | n/a | none | dropped: no machine hit |
| Sie Platzhalter / Platzhalter | 0/0 | 7/7 | n/a | antrag-zusammenfassung-garten.md, elternbrief-hohenfeld.md, faq-noxaline.md, formular-erlaeuterung-kita.md, newsletter-schuppen.md, pull-request.md, readme-section.md | excluded: residue class (not German) |
| Vielen Dank für | 0/0 | 3/3 | 3/3 | behoerde-wohngeld-eingang.md, formular-erlaeuterung-kita.md, support-antwort-typhon.md | dropped: negatives fire (ordinary German) |
| Bei Fragen erreichen Sie | 0/0 | 3/3 | 3/3 | behoerde-wohngeld-eingang.md, elternbrief-hohenfeld.md, gemeinde-marktplatz-sperrung.md | dropped: negatives fire (ordinary German) |
| In wenigen Minuten/Klicks | 0/0 | 4/4 | 4/4 | article-intro.md, artikel-einleitung-mirabel.md, produktseite-calbo.md, willkommensmail-brisecol.md | dropped: negatives fire (ordinary German) |
| Wir freuen uns | 0/0 | 3/3 | 3/3 | newsletter-schuppen.md, readme-saule-mitwirken.md, stellenanzeige-pollenette.md | dropped: negatives fire (ordinary German) |
| Mit freundlichen Grüßen | 0/0 | 2/2 | 3/3 | behoerde-wohngeld-eingang.md, elternbrief-hohenfeld.md | dropped: negatives fire (ordinary German) |
| Genau das | 0/0 | 5/5 | 3/3 | article-intro.md, chat-python-keyerror.md, linkedin-verigo.md, produktseite-calbo.md, pull-request.md | dropped: negatives fire (ordinary German) |
| Schluss mit | 0/0 | 4/4 | 3/3 | docs-page.md, produktseite-calbo.md, pull-request.md, readme-section.md | dropped: negatives fire (ordinary German) |
| dank für (Vielen Dank für, Dank für) | 0/0 | 3/3 | n/a | behoerde-wohngeld-eingang.md, formular-erlaeuterung-kita.md, support-antwort-typhon.md | dropped: one product only or residue |
