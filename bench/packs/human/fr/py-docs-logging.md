<!--
Source: https://docs.python.org/fr/3/howto/logging.html (Python 3.15.0 documentation; fetched 21 Oct 2026)
Licence: PSF License Version 2, confirmed 21 Oct 2026 on the page's own licence page https://docs.python.org/fr/3/license.html: "Le logiciel Python et sa documentation sont distribués sous la licence Python Software Foundation License Version 2." (English original, https://docs.python.org/3/license.html: "Python software and documentation are licensed under the Python Software Foundation License Version 2.") Translators grant their work to the PSF under CC0 (python-docs-fr README.rst, https://github.com/python/python-docs-fr/blob/3.15/README.rst). Copyright Python Software Foundation and the translators; the PSF licence notice must stay with any copy.
Extracted as plain text: paragraphs and headings kept, navigation and code removed. Otherwise not edited.
-->

Tutoriel sur la journalisation


Tutoriel sur la journalisation

This page contains tutorial information. For links to reference information and a logging cookbook, please see Autres ressources.

Les bases de l'utilisation du module

La journalisation (logging en anglais) est une façon de suivre les événements qui ont lieu durant le fonctionnement d'un logiciel. Le développeur du logiciel ajoute des appels à l'outil de journalisation dans son code pour indiquer que certains événements ont eu lieu. Un événement est décrit par un message descriptif, qui peut éventuellement contenir des données variables (c'est-à-dire qui peuvent être différentes pour chaque occurrence de l'événement). Un événement a aussi une importance que le développeur lui attribue ; cette importance peut aussi être appelée niveau ou sévérité.

You can access logging functionality by creating a logger via , and then calling the logger's , , , and methods. To determine when to use logging, and to see which logger methods to use when, see the table below. It states, for each of a set of common tasks, the best tool to use for that task.

The logger methods are named after the level or severity of the events they are used to track. The standard levels and their applicability are described below (in increasing order of severity):

The default level is , which means that only events of this severity and higher will be tracked, unless the logging package is configured to do otherwise.

Les évènements suivis peuvent être gérés de différentes façons. La manière la plus simple est de les afficher dans la console. Une autre méthode commune est de les écrire dans un fichier.

Un exemple très simple est :

Si vous entrez ces lignes dans un script que vous exécutez, vous verrez :

printed out on the console. The message doesn't appear because the default level is . The printed message includes the indication of the level and the description of the event provided in the logging call, i.e. 'Watch out!'. The actual output can be formatted quite flexibly if you need that; formatting options will also be explained later.

Notice that in this example, we use functions directly on the module, like , rather than creating a logger and calling functions on it. These functions operate on the root logger, but can be useful as they will call for you if it has not been called yet, like in this example. In larger programs you'll usually want to control the logging configuration explicitly however - so for that reason as well as others, it's better to create loggers and call their methods.

Enregistrer les évènements dans un fichier

Il est très commun d'enregistrer les évènements dans un fichier, c'est donc ce que nous allons regarder maintenant. Il faut essayer ce qui suit avec un interpréteur Python nouvellement démarré, ne poursuivez pas la session commencée ci-dessus :

Modifié dans la version 3.9: L'argument encoding a été rajouté. Dans les versions précédentes de Python, ou si non spécifié, l'encodage utilisé est la valeur par défaut utilisée par . Bien que non montré dans l'exemple ci-dessus, un argument errors peut aussi être passé, qui détermine comment les erreurs d'encodage sont gérées. Pour voir les valeurs disponibles et par défaut, consultez la documentation de .

Maintenant, si nous ouvrons le fichier et lisons ce qui s'y trouve, nous trouvons les messages de journalisation :

Cet exemple montre aussi comment on peut régler le niveau de journalisation qui sert de seuil pour le suivi. Dans ce cas, comme nous avons réglé le seuil à , tous les messages ont été écrits.

Si vous souhaitez régler le niveau de journalisation à partir d'une option de la ligne de commande comme :

et que vous passez ensuite la valeur du paramètre donné à l'option dans une variable loglevel, vous pouvez utiliser :

de manière à obtenir la valeur à passer à à travers l'argument level. Vous pouvez vérifier que l'utilisateur n'a fait aucune erreur pour la valeur de ce paramètre, comme dans l'exemple ci-dessous :

The call to should come before any calls to a logger's methods such as , , etc. Otherwise, that logging event may not be handled in the desired manner.

Si vous exécutez le script plusieurs fois, les messages des exécutions successives sont ajoutés au fichier example.log. Si vous voulez que chaque exécution reprenne un fichier vierge, sans conserver les messages des exécutions précédentes, vous pouvez spécifier l'argument filemode, en changeant l'appel à l'exemple précédent par :

La sortie est identique à la précédente, mais le texte n'est plus ajouté au fichier de log, donc les messages des exécutions précédentes sont perdus.

Journalisation de données variables

Pour enregistrer des données variables, utilisez une chaîne formatée dans le message de description de l'évènement et ajoutez les données variables comme argument. Par exemple :

Comme vous pouvez le voir, l'inclusion des données variables dans le message de description de l'évènement emploie le vieux style de formatage avec %. C'est pour assurer la rétrocompatibilité : le module est antérieur aux nouvelles options de formatage comme ou . Ces nouvelles options de formatage sont gérées, mais leur exploration sort du cadre de ce tutoriel, voyez Using particular formatting styles throughout your application pour plus d'information.

Modifier le format du message affiché

Pour changer le format utilisé pour afficher le message, vous devez préciser le format que vous souhaitez employer :

ce qui affiche :

Notez que le qui apparaissait dans les exemples précédents a disparu. Pour voir l'ensemble des éléments qui peuvent apparaître dans la chaîne de format, référez-vous à la documentation pour LogRecord attributes. Pour une utilisation simple, vous avez seulement besoin du levelname (la sévérité), du message (la description de l'évènement, avec les données variables) et peut-être du moment auquel l'évènement a eu lieu. Nous décrivons ces points dans la prochaine section.

Afficher l'horodatage dans les messages

Pour afficher la date ou le temps d'un évènement, ajoutez dans votre chaîne de formatage :

ce qui affichera quelque chose comme :

Le format par défaut de l'horodatage (comme ci-dessus) est donné par la norme ISO8601 ou RFC 3339. Pour plus de contrôle sur le formatage de l'horodatage, vous pouvez fournir à un argument datefmt, comme dans l'exemple suivant :

ce qui affichera quelque chose comme :

Le format de datefmt est le même que celui de .

Nous concluons ainsi le tutoriel basique. Il devrait suffire à vous mettre le pied à l'étrier pour utiliser . Le module a beaucoup d'autre cordes à son arc, mais pour en profiter au maximum, vous devez prendre le temps de lire les sections suivantes. Si vous êtes prêt, servez-vous votre boisson préférée et poursuivons.

If your logging needs are simple, then use the above examples to incorporate logging into your own scripts, and if you run into problems or don't understand something, please post a question in the Help category of the Python discussion forum and you should receive help before too long.

Vous êtes encore là ? Vous pouvez lire les prochaines sections, qui donnent un peu plus de détails que l'introduction ci-dessus. Après ça, vous pouvez jeter un œil à Recettes pour la journalisation.

Usage avancé de Logging

La bibliothèque de journalisation adopte une approche modulaire et offre différentes catégories de composants : loggers, handlers, filters et formatters.

Les enregistreurs (loggers en anglais) exposent l'interface que le code de l'application utilise directement.

Les gestionnaires (handlers) envoient les entrées de journal (créés par les loggers) vers les destinations voulues.

Les filtres (filters) fournissent un moyen de choisir finement quelles entrées de journal doivent être sorties.

Les formateurs (formatters) spécifient la structure de l'entrée de journal dans la sortie finale.

L'information relative à un événement est passée entre loggers, handlers et formatters dans une instance de la classe .

La journalisation est réalisée en appelant les méthodes d'instance de la classe (que l'on appelle ci-dessous loggers). Chaque instance a un nom et les instances sont organisées conceptuellement comme des hiérarchies dans l'espace de nommage, en utilisant un point comme séparateur. Par exemple, un logger appelé est le parent des loggers , et . Les noms des loggers peuvent être ce que vous voulez et indiquent le sous-domaine d'une application depuis lequel le message enregistré a été émis.

Une bonne convention lorsqu'on nomme les loggers est d'utiliser un logger au niveau du module, dans chaque module qui emploie , nommé de la façon suivante :

Cela signifie que le nom d'un logger se rapporte à la hiérarchie du paquet et des modules, et il est évident de voir où un événement a été enregistré simplement en regardant le nom du logger.


Il est bien sûr possible d'enregistrer des messages pour des destinations différentes. Ce paquet permet d'écrire des entrées de journal dans des fichiers, des ressources HTTP GET/POST, par courriel via SMTP, des connecteurs (socket en anglais) génériques, des files d'attente, ou des mécanismes d'enregistrement spécifiques au système d'exploitation, comme syslog ou le journal d'événements de Windows NT. Les destinations sont servies par des classes handler. Vous pouvez créer votre propre classe de destination si vous avez des besoins spéciaux qui ne sont couverts par aucune classe handler prédéfinie.

Par défaut, aucune destination n'est prédéfinie pour les messages de journalisation. Vous pouvez définir une destination (comme la console ou un fichier) en utilisant comme dans les exemples donnés dans le tutoriel. Si vous appelez les fonctions , , , et , celles-ci vérifient si une destination a été définie ; si ce n'est pas le cas, la destination est assignée à la console () avec un format par défaut pour le message affiché, avant d'être déléguée au logger racine, qui sort le message.

Le format par défaut des messages est défini par comme suit :

Vous pouvez modifier ce comportement en passant une chaîne de formatage à par l'argument nommé format. Consultez Formateurs pour toutes les options de construction de cette chaîne de formatage.

Flux du processus de journalisation

Le flux des informations associées à un évènement dans les loggers et les handlers est illustré dans le diagramme suivant.

Les objets de classe ont un rôle triple. Premièrement, ils exposent plusieurs méthodes au code de l'application, de manière à ce qu'elle puisse enregistrer des messages en cours d'exécution. Deuxièmement, les objets logger déterminent sur quel message agir selon leur sévérité (à partir des filtres par défaut) ou selon les objets filter associés. Troisièmement, les objets logger transmettent les messages pertinents à tous les handlers concernés.

Les méthodes des objets logger les plus utilisées appartiennent à deux catégories : la configuration et l'envoi de messages.

Voici les méthodes de configuration les plus communes :

spécifie le plus bas niveau de sévérité qu'un logger traitera. Ainsi, est le niveau de sévérité défini par défaut le plus bas et est le plus haut. Par exemple, si le niveau de sévérité est , le logger ne traite que les messages de niveau , , et ; il ignore les messages de niveau DEBUG.

et ajoutent ou enlèvent des objets handlers au logger. Les objets handlers sont expliqués plus en détail dans Handlers.

et ajoutent ou enlèvent des objets filter au logger. Les objets filters sont expliqués plus en détail dans Filtres.

Comme nous l'expliquons aux deux derniers paragraphes de cette section, vous n'avez pas besoin de faire appel à ces méthodes à chaque fois que vous créez un logger.

Une fois que l'objet logger est correctement configuré, les méthodes suivantes permettent de créer un message :

Les méthodes , , , et créent des entrées de journal avec un message et un niveau correspondant à leur nom. Le message est en fait une chaîne de caractères qui peut contenir la syntaxe standard de substitution de chaînes de caractères : , , , etc. L'argument suivant est une liste des objets correspondant aux champs à substituer dans le message. En ce qui concerne , les méthodes de ne tiennent compte que du mot clef et l'utilisent pour déterminer s'il faut enregistrer les informations associées à une exception.

crée un message similaire à . La différence est que ajoute la trace de la pile d'exécution au message. On ne peut appeler cette méthode qu'à l'intérieur d'un bloc de gestion d'exception.

prend le niveau de sévérité comme argument explicite. C'est un peu plus verbeux pour enregistrer des messages que d'utiliser les méthodes plus pratiques décrites si dessus, mais c'est ce qui permet d'enregistrer des messages pour des niveaux de sévérité définis par l'utilisateur.

renvoie une référence à un objet logger du nom spécifié si celui-ci est donné en argument. Dans le cas contraire, c'est l'enregistreur racine. Les noms sont des structures hiérarchiques séparées par des points. Des appels répétés à avec le même nom renvoient une référence au même objet logger. Les loggers qui sont plus bas dans cette liste hiérarchique sont des enfants des loggers plus haut dans la liste. Par exemple, si un enregistreur a le nom , les enregistreurs avec les noms , et sont tous des descendants de .

On associe aux loggers un concept de niveau effectif. Si aucun niveau n'est explicitement défini pour un logger, c'est le niveau du parent qui est utilisé comme niveau effectif. Si le parent n'a pas de niveau défini, c'est celui de son parent qui est considéré, et ainsi de suite ; on examine tous les ancêtres jusqu'à ce qu'un niveau explicite soit trouvé. Le logger root a toujours un niveau explicite ( par défaut). Quand le logger traite un événement, c'est ce niveau effectif qui est utilisé pour déterminer si cet événement est transmis à ses handlers.

Les loggers fils font remonter leurs messages aux handlers associés à leurs loggers parents. De ce fait, il n'est pas nécessaire de définir et configurer des handlers pour tous les loggers employés par une application. Il suffit de configurer les handlers pour un logger de haut niveau et de créer des loggers fils quand c'est nécessaire (on peut cependant empêcher la propagation aux ancêtres des messages en donnant la valeur à l'attribut propagate d'un logger).

Les objets de type sont responsables de la distribution des messages (selon leur niveau de sévérité) vers les destinations spécifiées pour ce handler. Les objets peuvent ajouter des objets handler à eux-mêmes en appelant . Pour donner un exemple, une application peut envoyer tous les messages dans un fichier journal, tous les messages de niveau ou supérieur vers la sortie standard, et tous les messages de niveau vers une adresse de courriel. Dans ce scénario, nous avons besoin de trois handlers, responsable chacun d'envoyer des messages d'une sévérité donnée vers une destination donnée.

La bibliothèque standard inclut déjà un bon nombre de types de gestionnaires (voir Gestionnaires utiles) ; le tutoriel utilise surtout et dans ses exemples.

Peu de méthodes des objets handlers sont intéressantes pour les développeurs. Les seules méthodes intéressantes lorsqu'on utilise les objets handlers natifs (c'est-à-dire si l'on ne crée pas de handler personnalisé) sont les méthodes de configuration suivantes :

The method, just as in logger objects, specifies the lowest severity that will be dispatched to the appropriate destination. Why are there two methods? The level set in the logger determines which severity of messages it will pass to its handlers. The level set in each handler determines which messages that handler will send on.

sélectionne l'objet utilisé par ce .

et configurent et respectivement dé-configurent des objets filter sur les handlers.

Le code d'une application ne devrait ni instancier, ni utiliser d'instances de la classe . La classe est plutôt une classe mère qui définit l'interface que tous les gestionnaires doivent avoir et établit les comportements par défaut que les classes filles peuvent employer (ou redéfinir).

Les objets formatter configurent l'ordre final, la structure et le contenu du message. Contrairement à la classe mère , le code d'une application peut instancier un objet de classe formatter, même si vous pouvez toujours sous-classer formatter si vous avez besoin d'un comportement spécial dans votre application. Le constructeur a trois arguments optionnels : une chaîne de formatage du message, une chaîne de formatage de la date et un indicateur de style.

S'il n'y a pas de chaîne de formatage, la chaîne brute est utilisée par défaut. S'il n'y a pas de chaîne de formatage de date, le format de date par défaut est :

avec les millisecondes ajoutées à la fin. est l'un des suivants : , , ou . Si l'un de ces styles n'est pas spécifié, alors sera utilisé.

Si l'argument est , la chaîne de formatage utilise comme style de substitution de chaîne de caractères. Les clefs possibles sont documentées dans LogRecord attributes. Si le style est , le message de la chaîne de formatage est compatible avec (en employant des arguments nommés). Enfin si le style est alors la chaîne de formatage du message doit être conforme à ce qui est attendu de .

Modifié dans la version 3.2: Ajout du paramètre .

La chaîne de formatage de message suivante enregistrera le temps dans un format lisible par les humains, la sévérité du message et son contenu, dans cet ordre :

Les formatters emploient une fonction configurable par l'utilisateur pour convertir le temps de création d'une entrée de journal en un n-uplet. Par défaut, est employé ; pour changer cela pour une instance particulière de formatter, assignez une fonction avec la même signature que ou à l'attribut de cette instance. Pour changer cela pour tous les formatters, par exemple si vous voulez que tous votre horodatage soit affiché en GMT, changez l'attribut de la classe en .

On peut configurer de trois façons :

Créer des loggers, handlers et formatters explicitement en utilisant du code Python qui appelle les méthodes de configuration listées ci-dessus.

Créer un fichier de configuration de et le lire en employant la fonction .

Créer un dictionnaire d'informations de configuration et le passer à la fonction .

Pour la documentation de référence de ces deux dernières options, voyez Configuration functions. L'exemple suivant configure un logger très simple, un handler employant la console, et un formatter simple en utilisant du code Python :

L'exécution de ce module via la ligne de commande produit la sortie suivante :

Le module Python suivant crée un logger, un handler et un formatter identiques à ceux de l'exemple détaillé au-dessus, au nom des objets près :

Voici le fichier logging.conf :

La sortie est presque identique à celle de l'exemple qui n'est pas basé sur un fichier de configuration :

Vous pouvez constater les avantages de l'approche par fichier de configuration par rapport à celle du code Python, principalement la séparation de la configuration et du code, et la possibilité pour une personne qui ne code pas de modifier facilement les propriétés de journalisation.

La fonction accepte un paramètre par défaut , qui vaut par défaut pour des raisons de compatibilité ascendante. Ce n'est pas forcément ce que vous souhaitez : en effet, tous les loggers créés avant l'appel à seront désactivés sauf si eux-mêmes (ou l'un de leurs parents) sont explicitement nommés dans le fichier de configuration. Veuillez vous reporter à la documentation pour plus de détails, et donner la valeur à ce paramètre si vous le souhaitez.

Le dictionnaire passé à peut aussi spécifier une valeur Booléenne pour la clef . Si cette valeur n'est pas donnée, elle est interprétée comme vraie par défaut. Cela conduit au comportement de désactivation des loggers décrit ci-dessus, qui n'est pas forcément celui que vous souhaitez ; dans ce cas, donnez explicitement la valeur à cette clef.

Notez que les noms de classe référencés dans le fichier de configuration doivent être relatifs au module , ou des valeurs absolues qui peuvent être résolues à travers les mécanismes d'importation habituels. Ainsi, on peut soit utiliser (relativement au module ) ou (pour une classe définie dans le paquet et le module , si est disponible dans les chemins d'importation de Python).

Dans Python 3.2, un nouveau moyen de configuration de la journalisation a été introduit, à l'aide de dictionnaires pour contenir les informations de configuration. Cela fournit un sur-ensemble de la fonctionnalité décrite ci-dessus basée sur un fichier de configuration et c’est la méthode recommandée pour les nouvelles applications et les déploiements. Étant donné qu'un dictionnaire Python est utilisé pour contenir des informations de configuration et que vous pouvez remplir ce dictionnaire à l'aide de différents moyens, vous avez plus d'options pour la configuration. Par exemple, vous pouvez utiliser un fichier de configuration au format JSON ou, si vous avez accès à la fonctionnalité de traitement YAML, un fichier au format YAML, pour remplir le dictionnaire de configuration. Ou bien sûr, vous pouvez construire le dictionnaire dans le code Python, le recevoir sous forme de pickle sur un connecteur, ou utiliser n'importe quelle approche suivant la logique de votre application.

Voici un exemple définissant la même configuration que ci-dessus, au format YAML pour le dictionnaire correspondant à cette nouvelle approche :

Pour plus d'informations sur la journalisation à l'aide d'un dictionnaire, consultez Configuration functions.

Comportement par défaut (si aucune configuration n'est fournie)

If no logging configuration is provided, it is possible to have a situation where a logging event needs to be output, but no handlers can be found to output the event.

The event is output using a 'handler of last resort', stored in . This internal handler is not associated with any logger, and acts like a which writes the event description message to the current value of (therefore respecting any redirections which may be in effect). No formatting is done on the message - just the bare event description message is printed. The handler's level is set to , so all events at this and greater severities will be output.

Modifié dans la version 3.2: Pour les versions de Python antérieures à 3.2, le comportement est le suivant :

If is (production mode), the event is silently dropped.

If is (development mode), a message 'No handlers could be found for logger X.Y.Z' is printed once.

To obtain the pre-3.2 behaviour, can be set to .

Configuration de la journalisation pour une bibliothèque

Lors du développement d'une bibliothèque qui utilise la journalisation, vous devez prendre soin de documenter la façon dont la bibliothèque utilise la journalisation (par exemple, les noms des enregistreurs utilisés). Consacrez aussi un peu de temps à la configuration de la journalisation. Si l'application utilisant votre bibliothèque n'utilise pas la journalisation et que le code de la bibliothèque effectue des appels de journalisation, alors (comme décrit dans la section précédente), les événements de gravité et au-dessus seront écrits sur . Cela est considéré comme le meilleur comportement par défaut.

Si, pour une raison quelconque, vous ne voulez pas que ces messages soient affichés en l'absence de toute configuration de journalisation, vous pouvez attacher un gestionnaire ne-fait-rien à l'enregistreur de niveau supérieur de votre bibliothèque. Cela évite qu’un message ne soit écrit, puisqu’un gestionnaire sera toujours trouvé pour les événements de la bibliothèque, il ne produit tout simplement pas de sortie. Si celui qui utilise la bibliothèque configure la journalisation pour son application, il est vraisemblable que la configuration ajoutera certains gestionnaires et, si les niveaux sont convenablement configurés, alors la journalisation des appels effectués dans le code de bibliothèque enverra la sortie à ces gestionnaires, comme d'habitude.

Un gestionnaire ne-fait-rien est inclus dans le paquet de journalisation : (depuis Python 3.1). Une instance de ce gestionnaire peut être ajoutée à l'enregistreur de niveau supérieur de l'espace de nommage de journalisation utilisé par la bibliothèque (si vous souhaitez empêcher la copie de la journalisation de votre bibliothèque dans en l'absence de configuration de journalisation). Si toute la journalisation par une bibliothèque foo est effectuée en utilisant des enregistreurs avec des noms correspondant à foo.x, foo.x.y, etc., alors le code :

doit avoir l'effet désiré. Si une organisation produit un certain nombre de bibliothèques, le nom de l'enregistreur spécifié peut être plutôt que simplement .

Il est fortement conseillé de ne pas journaliser vers l'enregistreur racine dans votre bibliothèque. À la place, utilisez un enregistreur avec un nom unique et facilement identifiable, tel que pour le paquet ou le module de niveau supérieur de votre bibliothèque. La journalisation dans l'enregistreur racine rend difficile voire impossible pour le développeur de l'application de configurer la verbosité de journalisation ou les gestionnaires de votre bibliothèque comme il le souhaite.


Les valeurs numériques des niveaux de journalisation sont données dans le tableau suivant. Celles-ci n'ont d'intérêt que si vous voulez définir vos propres niveaux, avec des valeurs spécifiques par rapport aux niveaux prédéfinis. Si vous définissez un niveau avec la même valeur numérique, il écrase la valeur prédéfinie ; le nom prédéfini est perdu.

Les niveaux peuvent également être associés à des enregistreurs, étant définis soit par le développeur, soit par le chargement d'une configuration de journalisation enregistrée. Lorsqu'une méthode de journalisation est appelée sur un enregistreur, l'enregistreur compare son propre niveau avec le niveau associé à l'appel de méthode. Si le niveau de l'enregistreur est supérieur à l'appel de méthode, aucun message de journalisation n'est réellement généré. C'est le mécanisme de base contrôlant la verbosité de la sortie de journalisation.

Les messages de journalisation sont codés en tant qu'instances de . Lorsqu'un enregistreur décide de réellement enregistrer un événement, une instance de est créée à partir du message de journalisation.

Les messages de journalisation sont soumis à un mécanisme d'expédition via l'utilisation de handlers, qui sont des instances de sous-classes de la classe . Les gestionnaires sont chargés de s'assurer qu'un message journalisé (sous la forme d'un ) atterrit dans un emplacement particulier (ou un ensemble d'emplacements) qui est utile pour le public cible pour ce message (tels que les utilisateurs finaux, le personnel chargé de l'assistance aux utilisateurs, les administrateurs système ou les développeurs). Des instances de adaptées à leur destination finale sont passées aux gestionnaires destinées à des destinations particulières. Chaque enregistreur peut avoir zéro, un ou plusieurs gestionnaires associés à celui-ci (via la méthode de ). En plus de tous les gestionnaires directement associés à un enregistreur, tous les gestionnaires associés à tous les ancêtres de l'enregistreur sont appelés pour envoyer le message (à moins que l'indicateur propager pour un enregistreur soit défini sur la valeur , auquel cas le passage au gestionnaire ancêtre s'arrête).

Tout comme pour les enregistreurs, les gestionnaires peuvent avoir des niveaux associés. Le niveau d'un gestionnaire agit comme un filtre de la même manière que le niveau d'un enregistreur. Si un gestionnaire décide de réellement distribuer un événement, la méthode est utilisée pour envoyer le message à sa destination. La plupart des sous-classes définies par l'utilisateur de devront remplacer ce .

La définition de vos propres niveaux est possible, mais ne devrait pas être nécessaire, car les niveaux existants ont été choisis par expérience. Cependant, si vous êtes convaincu que vous avez besoin de niveaux personnalisés, prenez grand soin à leur réalisation et il est pratiquement certain que c’est une très mauvaise idée de définir des niveaux personnalisés si vous développez une bibliothèque. Car si plusieurs auteurs de bibliothèque définissent tous leurs propres niveaux personnalisés, il y a une chance que la sortie de journalisation de ces multiples bibliothèques utilisées ensemble sera difficile pour le développeur à utiliser pour contrôler et/ou interpréter, car une valeur numérique donnée peut signifier des choses différentes pour différentes bibliothèques.

En plus de la classe mère , de nombreuses sous-classes utiles sont fournies :

Les instances envoient des messages aux flux (objets de type fichier).

Les instances envoient des messages à des fichiers sur le disque.

est la classe mère pour les gestionnaires qui assurent la rotation des fichiers de journalisation à partir d’un certain point. Elle n'est pas destinée à être instanciée directement. Utilisez plutôt ou .

Les instances envoient des messages à des fichiers sur le disque, avec la prise en charge des tailles maximales de fichiers de journalisation et de la rotation des fichiers de journalisation.

Les instances de envoient des messages aux fichiers de disque, en permutant le fichier journal à intervalles réguliers.

Les instances de envoient des messages aux connecteurs TCP/IP. Depuis 3.4, les connecteurs UNIX sont également pris en charge.

Les instances de envoient des messages aux connecteurs UDP. Depuis 3.4, les connecteurs UNIX sont également pris en charge.

Les instances de envoient des messages à une adresse e-mail désignée.

Les instances de envoient des messages à un daemon syslog UNIX, éventuellement sur un ordinateur distant.

Les instances de envoient des messages à un journal des événements Windows NT/2000/XP.

Les instances de envoient des messages à un tampon en mémoire, qui est vidé chaque fois que des critères spécifiques sont remplis.

Les instances de envoient des messages à un serveur HTTP à l'aide de la sémantique ou .

Les instances de surveillent le fichier sur lequel elles se connectent. Si le fichier change, il est fermé et rouvert à l'aide du nom de fichier. Ce gestionnaire n'est utile que sur les systèmes de type UNIX ; Windows ne prend pas en charge le mécanisme sous-jacent utilisé.

Les instances de envoient des messages à une file d'attente, telles que celles implémentées dans les modules ou .

instances do nothing with error messages. They are used by library developers who want to use logging, but want to avoid the 'No handlers could be found for logger XXX' message which can be displayed if the library user has not configured logging. See Configuration de la journalisation pour une bibliothèque for more information.



Les classes , et sont définies dans le module de journalisation de base. Les autres gestionnaires sont définis dans un sous-module, (il existe également un autre sous-module, , pour la fonctionnalité de configuration).

Les messages journalisés sont mis en forme pour la présentation via des instances de la classe . Ils sont initialisés avec une chaîne de format appropriée pour une utilisation avec l'opérateur % et un dictionnaire.

For formatting multiple messages in a batch, instances of can be used. In addition to the format string (which is applied to each message in the batch), there is provision for header and trailer format strings.

Lorsque le filtrage basé sur le niveau de l'enregistreur et/ou le niveau du gestionnaire ne suffit pas, les instances de peuvent être ajoutées aux deux instances de et (par le biais de leur méthode ). Avant de décider de traiter un message plus loin, les enregistreurs et les gestionnaires consultent tous leurs filtres pour obtenir l'autorisation. Si un filtre renvoie une valeur , le traitement du message est arrêté.

La fonctionnalité de base permet de filtrer par nom de logger spécifique. Si cette fonctionnalité est utilisée, les messages envoyés à l'enregistreur nommé et à ses enfants sont autorisés via le filtre et tous les autres sont abandonnés.

Exceptions levées par la journalisation

Le paquet de journalisation est conçu pour ne pas faire apparaître les exceptions qui se produisent lors de la journalisation en production. Il s'agit de sorte que les erreurs qui se produisent lors de la gestion des événements de journalisation (telles qu'une mauvaise configuration de la journalisation, une erreur réseau ou d'autres erreurs similaires) ne provoquent pas l'arrêt de l'application utilisant la journalisation.

Les exceptions et ne sont jamais passées sous silence. Les autres exceptions qui se produisent pendant la méthode d'une sous-classe sont passées à sa méthode .

L'implémentation par défaut de dans la classe vérifie si une variable au niveau du module, , est définie. Si cette valeur est définie, la trace de la pile d'appels est affichée sur . Si elle n'est pas définie, l'exception est passée sous silence.

La valeur par défaut de est . C'est parce que pendant le développement, vous voulez généralement être notifié de toutes les exceptions qui se produisent. Il est conseillé de définir à pour une utilisation en production.

Utilisation d'objets arbitraires comme messages

Dans les sections et exemples précédents, il a été supposé que le message passé lors de la journalisation de l'événement est une chaîne. Cependant, ce n'est pas la seule possibilité. Vous pouvez passer un objet arbitraire en tant que message et sa méthode est appelée lorsque le système de journalisation doit le convertir en une représentation sous forme de chaîne. En fait, si vous le souhaitez, vous pouvez complètement éviter de calculer une représentation sous forme de chaîne. Par exemple, les gestionnaires émettent un événement en lui appliquant pickle et en l'envoyant sur le réseau.

La mise en forme des arguments de message est différée jusqu'à ce qu'elle ne puisse pas être évitée. Toutefois, le calcul des arguments passés à la méthode de journalisation peut également être coûteux et vous voudrez peut-être éviter de le faire si l'enregistreur va simplement jeter votre événement. Pour décider de ce qu'il faut faire, vous pouvez appeler la méthode qui prend en argument le niveau et renvoie si un événement est créé par l'enregistreur pour ce niveau d'appel. Vous pouvez écrire un code qui ressemble à ça :

so that if the logger's threshold is set above , the calls to and are never made.

Dans certains cas, peut être plus coûteux que vous le souhaitez (par exemple pour les enregistreurs profondément imbriqués où un niveau explicite n'est défini que dans la hiérarchie des enregistreurs). Dans de tels cas (ou si vous souhaitez éviter d'appeler une méthode dans des boucles optimisées), vous pouvez mettre en cache le résultat d'un appel à dans une variable locale ou d'instance, et l'utiliser au lieu d'appeler la méthode à chaque fois. Une telle valeur mise en cache ne doit être recalculée que lorsque la configuration de journalisation change dynamiquement pendant l'exécution de l'application (ce qui est rarement le cas).

Il existe d'autres optimisations qui peuvent être faites pour des applications spécifiques qui nécessitent un contrôle plus précis sur les informations de journalisation collectées. Voici une liste de choses que vous pouvez faire pour éviter le traitement pendant la journalisation dont vous n'avez pas besoin :

Notez également que le module de journalisation principale inclut uniquement les gestionnaires de base. Si vous n'importez pas et , ils ne prendront pas de mémoire.

Référence d'API pour le module de journalisation.

API de configuration pour le module de journalisation.

Gestionnaires utiles inclus avec le module de journalisation.

Tutoriel sur la journalisation

Les bases de l'utilisation du module

Enregistrer les évènements dans un fichier

Journalisation de données variables

Modifier le format du message affiché

Afficher l'horodatage dans les messages

Usage avancé de Logging

Flux du processus de journalisation

Comportement par défaut (si aucune configuration n'est fournie)

Configuration de la journalisation pour une bibliothèque

Exceptions levées par la journalisation

Utilisation d'objets arbitraires comme messages

Guide pratique : programmation fonctionnelle

Recettes pour la journalisation


Tutoriel sur la journalisation
