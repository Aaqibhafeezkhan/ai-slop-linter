# Acme handbook

The Acme handbook is the documentation for the Acme workspace. The pages live in `docs/` and are written in Markdown.

## Writing style

We prefer short sentences and plain words. A reviewer once left this comment on a draft:

> "Let me know if you have any questions" is a chatbot closer. Delete it.

We keep a short shell example in the repository to show how a docs release is tagged:

```sh
# Bump the docs version — then tag the commit
npm version minor
git tag -a docs-1.3.0 -m "Handbook 1.3.0 — plain words"
```

## Local setup

Install Node 22, clone the repository, and run `npm test` before you open a pull request. Questions go to the docs channel.
