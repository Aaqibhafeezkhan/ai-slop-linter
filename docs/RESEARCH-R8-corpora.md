# Independent evidence for AI-writing tells in nl, pl, id, tr, it (plus es, pt): labelled human-vs-machine corpora

Date of run: 2026-10-23. All numbers below were computed in this session from the files named. Anything marked **(search snippet only)** or **(not verified)** was not checked against the dataset itself.

Method in one paragraph. Per language I tokenised lowercase words (`[^\W\d_]+`, Turkish `I/İ` handled), counted word 1- to 4-grams in the machine class and the human class, and scored each n-gram with the Monroe et al. (2008) log-odds ratio with an informative Dirichlet prior (prior mass 500 per n-gram order, shaped by the pooled counts) and its z-score. Filters: machine count >= 20, document frequency on the machine side >= 5, and a rate ratio (per-token frequency machine/human, or human/machine for the human list) >= 2 (>= 1.5 for the small Turkish second group, >= 2.5 for the Spanish news run). Human-leaning list: the same with the classes swapped. N-grams contained in a longer listed n-gram with nearly the same counts are removed. "Usable" is applied as: the phrase passes all filters independently in **two separate datasets** (or, where only one dataset exists, in >= 2 generator groups of it). Scripts: `corpora-scripts/ngram_lo.py` (scoring), `intersect.py`, `mktables.py`. Data and derived JSONL: `corpora-data/`.

The column "type" in the tables is my heuristic, not a validated label: `FUNC` = every token is on a short hand-written function-word list; `FUNC/DISCOURSE` = every token is function word or on a short hand-written list of discourse/evaluative/stock words that I picked after looking at the output (so it is partly circular and some entries such as "ayudar" or "meningkatkan" are stock verbs, not connectors); `mixed` = at least half; `topical` = otherwise. Treat it as a reading aid only.

## 1. Corpora checked

Licence strings are copied from the Hugging Face (HF) dataset-card metadata or Zenodo metadata via their APIs. "Login" = needs an account or an approval.

| Corpus | URL | Licence (exact string) | Languages | Size / generators | Same genre human vs machine? | Raw text without login? | Files | Used? |
|---|---|---|---|---|---|---|---|---|
| neural-news (Uyuk et al. 2024) | https://huggingface.co/datasets/tum-nlp/neural-news-benchmark | `openrail++` | en, tr, hu, fa (Turkish: 3,400 human + 1,400 zero-shot machine + 2,000 fine-tuned machine docs, from the `language`=tr rows) | GPT-4 (1,000 tr docs), Mistral, Mixtral, Llama-2-chat-7B, Bloomz-3B (100 each), plus Bloomz-3B and Llama-7B fine-tuned (1,000 each, excluded) | News vs news, but machine text is continuation of a human headline + lead (see confounds) | Yes | 3 CSV, 185 MB total | **tr** |
| aycabostancioglu/Arabic-English-Turkish-AI-Human-Text | https://huggingface.co/datasets/aycabostancioglu/Arabic-English-Turkish-AI-Human-Text | `gpl-3.0` | ar, en, tr (tr: 1,560 human + 1,544 AI) | generator not documented | Same topics (essay-like paragraphs on technology/health/energy); provenance undocumented | Yes | xlsx 0.8 MB (tr) | **tr** |
| ads2009/turkish-gemma2-synthetic-ai-texts | https://huggingface.co/datasets/ads2009/turkish-gemma2-synthetic-ai-texts | none stated | tr | 4,900 Gemma-2-2b-it rewrites, label 1 only, template residue ("Re-written Text") | No human side | Yes | 2.7 MB | no (no human text) |
| PlatinaSB/ai-and-human-text-classification | https://huggingface.co/datasets/PlatinaSB/ai-and-human-text-classification | `cc-by-sa-4.0` | id | 28,172 docs, balanced; generator undocumented (some outputs start "Berikut adalah penjelasan ...", a chatbot opener) | Human side looks like id.wikipedia (inferred from content, not documented) | Yes | 15.5 MB | **id** |
| shouwiku/detectai-indonesian | https://huggingface.co/datasets/shouwiku/detectai-indonesian | `mit` | id | 2,240 docs (1,120/1,120); `gemma-4-31b-it` 686, `gemma-4-26b-a4b-it` 434 | Wikipedia id summaries vs Gemma text on the same page titles | Yes | 2.1 MB | **id** |
| SemEval-2024 Task 8 (mirror d0rj/SemEval2024-task8) | https://huggingface.co/datasets/d0rj/SemEval2024-task8 | `apache-2.0` (mirror card) | card tags en, ar, de, it; multilingual test has domains arabic, german, italian, outfox (no Indonesian) | Italian: 3,037 human + 3,038 machine, all tagged generator `llama2-fine-tuned` | CHANGE-it news vs fine-tuned Llama-2 news | Yes | multilingual test parquet 58.6 MB (subtaskA total 665 MB) | **it** |
| COLING 2025 MGT Task 1 (mirror Jinyan1/COLING_2025_MGT_multingual) | https://huggingface.co/datasets/Jinyan1/COLING_2025_MGT_multingual | none stated in card | en zh it ar de ru bg ur id (stats from the HF datasets-server) | 43 generator names; Italian rows in dev/train carry model `llama2-fine-tuned` for all 1,843 / 4,174 rows (no human Italian rows in that mirror) | n/a for it; id: human `id_newspaper_2018` | Yes, but 913 MB parquet; row filtering through the datasets-server failed repeatedly (HTTP 500/502) | 913 MB | no (not retrievable inside the budget) |
| COLING 2025 original-data mirror anyangsong/COLING2025-MGT-Detection-Task1 | https://huggingface.co/datasets/anyangsong/COLING2025-MGT-Detection-Task1 | `mit` (card says "Unofficial Mirror") | en zh it ar de ru bg ur id | 4.1 GB jsonl | as above | Yes | 4.1 GB | no (too large) |
| M4 / M4GT-Bench (MBZUAI) | https://github.com/mbzuai-nlp/M4GT-Bench | GitHub API reports no licence for the repo (code); data licence not checked | per the HF mirrors above: ar bg de id it ru ur zh en | see COLING rows | see above | data not on GitHub (not verified) | n/a | no |
| MULTITuDE (Macko et al. 2023) | https://zenodo.org/records/10013755 | Zenodo metadata `cc-by-4.0` but `access_right: restricted`, `files: []` | ar ca cs de en es **nl** pt ru uk zh | 7,992 human news (MassiveSumm) + 66,089 texts from 8 LLMs prompted with the headline | Yes (news, headline-conditioned) | **No** (request-only) | n/a | no |
| MultiSocial (Macko et al. 2024) | https://zenodo.org/records/13846152 | Zenodo metadata `cc-by-4.0`, `restricted` | 22 languages incl. **pl** (and es, pt, nl per paper table, not verified) | 472,097 texts; machine texts are paraphrases of the human posts by 7 LLMs | Yes (same posts) | **No** (request-only) | n/a | no |
| MGTPD-Public | https://huggingface.co/datasets/1024m/MGTPD-Public | `cc-by-nc-nd-4.0` | 23 languages incl. nl pl tr id it es pt (card tags) | 5.3 GB | not read | **No** (`gated: manual`) | 5.3 GB | no |
| DETECT-AI-Dataset | https://huggingface.co/datasets/anas775/DETECT-AI-Dataset | `cc-by-4.0` | 25 languages incl. nl pl tr id it es pt (card tags) | multimodal, mostly image/audio shards | not read | **No** (`gated: auto`, needs login) | many small shards | no |
| AuTexTification 2023 (mirror symanto/autextification2023) | https://huggingface.co/datasets/symanto/autextification2023 | `cc-by-nc-sa-4.0` | en, es | Spanish test subtask 1: 8,920 human + 11,209 machine docs, generators anonymised A-F (A-C: ~1.8k each, D-F: ~1.9k each); domains in test: news, reviews | Yes (prompted per domain) | Yes (test split only in this mirror) | 74 MB (es test files 10.5 + 2.8 MB) | **es** |
| Samambas/Human_vs_AI_Portuguese | https://huggingface.co/datasets/Samambas/Human_vs_AI_Portuguese | `apache-2.0` | pt | 202 MB CSV of ~400-character chunks. Machine sources seen: `dolphin-2.9-portuguese` (22,920 chunks in my 9.5 MB slice), `DeepSeek`, `ChatGPT`, `Gemini` (2,048 chunks), plus `portuguese_llava` elsewhere. Human: `Wikipedia-TucanoBR`, `Contos.pdf`, `PlanoEducacao.pdf` | **No**: Wikipedia and book chunks vs assistant answers/essays | Yes | 202 MB (two 9.5 MB range slices read) | pt (flagged unusable) |
| BramVanroy/chatgpt-dutch-simplification | https://huggingface.co/datasets/BramVanroy/chatgpt-dutch-simplification | `cc-by-nc-sa-4.0` | nl | 1,267 sentence pairs; **both** columns are gpt-3.5-turbo output (card: "generated with ChatGPT") | No human text | Yes | 0.3 MB | no |
| RAID | https://huggingface.co/datasets/liamdugan/raid | `mit` | en, cs, de | 16.7 GB, 11 LLMs | - | Yes | 16.7 GB | no (no target language) |
| MAGE / DeepfakeTextDetect | https://huggingface.co/datasets/yaful/MAGE | `apache-2.0` | not stated in the card; English per the paper (not verified here) | test.csv 71.7 MB | - | Yes | 553 MB | no |
| HC3 | https://huggingface.co/datasets/Hello-SimpleAI/HC3 | `cc-by-sa-4.0` | en, zh (derived: fr `almanach/hc3_french_ood`, ru `d0rj/HC3-ru`, ko, th, none for the target languages) | ChatGPT | - | Yes | 147 MB | no |
| DetectRL-X | https://huggingface.co/datasets/WUJUNCHAO/DetectRL-X | `mit` | ar zh en fr de pt ru es | DeepSeek-V3, Gemini-2.5-Flash, GPT-4o, Qwen-Max; rewrite settings | - | Yes | 33 GB | no (too large) |
| AuTexTification-it / HC3-Plus / LLM-DetectAIve / MGTBench | - | - | - | HC3-Plus not found by name on HF; LLM-DetectAIve found only as arXiv 2408.04284 (search snippet only); MGTBench-2.0 appears as `AITextDetect/AI_Polish_clean` (2.4 GB, card licence MIT, English academic writing per its README text, not verified) | - | - | - | no |
| arXiv searches for nl/pl/id/tr/it corpora | - | - | - | Only hits: 2408.10724 (Turkish neural-news, above), 2310.13606 (MULTITuDE), 2406.12549 (MultiSocial). No Dutch, Polish or Indonesian ChatGPT-vs-human paper with released texts was found. | - | - | - | - |

Raw download volume in this session: about 294 MB (Turkish CSVs 176.5, SemEval parquet 58.7, Portuguese slices 19, Indonesian 17.6, Spanish 13.3, other small 4, papers 4.9). Downloads sit in separate subfolders of `corpora-data/`; nothing from them was executed.

## 2. Results per language

General caution that applies to every list: counts are token counts and document counts inside these particular corpora. The generators are 2022-2025 models of very different quality. Machine-leaning means "over-represented relative to the paired human text in this corpus", not "written only by machines".

### 2.1 Turkish (tr): independent evidence exists, in two datasets that agree

Data: neural-news Turkish rows (human 3,400 news docs; machine = GPT-4 1,000 docs; the other zero-shot generators are only 100 docs each so they were pooled as a check) and aycabostancioglu (1,560 human / 1,544 AI). The two fine-tuned generators (Bloomz-3B, Llama-7B fine-tuned) were excluded because their output is mostly incoherent text, English fragments and prompt echo; Mistral, Mixtral, Llama-2-chat and Bloomz zero-shot outputs contain English text and prompt echo (I cut everything up to `[EOP]` / `[/INST]`). Only GPT-4 produced fluent Turkish.

Confounds, specific:
- Topic: aycabostancioglu AI texts are about "dijital", "yapay zeka", "enerji", "sağlık", "iklim"; those words are topical, not tells.
- Genre / construction: in neural-news the machine text continues a human headline and lead; GPT-4 texts contain a literal `Başlık` header (447 occurrences, rate ratio 783) and have apostrophes stripped ("CHPnin"), which creates suffix tokens ("nin", "li", "ın") and makes some "human" tokens look human-leaning for the wrong reason.
- Generator: only one fluent generator in the large dataset, an undocumented generator in the second; the "second generator" for the strict rule is the other dataset, not a second documented model. Mistral/Mixtral/Llama-2-chat (300 docs, run separately) reproduce only a handful of the same phrases (`önemli bir`, `ancak bu`, `bu tür`, `hem de`, `yeni bir`, `fazla`) at lower ratios.
- Translated prompts: the neural-news prompt was English ("Write a news article in Turkish"), which explains the English leakage in the weak models.

Usable machine-leaning phrases (pass in both neural-news-GPT-4 and aycabostancioglu). Columns "src1" = neural-news GPT-4 vs human, "src2" = aycabostancioglu:

| # | phrase | type | m/h count (src1) | m/h count (src2) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|--|
| 1 | önemli | FUNC/DISCOURSE | 561/578 (df 368/390) | 660/261 (df 541/211) | 3.4 | 15.6 |
| 2 | önemli bir | FUNC/DISCOURSE | 265/134 (df 212/117) | 322/73 (df 281/66) | 6.9 | 13.2 |
| 3 | büyük | FUNC/DISCOURSE | 719/967 (df 432/615) | 514/272 (df 411/217) | 2.6 | 12.7 |
| 4 | bu tür | FUNC/DISCOURSE | 300/86 (df 220/77) | 108/22 (df 101/21) | 12.2 | 12.5 |
| 5 | büyük bir | FUNC/DISCOURSE | 341/184 (df 243/155) | 131/41 (df 126/35) | 6.5 | 12.1 |
| 6 | bir şekilde | FUNC/DISCOURSE | 251/252 (df 195/213) | 438/103 (df 342/90) | 3.5 | 11.7 |
| 7 | ancak bu | FUNC | 210/72 (df 164/68) | 131/31 (df 126/31) | 10.2 | 11.0 |
| 8 | ayrıca | FUNC | 324/371 (df 291/312) | 361/154 (df 328/137) | 3.1 | 10.9 |
| 9 | bu durum | FUNC/DISCOURSE | 378/22 (df 264/22) | 102/44 (df 97/40) | 60.2 | 10.7 |
| 10 | özellikle | FUNC/DISCOURSE | 205/258 (df 166/218) | 453/147 (df 399/136) | 2.8 | 10.6 |
| 11 | dijital | topical | 38/36 (df 28/24) | 571/26 (df 277/17) | 3.7 | 10.2 |
| 12 | olay | topical | 491/561 (df 227/382) | 22/7 (df 13/6) | 3.1 | 9.8 |
| 13 | daha da | FUNC | 214/94 (df 163/83) | 74/24 (df 69/24) | 8.0 | 9.7 |
| 14 | geniş | topical | 211/127 (df 179/119) | 94/42 (df 87/37) | 5.8 | 9.5 |
| 15 | ekonomik | topical | 226/234 (df 114/160) | 200/95 (df 126/71) | 3.4 | 8.8 |
| 16 | aynı zamanda | FUNC/DISCOURSE | 116/106 (df 101/94) | 264/60 (df 232/59) | 3.8 | 8.8 |
| 17 | durumu | topical | 229/187 (df 186/169) | 43/18 (df 25/17) | 4.3 | 8.4 |
| 18 | genellikle | FUNC/DISCOURSE | 71/32 (df 56/29) | 180/57 (df 156/50) | 7.8 | 8.2 |
| 19 | rol | FUNC/DISCOURSE | 73/62 (df 64/48) | 143/24 (df 134/23) | 4.1 | 7.8 |
| 20 | dünya | topical | 196/270 (df 107/191) | 218/92 (df 158/74) | 2.5 | 7.7 |
| 21 | güvenliği | topical | 104/83 (df 84/65) | 124/40 (df 91/17) | 4.4 | 7.7 |
| 22 | hızla | topical | 75/54 (df 65/49) | 134/33 (df 129/30) | 4.9 | 7.6 |
| 23 | yaşam | topical | 101/97 (df 65/70) | 92/15 (df 84/14) | 3.6 | 7.4 |
| 24 | olabilir | topical | 98/117 (df 77/101) | 181/53 (df 160/47) | 2.9 | 7.3 |
| 25 | bir rol | FUNC/DISCOURSE | 52/10 (df 48/10) | 128/4 (df 120/4) | 18.2 | 7.2 |
| 26 | yardımcı | topical | 74/73 (df 65/64) | 170/49 (df 149/43) | 3.6 | 7.2 |
| 27 | gelecekteki | topical | 48/8 (df 41/8) | 100/4 (df 91/4) | 21.0 | 7.0 |
| 28 | etkileri | topical | 32/16 (df 26/15) | 136/18 (df 111/17) | 7.0 | 6.9 |
| 29 | sonuç | FUNC/DISCOURSE | 89/79 (df 83/63) | 140/55 (df 140/55) | 3.9 | 6.8 |
| 30 | sonuç olarak | FUNC/DISCOURSE | 71/7 (df 70/7) | 77/16 (df 77/16) | 35.5 | 6.7 |
| 31 | için büyük | FUNC/DISCOURSE | 77/17 (df 68/17) | 36/6 (df 36/6) | 15.9 | 6.6 |
| 32 | karmaşık | topical | 51/21 (df 42/15) | 110/41 (df 99/38) | 8.5 | 6.5 |
| 33 | sağlamak | topical | 81/73 (df 73/66) | 82/25 (df 78/23) | 3.9 | 6.4 |
| 34 | sürdürülebilir | topical | 31/35 (df 22/16) | 152/13 (df 115/10) | 3.1 | 6.2 |
| 35 | teknoloji | topical | 52/72 (df 33/57) | 177/46 (df 138/39) | 2.5 | 6.2 |
| 36 | başlık | topical | 447/2 (df 447/1) | 20/6 (df 20/6) | 783.1 | 6.1 |
| 37 | artırmak | topical | 49/27 (df 42/25) | 54/3 (df 48/3) | 6.4 | 6.1 |
| 38 | değil aynı | FUNC/DISCOURSE | 31/12 (df 30/12) | 85/6 (df 84/6) | 9.1 | 5.9 |
| 39 | potansiyel | topical | 38/15 (df 31/13) | 50/7 (df 48/6) | 8.9 | 5.8 |
| 40 | dünya genelinde | topical | 36/19 (df 31/18) | 81/4 (df 71/4) | 6.6 | 5.8 |

Function-word constructions in that list, in my reading: `önemli bir`, `büyük bir`, `bu tür`, `bu durum` (anaphoric summary noun phrase, rate ratio 60 in neural-news but only 2.6 in the other set, so weaker), `bir şekilde`, `ancak bu`, `ayrıca`, `özellikle`, `daha da`, `aynı zamanda`, `genellikle`, `sonuç olarak`, `bir rol` (oynamak), `için büyük`, `değil aynı (zamanda)` ("not only ... but also"). Topical in that list: `dijital`, `ekonomik`, `dünya`, `güvenliği`, `teknoloji`, `sürdürülebilir`, `potansiyel`, `dünya genelinde`.

Human-leaning phrases (top 20 passing in both datasets):

| # | phrase | type | m/h count (src1) | m/h count (src2) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|--|
| 1 | ya | FUNC | 116/1028 (df 74/666) | 23/259 (df 22/190) | 2.5 | -10.9 |
| 2 | sonra | FUNC | 155/1334 (df 114/901) | 20/196 (df 20/166) | 2.5 | -10.8 |
| 3 | a | topical | 121/1400 (df 73/821) | 36/128 (df 30/91) | 3.3 | -10.2 |
| 4 | bin | topical | 77/1375 (df 33/555) | 2/38 (df 2/10) | 5.1 | -9.3 |
| 5 | o | FUNC | 42/693 (df 31/398) | 24/130 (df 22/106) | 4.7 | -9.1 |
| 6 | var | FUNC | 59/734 (df 49/429) | 11/131 (df 11/97) | 3.6 | -9.1 |
| 7 | ilişkin | topical | 83/842 (df 63/580) | 8/122 (df 8/79) | 2.9 | -8.8 |
| 8 | ama | FUNC | 17/605 (df 16/368) | 14/82 (df 13/72) | 10.2 | -8.1 |
| 9 | söz | topical | 39/512 (df 34/386) | 9/96 (df 9/85) | 3.7 | -7.8 |
| 10 | bunun | FUNC | 41/566 (df 40/437) | 31/97 (df 31/83) | 3.9 | -7.5 |
| 11 | tek | topical | 38/402 (df 23/270) | 26/116 (df 21/87) | 3.0 | -7.1 |
| 12 | ye | topical | 106/926 (df 68/612) | 6/30 (df 6/27) | 2.5 | -6.7 |
| 13 | şu | FUNC | 38/582 (df 34/435) | 18/51 (df 17/44) | 4.4 | -6.6 |
| 14 | söz konusu | topical | 33/380 (df 30/297) | 5/56 (df 5/51) | 3.3 | -6.5 |
| 15 | bunu | FUNC | 14/377 (df 13/257) | 5/46 (df 5/39) | 7.7 | -6.3 |
| 16 | türkiye de | mixed | 33/330 (df 29/230) | 26/78 (df 19/53) | 2.9 | -6.2 |
| 17 | ben | topical | 20/404 (df 15/241) | 1/55 (df 1/41) | 5.8 | -6.1 |
| 18 | şey | topical | 19/310 (df 17/227) | 5/54 (df 5/51) | 4.7 | -6.0 |
| 19 | yok | FUNC | 39/449 (df 34/304) | 11/43 (df 10/41) | 3.3 | -5.9 |
| 20 | bütün | topical | 10/359 (df 9/235) | 1/58 (df 1/49) | 10.2 | -5.9 |

Reading: the human side is colloquial/reporting vocabulary (`ama`, `yani`, `bunun`, `şu`, `bile`, `daha sonra`, `ya da`, first-person `ben`, `biz`, quoting verbs `söyledi`, `diye konuştu`, numerals `yüzde`, `milyon`, `bin`). Quoting verbs and numerals are news-genre topicals; `ama`, `yani`, `bile`, `şu` are the register evidence. Note `dolayısıyla` and `ilişkin` sit on the human side in both sets, so they must not be listed as machine tells.

### 2.2 Indonesian (id): independent evidence exists, in two datasets that agree

Data: PlatinaSB (14,086 human / 14,086 machine docs) and shouwiku (1,120 human / 1,120 Gemma-4 docs). Both have Indonesian Wikipedia-like human text. A third source (M4GT / COLING `id_newspaper_2018`) could not be fetched.

Confounds, specific:
- Genre: human = encyclopedia articles (references, dates, English fragments: `the`, `of`, `diakses`, `referensi`, month names appear in the human list); machine = explanatory answers. Machine-leaning evaluative words (`penting`, `unik`, `kompleks`, `efektif`) partly reflect "explain this topic" prompts, not only model habit.
- Generator: Platina's generator is undocumented; shouwiku is two sizes of one model family (Gemma 4), so effectively two sources, one of them undocumented. Chatbot residue (`berikut adalah`, 2,062 occurrences, rate ratio 31 in Platina) is a response-wrapper tell, not prose style, and does not appear in the intersection because shouwiku does not have it.
- Prompt: shouwiku prompts asked for text about the page title; Platina's prompts are unknown.

Usable machine-leaning phrases (both datasets). src1 = Platina, src2 = shouwiku:

| # | phrase | type | m/h count (src1) | m/h count (src2) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|--|
| 1 | penting | FUNC/DISCOURSE | 5729/1092 (df 4019/955) | 249/90 (df 236/78) | 5.4 | 28.6 |
| 2 | meningkatkan | FUNC/DISCOURSE | 2657/460 (df 1572/402) | 251/52 (df 211/48) | 6.0 | 22.0 |
| 3 | namun | FUNC | 4537/1604 (df 3683/1484) | 246/71 (df 234/69) | 2.9 | 21.9 |
| 4 | sangat | FUNC/DISCOURSE | 4193/1927 (df 2723/1552) | 624/101 (df 478/81) | 2.3 | 21.9 |
| 5 | selain itu | FUNC/DISCOURSE | 3062/820 (df 2640/779) | 216/49 (df 216/47) | 3.9 | 20.2 |
| 6 | yang sangat | FUNC/DISCOURSE | 2648/678 (df 1839/614) | 153/32 (df 133/29) | 4.0 | 18.8 |
| 7 | unik | FUNC/DISCOURSE | 2115/246 (df 1599/229) | 60/11 (df 59/11) | 8.9 | 18.3 |
| 8 | penting dalam | FUNC/DISCOURSE | 2298/308 (df 1760/287) | 77/25 (df 76/23) | 7.7 | 18.1 |
| 9 | yang lebih | FUNC | 3504/1520 (df 2291/1250) | 339/107 (df 261/88) | 2.4 | 16.9 |
| 10 | kompleks | FUNC/DISCOURSE | 1566/446 (df 1131/302) | 162/17 (df 156/17) | 3.6 | 15.8 |
| 11 | fokus | FUNC/DISCOURSE | 1244/176 (df 1179/171) | 134/23 (df 128/22) | 7.3 | 15.7 |
| 12 | memahami | FUNC/DISCOURSE | 1155/123 (df 802/110) | 163/32 (df 134/26) | 9.7 | 15.6 |
| 13 | menjaga | FUNC/DISCOURSE | 735/195 (df 526/182) | 396/19 (df 318/19) | 3.9 | 14.4 |
| 14 | dengan demikian | FUNC/DISCOURSE | 1281/170 (df 1166/167) | 67/14 (df 67/13) | 7.8 | 14.4 |
| 15 | yang unik | FUNC/DISCOURSE | 1595/96 (df 1284/93) | 24/7 (df 24/7) | 17.2 | 14.3 |
| 16 | oleh karena itu | FUNC | 1027/230 (df 936/223) | 149/19 (df 149/18) | 4.6 | 13.2 |
| 17 | signifikan | FUNC/DISCOURSE | 790/245 (df 669/235) | 260/24 (df 251/23) | 3.3 | 13.2 |
| 18 | sangat penting | FUNC/DISCOURSE | 771/80 (df 650/80) | 85/8 (df 84/7) | 10.0 | 12.3 |
| 19 | efektif | FUNC/DISCOURSE | 753/182 (df 595/168) | 132/21 (df 124/16) | 4.3 | 12.2 |
| 20 | pentingnya | FUNC/DISCOURSE | 759/83 (df 590/81) | 56/11 (df 52/11) | 9.5 | 11.8 |
| 21 | penting untuk | FUNC/DISCOURSE | 737/89 (df 631/86) | 66/3 (df 66/3) | 8.6 | 11.7 |
| 22 | kualitas | topical | 760/202 (df 556/179) | 166/51 (df 144/44) | 3.9 | 11.6 |
| 23 | untuk meningkatkan | FUNC/DISCOURSE | 801/148 (df 628/142) | 60/15 (df 60/15) | 5.6 | 11.2 |
| 24 | kuat | FUNC/DISCOURSE | 1186/487 (df 935/444) | 98/23 (df 96/23) | 2.5 | 11.1 |
| 25 | kesadaran | topical | 598/100 (df 445/81) | 89/19 (df 85/19) | 6.2 | 11.0 |
| 26 | perubahan | topical | 1457/690 (df 897/492) | 229/103 (df 191/63) | 2.2 | 10.8 |
| 27 | tantangan | topical | 345/116 (df 267/97) | 277/25 (df 261/22) | 3.1 | 10.4 |
| 28 | karakteristik | topical | 539/182 (df 460/166) | 163/22 (df 142/19) | 3.1 | 10.3 |
| 29 | menekankan | FUNC/DISCOURSE | 475/107 (df 345/100) | 126/28 (df 118/22) | 4.6 | 10.2 |
| 30 | tetapi juga | FUNC | 688/237 (df 602/231) | 153/32 (df 151/32) | 3.0 | 10.1 |
| 31 | yang kuat | FUNC/DISCOURSE | 731/198 (df 607/190) | 50/7 (df 50/7) | 3.8 | 10.1 |
| 32 | yang kompleks | FUNC/DISCOURSE | 493/49 (df 427/47) | 57/7 (df 57/7) | 10.4 | 9.8 |
| 33 | memastikan | FUNC/DISCOURSE | 440/117 (df 345/106) | 119/13 (df 118/13) | 3.9 | 9.8 |
| 34 | yang signifikan | FUNC/DISCOURSE | 556/102 (df 482/100) | 47/8 (df 46/8) | 5.6 | 9.7 |
| 35 | menghadapi | FUNC/DISCOURSE | 558/216 (df 439/204) | 121/10 (df 116/10) | 2.7 | 9.4 |
| 36 | efisiensi | topical | 268/65 (df 197/58) | 179/16 (df 169/13) | 4.3 | 9.4 |
| 37 | keamanan | topical | 675/305 (df 438/217) | 194/63 (df 125/31) | 2.3 | 9.1 |
| 38 | menawarkan | FUNC/DISCOURSE | 653/228 (df 489/211) | 48/12 (df 48/12) | 3.0 | 8.7 |
| 39 | potensi | topical | 448/151 (df 352/136) | 94/17 (df 86/15) | 3.1 | 8.7 |
| 40 | kita | FUNC | 697/244 (df 400/172) | 85/42 (df 65/25) | 3.0 | 8.5 |

Function-word / discourse constructions in that list: `namun`, `selain itu`, `dengan demikian`, `oleh karena itu` / `karena itu`, `tetapi juga` (with `tidak hanya`), `mulai dari`, `yang lebih`, `yang sangat`, `penting untuk` / `penting dalam` / `sangat penting`, `untuk memahami`, `untuk meningkatkan`, `utama dalam`, `kita`. Topical or domain-leaning: `kualitas`, `keamanan`, `efisiensi`, `potensi`, `perubahan`, `kesadaran`, `tantangan`, `karakteristik`.

Human-leaning phrases (both datasets):

| # | phrase | type | m/h count (src1) | m/h count (src2) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|--|
| 1 | the | topical | 3145/7841 (df 1429/3319) | 3/58 (df 2/41) | 2.4 | -24.4 |
| 2 | and | topical | 610/2889 (df 437/1805) | 15/39 (df 15/38) | 4.6 | -19.4 |
| 3 | a | topical | 1099/2883 (df 685/1758) | 19/53 (df 10/40) | 2.5 | -15.9 |
| 4 | in | topical | 492/2153 (df 324/1400) | 0/20 (df 0/14) | 4.2 | -15.5 |
| 5 | disebut | topical | 1153/2389 (df 961/1930) | 19/196 (df 19/155) | 2.0 | -15.4 |
| 6 | s | topical | 984/2339 (df 636/1573) | 0/46 (df 0/34) | 2.3 | -12.5 |
| 7 | sebagian | topical | 856/1775 (df 725/1498) | 28/102 (df 25/86) | 2.0 | -12.2 |
| 8 | referensi | topical | 240/936 (df 215/916) | 8/40 (df 8/40) | 3.8 | -11.7 |
| 9 | pula | topical | 69/610 (df 65/568) | 5/41 (df 5/35) | 8.5 | -11.0 |
| 10 | september | topical | 565/1381 (df 497/1013) | 0/28 (df 0/27) | 2.4 | -9.8 |
| 11 | november | topical | 518/1243 (df 453/966) | 0/43 (df 0/38) | 2.3 | -9.4 |
| 12 | sejumlah | topical | 383/865 (df 335/765) | 5/55 (df 5/51) | 2.2 | -9.4 |
| 13 | disingkat | topical | 26/410 (df 24/380) | 1/93 (df 1/87) | 15.2 | -9.3 |
| 14 | pun | topical | 170/602 (df 151/536) | 5/26 (df 5/22) | 3.4 | -9.2 |
| 15 | desember | topical | 566/1180 (df 494/898) | 1/39 (df 1/36) | 2.0 | -9.2 |
| 16 | juni | topical | 525/1242 (df 439/893) | 0/26 (df 0/24) | 2.3 | -9.1 |
| 17 | kadang | topical | 123/612 (df 65/336) | 0/29 (df 0/18) | 4.8 | -9.0 |
| 18 | tak | topical | 309/806 (df 246/662) | 15/36 (df 15/31) | 2.5 | -8.9 |
| 19 | januari | topical | 527/1194 (df 460/885) | 0/39 (df 0/30) | 2.2 | -8.8 |
| 20 | februari | topical | 557/1216 (df 444/833) | 0/32 (df 0/27) | 2.1 | -8.5 |

Reading: after removing English fragments and Wikipedia-specific words (`disebut`, `disingkat`, `referensi`, month names, `sebutan`, `mengacu pada`), the remaining human-leaning function words are `pula`, `pun`, `maka`, `walaupun`, `ataupun`, `misalnya`, `hampir`, `kadang`/`terkadang`, `dan juga`, `di antaranya`, `pada umumnya`, `sebagian`. These are plausible register markers (more varied connectors) but come from Wikipedia as the human genre.

### 2.3 Italian (it): one dataset, one generator; evidence exists but fails the two-generator rule

Data: SemEval-2024 Task 8 multilingual test, Italian slice: 3,037 human CHANGE-it news docs and 3,038 machine docs (all tagged `llama2-fine-tuned`).

Confounds, specific: single generator (a fine-tuned Llama-2, so it imitates news style and still shows strong connector over-use); topic is matched on average but not pairwise in my run; the COLING mirror contains Italian machine rows only (no human Italian), so no second dataset. Prompts were Italian news headlines (not translated).

Machine-leaning phrases (single generator, therefore not "usable" under the stated rule; src1 = SemEval Italian):

| # | phrase | type | m/h count (src1) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|
| 1 | ed | FUNC | 2514/690 (df 2385/563) | 4.0 | 30.9 |
| 2 | loro | FUNC | 2260/737 (df 1721/565) | 3.4 | 27.2 |
| 3 | ciò | FUNC/DISCOURSE | 1320/104 (df 1192/97) | 14.0 | 25.3 |
| 4 | inoltre | FUNC/DISCOURSE | 987/129 (df 939/127) | 8.4 | 22.1 |
| 5 | sue | FUNC | 1047/241 (df 867/219) | 4.8 | 21.0 |
| 6 | tuttavia | FUNC/DISCOURSE | 837/85 (df 801/84) | 10.8 | 20.4 |
| 7 | durante | topical | 1102/334 (df 984/288) | 3.6 | 19.6 |
| 8 | o | FUNC | 1903/925 (df 1539/678) | 2.3 | 18.8 |
| 9 | essere | FUNC | 1881/978 (df 1619/793) | 2.1 | 17.4 |
| 10 | ed è | FUNC | 813/207 (df 779/196) | 4.3 | 17.1 |
| 11 | poiché | FUNC/DISCOURSE | 1025/17 (df 967/17) | 66.4 | 17.0 |
| 12 | coloro | FUNC/DISCOURSE | 634/37 (df 606/35) | 18.9 | 17.0 |
| 13 | quando | topical | 1498/731 (df 1301/619) | 2.3 | 16.6 |
| 14 | stati | FUNC | 1353/628 (df 977/497) | 2.4 | 16.6 |
| 15 | degli | topical | 1694/884 (df 1510/702) | 2.1 | 16.5 |
| 16 | ultimi | FUNC/DISCOURSE | 693/194 (df 661/184) | 3.9 | 16.1 |
| 17 | molte | FUNC/DISCOURSE | 524/74 (df 513/70) | 7.8 | 16.0 |
| 18 | suoi | FUNC | 921/348 (df 790/306) | 2.9 | 16.0 |
| 19 | negli | FUNC/DISCOURSE | 891/340 (df 812/315) | 2.9 | 15.6 |
| 20 | nonostante | FUNC/DISCOURSE | 601/150 (df 563/145) | 4.4 | 15.5 |
| 21 | negli ultimi | FUNC/DISCOURSE | 567/111 (df 552/109) | 5.6 | 15.3 |
| 22 | uniti | topical | 625/183 (df 388/154) | 3.8 | 15.0 |
| 23 | le sue | FUNC | 586/139 (df 534/131) | 4.6 | 14.8 |
| 24 | nell | topical | 1197/587 (df 1156/513) | 2.2 | 14.8 |
| 25 | articolo | topical | 435/67 (df 176/57) | 7.2 | 14.5 |
| 26 | qualsiasi | FUNC/DISCOURSE | 425/59 (df 410/55) | 7.9 | 14.4 |
| 27 | molti | FUNC/DISCOURSE | 578/169 (df 509/158) | 3.8 | 14.4 |
| 28 | coloro che | FUNC/DISCOURSE | 462/32 (df 446/30) | 15.9 | 14.4 |
| 29 | possono | FUNC/DISCOURSE | 531/139 (df 445/128) | 4.2 | 14.4 |
| 30 | italiano | topical | 626/202 (df 555/174) | 3.4 | 14.4 |
| 31 | stati uniti | mixed | 607/169 (df 375/141) | 4.0 | 14.2 |
| 32 | rapidamente | FUNC/DISCOURSE | 594/14 (df 585/14) | 46.7 | 14.0 |
| 33 | riguardo | FUNC/DISCOURSE | 410/30 (df 403/28) | 15.1 | 14.0 |
| 34 | italiana | topical | 575/181 (df 493/158) | 3.5 | 13.9 |
| 35 | diritti | topical | 467/112 (df 329/86) | 4.6 | 13.9 |
| 36 | incidente | topical | 453/103 (df 345/70) | 4.8 | 13.9 |
| 37 | è stata | mixed | 1249/616 (df 1144/512) | 2.2 | 13.6 |
| 38 | attraverso | FUNC/DISCOURSE | 489/139 (df 452/133) | 3.9 | 13.4 |
| 39 | recentemente | FUNC/DISCOURSE | 385/24 (df 384/24) | 17.7 | 13.4 |
| 40 | provenienti | topical | 361/33 (df 349/33) | 12.0 | 13.3 |

Function-word / discourse constructions in that list: `inoltre` (8.4x), `tuttavia` (10.8x), `poiché` (66x), `ciò` (14x), `coloro che` (16x), `nonostante` (4.4x), `riguardo` (15x), `tra cui` (5.9x), `negli ultimi anni` (12.7x), `recentemente` (17.7x), `rapidamente` (46.7x), `a causa di`/`causato` (see `causato`, 14.8x), `mancanza di` (9.9x), `attraverso`, `qualsiasi`, `molte/molti`, `ed`. Topical here: `stati uniti`, `italiano/italiana`, `diritti`, `incidente`, `articolo`, `uniti`.

Human-leaning phrases:

| # | phrase | type | m/h count (src1) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|
| 1 | ma | FUNC | 985/2384 (df 881/1563) | 2.2 | -22.6 |
| 2 | di un | FUNC | 272/1012 (df 256/806) | 3.4 | -19.8 |
| 3 | poi | topical | 199/833 (df 197/693) | 3.8 | -17.8 |
| 4 | già | topical | 124/716 (df 123/610) | 5.2 | -17.7 |
| 5 | fa | topical | 122/687 (df 120/575) | 5.1 | -17.3 |
| 6 | perché | topical | 168/725 (df 163/573) | 3.9 | -16.7 |
| 7 | proprio | topical | 123/611 (df 115/534) | 4.5 | -15.9 |
| 8 | mi | FUNC | 72/523 (df 64/297) | 6.6 | -15.5 |
| 9 | chi | topical | 79/521 (df 77/391) | 6.0 | -15.4 |
| 10 | ieri | topical | 44/458 (df 43/384) | 9.4 | -14.7 |
| 11 | euro | topical | 165/609 (df 126/392) | 3.4 | -14.5 |
| 12 | ci | FUNC | 375/923 (df 358/695) | 2.2 | -14.2 |
| 13 | quella | FUNC | 126/511 (df 123/442) | 3.7 | -13.8 |
| 14 | giorni | topical | 133/519 (df 129/456) | 3.5 | -13.7 |
| 15 | ho | topical | 61/404 (df 54/262) | 6.0 | -13.5 |
| 16 | fatto | topical | 357/840 (df 344/669) | 2.1 | -13.1 |
| 17 | e di | FUNC | 51/345 (df 51/316) | 6.1 | -13.0 |
| 18 | enne | topical | 23/356 (df 23/251) | 14.1 | -12.6 |
| 19 | sarà | topical | 125/454 (df 121/351) | 3.3 | -12.5 |
| 20 | non si | FUNC | 85/366 (df 85/323) | 3.9 | -12.5 |

Reading: the human side is colloquial and first-person (`ma`, `già`, `proprio`, `perché`, `mi`, `ho`, `chi`, `ieri`, `ci`). `ieri`, `euro`, `giorni`, `enne` (as in "35enne") are news-genre markers.

### 2.4 Spanish (es): one dataset, six generator groups, old generators

Data: AuTexTification 2023 Spanish test, subtask 1 only, split by domain because the machine class has a different domain mix (machine: 5,514 news + 5,695 reviews; human: 5,223 news + 3,697 reviews). Pooling both domains yields review vocabulary (`es muy`, `excelente`, `la comida`, `el servicio`) as "machine-leaning", which is a topic artefact; so I report each domain separately and use the news run as the primary list.

Confounds, specific: the generators are anonymised A-F; the task paper identifies them as 2022-era base language models (BLOOM and GPT-3 variants; I did not verify this mapping inside the mirror), not chat-tuned assistants; the human news side contains BBC Mundo and AFP/EFE boilerplate (`bbc`, `también te`, `lea`, `foto afp`, `efe`) that is source-specific; text length is short (median about 60 words per document), so 4-grams are sparse.

News domain, machine-leaning (passes in 6 generator groups at 20+ occurrences, rate ratio >= 2.5; src1 = AuTexTification news):

| # | phrase | type | m/h count (src1) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|
| 1 | es una | FUNC | 738/195 (df 609/182) | 3.4 | 14.2 |
| 2 | esto | FUNC/DISCOURSE | 465/148 (df 405/143) | 2.9 | 10.7 |
| 3 | una gran | FUNC/DISCOURSE | 160/35 (df 154/35) | 4.2 | 7.1 |
| 4 | ya que | FUNC | 175/50 (df 170/50) | 3.2 | 6.6 |
| 5 | afp | topical | 107/15 (df 83/15) | 6.5 | 6.6 |
| 6 | ex | topical | 117/26 (df 101/24) | 4.1 | 6.3 |
| 7 | se puede | FUNC/DISCOURSE | 163/49 (df 145/48) | 3.0 | 6.2 |
| 8 | los estados | mixed | 101/20 (df 79/20) | 4.6 | 5.8 |
| 9 | es muy | FUNC | 113/27 (df 102/27) | 3.8 | 5.8 |
| 10 | ayudar | FUNC/DISCOURSE | 104/27 (df 93/27) | 3.5 | 5.6 |
| 11 | mejorar | FUNC/DISCOURSE | 95/22 (df 86/22) | 3.9 | 5.6 |
| 12 | importantes | topical | 122/39 (df 115/39) | 2.9 | 5.4 |
| 13 | efe | topical | 94/24 (df 90/24) | 3.6 | 5.4 |
| 14 | forma de | FUNC/DISCOURSE | 138/47 (df 120/47) | 2.7 | 5.3 |
| 15 | una mujer | mixed | 141/49 (df 118/48) | 2.6 | 5.2 |
| 16 | que no se | FUNC | 134/42 (df 123/42) | 2.9 | 5.2 |
| 17 | una forma | FUNC/DISCOURSE | 85/19 (df 71/19) | 4.1 | 5.2 |
| 18 | necesario | FUNC/DISCOURSE | 91/25 (df 84/25) | 3.3 | 5.1 |
| 19 | ayudar a | FUNC/DISCOURSE | 93/24 (df 84/24) | 3.5 | 5.1 |
| 20 | los estados unidos | topical | 75/3 (df 59/3) | 22.8 | 5.1 |
| 21 | esto se | FUNC/DISCOURSE | 66/9 (df 60/9) | 6.7 | 5.1 |
| 22 | es necesario | FUNC/DISCOURSE | 63/6 (df 58/6) | 9.6 | 5.1 |
| 23 | una forma de | FUNC/DISCOURSE | 67/8 (df 56/8) | 7.6 | 5.0 |
| 24 | el ex | mixed | 62/5 (df 57/5) | 11.3 | 5.0 |
| 25 | es importante | FUNC/DISCOURSE | 61/7 (df 56/7) | 7.9 | 5.0 |
| 26 | detenido | topical | 83/23 (df 80/22) | 3.3 | 4.9 |
| 27 | hay una | FUNC | 104/33 (df 98/33) | 2.9 | 4.8 |
| 28 | alimentos | topical | 90/28 (df 69/26) | 2.9 | 4.8 |
| 29 | este sentido | FUNC/DISCOURSE | 54/4 (df 54/4) | 12.3 | 4.7 |
| 30 | una persona | mixed | 103/34 (df 87/34) | 2.8 | 4.6 |
| 31 | cómo se | mixed | 79/21 (df 73/19) | 3.4 | 4.6 |
| 32 | en este sentido | FUNC/DISCOURSE | 54/4 (df 54/4) | 12.3 | 4.6 |
| 33 | amor | topical | 66/17 (df 50/16) | 3.5 | 4.5 |
| 34 | asegurado | topical | 57/12 (df 52/12) | 4.3 | 4.5 |
| 35 | ha anunciado | mixed | 54/9 (df 53/9) | 5.5 | 4.5 |
| 36 | esto significa | FUNC/DISCOURSE | 52/8 (df 51/8) | 5.9 | 4.4 |
| 37 | vivir | topical | 81/26 (df 72/26) | 2.8 | 4.4 |
| 38 | foto afp | topical | 56/2 (df 54/2) | 25.5 | 4.4 |
| 39 | una mayor | mixed | 54/10 (df 46/10) | 4.9 | 4.3 |
| 40 | convertido en una | FUNC/DISCOURSE | 48/5 (df 47/5) | 8.7 | 4.3 |

Function-word constructions: `es importante` (7.9x), `es necesario` (9.6x), `en este sentido` (12.3x), `esto significa` (5.9x), `ya que` (3.2x), `una forma de` (7.6x), `se puede`, `esto se`, `ayudar a`, `convertido en una`. These are the Spanish counterparts of the English hedging/opener family, but the evidence is one dataset with GPT-3/BLOOM-era generators.

News domain, human-leaning:

| # | phrase | type | m/h count (src1) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|
| 1 | bbc | topical | 33/331 (df 30/309) | 11.0 | -13.4 |
| 2 | final de | mixed | 45/280 (df 39/275) | 6.8 | -12.6 |
| 3 | final | topical | 133/363 (df 114/348) | 3.0 | -11.3 |
| 4 | us | topical | 34/164 (df 26/129) | 5.3 | -9.1 |
| 5 | la bbc | mixed | 26/141 (df 23/135) | 6.0 | -8.8 |
| 6 | quizás | topical | 4/247 (df 4/244) | 67.8 | -8.6 |
| 7 | bbc mundo | topical | 5/144 (df 5/141) | 31.6 | -7.8 |
| 8 | en inglés | mixed | 9/83 (df 9/81) | 10.1 | -6.9 |
| 9 | también te | mixed | 2/184 (df 2/184) | 101.0 | -6.8 |
| 10 | us millones | topical | 17/78 (df 13/70) | 5.0 | -6.4 |
| 11 | lea | topical | 3/100 (df 2/98) | 36.6 | -6.3 |
| 12 | apenas | topical | 24/84 (df 23/82) | 3.8 | -6.0 |
| 13 | pese | topical | 20/75 (df 20/73) | 4.1 | -5.8 |
| 14 | pese a | mixed | 16/66 (df 16/65) | 4.5 | -5.8 |
| 15 | inglés | topical | 47/111 (df 44/106) | 2.6 | -5.7 |
| 16 | de la bbc | mixed | 10/55 (df 9/55) | 6.0 | -5.6 |
| 17 | pasada | topical | 16/67 (df 14/67) | 4.6 | -5.6 |
| 18 | esta semana | mixed | 25/75 (df 24/75) | 3.3 | -5.6 |
| 19 | siglas | topical | 3/69 (df 3/67) | 25.2 | -5.6 |
| 20 | de us | mixed | 13/58 (df 9/55) | 4.9 | -5.5 |

Reviews domain, machine-leaning (shown to document the topic artefact; for tells only `en general` (5.1x, in 6 groups), `es muy`, and `variedad de` carry over):

| # | phrase | type | m/h count (src1) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|
| 1 | es muy | FUNC | 1906/276 (df 1390/255) | 3.6 | 17.1 |
| 2 | excelente | topical | 1494/224 (df 1191/213) | 3.4 | 16.2 |
| 3 | atención | topical | 1082/145 (df 1000/141) | 3.9 | 14.4 |
| 4 | amable | topical | 1214/215 (df 1164/214) | 2.9 | 13.4 |
| 5 | la atención | mixed | 838/85 (df 788/85) | 5.1 | 12.8 |
| 6 | amable y | mixed | 692/75 (df 674/75) | 4.8 | 11.4 |
| 7 | el servicio | mixed | 1321/270 (df 1219/268) | 2.5 | 11.3 |
| 8 | es excelente | mixed | 538/38 (df 473/38) | 7.3 | 10.8 |
| 9 | muy amable | mixed | 732/105 (df 704/105) | 3.6 | 10.6 |
| 10 | general | FUNC/DISCOURSE | 526/58 (df 524/57) | 4.7 | 10.6 |
| 11 | ubicación | topical | 671/116 (df 637/116) | 3.0 | 10.1 |
| 12 | en general | FUNC/DISCOURSE | 506/51 (df 504/51) | 5.1 | 9.9 |
| 13 | comida es | mixed | 561/69 (df 509/69) | 4.2 | 9.9 |
| 14 | personal es | mixed | 595/82 (df 582/82) | 3.7 | 9.7 |
| 15 | muy buena | mixed | 812/151 (df 715/147) | 2.8 | 9.6 |
| 16 | servicio es | mixed | 471/49 (df 452/49) | 5.0 | 9.5 |
| 17 | muy amable y | mixed | 454/35 (df 442/35) | 6.7 | 9.3 |
| 18 | servicial | topical | 382/40 (df 379/40) | 4.9 | 9.1 |
| 19 | la comida es | mixed | 549/68 (df 500/68) | 4.2 | 9.0 |
| 20 | es una | FUNC | 546/83 (df 487/80) | 3.4 | 8.9 |
| 21 | el restaurante | mixed | 555/88 (df 502/85) | 3.3 | 8.8 |
| 22 | el servicio es | mixed | 457/48 (df 439/48) | 4.9 | 8.7 |
| 23 | y servicial | mixed | 337/23 (df 336/23) | 7.6 | 8.6 |
| 24 | los platos | mixed | 530/86 (df 495/85) | 3.2 | 8.5 |
| 25 | muy bueno | mixed | 550/98 (df 460/93) | 2.9 | 8.1 |
| 26 | el personal es | mixed | 492/69 (df 482/69) | 3.7 | 8.1 |
| 27 | el lugar | mixed | 368/46 (df 330/44) | 4.1 | 8.0 |
| 28 | cómoda | topical | 299/34 (df 290/32) | 4.5 | 7.9 |
| 29 | son muy | FUNC | 422/64 (df 387/61) | 3.4 | 7.8 |
| 30 | era muy | mixed | 408/60 (df 339/57) | 3.5 | 7.8 |
| 31 | experiencia | topical | 395/67 (df 376/65) | 3.0 | 7.8 |
| 32 | los precios | mixed | 431/68 (df 416/64) | 3.3 | 7.7 |
| 33 | atento | topical | 488/99 (df 475/99) | 2.5 | 7.7 |
| 34 | una buena | mixed | 369/50 (df 336/50) | 3.8 | 7.7 |
| 35 | amable y servicial | topical | 301/9 (df 301/9) | 17.3 | 7.7 |
| 36 | variado | topical | 283/33 (df 279/33) | 4.4 | 7.6 |
| 37 | amplia | topical | 381/65 (df 379/64) | 3.0 | 7.6 |
| 38 | variedad de | mixed | 293/28 (df 283/27) | 5.4 | 7.6 |
| 39 | es muy amable | mixed | 304/25 (df 299/25) | 6.3 | 7.6 |
| 40 | limpia | topical | 342/54 (df 338/54) | 3.3 | 7.5 |

Reviews domain, human-leaning:

| # | phrase | type | m/h count (src1) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|
| 1 | tapas | topical | 131/261 (df 115/233) | 3.9 | -13.4 |
| 2 | mas | topical | 142/203 (df 138/184) | 2.8 | -10.0 |
| 3 | q | topical | 39/112 (df 32/72) | 5.6 | -9.7 |
| 4 | dia | topical | 23/93 (df 23/88) | 7.8 | -9.2 |
| 5 | coche | topical | 59/109 (df 55/105) | 3.6 | -8.4 |
| 6 | patio | topical | 26/80 (df 26/73) | 6.0 | -8.3 |
| 7 | tapa | topical | 29/79 (df 21/74) | 5.3 | -8.0 |
| 8 | casi | topical | 59/104 (df 59/99) | 3.4 | -8.0 |
| 9 | habitacion | topical | 91/128 (df 75/104) | 2.7 | -7.9 |
| 10 | pan | topical | 56/97 (df 55/93) | 3.4 | -7.7 |
| 11 | euros | topical | 91/124 (df 82/113) | 2.6 | -7.6 |
| 12 | y en | FUNC | 83/109 (df 81/108) | 2.5 | -7.6 |
| 13 | y a | FUNC | 68/97 (df 60/94) | 2.8 | -7.5 |
| 14 | sólo | topical | 88/119 (df 85/114) | 2.6 | -7.4 |
| 15 | sobre todo | mixed | 35/69 (df 34/67) | 3.8 | -7.3 |
| 16 | las tapas | mixed | 48/79 (df 46/76) | 3.2 | -7.3 |
| 17 | a un | FUNC | 65/91 (df 64/90) | 2.7 | -7.2 |
| 18 | el coche | mixed | 12/50 (df 11/50) | 8.1 | -7.0 |
| 19 | dias | topical | 18/50 (df 18/41) | 5.4 | -6.4 |
| 20 | el parking | mixed | 12/41 (df 12/40) | 6.6 | -6.3 |

### 2.5 Portuguese (pt): data found, not usable

Data: slices of Samambas/Human_vs_AI_Portuguese (23,552 Wikipedia chunks vs 2,048 chunks from DeepSeek/ChatGPT/Gemini, and vs 22,920 chunks of `dolphin-2.9-portuguese`). The human class is Wikipedia and books, the machine class is essays and assistant answers about linguistics, physics, psychology, "AI". The strongest machine-leaning items are topical (`ia`, `humana`, `psicologia`, `linguística`) and chat-wrapper words (`você`, `resposta`, `passo`, `pergunta`, `aqui`, `agora`), and the human side is dominated by Wikipedia vocabulary (`foi`, `brasil`, `rio de janeiro`, `álbum`, `banda`) and Wikipedia-conversion artefacts (`em de`, `de o`, `em a`). Documents are 400-character chunks, so "document frequency" counts chunks. Only `não apenas` (14x in the frontier-model subset), `não é` and `não está` are function-word candidates and they cannot be separated from genre here. No Portuguese hedge list can be derived from this data. Table for completeness (src1 = DeepSeek/ChatGPT/Gemini vs Wikipedia, src2 = Dolphin vs Wikipedia):

| # | phrase | type | m/h count (src1) | m/h count (src2) | rate ratio (src1) | mean z |
|--|--|--|--|--|--|--|
| 1 | não | FUNC | 1061/4601 (df 737/3722) | 8278/4601 (df 5554/3722) | 2.8 | 34.5 |
| 2 | você | FUNC/DISCOURSE | 142/203 (df 104/151) | 2610/203 (df 1786/151) | 8.5 | 28.1 |
| 3 | resposta | topical | 34/97 (df 33/93) | 2284/97 (df 1837/93) | 4.2 | 19.4 |
| 4 | passo | topical | 29/73 (df 24/65) | 2773/73 (df 1824/65) | 4.8 | 19.4 |
| 5 | palavras | topical | 59/130 (df 56/119) | 1237/130 (df 835/119) | 5.5 | 18.3 |
| 6 | contexto | topical | 40/97 (df 39/92) | 1430/97 (df 1180/92) | 5.0 | 17.7 |
| 7 | análise | topical | 98/114 (df 92/109) | 598/114 (df 561/109) | 10.4 | 17.2 |
| 8 | dados | FUNC/DISCOURSE | 142/242 (df 106/207) | 610/242 (df 403/207) | 7.1 | 16.1 |
| 9 | aqui | FUNC/DISCOURSE | 58/73 (df 56/71) | 690/73 (df 663/71) | 9.6 | 16.1 |
| 10 | não é | FUNC | 99/283 (df 98/264) | 980/283 (df 853/264) | 4.2 | 16.1 |
| 11 | chave | topical | 48/67 (df 47/67) | 759/67 (df 531/67) | 8.7 | 15.7 |
| 12 | agora | FUNC/DISCOURSE | 51/229 (df 49/224) | 1214/229 (df 1117/224) | 2.7 | 15.6 |
| 13 | algo | FUNC/DISCOURSE | 93/130 (df 88/126) | 472/130 (df 413/126) | 8.7 | 15.1 |
| 14 | pergunta | topical | 25/21 (df 24/21) | 1399/21 (df 1029/21) | 14.4 | 14.4 |
| 15 | conclusão | topical | 47/58 (df 46/47) | 504/58 (df 451/47) | 9.8 | 14.0 |
| 16 | experiência | topical | 57/116 (df 52/111) | 583/116 (df 543/111) | 5.9 | 14.0 |
| 17 | que você | FUNC/DISCOURSE | 31/34 (df 30/30) | 612/34 (df 547/30) | 11.0 | 13.4 |
| 18 | sim | FUNC/DISCOURSE | 27/87 (df 27/86) | 774/87 (df 711/86) | 3.8 | 13.2 |
| 19 | desafios | topical | 58/25 (df 56/25) | 209/25 (df 198/25) | 28.1 | 12.2 |
| 20 | compreensão | topical | 34/44 (df 31/41) | 403/44 (df 380/41) | 9.3 | 12.2 |
| 21 | essas | topical | 35/178 (df 35/177) | 796/178 (df 768/177) | 2.4 | 12.1 |
| 22 | garantir | FUNC/DISCOURSE | 31/53 (df 31/53) | 444/53 (df 432/53) | 7.1 | 12.1 |
| 23 | compreender | FUNC/DISCOURSE | 36/27 (df 36/27) | 318/27 (df 304/27) | 16.1 | 11.9 |
| 24 | impacto | topical | 36/55 (df 36/49) | 376/55 (df 365/49) | 7.9 | 11.9 |
| 25 | foco | topical | 50/59 (df 46/57) | 275/59 (df 260/57) | 10.3 | 11.8 |
| 26 | resumo | topical | 43/14 (df 41/14) | 308/14 (df 292/14) | 37.2 | 11.8 |
| 27 | de dados | FUNC/DISCOURSE | 67/90 (df 61/75) | 265/90 (df 176/75) | 9.0 | 11.7 |
| 28 | água | topical | 78/417 (df 67/308) | 959/417 (df 591/308) | 2.3 | 11.4 |
| 29 | problema | topical | 50/128 (df 47/114) | 432/128 (df 383/114) | 4.7 | 11.2 |
| 30 | uso | topical | 82/426 (df 75/381) | 931/426 (df 767/381) | 2.3 | 11.2 |
| 31 | alguém | topical | 28/58 (df 26/55) | 396/58 (df 344/55) | 5.8 | 11.1 |
| 32 | estar | topical | 42/174 (df 41/170) | 598/174 (df 564/170) | 2.9 | 11.0 |
| 33 | homem | topical | 64/253 (df 58/229) | 631/253 (df 406/229) | 3.1 | 10.9 |
| 34 | medida | topical | 29/136 (df 27/130) | 614/136 (df 585/130) | 2.6 | 10.8 |
| 35 | segurança | topical | 68/166 (df 61/137) | 388/166 (df 336/137) | 5.0 | 10.8 |
| 36 | precisa | FUNC/DISCOURSE | 22/54 (df 22/53) | 413/54 (df 376/53) | 4.9 | 10.6 |
| 37 | essencial | FUNC/DISCOURSE | 29/38 (df 29/38) | 276/38 (df 272/38) | 9.2 | 10.6 |
| 38 | não está | FUNC/DISCOURSE | 28/26 (df 28/26) | 258/26 (df 242/26) | 13.0 | 10.6 |
| 39 | busca | topical | 84/146 (df 78/137) | 263/146 (df 250/137) | 7.0 | 10.5 |
| 40 | olhos | topical | 55/81 (df 54/72) | 216/81 (df 164/72) | 8.2 | 10.2 |

### 2.6 Dutch (nl) and Polish (pl): no downloadable labelled corpus found

- Dutch: MULTITuDE (nl, news, 8 LLMs) exists but is request-only on Zenodo. MGTPD-Public (nl) is manually gated. The only open Dutch ChatGPT dataset found (`BramVanroy/chatgpt-dutch-simplification`) has no human text.
- Polish: MultiSocial (pl, 7,158 + ... rows per the paper's language table, search/PDF text only) is request-only. MGTPD-Public is manually gated. DETECT-AI-Dataset requires login.
- No arXiv or GitHub hit produced a downloadable Dutch or Polish ChatGPT-vs-human text corpus (GitHub repository search for those languages returned nothing; the GitHub API may also have been rate limited during the later queries, not verified).
- I did not build a substitute by comparing machine text to an unrelated human corpus, because that would measure genre, not machine style, which is the confound this task asks to avoid.

## 3. What was NOT verified

- I did not request access to MULTITuDE, MultiSocial, MGTPD-Public or DETECT-AI-Dataset; I only read their metadata. Their content, and whether Dutch and Polish phrases would replicate the other languages, is unknown.
- Generator identity: AuTexTification letters A-F were not mapped to models inside the mirror; Platina and aycabostancioglu have no generator documentation; the Italian machine tag `llama2-fine-tuned` is the dataset's label, not something I verified.
- Human-side provenance of Platina (Indonesian Wikipedia) is inferred from content, not documented. aycabostancioglu's licence (`gpl-3.0`) and authorship were not verified; I did not check whether texts were copied from third parties.
- M4GT-Bench's own licence and Indonesian human/machine split: the datasets-server row filter failed (HTTP 500/502, "index is loading"), so no COLING Indonesian rows were analysed. SemEval-2024 multilingual test has no Indonesian rows.
- RAID, MAGE, HC3, HC3-Plus, LLM-DetectAIve, MGTBench: language coverage seen only in dataset-card tags, README text or search results; none of them was downloaded. HC3-Plus was not located.
- DetectRL-X (pt, es, 33 GB) and the remaining 190 MB of the Samambas Portuguese file were not downloaded.
- Licences: licence strings are the uploader's metadata; the mirrors (`d0rj`, `anyangsong`, `Jinyan1`) may not match the original task licences. A phrase list derived from a CC-BY-NC-SA corpus (AuTexTification) or a GPL-3.0-labelled one (aycabostancioglu) may carry non-commercial or share-alike questions for an MIT project; I did not assess that legally.
- The type labels (function / discourse / topical) are a heuristic; I did not check them against a native speaker.
- The log-odds ranking is dominated by frequency; I did not run a bootstrap over documents or a permutation test, so ranks beyond the first few dozen are unstable. I did not check whether the phrases survive a different tokeniser or lemmatisation (Turkish and Indonesian are agglutinative; Turkish suffixes are separated at apostrophes only).
- Whether any listed phrase also occurs at equal rates in current (2025-2026) human web text for the same genre was not tested.

## 4. Recommendation

- Turkish: can be built from independent evidence, with caveats. Two unrelated datasets (a GPT-4 news benchmark under OpenRAIL++ and a small paragraph set of unknown origin) agree on a core of discourse constructions: `bu durum`, `bu tür`, `önemli bir`, `büyük bir`, `bir şekilde`, `ancak bu`, `ayrıca`, `aynı zamanda`, `sonuç olarak`, `daha da`, `bir rol`. Use as low-confidence "stock phrase" hints, not as proof. Human-side items (`ama`, `yani`, `bile`) are register markers; do not invert them into rules.
- Indonesian: can be built from independent evidence, with caveats. Two datasets agree on `selain itu`, `namun`, `dengan demikian`, `oleh karena itu`, `tidak hanya ... tetapi juga`, `penting untuk`, `sangat penting`, `yang unik`, and the stock verbs `meningkatkan`, `memastikan`, `menjaga`, `memahami`. Genre confound (Wikipedia vs explanations) is the main risk; the strongest connector items are the least genre-bound.
- Italian: partial. A single fine-tuned generator on one news corpus gives clear connector over-use (`inoltre`, `tuttavia`, `poiché`, `ciò`, `coloro che`, `negli ultimi anni`) but it does not meet the two-generator rule. Treat as candidate-only until a second Italian generator corpus is found.
- Spanish: partial. `es importante`, `es necesario`, `en este sentido`, `ya que`, `una forma de` recur across six generator groups, but the generators are pre-chat base models and the text is short news; not evidence about current assistant style.
- Portuguese: cannot be built from what was found (genre-mismatched, chunked, mixed provenance).
- Dutch and Polish: cannot be built from independent evidence now. Both would need access approval to MULTITuDE / MultiSocial (request-only), which this run did not request. Until then any Dutch or Polish list rests on translated or hand-written phrases, not on measured data.
