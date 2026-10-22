# English tells the linter cannot see

Source: adapted and rewritten from the pattern catalog of everwrite (https://github.com/m4bwav/everwrite, commit 38912ce43453129c63eef958bf65faef4833c18e, MIT); see `THIRD-PARTY-NOTICES.md`.

Read this after the linter has run. Each entry gives the tell, why readers take it for machine prose, and the direction of the fix. The linter already catches the word lists, the dashes and the chatbot phrases; these need a reader. A phrase on this page is a tell only when it does no work in its sentence: judge the sentence, not the words.

Every fix follows three rules. Add no fact. Change no number. Add no owner: no `we`, `our` or `I` the source does not use. When a fix seems to need a detail the source lacks, cut the sentence or write the plain version, and run `--compare` again.

## Staging instead of stating

- Contrast against nobody: `isn't just X, it's Y`, the split form `This doesn't mean X. It means Y.`, a clipped tail `, no guesswork`. The first half denies a claim nobody made so the second half sounds larger. State Y. Keep a contrast only when a reader would really believe X.
- Colon reveal: `The best part: it learns from each run.` The colon plays a drumroll the sentence has not earned. Write the plain sentence. A colon before a real list stays.
- Question and answer: `Why? Because the cache was cold.` Give the answer as a statement.
- Saying it matters: `This matters because`, `that last part matters`, `which is more important than it sounds`. The writer grades the point instead of making it. Cut the aside; if the reason is in the source, state the reason.
- Faux insight: `what most teams get wrong`, `the part everyone misses`, `the uncomfortable truth is`. It casts the writer as the only one who noticed. Make the claim and let it stand alone.
- Arguing with no one: `To be clear`, `I'm not saying`, `A tempting approach would be`, `You might think`. Drop the option nobody raised and state what is true.

## Endings

- Kicker: a one-line closing paragraph that restates the paragraph above it (`That's the real win.`). End on the last concrete fact.
- Aphorism: `Speed is the language of trust.` A quotable line with no checkable content. Cut it.
- Fragment stack: `No setup. No config. Just results.` Say what the thing does in one sentence.
- Echo closer: the last line repeats the first, or turns to the future (`Looking ahead`, `what comes next`, `the journey continues`). Stop at the last fact.
- Realization coda in a story: `That's when I realized ...` followed by a lesson. End on the event.
- Tidy ending: a final sentence that wraps every thread up (`In the end, it all came together.`). Cut it; leave an open question open if the source has one.

## Weight that the facts do not carry

- Inflated significance: `marking a pivotal moment in`, `a turning point for`, `reflects broader trends`, `setting the stage for`. Keep the fact and drop the weight.
- Stock struggle section: `Despite these challenges, X continues to thrive.` Cut it, or name the real problem if the source names it.
- Shallow rider: a clause tacked on with `, highlighting`, `, ensuring`, `, reflecting` that adds meaning without a fact. Cut it, or make it a real effect the source states.
- Borrowed authority: `experts believe`, `studies show`, `industry observers note`, a row of outlet names. Name who said what, from the source, or cut the claim. Never invent the source.
- Sales register: `nestled in`, `boasts`, `stunning`, `breathtaking`, `a must-see`. Say what it is and where.
- False agency: `the data tells a story`, `the numbers speak for themselves`, `the decision emerged`. Name who acted, or state the number.
- Vague association: `associated with`, `linked to`, `in connection with` where the source names the relation. Use the relation.
- Template balance: `While X shows promise, Y remains a challenge`, or `on one hand ... on the other` with no verdict. Say which side the facts support, or state both facts plainly.

## Rhythm by rule

- Forced triad: three items because three sounds complete (`innovation, inspiration and insight`). Keep the items that are true and specific.
- Avoiding `is` and `has`: `serves as`, `stands as`, `functions as`, `features`, `offers`. Use `is` and `has`.
- Synonym cycling: `the tool`, `the platform`, `the solution` for one thing. Pick one name and repeat it.
- Repeated openings: three sentences in a row that start the same way. Merge them or vary the subject.
- Uniform rhythm: a paragraph where every sentence runs 8 to 20 words with the same shape. Cutting words makes it worse. Join two sentences, let one run long, let one be short.
- Stacked qualifiers: `could potentially`, `may possibly`, `it could be argued that`. One hedge, and only where the source is unsure. Keep a hedge the source has: it is content.
- Stacked transitions: `Moreover,`, `Furthermore,`, `Additionally,`, `Notably,` at the start of sentences in a row. Use `also` or `and`, or nothing.
- Slogan cadence: `Less friction. More focus.`, `One tool, three teams.` Write a sentence with a verb.
- Preview and recap: an opening that lists what the text will cover and a closing that lists it again. Keep the middle.

## Formatting by rule

- A bold label on every bullet (`**Speed:** ...`). Write the bullets as sentences, or a short paragraph.
- Decorative headings: emoji, arrows, Title Case, a heading on every two sentences, a top heading that repeats the page title, a first sentence that restates its heading. Use sentence case and one title.
- The same thing twice: a heading straight above a heading that says the same, a paragraph pasted twice. Keep one.
- Bold spread over phrases for emphasis. Keep it for one thing per page at most.

## Leftovers from a chat and a draft

- A chat wrapper around real content: praise of the question, an offer to continue, a closing wish. Remove the wrapper, keep the content.
- Guesses that fill a gap: `details are not publicly available, suggesting she keeps a low profile`, `he likely grew up in`. Say the sources do not cover it, or cut the section.
- Writing for the wrong reader: explaining what the reader already knows, or opening by restating the request (`You mentioned that the build is slow.`). Start with the answer.
- Docs that describe the previous version (`This replaces the old approach of ...`) outside a changelog. Describe what it does now.
- Text about itself: `In this section we will look at`, `This guide covers`. Start with the content.

## Do not

- Swap one stock word for another (`leverage` for `utilize`). Use the plain word or restructure.
- Fix one flagged phrase at a time when the paragraph is built around it. Rewrite the paragraph so it states each point directly.
- Remove a rough edge from a human text because it looks informal. Change what the tells require, nothing more.
- Touch quotations, code, names, titles, numbers or link targets.
