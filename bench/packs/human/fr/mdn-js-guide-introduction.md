<!--
Source: https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Introduction (fetched 21 Oct 2026)
Licence: CC BY-SA 2.5 or later, confirmed 21 Oct 2026 at https://developer.mozilla.org/fr/docs/MDN/Writing_guidelines/Attrib_copyright_license: "La réutilisation du contenu ici est publiée sous la même licence que le contenu original ... CC-BY-SA v2.5 ou toute version ultérieure." (the page has a dash where the dots are) (English page https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license: "Unless otherwise indicated, the content is available under the terms of the Creative Commons Attribution-ShareAlike license (CC-BY-SA), v2.5 or any later version.") Attribution: Mozilla Contributors; derived copies carry the same licence.
Extracted as plain text: paragraphs and headings kept, navigation and code removed. Otherwise not edited.
-->

Passer au contenu principal

Passer à la recherche

Cette page a été traduite à partir de l'anglais par la communauté. Vous pouvez contribuer en rejoignant la communauté francophone sur MDN Web Docs.

View in English Always switch to English

Ce chapitre introduit JavaScript et présente certains de ses concepts fondamentaux.

Ce que vous devez déjà savoir

Pour lire ce guide, il est conseillé d'avoir :

Une compréhension générale du fonctionnement d'Internet et du World Wide Web.

Une connaissance élémentaire du HyperText Markup Language (HTML).

Une expérience préalable en programmation. Si vous débutez la programmation, vous pouvez utiliser l'un des tutoriels listés sur la page JavaScript.

Où trouver des informations concernant JavaScript

La documentation MDN pour JavaScript comprend :

Apprendre le Web : cette section fournit des informations destinées aux débutants et présente les concepts de bases autour de la programmation et d'Internet.

Le guide JavaScript (ce guide) fournit un aperçu du langage JavaScript et de ses objets.

La référence JavaScript fournit une référence détaillée sur les fonctionnalités de JavaScript.

Qu'est-ce que JavaScript ?

JavaScript est un langage de script, multi-plateforme et orienté objet. C'est un langage léger qui doit faire partie d'un environnement hôte (un navigateur web par exemple) pour qu'il puisse être utilisé sur les objets de cet environnement.

JavaScript contient une bibliothèque standard d'objets tels que , , et , ainsi qu'un ensemble d'éléments de langage tels que les opérateurs, les structures de contrôles et les instructions. Ces fonctionnalités centrales et natives de JavaScript peuvent être étendues de plusieurs façons en fournissant d'autres objets, par exemple :

JavaScript côté client étend ces éléments de base en fournissant des objets pour contrôler le navigateur et le Document Object Model (DOM). Par exemple, les extensions du langage côté client permettent de placer des éléments dans un formulaire HTML, de réagir aux évènements déclenchés par l'utilisateur·ice (les clics, la saisie d'un formulaire, les actions de navigation, etc.).

JavaScript côte serveur étend ces éléments de base avec des objets utiles pour le fonctionnement sur un serveur tels que la possibilité de communiquer avec une base de données, manipuler des fichiers, passer d'une application à une autre, etc.

Cela signifie que, dans le navigateur, JavaScript peut modifier l'apparence de la page web (DOM). De même, JavaScript Node.js côté serveur peut répondre à des requêtes personnalisées envoyées par du code exécuté dans le navigateur.

JavaScript et Java se ressemblent sur certains aspects, mais ils sont fondamentalement différents l'un de l'autre. Le langage JavaScript ressemble à Java, mais n'est pas typé statiquement et le typage de JavaScript est faible (alors qu'il est fort en Java). La syntaxe des expressions JavaScript est très proche de celle du Java avec les conventions de nommage et les constructions conditionnelles par exemple : c'est une des raisons qui a fait que le langage LiveScript a été renommé en JavaScript.

À la différence de Java qui est un système compilé et dont les classes sont déclarées, JavaScript est traité lors de l'exécution et possède quelques types de données pour représenter les nombres, les booléens et les chaînes de caractères (entre autres). JavaScript utilise un modèle basé sur les prototypes pour représenter les liens entre les objets alors que Java utilise un modèle plus courant basé sur les classes. Les prototypes permettent d'avoir un héritage dynamique. Ainsi, les caractéristiques héritées par un objet peuvent varier dans le temps. JavaScript supporte également les fonctions qui sont des objets à part entière et qui peuvent être des propriétés d'autres objets.


Java est un langage de programmation utilisant les classes, conçus pour être exécuté rapidement et garantir la sûreté du typage. Cela signifie par exemple qu'il n'est pas possible de transformer un entier Java en un objet ou qu'on ne peut pas accéder à des caractéristiques privées en corrompant le bytecode Java. Le modèle de classes utilisé par Java signifie qu'un programme n'est constitué que de classes et de méthodes. Cet héritage à base de classes, associé au typage fort font qu'on obtient des structures et des hiérarchies d'objets fortement couplées. Pour ces raisons, Java peut apparaître comme un langage plus complexe que JavaScript.

À l'inverse, JavaScript est un descendant de langages plus légers, dynamiquement typés tels que HyperTalk et dBASE. Ces langages de scripts visent un public plus large avec une syntaxe plus simple, des fonctionnalités natives spécialisées et des prérequis minimaux pour pouvoir créer des objets.

JavaScript et la spécification ECMAScript

JavaScript est standardisé par Ecma International — une association européenne de standardisation des systèmes d'information et de communication (ECMA étant historiquement un acronyme pour European Computer Manufacturers Association) qui délivre un langage de programmation standardisé, international appelé ECMAScript. Ce langage se comporte de la même façon pour toutes les applications qui supportent ce standard. Les entreprises peuvent utiliser ce langage standard afin de développer leur implémentation de JavaScript. Le standard ECMAScript est documenté avec la spécification ECMA-262.

Le standard ECMA-262 est également approuvé par l'ISO (International Organization for Standardization) sous ISO-16262. La spécification peut également être trouvée sur le site web d'Ecma International . La spécification ECMAScript ne décrit pas le Document Object Model (DOM) qui est standardisé par le World Wide Web Consortium (W3C) et le WHATWG (Web Hypertext Application Technology Working Group) . Le DOM définit la façon dont les documents HTML sont exposés aux scripts. Pour mieux comprendre les différentes technologies gravitant autour de JavaScript, voir l'article Aperçu des technologies JavaScript.

Documentation JavaScript et spécification ECMAScript

La spécification ECMAScript est un ensemble de conditions à respecter pour implémenter ECMAScript : cela est utile lorsqu'on souhaite implémenter des fonctionnalités standard du langage au sein d'une implémentation ou d'un moteur ECMAScript (tel que SpiderMonkey pour Firefox, ou V8 pour Chrome).

La spécification ECMAScript n'a pas pour but d'aider les développeur·euse·s à écrire des scripts. La documentation JavaScript permet d'obtenir des informations pour écrire des scripts JavaScript.

La spécification ECMAScript utilise parfois une terminologie et une syntaxe qui peuvent sembler étranges aux yeux d'un développeur·euse JavaScript. Bien que la description du langage diffère entre ECMAScript et la documentation JavaScript, le langage lui-même reste le même. JavaScript supporte l'ensemble des fonctionnalités mises en avant dans la spécification ECMAScript.

La documentation JavaScript décrit les aspects du langage qui peuvent être utilisés par les développeur·euse·s JavaScript.

Pour commencer à utiliser JavaScript, il suffit d'avoir un navigateur web moderne. Les versions récentes de Firefox, Chrome, Microsoft Edge et Safari prennent toutes en charge les fonctionnalités abordées dans ce guide.

Un outil très utile pour explorer JavaScript est la console JavaScript (parfois appelée console web, ou simplement console) : il s'agit d'un outil qui permet de saisir du JavaScript et de l'exécuter dans la page courante.

Les captures d'écran ici montrent la console web de Firefox , mais tous les navigateurs modernes sont livrés avec une console qui fonctionne de manière similaire.

Ouvrir la console web

Les instructions exactes pour ouvrir la console varient selon le navigateur :

Ouvrir la console dans Firefox

Ouvrir la console dans Chrome

Ouvrir la console dans Microsoft Edge

Saisir et exécuter du JavaScript

La console apparaît en bas de la fenêtre du navigateur. Le long du bas de la console se trouve une ligne de saisie que vous pouvez utiliser pour entrer du JavaScript, et la sortie apparaît dans le panneau au-dessus :

La console fonctionne exactement comme : la dernière expression saisie est retournée. Pour simplifier, on peut imaginer qu'à chaque fois que quelque chose est saisi dans la console, cela est en fait entouré par autour de , comme ceci :

Le mode éditeur multi-ligne

Par défaut, si vous appuyez sur Entrée (ou Retour, selon votre clavier) après avoir saisi une chaîne de caractères (string en anglais) de code, celle-ci est exécutée. Pour saisir plusieurs lignes :

Si la chaîne de caractères que vous avez tapée est incomplète (par exemple, vous avez saisi ), la console considère Entrée comme un saut de ligne et vous permet de saisir une autre ligne.

Si vous maintenez Maj enfoncée tout en appuyant sur Entrée, la console considère cela comme un saut de ligne et vous permet de saisir une autre ligne.

Uniquement dans Firefox, vous pouvez activer le mode éditeur multi-ligne , dans lequel vous pouvez saisir plusieurs lignes dans un mini-éditeur, puis exécuter l'ensemble lorsque vous êtes prêt·e.

Pour commencer à écrire du JavaScript, ouvrez la console, copiez le code suivant et collez-le à l'invite :

Appuyez sur Entrée pour voir le résultat dans votre navigateur !

Dans les pages suivantes, ce guide vous présente la syntaxe de JavaScript et les fonctionnalités du langage, afin que vous puissiez écrire des applications plus complexes.

Mais pour l'instant, souvenez-vous d'inclure toujours avant votre code, et d'ajouter à la fin de votre code. Les articles sur le mode strict et sur les IIFE expliquent ce que cela fait, mais pour l'instant, on peut considérer que cela permet :

D'éviter des comportements de JavaScript qui piègent les débutant·e·s.

D'empêcher que des extraits de code exécutés dans la console n'interagissent entre eux (par exemple, qu'un élément créé lors d'une exécution soit utilisé lors d'une autre exécution).

Aider à améliorer MDN

Cette page a été modifiée le 4 sept. 2026 par les contributeur·ice·s du MDN.
