# Indonesian tells the linter cannot see

Source: the second tier follows two public Indonesian corpora, PlatinaSB/ai-and-human-text-classification (cc-by-sa-4.0; generator undocumented, human side looks like Indonesian Wikipedia, which is inferred) and shouwiku/detectai-indonesian (MIT; Gemma text against Wikipedia summaries on the same titles). The words and phrases in its top lists are 2 to 17 times more frequent in model text than in human text in Platina (docs/RESEARCH-R8-corpora.md); words in that tier that the report does not print are our additions. Encyclopedia against explanatory answers is a genre gap, so treat the list as a hint. The first tier is the Indonesian form of the classes in `en.md` (adapted from everwrite, MIT, see `THIRD-PARTY-NOTICES.md`), translated by us and not measured. No Indonesian Wikipedia page lists such tells.

The linter ships no Indonesian rule and no Indonesian phrase catalog (see `docs/LANGUAGES.md`), so for Indonesian text a clean lint proves little: this list and the read-back by class are the check. Read it after the linter has run. Every phrase below is also ordinary Indonesian: judge the sentence, not the word.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `kami`, `kita`, `saya` or `aku` the source does not use. When a fix needs a detail the source lacks, cut the claim or write the plain version, then run `--compare` again. Keep `Anda` or `kamu` as the source has it, and keep the number format (`Rp1.500.000`, `4,8 detik`, `1,5 juta`).

## Act on one sighting

### Assistant wrappers

- `Berikut adalah`, `Berikut ini` at the start of a reply, `Tentu!`, `Tentu saja!`, `Semoga membantu`, `Semoga bermanfaat`, `Jangan ragu untuk`, `Silakan beri tahu saya`. Delete the wrapper and keep the content.

### Announcements and closers

- `Mari kita selami`, `Dalam artikel ini kita akan`, `Tanpa basa-basi lagi`. Start with the first fact from the source.
- `Kesimpulannya` as a recap of what the paragraph just said, `Masa depan terlihat cerah`, `Nantikan pembaruan selanjutnya`. End on the last fact.

### Inflated importance

- `memainkan peran penting`, `peran krusial`, `menjadi bukti`, `titik balik`. Say what the thing does, with the measure from the source.
- `lanskap yang terus berkembang`, `di era digital saat ini`, `di dunia yang serba cepat`. Cut, or name the real context.

### Hedge stacks and vague links

- `dapat berpotensi`, `mungkin saja dapat`, `tampaknya dapat meningkatkan`, `tampaknya berkaitan dengan`. One hedge where the source is unsure, in the degree the source has; remove it where the source gives no reason for the doubt. Never turn it into a certain claim.
- `para ahli berpendapat`, `penelitian menunjukkan`, `banyak yang percaya`. Name the source or drop the claim.

### Parallelism and sham breadth

- `tidak hanya ... tetapi juga`, `bukan hanya ... melainkan`: say the second part directly.
- `mulai dari ... hingga ...` when the two ends are not a real range in the source.

## Act only when several appear

Each is normal in a sentence that needs it. Several in one paragraph, or next to a first-tier entry, read as model text. Keep the one that carries a fact.

- Connectors that open sentences in a row: `Selain itu,`, `Namun,`, `Oleh karena itu,`, `Dengan demikian,`. Use `dan`, `tetapi`, or no connector.
- Importance words: `penting`, `sangat penting`, `penting untuk`, `pentingnya`, `penting dalam`. Say what depends on the thing, from the source.
- Praise adjectives: `unik`, `kompleks`, `signifikan`, `efektif`, `kuat`, and stacked `yang sangat` (in the report); `komprehensif`, `inovatif`, `holistik`, `optimal` (our additions).
- Stock verbs: `meningkatkan`, `memastikan`, `menjaga`, `memahami`, `menawarkan`, `menekankan` (in the report); `memfasilitasi`, `mengoptimalkan` (our additions), when no measure or object from the source follows.
- Rule of three in lists of benefits, when the source names fewer.

## Leave these alone

- The dot as thousands mark and the comma as decimal mark are correct. Do not reformat a number: `--compare` counts it as a change. Month names and dates stay as written.
- `kami` (we, not you) and `kita` (we, with you) differ in meaning: keep the one the source uses.
- Quotations, names, code and attributed statements stay as written.
- A text with none of the first-tier entries stays byte-identical.
