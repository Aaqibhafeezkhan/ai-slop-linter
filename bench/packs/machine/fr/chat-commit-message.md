```
feat(client): ajoute un cache des requêtes HTTP et corrige une fuite mémoire

Ajoute un cache des réponses HTTP dans le client de Bulle afin d'éviter
les requêtes redondantes et de réduire la latence et la consommation
réseau.

Corrige également une fuite de mémoire dans le même module : les
ressources associées aux requêtes (écouteurs, références aux réponses)
n'étaient pas libérées correctement après leur traitement et
s'accumulaient au fil de l'utilisation.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

Je n'ai pas vu le diff, donc j'ai décrit la fuite de façon générique (écouteurs et références non libérés). Dis-moi la cause réelle, la stratégie d'invalidation du cache ou sa durée de vie (TTL), et j'ajusterai le message. Si tu préfères deux commits séparés (un `feat` et un `fix`), c'est en général plus propre pour l'historique.
