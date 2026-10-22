---
name: ai-slop-linter
description: Use whenever you write, edit, rewrite, clean up, polish, proofread or "make ready to ship" any prose a person will read, in any language (commit message, PR description, README, docs, release notes, launch notes, article). Also use for requests in another language such as réécris, reescribe, schreib um or yeniden yaz. Run `npx ai-slop-linter` on it and fix every finding. Also use when asked whether text "sounds like AI", to humanize it, to make it sound natural or more human, to remove em dashes, or to set up a CI check on prose or docs.
---

# ai-slop-linter

You write a lot of prose: commit messages, pull request descriptions, docs, release notes. Most of it carries the same tells, and readers skip text that carries them. This skill makes you check before you hand text over, and check that a rewrite kept the facts. This plugin also has a `UserPromptSubmit` hook that adds one line pointing here when a prompt asks for a rewrite, clean-up, polish or proofread. The order, every time: run the linter, read the reference file for the language, rewrite, run `--verify` until it exits 0.

## Check the language first

Before you lint, decide which language the text is in. For text that is not English, pass the tag: `npx ai-slop-linter --language fr path/to/file.md` (a BCP 47 tag such as `de`, `tr` or `pt-BR`). The CLI also works the language out for each file, from its front matter and then its text, and names the language in its output when it guessed. Pass the flag anyway when you know the language.

Some punctuation is correct in other languages: a dash opens dialogue in French and Russian; for text whose language is not English the `dash` and `title-case-heading` rules stand down, and the CLI names the language it used. If a dash in non-English text is still reported, check it against that language's own rules before you change it.

Every pattern in the reference files holds in every language. Translate the construction, not only the word: a hedge stacked on a modal, a vague link, a counted-list opener or an assistant wrapper is the same tell in Portuguese, Turkish or Japanese as in English. A language with no reference file is still checked for the classes in the recall step below.

## How to run it

Run the command first, every time. Do not check the text by eye when `npx` works: the linter knows more patterns than the list at the end of this file.

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

It runs the lint errors, the compare above, a scan of the stock phrases in `references/<lang>.tells.txt` and a `hedge` check, and prints `verify: ok` (or `verify: ok (unchanged)`) or `verify: N problem(s)`. Fix each reported line by the smallest edit that adds no fact. For a `catalog` hit, cut or rewrite that sentence, and never add a first-person word, number or name. Never ship while it exits 1. A `hedge` line is a modal verb with a hedge adverb within three words (`could potentially`, `may possibly`, and the same in pt, es, fr and de) or an evidential with a vague link (`seems to be related to`). Soften it to one hedge that keeps the degree: `could potentially` becomes `can`; `seems to be related to` becomes `seems to be` when the source states the effect, and `may be related to` when it does not. A modal or `seems` alone is never a hit. Quoted foreign text stays untouched; both scans skip quotes, code and dialogue.

`--verify` also blocks a `length` problem (the rewrite is under 35% or over 130% of the original outside code blocks) and lists each `unrequested edit`: an original sentence that is gone and that no finding explained. Restore it, or name the tell you removed. If it prints `clean source: no edit is expected`, the linter and the catalog found nothing: unless a tell class below applies, do not edit. Answer "no change needed" and say which checks ran.

Recall step, after `--verify` exits 0: read the result once for these classes only: modal hedges on effects, vague-link evidentials, hedge adverbs such as `hopefully`, reassurance qualifiers on a stated fact, counted-list openers, stacked intensifiers, assistant wrappers. Change a sentence only when it names one of them; leave the rest word for word. Skip quoted text, dialogue, and legal, medical or safety text where a hedge is content. Run `--verify` again after any edit.

A failing compare is blocking. Lines such as `added person our`, `added claim always` or `lost number 40%` mean the rewrite is not done: put the lost fact or word back, remove the added word, and run the compare again until it exits 0. Never add "we", "our", "I" or a claim the source does not make, and change no number or fact; an added "our" needs a source that says whose it is. The compare does not flag an added "I", "I'd" or German "uns": check those yourself. For a short or Turkish text, pass `--language` to the compare too. The one line you may leave is a loss where the cut words were the tell itself (a lost `us` from `Let us dive in`); name it in your answer. Do not keep a lost or added fact because the new sentence reads better.

## Read the reference file

After the linter, read the file for the text's language in `references/` next to this file: `en.md` (English), `fr.md` (French), `de.md` (German), `es.md` (Spanish), `pt.md` (Portuguese). Do it for every rewrite, English included. Each lists tells a regular expression cannot catch, with the fix direction, in two tiers: "Act on one sighting" and "Act only when several appear" (in one paragraph). Remove the ones you find by judgement, and add no fact, change no number. The linter ships almost no French, Spanish, Portuguese or German rules, so for those languages a clean lint proves little and the reference file is the check. For another language, read `en.md` and apply the families that carry over.

## Add no fact

Removing tells must never add content.
- Do not add a fact, name, number, date, quote, citation, attribution or owner that the source lacks. If a sentence needs a detail you do not have, write a simpler sentence or ask the user for it.
- Do not add "we", "our", "I" or any first person the source does not use. Do not invent an anecdote or an "in my experience".
- Do not drop a supported claim, number, name, date, quote or list item. A lost one is a defect, unless the tell itself is what you cut.
- Keep the strength of the meaning. A cause stays a cause, a comparison keeps its measure, a range keeps both ends, a condition stays conditional, and an approximation stays approximate: "about 40%" does not become "40%".
- In legal, medical, safety and security text, hedges, negations and absolutes are content. Keep them. So are scope hedges and a real uncertainty the source states.
- A modal or evidential hedge on what a feature does, or on a stated cause, in publishable text (release notes, README, PR text, status text, incident notes) is not that kind of content. Soften it to the plain form that keeps its degree: a conditional becomes the plain modal (`could cut load times` becomes `can cut load times`), and, when the source goes on to say the thing did it, `seems to be related to the new cache` becomes `seems to be the new cache`; when it does not, keep the relation (`may be related to`). Do not delete the hedge, and do not turn it into a certain claim. The rule holds in every language.
- Keep the rough edges of a human text, typos included. Change what the tells require, nothing more.

## How to work

1. Save the original, lint it and read every finding. Mark the tells, strongest first. Look at the paragraph shape too: the same closer after each section is one tell at a larger scale.
2. Read the reference file for the language and mark the tells it lists that the linter missed. An entry in its first tier is a tell on one sighting; an entry in its second tier counts only when several appear in one paragraph.
3. For a text over about 300 words, outline it before you edit: one line per paragraph with its point, where the main point is made and how often it comes back, and any closer or section template that repeats. Fix that structure first (a point made three times, a recap, the same ending under each section), then sentences, then words. The outline is a working note; it never goes in the file.
4. Draft with the smallest edit that removes each tell. Rewrite a sentence only when it holds a tell, or the paragraph built around one; copy every other sentence word for word, punctuation and typos included. A word on a reference list is a reason to look at the sentence, not a licence to rewrite it. When the finding sits in a sentence that chains clauses, rebuild the sentence, and split it where the clauses are separate points, instead of patching one phrase; a sentence with no finding stays word for word. Where you do rewrite, state the point directly rather than patching one phrase, and vary sentence length by building sentences differently, not by chopping them into fragments.
5. Make a second pass over the draft, because a rewrite brings in tells of its own. Reread it with the reference file open and list every tell that is still there, quoting the line: a first-tier entry, or a family that often survives a rewrite (a contrast, a closing line that sums up, a triad, a participle tail, a bold label, a dash in English). Fix each one, or name in a few words why it stays (a quotation, a technical term, a hedge the source makes). Give the list in your reply, never in the file.
6. Check the draft: lint it, run `--verify` against the original, and fix each defect until the compare exits 0 and `--verify` exits 0.
7. Write the final version to the file, lint it once more and run `--verify` once more.

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
