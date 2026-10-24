# French tells the linter cannot see

Source: written for this project from general knowledge of French usage; the families follow the English catalog in `en.md` (adapted from everwrite, MIT, see `THIRD-PARTY-NOTICES.md`). The second-tier word list adds words that Juzek (2026, https://github.com/tjuzek/ai-34-languages, commit 0cf18ff2458007fe51a14059a73d9e7468ed4da9, data CC0 1.0) measured as overused by a language model in French news text. No third-party French list was copied.

The linter ships one French rule (`fr/closer`, see `docs/LANGUAGES.md`), so for French text this list is the check. Most entries are the stock French renderings of English tells. Read it after the linter has run and remove what you find by judgement. A French writer may use any of these words in a sentence that needs it: judge the sentence, not the word.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `nous`, `notre`, `nos`, `je` or `mon` the source does not use. When a fix needs a detail the source lacks, cut or write the plain version, then run `--compare` again. Keep `tu` or `vous` as the source has it.

The entries come in two tiers. The first tier is a tell on one sighting when it does no work. The second tier is ordinary French one at a time: act only when several appear in one paragraph, or next to a first-tier entry. A sentence that holds no entry stays as it is.

## Act on one sighting

### Words used as filler

Each stands in for a claim. Say what happens, or cut it. Every detail you name (the step saved, the reason, the field, the benefit) must come from the source.

- `sans faille`, `sans couture`, `en toute simplicité`, `fluide et intuitive`: name the step that is saved.
- `véritable` and `un vrai` as intensifiers (`un véritable atout`, `une véritable révolution`): drop the intensifier, then check whether the noun is still true.
- `révolutionnaire`, `changer la donne`, `à la pointe de`, `un tournant` (for a routine event): say what is new.
- `tirer parti de`, `exploiter pleinement`, `capitaliser sur`: use `utiliser`.
- `booster`, `propulser`, `sublimer`: say what changes and by how much, from the source.
- `mettre en lumière`, `mettre en exergue`, `témoigner de`: weight, not facts. State the fact.
- `jouer un rôle clé`, `un rôle crucial`, `un rôle essentiel`: say what it does.
- `s'inscrire dans` (a broader trend): cut, or name the frame.
- `au cœur de`, `niché`, `vibrant` (a calque of English): say what is there.
- `plonger dans`, `naviguer` (dans un monde complexe), `relever les défis`: say what the text does or what the problem is.
- `levier`, `synergie`, `valeur ajoutée`, `solution clé en main`: name the benefit.

### Load-bearing metaphors

- A verb of weight in place of a result: `ce choix porte le projet`, `l'argument tient`, `ça paie`, `porte ses fruits`, `fait toute la différence`. It sounds decisive and names no measure. Write the plain verb with the criterion from the source (`le temps de réponse passe de 3 à 1 s`), or cut the sentence. Do not swap in another image.
- The same weight as a noun, when it names no function: `le pilier`, `le socle`, `la colonne vertébrale`, `la pierre angulaire`, `la clé de voûte`. Say what the part does.
- Literal uses stay: `le mur porte la charge`, `le fichier porte le nom`, `un pilier du pont`.

### Participle tails

- A trailing participle or `ce qui` clause that grades the sentence before it: `..., soulignant ainsi l'importance de`, `..., témoignant de son engagement`, `..., illustrant`, `..., reflétant`, `..., ce qui témoigne de`, `..., ce qui souligne`. Cut it, or give it its own sentence with a fact from the source.
- A participle that states a fact stays: `..., passant de 12 à 15 %`, `..., réduisant le délai de deux jours` when the source gives the two days.

### Stock phrases

- Openers: `À l'ère du numérique`, `Dans un monde en constante évolution`, `Dans le paysage actuel`, `De nos jours`, `Que vous soyez ... ou ...`, `Imaginez un monde où`. Start with the first fact.
- Announcing: `Plongeons dans`, `Plongeons au cœur de`, `Dans cet article, nous allons explorer`, `Découvrons ensemble`, `Sans plus attendre`. Start with the content.
- Transitions: `Il est important de noter que`, `Il convient de souligner que`, `Force est de constater que`, `Il va sans dire que`. State the point.
- Contrast against nobody: `Ce n'est pas seulement X, c'est Y`, `Plus qu'un simple X, c'est Y`, `non seulement ... mais aussi` when the first half is not in doubt, `Il ne s'agit pas de X, mais de Y`. Say Y directly.
- Colon and question reveals: `Le résultat :`, `Le meilleur ?`, `Le secret ?`, `La clé :`, `Pourquoi ? Parce que`. Write the plain sentence.
- Staged truth: `La vérité, c'est que`, `Ce que personne ne vous dit`, `Soyons clairs`, `Soyons honnêtes`. Make the claim.
- Inflation: `marque un tournant`, `ouvre un nouveau chapitre`, `témoigne de l'engagement`, `une étape décisive`. Keep the fact, drop the weight.
- False agency: `les chiffres parlent d'eux-mêmes`, `les données racontent une histoire`. Give the number, from the source.
- Vague sources: `les experts s'accordent à dire`, `selon de nombreuses études`, `il est largement admis`. Name the source or cut.
- Slogan cadence: `Moins de X. Plus de Y.`, `Simple. Rapide. Efficace.` Write a sentence with a verb.
- Closers: `En somme`, `En conclusion`, `En définitive`, `Pour conclure`, `Au final` as a ritual, `L'avenir s'annonce prometteur`, `l'avenir s'annonce radieux`, `Une chose est sûre :`, `Alors, qu'attendez-vous ?`, `Prêt à ...?`. End on the last fact.
- Calls to act: `N'hésitez pas à`, `Découvrez dès maintenant`, `Rejoignez-nous`. Keep a real instruction and say it plainly (`Écrivez à ...`).
- Chat residue: `Bien sûr !`, `Excellente question !`, `J'espère que cela vous aide`, `Voici un résumé de`, `Je reste à votre disposition` outside a letter. Delete the wrapper, keep the content.

### Calques of English

Translated machine text keeps English structure. Each of these reads as English in French words.

- `définitivement` for definitely (use `vraiment`, `sans doute`, or cut), `adresser un problème` (use `traiter`), `faire du sens` (use `avoir du sens`), `supporter` for support (use `prendre en charge`), `être excité de` (use `avoir hâte de`, or cut).
- Title Case in headings (`Les Meilleures Pratiques Du Projet`): French capitalises the first word and proper nouns only.
- A triad of adjectives for rhythm (`simple, rapide et efficace`): keep the ones the source supports.

## Act only when several appear

One of these is normal French. Several in one paragraph read as a brochure: keep the one that carries a fact, and cut or plainly restate the rest.

- Praise words: `robuste`, `fiable` as bare praise, `fluide`, `transparent` (in the English sense), `incontournable`, `essentiel`, `primordial`, `crucial`, `indispensable`, `novateur`, `innovant`, `de pointe`, `dynamique`, `riche` (patrimoine riche).
- Process words: `favoriser`, `renforcer`, `optimiser` without a measure, `souligner`, `refléter`, `explorer`, `dans le cadre de` as filler, `le paysage` (numérique, actuel), `l'écosystème`, `l'univers de`.
- Words a model overuses in French news text (Juzek 2026, CC0): `insister sur`, `mettre en avant`, `significatif`, `croissant`, `grandissant`, `garantir`, `susciter`, `approfondi`, `profondément`, `remarquable`, `ambitieux`, `audacieux`, `immersif`, `captivant`, `poignant`, `palpable`, `habilement`, `persistant`, `repenser`, `intensifier`, `rigoureux`, `dynamiser`, `résilience`, `défi`. Several in one paragraph point to generated text; one says nothing.
- Stacked transitions: `En effet,` at the start of sentence after sentence, `De plus,`, `Par ailleurs,`, `En outre,`. Use `et` or `aussi`, or nothing.
- Possessive-heavy sentences built on `votre` (`votre équipe, vos données, votre succès`): write about the thing, not the reader.

## Leave these alone

- Guillemets `« »` with their spaces, a space before `;`, `:`, `!` and `?`, and a dash that opens a line of dialogue are correct French typography.
- The decimal comma and spaces in large numbers (`12 000`, `3,5 %`) are correct. Do not reformat a number: `--compare` counts it as a change.
- Quotations, names, code and attributed statements stay as written.
