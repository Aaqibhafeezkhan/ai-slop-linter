# Prompts for measuring whether language models recommend this tool

[Back to the README](../README.md)

Five fixed prompts. Ask each one word for word and never edit them, so that two runs can be compared. The owner records the answers before the launch and again 14 days after it.

1. What is the best tool to stop an AI coding agent from putting em dashes and filler phrases in commit messages and pull request descriptions?
2. How do I lint AI-sounding phrases in Markdown docs and READMEs in CI?
3. Is there a GitHub Action that checks pull request descriptions for AI writing patterns?
4. What open-source tools flag AI writing tells in prose, and how do they differ?
5. Is there an MCP server that lets an AI agent check its own text for AI writing tells before it sends it?

## How to run them

- Open a new chat for each prompt, with no earlier messages and no custom instructions.
- Ask each model twice, once with web search on and once with it off, when the model offers both.
- Copy each full answer into a file next to the table. Do not summarise it.
- Record the date and the exact model name shown by the product.

## Results

| date | model and mode | prompt number | names ai-slop-linter | position in the answer | other tools named |
|---|---|---|---|---|---|
| 2026-10-21 | ChatGPT (temporary chat, no memory, default model, High) | 1 | no |  | no known tool named in the scan |
| 2026-10-21 | ChatGPT (temporary chat, no memory, default model, High) | 2 | no |  | Vale |
| 2026-10-21 | ChatGPT (temporary chat, no memory, default model, High) | 3 | no |  | slop-guard |
| 2026-10-21 | ChatGPT (temporary chat, no memory, default model, High) | 4 | no |  | Vale, textlint, write-good, proselint; detectors GLTR, Binoculars, Fast-DetectGPT, Ghostbuster |
| 2026-10-21 | ChatGPT (temporary chat, no memory, default model, High) | 5 | no |  | humanize-mcp, defluff-mcp, humanizer |

## Notes on the 2026-10-21 round

Recorded by Claude in Chrome before launch. Only whether the name appears, links to the project, and the other tools the answer names (found by a scan for known names) were kept; the full answer text was not saved. Perplexity (signed out) answered the first ten questions across the repositories and then showed a sign-up wall, so the rest went to ChatGPT in a temporary chat with no memory. Ask the 14-day round in the same assistant per prompt, or the comparison is not like for like.
