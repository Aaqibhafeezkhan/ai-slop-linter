---
name: ai-slop-linter
description: Use whenever you write, edit, rewrite, clean up, polish, proofread or "make ready to ship" any prose a person will read, in any language (commit message, PR description, README, docs, release notes, launch notes, article), or for réécris, reescribe, schreib um, yeniden yaz. Run `npx ai-slop-linter` on it and fix every finding. Also use when text "reads like an AI wrote it", "sounds like ChatGPT" or sounds robotic, to humanize or de-slop it, to make it sound natural or more human, to remove em dashes, or to set up a CI check on prose or docs.
---

# ai-slop-linter

**First action:** run `npx ai-slop-linter` on the text before you read or edit anything else. Then read the reference file for the language, rewrite, and run `--verify` until it exits 0.

You write a lot of prose: commit messages, pull request descriptions, docs, release notes. Most of it carries the same tells, and readers skip text that carries them. This skill makes you check before you hand text over, and check that a rewrite kept the facts. A `UserPromptSubmit` hook in this plugin adds one line pointing here when a prompt asks for a rewrite, clean-up, polish or proofread.

## Check the language first

Before you lint, decide which language the text is in. For text that is not English, pass the tag: `npx ai-slop-linter --language fr path/to/file.md` (a BCP 47 tag such as `de`, `tr` or `pt-BR`). The CLI also works the language out for each file, from its front matter and then its text, and names the language in its output when it guessed. Pass the flag anyway when you know the language.

Some punctuation is correct in other languages: a dash opens dialogue in French and Russian; for text whose language is not English the `dash` and `title-case-heading` rules stand down, and the CLI names the language it used. If a dash in non-English text is still reported, check it against that language's own rules before you change it.

Every pattern in the reference files holds in every language. Translate the construction, not only the word: a hedge stacked on a modal, a vague link, a counted-list opener or an assistant wrapper is the same tell in Portuguese, Turkish or Japanese as in English. A language with no reference file is still checked for the classes in the read-back step below.

## How to run it

Do not check the text by eye when `npx` works: the linter knows more patterns than the list at the end of this file.

```
npx ai-slop-linter path/to/file.md          # a file, exits 1 on errors
printf '%s' "$TEXT" | npx ai-slop-linter -   # text you have in hand
npx ai-slop-linter --commit                  # the last commit message
npx ai-slop-linter path/to/file.md --fix     # apply the safe fixes in place
npx ai-slop-linter --compare before.md after.md   # facts a rewrite lost or added
npx ai-slop-linter --verify before.md after.md    # lint errors, compare and the tell catalog, one exit code
```

Read the output top to bottom. Each line is `line:col severity rule message`. Apply the fixes yourself rather than only running `--fix`: it handles dashes, curly quotes, invisible characters and filler phrases, and leaves the rest to you because those need a sentence rewritten, not a character swapped. `--fix` also rewrites a dash inside a quotation in another language, for example a Turkish sentence in an English file, so mark those lines with a directive (see below) before you run it. The file grades A to F. Aim for A on anything you ship.

## Fix the real tells

Fix every finding that is a real tell. Quoted words and dialogue are someone else's words: text inside quotation marks or guillemets (`«…»`, `„…“`), and a line that opens with a dash as dialogue. Never edit those to clear a finding. If the CLI still flags them, mark the line with a directive from the README: `<!-- slop-ignore-next-line RULE -->` covers one line, `<!-- slop-ignore RULE -->` covers the rest of the file. Then say in your answer which lines you silenced and why. Outside quotes and dialogue, do not add `slop-ignore` comments to make a file pass; rewrite the sentence.

## Rewrite, then compare

Before you edit, make a temporary directory outside the repository and keep a copy of the original in it:

```
TMP=$(mktemp -d)
cp path/to/file.md "$TMP/before.md"                  # or: git show HEAD:path/to/file.md > "$TMP/before.md"
```

For text in hand, write it to "$TMP/before.md" first. After every rewrite, compare against that one original:

```
npx ai-slop-linter --compare "$TMP/before.md" path/to/file.md
```

The comparison lists each number, name, version, link, quote and code span that was lost or added, and exits 1 when there is one. It also lists `person` lines (a first-person word such as `our` or `we` that you added, or dropped) `claim` lines (a word such as `always` or `guaranteed` that you added) and `qualifier` lines (`lost qualifier up to 3`: a bound or an approximator next to a number that you dropped or added). English `about` is not checked, so keep it yourself.

The rewrite is not done until `--verify` exits 0:

```
npx ai-slop-linter --verify "$TMP/before.md" path/to/file.md
```

It runs the lint errors, the compare above, a scan of the stock phrases in `references/<lang>.tells.txt` and a `hedge` check, and prints `verify: ok` (or `verify: ok (unchanged)`) or `verify: N problem(s)`. Fix each reported line by the smallest edit that adds no fact. For a `catalog` hit, cut or rewrite that sentence, and never add a first-person word, number or name. Never ship while it exits 1. A `hedge` line is a modal verb with a hedge adverb within three words (`could potentially`, `may possibly`), an evidential with a vague link (`seems to be related to`), or a conditional or appearance verb next to a verb of effect with no reason in the sentence (`could shorten`, `seems to speed up`, `podría acelerar`, `könnte beschleunigen`; en, es, pt, de, fr, nl). Apply the hedge-support test under "Add no fact". A plain modal (`can reduce`) or `seems` alone is never a hit. If the source gives the reason in the next sentence, keep the hedge and mark it with `<!-- slop-ignore-next-line hedge -->`; that is the one case where the directive is right outside quotes. The scans skip quotes, code and dialogue. A `rebuild` line (a long sentence that chains clauses and holds a finding) is information, never a problem.

`--verify` also blocks a `length` problem (the rewrite is under 35% or over 130% of the original outside code blocks) and lists each `unrequested edit`: an original sentence that is gone and that no finding explained. Restore it, or name the tell you removed. If it prints `clean source: no edit is expected`, or the lint reports nothing and `--verify` on an unchanged copy prints `verify: ok (unchanged)`, the file stays byte-identical: no join, split, reorder, rewording or punctuation change for rhythm. Any byte changed outside a finding is an edit. Answer "no change needed" and say which checks ran.

Read-back, after `--verify` exits 0: read each sentence you rewrote against (1) these classes: modal hedges on effects, vague-link evidentials, hedge adverbs such as `hopefully`, reassurance qualifiers on a stated fact, counted-list openers, stacked intensifiers, assistant wrappers, stock scenario openers; (2) the original's labels next to numbers and names; (3) persons: no `we`, `I`, `our` or their equivalents (`fizemos`, `wir`, `nous`) added. Change a sentence only when it names a class, lost a label or gained a person. Skip quoted text, dialogue, and legal, medical or safety text where a hedge is content. Run `--verify` again after any edit.

Outside English, Spanish, Portuguese, German and French a clean `--verify` proves less: the CLI has no phrase catalog for Dutch, Italian, Polish, Indonesian or Turkish and prints a `note:` line saying so. Then the read-back by class and the reference file are the check.

A failing compare is blocking. Lines such as `added person our`, `added claim always` or `lost number 40%` mean the rewrite is not done: put the lost fact or word back, remove the added word, and run the compare again until it exits 0. Never add "we", "our", "I" or a claim the source does not make, and change no number or fact; an added "our" needs a source that says whose it is. The compare does not flag an added "I", "I'd" or German "uns": check those yourself. For a short or Turkish text, pass `--language` to the compare too. The one line you may leave is a loss where the cut words were the tell itself (a lost `us` from `Let us dive in`); name it in your answer. Do not keep a lost or added fact because the new sentence reads better.

## Read the reference file

After the linter, read the file for the text's language in `references/` next to this file: `en.md` (English), `fr.md` (French), `de.md` (German), `es.md` (Spanish), `pt.md` (Portuguese). For Dutch, Polish, Indonesian and Turkish read `nl.md`, `pl.md`, `id.md` and `tr.md`. The Dutch and Polish files are our translation of the English classes and rest on no measured evidence; the Indonesian and Turkish files add phrases measured on public corpora and say so. None of the four has a phrase catalog for `--verify`. Read the file for every rewrite, English included. Each lists tells a regular expression cannot catch, with the fix direction, in two tiers: "Act on one sighting" and "Act only when several appear" (in one paragraph). Remove the ones you find by judgement, and add no fact, change no number. The linter ships almost no French, Spanish, Portuguese or German rules, and none for Polish, Indonesian or Turkish (Dutch has only the `hedge` check), so for those languages a clean lint proves little and the reference file is the check. For another language, read `en.md` and apply the families that carry over.

## Add no fact

Removing tells must never add content.
- Do not add a fact, name, number, date, quote, citation, attribution or owner that the source lacks. If a sentence needs a detail you do not have, write a simpler sentence or ask the user for it.
- Do not add "we", "our", "I" or any first person the source does not use. Do not invent an anecdote or an "in my experience".
- Do not drop a supported claim, number, name, date, quote or list item. A lost one is a defect, unless the tell itself is what you cut.
- Keep the strength of the meaning. A cause stays a cause, a comparison keeps its measure, a range keeps both ends, and an approximation stays approximate: "about 40%" does not become "40%".
- In legal, medical, safety and security text, hedges, negations and absolutes are content. Keep them, and keep scope hedges.
- Hedge-support test, the same in every language. A hedge is a conditional or modal marker, an appearance verb, a probability adverb or a vague-link predicate next to a statement of effect, cause or state. It stays word for word when the source names a concrete reason for the uncertainty in the same sentence or the next (a condition, a cause, a measured range, a stated limit). When the source names no reason, the hedge is the writer's habit: remove it, or soften it to the plain form that keeps its degree (`could cut load times` becomes `can cut load times`; `seems to be related to the new cache` becomes `seems to be the new cache`). Never strengthen it to a certain claim, and never add a fact to justify it. Removing a qualifier with no stated basis adds nothing; keeping one with a basis preserves a fact.
- Keep the rough edges of a human text, typos included. Change what the tells require, nothing more.

## How to work

1. Save the original, lint it and read every finding. Mark the tells, strongest first. Look at the paragraph shape too: the same closer after each section is one tell at a larger scale.
2. Read the reference file for the language and mark the tells it lists that the linter missed. An entry in its first tier is a tell on one sighting; an entry in its second tier counts only when several appear in one paragraph.
3. For a text over about 300 words, outline it before you edit: one line per paragraph with its point, where the main point is made and how often it comes back, and any closer or section template that repeats. Fix that structure first (a point made three times, a recap, the same ending under each section), then sentences, then words. The outline is a working note; it never goes in the file.
4. Draft with the smallest edit that removes each tell. Rewrite a sentence only when it holds a tell, or the paragraph built around one; copy every other sentence word for word, punctuation and typos included. A word on a reference list is a reason to look at the sentence, not a licence to rewrite it. When the finding sits in a sentence that chains clauses (`--verify` prints `rebuild` for a long one), rebuild the sentence, and split it where the clauses are separate points, instead of patching one phrase; a sentence with no finding stays word for word. When you rebuild a sentence, carry each number, name and code span over together with the words that label it (`a limit of 80` stays `a limit of 80`, not `whose limit is 80`), keep the hedge at its degree (a hedge is softened, never turned into a certain claim, as in `all signs point to`), and keep the person and voice of the source. Where you do rewrite, state the point directly rather than patching one phrase, and vary sentence length by building sentences differently, not by chopping them into fragments.
5. Make a second pass over the draft, because a rewrite brings in tells of its own. Reread it with the reference file open and list every tell that is still there, quoting the line: a first-tier entry, or a family that often survives a rewrite (a contrast, a closing line that sums up, a triad, a participle tail, a bold label, a dash in English). Fix each one, or name in a few words why it stays (a quotation, a technical term, a hedge the source makes). Give the list in your reply, never in the file.
6. Audit the claims. List every claim of the source in these classes: number, date, name, quote, negation, modality (can, may, must), quantifier (all, some, most, only) and cause (because, so). Check each against the rewrite and fix any that moved. `--compare` reads numbers, dates, names, quotes, persons, claim words, qualifiers and units in ten languages; negation, modality and most quantifiers it does not read, so check those by reading both texts.
7. Check the draft: lint it, run `--verify` against the original, and fix each defect until the compare exits 0 and `--verify` exits 0.
8. Write the final version to the file, lint it once more and run `--verify` once more.

A match is a candidate. Check it against its context and against legitimate use before you edit it: a technical `may`, a quoted phrase and a term of art stay. Detection alone does not authorise a rewrite.

Do not inject new tells while you remove old ones: no splitting of a long sentence into short fragments, no dramatic dashes or colons for effect, no contrarian opener (`Most people think X`) the source does not have. Keep headings, code blocks, table rows and front matter exactly as they are; `--verify` fails when one changes.

End your answer with a "residuals" line: every tell you left on purpose, quoted, with the reason, or "none".

The closing test: every fact in the new version must come from the source, and every sentence without a tell is the source's own sentence. Cutting and sharpening are allowed. Adding and losing are not.

## If the CLI is not available

Only when `npx ai-slop-linter` cannot run (no Node 20, no network, or a version before 0.2.0 that answers `--compare` with `unknown option`), check the text by hand against the rules, and compare the facts of the rewrite against the original yourself. Fix each one you find.

**Errors** (never ship these)
- Em dashes and en dashes as dashes. Use a comma, a full stop, or a colon. Not in a non-English text where the dash is correct.
- Chatbot residue: `I hope this helps`, `Certainly!`, `Let me know if`, `As an AI`.
- Knowledge-cutoff disclaimers: `as of my last update`, `as of [date] I cannot`.

**Warnings** (rewrite the sentence)
- `Not X but Y`, `It's not X. It's Y.`, `not because A, because B`: say Y directly.
- Forced groups of three adjectives or nouns with a shared suffix: keep the one that is true.
- `The real question is`, `At its core`, `What really matters`: make the point without announcing it.
- A participle tail after a comma that adds significance: `, highlighting`, `, showcasing`, `, underscoring`. Cut it, or give it its own sentence with a fact in it.
- Inflated importance: `is a testament to`, `pivotal`, `stands as a`, `marks a turning point`.
- AI vocabulary: `delve`, `tapestry`, `robust`, `seamless`, `vibrant`, `leverage`, `landscape`, `elevate`, `showcase`, `foster`, `crucial`, `comprehensive`, and their friends. Use the plain word.
- Sales language: `world-class`, `best-in-class`, `state-of-the-art`, `cutting-edge`, `nestled in the heart of`.
- Vague sources: `experts argue`, `studies show`, `it is widely believed`. Name the source or drop the claim.
- Announcing: `Let's dive in`, `In this article we will`, `Without further ado`.
- Generic positive closers: `Exciting times ahead`, `the future looks bright`, `stay tuned`.
- Bold mini-headings in list items (`**Speed:** ...`) and decorative emoji.

**Info** (tidy when you can)
- Filler: `in order to`, `due to the fact that`, `it is important to note that`, `at this point in time`.
- Curly quotes in plain-text contexts; Title Case Headings; a formulaic `Challenges and future outlook` section; more than three hyphenated compounds per hundred words.

## Judgment checks for other languages

Look for these by reading the text; the CLI does not enforce them. The full lists are in `references/fr.md`, `de.md`, `es.md` and `pt.md`; these are the commonest. A person may write any of them, so judge the sentence, not the phrase.

- French: `ce n'est pas seulement ... c'est`, `véritable révolution`, `Plongeons dans`, `sans faille`, `En conclusion`, `N'hésitez pas à`, `l'avenir s'annonce radieux`.
- Spanish: `sumérgete en`, `no solo ... sino`, `no dudes en`.
- German: `tauchen wir ein`, `nicht nur ... sondern auch`, `zögern Sie nicht`.
- Portuguese: `é importante notar`, `vale ressaltar`, `não apenas ... mas também`, `papel crucial`, `espero que isso ajude`. `tende a` and `talvez` are more typical of human writing, so they are not tells.

The lists come from the h1 fixture and from the stock-phrase word lists of unslop and anti-ai-writing; `references/de.md` adapts unslop's German lists and `references/en.md` adapts everwrite's catalog. The minimal edit, the outline and the second pass in "How to work" follow unslop, Humanizer and everwrite (all MIT, see `THIRD-PARTY-NOTICES.md`).

## Set up a prose check in CI

For a request to check prose or docs in CI, read `references/ci.md` next to this file and follow it. It gives a `lint:prose` script that lints a glob (`"**/*.md"`), not a file list, the `.slop.json` settings, and what to do with a CHANGELOG or a README that quotes a stock phrase on purpose.

## What this skill does not do

It does not decide whether a person or a model wrote the text. It lists the patterns that readers associate with machine writing and tells you where they are. A clean pass means the text has none of the listed tells, nothing more. `--compare` checks that the facts in two files match; it does not check them against the world.
