// Reads the `tokens:` list of a Vale existence style (tbhb/vale-ai-tells, MIT). Pure, so a test can run it.

/** The `tokens:` list of a Vale existence style. Anything this does not understand is an error, not a skipped line. */
export function parseStyle(text) {
  const tokens = [];
  let inTokens = false;
  let ignorecase = /^ignorecase:\s*true\s*$/m.test(text);
  for (const line of text.split("\n")) {
    if (/^tokens:\s*$/.test(line)) {
      inTokens = true;
      continue;
    }
    if (!inTokens) continue;
    if (/^\S/.test(line)) break;
    if (/^\s*(#|$)/.test(line)) continue;
    const m = /^\s+-\s+(.*?)\s*$/.exec(line);
    if (!m) throw new Error(`cannot read token line: ${line}`);
    let token = m[1];
    if (token.startsWith("'") && token.endsWith("'")) token = token.slice(1, -1).replaceAll("''", "'");
    else if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
    if (token.startsWith("(?i)")) {
      token = token.slice(4);
      ignorecase = true;
    }
    if (token.includes("(?")) throw new Error(`token uses regex syntax this generator does not translate: ${token}`);
    tokens.push(token);
  }
  if (!tokens.length) throw new Error("no tokens found");
  return { ignorecase, tokens };
}
