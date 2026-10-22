**Objet : Échec de votre export Typhon**

Bonjour,

Merci de nous avoir signalé ce problème. Un export Typhon peut échouer pour plusieurs raisons. Voici les causes les plus fréquentes, à vérifier dans l'ordre :

1. **Période comptable non clôturée ou verrouillée** : vérifiez que l'exercice sélectionné est bien ouvert et qu'aucun autre utilisateur ne le modifie.
2. **Écritures déséquilibrées** : un export est refusé si une écriture n'est pas équilibrée. Lancez le contrôle de cohérence (menu *Outils > Vérification*).
3. **Droits d'accès au dossier de destination** : choisissez un dossier local, sur lequel vous avez les droits d'écriture, et fermez tout fichier du même nom ouvert dans Excel.
4. **Version du logiciel** : assurez-vous d'utiliser la dernière mise à jour de Typhon.

Si l'échec persiste, merci de nous transmettre :
- le message d'erreur exact (une capture d'écran suffit) ;
- la version de Typhon et le format d'export choisi ;
- le fichier journal (*typhon.log*).

Avec ces éléments, nous pourrons identifier rapidement la cause et vous proposer une solution.

Cordialement,
Le support technique Typhon
