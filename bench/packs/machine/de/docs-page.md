# Fastq: Warteschlangen in Höchstgeschwindigkeit 🚀

**Schluss mit Engpässen. Willkommen bei Fastq.**

Fastq ist die schnelle, schlanke und zuverlässige In-Memory-Arbeitswarteschlange für Node.js. Sie kommt ohne Ballast aus und ist auf Performance ausgelegt, damit Ihre Anwendung auch unter Last souverän bleibt.

## Warum Fastq?

- **Blitzschnell:** Minimaler Overhead, maximaler Durchsatz.
- **Volle Kontrolle:** Legen Sie die Parallelität fest, und Fastq erledigt den Rest.
- **Flexibel:** Callbacks oder Promises, wie es Ihnen am besten passt.
- **Leichtgewichtig:** Keine überflüssigen Abhängigkeiten, nur das, was Sie brauchen.

## In 60 Sekunden startklar

```bash
npm install fastq
```

```js
const fastq = require('fastq')

// Worker-Funktion mit einer Parallelität von 2
const queue = fastq(worker, 2)

function worker (task, cb) {
  console.log('Verarbeite:', task)
  cb(null, 'fertig')
}

queue.push('Aufgabe 1', (err, result) => {
  if (err) throw err
  console.log(result)
})
```

## Mit Promises

```js
const queue = fastq.promise(worker, 2)

async function worker (task) {
  return task * 2
}

const result = await queue.push(21) // 42
```

## Volle Steuerung

| Methode | Wirkung |
|---|---|
| `push` | Aufgabe am Ende einreihen |
| `unshift` | Aufgabe mit Priorität vorne einreihen |
| `pause` / `resume` | Verarbeitung anhalten oder fortsetzen |
| `kill` | Warteschlange sofort leeren |
| `drain` | Wird aufgerufen, sobald alles erledigt ist |

## Bereit für mehr Tempo?

Integrieren Sie Fastq noch heute und erleben Sie, wie Ihre Aufgaben in Rekordzeit abgearbeitet werden. **Fastq: Weniger Warten, mehr Wirkung.** ⚡

---

Ich bin davon ausgegangen, dass Sie die Node.js-Bibliothek `fastq` meinen. Falls Sie das FASTQ-Dateiformat aus der Bioinformatik meinen, schreibe ich die Seite entsprechend um. Falls Sie sie als Datei im Verzeichnis brauchen, lege ich sie dort ab.
