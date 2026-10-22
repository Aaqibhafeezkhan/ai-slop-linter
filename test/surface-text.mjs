// Text that must be identical on several surfaces. Not a test file; the tests import it.

/** What the tool is, in one sentence. Repeated byte for byte on every surface a test lists. */
export const CATEGORY =
  "ai-slop-linter is a linter that flags AI-sounding phrases and em dashes in commit messages, pull request descriptions and Markdown docs, and runs in CI.";

/** The README's first line: the problem, in a user's words. Sources: docs/PAIN.md. */
export const PAIN =
  "My coding agent keeps putting em dashes and stock phrases into commit messages, pull requests and READMEs even though my rules file bans them, and nothing checks the text before it ships.";

/** The Turkish README's first line and first paragraph: the same two sentences, in Turkish. */
export const PAIN_TR =
  "Kodlama ajanım, kurallar dosyam yasaklamasına rağmen commit mesajlarına, pull request açıklamalarına ve README'lere sürekli uzun tire ve kalıp ifadeler koyuyor ve metin yayına çıkmadan önce hiçbir şey kontrol etmiyor.";
export const CATEGORY_TR =
  "ai-slop-linter, commit mesajlarında, pull request açıklamalarında ve Markdown belgelerinde yapay zekâ kokan ifadeleri ve uzun tireleri işaretleyen, CI'da çalışan bir linter'dır.";
