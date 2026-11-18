# Guide enseignant

## Préparer un TP

1. Ouvrez **Espace enseignant**. Saisissez un titre, déroulez les chapitres et cochez les exercices à proposer.
2. Pour une séance de 55 minutes sur les filtres, sélectionnez « Une fiche client », « Locations d’avril », « Deux villes » et « Sélection en rayon ». Comptez cinq minutes de prise en main, dix minutes de démonstration et trente minutes de pratique. Gardez les dix dernières minutes pour comparer IN à OR et discuter des parenthèses.
3. Exportez la **fiche élève** et le **corrigé** en Markdown. Exportez la **séance JSON** pour que chaque élève retrouve la sélection et les éventuels exercices ajoutés. Essayez aussi **Activer la séance ici** pour la prévisualiser.
4. Distribuez l’adresse de l’hébergement statique et le fichier JSON. Les élèves ouvrent **Ouvrir une séance de TP**, importent le fichier, puis cliquent sur **Commencer la séance**.

Le fichier de séance interactif contient les requêtes de référence. Les élèves peuvent déjà afficher les corrigés dans l’application. Pour un exercice sans corrigé distribué, transmettez uniquement la fiche élève. Un site statique ne permet pas de rendre les solutions intégrées confidentielles.

## En classe

1. Commencez par **Bases de données** et faites identifier les clés de Clients, Films et Locations. Produit est une table indépendante.
2. Ouvrez un chapitre, lisez la synthèse et exécutez l’exemple.
3. Dans un exercice, **Exécuter** teste la requête, et **Vérifier** compare le résultat obtenu au résultat attendu. Les deux tableaux restent visibles après la vérification. L’ordre des lignes et les intitulés sont évalués lorsque la consigne le demande.
4. Demandez un premier essai avant de consulter les indices ou le corrigé. Relisez le bilan de compétences au retour sur le chapitre.

Les noms et les films sont fictifs. Les brouillons, validations et sélections restent dans le stockage local du navigateur. Ils ne sont pas synchronisés entre postes. Sur un ordinateur partagé, **Réinitialiser la progression** efface uniquement les brouillons et validations de cette application. **Réinitialiser SQLite** redémarre le moteur et laisse la progression en place.

## Créer un exercice

Dans l’espace enseignant, sélectionnez un exercice à modifier ou choisissez **Nouvel exercice**. Renseignez un énoncé précis, une requête de référence, jusqu’à cinq indices et une explication. Activez l’évaluation de l’ordre uniquement si l’énoncé précise un tri et les critères qui départagent les égalités. Activez l’évaluation des en-têtes si l’énoncé demande des noms exacts. Testez et enregistrez, puis ajoutez l’exercice à votre sélection. Réexportez la séance après modification.

Une séance importée conserve sa propre copie des exercices. Les modifications locales du catalogue s’appliquent aux futures séances exportées. N’ajoutez pas de nom d’élève ni de donnée de classe personnelle dans un fichier à distribuer.
