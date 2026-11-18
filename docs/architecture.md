# Architecture

- `public/js/data.js` crée quatre tables avec leurs clés et deux jeux de données reproductibles. La variante ajoute des films, des clients, des locations et un produit, et modifie certaines valeurs.
- `public/js/lessons.js` contient les synthèses et les exercices d’origine du projet. Les supports Colibri ne sont pas distribués.
- `public/js/engine.js` exécute une requête de lecture sur un instantané SQLite neuf. Le worker impose un délai de cinq secondes par action. En cas de dépassement, il est recréé à la demande suivante.
- `public/js/storage.js` isole le stockage de progression. Un éventuel suivi individualisé pourrait remplacer cet adaptateur par un stockage authentifié avec consentement et règles de conservation. Aucun service, compte ni identifiant d’élève n’est actuellement créé.
- `public/js/teacher.js` définit le format JSON versionné des séances et produit les fiches Markdown. Les copies de séance sont autonomes.
- `scripts/build.mjs` assemble les fichiers statiques, WebAssembly et les notices sql.js. Les navigateurs récupèrent les fichiers sur le même hébergement, sans CDN externe.

## Correction

Le moteur calcule les tableaux attendus et obtenus. Il compare l’ordre et le nombre des colonnes, le nombre des lignes, le contenu typé des cellules et la multiplicité des doublons. La comparaison des en-têtes se fait uniquement quand la consigne demande des intitulés précis. Les exercices de tri comparent dans l’ordre demandé. Les autres comparent les lignes indépendamment de l’ordre.

Les valeurs numériques sont comparées après normalisation à 12 chiffres significatifs pour éviter les écarts mineurs de calcul en virgule flottante. Les textes, NULL et les nombres restent distincts. Si les résultats visibles concordent, le site évalue aussi la requête sur une base variante. Cela détecte des réponses codées en dur, sans établir l’équivalence de deux requêtes sur toutes les bases possibles.

Seules les requêtes de lecture SELECT et les SELECT précédés de WITH sont attendus. SQLite impose `PRAGMA query_only` sur la connexion et l’application rejette les requêtes multiples. Les résultats sont limités à 2 000 lignes, dont 80 visibles par tableau. Les requêtes longues sont interrompues au niveau du worker. Pour un exercice de tri à ordre évalué, précisez un départage en cas d’égalité.
