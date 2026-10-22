#!/bin/sh
# UserPromptSubmit hook of the ai-slop-linter Claude Code plugin.
#
# Reads the hook input (JSON with a "prompt" field) on standard input. When the prompt asks to rewrite,
# clean up, polish, proofread or humanize existing prose, in English or in another language, it prints one
# JSON object whose hookSpecificOutput.additionalContext tells the agent to use the ai-slop-linter skill
# and carries its guardrails (no added first person or claim, numbers and qualifiers kept, the reference
# file for fr/de/es, --compare until exit 0), so they hold even when the skill is not loaded.
# On every other prompt it prints nothing. It never blocks a prompt and always exits 0, also on malformed
# input. POSIX sh, sed, tr and grep only: no network, no file writes, no jq.
#
# The match is two-tier, on the lowercased prompt with every character other than a-z, 0-9 and non-ASCII
# bytes turned into a space:
#   strong   a verb or phrase that only applies to prose (proofread, humanize, rephrase, "sound less like
#            AI", "tone down", reformule) triggers on its own;
#   generic  an editing verb that also applies to code (rewrite, clean up, polish, fix, réécris, reescribe,
#            schreib um, yeniden yaz, düzelt) triggers only together with a prose noun (paragraph, email,
#            README, docs, texte, párrafo, Absatz, metin, a .md file).
# test/prompt-hook.test.mjs measures it on test/fixtures/prompt-hook.json.

LC_ALL=C
export LC_ALL

input=$(cat 2>/dev/null) || exit 0

# The value of "prompt": the text after the last unescaped "prompt": key, escapes blanked, cut at the
# closing quote. A key inside the prompt is escaped (\"prompt\") and so cannot match.
raw=$(printf '%s' "$input" | tr '\n\r\t' '   ' |
  sed -n 's/^.*"prompt"[[:space:]]*:[[:space:]]*"//p' |
  sed 's/\\./ /g; s/".*$//' |
  tr 'A-Z' 'a-z')
p=$(printf '%s' "$raw" | tr -c 'a-z0-9\200-\377' ' ' | tr -s ' ')
[ -n "$p" ] || exit 0
p=" $p "

# grep runs in the C locale, so a non-ASCII letter is two bytes in 0x80-0xFF. B is that byte range for a
# bracket expression, H one such letter (é, É, ü, Ü, ş, ı, ç, á, ó, ä ...), W the rest of a word.
B="$(printf '\200')-$(printf '\377')"
H="[$B][$B]"
W="[a-z0-9$B]*"
E="(e|$H)"
U="(u|$H)"
A="(a|$H)"
I="(i|$H)"
O="(o|$H)"
C="(c|$H)"

strong=" (humani[sz]$W|dehumani[sz]$W|proof ?read$W|copy ?edit$W|reword$W|rephras$W|paraphras$W|de ai|deslop$W|unslop$W|tone down|tone it down|r[ei]formul$W|umformulier$W|formulier$W [a-z$B ]*um|relis|relire|(grammar|spell) ?check$W|correcteur) |\
 (sound|sounds|sounding|read|reads|reading) (less |more |too )?(like )?(an |a )?(ai|chatgpt|gpt|llm|robot|robotic|bot|machine|human|natural|salesy|ad|advert|marketing) |\
 sound (more |less )?(friendl|warm|clear|simple|simpl|punch|smooth|human|natural|profession|casual|formal|confident|polite)$W |\
 (tono|ton|tone) (m${A}s|plus|more|less|menos|moins) |\
 (less|more|too) (wordy|robotic|salesy|stiff|fluffy|natural|human|hypey|ai like|fancy|cringe|cringey|corporate|formal|casual) |\
 for (tone|grammar|spelling|typos|style|flow) |\
 do${H}al (hale|yap|bir)|daha (sade|do${H}al|ak${I}c${I}) |\
 (em|en) dash$W |plain (english|language) |proof (this|it|my) |nat${U}rlicher|menschlicher|\
 (sonne|suene|suena|sonar|klingt|klingen|duruyor|soe|suoni|klinkt)$W [a-z$B ]{0,30}(robot|ia|ai|ki|yapay|natural|naturel|nat${U}rlich|artificial|human|humain|menschlich|insan|pub|publicit)"

generic=" (rewrit$W|re write$W|redo|rework$W|clean|cleanup|clean up|tidy$W|polish$W|tighten$W|edit|edits|editing|fix|fixes|fixing|correct|correcting|improv$W|smooth$W|simplif$W|revis$W|shorten$W|trim|condense|touch up|punch up|tweak$W|\
r${E}${E}cri$W|r${E}${E}crire|corr${I}g$W|correg$W|formulier$W|am${E}lior$W|retravaill$W|r${E}vis$W|reescrib$W|reescrev$W|mejor$W|melhor$W|pule|pulir|pula|\
umschreib$W|umzuschreiben|schreib$W [a-z$B ]*um|${U}berarbeit$W|verbesser$W|korrigier$W|gl${A}tt$W|\
yeniden yaz$W|d${U}zelt$W|d${U}zenle$W|iyile${H}tir$W|toparla$W|riscriv$W|correggi$W|miglior$W|herschrijf$W|herschrijven|verbeter$W) "

noun=" (text|texts|prose|paragraph$W|sentence$W|wording|phrasing|copy|draft|drafts|essay$W|article$W|e ?mail|e ?mails|letter$W|readme|doc|docs|documentation|description$W|intro|introduction$W|announcement$W|release notes|changelog|commit message$W|pr message|bio|abstract|summary|chapter$W|tone|grammar|spelling|typos|writing|newsletter$W|speech|caption$W|tweet$W|linkedin|(blog|linkedin|forum|social|this|my|the) post|blog|md|mdx|txt|rst|adoc|docx|odt|headline$W|tagline$W|slogan$W|blurb$W|personal statement|privacy policy|faq|faqs|job posting$W|job ad$W|(slack|chat|discord|teams|linkedin|welcome|reply|this|my) messages?|the language (in|of)|\
texte|textes|paragraphe$W|phrase$W|courriel$W|lettre$W|billet$W|r${E}sum${E}|fautes|orthographe|r${E}daction|\
texto$W|p${A}rrafo$W|descripci${O}n$W|descri${C}${A}o$W|frase$W|correo$W|art${I}culo$W|carta$W|redacci${O}n|introducci${O}n|ortograf$W|par${A}grafo$W|artigo$W|reda${C}${A}o|\
absatz|abs${A}tze|satz|s${A}tze|einleitung|[a-z$B]*beitrag$W|brief|artikel|formulierung$W|rechtschreibung|anschreiben|bewerbung$W|lebenslauf|\
metin|metni$W|paragraf$W|c${U}mle$W|yaz${I}$W|e posta$W|makale$W|mektu$W|a${C}${I}klama$W|\
testo|paragrafo|articolo|lettera|tekst$W|alinea|zin|zinnen) "

# A prose noun used as the name of a build, a folder or a site is not prose ("fix the docs build",
# "clean up the docs folder"): such a prompt needs a strong match.
notprose=" (doc|docs|documentation|readme|blog|changelog|summary|description|copy|draft|post) (table|tables|column|columns|row|rows|output|field|fields|component|widget|endpoint|view|card|button|build|builds|folder|folders|directory|directories|dir|site|deploy|deployment|pipeline|generator|server|theme|config|template|templates|images|screenshots|job|step|workflow|badge|badges|link|links|url|urls) "

# A pasted text after "rewrite this:" names no noun; it counts when the text after the first colon has at
# least six words and no character that marks code.
pasted="(^| )(rewrite|re-write|redo|rework|polish|tighten|edit|improve|fix|clean up|tidy up|smooth out|simplify|revise|shorten|trim|r${E}${E}cris|corrige|reescribe|${U}berarbeite|yeniden yaz|d${U}zelt)( this| it| the following| the text below| below)( please)? ?:"

hit=no
if printf '%s\n' "$p" | grep -Eq "$strong"; then
  hit=yes
elif printf '%s\n' "$p" | grep -Eq "$generic" && printf '%s\n' "$p" | grep -Eq "$noun" \
  && ! printf '%s\n' "$p" | grep -Eq "$notprose"; then
  hit=yes
elif printf '%s\n' "$raw" | grep -Eq "$pasted"; then
  tail=${raw#*:}
  if ! printf '%s\n' "$tail" | grep -q '[{};=<>`()]' && [ "$(printf '%s\n' "$tail" | wc -w)" -ge 6 ]; then
    hit=yes
  fi
fi

if [ "$hit" = yes ]; then
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"ai-slop-linter: this prompt asks to rewrite or edit prose. Use the ai-slop-linter skill: keep a copy of the original and lint it with `npx ai-slop-linter`; for French, German or Spanish also read the skill file references/<lang>.md (fr.md, de.md, es.md), because the linter has almost no rules for those languages. Add no we, our or I and no claim or fact the source lacks; keep every number with its qualifier (about, up to, at least) and every hedge or condition. After the rewrite run `npx ai-slop-linter --compare <original> <rewrite>`; a failing compare is blocking, fix every line it reports and run it again until it exits 0 before you answer."}}'
fi
exit 0
