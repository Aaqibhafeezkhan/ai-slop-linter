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
