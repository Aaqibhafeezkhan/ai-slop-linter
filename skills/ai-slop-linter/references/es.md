# Spanish tells the linter cannot see

Source: written for this project from general knowledge of Spanish usage; the families follow the English catalog in `en.md` (adapted from everwrite, MIT, see `THIRD-PARTY-NOTICES.md`). The second-tier word list adds words that Juzek (2026, https://github.com/tjuzek/ai-34-languages, commit 0cf18ff2458007fe51a14059a73d9e7468ed4da9, data CC0 1.0) measured as overused by a language model in Spanish news text. No third-party Spanish list was copied.

The linter ships no Spanish rule (see `docs/LANGUAGES.md`), so for Spanish text this list is the check. Most entries are the stock Spanish renderings of English tells. Read it after the linter has run and remove what you find by judgement. A Spanish writer may use any of these words in a sentence that needs it: judge the sentence, not the word.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `nosotros`, `nuestro`, `yo` or `mi` the source does not use. When a fix needs a detail the source lacks, cut or write the plain version, then run `--compare` again. Keep `tú` or `usted` as the source has it.

The entries come in two tiers. The first tier is a tell on one sighting when it does no work. The second tier is ordinary Spanish one at a time: act only when several appear in one paragraph, or next to a first-tier entry. A sentence that holds no entry stays as it is.

## Act on one sighting

### Words used as filler

Each stands in for a claim. Say what happens, or cut it. Every detail you name (the step saved, the reason, the field, the benefit) must come from the source.

- `sin fisuras`, `de forma fluida`, `en un abrir y cerrar de ojos`: name the step that is saved.
- `un antes y un después`, `revolucionario`, `cambiar las reglas del juego`, `marca un hito` (for a routine event): say what is new, from the source.
- `un verdadero testimonio de`, `es un claro reflejo de`, `pone de manifiesto`: weight, not facts. State the fact.
- `desbloquear` (unlock), `aprovechar al máximo`, `llevar al siguiente nivel`, `sacar el máximo partido`: say what changes, from the source.
- `juega un papel crucial`, `juega un papel fundamental`, `un rol clave`: say what it does.
- `en el corazón de`, `vibrante` (a calque of English), `enclavado en`: say what is there.
- `sumérgete en`, `adentrémonos en`, `navegar` (un mundo complejo): say what the text does or what the problem is.
- `sinergia`, `valor añadido`, `solución llave en mano`: name the benefit.

### Load-bearing metaphors

- A verb of weight in place of a result: `esta decisión sostiene todo el proyecto`, `el argumento se sostiene`, `da sus frutos`, `rinde frutos`, `marca la diferencia`, `es lo que mueve todo`. It sounds decisive and names no measure. Write the plain verb with the criterion from the source (`los errores bajaron de 40 a 12 al mes`), or cut the sentence. Do not swap in another image.
- The same weight as a noun, when it names no function: `el pilar`, `la columna vertebral`, `la piedra angular`, `una base sólida`, `el motor de`. Say what the part does.
- Literal uses stay: `la viga sostiene el techo`, `los pilares del puente`, `el motor del coche`.

### Gerund and comment tails

Spanish gerunds are often correct (`salió corriendo`, `trabaja revisando contratos`). The tell is the trailing comment clause that grades the sentence before it.

- `..., destacando su compromiso con`, `..., consolidándose como`, `..., reafirmando`, `..., lo que refleja`, `..., lo que subraya`, `..., lo que pone de manifiesto`, `..., lo que demuestra la importancia de`. Cut it, or give it its own sentence with a fact from the source.
- A tail that states a fact stays: `..., pasando de 10 a 12 sedes`, `..., lo que redujo el plazo a dos días` when the source gives the two days.

### Stock phrases

- Openers: `En la era digital`, `En un mundo en constante evolución`, `En el panorama actual`, `Hoy en día, más que nunca`, `Imagina un mundo en el que`, `Ya seas ... o ...`. Start with the first fact.
- Announcing: `En este artículo exploraremos`, `Vamos a sumergirnos en`, `A continuación, descubriremos`, `Sin más preámbulos`. Start with the content.
- Transitions: `Es importante destacar que`, `Cabe señalar que`, `Cabe destacar que`, `Vale la pena mencionar que`, `No es ningún secreto que`. State the point.
- Contrast against nobody: `no solo ... sino también` when the first half is not in doubt, `No se trata de X, sino de Y`, `Más que un simple X, es Y`, `Esto no significa que ...`. Say the second half directly.
- Reveals: `¿El resultado?`, `La clave:`, `¿Lo mejor?`, `¿Por qué? Porque`, `Pero, ¿cómo funciona?` followed by the answer. Write the plain sentence.
- Staged truth: `La verdad es que`, `Lo que nadie te cuenta`, `Seamos claros`, `Seamos sinceros`, `Esto es más importante de lo que parece`. Make the claim.
- Inflation: `un hito sin precedentes`, `abre un nuevo capítulo`, `una etapa decisiva`, `sienta las bases de`. Keep the fact, drop the weight.
- False agency: `los números hablan por sí solos`, `los datos cuentan una historia`, `pinta un panorama claro`. Give the number or name who decided, from the source.
- Vague sources: `los expertos coinciden en que`, `según diversos estudios`, `es ampliamente reconocido`. Name the source or cut.
- Example explainer: `El mensaje es claro:`, `Esto demuestra que` after an example that already showed it. Cut the sentence.
- Slogan cadence: `Menos X. Más Y.`, `Simple. Rápido. Eficaz.` Write a sentence with a verb.
- Template balance: `Si bien X es prometedor, Y sigue siendo un desafío`, `Por un lado ... por otro` with no verdict. Give the verdict only if the source gives it.
- Closers: `En resumen`, `En conclusión`, `En definitiva`, `El futuro es prometedor`, `Sin duda,` as a ritual, `Una cosa está clara:`, `¿Estás listo para ...?`, `¿A qué esperas?`. End on the last fact.
- Calls to act: `No dudes en`, `Descubre ahora`, `Únete a`. Keep a real instruction and say it plainly (`Escribe a ...`).
- Chat residue: `¡Claro!`, `¡Por supuesto!`, `¡Excelente pregunta!`, `Espero que esto te ayude`, `Aquí tienes un resumen de`, `Quedo a tu disposición` outside a letter. Delete the wrapper, keep the content.

### Spanish special cases

- Sham breadth: `Desde pymes hasta grandes corporaciones`, `Ya sea en casa o en la oficina`. Name the real audience from the source; a real range stays.
- Register switch: `tú` in one paragraph and `usted` in the next reads as spliced text. Use the form the source uses most.
- Realization coda: `Y fue entonces cuando entendí que ...` after a story. End on the event.

### Calques of English

- `hacer sentido` (use `tener sentido`), `aplicar para` a job (use `solicitar`), `en orden a` (use `para`), `jugar un rol` (use `cumplir una función`, or say what it does), `soportar` for support (use `admitir`, `ser compatible con`), `estar excitado por` (use `tener ganas de`, or cut), `remover` for remove (use `quitar`, `eliminar`).
- Title Case in headings (`Las Mejores Prácticas Del Proyecto`): Spanish capitalises the first word and proper nouns only.
- A triad of adjectives for rhythm (`simple, rápido y eficaz`): keep the ones the source supports.

## Act only when several appear

One of these is normal Spanish. Several in one paragraph read as a brochure: keep the one that carries a fact, and cut or plainly restate the rest.

- Praise words: `robusto`, `fluido`, `integral`, `crucial`, `fundamental`, `clave` (`un aspecto clave`), `innovador`, `de vanguardia`, `ecosistema`, `panorama`.
- Process words: `potenciar`, `impulsar`, `fomentar`, `optimizar` without a measure, `apostar por`.
- Words a model overuses in Spanish news text (Juzek 2026, CC0): `destacar`, `subrayar`, `enfatizar`, `realzar`, `fortalecer`, `implementar`, `consolidar`, `significativo`, `importancia`, `desafío`, `imborrable`, `palpable`, `entrelazar`, `resonar`, `creciente`, `exhaustivo`, `cuidadosamente`, `revitalizar`, `dedicación`, `perseverancia`, `versatilidad`. Several in one paragraph point to generated text; one says nothing.
- Stacked transitions: `Además,`, `Asimismo,`, `Por otro lado,`, `De igual manera,` at the start of sentences in a row. Use `y` or `también`, or nothing.
- Possessive-heavy sentences built on `tu` (`tu equipo, tus datos, tu éxito`): write about the thing, not the reader.
- Stacked hedges: `podría potencialmente`, `quizás posiblemente`. One hedge, where the source is unsure.

## Leave these alone

- `¿` and `¡`, the dash that opens dialogue, `«»` quotes, the decimal comma and Spanish number formats are correct. Do not reformat a number: `--compare` counts it as a change.
- Quotations, names, code and attributed statements stay as written.
