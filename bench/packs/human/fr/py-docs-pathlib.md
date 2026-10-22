<!--
Source: https://docs.python.org/fr/3/library/pathlib.html (Python 3.15.0 documentation; fetched 21 Oct 2026)
Licence: PSF License Version 2, confirmed 21 Oct 2026 on the page's own licence page https://docs.python.org/fr/3/license.html: "Le logiciel Python et sa documentation sont distribués sous la licence Python Software Foundation License Version 2." (English original, https://docs.python.org/3/license.html: "Python software and documentation are licensed under the Python Software Foundation License Version 2.") Translators grant their work to the PSF under CC0 (python-docs-fr README.rst, https://github.com/python/python-docs-fr/blob/3.15/README.rst). Copyright Python Software Foundation and the translators; the PSF licence notice must stay with any copy.
Extracted as plain text: paragraphs and headings kept, navigation and code removed. Otherwise not edited.
-->

Ce module offre des classes représentant le système de fichiers avec la sémantique appropriée pour différents systèmes d'exploitation. Les classes de chemins sont divisées en chemins purs, qui fournissent uniquement des opérations de manipulation sans entrées-sorties, et chemins concrets, qui héritent des chemins purs et fournissent également les opérations d'entrées-sorties.

Si vous n'avez jamais utilisé ce module précédemment, ou si vous n'êtes pas sûr de quelle classe est faite pour votre tâche, est très certainement ce dont vous avez besoin. Elle instancie un chemin concret pour la plateforme sur laquelle s'exécute le code.

Les chemins purs sont utiles dans certains cas particuliers ; par exemple :

Si vous voulez manipuler des chemins Windows sur une machine Unix (ou vice versa). Vous ne pouvez pas instancier un quand vous êtes sous Unix, mais vous pouvez instancier .

Vous voulez être sûr que votre code manipule des chemins sans réellement accéder au système d'exploitation. Dans ce cas, instancier une de ces classes pures peut être utile puisqu'elle ne possède tout simplement aucune opération permettant d'accéder au système d'exploitation.

PEP 428 : le module pathlib – implémentation orientée-objet des chemins de systèmes de fichiers.

Pour de la manipulation de chemins bas-niveau avec des chaînes de caractères, vous pouvez aussi utiliser le module .

Importer la classe principale :

Lister les sous-dossiers :

Lister les fichiers source Python dans cette arborescence de dossiers :

Naviguer à l'intérieur d'une arborescence de dossiers :

Récupérer les propriétés de chemin :

Ouvrir un fichier :

Une exception qui hérite de levée quand une opération non prise en charge est appelée sur un objet path


Les objets chemins purs fournissent les opérations de gestion de chemin qui n'accèdent pas réellement au système de fichiers. Il y a trois façons d'accéder à ces classes que nous appelons aussi familles :

Une classe générique qui représente la famille de chemin du système (l'instancier crée soit un soit un ) :

Each element of pathsegments can be either a string representing a path segment, or an object implementing the interface where the method returns a string, such as another path object:

When pathsegments is empty or consists only of empty strings, the current directory is assumed:

Si un segment est un chemin absolu, tous les segments précédents sont ignorés (comme ) :

Sous Windows, le nom de lecteur est conservé quand un chemin relatif à la racine (par exemple ) est rencontré :

Les points et slashs superflus sont supprimés, mais les doubles points () et les double slashes () en début de segment ne le sont pas, puisque cela changerait la signification du chemin pour différentes raisons (par exemple pour des liens symboliques ou des chemins UNC) :

(une analyse naïve considérerait équivalent à , ce qui est faux si est un lien symbolique vers un autre dossier)

Les objets chemins purs implémentent l'interface , leur permettant d'être utilisés n'importe où l'interface est acceptée.

Modifié dans la version 3.6: ajout de la gestion de l'interface .

Sous-classe de , cette famille de chemin représente les chemins de systèmes de fichiers en dehors des chemins Windows :

pathsegments est spécifié de manière similaire à .

Sous-classe de , cette famille de chemin représente les chemins de systèmes de fichiers Windows, y compris les chemins UNC (voir UNC paths) :

pathsegments est spécifié de manière similaire à .

Sans tenir compte du système sur lequel vous êtes, vous pouvez instancier toutes ces classes, puisqu'elles ne fournissent aucune opération qui appelle le système d'exploitation.

Paths are immutable and hashable. Paths of a same flavour are comparable and orderable. These properties respect the flavour's case-folding semantics:

Les chemins de différentes familles ne sont pas égaux et ne peuvent être ordonnés :

L'opérateur slash aide à créer les chemins enfants, de manière similaire à . Si l'argument est un chemin absolu, le chemin précédent est ignoré. Sous Windows, le lecteur n'est pas effacé quand l'argument est un chemin relatif enraciné (par exemple ) :

Un objet chemin peut être utilisé n'importe où un objet implémentant est accepté :

La représentation d'un chemin en chaîne de caractères est celle du chemin brut du système de fichiers lui-même (dans sa forme native, c.-à-d. avec des antislashs sous Windows), telle que vous pouvez la passer à n'importe quelle fonction prenant un chemin en tant que chaîne de caractères :

De manière similaire, appeler sur un chemin donne le chemin brut du système de fichiers en tant que bytes, tel qu'encodé par :

Appeler est seulement recommandé sous Unix. Sous Windows, la forme Unicode est la représentation canonique des chemins du système de fichiers.

Accéder aux parties individuelles

Pour accéder aux parties individuelles (composantes) d'un chemin, utilisez les propriétés suivantes :

Un tuple donnant accès aux différentes composantes du chemin :

(notez comme le lecteur et la racine locale sont regroupés en une seule partie)

The , , , and properties describe different parts of a path. For example, given:

The stem excludes only the final suffix: in this example, it includes .

Les chemins purs fournissent les méthodes et propriétés suivantes :

The implementation of the module used for low-level path parsing and joining: either or .


Une chaîne représentant la lettre du lecteur ou le nom, s'il y en a un :

Les partages UNC sont aussi considérés comme des lecteurs :

Une chaîne de caractères représentant la racine (locale ou globale), s'il y en a une :

Les partages UNC ont toujours une racine :

Si le chemin commence par plus de deux slashes successifs, n'en conserve qu'un :

Ce comportement se conforme au paragraphe 4.11 Pathname Resolution des Open Group Base Specifications version 6 :

"A pathname that begins with two successive slashes may be interpreted in an implementation-defined manner, although more than two leading slashes shall be treated as a single slash."

La concaténation du lecteur et de la racine :

Une séquence immuable fournissant accès aux ancêtres logiques du chemin :

Modifié dans la version 3.10: La séquence de parents prend désormais en charge les tranches et les valeurs d’index négatives.

Le parent logique du chemin :

Vous ne pouvez pas aller au-delà d'une ancre, ou d'un chemin vide :

C'est une opération purement lexicale, d'où le comportement suivant :

Si vous voulez remonter un chemin arbitraire du système de fichiers, il est recommandé d'appeler d'abord de manière à résoudre les liens symboliques et éliminer les composantes .

Une chaîne représentant la composante finale du chemin, en excluant le lecteur et la racine, si présent :

Les noms de lecteur UNC ne sont pas pris en compte :

The last dot-separated portion of the final component, if any:

Ceci est communément appelé une extension de fichier.

Modifié dans la version 3.14: A single dot ("") is considered a valid suffix.

Une liste de suffixes du chemin concerné, souvent appelées extensions de fichier :

Modifié dans la version 3.14: A single dot ("") is considered a valid suffix.

La composante finale du chemin, sans son suffixe :

Modifié dans la version 3.14: A single dot ("") is considered a valid suffix.

Renvoie une représentation en chaîne de caractères du chemin avec des slashs () :

Renvoie si le chemin est absolu ou non. Un chemin est considéré absolu s'il a une racine et un lecteur (si la famille le permet) :

Renvoie si ce chemin est relatif ou non au chemin other.

This method is string-based; it neither accesses the filesystem nor treats "" segments specially. The following code is equivalent:


Deprecated since version 3.12, removed in version 3.14: Passing additional arguments is deprecated; if supplied, they are joined with other.

Calling this method is equivalent to combining the path with each of the given pathsegments in turn:

Match this path against the provided glob-style pattern. Return if matching is successful, otherwise. For example:

Patterns ending in "", as in the example above, may surprise when passed to . Even though "" can match 0 segments, "" requires a separator to match. Hence "" does not match path "". Since drops trailing slashes, this pattern also does not match "".

Comme pour les autres méthodes, la sensibilité à la casse est la sensibilité par défaut de la plate-forme :

La sensibilité à la casse peut être choisie en passant ou à l'argument case_sensitive.


Match this path against the provided non-recursive glob-style pattern. Return if matching is successful, otherwise.

This method is similar to , but empty patterns aren't allowed ( is raised), the recursive wildcard "" isn't supported (it acts like non-recursive ""), and if a relative pattern is provided, then matching is done from the right:

Modifié dans la version 3.12: Le paramètre pattern accepte un path-like object.

Modifié dans la version 3.12: ajout du paramètre case_sensitive

Compute a version of this path relative to the path represented by other. If it's impossible, is raised:

When walk_up is false (the default), the path must start with other. When the argument is true, entries may be added to form the relative path. In all other cases, such as the paths referencing different drives, is raised.:

This function is part of and works with strings. It does not check or access the underlying file structure. This can impact the walk_up option as it assumes that no symlinks are present in the path; call first if necessary to resolve symlinks.

Modifié dans la version 3.12: The walk_up parameter was added (old behavior is the same as ).

Deprecated since version 3.12, removed in version 3.14: Passing additional positional arguments is deprecated; if supplied, they are joined with other.

Renvoie un nouveau chemin avec changé. Si le chemin original n'a pas de nom, une est levée :

Renvoie un nouveau chemin avec changé. Si le chemin original n'a pas de nom, ValueError est levée :


Renvoie un nouveau chemin avec changé. Si le chemin original n'a pas de suffixe, le nouveau suffix est alors ajouté. Si suffix est une chaîne vide, le suffixe d'origine est retiré :

Modifié dans la version 3.14: A single dot ("") is considered a valid suffix. In previous versions, is raised if a single dot is supplied.

Create a new path object of the same type by combining the given pathsegments. This method is called whenever a derivative path is created, such as from and . Subclasses may override this method to pass information to derivative paths, for example:


Les chemins concrets sont des sous-classes des chemins purs. En plus des opérations fournies par ces derniers, ils fournissent aussi des méthodes pour faire appel au système sur des objets chemin. Il y a trois façons d'instancier des chemins concrets :

Une sous-classe de , cette classe représente les chemins concrets d'une famille de chemins de système de fichiers (l'instancier créé soit un , soit un ) :

pathsegments est spécifié de manière similaire à .

Une sous-classe de et , cette classe représente les chemins concrets de systèmes de fichiers non Windows :

pathsegments est spécifié de manière similaire à .

Modifié dans la version 3.13: Raises on Windows. In previous versions, was raised instead.

Une sous-classe de et , cette classe représente les chemins concrets de systèmes de fichiers Windows :

pathsegments est spécifié de manière similaire à .

Modifié dans la version 3.13: Raises on non-Windows platforms. In previous versions, was raised instead.

Vous pouvez seulement instancier la classe de la famille qui correspond à votre système (permettre des appels au système pour des familles de chemins non compatibles pourrait mener à des bogues ou à des pannes de votre application) :

Some concrete path methods can raise an if a system call fails (for example because the path doesn't exist).

Analyse et génération des URI

Concrete path objects can be created from, and represented as, 'file' URIs conforming to RFC 8089.

File URIs are not portable across machines with different filesystem encodings.

Return a new path object from parsing a 'file' URI. For example:

On Windows, DOS device and UNC paths may be parsed from URIs:

Plusieurs variants du formulaire sont pris en charge :

is raised if the URI does not start with , or the parsed path isn't absolute.


Modifié dans la version 3.14: The URL authority is discarded if it matches the local hostname. Otherwise, if the authority isn't empty or , then on Windows a UNC path is returned (as before), and on other platforms a is raised.

Represent the path as a 'file' URI. is raised if the path isn't absolute.

Deprecated since version 3.14, will be removed in version 3.19: Calling this method from rather than is possible but deprecated. The method's use of makes it strictly impure.

Expansion et résolution de chemins

Renvoie un nouveau chemin représentant le dossier d’accueil de l'utilisateur (comme renvoyé par avec la construction ). Si le dossier d’accueil de l'utilisateur ne peut être résolu, est levée.


Renvoie un nouveau chemin avec les résolutions des constructions et , comme renvoyé par . Si le dossier d’accueil de l'utilisateur ne peut être résolu, est levée.


Renvoie un nouveau chemin représentant le dossier courant (comme renvoyé par ) :

Rend le chemin absolu, sans normaliser ou résoudre les liens symboliques. Renvoie un nouveau :

Rend le chemin absolu, résolvant les liens symboliques. Un nouveau chemin est renvoyé :

Les composantes "" sont aussi éliminées (c'est la seule méthode pour le faire) :

If a path doesn't exist or a symlink loop is encountered, and strict is , is raised. If strict is , the path is resolved as far as possible and any remainder is appended without checking whether it exists.

Modifié dans la version 3.6: The strict parameter was added (pre-3.6 behavior is strict).

Modifié dans la version 3.13: Symlink loops are treated like other errors: is raised in strict mode, and no exception is raised in non-strict mode. In previous versions, is raised no matter the value of strict.

Renvoie le chemin vers lequel le lien symbolique pointe (tel que renvoyé par ) :


Modifié dans la version 3.13: Raises if is not available. In previous versions, was raised.

Requête sur type et statut du fichier

Modifié dans la version 3.8: , , , , , , , , now return instead of raising an exception for paths that contain characters unrepresentable at the OS level.

Modifié dans la version 3.14: The methods given above now return instead of raising any exception from the operating system. In previous versions, some kinds of exception are raised, and others suppressed. The new behaviour is consistent with , , etc. Use to retrieve the file status without suppressing exceptions.

Return an object containing information about this path, like . The result is looked up at each call to this method.

Cette méthode suit normalement les liens symboliques ; pour appeler sur un lien symbolique lui-même, ajoutez l’argument , ou utilisez .

Modifié dans la version 3.10: ajout du paramètre follow_symlinks.

Comme , mais, si le chemin pointe vers un lien symbolique, renvoie les informations du lien symbolique plutôt que celui de sa cible.

Return if the path points to an existing file or directory and if the path is invalid, inaccessible or missing. Use to distinguish between these cases.

This method normally follows symlinks; to check if a symlink exists, add the argument .

Modifié dans la version 3.12: ajout du paramètre follow_symlinks.

Return if the path points to a regular file. will be returned if the path is invalid, inaccessible or missing, or if it points to something other than a regular file. Use to distinguish between these cases.

This method normally follows symlinks; to exclude symlinks, add the argument .

Modifié dans la version 3.13: ajout du paramètre follow_symlinks.

Return if the path points to a directory. will be returned if the path is invalid, inaccessible or missing, or if it points to something other than a directory. Use to distinguish between these cases.

This method normally follows symlinks; to exclude symlinks to directories, add the argument .

Modifié dans la version 3.13: ajout du paramètre follow_symlinks.

Return if the path points to a symbolic link, even if that symlink is broken. will be returned if the path is invalid, inaccessible or missing, or if it points to something other than a symbolic link. Use to distinguish between these cases.

Return if the path points to a junction, and for any other type of file. Currently only Windows supports junctions.


Return if the path is a mount point: a point in a file system where a different file system has been mounted. On POSIX, the function checks whether path's parent, , is on a different device than path, or whether and path point to the same i-node on the same device --- this should detect mount points for all Unix and POSIX variants. On Windows, a mount point is considered to be a drive letter root (e.g. ), a UNC share (e.g. ), or a mounted filesystem directory.


Modifié dans la version 3.12: Ajout de la gestion de Windows.

Return if the path points to a Unix socket. will be returned if the path is invalid, inaccessible or missing, or if it points to something other than a Unix socket. Use to distinguish between these cases.

Return if the path points to a FIFO. will be returned if the path is invalid, inaccessible or missing, or if it points to something other than a FIFO. Use to distinguish between these cases.

Return if the path points to a block device. will be returned if the path is invalid, inaccessible or missing, or if it points to something other than a block device. Use to distinguish between these cases.

Return if the path points to a character device. will be returned if the path is invalid, inaccessible or missing, or if it points to something other than a character device. Use to distinguish between these cases.

Renvoie si ce chemin pointe vers le même fichier que other_path, qui peut être soit un chemin, soit une chaîne de caractères. La sémantique est similaire à et .

peut être levée si l'un des fichiers ne peut être accédé pour quelque raison.


A object that supports querying file type information. The object exposes methods that cache their results, which can help reduce the number of system calls needed when switching on file type. For example:

If the path was generated from then this attribute is initialized with some information about the file type gleaned from scanning the parent directory. Merely accessing does not perform any filesystem queries.

To fetch up-to-date information, it's best to call , and rather than methods of this attribute. There is no way to reset the cache; instead you can create a new path object with an empty info cache via .


Lecture et écriture de fichiers

Ouvre le fichier pointé par le chemin, comme la fonction native le fait :

Renvoie le contenu décodé du fichier pointé en tant que chaîne de caractères :

Le fichier est ouvert, puis fermé. Les paramètres optionnels ont la même signification que dans .


Modifié dans la version 3.13: ajout du paramètre newline.

Renvoie le contenu binaire du fichier pointé en tant que chaîne d’octets :


Ouvre le fichier pointé en mode texte, écrit data dedans, et ferme le fichier :

Le fichier du même nom, s'il existe, est écrasé. Les paramètres optionnels ont la même signification que dans .


Modifié dans la version 3.10: ajout du paramètre newline.

Ouvre le fichier pointé en mode binaire, écrit data dedans, et ferme le fichier :

Le fichier du même nom, s'il existe, est écrasé.


Quand le chemin pointe vers un dossier, donne par séquences les objets chemin du contenu du dossier :

The children are yielded in arbitrary order, and the special entries and are not included. If a file is removed from or added to the directory after creating the iterator, it is unspecified whether a path object for that file is included.

Si le chemin n'est pas un dossier ou n'est pas accessible, est levée.

Glob de manière relative suivant le motif pattern fourni dans le dossier représenté par ce chemin, donnant tous les fichiers correspondants (de n'importe quelle sorte) :

The paths are returned in no particular order. If you need a specific order, sort the results.

By default, or when the case_sensitive keyword-only argument is set to , this method matches paths using platform-specific casing rules: typically, case-sensitive on POSIX, and case-insensitive on Windows. Set case_sensitive to or to override this behaviour.

By default, or when the recurse_symlinks keyword-only argument is set to , this method follows symlinks except when expanding "" wildcards. Set recurse_symlinks to to always follow symlinks.

Any exceptions raised from scanning the filesystem are suppressed. This includes when accessing directories without read permission.

Lève un évènement d’audit avec comme arguments et .

Modifié dans la version 3.12: ajout du paramètre case_sensitive

Modifié dans la version 3.13: Ajout du paramètre recurse_symlinks.

Modifié dans la version 3.13: Le paramètre pattern accepte un path-like object.

Modifié dans la version 3.13: Any exceptions raised from scanning the filesystem are suppressed. In previous versions, such exceptions are suppressed in many cases, but not all.

Glob the given relative pattern recursively. This is like calling with "" added in front of the pattern.

The paths are returned in no particular order. If you need a specific order, sort the results.

Any exceptions raised from scanning the filesystem are suppressed. This includes when accessing directories without read permission.

Documentation pour Pattern language et .

Lève un évènement d’audit avec comme arguments et .

Modifié dans la version 3.12: ajout du paramètre case_sensitive

Modifié dans la version 3.13: Ajout du paramètre recurse_symlinks.

Modifié dans la version 3.13: Le paramètre pattern accepte un path-like object.

Generate the file names in a directory tree by walking the tree either top-down or bottom-up.

For each directory in the directory tree rooted at self (including self but excluding '.' and '..'), the method yields a 3-tuple of .

dirpath is a to the directory currently being walked, dirnames is a list of strings for the names of subdirectories in dirpath (excluding and ), and filenames is a list of strings for the names of the non-directory files in dirpath. To get a full path (which begins with self) to a file or directory in dirpath, do . Whether or not the lists are sorted is file system-dependent.

If the optional argument top_down is true (which is the default), the triple for a directory is generated before the triples for any of its subdirectories (directories are walked top-down). If top_down is false, the triple for a directory is generated after the triples for all of its subdirectories (directories are walked bottom-up). No matter the value of top_down, the list of subdirectories is retrieved before the triples for the directory and its subdirectories are walked.

When top_down is true, the caller can modify the dirnames list in-place (for example, using or slice assignment), and will only recurse into the subdirectories whose names remain in dirnames. This can be used to prune the search, or to impose a specific order of visiting, or even to inform about directories the caller creates or renames before it resumes again. Modifying dirnames when top_down is false has no effect on the behavior of since the directories in dirnames have already been generated by the time dirnames is yielded to the caller.

By default, errors from are ignored. If the optional argument on_error is specified, it should be a callable; it will be called with one argument, an instance. The callable can handle the error to continue the walk or re-raise it to stop the walk. Note that the filename is available as the attribute of the exception object.

By default, does not follow symbolic links, and instead adds them to the filenames list. Set follow_symlinks to true to resolve symlinks and place them in dirnames and filenames as appropriate for their targets, and consequently visit directories pointed to by symlinks (where supported).

Be aware that setting follow_symlinks to true can lead to infinite recursion if a link points to a parent directory of itself. does not keep track of the directories it has already visited.

assumes the directories it walks are not modified during execution. For example, if a directory from dirnames has been replaced with a symlink and follow_symlinks is false, will still try to descend into it. To prevent such behavior, remove directories from dirnames as appropriate.

Unlike , lists symlinks to directories in filenames if follow_symlinks is false.

This example displays the number of bytes used by all files in each directory, while ignoring directories:

This next example is a simple implementation of . Walking the tree bottom-up is essential as doesn't allow deleting a directory before it is empty:


Création de fichiers et de dossiers

Create a file at this given path. If mode is given, it is combined with the process's value to determine the file mode and access flags. If the file already exists, the function succeeds when exist_ok is true (and its modification time is updated to the current time), otherwise is raised.

The , and methods are often used to create files.

Create a new directory at this given path. If mode is given, it is combined with the process's value to determine the file mode and access flags. If the path already exists, is raised.

Si parents est vrai, chaque parent de ce chemin est créé si besoin ; ils sont créés avec les permissions par défaut sans prendre en compte mode (reproduisant la commande POSIX ).

If parent_mode is not , it is used as the mode for any newly-created, intermediate-level directories when parents is true. Like mode, it is combined with the process's value. Otherwise, intermediate directories are created with the default permissions (also subject to the umask).

Si parents est faux (valeur par défaut), un parent manquant lève .

Si exist_ok est faux (valeur par défaut), est levé si le dossier cible existe déjà.

If exist_ok is true, will not be raised unless the given path already exists in the file system and is not a directory (same behavior as the POSIX command).

Modifié dans la version 3.5: ajout du paramètre exist_ok.


Make this path a symbolic link pointing to target.

On Windows, a symlink represents either a file or a directory, and does not morph to the target dynamically. If the target is present, the type of the symlink will be created to match. Otherwise, the symlink will be created as a directory if target_is_directory is true or a file symlink (the default) otherwise. On non-Windows platforms, target_is_directory is ignored.

L'ordre des arguments (lien, cible) est l'opposé de ceux de .

Modifié dans la version 3.13: Raises if is not available. In previous versions, was raised.

Crée un lien physique pointant sur le même fichier que target.

L'ordre des arguments (lien, cible) est l'opposé de celui de .


Modifié dans la version 3.13: Raises if is not available. In previous versions, was raised.

Copying, moving and deleting

Copy this file or directory tree to the given target, and return a new instance pointing to target.

If the source is a file, the target will be replaced if it is an existing file. If the source is a symlink and follow_symlinks is true (the default), the symlink's target is copied. Otherwise, the symlink is recreated at the destination.

If preserve_metadata is false (the default), only directory structures and file data are guaranteed to be copied. Set preserve_metadata to true to ensure that file and directory permissions, flags, last access and modification times, and extended attributes are copied where supported. This argument has no effect when copying files on Windows (where metadata is always preserved).

Where supported by the operating system and file system, this method performs a lightweight copy, where data blocks are only copied when modified. This is known as copy-on-write.


Copy this file or directory tree into the given target_dir, which should be an existing directory. Other arguments are handled identically to . Returns a new instance pointing to the copy.


Rename this file or directory to the given target, and return a new instance pointing to target. On Unix, if target exists and is a file, it will be replaced silently if the user has permission. On Windows, if target exists, will be raised. target can be either a string or another path object:

The target path may be absolute or relative. Relative paths are interpreted relative to the current working directory, not the directory of the object.

Cette méthode est implémentée d'après et fournit les mêmes garanties.

Modifié dans la version 3.8: Added return value, return the new instance.

Rename this file or directory to the given target, and return a new instance pointing to target. If target points to an existing file or empty directory, it will be unconditionally replaced.

The target path may be absolute or relative. Relative paths are interpreted relative to the current working directory, not the directory of the object.

Modifié dans la version 3.8: Added return value, return the new instance.

Move this file or directory tree to the given target, and return a new instance pointing to target.

If the target doesn't exist it will be created. If both this path and the target are existing files, then the target is overwritten. If both paths point to the same file or directory, or the target is a non-empty directory, then is raised.

If both paths are on the same filesystem, the move is performed with . Otherwise, this path is copied (preserving metadata and symlinks) and then deleted.


Move this file or directory tree into the given target_dir, which should be an existing directory. Returns a new instance pointing to the moved path.


Supprime ce fichier ou lien symbolique. Si le chemin pointe vers un dossier, utilisez à la place.

Si missing_ok est faux (valeur par défaut), une est levée si le chemin n'existe pas.

Si missing_ok est vrai, les exceptions sont ignorées (même comportement que la commande POSIX ).

Modifié dans la version 3.8: Ajout du paramètre missing_ok.

Supprime ce dossier. Le dossier doit être vide.

Return the name of the user owning the file. is raised if the file's user identifier (UID) isn't found in the system database.

This method normally follows symlinks; to get the owner of the symlink, add the argument .

Modifié dans la version 3.13: Raises if the module is not available. In earlier versions, was raised.

Modifié dans la version 3.13: ajout du paramètre follow_symlinks.

Return the name of the group owning the file. is raised if the file's group identifier (GID) isn't found in the system database.

This method normally follows symlinks; to get the group of the symlink, add the argument .

Modifié dans la version 3.13: Raises if the module is not available. In earlier versions, was raised.

Modifié dans la version 3.13: ajout du paramètre follow_symlinks.

Change le mode et les permissions du fichier, comme .

Cette méthode suit normalement les liens symboliques. Certaines versions d’Unix prennent en charge la modification des permissions sur le lien symbolique lui-même ; sur ces plateformes, vous pouvez ajouter l’argument , ou utiliser .

Modifié dans la version 3.10: ajout du paramètre follow_symlinks.

Comme , mais, si le chemin pointe vers un lien symbolique, le mode du lien symbolique est changé plutôt que celui de sa cible.

The following wildcards are supported in patterns for , and :

Matches any number of file or directory segments, including zero. Note that in , "" does not match "", whereas yields "" for that pattern.

Correspondance d'un segment de fichier ou de dossier

Matches any number of non-separator characters, including zero.

Matches one non-separator character.

Matches one character in seq, where seq is a sequence of characters. Range expressions are supported; for example, matches any lowercase ASCII letter. Multiple ranges can be combined: matches any ASCII letter, digit, or underscore.

Matches one character not in seq, where seq follows the same rules as above.

For a literal match, wrap the meta-characters in brackets. For example, matches the character .

The "" wildcard enables recursive globbing. A few examples:

Globbing with the "" wildcard visits every directory in the tree. Large directory trees may take a long time to search.

Modifié dans la version 3.13: Globbing with a pattern that ends with "" returns both files and directories. In previous versions, only directories were returned.

In and , a trailing slash may be added to the pattern to match only directories.

Modifié dans la version 3.11: Globbing with a pattern that ends with a pathname components separator ( or ) returns only directories.

Comparaison avec les outils du module

The patterns accepted and results generated by and differ slightly from those by the module:

Files beginning with a dot are not special in pathlib. This is like passing to .

"" pattern components are always recursive in pathlib. This is like passing to .

"" pattern components do not follow symlinks by default in pathlib. This behaviour has no equivalent in , but you can pass to for compatible behaviour.

Like all and objects, the values returned from and don't include trailing slashes.

The values returned from pathlib's and include the path as a prefix, unlike the results of .

The values returned from pathlib's and may include path itself, for example when globbing "", whereas the results of never include an empty string that would correspond to path.

Comparaison aux modules et

pathlib implements path operations using and objects, and so it's said to be object-oriented. On the other hand, the and modules supply functions that work with low-level and objects, which is a more procedural approach. Some users consider the object-oriented style to be more readable.

Many functions in and support paths and paths relative to directory descriptors. These features aren't available in pathlib.

Python's and types, and portions of the and modules, are written in C and are very speedy. pathlib is written in pure Python and is often slower, but rarely slow enough to matter.

pathlib's path normalization is slightly more opinionated and consistent than . For example, whereas eliminates "" segments from a path, which may change its meaning if symlinks are involved, preserves these segments for greater safety.

pathlib's path normalization may render it unsuitable for some applications:

pathlib normalizes to , which changes a path's meaning when supplied to various operating system APIs and command-line utilities. Specifically, the absence of a trailing separator may allow the path to be resolved as either a file or directory, rather than a directory only.

pathlib normalizes to , which changes a path's meaning when used as an executable search path, such as in a shell or when spawning a child process. Specifically, the absence of a separator in the path may force it to be looked up in rather than the current directory.

As a consequence of these differences, pathlib is not a drop-in replacement for .

Ci-dessous se trouve un tableau associant diverses fonctions à leur équivalent / correspondant.

The module provides types for static type checking.


A describing the attribute. Implementations may return cached results from their methods.

Return if the path is an existing file or directory, or any other kind of file; return if the path doesn't exist.

If follow_symlinks is , return for symlinks without checking if their targets exist.

Return if the path is a directory, or a symbolic link pointing to a directory; return if the path is (or points to) any other kind of file, or if it doesn't exist.

If follow_symlinks is , return only if the path is a directory (without following symlinks); return if the path is any other kind of file, or if it doesn't exist.

Return if the path is a file, or a symbolic link pointing to a file; return if the path is (or points to) a directory or other non-file, or if it doesn't exist.

If follow_symlinks is , return only if the path is a file (without following symlinks); return if the path is a directory or other non-file, or if it doesn't exist.

Return if the path is a symbolic link (even if broken); return if the path is a directory or any kind of file, or if it doesn't exist.


Accéder aux parties individuelles

Analyse et génération des URI

Expansion et résolution de chemins

Requête sur type et statut du fichier

Lecture et écriture de fichiers

Création de fichiers et de dossiers

Copying, moving and deleting

Comparaison avec les outils du module

Comparaison aux modules et

Accès aux Fichiers et aux Dossiers

--- Common pathname manipulations
