# Language pack corpora: sources and provenance

These corpora measure the language packs in `src/rules/` on the language each pack is for.
`bench/packs.mjs` reads them and writes [`../PACKS.md`](../PACKS.md). The shipping limit is
described there and enforced by `test/packs.test.mjs`.

The human corpus for a language is every `bench/typography/<lang>-*.md` file plus the files
listed below under `human/<lang>/`. The machine corpus is the files under `machine/<lang>/`.

## Human

### Project Gutenberg, public domain

Each text is distributed by Project Gutenberg as public domain in the United States. Gutenberg's
header, footer, licence text and trademark phrase are removed. Editorial markers are removed
too: footnote and line-number brackets such as `[5]`, `[Illustration]` notes, and every short
chapter heading. The excerpt is one continuous passage of about 1,000 words of prose, taken
from the middle of the work. The date is the first publication.

| file | language | work | author (life) | first published | source | licence |
|---|---|---|---|---|---|---|
| `human/fr/candide-voltaire.md` | French | *Candide, ou l'optimisme* | Voltaire (1694–1778) | 1759 | [Project Gutenberg 4650](https://www.gutenberg.org/ebooks/4650) | public domain |
| `human/fr/notre-dame-de-paris-hugo.md` | French | *Notre-Dame de Paris* | Victor Hugo (1802–1885) | 1831 | [Project Gutenberg 2610](https://www.gutenberg.org/ebooks/2610) | public domain |
| `human/es/don-quijote-cervantes.md` | Spanish | *El ingenioso hidalgo don Quijote de la Mancha*, part I | Miguel de Cervantes (1547–1616) | 1605 | [Project Gutenberg 2000](https://www.gutenberg.org/ebooks/2000) | public domain |
| `human/es/dona-perfecta-galdos.md` | Spanish | *Doña Perfecta* | Benito Pérez Galdós (1843–1920) | 1876 | [Project Gutenberg 15725](https://www.gutenberg.org/ebooks/15725) | public domain |
| `human/es/marianela-galdos.md` | Spanish | *Marianela* | Benito Pérez Galdós (1843–1920) | 1878 | [Project Gutenberg 17340](https://www.gutenberg.org/ebooks/17340) | public domain |
| `human/de/werther-goethe.md` | German | *Die Leiden des jungen Werther*, Band 1 | Johann Wolfgang von Goethe (1749–1832) | 1774 | [Project Gutenberg 2407](https://www.gutenberg.org/ebooks/2407) | public domain |
| `human/de/verwandlung-kafka.md` | German | *Die Verwandlung* | Franz Kafka (1883–1924) | 1915 | [Project Gutenberg 22367](https://www.gutenberg.org/ebooks/22367) | public domain |

### Wikipedia, CC BY-SA 4.0 (modern technical register)

A modern technical register is not reachable from Project Gutenberg, so the French, Spanish
and German articles on Git were taken from their Wikipedia editions through the MediaWiki
TextExtract API (`prop=extracts&explaintext=1`) on 21 October 2026. The German file also takes
the opening of *Versionsverwaltung* (version control), because the Git article alone is shorter
than the other files. A second German article was tried and its opening was also short, so the
file was kept at the size it reached (about 900 words).

**Licence.** The text of these three files is licensed by its Wikipedia authors under
**CC BY-SA 4.0**. It is not covered by this repository's MIT licence. Redistribution must keep
that licence and the attribution below, and a derived copy must carry the same licence.
Attribution: text from the French, Spanish and German Wikipedia articles *Git* and
*Versionsverwaltung*, licensed under CC BY-SA 4.0.

**Revisions.** Each file is pinned to the revision the extract was taken from. The revision ids
below are the newest revisions reported by the MediaWiki API (`prop=revisions`) on 21 October
2026; each was last edited before that date, so it is the revision the extract came from.

| file | language | article | revision (oldid) | last edit (UTC) | permalink | licence |
|---|---|---|---|---|---|---|
| `human/fr/git-wikipedia.md` | French | *Git* | 239805184 | 2026-09-25 | [fr.wikipedia.org/w/index.php?title=Git&oldid=239805184](https://fr.wikipedia.org/w/index.php?title=Git&oldid=239805184) | CC BY-SA 4.0 |
| `human/es/git-wikipedia.md` | Spanish | *Git* | 172624402 | 2026-03-22 | [es.wikipedia.org/w/index.php?title=Git&oldid=172624402](https://es.wikipedia.org/w/index.php?title=Git&oldid=172624402) | CC BY-SA 4.0 |
| `human/de/git-wikipedia.md` | German | *Git* (first part) | 270756522 | 2026-09-24 | [de.wikipedia.org/w/index.php?title=Git&oldid=270756522](https://de.wikipedia.org/w/index.php?title=Git&oldid=270756522) | CC BY-SA 4.0 |
| `human/de/git-wikipedia.md` | German | *Versionsverwaltung* (second part) | 268510722 | 2026-07-04 | [de.wikipedia.org/w/index.php?title=Versionsverwaltung&oldid=268510722](https://de.wikipedia.org/w/index.php?title=Versionsverwaltung&oldid=268510722) | CC BY-SA 4.0 |

The Wikipedia articles are modern and edited by people who may use language models. They cannot
be verified as free of model-assisted text, which is why they are the weakest part of the human
corpus.

### Not reached

No open-licence French, Spanish or German technical documentation (Mozilla, Debian, Python)
was fetched for this corpus. The Wikipedia articles above stand in for the modern technical
register. A closer match would be a README or docs page under an open licence.

## Machine

Unedited model output, written for this corpus on 21 October 2026. Each file is the standard
output of one command and was not edited. The raw output includes the model's own emoji,
Markdown and headings, which is what these files are meant to show.

Command, run from an empty temporary directory so no project file or setting reached the
model:

```
claude -p --model sonnet --setting-sources project --strict-mcp-config "<prompt>"
```

The four prompts, in each language, with `<language>` replaced by French, Spanish or German:

| file | shape | prompt |
|---|---|---|
| `readme-section.md` | a README section | Write a README section for a project called Fastq, in `<language>`, as a marketing-heavy AI assistant would. About 250 words. |
| `pull-request.md` | a pull request description | Write a pull request description for a change to the Fastq project, in `<language>`, as a marketing-heavy AI assistant would. About 250 words. |
| `article-intro.md` | an article introduction | Write the introduction of an article about the Fastq project, in `<language>`, as a marketing-heavy AI assistant would. About 250 words. |
| `docs-page.md` | a docs page | Write a docs page for the Fastq project, in `<language>`, as a marketing-heavy AI assistant would. About 250 words. |

Files: `machine/fr/`, `machine/es/`, `machine/de/`, one of each shape per language. The model
returned between about 180 and 310 words per file, around the 250 requested.

Two things in these files are not language tells, and the rules should not learn them as such:

- Many outputs end with a trailer: an offer of further help ("Dime qué cambia de verdad"), a
  disclaimer that the content is illustrative or invented, or the "Generated with Claude Code"
  attribution line. These are chatbot residue from the model's conversational wrapper and its
  habit of hedging about a request it cannot check. They are not properties of French, Spanish
  or German, so no pack rule should be justified by them. The measurement does not remove them,
  because the files are kept unedited.
- The Fastq prompt was ambiguous. Fastq is a made-up project name, and "marketing-heavy" is a
  register rather than a fixed style. The outputs therefore lean on emoji, bold headings and
  superlatives in all three languages. That is one register of one model, not the language
  itself.

The bench/typography corpus is documented in [`../typography/MANIFEST.md`](../typography/MANIFEST.md),
which is the source of the other human texts in each language.

## French additions, review round 1 (21 October 2026)

The French corpora were widened after review showed that the first machine corpus came from one
prompt family and one invented product, and that the first human corpus was too small. The four
machine files above are kept. The additions below are added beside them.

### Human, French, modern non-literary

Each file carries its source, licence and revision or fetch date in an HTML comment at its top.
Navigation, code blocks and page chrome were removed; prose and headings were kept.

| file | source | licence | revision or date |
|---|---|---|---|
| `human/fr/py-docs-tutorial.md` | [docs.python.org/fr/3/tutorial/introduction.html](https://docs.python.org/fr/3/tutorial/introduction.html) | PSF License Version 2. Confirmed 21 Oct 2026 on [docs.python.org/fr/3/license.html](https://docs.python.org/fr/3/license.html): "Le logiciel Python et sa documentation sont distribués sous la licence Python Software Foundation License Version 2." (English: [docs.python.org/3/license.html](https://docs.python.org/3/license.html), "Python software and documentation are licensed under the Python Software Foundation License Version 2."). Translators grant their work to the PSF under CC0 ([python-docs-fr README.rst](https://github.com/python/python-docs-fr/blob/3.15/README.rst)). Attribution: Python Software Foundation and the python-docs-fr translators; keep the PSF licence notice with any copy | page last updated 21 Oct 2026 |
| `human/fr/py-docs-pathlib.md` | [docs.python.org/fr/3/library/pathlib.html](https://docs.python.org/fr/3/library/pathlib.html) | PSF License Version 2. Confirmed 21 Oct 2026 on [docs.python.org/fr/3/license.html](https://docs.python.org/fr/3/license.html): "Le logiciel Python et sa documentation sont distribués sous la licence Python Software Foundation License Version 2." (English: [docs.python.org/3/license.html](https://docs.python.org/3/license.html), "Python software and documentation are licensed under the Python Software Foundation License Version 2."). Translators grant their work to the PSF under CC0 ([python-docs-fr README.rst](https://github.com/python/python-docs-fr/blob/3.15/README.rst)). Attribution: Python Software Foundation and the python-docs-fr translators; keep the PSF licence notice with any copy | fetched 21 Oct 2026 |
| `human/fr/py-docs-logging.md` | [docs.python.org/fr/3/howto/logging.html](https://docs.python.org/fr/3/howto/logging.html) | PSF License Version 2. Confirmed 21 Oct 2026 on [docs.python.org/fr/3/license.html](https://docs.python.org/fr/3/license.html): "Le logiciel Python et sa documentation sont distribués sous la licence Python Software Foundation License Version 2." (English: [docs.python.org/3/license.html](https://docs.python.org/3/license.html), "Python software and documentation are licensed under the Python Software Foundation License Version 2."). Translators grant their work to the PSF under CC0 ([python-docs-fr README.rst](https://github.com/python/python-docs-fr/blob/3.15/README.rst)). Attribution: Python Software Foundation and the python-docs-fr translators; keep the PSF licence notice with any copy | fetched 21 Oct 2026 |
| `human/fr/mdn-js-guide-introduction.md` | [developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Introduction](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Introduction) | CC BY-SA 2.5 or later. Confirmed 21 Oct 2026 on [developer.mozilla.org/fr/docs/MDN/Writing_guidelines/Attrib_copyright_license](https://developer.mozilla.org/fr/docs/MDN/Writing_guidelines/Attrib_copyright_license): "La réutilisation du contenu ici est publiée sous la même licence que le contenu original ... CC-BY-SA v2.5 ou toute version ultérieure." (the page has a dash where the dots are) (English: [developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license), "Unless otherwise indicated, the content is available under the terms of the Creative Commons Attribution-ShareAlike license (CC-BY-SA), v2.5 or any later version."). Attribution: Mozilla Contributors; derived copies carry the same licence | fetched 21 Oct 2026 |
| `human/fr/mdn-html-basics.md` | [developer.mozilla.org/fr/docs/Learn/Getting_started_with_the_web/HTML_basics](https://developer.mozilla.org/fr/docs/Learn/Getting_started_with_the_web/HTML_basics) | CC BY-SA 2.5 or later. Confirmed 21 Oct 2026 on [developer.mozilla.org/fr/docs/MDN/Writing_guidelines/Attrib_copyright_license](https://developer.mozilla.org/fr/docs/MDN/Writing_guidelines/Attrib_copyright_license): "La réutilisation du contenu ici est publiée sous la même licence que le contenu original ... CC-BY-SA v2.5 ou toute version ultérieure." (the page has a dash where the dots are) (English: [developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license), "Unless otherwise indicated, the content is available under the terms of the Creative Commons Attribution-ShareAlike license (CC-BY-SA), v2.5 or any later version."). Attribution: Mozilla Contributors; derived copies carry the same licence | fetched 21 Oct 2026 |
| `human/fr/wiki-decathlon.md` | [fr.wikipedia.org, Décathlon, oldid 238590559](https://fr.wikipedia.org/w/index.php?title=D%C3%A9cathlon&oldid=238590559) | CC BY-SA 4.0 | revision of 13 Aug 2026 |
| `human/fr/wiki-doctolib.md` | [fr.wikipedia.org, Doctolib, oldid 240485946](https://fr.wikipedia.org/w/index.php?title=Doctolib&oldid=240485946) | CC BY-SA 4.0 | revision of 18 Oct 2026 |
| `human/fr/wiki-blablacar.md` | [fr.wikipedia.org, BlaBlaCar, oldid 240333593](https://fr.wikipedia.org/w/index.php?title=BlaBlaCar&oldid=240333593) | CC BY-SA 4.0 | revision of 13 Oct 2026 |
| `human/fr/wiki-logiciel-libre.md` | [fr.wikipedia.org, Logiciel libre, oldid 240411617](https://fr.wikipedia.org/w/index.php?title=Logiciel_libre&oldid=240411617) | CC BY-SA 4.0 | revision of 15 Oct 2026 |
| `human/fr/wiki-marketing.md` | [fr.wikipedia.org, Marketing, oldid 239814244](https://fr.wikipedia.org/w/index.php?title=Marketing&oldid=239814244) | CC BY-SA 4.0 | revision of 25 Sep 2026 |

The five Python documentation and MDN files had their licence marked "not confirmed" in the first
round. They were re-checked on 21 October 2026 against the licence pages quoted in the table, which
confirm PSF License Version 2 for the Python documentation and CC BY-SA 2.5 or later for MDN, so the
files stay. Their licence is not MIT: it applies to those files, not to this repository.

Not obtained: a French README or release notes under MIT or CC0. One candidate was checked,
[python/python-docs-fr](https://github.com/python/python-docs-fr); its README states the PSF licence, and
its LICENSE path returned 404, so it was not used as an MIT or CC0 source. No other candidate was checked.

### Machine, French, neutral prompts

Generated on 21 October 2026 with the command used for the first four files, run from an empty
temporary directory:

```
claude -p --model sonnet --setting-sources project --strict-mcp-config "<prompt>"
```

Stdout was saved as the file, unedited. The prompts below do not ask for any register, style or
phrase; each names an invented product, company or document.

| file | shape | prompt (French, as sent) |
|---|---|---|
| `release-notes-tramelo.md` | release notes | Rédige les notes de version 2.3.0 de Tramelo, un outil en ligne de commande qui synchronise deux dossiers : corrections de bugs et une nouvelle option --dry-run. Environ 200 mots, en français. |
| `newsletter-cabanon.md` | newsletter | Rédige la lettre d'information mensuelle du café associatif « Le Cabanon », avec les événements de novembre. Environ 200 mots, en français. |
| `product-page-calbo.md` | product page | Rédige la page produit de Calbo, un agenda partagé pour les écoles primaires. Environ 200 mots, en français. |
| `onboarding-email-brisecol.md` | onboarding email | Rédige le courriel de bienvenue envoyé aux nouveaux utilisateurs de Brisecol, un outil de nettoyage de fichiers CSV. Environ 150 mots, en français. |
| `faq-noxaline.md` | FAQ | Rédige la FAQ de Noxaline, une application de relevé de compteurs d'eau pour les gestionnaires d'immeubles. Cinq questions. Environ 250 mots, en français. |
| `linkedin-verigo.md` | LinkedIn-style post | Rédige un post LinkedIn annonçant la sortie de Vérigo, un lanceur de tests pour Python. Environ 150 mots, en français. |
| `job-posting-pollenette.md` | job posting | Rédige une offre d'emploi pour un développeur back-end chez Pollenette, une start-up de prévisions polliniques. Environ 250 mots, en français. |
| `docs-page-kiwipan.md` | docs page | Rédige la page de documentation de la commande kiwipan export, qui exporte un projet en archive ZIP. Environ 200 mots, en français. |
| `article-intro-mirabel.md` | article introduction | Rédige l'introduction d'un article de blog sur Mirabel, une base de données de cartes postales anciennes. Environ 200 mots, en français. |
| `pull-request-oriolet.md` | pull request description | Rédige la description d'une pull request dans le projet Oriolet, une bibliothèque de dates : elle corrige le calcul des semaines ISO. Environ 180 mots, en français. |
| `readme-section-saule.md` | README section | Rédige la section Contribuer du README du projet Saule, un générateur de sites statiques. Environ 200 mots, en français. |
| `chat-rewrite-paragraph.md` | chat reply to "rewrite this paragraph" | Peux-tu réécrire ce paragraphe pour qu'il soit plus clair ? « La boulangerie Dufour fermera ses portes le lundi 3 novembre pour cause de travaux de la hotte du four, et réouvrira le mardi 4 à sept heures, comme d'habitude. Les clients sont invités à passer leurs commandes avant le samedi précédent. » |
| `chat-commit-message.md` | chat reply to "write a commit message" | Écris un message de commit pour un changement qui ajoute un cache des requêtes HTTP dans le client de l'application Bulle, et qui corrige une fuite de mémoire dans le même module. |
| `press-release-lunaris.md` | press release | Rédige un communiqué de presse annonçant la fusion de deux entreprises, Lunaris et Gravelle, dans le secteur de l'énergie solaire. Environ 200 mots, en français. |
| `school-notice-montrouge.md` | parents' notice | Rédige un avis aux parents pour la sortie scolaire du 12 décembre à la ferme pédagogique de Montrouge. Environ 150 mots, en français. |
| `support-reply-typhon.md` | support reply | Un client demande pourquoi son export Typhon, un logiciel de comptabilité, échoue. Rédige la réponse du support technique, environ 150 mots, en français. |
| `grant-summary-jardin.md` | grant summary | Rédige le résumé d'une demande de subvention pour un projet de jardin partagé à Lyon. Environ 200 mots, en français. |
| `chat-explain-error.md` | chat reply to a coding question | Explique-moi en français pourquoi mon script Python affiche « KeyError: 'nom' » quand je lis un fichier JSON, et comment le corriger. |

The four first-round files (`readme-section.md`, `pull-request.md`, `article-intro.md`, `docs-page.md`)
were generated with the "marketing-heavy AI assistant" prompts listed earlier in this file. They are kept
because the review asked for them to stay, but they are one product (Fastq) in one register, and no
pattern is shipped on their evidence alone.

## Spanish additions, review round 1 (21 October 2026)

The Spanish corpora were widened the same way as the French ones. The four first-round Spanish
machine files (`readme-section.md`, `pull-request.md`, `article-intro.md`, `docs-page.md`) are kept.
They are all about one invented product, Fastq, in a marketing register, so they count as one
product. The additions below are added beside them.

### Human, Spanish, modern non-literary

Three Spanish Wikipedia articles were added. Each file carries its article title, oldid, last edit
time and licence in an HTML comment at its top. The extract came from the MediaWiki TextExtract
API (`prop=extracts|revisions&explaintext=1`), fetched on 21 October 2026. Navigation and
bibliography sections were removed; prose and headings were kept. The oldid in each header is
the revision the extract came from, because both fields came from the same API response.

| file | source | licence | revision |
|---|---|---|---|
| `human/es/software-libre-wikipedia.md` | [es.wikipedia.org, Software libre, oldid 175523472](https://es.wikipedia.org/w/index.php?title=Software_libre&oldid=175523472) | CC BY-SA 4.0 | last edit 25 Sep 2026 |
| `human/es/reciclaje-wikipedia.md` | [es.wikipedia.org, Reciclaje, oldid 175822796](https://es.wikipedia.org/w/index.php?title=Reciclaje&oldid=175822796) | CC BY-SA 4.0 | last edit 14 Oct 2026 |
| `human/es/historia-internet-wikipedia.md` | [es.wikipedia.org, Historia de Internet, oldid 175899803](https://es.wikipedia.org/w/index.php?title=Historia_de_Internet&oldid=175899803) | CC BY-SA 4.0 | last edit 19 Oct 2026 |

Together these three files are about 13,700 words of modern non-literary Spanish, with the
existing Spanish Git article, so the Spanish human corpus now exceeds the 6,000-word minimum for
modern text. Wikipedia text is edited by people who may use language models and cannot be
verified as free of model-assisted edits; it is the weakest part of this corpus.

Not reached: no Spanish documentation under an open licence was fetched, and no Spanish Python docs or MDN file is in the corpus.

### Machine, Spanish, neutral prompts

Generated on 21 October 2026 with the command below, run from an empty temporary directory so no
project file reached the model. Stdout was saved as the file, unedited.

```
claude -p --model claude-sonnet-5-5 --setting-sources project --strict-mcp-config "<prompt>"
```

The prompts below are the Spanish text sent, verbatim. Each names an invented product, company or
document and asks for no register, style or phrase.

| file | prompt (Spanish, as sent) |
|---|---|
| `notas-version-aldebra.md` | Redacta las notas de la versión 4.1 de Aldebra, una biblioteca de Python para leer archivos de hojas de cálculo: se corrige un fallo al leer fechas y se añade soporte para archivos ODS. Unas 200 palabras, en español. |
| `boletin-vecinal-ceiba.md` | Redacta el boletín mensual de la asociación de vecinos Ceiba, del barrio de Las Acacias, con las actividades de noviembre. Unas 200 palabras, en español. |
| `pagina-producto-tumbo.md` | Redacta la página de producto de Tumbo, un calendario compartido para colegios de primaria. Unas 200 palabras, en español. |
| `correo-bienvenida-restaura.md` | Redacta el correo de bienvenida que recibirán los nuevos usuarios de Restaura, una aplicación para hacer copias de seguridad de fotos. Unas 150 palabras, en español. |
| `faq-medidora.md` | Redacta las preguntas frecuentes de Medidora, una aplicación para registrar las lecturas de contadores de agua en edificios de vecinos. Cinco preguntas. Unas 250 palabras, en español. |
| `post-linkedin-verbo.md` | Redacta una publicación para LinkedIn que anuncie el lanzamiento de Verbo, un ejecutor de pruebas para Python. Unas 150 palabras, en español. |
| `oferta-empleo-brisa-labs.md` | Redacta una oferta de empleo para un desarrollador back-end en Brisa Labs, una startup de previsión de cosechas. Unas 250 palabras, en español. |
| `docs-comando-pajarita.md` | Redacta la página de documentación del comando pajarita export, que exporta un proyecto a un archivo ZIP. Unas 200 palabras, en español. |
| `intro-articulo-olivera.md` | Redacta la introducción de un artículo de blog sobre Olivera, una base de datos de postales antiguas. Unas 200 palabras, en español. |
| `descripcion-pr-rimel.md` | Redacta la descripción de una pull request en el proyecto Rimel, una biblioteca de fechas que corrige el cálculo de las semanas ISO. Unas 180 palabras, en español. |
| `seccion-readme-tejon.md` | Redacta la sección Contribuir del README del proyecto Tejón, un generador de sitios estáticos. Unas 200 palabras, en español. |
| `comunicado-solana.md` | Redacta un comunicado de prensa que anuncie la fusión de las empresas Solana Dataworks y Brisal, del sector de las energías renovables. Unas 200 palabras, en español. |
| `aviso-familias-sierra.md` | Redacta un aviso para las familias sobre la excursión escolar del 12 de diciembre a la granja escuela Sierra del Monte. Unas 150 palabras, en español. |
| `respuesta-soporte-nimbo.md` | Un cliente pregunta por qué falla la exportación de Nimbo, un programa de contabilidad. Redacta la respuesta del servicio técnico. Unas 150 palabras, en español. |
| `resumen-subvencion-huerto.md` | Redacta el resumen de una solicitud de subvención para un huerto comunitario en Sevilla. Unas 200 palabras, en español. |
| `chat-reescribir-parrafo.md` | ¿Puedes reescribir este párrafo para que sea más claro? «La panadería Gómez cerrará el lunes 3 de noviembre por obras en el horno, y volverá a abrir el martes 4 a las siete, como de costumbre. Se pide a los clientes que hagan sus encargos antes del sábado anterior.» |
| `chat-mensaje-commit.md` | Escribe un mensaje de commit para un cambio que añade una caché de peticiones HTTP al cliente de la aplicación Burbuja y que corrige una fuga de memoria en el mismo módulo. |
| `chat-explicar-error.md` | Explícame en español por qué mi script de Python muestra «KeyError: 'nombre'» cuando leo un archivo JSON, y cómo corregirlo. |
| `boletin-tertulia.md` | Redacta el boletín mensual de la librería La Tertulia Azul, con las novedades y los encuentros de noviembre. Unas 200 palabras, en español. |
| `chat-explicar-api.md` | Explícame qué es una API REST en unas 150 palabras, para alguien que empieza en programación. |
| `chat-resumir-reunion.md` | Resume en unas 120 palabras esta nota de reunión: se aprobó un presupuesto de 12.000 euros para la web, Marta se encarga del diseño antes del 15 de noviembre y la migración del servidor se pospone a enero. |
| `readme-brasa.md` | Redacta el README de Brasa, una herramienta de línea de comandos que resume registros de errores. Incluye instalación y un ejemplo de uso. Unas 250 palabras, en español. |

Two things in these outputs are not Spanish tells, and no rule should be justified by them:

- The first run of the Spanish machine files let the model try to write files, and it reported that
  the write was refused. Those files were regenerated (see Repairs below), so no file in the corpus
  opens with such a message any more. The earlier wording was, for example "No he podido guardar el archivo porque no se concedió el permiso de
  escritura" (`notas-version-aldebra.md`, `comunicado-solana.md`, `pagina-producto-tumbo.md`,
  `docs-comando-pajarita.md`, `readme-brasa.md`). This is an artefact of the run, not of Spanish.
- Many outputs end with an offer of more help ("Si quieres que redacte ...", "Si quieres, puedo
  ajustarlo ..."), a note that the data is invented as an example, or a sentence describing what
  the model did ("He redactado solo esta oferta"). These are chatbot residue from the model's
  conversational wrapper, the same kind of trailer the French section describes. No rule was
  justified by them.

## German additions, review round 1 (21 October 2026)

The German corpora were widened the same way as the French and Spanish ones. The four first-round
German machine files (`readme-section.md`, `pull-request.md`, `article-intro.md`, `docs-page.md`) are
kept. They are one invented product, Fastq, in one marketing register, so they count as one product.
The additions below sit beside them.

### Human, German, modern non-literary

Four German Wikipedia articles were added. Each file carries its article title, oldid, last edit time
and licence in an HTML comment at its top. The extract came from the MediaWiki TextExtract API
(`prop=extracts|revisions&explaintext=1`), fetched on 21 October 2026. Bibliography, footnote,
weblink and see-also sections were removed; prose and headings were kept. The oldid in each header is
the revision the extract came from, because both fields came from the same API response.

| file | source | licence | revision |
|---|---|---|---|
| `human/de/wiki-barrierefreiheit.md` | [de.wikipedia.org, Barrierefreiheit, oldid 268231963](https://de.wikipedia.org/w/index.php?title=Barrierefreiheit&oldid=268231963) | CC BY-SA 4.0 | last edit 25 Jun 2026 |
| `human/de/wiki-cloud-computing.md` | [de.wikipedia.org, Cloud Computing, oldid 270563735](https://de.wikipedia.org/w/index.php?title=Cloud_Computing&oldid=270563735) | CC BY-SA 4.0 | last edit 17 Sep 2026 |
| `human/de/wiki-open-source.md` | [de.wikipedia.org, Open Source, oldid 271237624](https://de.wikipedia.org/w/index.php?title=Open_Source&oldid=271237624) | CC BY-SA 4.0 | last edit 11 Oct 2026 |
| `human/de/wiki-digitalisierung.md` | [de.wikipedia.org, Digitalisierung, oldid 271384672](https://de.wikipedia.org/w/index.php?title=Digitalisierung&oldid=271384672) | CC BY-SA 4.0 | last edit 16 Oct 2026 |

Those four files are about 16,200 words, and the existing German Git article (`human/de/git-wikipedia.md`,
first and second parts, two oldids in the MANIFEST table above) is about 900 more. The modern German
human text therefore totals about 17,200 words, above the 6,000-word minimum. Wikipedia text is edited
by people who may use language models and cannot be verified as free of model-assisted edits. The
Gutenberg files (Goethe 1774, Kafka 1915) and the Eichendorff typography excerpt are literary and are
counted in the human corpus only as the old-prose baseline.

Not reached: no German federal or other government text was fetched, and no German documentation under
an open licence (for example a README or docs page) was fetched and its licence checked. The German
government texts were not checked for a reuse licence, so they are not in the corpus.

### Machine, German, neutral prompts

Generated with the command below, run from an empty temporary directory so no project file or setting
reached the model. Stdout was saved as the file, unedited. The model id is `claude-sonnet-5-5`.

```
claude -p --model claude-sonnet-5-5 --setting-sources project --strict-mcp-config "<prompt>"
```

The prompts below are the German text sent, verbatim. Each names an invented product, company, document or
authority and asks for no register, style or phrase. Chat-reply shapes and German administrative shapes
(a municipal letter, a childcare application form, a municipal notice, a benefit confirmation) are included.
The command was run without a stdin redirect, so the CLI printed a "no stdin data received" warning to
stderr; that warning is not in the saved files.

| file | prompt (German, as sent) |
|---|---|
| `release-notes-tramelo.md` | Schreibe die Versionshinweise zu Tramelo 2.3.0, einem Kommandozeilenwerkzeug, das zwei Ordner synchronisiert: Fehlerkorrekturen und eine neue Option --dry-run. Etwa 200 Wörter, auf Deutsch. |
| `newsletter-schuppen.md` | Schreibe den monatlichen Newsletter des Vereinscafés „Der Schuppen“ mit den Veranstaltungen im November. Etwa 200 Wörter, auf Deutsch. |
| `produktseite-calbo.md` | Schreibe die Produktseite für Calbo, einen geteilten Kalender für Grundschulen. Etwa 200 Wörter, auf Deutsch. |
| `willkommensmail-brisecol.md` | Schreibe die Willkommens-E-Mail an neue Nutzer von Brisecol, einem Werkzeug zum Bereinigen von CSV-Dateien. Etwa 150 Wörter, auf Deutsch. |
| `faq-noxaline.md` | Schreibe die FAQ für Noxaline, eine App zum Ablesen von Wasserzählern für Hausverwaltungen. Fünf Fragen. Etwa 250 Wörter, auf Deutsch. |
| `linkedin-verigo.md` | Schreibe einen LinkedIn-Beitrag, der die Veröffentlichung von Verigo ankündigt, einem Testrunner für Python. Etwa 150 Wörter, auf Deutsch. |
| `stellenanzeige-pollenette.md` | Schreibe eine Stellenanzeige für einen Backend-Entwickler bei Pollenette, einem Start-up für Pollenvorhersagen. Etwa 250 Wörter, auf Deutsch. |
| `docs-kiwipan-export.md` | Schreibe die Dokumentationsseite für den Befehl kiwipan export, der ein Projekt als ZIP-Archiv exportiert. Etwa 200 Wörter, auf Deutsch. |
| `artikel-einleitung-mirabel.md` | Schreibe die Einleitung eines Blogartikels über Mirabel, eine Datenbank für historische Ansichtskarten. Etwa 200 Wörter, auf Deutsch. |
| `pull-request-oriolet.md` | Schreibe die Beschreibung eines Pull Requests im Projekt Oriolet, einer Datumsbibliothek: Er korrigiert die Berechnung der ISO-Kalenderwochen. Etwa 180 Wörter, auf Deutsch. |
| `readme-saule-mitwirken.md` | Schreibe den Abschnitt „Mitwirken“ der README des Projekts Saule, eines Generators für statische Websites. Etwa 200 Wörter, auf Deutsch. |
| `chat-umformulieren-baeckerei.md` | Kannst du diesen Absatz klarer formulieren? „Die Bäckerei Dufour bleibt am Montag, dem 3. November, wegen Arbeiten an der Ofenhaube geschlossen und öffnet am Dienstag, dem 4., wie gewohnt um sieben Uhr. Kunden werden gebeten, ihre Bestellungen bis zum Samstag davor aufzugeben.“ |
| `chat-commit-bulle.md` | Schreibe eine Commit-Nachricht für eine Änderung, die einen Cache für HTTP-Anfragen im Client der App Bulle ergänzt und im selben Modul ein Speicherleck behebt. |
| `pressemitteilung-lunaris.md` | Schreibe eine Pressemitteilung, die die Fusion der Unternehmen Lunaris und Gravelle im Bereich Solarenergie ankündigt. Etwa 200 Wörter, auf Deutsch. |
| `elternbrief-hohenfeld.md` | Schreibe einen Elternbrief zum Schulausflug am 12. Dezember auf den Bauernhof Hohenfeld in Leipzig. Etwa 150 Wörter, auf Deutsch. |
| `support-antwort-typhon.md` | Ein Kunde fragt, warum sein Export aus Typhon, einer Buchhaltungssoftware, fehlschlägt. Schreibe die Antwort des technischen Supports. Etwa 150 Wörter, auf Deutsch. |
| `antrag-zusammenfassung-garten.md` | Schreibe die Zusammenfassung eines Förderantrags für einen gemeinschaftlichen Garten in Dresden. Etwa 200 Wörter, auf Deutsch. |
| `chat-python-keyerror.md` | Erkläre mir auf Deutsch, warum mein Python-Skript „KeyError: 'name'“ ausgibt, wenn ich eine JSON-Datei lese, und wie ich den Fehler behebe. |
| `behoerde-wohngeld-eingang.md` | Schreibe ein Schreiben der fiktiven Stadtverwaltung Lindenau an einen Antragsteller, mit dem der Eingang eines Wohngeldantrags bestätigt und die noch benötigten Unterlagen genannt werden. Etwa 200 Wörter, auf Deutsch. |
| `formular-erlaeuterung-kita.md` | Schreibe die Erläuterungen zum Antragsformular für die Kindertagesstätte „Sonnenkiste“ in Bremen-Nord: welche Angaben nötig sind und bis wann der Antrag eingehen muss. Etwa 200 Wörter, auf Deutsch. |
| `chat-zusammenfassung-besprechung.md` | Fasse diese Besprechungsnotiz in etwa 120 Wörtern zusammen: Ein Budget von 12.000 Euro für die Website wurde genehmigt, Marta übernimmt das Design bis zum 15. November, und die Umstellung des Servers wird auf Januar verschoben. |
| `chat-erklaere-rest-api.md` | Erkläre mir in etwa 150 Wörtern, was eine REST-API ist, für jemanden, der mit dem Programmieren anfängt. |
| `readme-brasa.md` | Schreibe die README für Brasa, ein Kommandozeilenwerkzeug, das Fehlerprotokolle zusammenfasst. Mit Installation und einem Beispiel. Etwa 250 Wörter, auf Deutsch. |
| `gemeinde-marktplatz-sperrung.md` | Schreibe eine Mitteilung der Gemeinde Wiesenbach über die Sperrung des Marktplatzes vom 4. bis 8. Dezember wegen Bauarbeiten an der Wasserleitung. Etwa 150 Wörter, auf Deutsch. |
| `chat-kuendigungsfrist-mieter.md` | Ein Mieter fragt, wie lang seine Kündigungsfrist ist, wenn er seit acht Jahren in der Wohnung lebt. Antworte ihm in etwa 150 Wörtern, auf Deutsch. |
| `chat-umformulieren-ueberschrift.md` | Mach aus dieser Überschrift eine bessere Überschrift für eine Seite über Fahrradstellplätze am Hauptbahnhof: „Infos rund um das Thema Fahrradstellplätze am Hauptbahnhof“. |

Two things in these outputs are not German tells, and no rule should be justified by them:

- Many outputs carry unfilled placeholders such as `[Datum einsetzen]` or `platzhalter@example`, and a
  few say so in a trailer. These are template residue from the model, not a property of German. The
  candidate `Platzhalter` in the measurement is therefore excluded as a residue class, not measured as a
  language tell.
- Many outputs end with an offer of more help or a note that the example data is invented. Those trailers
  are chatbot residue, the same class the French and Spanish sections describe.

## Repairs, review round 1 (21 October 2026)

The final review found machine files whose text was not a plain answer to the prompt: the model
reported a refused file write, quoted a local scratch path, or answered a list of other requests
that had been sent in the same message. All French, Spanish and German machine files were searched
for those classes (refusal or "could not save" wording in each language, `/private/tmp`, `/Users/`,
write-permission wording, offers to save the text as a file, and remarks about a list of other
requests). The French and German files were clean. Eleven Spanish files were defective and were
regenerated with the same prompt (listed under "Machine, Spanish, neutral prompts" above, verbatim),
one prompt per call, from an empty temporary directory, with file tools disabled so the model can
only answer in text. Stdout was saved unedited:

```
claude -p "<prompt>" --model claude-sonnet-5-5 --setting-sources project --strict-mcp-config --disallowedTools=Write,Edit,Bash < /dev/null
```

The prompt comes first and the tool list uses the `=` form because the tool list option takes
several values and otherwise swallows the prompt.

| file | defect in the earlier output | regenerated |
|---|---|---|
| `machine/es/notas-version-aldebra.md` | refusal ("No he podido crear ningún archivo") with a local scratch path, no release notes | yes |
| `machine/es/comunicado-solana.md` | opened with "could not save" residue; ended with a note about ten other requests | yes |
| `machine/es/docs-comando-pajarita.md` | opened with "could not save" residue; ended with a note about the rest of a request list | yes |
| `machine/es/pagina-producto-tumbo.md` | opened with "could not save" residue; "el resto de tu mensaje parece un listado de encargos" | yes |
| `machine/es/readme-brasa.md` | opened with "could not save" residue | yes |
| `machine/es/correo-bienvenida-restaura.md` | ended with a note about eleven other requests | yes |
| `machine/es/boletin-vecinal-ceiba.md` | ended with a note about ten other tasks | yes |
| `machine/es/chat-reescribir-parrafo.md` | ended with a note about a list of file names | yes |
| `machine/es/oferta-empleo-brisa-labs.md` | ended with a note about a list of other requests and an offer to save a file | yes |
| `machine/es/resumen-subvencion-huerto.md` | ended with a note about a list of other requests | yes |
| `machine/es/aviso-familias-sierra.md` | ended with an offer to save the text as a file | yes |

The regenerated files are model output and still end with offers of help or notes about invented
data in some cases; those are the chatbot trailers described above, not repairs.
