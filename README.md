# NSI SQL Lab

Atelier interactif de SQL en français pour la Première et la Terminale NSI. Sept chapitres, sept exemples exécutables, 34 exercices corrigés et un espace enseignant. Le moteur SQLite s’exécute dans le navigateur. Aucune création de compte n’est nécessaire pour la version statique.

[Ouvrir la version en ligne de NSI SQL Lab](https://nsi-sql-lab.qspldf.chatgpt.site/)

## Démarrer

Avec Node.js 24 et npm sur l’ordinateur de préparation :

```sh
npm ci
npm start
```

Ouvrir [http://127.0.0.1:8000/](http://127.0.0.1:8000/). La première installation télécharge les dépendances. Une version déjà compilée fonctionne hors connexion, servie depuis un serveur statique local.

Pour lancer la version déjà compilée de l’archive, ouvrir un terminal dans son répertoire et exécuter :

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Ouvrir ensuite la même adresse. L’ouverture directe de `index.html` en `file://` empêche le chargement des modules JavaScript ou du worker dans les navigateurs courants.

## Guides

- [Guide enseignant](docs/enseignant.md)
- [Déploiement gratuit sur GitHub Pages ou sur un serveur statique](docs/deploiement.md)
- [Audit des fichiers d’origine et adaptations](docs/audit-sources.md)
- [Architecture et règles de correction](docs/architecture.md)

## Vérifier le projet

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Le premier ensemble teste les requêtes, la correction et le format de séance. Le second lance Chromium et couvre les parcours élève et enseignant. Le workflow `ci.yml` exécute ces commandes sur les branches et PR. Le workflow `pages.yml` publie seulement les fichiers compilés.

## Licence

Le code, les énoncés et les données fictives de ce projet sont sous [licence MIT](LICENSE). La distribution reprend le moteur libre [sql.js](https://github.com/sql-js/sql.js), sous licence MIT, et joint ses notices. Les documents et ressources du site Colibri ont servi de référence pédagogique et restent hors des sources distribuées.
