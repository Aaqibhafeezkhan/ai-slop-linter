#!/usr/bin/env node
// usage: node valid-transcript.mjs <transcript.jsonl>
// Exit 0 when the last stream-json event of the transcript is {"type":"result","is_error":false}.
// Lines that are not JSON (for example stderr) are skipped. Exit 1 otherwise.
import { existsSync, readFileSync } from "node:fs";

const path = process.argv[2];
if (!path || !existsSync(path)) process.exit(1);
let last = null;
for (const line of readFileSync(path, "utf8").split("\n")) {
  if (!line.startsWith("{")) continue;
  try {
    last = JSON.parse(line);
  } catch {
    // not JSON: skip
  }
}
process.exit(last && last.type === "result" && last.is_error === false ? 0 : 1);
