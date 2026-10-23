import { test } from "node:test";
import assert from "node:assert/strict";
import { compareFacts, extractFacts } from "../dist/src/compare.js";
import { guessCompareLanguage } from "../dist/src/lang.js";

// Every sentence below was written for this file. None comes from a benchmark task.
const cmp = (before, after, language = "en") => {
  const r = compareFacts(before, after, { language });
  return { lost: r.lost.map((f) => `${f.kind}:${f.value}`), added: r.added.map((f) => `${f.kind}:${f.value}`) };
};
const facts = (text) => extractFacts(text).map((f) => `${f.kind}:${f.value}`);

// numbers (T1, G1 G2 G3): currency glue, group marks, canonical value, dotted number versus version.
test("numbers: a currency code glued to a number does not hide its magnitude", () => {
  assert.deepEqual(cmp("Rp1.500.000 budget", "Rp1.500 budget"), { lost: ["number:1500000"], added: ["version:1.500"] });
  assert.deepEqual(cmp("USD2,500,000 raised", "USD2,500 raised"), { lost: ["number:2500000"], added: ["number:2500"] });
  // A code inside a word is not a currency, so no number is read at all.
  assert.deepEqual(cmp("xRp1.500.000 saved", "xRp1.500 saved"), { lost: [], added: [] });
  assert.deepEqual(cmp("BUSD500 tokens", "BUSD400 tokens"), { lost: [], added: [] });
});

test("numbers: space, no-break space and apostrophe groups are one number", () => {
  assert.deepEqual(cmp("1\u00a0000", "1\u00a0500"), { lost: ["number:1000"], added: ["number:1500"] });
  assert.deepEqual(cmp("1'250", "1'500"), { lost: ["number:1250"], added: ["number:1500"] });
  assert.deepEqual(cmp("1\u00a0000", "1\u00a0500"), { lost: ["number:1000"], added: ["number:1500"] });
  // A first group of four digits is not a group, so the two numbers stay two numbers.
  assert.deepEqual(cmp("1234 567", "1234 999"), { lost: ["number:567"], added: ["number:999"] });
  assert.deepEqual(facts("1234 567"), ["number:1234", "number:567"]);
});

test("numbers: a grouped decimal keeps its value, and both mark orders give one value", () => {
  assert.deepEqual(cmp("1\u00a0250,5", "1\u00a0250,5"), { lost: [], added: [] });
  assert.deepEqual(facts("1\u00a0250,5"), ["number:1250.5"]);
  assert.deepEqual(cmp("1.250,50", "1,250.50"), { lost: [], added: [] });
  assert.deepEqual(cmp("1,250,000", "1.250.000"), { lost: [], added: [] });
  // A lone comma decimal keeps its text, and so does a lone `.` or `,` with three digits after it.
  assert.deepEqual(cmp("0,53", "0,54"), { lost: ["number:0,53"], added: ["number:0,54"] });
  assert.deepEqual(cmp("12,5", "12,6"), { lost: ["number:12,5"], added: ["number:12,6"] });
  assert.deepEqual(facts("1.250"), ["version:1.250"]);
});

test("numbers: a dotted run of three-digit groups is a number, a version otherwise", () => {
  assert.deepEqual(cmp("€2.500.000", "€2.500"), { lost: ["number:2500000"], added: ["version:2.500"] });
  assert.deepEqual(cmp("1.000.000.000", "1.000.000.001"), { lost: ["number:1000000000"], added: ["number:1000000001"] });
  assert.deepEqual(facts("3.2.1"), ["version:3.2.1"]);
  assert.deepEqual(facts("v2.4"), ["version:v2.4"]);
  assert.deepEqual(facts("2.3.456"), ["version:2.3.456"]);
  assert.deepEqual(facts("10.0.0.1"), ["version:10.0.0.1"]);
});

test("numbers: text with a grouped number and no change is unchanged", () => {
  assert.deepEqual(cmp("1\u00a0000 requests", "1\u00a0000 requests"), { lost: [], added: [] });
});

test("numbers: an address of four short groups stays a version, not a number", () => {
  const f = extractFacts("Host 192.168.100.200 and 10.0.0.1 answer.").map((x) => `${x.kind}:${x.value}`);
  assert.ok(f.includes("version:192.168.100.200"), f.join());
  assert.ok(!f.some((x) => x.startsWith("number:192")), f.join());
});

test("numbers: a percent sign does not hide a lost qualifier or a lost unit on a grouped number", () => {
  assert.deepEqual(cmp("Up to 40% of builds fail.", "40% of builds fail.").lost, ["qualifier:up to 40"]);
  assert.deepEqual(cmp("Start took 1\u00a0250 ms.", "Start took 1\u00a0250.").lost, ["unit:1250 ms"]);
  assert.deepEqual(cmp("Start took 1\u00a0250 ms.", "Start took 1\u00a0250 ms.").lost, []);
});

test("numbers: a plain space never joins digits, mixed marks are two numbers, a no-break space joins", () => {
  assert.deepEqual(cmp("Chapter 3 200 pages", "Chapter 3: 200 pages"), { lost: [], added: [] });
  assert.deepEqual(facts("Step 1 500 users"), ["number:1", "number:500"]);
  assert.ok(!facts("It shows 1,000 000 rows").some((f) => f.includes(" ")), "no fact value holds a space");
  assert.deepEqual(facts("Limit 1\u00a0000 requests"), ["number:1000"]);
  assert.deepEqual(cmp("Limit 1\u00a0000 requests", "Limit 1\u00a0500 requests"), { lost: ["number:1000"], added: ["number:1500"] });
  assert.deepEqual(cmp("At least Rp1.500.000 a month.", "Rp1.500.000 a month.").lost, ["qualifier:at least 1500000"]);
});

test("numbers: two different group marks in a row are two numbers", () => {
  assert.deepEqual(facts("1,000 000"), ["number:1000", "number:000"]);
});

// dates (T2, G4): full month names in nine languages, particles between day, month and year, case-insensitive
// comparison, and no date without a day number in front of the month.
test("dates: a changed Spanish month with particles is one lost and one added date", () => {
  assert.deepEqual(cmp("Cierre el 3 de noviembre de 2026.", "Cierre el 3 de diciembre de 2026.", "es"), {
    lost: ["date:3 noviembre 2026"],
    added: ["date:3 diciembre 2026"],
  });
  assert.deepEqual(cmp("Cierre el 3 de noviembre de 2026.", "Cierre el 3 de noviembre de 2026.", "es"), { lost: [], added: [] });
  assert.deepEqual(facts("3 de noviembre de 2026"), ["date:3 noviembre 2026"]);
});

test("dates: a changed Portuguese month is reported, and the same month in other case is not", () => {
  assert.deepEqual(cmp("Entrega em 3 de março de 2026.", "Entrega em 3 de abril de 2026.", "pt"), {
    lost: ["date:3 março 2026"],
    added: ["date:3 abril 2026"],
  });
  assert.deepEqual(cmp("Entrega em 3 de março de 2026.", "Entrega em 3 de Março de 2026.", "pt"), { lost: [], added: [] });
});

test("dates: a German day with its dot is a date, and the dot is not part of the value", () => {
  assert.deepEqual(cmp("Release am 3. Oktober 2026.", "Release am 3. November 2026.", "de"), {
    lost: ["date:3 Oktober 2026"],
    added: ["date:3 November 2026"],
  });
  assert.deepEqual(cmp("Release am 3. Oktober 2026.", "Release am 3 Oktober 2026.", "de"), { lost: [], added: [] });
  assert.deepEqual(cmp("Release am 3. oktober 2026.", "Release am 3 Oktober 2026.", "de"), { lost: [], added: [] });
});

test("dates: a changed Dutch month is reported, and a capital letter alone changes nothing", () => {
  assert.deepEqual(cmp("Lancering op 3 mei.", "Lancering op 3 juni.", "nl"), { lost: ["date:3 mei"], added: ["date:3 juni"] });
  assert.deepEqual(cmp("Lancering op 3 december 2026.", "Lancering op 3 December 2026.", "nl"), { lost: [], added: [] });
});

test("dates: a changed Italian month is reported, and the same month is kept", () => {
  assert.deepEqual(cmp("Uscita il 3 marzo 2026.", "Uscita il 3 aprile 2026.", "it"), {
    lost: ["date:3 marzo 2026"],
    added: ["date:3 aprile 2026"],
  });
  assert.deepEqual(cmp("Uscita il 3 marzo 2026.", "Uscita il 3 marzo 2026.", "it"), { lost: [], added: [] });
});

test("dates: a Polish genitive month changes the date, and the same date in other case does not", () => {
  assert.deepEqual(cmp("Zamknięte od 3 listopada.", "Zamknięte od 3 grudnia.", "pl"), {
    lost: ["date:3 listopada"],
    added: ["date:3 grudnia"],
  });
  assert.deepEqual(cmp("Zamknięte od 3 listopada.", "Zamknięte Od 3 Listopada.", "pl"), { lost: [], added: [] });
});

test("dates: a changed Indonesian month is reported, and a capital letter alone changes nothing", () => {
  assert.deepEqual(cmp("Rilis pada 3 Maret 2026.", "Rilis pada 3 April 2026.", "id"), {
    lost: ["date:3 Maret 2026"],
    added: ["date:3 April 2026"],
  });
  assert.deepEqual(cmp("Rilis pada 3 Desember 2026.", "Rilis pada 3 desember 2026.", "id"), { lost: [], added: [] });
});

test("dates: a changed Turkish month is reported, and Ş and ş match as one letter", () => {
  assert.deepEqual(cmp("Yayın 3 Mayıs 2026.", "Yayın 3 Haziran 2026.", "tr"), {
    lost: ["date:3 Mayıs 2026"],
    added: ["date:3 Haziran 2026"],
  });
  assert.deepEqual(cmp("Yayın 3 Mayıs 2026.", "Yayın 3 mayıs 2026.", "tr"), { lost: [], added: [] });
  assert.deepEqual(facts("Yayın 3 ŞUBAT 2026."), ["date:3 ŞUBAT 2026"]);
  assert.deepEqual(cmp("Yayın 3 Şubat 2026.", "Yayın 3 ŞUBAT 2026.", "tr"), { lost: [], added: [] });
  // A capital I folds to i in JavaScript, not to the dotless ı, so the upper-case form of Mayıs is not read.
  assert.deepEqual(facts("Yayın 3 MAYIS 2026.").filter((f) => f.startsWith("date:")), []);
});

test("dates: a changed Russian genitive month is reported, and a capital letter alone changes nothing", () => {
  assert.deepEqual(cmp("Релиз 3 марта 2026.", "Релиз 3 апреля 2026.", "ru"), {
    lost: ["date:3 марта 2026"],
    added: ["date:3 апреля 2026"],
  });
  assert.deepEqual(cmp("Релиз 3 января 2026.", "Релиз 3 Января 2026.", "ru"), { lost: [], added: [] });
});

test("dates: of between day and month, and between month and year, is a particle and not a word of the date", () => {
  assert.deepEqual(cmp("Shipped 3 of March 2026.", "Shipped 3 of April 2026.", "en"), {
    lost: ["date:3 March 2026"],
    added: ["date:3 April 2026"],
  });
  assert.deepEqual(facts("3 of March 2026"), ["date:3 March 2026"]);
});

test("dates: a month name with no day number in front of it is not a date", () => {
  assert.deepEqual(facts("In March we ship").filter((f) => f.startsWith("date:")), []);
  assert.deepEqual(facts("Mayıs ayında yayınlayacağız").filter((f) => f.startsWith("date:")), []);
  assert.deepEqual(facts("Wir liefern im Oktober aus").filter((f) => f.startsWith("date:")), []);
});

test("dates: en and fr keep their dates, and a case change alone reports nothing", () => {
  assert.deepEqual(cmp("3 November 2026", "3 november 2026"), { lost: [], added: [] });
  assert.deepEqual(cmp("Due 3 November 2026.", "Due 3 December 2026.", "en"), {
    lost: ["date:3 November 2026"],
    added: ["date:3 December 2026"],
  });
  assert.deepEqual(facts("14 September, 2024"), ["date:14 September 2024"]);
  assert.deepEqual(facts("Sortie le 3 mars 2026."), ["date:3 mars 2026"]);
  assert.deepEqual(cmp("Sortie le 3 mars 2026.", "Sortie le 3 avril 2026.", "fr"), {
    lost: ["date:3 mars 2026"],
    added: ["date:3 avril 2026"],
  });
});

// spelled numbers (G5): number words are read by value, so `three` is the fact `3`. English is always
// read; the declared or guessed language is read in addition. Ambiguous words are never read.
test("spelled numbers: an English number word lost from a rewrite is a lost number fact", () => {
  assert.deepEqual(cmp("We opened three branches", "We opened branches"), { lost: ["number:3"], added: [] });
  assert.deepEqual(cmp("Plan for three rounds.", "Plan for 3 rounds."), { lost: [], added: [] });
  assert.deepEqual(facts("three"), facts("3"));
});

test("spelled numbers: a Spanish number word is read with language es", () => {
  assert.deepEqual(cmp("Abrimos tres sucursales", "Abrimos sucursales", "es"), { lost: ["number:3"], added: [] });
});

test("spelled numbers: a Polish number word is read with language pl (dwie is not in the table as dwunastu)", () => {
  assert.deepEqual(cmp("Otworzyliśmy dwie filie", "Otworzyliśmy filie", "pl"), { lost: ["number:2"], added: [] });
});

test("spelled numbers: an Indonesian number word is read with language id", () => {
  assert.deepEqual(cmp("Kami membuka dua cabang", "Kami membuka cabang", "id"), { lost: ["number:2"], added: [] });
});

test("spelled numbers: a Turkish number word is read with language tr", () => {
  assert.deepEqual(cmp("Üç şube açtık", "şube açtık", "tr"), { lost: ["number:3"], added: [] });
});

test("spelled numbers: a Dutch number word is read with language nl", () => {
  assert.deepEqual(cmp("We openden drie filialen", "We openden filialen", "nl"), { lost: ["number:3"], added: [] });
});

test("spelled numbers: a German number word is read with language de", () => {
  assert.deepEqual(cmp("Wir eröffneten drei Filialen", "Wir eröffneten Filialen", "de"), { lost: ["number:3"], added: [] });
});

test("spelled numbers: a Portuguese number word is read with language pt", () => {
  assert.deepEqual(cmp("Abrimos três filiais", "Abrimos filiais", "pt"), { lost: ["number:3"], added: [] });
});

test("spelled numbers: a French number word is read with language fr", () => {
  assert.deepEqual(cmp("Nous avons ouvert trois agences", "Nous avons ouvert agences", "fr"), { lost: ["number:3"], added: [] });
});

test("spelled numbers: an Italian number word is read with language it", () => {
  assert.deepEqual(cmp("Abbiamo aperto tre filiali", "Abbiamo aperto filiali", "it"), { lost: ["number:3"], added: [] });
});

test("spelled numbers: ambiguous words are never read (once, one, and the articles and pronouns for one)", () => {
  assert.deepEqual(cmp("We ship once a day.", "We ship a day."), { lost: [], added: [] });
  assert.deepEqual(cmp("We ship one box.", "We ship a box."), { lost: [], added: [] });
  assert.deepEqual(cmp("Hay una sucursal.", "Hay sucursal.", "es"), { lost: [], added: [] });
  assert.deepEqual(cmp("Tenho uma filial.", "Tenho filial.", "pt"), { lost: [], added: [] });
  assert.deepEqual(cmp("We openden een filiaal.", "We openden filiaal.", "nl"), { lost: [], added: [] });
  assert.deepEqual(cmp("Kami membuka satu cabang.", "Kami membuka cabang.", "id"), { lost: [], added: [] });
  assert.deepEqual(cmp("Mam jeden pomysł.", "Mam pomysł.", "pl"), { lost: [], added: [] });
});

test("spelled numbers: a hyphenated or underscored word and a word after # are not read", () => {
  assert.deepEqual(cmp("A five-star hotel", "A hotel"), { lost: [], added: [] });
  assert.deepEqual(facts("a three_way split").filter((f) => f.startsWith("number:")), []);
  assert.deepEqual(facts("issue #three").filter((f) => f.startsWith("number:")), []);
});

test("spelled numbers: a number word inside a code span is not read", () => {
  assert.deepEqual(cmp("Use `three` here.", "Use here."), { lost: ["code:three"], added: [] });
  assert.deepEqual(facts("Use `three` here.").filter((f) => f.startsWith("number:")), []);
});

test("spelled numbers: guessCompareLanguage reads a fresh Polish paragraph as pl", () => {
  const pl =
    "Zespół przygotował raport o wynikach sprzedaży, ale nie jest jeszcze pewne, czy to jest dobry wynik. " +
    "Dane z ostatniego kwartału pokazują, że klienci są bardziej zadowoleni, a także że wiele firm wybiera nasze usługi. " +
    "Jak co roku, tylko część z nich może być opisana w tym dokumencie, ponieważ reszta jest tajna i nie została jeszcze zatwierdzona przez zarząd.";
  assert.equal(guessCompareLanguage(pl), "pl");
});

test("spelled numbers: guessCompareLanguage reads a fresh Indonesian paragraph as id", () => {
  const id =
    "Tim kami telah menyusun laporan tentang hasil penjualan di kota ini. Data dari kuartal terakhir menunjukkan bahwa " +
    "pelanggan merasa puas dengan layanan yang diberikan, dan sebagian besar dari mereka akan kembali untuk membeli lagi. " +
    "Namun, ada beberapa hal yang perlu diperbaiki dalam proses pengiriman barang agar lebih cepat dan tidak ada keluhan dari pembeli.";
  assert.equal(guessCompareLanguage(id), "id");
});

test("spelled numbers: guessCompareLanguage reads a fresh Turkish paragraph as tr", () => {
  const tr =
    "Ekibimiz satış sonuçları hakkında bir rapor hazırladı. Son çeyrekteki veriler, müşterilerin hizmetten memnun olduğunu ve birçok kişinin tekrar geleceğini gösteriyor. " +
    "Ancak teslimat sürecinde bazı sorunlar var ve bunların çözülmesi gerekiyor çünkü bu durum müşteri güvenini azaltıyor. " +
    "Bu nedenle yeni bir plan çok daha önemli, ama henüz onaylanmadı.";
  assert.equal(guessCompareLanguage(tr), "tr");
});

test("spelled numbers: guessCompareLanguage gives null for English and for text under 25 words", () => {
  const en =
    "We spent the first months building the tool and testing it on real projects. The results were clear: teams that used it found fewer problems in their documents, and they spent less time on review. This is not a claim about every project, but it is a pattern that we saw again and again in the data we collected from the users of the tool.";
  assert.equal(guessCompareLanguage(en), null);
  assert.equal(guessCompareLanguage("Dwie kawy, proszę."), null);
});

// persons (T4, G7): first-person words for nl, pt, it, pl and id; only an increase is reported.
test("persons: a Dutch first-person plural added in the rewrite is reported", () => {
  assert.deepEqual(cmp("De release verkort de tijd.", "Onze release verkort de tijd.", "nl"), { lost: [], added: ["person:onze"] });
  assert.deepEqual(cmp("De ploeg las de cijfers.", "Wij lazen de cijfers.", "nl"), { lost: [], added: ["person:wij"] });
});

test("persons: a Dutch first-person word present in both texts is not reported", () => {
  assert.deepEqual(cmp("Onze release verkort de tijd.", "Onze release verkort de wachttijd.", "nl"), { lost: [], added: [] });
  // `ons` and `we` are read only when the language is Dutch: the same English sentence reports nothing.
  assert.deepEqual(cmp("The release shortens the time.", "Our release shortens the time.", "en"), { lost: [], added: ["person:our"] });
  assert.deepEqual(cmp("The release shortens the time.", "Ons release shortens the time.", "en"), { lost: [], added: [] });
});

test("persons: a Portuguese first-person plural added in the rewrite is reported", () => {
  assert.deepEqual(cmp("A release reduz o tempo de build.", "Nosso release reduz o tempo de build.", "pt"), { lost: [], added: ["person:nosso"] });
  assert.deepEqual(cmp("A equipe revisou o texto.", "Eu revisei o texto.", "pt"), { lost: [], added: ["person:eu"] });
});

test("persons: a Portuguese first-person word present in both texts is not reported", () => {
  assert.deepEqual(cmp("Nosso release reduz o tempo.", "Nosso release reduz o tempo de build.", "pt"), { lost: [], added: [] });
  assert.deepEqual(cmp("Nosso time testou o build.", "Nossos times testaram o build.", "pt"), { lost: [], added: ["person:nossos"] });
});

test("persons: an Italian first-person word added in the rewrite is reported", () => {
  assert.deepEqual(cmp("La release riduce il tempo.", "La nostra release riduce il tempo.", "it"), { lost: [], added: ["person:nostra"] });
  assert.deepEqual(cmp("Il team ha testato il build.", "Io ho testato il build.", "it"), { lost: [], added: ["person:io"] });
});

test("persons: an Italian first-person word present in both texts is not reported", () => {
  assert.deepEqual(cmp("La nostra release riduce il tempo.", "La nostra release riduce il tempo di build.", "it"), { lost: [], added: [] });
  assert.deepEqual(cmp("Io ho testato il build.", "Io ho testato il build, poi io ho scritto.", "it"), { lost: [], added: ["person:io"] });
});

test("persons: a Polish first-person plural past verb added in the rewrite is reported", () => {
  assert.deepEqual(cmp("Zrobili to", "Zrobiliśmy to", "pl"), { lost: [], added: ["person:zrobiliśmy"] });
  assert.deepEqual(cmp("Zespół oddał raport.", "Oddaliśmy raport.", "pl"), { lost: [], added: ["person:oddaliśmy"] });
});

test("persons: a Polish verb of the same form in both texts is not reported, a third-person form is not a person", () => {
  assert.deepEqual(cmp("Zrobili to", "Zrobili to", "pl"), { lost: [], added: [] });
  assert.deepEqual(cmp("Były kwiaty.", "Były w domu.", "pl"), { lost: [], added: [] });
});

test("persons: a Polish pronoun added in the rewrite is reported", () => {
  assert.deepEqual(cmp("Zespół oddał raport.", "Ja oddałem raport.", "pl"), { lost: [], added: ["person:ja"] });
  assert.deepEqual(cmp("Nasz zespół oddał raport.", "Nasz zespół oddał raport w terminie.", "pl"), { lost: [], added: [] });
});

test("persons: an Indonesian first-person word added in the rewrite is reported", () => {
  assert.deepEqual(cmp("Rilis ini mempercepat build.", "Kami mempercepat build dengan rilis ini.", "id"), { lost: [], added: ["person:kami"] });
  assert.deepEqual(cmp("Tim merilis fitur ini.", "Aku merilis fitur ini.", "id"), { lost: [], added: ["person:aku"] });
});

test("persons: an Indonesian first-person word present in both texts, a joined one and a capitals one are not reported", () => {
  assert.deepEqual(cmp("Kami mempercepat build.", "Kami mempercepat build dengan rilis ini.", "id"), { lost: [], added: [] });
  // A hyphen joins the word to a name (`kami-api`), and all capitals is an acronym: neither is the pronoun.
  assert.deepEqual(cmp("Rilis ini.", "Layanan kami-api membaik.", "id"), { lost: [], added: [] });
  assert.deepEqual(cmp("Rilis ini.", "KAMI merilis ini.", "id"), { lost: [], added: [] });
});

// claims (T4, G7): claim words for pt, nl, it, pl, id and tr; only an increase is reported.
test("claims: an Indonesian absolute word added in the rewrite is reported", () => {
  assert.deepEqual(cmp("Rilis ini mempercepat build.", "Rilis ini selalu mempercepat build.", "id"), { lost: [], added: ["claim:selalu"] });
  assert.deepEqual(cmp("Build ini gagal.", "Build ini tidak pernah gagal.", "id"), { lost: [], added: ["claim:tidak pernah"] });
  assert.deepEqual(cmp("Rilis ini membantu build.", "Rilis ini menjamin build.", "id"), { lost: [], added: ["claim:menjamin"] });
});

test("claims: an Indonesian absolute word present in both texts is not reported", () => {
  assert.deepEqual(cmp("Rilis ini selalu mempercepat build.", "Rilis ini selalu mempercepat build cepat.", "id"), { lost: [], added: [] });
  assert.deepEqual(cmp("Build ini tidak pernah gagal.", "Build ini tidak pernah gagal lagi.", "id"), { lost: [], added: [] });
});

test("claims: Portuguese, Dutch and Italian claim words added in the rewrite are reported", () => {
  assert.deepEqual(cmp("A release reduz o tempo.", "A release sempre reduz o tempo.", "pt"), { lost: [], added: ["claim:sempre"] });
  assert.deepEqual(cmp("A release reduz o tempo.", "A release garante menos tempo.", "pt"), { lost: [], added: ["claim:garante"] });
  assert.deepEqual(cmp("De release werkt.", "De release werkt altijd.", "nl"), { lost: [], added: ["claim:altijd"] });
  assert.deepEqual(cmp("De release helpt.", "De release garandeert de tijd.", "nl"), { lost: [], added: ["claim:garandeert"] });
  assert.deepEqual(cmp("La release funziona.", "La release funziona sempre.", "it"), { lost: [], added: ["claim:sempre"] });
  assert.deepEqual(cmp("Il build fallisce.", "Il build non fallisce mai.", "it"), { lost: [], added: ["claim:mai"] });
});

test("claims: Polish and Turkish claim words added in the rewrite are reported, and a word present in both is not", () => {
  assert.deepEqual(cmp("Wydanie działa.", "Wydanie zawsze działa.", "pl"), { lost: [], added: ["claim:zawsze"] });
  assert.deepEqual(cmp("Wydanie pomaga.", "Wydanie gwarantuje wynik.", "pl"), { lost: [], added: ["claim:gwarantuje"] });
  assert.deepEqual(cmp("Wydanie zawsze działa.", "Wydanie zawsze działa dobrze.", "pl"), { lost: [], added: [] });
  assert.deepEqual(cmp("Sürüm çalışıyor.", "Sürüm her zaman çalışıyor.", "tr"), { lost: [], added: ["claim:her zaman"] });
  assert.deepEqual(cmp("Sürüm çöker.", "Sürüm asla çökmez.", "tr"), { lost: [], added: ["claim:asla"] });
});

// qualifiers (T4, G8): an approximator or bound before a number, for pt, nl, it, pl, id and tr.
test("qualifiers: an Indonesian approximator dropped next to a number is reported as lost", () => {
  assert.deepEqual(cmp("Sekitar 40 persen pengguna.", "40 persen pengguna.", "id"), { lost: ["qualifier:sekitar 40"], added: [] });
  assert.deepEqual(cmp("Kira-kira 40 persen pengguna.", "40 persen pengguna.", "id"), { lost: ["qualifier:kira-kira 40"], added: [] });
});

test("qualifiers: a Polish, Dutch and Portuguese approximator dropped next to a number is reported as lost", () => {
  assert.deepEqual(cmp("Około 40 procent użytkowników.", "40 procent użytkowników.", "pl"), { lost: ["qualifier:około 40"], added: [] });
  assert.deepEqual(cmp("Ongeveer 40 procent van de gebruikers.", "40 procent van de gebruikers.", "nl"), { lost: ["qualifier:ongeveer 40"], added: [] });
  assert.deepEqual(cmp("Cerca de 40 por cento dos usuários.", "40 por cento dos usuários.", "pt"), { lost: ["qualifier:cerca de 40"], added: [] });
});

test("qualifiers: a Turkish and an Italian approximator dropped next to a number is reported as lost", () => {
  assert.deepEqual(cmp("Yaklaşık 40 kullanıcı var.", "40 kullanıcı var.", "tr"), { lost: ["qualifier:yaklaşık 40"], added: [] });
  assert.deepEqual(cmp("Circa 40 utenti.", "40 utenti.", "it"), { lost: ["qualifier:circa 40"], added: [] });
});

test("qualifiers: a bound added next to a number is reported as added, and the same qualifier in both is not", () => {
  assert.deepEqual(cmp("Ada 40 pengguna.", "Hingga 40 pengguna.", "id"), { lost: [], added: ["qualifier:hingga 40"] });
  assert.deepEqual(cmp("Circa 40 utenti.", "Circa 40 utenti, forse.", "it"), { lost: [], added: [] });
});

test("qualifiers: a year after a bound word is a date, not a qualifier, in every language that has one", () => {
  assert.deepEqual(cmp("Het is tot 2025 geldig.", "Het is 2025 geldig.", "nl"), { lost: [], added: [] });
  assert.deepEqual(cmp("La scadenza è fino a 2025.", "La scadenza è 2025.", "it"), { lost: [], added: [] });
  assert.deepEqual(cmp("O prazo é até 2025.", "O prazo é 2025.", "pt"), { lost: [], added: [] });
  assert.deepEqual(cmp("Berlaku hingga 2025.", "Berlaku 2025.", "id"), { lost: [], added: [] });
  // A percent after the number keeps it a qualifier: `até 40%` is a bound, not a year.
  assert.deepEqual(cmp("A meta é até 40%.", "A meta é 40%.", "pt"), { lost: ["qualifier:até 40"], added: [] });
});

// units (T4, G6): the unit of a number is kept, for id, pl, it and nl.
test("units: an Indonesian time or percent unit dropped from a number is reported", () => {
  assert.deepEqual(cmp("Waktu muat 4,8 detik.", "Waktu muat 4,8.", "id"), { lost: ["unit:4,8 detik"], added: [] });
  assert.deepEqual(cmp("Rata-rata 40 persen.", "Rata-rata 40.", "id"), { lost: ["unit:40 persen"], added: [] });
});

test("units: a Polish, Italian and Dutch time unit dropped from a number is reported", () => {
  assert.deepEqual(cmp("Czas ładowania 4,8 sekundy.", "Czas ładowania 4,8.", "pl"), { lost: ["unit:4,8 sekundy"], added: [] });
  assert.deepEqual(cmp("Tempo di caricamento 4,8 secondi.", "Tempo di caricamento 4,8.", "it"), { lost: ["unit:4,8 secondi"], added: [] });
  assert.deepEqual(cmp("Laadtijd 4,8 seconden.", "Laadtijd 4,8.", "nl"), { lost: ["unit:4,8 seconden"], added: [] });
});

test("units: a number that keeps its unit in both texts is not reported", () => {
  assert.deepEqual(cmp("Waktu muat 4,8 detik.", "Waktu muat 4,8 detik, cepat.", "id"), { lost: [], added: [] });
  assert.deepEqual(cmp("Trwa 3 dni.", "Trwa 3 dni dłużej.", "pl"), { lost: [], added: [] });
  assert.deepEqual(cmp("Build 5 menit.", "Build 5 menit lebih cepat.", "id"), { lost: [], added: [] });
});

// Reviewer findings of T2 to T4 (round 8).
test("review: English number words are not read in a language with its own table", () => {
  assert.deepEqual(cmp("Ten człowiek zrobił to.", "Ta osoba zrobiła to.", "pl"), { lost: [], added: [] });
  assert.deepEqual(cmp("Ten minste 5 mensen.", "Minstens 5 mensen.", "nl"), { lost: [], added: [] });
  assert.deepEqual(cmp("Ten cuidado con eso.", "Cuidado con eso.", "es"), { lost: [], added: [] });
  assert.deepEqual(cmp("We opened ten branches.", "We opened branches.", "en").lost, ["number:10"]);
});

test("review: a capitalised number word in the middle of a sentence is a noun or a name", () => {
  assert.deepEqual(cmp("Wir müssen Acht geben.", "Wir müssen aufpassen.", "de"), { lost: [], added: [] });
  assert.ok(!cmp("Pergi ke Lima besok.", "Pergi ke Peru besok.", "id").lost.includes("number:5"));
  assert.deepEqual(cmp("Drei Filialen öffnen.", "Filialen öffnen.", "de").lost, ["number:3"]);
});

test("review: a range written with tot, até, fino a or hingga is not an at-most bound", () => {
  assert.deepEqual(cmp("Open van 9 tot 17 uur.", "Open tussen 9 en 17 uur.", "nl"), { lost: [], added: [] });
  assert.deepEqual(cmp("Das 9 até 17 horas.", "Das 9 às 17 horas.", "pt"), { lost: [], added: [] });
  assert.deepEqual(cmp("Fino a 40 persone.", "40 persone.", "it").lost, ["qualifier:fino a 40"]);
});

test("review: Polish first person plural past verbs of seven letters count", () => {
  assert.deepEqual(cmp("Zrobiłem to.", "Byliśmy tam.", "pl").added, ["person:byliśmy"]);
});
