import type { Doc, Rule } from "../doc.js";
import { scan } from "../doc.js";

const TRACKING_PARAMETER = /(?:utm_source=(?:openai|chatgpt\.com|copilot\.com)|referrer=grok\.com)/gu;
const URL = /https?:\/\/[^\s<>"'\x60)\]]+/gu;

function protectedSpans(text: string): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  const frontMatter = /^---[ \t]*\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(text);
  if (frontMatter) spans.push([frontMatter.index, frontMatter.index + frontMatter[0].length]);

  for (const pattern of [/<!--[\s\S]*?-->/gu, /<(pre|code)\b[^>]*>[\s\S]*?<\/\1\s*>/giu]) {
    for (const match of text.matchAll(pattern)) spans.push([match.index!, match.index! + match[0].length]);
  }

  const lines = text.split("\n");
  let offset = 0;
  let fence: { marker: string; length: number; start: number } | undefined;
  for (const line of lines) {
    const clean = line.replace(/\r$/, "").replace(/^(?: {0,3}>[ \t]?)+/u, "");
    const opening = /^( {0,3})(`{3,}|~{3,})/u.exec(clean);
    if (fence) {
      const closing = new RegExp("^ {0,3}" + fence.marker + "{" + fence.length + ",}[ \\t]*$").test(clean);
      if (closing) {
        spans.push([fence.start, offset + line.length]);
        fence = undefined;
      }
    } else if (opening) {
      fence = { marker: opening[2]![0]!, length: opening[2]!.length, start: offset };
    } else if (/^(?: {4}|\t)/u.test(line)) {
      spans.push([offset, offset + line.length]);
    } else {
      const inline = /(`+)(?!`)(.*?)\1(?!`)/gu;
      for (const match of line.matchAll(inline)) spans.push([offset + match.index!, offset + match.index! + match[0].length]);
    }
    offset += line.length + 1;
  }
  if (fence) spans.push([fence.start, text.length]);
  return spans;
}

function exposeUrls(doc: Doc): Doc {
  const chars = doc.masked.split("");
  const protectedRanges = protectedSpans(doc.text);
  for (const match of doc.text.matchAll(URL)) {
    const start = match.index!;
    const end = start + match[0].length;
    if (protectedRanges.some(([left, right]) => start < right && end > left)) continue;
    for (let i = start; i < end; i++) chars[i] = doc.text[i]!;
  }
  return { ...doc, masked: chars.join("") };
}

export const chatbotTracking: Rule = {
  id: "chatbot-tracking",
  title: "Chatbot tracking parameters in links",
  severity: "error",
  source: "House rule: chatbot tracking parameters in copied URLs",
  why: "Chatbot interfaces can append source-tracking parameters to copied links. The parameters are residue from the sharing interface, not part of the destination a reader needs.",
  example: {
    before: "Read the guide at https://example.com/guide?utm_source=chatgpt.com.",
    after: "Read the guide at https://example.com/guide.",
  },
  ignoreWhen: "The parameter is intentionally documented as an example inside code; code and other protected regions are ignored.",
  check(doc) {
    return scan(
      exposeUrls(doc),
      chatbotTracking,
      TRACKING_PARAMETER,
      (m) => '"' + m[0] + '": chatbot tracking parameter; remove it from the shared URL',
    );
  },
};
