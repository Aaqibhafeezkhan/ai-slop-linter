// Counting helpers behind bench/commit-rules.mjs. Pure over arrays of messages, so a test can
// run them on a handful of strings.
import { prepare } from "../dist/src/doc.js";
import { lintText } from "../dist/src/index.js";
import { PHRASES } from "../dist/src/commit-phrases.js";

/** Messages separated by a line of three dashes, as bench/corpus/machine/commit-messages.md is written. */
export const splitMachine = (text) => text.split(/^---$/m).map((m) => m.trim()).filter(Boolean);

/** How many of `messages` carry at least one finding of each rule in `rules`. */
export function hitsPerRule(messages, rules) {
  const counts = Object.fromEntries(rules.map((r) => [r.id, 0]));
  for (const message of messages) {
    const doc = prepare("commit message", message);
    for (const rule of rules) if (rule.check(doc).length > 0) counts[rule.id]++;
  }
  return counts;
}

const tokenPattern = (list, token) => new RegExp(`\\b(?:${token})\\b`, list.ignorecase ? "i" : "");

/** For each phrase list, the tokens that match at least one message, with how many. Uses the full upstream list. */
export function tokenHits(messages) {
  const out = {};
  for (const [id, list] of Object.entries(PHRASES)) {
    out[id] = list.tokens
      .map((token) => ({ token, messages: messages.filter((m) => tokenPattern(list, token).test(m)).length }))
      .filter((t) => t.messages > 0)
      .sort((a, b) => b.messages - a.messages || a.token.localeCompare(b.token));
  }
  return out;
}

/** How many of a list's tokens the ordinary prose rules already flag when the token is written as a sentence. A rule with no phrase list reports 0 of 0. */
export function alreadyFlagged(id) {
  const list = PHRASES[id];
  if (!list) return { flagged: 0, total: 0 };
  const flagged = list.tokens.filter((token) => lintText("probe.md", `${token}.`).findings.length > 0).length;
  return { flagged, total: list.tokens.length };
}
