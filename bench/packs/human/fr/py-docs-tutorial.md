<!--
Source: https://docs.python.org/fr/3/tutorial/introduction.html (Python 3.15.0 documentation, page last updated 21 Oct 2026; fetched 21 Oct 2026)
Licence: PSF License Version 2, confirmed 21 Oct 2026 on the page's own licence page https://docs.python.org/fr/3/license.html: "Le logiciel Python et sa documentation sont distribués sous la licence Python Software Foundation License Version 2." (English original, https://docs.python.org/3/license.html: "Python software and documentation are licensed under the Python Software Foundation License Version 2.") Translators grant their work to the PSF under CC0 (python-docs-fr README.rst, https://github.com/python/python-docs-fr/blob/3.15/README.rst). Copyright Python Software Foundation and the translators; the PSF licence notice must stay with any copy.
Extracted as plain text: paragraphs and headings kept, navigation and code removed. Otherwise not edited.
-->

3. Introduction informelle à Python


3. Introduction informelle à Python

Dans les exemples qui suivent, les entrées et sorties se distinguent par la présence ou l'absence d'invite (>>> et ...) : pour reproduire les exemples, vous devez taper tout ce qui est après l'invite, au moment où celle-ci apparaît ; les lignes qui n'affichent pas d'invite sont les sorties de l'interpréteur. Notez qu'une invite secondaire affichée seule sur une ligne dans un exemple indique que vous devez entrer une ligne vide ; ceci est utilisé pour terminer une commande multi-lignes.

You can use the "Copy" button (it appears in the upper-right corner when hovering over or tapping a code example), which strips prompts and omits output, to copy and paste the input lines into your interpreter.

Beaucoup d'exemples de ce manuel, même ceux saisis à l'invite de l'interpréteur, incluent des commentaires. Les commentaires en Python commencent avec un caractère croisillon, , et s'étendent jusqu'à la fin de la ligne. Un commentaire peut apparaître au début d'une ligne ou à la suite d'un espace ou de code, mais pas à l'intérieur d'une chaîne de caractères littérale. Un caractère croisillon à l'intérieur d'une chaîne de caractères est juste un caractère croisillon. Comme les commentaires ne servent qu'à expliquer le code et ne sont pas interprétés par Python, ils peuvent être ignorés lorsque vous tapez les exemples.

3.1. Utilisation de Python comme une calculatrice

Essayons quelques commandes Python simples. Démarrez l'interpréteur et attendez l'invite primaire, . Ça ne devrait pas être long.

The interpreter acts as a simple calculator: you can type an expression into it and it will write the value. Expression syntax is straightforward: the operators , , and can be used to perform arithmetic; parentheses () can be used for grouping. For example:

Les nombres entiers (comme , , ) sont de type , alors que les décimaux (comme , ) sont de type . Vous trouvez plus de détails sur les types numériques plus loin dans ce tutoriel.

Les divisions () donnent toujours des . Utilisez l'opérateur pour effectuer une division entière et donc obtenir un résultat entier. Pour obtenir le reste d'une division entière, utilisez l'opérateur :

En Python, il est possible de calculer des puissances avec l'opérateur [1] :

Le signe égal () est utilisé pour affecter une valeur à une variable. Dans ce cas, aucun résultat n'est affiché avant l'invite suivante :


Les nombres à virgule flottante sont tout à fait admis (NdT : Python utilise le point . comme séparateur entre la partie entière et la partie décimale des nombres, c'est la convention anglo-saxonne) ; les opérateurs avec des opérandes de types différents convertissent l'opérande de type entier en type virgule flottante :

En mode interactif, la dernière expression affichée est affectée à la variable . Ainsi, lorsque vous utilisez Python comme calculatrice, cela vous permet de continuer des calculs facilement, par exemple :

Cette variable doit être considérée comme une variable en lecture seule par l'utilisateur. Ne lui affectez pas de valeur explicitement — vous créeriez ainsi une variable locale indépendante, avec le même nom, qui masquerait la variable native et son fonctionnement magique.

En plus des et des , il existe les et les . Python gère aussi les nombres complexes, en utilisant le suffixe ou pour indiquer la partie imaginaire (tel que ).

Python can manipulate text (represented by type , so-called "strings") as well as numbers. This includes characters "", words "", names "", sentences "", etc. "". They can be enclosed in single quotes () or double quotes () with the same result [2].

To quote a quote, we need to "escape" it, by preceding it with . Alternatively, we can use the other type of quotation marks:

In the Python shell, the string definition and output string can look different. The function produces a more readable output, by omitting the enclosing quotes and by printing escaped and special characters:

Si vous ne voulez pas que les caractères précédés d'un soient interprétés comme étant spéciaux, utilisez les chaînes brutes (raw strings en anglais) en préfixant la chaîne d'un :

Il existe une petite subtilité concernant les chaînes brutes : une chaîne brute ne peut pas se terminer par un nombre impair de caractères ; voir l'entrée FAQ pour plus d'informations et des solutions de contournement.

String literals can span multiple lines. One way is using triple-quotes: or . End-of-line characters are automatically included in the string, but it's possible to prevent this by adding a at the end of the line. In the following example, the initial newline is not included:

Les chaînes peuvent être concaténées (collées ensemble) avec l'opérateur et répétées avec l'opérateur :

Plusieurs chaînes de caractères, écrites littéralement (c'est-à-dire entre guillemets), côte à côte, sont automatiquement concaténées.

Cette fonctionnalité est surtout intéressante pour couper des chaînes trop longues :

Cela ne fonctionne cependant qu'avec les chaînes littérales, pas avec les variables ni les expressions :

Pour concaténer des variables, ou des variables avec des chaînes littérales, utilisez l'opérateur :

Les chaînes de caractères peuvent être indexées (ou indicées, c'est-à-dire que l'on peut accéder aux caractères par leur position), le premier caractère d'une chaîne étant à la position 0. Il n'existe pas de type distinct pour les caractères, un caractère est simplement une chaîne de longueur 1 :

Les indices peuvent également être négatifs, on compte alors en partant de la droite. Par exemple :

Notez que, comme égale , les indices négatifs commencent par .


Les valeurs par défaut des indices de tranches ont une utilité ; le premier indice vaut zéro par défaut (c.-à-d. lorsqu'il est omis), le deuxième correspond par défaut à la taille de la chaîne de caractères

Notez que le début est toujours inclus et la fin toujours exclue. Cela assure que est toujours égal à :

Pour mémoriser la façon dont les tranches fonctionnent, vous pouvez imaginer que les indices pointent entre les caractères, le côté gauche du premier caractère ayant la position 0. Le côté droit du dernier caractère d'une chaîne de n caractères a alors pour indice n. Par exemple :

La première ligne de nombres donne la position des indices 0…6 dans la chaîne ; la deuxième ligne donne l'indice négatif correspondant. La tranche de i à j est constituée de tous les caractères situés entre les bords libellés i et j, respectivement.

Pour des indices non négatifs, la longueur d'une tranche est la différence entre ces indices, si les deux sont entre les bornes. Par exemple, la longueur de est 2.

Utiliser un indice trop grand produit une erreur :

Cependant, les indices hors bornes sont gérés silencieusement lorsqu'ils sont utilisés dans des tranches :

Les chaînes de caractères, en Python, ne peuvent pas être modifiées. On dit qu'elles sont immuables. Affecter une nouvelle valeur à un indice dans une chaîne produit une erreur :

Si vous avez besoin d'une chaîne différente, vous devez en créer une nouvelle :

La fonction native renvoie la longueur d'une chaîne :

Les chaînes de caractères sont des exemples de types séquences ; elles acceptent donc les opérations classiques prises en charge par ces types.

Les chaînes de caractères gèrent un large éventail de méthodes de transformations basiques et de recherche.

Des chaînes littérales qui contiennent des expressions.

Informations sur le formatage des chaînes avec la méthode .

Description détaillée des anciennes méthodes de mise en forme, appelées lorsque les chaînes de caractères sont à gauche de l'opérateur .

Python connaît différents types de données combinés, utilisés pour regrouper plusieurs valeurs. Le plus souple est la liste, qui peut être écrit comme une suite, placée entre crochets, de valeurs (éléments) séparées par des virgules. Les éléments d'une liste ne sont pas obligatoirement tous du même type, bien qu'à l'usage ce soit souvent le cas.

Comme les chaînes de caractères (et toute autre type de sequence), les listes peuvent être indicées et découpées :

Les listes gèrent aussi les opérations comme les concaténations :

Mais à la différence des chaînes qui sont immuables, les listes sont mutables : il est possible de modifier leur contenu :

You can also add new items at the end of the list, by using the method (we will see more about methods later):

Simple assignment in Python never copies data. When you assign a list to a variable, the variable refers to the existing list. Any changes you make to the list through one variable will be seen through all other variables that refer to it.:

Toutes les opérations par tranches renvoient une nouvelle liste contenant les éléments demandés. Cela signifie que l'opération suivante renvoie une copie (superficielle) de la liste :

Des affectations de tranches sont également possibles, ce qui peut même modifier la taille de la liste ou la vider complètement :

La primitive s'applique aussi aux listes :

Il est possible d'imbriquer des listes (c.-à-d. créer des listes contenant d'autres listes). Par exemple :

3.2. Premiers pas vers la programmation

Bien entendu, on peut utiliser Python pour des tâches plus compliquées que d'additionner deux et deux. Par exemple, on peut écrire le début de la suite de Fibonacci comme ceci :

Cet exemple introduit plusieurs nouvelles fonctionnalités.

La première ligne contient une affectation multiple : les variables et se voient affecter simultanément leurs nouvelles valeurs 0 et 1. Cette méthode est encore utilisée à la dernière ligne, pour démontrer que les expressions sur la partie droite de l'affectation sont toutes évaluées avant que les affectations ne soient effectuées. Ces expressions en partie droite sont toujours évaluées de la gauche vers la droite.

La boucle s'exécute tant que la condition (ici : ) reste vraie. En Python, comme en C, tout entier différent de zéro est vrai et zéro est faux. La condition peut aussi être une chaîne de caractères, une liste, ou en fait toute séquence ; une séquence avec une valeur non nulle est vraie, une séquence vide est fausse. Le test utilisé dans l'exemple est une simple comparaison. Les opérateurs de comparaison standards sont écrits comme en C : (inférieur), (supérieur), (égal), (inférieur ou égal), (supérieur ou égal) et (non égal).

Le corps de la boucle est indenté : l'indentation est la méthode utilisée par Python pour regrouper des instructions. En mode interactif, vous devez saisir une tabulation ou des espaces pour chaque ligne indentée. En pratique, vous aurez intérêt à utiliser un éditeur de texte pour les saisies plus compliquées ; tous les éditeurs de texte dignes de ce nom disposent d'une fonction d'auto-indentation. Lorsqu'une expression composée est saisie en mode interactif, elle doit être suivie d'une ligne vide pour indiquer qu'elle est terminée (car l'analyseur ne peut pas deviner que vous venez de saisir la dernière ligne). Notez bien que toutes les lignes à l'intérieur d'un bloc doivent être indentées au même niveau.

La fonction écrit les valeurs des paramètres qui lui sont fournis. Ce n'est pas la même chose que d'écrire l'expression que vous voulez afficher (comme nous l'avons fait dans l'exemple de la calculatrice), en raison de la manière qu'a de gérer les paramètres multiples, les nombres décimaux et les chaînes. Les chaînes sont affichées sans apostrophe et une espace est insérée entre les éléments de telle sorte que vous pouvez facilement formater les choses, comme ceci :

Le paramètre nommé end peut servir pour enlever le retour à la ligne ou pour terminer la ligne par une autre chaîne :

3. Introduction informelle à Python

3.1. Utilisation de Python comme une calculatrice

3.2. Premiers pas vers la programmation

2. Mode d'emploi de l'interpréteur Python

4. D'autres outils de contrôle de flux


3. Introduction informelle à Python
