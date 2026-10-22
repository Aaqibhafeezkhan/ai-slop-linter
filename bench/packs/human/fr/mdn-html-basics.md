<!--
Source: https://developer.mozilla.org/fr/docs/Learn/Getting_started_with_the_web/HTML_basics (fetched 21 Oct 2026)
Licence: CC BY-SA 2.5 or later, confirmed 21 Oct 2026 at https://developer.mozilla.org/fr/docs/MDN/Writing_guidelines/Attrib_copyright_license: "La réutilisation du contenu ici est publiée sous la même licence que le contenu original ... CC-BY-SA v2.5 ou toute version ultérieure." (the page has a dash where the dots are) (English page https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license: "Unless otherwise indicated, the content is available under the terms of the Creative Commons Attribution-ShareAlike license (CC-BY-SA), v2.5 or any later version.") Attribution: Mozilla Contributors; derived copies carry the same licence.
Extracted as plain text: paragraphs and headings kept, navigation and code removed. Otherwise not edited.
-->

Passer au contenu principal

Passer à la recherche

Cette page a été traduite à partir de l'anglais par la communauté. Vous pouvez contribuer en rejoignant la communauté francophone sur MDN Web Docs.

View in English Always switch to English

HTML : Créer le contenu

Aperçu : Votre premier site web


Qu'est-ce que HTML ?

HTML est un langage de balisage qui définit la structure du contenu. Un document HTML est une suite d'éléments utilisés pour encadrer (ou envelopper) le contenu textuel afin de définir sa structure et de lui faire adopter un certain comportement.

Prenons un exemple — le contenu suivant est affiché sur la même ligne lorsqu'il est affiché sur une page web, car il n'est pas structuré de quelque manière que ce soit :

Si nous enveloppons ce contenu avec les éléments HTML suivants, nous pouvons transformer cette seule ligne en un paragraphe () et trois puces () :

Ce code HTML s'affiche ainsi dans un navigateur web :

En plus de structurer du texte, HTML a de nombreux autres usages : faire en sorte que du texte ou des images mènent à d'autres pages web, intégrer des images ou des vidéos, créer des tableaux de données, etc.

Note : Les balises HTML sur Scrimba est une leçon interactive offrant une pratique des bases de HTML, y compris les titres.

Créer votre premier document HTML

Voyons comment les éléments individuels sont combinés pour former une page HTML. Dans cette section, vous allez créer un fichier HTML de base et examiner sa composition.

Dans votre dossier , créez un nouveau dossier nommé .

À l'intérieur de , créez un nouveau fichier appelé , et insérez-y le code suivant exactement comme indiqué :

Voici ce que nous avons :

: Le doctype est un préambule obligatoire. Aux débuts de HTML (vers 1991/92), les doctypes servaient de liens vers des ensembles de règles qu'une page HTML devait suivre pour être considérée comme correcte, ce qui pouvait permettre une vérification automatique des erreurs et d'autres fonctionnalités utiles. Aujourd'hui, ils ne servent plus à grand-chose et sont simplement nécessaires pour que votre document se comporte correctement. C'est tout ce que vous devez savoir pour l'instant.

: L'élément englobe tout le contenu de la page et est parfois appelé élément racine. Il inclut aussi l'attribut , qui définit la langue principale du document.

: L'élément sert de conteneur pour tout ce que vous souhaitez inclure dans la page HTML qui n'est pas du contenu affiché aux visiteur·euse·s. Cela inclut par exemple des mots-clés et une description de la page pour les résultats de recherche, du CSS pour la mise en forme, des déclarations d'encodage de caractères, etc.

: Cet élément définit l'encodage de caractères que votre document doit utiliser, à savoir UTF-8, qui inclut la plupart des caractères de la grande majorité des langues écrites. Il peut donc gérer tout contenu textuel que vous pouvez y placer. Il n'y a aucune raison de ne pas le définir, cela permet d'éviter certains problèmes plus tard.

: Cet élément viewport garantit que la page s'affiche à la largeur de la zone d'affichage du navigateur, empêchant les navigateurs mobiles d'afficher des pages plus larges que la zone d'affichage puis de les réduire.

: L'élément définit le titre de votre page, qui apparaît dans l'onglet du navigateur où la page est chargée. Il sert aussi à décrire la page lorsqu'on l'ajoute aux favoris.

: L'élément contient tout le contenu que vous souhaitez afficher aux utilisateur·ice·s web lorsqu'ils visitent votre page, qu'il s'agisse de texte, d'images, de vidéos, de jeux, de pistes audio, etc. Pour l'instant, il ne contient qu'un seul élément , mais nous ajouterons plus de contenu par la suite.

Note : La plupart des éléments HTML se composent d'une balise ouvrante (par exemple, ), suivie du contenu de l'élément, puis d'une balise fermante (par exemple, ). Certains éléments HTML possèdent aussi des attributs, qui contiennent des réglages ou des informations supplémentaires sur l'élément — voyez par exemple , et dans notre exemple de code.

Revenons sur l'élément :

Cela permet d'intégrer une image dans notre page à l'endroit où elle apparaît. Cela se fait avec l'attribut (source), qui contient le chemin vers le fichier image à intégrer.

Nous avons également inclus un attribut (alternatif). Dans l'attribut , vous indiquez un texte descriptif pour les personnes qui ne peuvent pas voir l'image, pour les raisons suivantes :

Elles sont en situation de handicap visuel. Les utilisateur·ice·s avec un handicap visuel important utilisent souvent des outils appelés lecteurs d'écran qui lisent le texte alternatif à voix haute.

Un problème empêche l'affichage de l'image. Si l'attribut ne contient pas un chemin valide vers une image, le texte alternatif est affiché à la place :


Note : Les éléments comme n'ont pas de contenu ni de balise fermante, on les appelle donc des éléments vides (ou void element). Ils sont parfois écrits avec une barre oblique finale à la fin de leur unique balise (), mais cela reste optionnel.

Affichons maintenant votre image.

Dans le dossier , créez un nouveau dossier appelé et placez-y l'image que vous avez choisie à l'étape précédente.

Dans la valeur de l'attribut de la balise , indiquez le chemin vers votre image. Elle se trouve dans un dossier appelé , qui est dans le même répertoire que votre fichier , donc le chemin est suivi du nom de votre image. Par exemple, si votre image s'appelle , votre attribut ressemble à ceci : .


Ouvrez votre fichier dans un navigateur web. Vous devez voir votre image s'afficher. Si ce n'est pas le cas, vérifiez votre élément avec notre code : assurez-vous qu'il ne manque aucune partie de la syntaxe, comme les guillemets. Vérifiez aussi que le nom du fichier image est correct.

Si l'image est très grande et ne rentre pas à l'écran, ne vous inquiétez pas. Nous corrigerons ce problème dans l'article suivant.

Note : Pour en savoir plus sur l'utilisation de l'attribut pour les images dans différentes situations, consultez notre tutoriel sur l'accessibilité des contenus multimédias et l'arbre de décision pour l'attribut alt .

Cette section décrit certains des éléments HTML essentiels pour baliser et structurer le texte d'un document.

Note : Le parcours Scrimba Les bases du langage HTML sémantique de Scrimba est une leçon interactive qui fournit une description utile de HTML, en insistant particulièrement sur l'importance de l'aspect sémantique.

Les éléments de titre permettent d'indiquer les parties du contenu qui sont des titres ou des sous-titres. De la même façon qu'un livre peut avoir un titre principal, des titres de chapitre, des sous-titres, un document HTML peut en avoir également. HTML contient 6 niveaux de titre <h1>-<h6>, même si on en utilise généralement 3 à 4 au plus :

Note : En HTML, tout ce qui est écrit entre et est un commentaire HTML. Le navigateur ignore les commentaires lorsqu'il affiche le document. Autrement dit, ce qui est écrit en commentaire est uniquement visible dans le code et pas sur la page. Les commentaires permettent d'ajouter des notes utiles à propos du code ou de la logique.

Essayez maintenant d'ajouter un titre pertinent à votre page HTML avant l'élément . Sauvegardez le fichier et observez le dans un navigateur pour voir l'effet.

Les éléments servent à contenir des paragraphes de texte ; vous les utilisez fréquemment pour baliser le contenu textuel ordinaire :

Ajoutez votre texte d'exemple du précédent chapitre dans un ou plusieurs paragraphes, placés juste en dessous de votre élément . Enregistrez et affichez votre page dans un navigateur.

Une bonne partie du contenu web prend la forme de listes. HTML possède des éléments dédiés. Baliser une liste se fait toujours avec au moins deux éléments. Les types de liste les plus fréquemment utilisés sont les listes ordonnées et les listes non-ordonnées :

Listes non ordonnées : utilisées pour les listes où l'ordre des éléments n'a pas d'importance, comme une liste de courses. Celles-ci sont enveloppées dans un élément .

Listes ordonnées : utilisées pour les listes où l'ordre des éléments a de l'importance, comme une liste d'instructions de cuisine dans une recette. Celles-ci sont enveloppées dans un élément .

Chaque élément d'une liste est placé dans un élément .

Ainsi, si on veut qu'une partie de notre paragraphe devienne une liste, à la place de :

On peut écrire :

Essayez d'ajouter une liste ordonnée ou non-ordonnée à votre page d'exemple.



Entourez-le avec les balises ouvrantes et fermantes d'un élément comme suit :

Ajoutez un attribut à l'élément :

Renseignez la valeur de cet attribut avec l'adresse web vers laquelle vous voulez créer le lien :

Attention, vous pouvez obtenir des résultats inattendus si vous omettez la partie ou , qui indique le protocole, au début de l'adresse. Après avoir créé un lien, cliquez dessus pour vous assurer qu'il pointe à l'endroit voulu.


Ajoutez un lien à votre page si ça n'est pas déjà fait.

Si vous avez suivi l'ensemble des instructions de cet article, vous devez obtenir une page qui ressemble à celle-ci (vous pouvez aussi la voir ici ) :

Si vous coincez, vous pouvez toujours comparer votre travail avec le code de notre exemple finalisé sur GitHub .

Nous n'avons fait qu'effleurer la surface de HTML. Vous en apprendrez beaucoup plus dans notre module principal Structurer le contenu avec HTML plus loin dans le cours.

Le cours Apprendre HTML et CSS de Scrimba vous enseigne HTML et CSS à travers la création et la mise en ligne de cinq projets concrets, avec des leçons interactives et des défis ludiques animés par des formateur·ice·s expérimenté·e·s.

Aperçu : Votre premier site web

Aider à améliorer MDN

Cette page a été modifiée le 16 juin 2026 par les contributeur·ice·s du MDN.
