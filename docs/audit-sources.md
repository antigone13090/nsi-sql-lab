# Audit des sources Colibri

L’archive fournie sous le nom `sql(1).zip` correspond à l’archive SQL mentionnée dans la demande. Le PDF joint numéroté « (2) » compte huit pages. Il contient 41 images intégrées. Les titres et numéros de pages sont extractibles en texte, tandis que les synthèses, les requêtes et les tableaux sont dans les captures. Ils ont été examinés à partir des images et de leur transcription OCR.

## Fonctionnement reconstitué

La copie HTTrack contient une page de **sommaire**. Ses accordéons peuvent se déplier avec les scripts embarqués. Les liens de pratique, de synthèse et de cours pointent vers des pages distantes `/fr/course/practice/` absentes de la copie. Le JavaScript présent gère le sommaire, les messages et plusieurs fonctionnalités reliées au serveur comme la connexion, le signalement et la visite guidée. Il ne contient aucun moteur SQLite, éditeur SQL ni algorithme de validation des réponses. Les captures attestent la présence d’un champ de requête, d’un bouton Vérifier, d’un raccourci clavier, de messages de statut et de tableaux comparatifs. Elles ne révèlent pas l’implémentation originale de l’exécution ou du correcteur. Aucun dump, CSV, schéma intégral, ensemble complet d’énoncés ou recueil complet de corrigés n’a été trouvé, cache imbriqué compris.

Le sommaire original liste aussi des chapitres d’écriture et de définition de données. La reconstruction couvre les **sept lectures** demandées. Aucun téléchargement ou appel aux routes historiques n’est nécessaire.

## Lecture du PDF et adaptation

| Pages | Notions et indices visibles | Exercices créés |
| --- | --- | ---: |
| 1–2 | SELECT, FROM, étoile, DISTINCT et alias. Villes et noms de clients, catalogue Films et codes de films loués. | 6 |
| 2–3 | ORDER BY par prix en ordre croissant ou décroissant, villes, titres et dates. Départage de plusieurs critères décrit dans la synthèse. | 6 |
| 3–4 | Jointures internes entre films et locations, jointure gauche des clients et requête à trois tables. | 5 |
| 5 | Égalité, initiales avec LIKE, intervalle de dates, OR et appartenance. La date impossible relevée dans une capture est remplacée par un intervalle ISO valide. | 6 |
| 5–6 | Durée totale, première ou dernière date, comptage et calcul monétaire arrondi. Les exercices ajoutent un prix moyen et une valeur de stock. | 5 |
| 7 | Effectifs par ville et calcul par film ou client. La reconstruction inclut le comptage à zéro avec jointure gauche. | 3 |
| 7–8 | Seuil sur le cumul des durées, seuil sur le nombre de locations. Exercice d’application combinant le filtre du mois et un effectif minimum. | 3 |

Les énoncés, explications, indices, requêtes de référence et exemples sont rédigés pour ce projet. La progression et les thèmes proviennent des supports. Certains écrans montrent une requête déjà saisie ou un résultat partiel, avec des énoncés incomplets ou illisibles. Les exemples SQLite utilisent des apostrophes pour les valeurs textuelles et des guillemets doubles pour les alias. Le schéma, les jeux de données, la comparaison sur une deuxième base, le stockage local et l’espace enseignant sont des créations du projet.

| Table | Éléments attestés | Données et éléments reconstruits |
| --- | --- | --- |
| Clients | `codecli`, `nomcli`, `villecli` | 10 clients aux noms fictifs, répartis sur quatre villes. |
| Films | `codefilm`, `nomfilm` | 10 titres fictifs avec genre, année et tarif. Certains films sont sans location. |
| Locations | `codecli`, `codefilm`, `datedebut`, `duree` | 24 locations datées de 2026, identifiant `codeloc`, deux clés étrangères et durée positive. |
| Produit | Table indépendante, `prixpro` | 10 produits fictifs avec code, nom, catégorie et stock. Prix égaux et stocks nuls inclus. |

La variante de correction contient 12 clients, 11 films, 27 locations et 11 produits. Aucune ligne de données relevée dans les captures n’est importée.

## Licences et ressources

Aucun fichier de licence général ni permission de republication des supports Colibri n’a été identifié dans les pièces. Les fichiers tiers contiennent parfois une notice propre. Le site livré n’intègre aucune copie de code, de feuille de style, d’image, de marque graphique, de données ni de texte tirée de l’archive et du PDF. La palette bleue et les retours verts ou rouges reprennent des conventions visuelles générales. Le moteur tiers utilisé dans le projet vient de la distribution npm officielle de sql.js et sa licence est jointe.

## Inventaire de l’archive

33 fichiers, hors 26 entrées de répertoire. Dans les chemins ci-dessous, `colibri/` désigne `sql/sql/colibri.unistra.fr/`. Le cache ZIP interne contient des entrées d’URL et des copies ou métadonnées de la capture HTTrack.

| Fichier | Taille (octets) | Rôle |
| --- | ---: | --- |
| `sql/backblue.gif` | 4243 | Fond de la page d’index HTTrack |
| `sql/fade.gif` | 828 | Motif de la page d’index HTTrack |
| `sql/index.html` | 5046 | Index généré par HTTrack |
| `sql/sql.whtt` | 0 | Marqueur de projet HTTrack, vide |
| `sql/sql/backblue.gif` | 4243 | Fond de la page d’index HTTrack |
| `colibri/application/assets/bootflat/img/check_flat/default.html` | 281 | Page de réponse liée à une ressource graphique indisponible |
| `colibri/application/assets/css/style44ca.css` | 779738 | Feuille de style Colibri et styles agrégés |
| `colibri/application/assets/images/logo-colibri.png` | 8698 | Logo Colibri |
| `colibri/application/assets/images/logo-idex.png` | 40740 | Logo IdEx |
| `colibri/application/assets/images/logo-iut.png` | 22965 | Logo IUT |
| `colibri/application/assets/images/logo-uds.png` | 25790 | Logo de l’Université de Strasbourg |
| `colibri/application/assets/images/logo/utilisateur/auto/135_logo_auto.png` | 5253 | Image de profil ou de cours référencée par le sommaire |
| `colibri/application/assets/js/bug44ca.js` | 3778 | Interface de signalement et appels distants |
| `colibri/application/assets/js/course44ca.js` | 683 | Ouverture et fermeture des accordéons du sommaire |
| `colibri/application/assets/js/helpers/message44ca.js` | 2431 | Construction des messages d’interface |
| `colibri/application/assets/js/helpers/route44ca.js` | 3075 | Génération des URL à partir de la configuration des routes |
| `colibri/application/assets/js/tour44ca.js` | 5875 | Visite guidée chargée depuis le serveur |
| `colibri/application/vendor/Bootflat/js/bootstrap.minffaf.js` | 31926 | Bibliothèque de composants Bootstrap |
| `colibri/application/vendor/Bootflat/js/jquery-1.10.1.minffaf.js` | 93064 | jQuery 1.10.1 |
| `colibri/application/vendor/bootstrap-social/bootstrap-socialffaf.css` | 28218 | Styles pour les boutons de réseaux sociaux |
| `colibri/application/vendor/bootstrap-tour/build/css/bootstrap-tour.minffaf.css` | 2000 | Styles de la visite guidée |
| `colibri/application/vendor/bootstrap-tour/build/js/bootstrap-tour.minffaf.js` | 20541 | Bibliothèque Bootstrap Tour |
| `colibri/fr/course/list/notions-de-base-en-sql.html` | 78783 | Sommaire Colibri et liens vers les activités distantes |
| `sql/sql/cookies.txt` | 256 | Fichier de cookies du miroir, exclu des livrables |
| `sql/sql/fade.gif` | 828 | Motif de la page d’index HTTrack |
| `sql/sql/hts-cache/doit.log` | 714 | Paramètres de la capture HTTrack |
| `sql/sql/hts-cache/new.lst` | 1601 | Liste des URL capturées |
| `sql/sql/hts-cache/new.txt` | 12108 | Index des transferts et métadonnées HTTrack |
| `sql/sql/hts-cache/new.zip` | 121123 | Cache imbriqué de la capture HTTrack |
| `sql/sql/hts-cache/readme.txt` | 614 | Description du dossier de cache HTTrack |
| `sql/sql/hts-cache/winprofile.ini` | 1344 | Profil de configuration WinHTTrack |
| `sql/sql/hts-log.txt` | 1453 | Journal de capture HTTrack |
| `sql/sql/index.html` | 5340 | Index généré par HTTrack |

Le cache imbriqué contient 35 entrées :

- `https://colibri.unistra.fr/fr/course/list/notions-de-base-en-sql`
- `https://colibri.unistra.fr/robots.txt`
- `http://colibri.unistra.fr/application/assets/css/style.css?v=1.4.0`
- `http://colibri.unistra.fr/application/vendor/bootstrap-tour/build/css/bootstrap-tour.min.css?v=1.4`
- `https://colibri.unistra.fr/application/assets/css/style.css?v=1.4.0`
- `https://colibri.unistra.fr/application/vendor/bootstrap-tour/build/css/bootstrap-tour.min.css?v=1.4`
- `http://colibri.unistra.fr/application/vendor/bootstrap-social/bootstrap-social.css?v=1.4`
- `https://colibri.unistra.fr/application/vendor/bootstrap-social/bootstrap-social.css?v=1.4`
- `http://colibri.unistra.fr/application/assets/images/logo-colibri.png`
- `https://colibri.unistra.fr/application/assets/images/logo-colibri.png`
- `http://colibri.unistra.fr/application/assets/images/logo-idex.png`
- `https://colibri.unistra.fr/application/assets/images/logo-idex.png`
- `http://colibri.unistra.fr/application/assets/images/logo/utilisateur/auto/135_logo_auto.png`
- `https://colibri.unistra.fr/application/assets/images/logo/utilisateur/auto/135_logo_auto.png`
- `http://colibri.unistra.fr/application/assets/images/logo-uds.png`
- `https://colibri.unistra.fr/application/assets/images/logo-uds.png`
- `http://colibri.unistra.fr/application/assets/images/logo-iut.png`
- `https://colibri.unistra.fr/application/assets/images/logo-iut.png`
- `http://colibri.unistra.fr/application/vendor/Bootflat/js/jquery-1.10.1.min.js?v=1.4`
- `http://colibri.unistra.fr/application/vendor/Bootflat/js/bootstrap.min.js?v=1.4`
- `https://colibri.unistra.fr/application/vendor/Bootflat/js/jquery-1.10.1.min.js?v=1.4`
- `https://colibri.unistra.fr/application/vendor/Bootflat/js/bootstrap.min.js?v=1.4`
- `http://colibri.unistra.fr/application/assets/js/helpers/route.js?v=1.4.0`
- `https://colibri.unistra.fr/application/assets/js/helpers/route.js?v=1.4.0`
- `http://colibri.unistra.fr/application/assets/js/helpers/message.js?v=1.4.0`
- `https://colibri.unistra.fr/application/assets/js/helpers/message.js?v=1.4.0`
- `http://colibri.unistra.fr/application/assets/js/course.js?v=1.4.0`
- `https://colibri.unistra.fr/application/assets/js/course.js?v=1.4.0`
- `http://colibri.unistra.fr/application/assets/js/bug.js?v=1.4.0`
- `https://colibri.unistra.fr/application/assets/js/bug.js?v=1.4.0`
- `http://colibri.unistra.fr/application/vendor/bootstrap-tour/build/js/bootstrap-tour.min.js?v=1.4`
- `https://colibri.unistra.fr/application/vendor/bootstrap-tour/build/js/bootstrap-tour.min.js?v=1.4`
- `http://colibri.unistra.fr/application/assets/js/tour.js?v=1.4.0`
- `https://colibri.unistra.fr/application/assets/js/tour.js?v=1.4.0`
- `https://colibri.unistra.fr/application/assets/bootflat/img/check_flat/default.png`
