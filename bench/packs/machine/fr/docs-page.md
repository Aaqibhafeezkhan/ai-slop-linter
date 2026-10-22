# Fastq : la file de tâches qui change tout 🚀

**Libérez la puissance de votre concurrence, sans compromis.**

Vos tâches asynchrones s'empilent et votre application ralentit ? Découvrez **Fastq**, la file de travail en mémoire ultra-rapide pour Node.js. Légère et redoutablement efficace, elle est conçue pour les développeurs qui exigent le meilleur.

## Pourquoi choisir Fastq ?

- ⚡ **Performances exceptionnelles** : un minimum de surcharge et un maximum de débit.
- 🎛️ **Concurrence maîtrisée** : fixez le nombre de tâches simultanées en une seule ligne.
- 🔄 **Callbacks *et* Promises** : choisissez le style qui vous ressemble.
- 🪶 **Zéro superflu** : une API simple et une empreinte minimale.

## Démarrage en 30 secondes

```bash
npm install fastq
```

```js
const fastq = require('fastq')

function worker (arg, cb) {
  cb(null, arg * 2)
}

const queue = fastq(worker, 4) // 4 tâches en parallèle

queue.push(42, (err, result) => {
  if (err) throw err
  console.log(result) // 84
})
```

## Un contrôle total

Gardez la main à chaque instant :

- `push()` pour ajouter une tâche en fin de file
- `unshift()` pour passer une tâche en priorité
- `pause()` / `resume()` pour suspendre et reprendre le traitement
- `drain` pour réagir quand la file est vide

## Prêt pour la production

Fastq s'intègre naturellement à vos API, vos traitements par lots et vos pipelines de données. Que vous gériez dix tâches ou dix millions, elle reste rapide et fiable.

## Rejoignez la communauté

Installez Fastq dès aujourd'hui et donnez à votre code la vitesse qu'il mérite.

**👉 Lancez-vous maintenant et passez à la vitesse supérieure !**
