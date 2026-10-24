# Turkish tells the linter cannot see

Source: the second tier follows two public Turkish corpora, tum-nlp/neural-news-benchmark (3,400 human news documents against 1,000 GPT-4 documents that continue a human headline; openrail++) and aycabostancioglu/Arabic-English-Turkish-AI-Human-Text (gpl-3.0, generator not documented). The phrases in its pointer and connector bullets appear in both corpora with a machine-to-human frequency ratio of about 2.5 to 60 (docs/RESEARCH-R8-corpora.md); praise words in that tier that the report does not print are our additions. The corpora differ in genre and the generators are few, so the list is a hint, not proof. The first tier is the Turkish form of the classes in `en.md` (adapted from everwrite, MIT, see `THIRD-PARTY-NOTICES.md`), translated by us and not measured. No Turkish Wikipedia page lists such tells.

The linter ships no Turkish rule and no Turkish phrase catalog (see `docs/LANGUAGES.md`), so for Turkish text a clean lint proves little: this list and the read-back by class are the check. Pass `--language tr` to the linter and to `--compare`. Every phrase below is also ordinary Turkish: judge the sentence, not the phrase.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `biz`, `bizim`, `ben` or `benim`, and no first-person verb or possessive suffix (`-ız`, `-ımız`), that the source does not use. When a fix needs a detail the source lacks, cut the claim or write the plain version, then run `--compare` again. Keep `siz` or `sen` as the source has it, and keep the number format (`%40`, `4,8 saniye`, `1.250`).

## Act on one sighting

### Assistant wrappers

- `Elbette!`, `Tabii ki!`, `İşte` at the start of a reply, `Umarım yardımcı olur`, `Çekinmeden sorabilirsiniz`, `Başka bir sorunuz varsa`. Delete the wrapper and keep the content.

### Announcements and closers

- `Hadi başlayalım`, `Bu makalede ... ele alacağız`, `Daha fazla uzatmadan`. Start with the first fact from the source.
- `Sonuç olarak` as a recap of what the paragraph just said, `Gelecek parlak görünüyor`, `Bizi takip etmeye devam edin`. End on the last fact.

### Inflated importance

- `önemli bir rol oynar`, `kilit rol`, `dönüm noktası`. Say what the thing does, with the measure from the source.
- `dijital çağda`, `günümüzün hızla değişen dünyasında`, `sürekli gelişen dünyada`. Cut, or name the real context.

### Hedge stacks and vague links

- Stacked `-ebilir` with an adverb: `potansiyel olarak artırabilir`, `muhtemelen yardımcı olabilir`, `gibi görünüyor`. One hedge where the source is unsure, in the degree the source has; remove it where the source gives no reason for the doubt. Never turn it into a certain claim. A plain `-ebilir` on a fact is ordinary Turkish: leave it.
- `uzmanlara göre`, `araştırmalar gösteriyor ki`, `birçok kişi inanıyor`. Name the source or drop the claim.

### Parallelism

- `yalnızca ... değil, aynı zamanda ...`, `sadece ... değil ...`: say the second part directly.

## Act only when several appear

Each is normal in a sentence that needs it. Several in one paragraph, or next to a first-tier entry, read as model text. Keep the one that carries a fact.

- Pointer phrases: `bu durum`, `bu tür`, `ancak bu`, `bir şekilde`, `önemli bir`, `büyük bir`, `daha da`, `bir rol`.
- Connectors that open sentences in a row: `Ayrıca,`, `Aynı zamanda,`, `Sonuç olarak,`.
- Adverbs of emphasis: `özellikle`, `genellikle`.
- Didactic disclaimers: `unutulmamalıdır ki`, `belirtmek gerekir ki`, `dikkat çekicidir`, `bir kanıtıdır`. Formal Turkish uses them; act when they stand in for a fact.
- Praise words (our additions, not in the report): `kapsamlı`, `yenilikçi`, `etkili`, `güçlü`, `bütüncül`.

## Leave these alone

- Suffixes after an apostrophe (`Ankara'da`, `CHP'nin`) are correct; keep them. Do not reformat numbers: the dot is the thousands mark, the comma the decimal mark, and `%40` is correct. `--compare` counts a reformat as a change.
- Quotations, names, code and attributed statements stay as written.
- A text with none of the first-tier entries stays byte-identical.
