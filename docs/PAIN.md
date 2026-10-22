# Where the problem is described in public

[Back to the README](../README.md)

The README opens with this sentence: "My coding agent keeps putting em dashes and stock phrases into commit messages, pull requests and READMEs even though my rules file bans them, and nothing checks the text before it ships." It is a paraphrase, not a quotation. The reports below are what it paraphrases. They were read on 2026-10-21. Open each link to check the wording.

## Issues filed by people who run coding agents on their own repositories

- [williamthorsen/codeassembly#1072](https://github.com/williamthorsen/codeassembly/issues/1072), opened 2026-07-22. The author's rule against em dashes "is repeatedly broken even when the rule is present in context", with em dashes recorded in READMEs, commit bodies, tickets and pull request bodies, and "nothing detects a violation before it ships".
- [NonoHM/budgetpilot#779](https://github.com/NonoHM/budgetpilot/issues/779), opened 2026-09-28. The issue says the repository's em dash test "is the only automated prose gate in the tree today" and asks for prose linting beyond that one character, with Vale. It shows demand for a prose check; it does not mention this tool.
- [MalloyTheDev/MalloyStudio#15](https://github.com/MalloyTheDev/MalloyStudio/issues/15), opened 2026-09-06. The repository's convention is that no em dash appears in committed content, commit messages included, and "85 tracked files still contain em dashes from before that rule".

## A wider thread about the same resentment

- [Stop Sloppypasta](https://news.ycombinator.com/item?id=47389570) on Hacker News, 667 points when read, posted 2026-03-15. Its author defines the term as "Verbatim LLM output copy-pasted at someone, unread, unrefined, and unrequested". The thread is about chat messages, not commits. It shows that readers resent unedited model text.

## What was not found

- No issue in a competitor's repository. `gh search issues "em dash" --repo tbhb/vale-ai-tells` returned nothing on 2026-10-21.
- No Stack Overflow question and no Reddit thread. Reddit refused automated reads, and Stack Overflow was not searched by hand.
- The three issues come from people who already automate against the problem. They show demand for a mechanical check. They do not show how many people have the problem.
