# Portuguese tells the linter cannot see

Source: the families follow the English catalog in `en.md` (adapted from everwrite, MIT, see `THIRD-PARTY-NOTICES.md`). The phrases marked in the text come from the Portuguese Wikipedia page "Sinais de texto gerado por inteligência artificial" (https://pt.wikipedia.org/wiki/Wikipédia:Sinais_de_texto_gerado_por_inteligência_artificial, CC BY-SA 4.0), used as a source of facts about patterns; no prose is copied. The explanations and the other entries are our own.

The linter ships no Portuguese rule (see `docs/LANGUAGES.md`), so for Portuguese text this list is the check. Read it after the linter has run and remove what you find by judgement. A Portuguese writer may use any of these words in a sentence that needs it: judge the sentence, not the word. The same patterns hold as in English: translate the construction, not only the word.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `nós`, `nosso`, `eu` or `meu` the source does not use. When a fix needs a detail the source lacks, cut or write the plain version, then run `--compare` again. Keep `você` or `o senhor` as the source has it, and keep the European or Brazilian spelling the source uses.

The entries come in two tiers. The first tier is a tell on one sighting when it does no work. The second tier is ordinary Portuguese one at a time: act only when several appear in one paragraph, or next to a first-tier entry. A sentence that holds no entry stays as it is.

## Act on one sighting

### Words used as filler

Each stands in for a claim. Say what happens, or cut it. Every detail you name (the step saved, the reason, the field, the benefit) must come from the source.

- `papel crucial`, `papel fundamental`, `marco importante` (for a routine event), `reflete uma mudança mais ampla`, `teve impacto duradouro`, `consolidou seu legado`: weight, not facts. Say what it does or what changed, from the source.
- `é importante notar`, `é importante lembrar`, `é importante ressaltar`, `vale ressaltar`, `vale destacar`, `vale mencionar`: the sentence after it is the point. Start with it.
- `especialistas apontam`, `alguns críticos argumentam`, `diversos veículos noticiaram`: name the source or drop the claim.
- `sem costura`, `robusto`, `revolucionário`, `divisor de águas`: name the step that is saved or the measure.
- `mergulhe em`, `vamos mergulhar`: say what the text does.

### Modal and vague-link hedges

- A modal hedge on what a feature does, in publishable text (release notes, README, PR text, status text, incident notes): `poderia melhorar o desempenho`, `pode potencialmente reduzir`, `poderia eventualmente`. When the source names no reason for the uncertainty, soften to the plain form that keeps the degree (`pode melhorar`), or state the result when the source states it; when it names one (a condition, a cause, a measured range), keep the hedge. Never turn it into a certain claim.
- A vague link on a stated cause: `parece estar relacionado a`, `parece estar ligado a`, `parece ser associado a`. Write `parece ser` plus the cause only when the source names one; otherwise keep the source's degree and drop the vague link.
- Scope, legal, medical and safety hedges, and a real uncertainty the source states with its reason, stay word for word.
- `tende a` and `talvez` are more typical of human writing, according to the Portuguese Wikipedia page. They are not tells; leave them.

### Load-bearing metaphors

- A verb of weight in place of a result: `esta decisão sustenta todo o projeto`, `o argumento se sustenta`, `dá frutos`, `faz a diferença`, `é o que move tudo`. It sounds decisive and names no measure. Write the plain verb with the criterion from the source (`os erros caíram de 40 para 12 por mês`), or cut the sentence. Do not swap in another image.
- The same weight as a noun, when it names no function: `o pilar`, `a espinha dorsal`, `a pedra angular`, `uma base sólida`, `o motor de`. Say what the part does.
- Literal uses stay: `a viga sustenta o teto`, `os pilares da ponte`, `o motor do carro`.
- Example explainer: `A mensagem é clara:`, `Isso mostra que` after an example that already showed it. Cut the sentence.
- Slogan cadence: `Menos X. Mais Y.`, `Simples. Rápido. Eficaz.` Write a sentence with a verb.
- Negative parallelism: `não apenas ... mas também`, `não é só ... é`. Say the second part directly.
- Template balance: `Apesar de X, o tema enfrenta desafios`, `Por um lado ... por outro` with no verdict. Give the verdict only if the source gives it.
- Closers: `Em suma`, `Em conclusão`, `O futuro é promissor`, `Uma coisa é certa:`. End on the last fact.
- Calls to act: `Não hesite em`, `Descubra agora`, `Junte-se a`. Keep a real instruction and say it plainly (`Escreva para ...`).
- Chat residue: `Claro!`, `Com certeza!`, `Ótima pergunta!`, `Espero que isso ajude`, `Posso ajustar o texto`, `Aqui está um resumo de`. Delete the wrapper, keep the content.

### Gerund tails

- A gerund clause after a comma that adds weight: `, destacando a importância de`, `, reforçando o papel de`, `, evidenciando que`. Cut it, or give it its own sentence with a fact in it from the source.

### Portuguese special cases

- Sham breadth: `De pequenas empresas a grandes corporações`, `Seja em casa ou no escritório`. Name the real audience from the source; a real range stays.
- Register switch: `você` in one paragraph and `o senhor` in the next reads as spliced text. Use the form the source uses most.
- Realization coda: `E foi então que percebi que ...` after a story. End on the event.

### Calques of English

- `fazer sentido` is correct Portuguese; `aplicar para` a job (use `candidatar-se`), `suportar` for support (use `aceitar`, `ser compatível com`), `eventualmente` meaning "in the end" (it means "occasionally", use `por fim`), `realizar` meaning "notice" (use `perceber`).
- Title Case in headings (`As Melhores Práticas Do Projeto`): Portuguese capitalises the first word and proper nouns only.
- A triad of adjectives for rhythm (`simples, rápido e eficaz`): keep the ones the source supports.

## Act only when several appear

One of these is normal Portuguese. Several in one paragraph read as a brochure: keep the one that carries a fact, and cut or plainly restate the rest.

- Praise words: `robusto`, `fluido`, `abrangente`, `crucial`, `fundamental`, `chave` (`um aspecto chave`), `inovador`, `de ponta`, `ecossistema`, `panorama`.
- Process words: `potencializar`, `impulsionar`, `fomentar`, `otimizar` without a measure, `apostar em`.
- Stacked transitions: `Além disso,`, `Nesse sentido,`, `Adicionalmente,`, `Por conseguinte,` at the start of sentences in a row. Use `e` or `também`, or nothing.
- Possessive-heavy sentences built on `seu` (`sua equipe, seus dados, seu sucesso`): write about the thing, not the reader.
- `pode variar` as a catch-all hedge on a plain fact. Keep it where the source says the value varies.
- Stacked hedges: `poderia potencialmente`, `talvez possivelmente`. One hedge, where the source is unsure.

## Leave these alone

- Accents, the cedilla, `«»` and `“”` quotes, the dash that opens dialogue, the decimal comma and Portuguese number formats are correct. Do not reformat a number: `--compare` counts it as a change.
- Quotations, names, code and attributed statements stay as written.
