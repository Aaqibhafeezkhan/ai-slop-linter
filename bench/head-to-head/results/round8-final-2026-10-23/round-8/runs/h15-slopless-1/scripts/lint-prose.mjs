// Runs slopless on README.md and docs/**/*.md. Slopless only handles English,
// so translated directories listed in SKIP are left out.
import { readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const SKIP = ["docs/de", "docs/fr"];

const files = ["README.md"].filter(existsSync);
if (existsSync("docs")) {
  for (const f of readdirSync("docs", { recursive: true })) {
    const path = `docs/${f}`.replaceAll("\\", "/");
    if (!path.endsWith(".md")) continue;
    if (SKIP.some((d) => path.startsWith(`${d}/`))) continue;
    files.push(path);
  }
}

const res = spawnSync("npx", ["--no-install", "slopless", "--quiet", ...files], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(res.status ?? 2);
