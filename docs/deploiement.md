# Déploiement

## GitHub Pages

1. Créez un dépôt public vide nommé `nsi-sql-lab` et importez les sources, y compris le dossier caché `.github`.
2. Dans **Settings → Pages**, définissez **Source → GitHub Actions**. GitHub Pages est disponible avec GitHub Free pour un dépôt public. Les pièces d’origine, les identifiants d’élèves et les secrets ne doivent pas être ajoutés au dépôt.
3. Dans **Actions → Publier sur GitHub Pages**, déclenchez le workflow depuis `main`. Le workflow s’exécute ensuite à chaque modification de `main`.
4. Ouvrez l’URL de déploiement indiquée par le workflow ou par **Settings → Pages**. Vérifiez un exemple exécutable et une correction depuis l’adresse publiée.

Depuis un terminal, pour pousser les sources du projet vers le dépôt vide :

```sh
git init -b main
git add .
git commit -m "Initialiser NSI SQL Lab"
git remote add origin https://github.com/VOTRE-COMPTE/nsi-sql-lab.git
git push -u origin main
```

[Documentation officielle de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Hébergement statique ou hors connexion

`npm ci` puis `npm run build` génèrent `dist/`. Déposez **le contenu complet** de ce dossier sur un hébergement statique, à la racine ou sous un sous-chemin. Le serveur doit délivrer les scripts avec un type MIME JavaScript. Le type `application/wasm` permet le chargement en streaming.

Sur un poste isolé, décompressez l’archive livrée et lancez `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist` depuis le répertoire du projet. Ensuite ouvrez [http://127.0.0.1:8000/](http://127.0.0.1:8000/). Sur Windows, remplacez `python3` par `py -3` si nécessaire. Ni Node.js ni Internet ne sont nécessaires pour cette version déjà compilée. Sur un réseau de classe, demandez au serveur pédagogique de servir le dossier `dist/` aux élèves.
