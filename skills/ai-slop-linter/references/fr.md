# French tells the linter cannot see

Source: written for this project from general knowledge of French usage; the families follow the English catalog in `en.md` (adapted from everwrite, MIT, see `THIRD-PARTY-NOTICES.md`). No third-party French list was copied.

The linter ships one French rule (`fr/closer`, see `docs/LANGUAGES.md`), so for French text this list is the check. Most entries are the stock French renderings of English tells. Read it after the linter has run and remove what you find by judgement. A French writer may use any of these words in a sentence that needs it: judge the sentence, not the word.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `nous`, `notre`, `nos`, `je` or `mon` the source does not use. When a fix needs a detail the source lacks, cut or write the plain version, then run `--compare` again. Keep `tu` or `vous` as the source has it.

## Words: replace when they are filler

Each stands in for a claim. Say what happens, or cut it.

- `robuste`, `fiable` as bare praise: say what it survives or how often it fails, if the source says so.
- `fluide`, `sans faille`, `sans couture`, `transparent` (in the English sense), `en toute simplicité`: name the step that is saved.
- `incontournable`, `essentiel`, `primordial`, `crucial`, `indispensable`: give the reason, or cut.
- `véritable` and `un vrai` as intensifiers (`un véritable atout`, `une véritable révolution`): drop the intensifier, then check whether the noun is still true.
- `révolutionnaire`, `novateur`, `innovant`, `de pointe`, `à la pointe de`, `changer la donne`, `un tournant`: say what is new.
- `tirer parti de`, `exploiter pleinement`, `capitaliser sur`: use `utiliser`.
- `favoriser`, `renforcer`, `booster`, `propulser`, `sublimer`, `optimiser` without a measure: say what changes and by how much, from the source.
- `mettre en lumière`, `mettre en exergue`, `souligner`, `témoigner de`, `refléter`: weight, not facts. State the fact.
- `jouer un rôle clé`, `un rôle crucial`, `un rôle essentiel`: say what it does.
- `s'inscrire dans` (a broader trend), `dans le cadre de` as filler: cut, or name the frame.
- `le paysage` (numérique, actuel), `l'écosystème`, `l'univers de`: name the field.
- `au cœur de`, `niché`, `vibrant` (a calque of English), `dynamique`, `riche` (patrimoine riche): say what is there.
- `plonger dans`, `explorer`, `naviguer` (dans un monde complexe), `relever les défis`: say what the text does or what the problem is.
- `levier`, `synergie`, `valeur ajoutée`, `solution clé en main`, `expérience utilisateur fluide et intuitive`: name the benefit.

## Stock phrases

- Openers: `À l'ère du numérique`, `Dans un monde en constante évolution`, `Dans le paysage actuel`, `De nos jours`, `Que vous soyez ... ou ...`, `Imaginez un monde où`. Start with the first fact.
- Announcing: `Plongeons dans`, `Plongeons au cœur de`, `Dans cet article, nous allons explorer`, `Découvrons ensemble`, `Sans plus attendre`. Start with the content.
- Transitions: `Il est important de noter que`, `Il convient de souligner que`, `Force est de constater que`, `Il va sans dire que`, `En effet,` at the start of sentence after sentence, `De plus,`, `Par ailleurs,`, `En outre,` stacked. State the point; use `et` or `aussi`, or nothing.
- Contrast against nobody: `Ce n'est pas seulement X, c'est Y`, `Plus qu'un simple X, c'est Y`, `non seulement ... mais aussi` when the first half is not in doubt, `Il ne s'agit pas de X, mais de Y`. Say Y directly.
- Colon and question reveals: `Le résultat :`, `Le meilleur ?`, `Le secret ?`, `La clé :`, `Pourquoi ? Parce que`. Write the plain sentence.
- Staged truth: `La vérité, c'est que`, `Ce que personne ne vous dit`, `Soyons clairs`. Make the claim.
- Inflation: `marque un tournant`, `ouvre un nouveau chapitre`, `témoigne de l'engagement`, `une étape décisive`. Keep the fact, drop the weight.
- Vague sources: `les experts s'accordent à dire`, `selon de nombreuses études`, `il est largement admis`. Name the source or cut.
- Closers: `En somme`, `En conclusion`, `En définitive`, `Pour conclure`, `Au final` as a ritual, `L'avenir s'annonce prometteur`, `l'avenir s'annonce radieux`, `Une chose est sûre :`, `Alors, qu'attendez-vous ?`, `Prêt à ...?`. End on the last fact.
- Calls to act: `N'hésitez pas à`, `Découvrez dès maintenant`, `Rejoignez-nous`. Keep a real instruction and say it plainly (`Écrivez à ...`).
- Chat residue: `Bien sûr !`, `Excellente question !`, `J'espère que cela vous aide`, `Voici un résumé de`, `Je reste à votre disposition` outside a letter. Delete the wrapper, keep the content.

## Calques of English

Translated machine text keeps English structure. Each of these reads as English in French words.

- `définitivement` for definitely (use `vraiment`, `sans doute`, or cut), `adresser un problème` (use `traiter`), `faire du sens` (use `avoir du sens`), `supporter` for support (use `prendre en charge`), `être excité de` (use `avoir hâte de`, or cut).
- Title Case in headings (`Les Meilleures Pratiques Du Projet`): French capitalises the first word and proper nouns only.
- A triad of adjectives for rhythm (`simple, rapide et efficace`): keep the ones the source supports.
- Possessive-heavy sentences built on `votre` (`votre équipe, vos données, votre succès`): write about the thing, not the reader.

## Leave these alone

- Guillemets `« »` with their spaces, a space before `;`, `:`, `!` and `?`, and a dash that opens a line of dialogue are correct French typography.
- The decimal comma and spaces in large numbers (`12 000`, `3,5 %`) are correct. Do not reformat a number: `--compare` counts it as a change.
- Quotations, names, code and attributed statements stay as written.
