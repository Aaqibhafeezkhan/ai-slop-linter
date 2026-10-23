# Notes sur le serveur

Le serveur de test redémarre chaque nuit à trois heures. Hier, le redémarrage a duré onze minutes, parce que la base de données vérifiait ses index. Quand le disque est plein, le service refuse les envois et prévient par courriel.

Marta a réglé le délai d'attente sur 30 secondes. Avec cette valeur, le tableau se charge bien au bureau, mais plus lentement à la maison. La connexion pourrait être la cause, même si personne ne l'a mesuré.

Le guide d'installation peut aider les débutants, mais il ne couvre pas les droits réseau. Pierre écrira cette partie la semaine prochaine.
