// Les énoncés, données et corrections sont des créations pour NSI SQL Lab.
const activity = (id, title, task, solution, hints, explanation, options = {}) =>
  ({ id, title, task, solution, hints, explanation, level: 'Entraînement', ...options });
const ordered = { ordered: true };
const apply = { level: 'Application' };
const sortedApply = { ...ordered, ...apply };

export const chapters = [
  {
    id: 'colonnes', title: 'Afficher des colonnes', keywords: ['SELECT', 'FROM', 'DISTINCT', 'AS'],
    summary: 'Choisis les colonnes à afficher, élimine les répétitions et donne un nom au résultat.',
    goals: ['Distinguer une table, une ligne et une colonne.', 'Choisir et renommer les colonnes d’un résultat.'],
    notes: [
      'SELECT indique les colonnes à afficher. FROM choisit la table. Sépare plusieurs colonnes par une virgule. SELECT * affiche toutes les colonnes.',
      'DISTINCT retire les doublons sur l’ensemble des colonnes sélectionnées. AS donne un alias au résultat sans renommer la colonne de la table.'
    ],
    example: 'SELECT DISTINCT villecli AS "Ville"\nFROM Clients;',
    exampleNote: 'Chaque ville n’apparaît qu’une fois. Le titre de la colonne devient Ville.',
    skills: ['Je peux sélectionner des colonnes dans un ordre donné.', 'Je peux éliminer les doublons et attribuer un alias.'],
    exercises: [
      activity('c1-1','Les villes des adhérents','Affiche la ville de chaque client. Conserve les répétitions.', 'SELECT villecli FROM Clients;', ['La table est Clients.', 'Place villecli après SELECT.'], 'Une ligne du résultat correspond à un client. Plusieurs clients peuvent habiter dans la même ville.'),
      activity('c1-2','Un annuaire simple','Affiche le nom puis la ville de chaque client.', 'SELECT nomcli, villecli FROM Clients;', ['Prends deux colonnes dans Clients.', 'Sépare nomcli et villecli par une virgule.'], 'Les colonnes apparaissent dans l’ordre écrit après SELECT.'),
      activity('c1-3','Le catalogue complet','Affiche toutes les colonnes et toutes les lignes de Films, dans l’ordre des colonnes de la table.', 'SELECT * FROM Films;', ['Inspecte la table Films dans le schéma.', 'Le symbole * désigne toutes les colonnes.'], 'L’étoile développe automatiquement les colonnes dans l’ordre de la table.'),
      activity('c1-4','Films déjà loués','Affiche les codes de films présents dans Locations, une seule fois par code.', 'SELECT DISTINCT codefilm FROM Locations;', ['Pars de Locations pour trouver les films effectivement loués.', 'Place DISTINCT juste après SELECT.'], 'Plusieurs locations peuvent désigner le même film. DISTINCT conserve une ligne par code.'),
      activity('c1-5','Un en-tête lisible','Affiche les codes de films loués sans doublons, sous le titre exact Code du film.', 'SELECT DISTINCT codefilm AS "Code du film" FROM Locations;', ['Réutilise la logique de l’exercice précédent.', 'Écris AS "Code du film" après codefilm.'], 'AS change l’intitulé du résultat. Les guillemets doubles délimitent cet alias qui contient des espaces.', { headers: true }),
      activity('c1-6','Inventaire des genres','Affiche la liste des genres du catalogue, sans répétition, dans une colonne nommée Genre du catalogue.', 'SELECT DISTINCT genre AS "Genre du catalogue" FROM Films;', ['Commence par repérer la colonne qui indique le genre.', 'Combine DISTINCT et AS.'], 'DISTINCT déduplique les genres des lignes de Films. AS fixe le titre demandé.', { ...apply, headers: true })
    ]
  },
  {
    id: 'tri', title: 'Trier des données', keywords: ['ORDER BY', 'ASC', 'DESC'],
    summary: 'Range les résultats par prix, date ou ordre alphabétique, selon un ou plusieurs critères.',
    goals: ['Trier dans les deux sens.', 'Départager les égalités avec un second critère.'],
    notes: [
      'ORDER BY fixe l’ordre des lignes. ASC trie par ordre croissant et constitue le défaut. DESC trie par ordre décroissant.',
      'Sépare les critères par une virgule. Le second ne sert que lorsque le premier donne la même valeur. Sans ORDER BY, SQLite ne garantit aucun ordre.'
    ],
    example: 'SELECT nompro, prixpro\nFROM Produit\nORDER BY prixpro DESC, codepro ASC;',
    exampleNote: 'Les prix élevés apparaissent en premier. À prix égal, le plus petit code passe devant.',
    skills: ['Je peux choisir le sens du tri pour chaque colonne.', 'Je peux construire un tri déterministe en cas d’égalité.'],
    exercises: [
      activity('c2-1','Du moins cher au plus cher','Affiche le nom et le prix des produits, par prix croissant puis par code croissant en cas d’égalité.', 'SELECT nompro, prixpro FROM Produit ORDER BY prixpro ASC, codepro ASC;', ['Ajoute ORDER BY après FROM Produit.', 'Inscris prixpro puis codepro parmi les critères.'], 'Le prix est prioritaire. Le code départage les produits au même prix.', ordered),
      activity('c2-2','Les prix les plus élevés','Affiche le code et le prix des produits, du plus cher au moins cher. Départage par code croissant.', 'SELECT codepro, prixpro FROM Produit ORDER BY prixpro DESC, codepro;', ['Le prix doit décroître.', 'DESC s’applique au prix seulement.'], 'Sans direction explicite, le deuxième critère utilise ASC.', ordered),
      activity('c2-3','Annuaire par ville','Affiche la ville et le nom de chaque client. Trie par ville puis par nom, tous deux croissants.', 'SELECT villecli, nomcli FROM Clients ORDER BY villecli, nomcli;', ['Écris deux critères de tri.', 'Le premier critère est villecli.'], 'Toutes les lignes d’une ville sont contiguës et leurs noms sont triés à l’intérieur de ce groupe.', ordered),
      activity('c2-4','Catalogue de Z à A','Affiche les titres des films en ordre décroissant.', 'SELECT nomfilm FROM Films ORDER BY nomfilm DESC;', ['Sélectionne nomfilm.', 'Ajoute DESC au critère de tri.'], 'Le tri décroissant inverse l’ordre de comparaison des titres dans SQLite.', ordered),
      activity('c2-5','Chronologie des locations','Affiche la date puis le code de chaque location, de la plus ancienne à la plus récente. Départage par code croissant.', 'SELECT datedebut, codeloc FROM Locations ORDER BY datedebut, codeloc;', ['Les dates utilisent le format AAAA-MM-JJ.', 'Plusieurs locations peuvent partager la même date.'], 'Ce format ISO donne le même ordre en tri textuel et en tri chronologique.', ordered),
      activity('c2-6','Les dernières sorties','Affiche l’année et le titre des films, de l’année la plus récente à la plus ancienne, puis par titre croissant à année égale.', 'SELECT annee, nomfilm FROM Films ORDER BY annee DESC, nomfilm ASC;', ['Le sens change entre les deux critères.', 'Le titre doit être le second critère.'], 'L’année classe les films. Le titre trie ensuite les films d’une même année.', sortedApply)
    ]
  },
  {
    id: 'jointures', title: 'Effectuer des jointures', keywords: ['JOIN', 'INNER JOIN', 'LEFT OUTER JOIN', 'ON'],
    summary: 'Relie des tables pour lire les titres, les adhérents et les dates d’une location.',
    goals: ['Relier une clé primaire à une clé étrangère.', 'Expliquer les différences entre jointures interne et gauche.'],
    notes: [
      'JOIN ou INNER JOIN conserve les paires de lignes qui satisfont la condition ON. Une clé étrangère, comme Locations.codefilm, pointe vers la clé primaire Films.codefilm.',
      'LEFT OUTER JOIN conserve toutes les lignes de la table à gauche. En l’absence de correspondance, les colonnes de droite valent NULL.'
    ],
    example: 'SELECT f.nomfilm, l.datedebut\nFROM Films AS f\nJOIN Locations AS l ON f.codefilm = l.codefilm;',
    exampleNote: 'Chaque location est associée à son film. Un film loué plusieurs fois apparaît sur plusieurs lignes.',
    skills: ['Je peux qualifier une colonne avec le nom ou l’alias de sa table.', 'Je peux joindre deux ou trois tables et conserver des lignes sans correspondance.'],
    exercises: [
      activity('c3-1','Titres et dates','Pour chaque location, affiche le titre du film puis la date de début.', 'SELECT f.nomfilm, l.datedebut FROM Locations l JOIN Films f ON l.codefilm = f.codefilm;', ['Le titre vient de Films et la date de Locations.', 'Les deux tables partagent codefilm.'], 'La clé étrangère de la location permet de rechercher le titre du film dans Films.'),
      activity('c3-2','Qui a loué quoi ?','Affiche le nom du client puis le code du film pour chaque location.', 'SELECT c.nomcli, l.codefilm FROM Clients c INNER JOIN Locations l ON c.codecli = l.codecli;', ['Le nom vient de Clients.', 'Joins sur codecli, puis affiche le codefilm de Locations.'], 'La jointure interne produit une ligne par location et exclut les clients sans location.'),
      activity('c3-3','Tous les clients','Affiche, pour chaque client, son code puis le code de chacune de ses locations. Conserve les clients sans location avec un code de location NULL.', 'SELECT c.codecli, l.codeloc FROM Clients c LEFT OUTER JOIN Locations l ON c.codecli = l.codecli;', ['La table à conserver doit se trouver à gauche.', 'Sélectionne l.codeloc pour faire apparaître NULL si besoin.'], 'La jointure gauche donne une ligne à chaque client sans location. Pour les autres, elle donne une ligne par location.'),
      activity('c3-4','Le journal de la vidéothèque','Pour chaque location, affiche le nom du client, le titre du film et la date, dans cet ordre.', 'SELECT c.nomcli, f.nomfilm, l.datedebut FROM Locations l JOIN Clients c ON c.codecli = l.codecli JOIN Films f ON f.codefilm = l.codefilm;', ['Pars dans Locations, qui contient deux clés étrangères.', 'Écris une condition ON pour chaque JOIN.'], 'L’égalité sur codecli donne le client, celle sur codefilm donne le film.', apply),
      activity('c3-5','Films jamais loués','Affiche uniquement les titres des films sans location.', 'SELECT f.nomfilm FROM Films f LEFT JOIN Locations l ON f.codefilm = l.codefilm WHERE l.codeloc IS NULL;', ['Conserve tous les films grâce à LEFT JOIN.', 'Cherche les lignes où la clé de la table de droite IS NULL.'], 'La colonne l.codeloc vaut NULL uniquement quand le film n’a aucune location. WHERE est détaillé au chapitre suivant.', { level: 'Approfondissement facultatif' })
    ]
  },
  {
    id: 'filtres', title: 'Filtrer les enregistrements', keywords: ['WHERE', 'AND', 'OR', 'LIKE', 'BETWEEN', 'IN'],
    summary: 'Sélectionne les lignes qui répondent à un ou plusieurs critères.',
    goals: ['Combiner des conditions logiques.', 'Filtrer une date, une liste de valeurs ou un motif de texte.'],
    notes: [
      'WHERE conserve les lignes pour lesquelles la condition est vraie. AND exige deux conditions vraies, OR en exige au moins une. Utilise des parenthèses lorsque tu combines AND et OR.',
      'BETWEEN inclut les deux bornes. IN teste l’appartenance à une liste. Avec LIKE, % représente zéro ou plusieurs caractères, et _ exactement un. Écris les chaînes et les dates entre apostrophes.'
    ],
    example: "SELECT nomcli, villecli\nFROM Clients\nWHERE villecli IN ('Colmar', 'Strasbourg');",
    exampleNote: 'IN retient les clients de l’une des deux villes.',
    skills: ['Je peux écrire une condition et la combiner avec d’autres.', 'Je peux choisir entre BETWEEN, IN et LIKE selon le besoin.'],
    exercises: [
      activity('c4-1','Une fiche client','Affiche le nom du client dont le code est 1.', 'SELECT nomcli FROM Clients WHERE codecli = 1;', ['codecli est la clé primaire.', 'Compare codecli à un entier après WHERE.'], 'Une clé primaire identifie au plus un client.'),
      activity('c4-2','Les prénoms en C','Affiche les noms complets des clients dont le nom affiché commence par C.', "SELECT nomcli FROM Clients WHERE nomcli LIKE 'C%';", ['Utilise un motif LIKE.', 'Place % après C.'], 'Le % absorbe tous les caractères suivants, y compris un prénom ou un nom de longueur variable.'),
      activity('c4-3','Locations d’avril','Affiche les codes de location puis les dates du 1er au 30 avril 2026 inclus.', "SELECT codeloc, datedebut FROM Locations WHERE datedebut BETWEEN '2026-04-01' AND '2026-04-30';", ['Les dates sont stockées sous forme de texte ISO.', 'BETWEEN inclut les dates aux deux extrémités.'], 'Les deux bornes ISO permettent de sélectionner tout le mois, premier et dernier jour compris.'),
      activity('c4-4','En C ou en D','Affiche les noms qui commencent par C ou par D.', "SELECT nomcli FROM Clients WHERE nomcli LIKE 'C%' OR nomcli LIKE 'D%';", ['Écris un test LIKE par initiale.', 'Un seul test doit être vrai.'], 'OR conserve l’union des deux ensembles de noms.'),
      activity('c4-5','Deux villes','Affiche le nom puis la ville des clients de Colmar ou de Mulhouse.', "SELECT nomcli, villecli FROM Clients WHERE villecli IN ('Colmar', 'Mulhouse');", ['Compare villecli à deux valeurs possibles.', 'IN accepte une liste entre parenthèses.'], 'IN est équivalent ici à deux comparaisons d’égalité reliées par OR.'),
      activity('c4-6','Sélection en rayon','Affiche le nom et le stock des produits de type Jeu ou Accessoire dont le stock est strictement positif.', "SELECT nompro, stock FROM Produit WHERE categorie IN ('Jeu', 'Accessoire') AND stock > 0;", ['Il faut satisfaire le test sur le stock et le test sur la catégorie.', 'Si tu utilises OR, encadre les deux catégories de parenthèses.'], 'Le AND écarte les ruptures de stock dans les deux catégories.', apply)
    ]
  },
  {
    id: 'calculs', title: 'Effectuer des calculs', keywords: ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND'],
    summary: 'Calcule une valeur par ligne ou résume des lignes par des agrégats.',
    goals: ['Distinguer calcul par ligne et agrégat.', 'Choisir la bonne fonction et interpréter le résultat.'],
    notes: [
      'COUNT(*) compte les lignes. COUNT(colonne) compte les valeurs non NULL. SUM additionne, AVG calcule la moyenne et MIN/MAX retournent les extrêmes.',
      'ROUND(valeur, 2) arrondit à deux décimales. Une multiplication de colonnes peut produire un résultat par ligne. SUM appliquée à ce produit donne un total.'
    ],
    example: 'SELECT COUNT(*) AS locations,\n       ROUND(AVG(duree), 2) AS moyenne\nFROM Locations;',
    exampleNote: 'Le résultat contient une seule ligne avec l’effectif et la durée moyenne arrondie.',
    skills: ['Je peux passer d’une liste de lignes à une valeur résumée.', 'Je peux arrondir un calcul et distinguer un total d’une moyenne.'],
    exercises: [
      activity('c5-1','Combien de locations ?','Détermine combien de locations sont associées au client 1.', 'SELECT COUNT(*) FROM Locations WHERE codecli = 1;', ['Filtre les locations de ce client.', 'Compte ensuite les lignes retenues.'], 'WHERE sélectionne les lignes qui alimentent COUNT(*).'),
      activity('c5-2','Nombre total de jours','Calcule le total de jours de location pour le client 1.', 'SELECT SUM(duree) FROM Locations WHERE codecli = 1;', ['La colonne duree indique la durée de chaque ligne.', 'Additionne ses valeurs avec SUM.'], 'SUM additionne les durées. COUNT donnerait le nombre de locations.'),
      activity('c5-3','Première et dernière dates','Affiche la première puis la dernière date de début parmi toutes les locations.', 'SELECT MIN(datedebut), MAX(datedebut) FROM Locations;', ['Deux agrégats peuvent partager un SELECT.', 'Le format ISO permet d’utiliser MIN et MAX sur les dates.'], 'Les extrêmes dans l’ordre textuel ISO correspondent aux dates les plus ancienne et récente.'),
      activity('c5-4','Prix moyen','Calcule le prix unitaire moyen des produits, arrondi à deux décimales.', 'SELECT ROUND(AVG(prixpro), 2) FROM Produit;', ['AVG calcule la moyenne.', 'Place AVG à l’intérieur de ROUND.'], 'On arrondit la moyenne finale, plutôt que chaque prix avant calcul.'),
      activity('c5-5','Valeur du stock','Calcule la valeur totale du stock en euros : additionne, pour tous les produits, le prix unitaire multiplié par le stock. Arrondis à deux décimales.', 'SELECT ROUND(SUM(prixpro * stock), 2) FROM Produit;', ['Commence par prixpro * stock.', 'Applique SUM au produit, puis ROUND à la somme.'], 'Chaque produit contribue à hauteur de sa quantité en stock multipliée par son prix unitaire.', apply)
    ]
  },
  {
    id: 'groupes', title: 'Regrouper les données', keywords: ['GROUP BY', 'COUNT', 'SUM'],
    summary: 'Obtiens une ligne par ville, client ou film avec un calcul sur chaque groupe.',
    goals: ['Identifier la colonne qui forme les groupes.', 'Appliquer un agrégat dans chaque groupe.'],
    notes: [
      'GROUP BY rassemble les lignes qui partagent la même valeur. Chaque agrégat est calculé séparément dans chaque groupe.',
      'Pour une ligne par entité, groupe sur son identifiant. En SQL portable, indique aussi dans GROUP BY les colonnes affichées qui ne se trouvent pas dans un agrégat.'
    ],
    example: 'SELECT villecli, COUNT(*) AS clients\nFROM Clients\nGROUP BY villecli;',
    exampleNote: 'Les habitants de chaque ville forment un groupe. COUNT(*) compte les habitants de ce groupe.',
    skills: ['Je peux définir l’unité de regroupement.', 'Je peux compter les correspondances d’une jointure gauche avec COUNT(colonne).'],
    exercises: [
      activity('c6-1','Effectif par ville','Affiche chaque ville suivie de son nombre de clients.', 'SELECT villecli, COUNT(*) FROM Clients GROUP BY villecli;', ['Une ligne par ville indique un regroupement sur villecli.', 'COUNT(*) compte les lignes de chaque groupe.'], 'Les villes identiques sont rassemblées avant le comptage.'),
      activity('c6-2','Jours loués par client','Affiche le code de chaque client ayant loué, puis son nombre total de jours de location.', 'SELECT codecli, SUM(duree) FROM Locations GROUP BY codecli;', ['Chaque ligne du résultat représente un codecli différent.', 'Les durées s’additionnent dans chaque groupe.'], 'Les clients sans location sont absents de Locations, donc aucun groupe ne représente leur code.'),
      activity('c6-3','Popularité du catalogue','Affiche le titre de chaque film et son nombre de locations, y compris zéro.', 'SELECT f.nomfilm, COUNT(l.codeloc) FROM Films f LEFT JOIN Locations l ON f.codefilm = l.codefilm GROUP BY f.codefilm, f.nomfilm;', ['Conserve les films sans location avec LEFT JOIN.', 'Compte une colonne de Locations qui vaut NULL en l’absence de location.'], 'COUNT(l.codeloc) ignore les NULL. COUNT(*) compterait la ligne ajoutée par la jointure gauche.', apply)
    ]
  },
  {
    id: 'having', title: 'Filtrer les regroupements', keywords: ['HAVING', 'GROUP BY', 'WHERE'],
    summary: 'Garde les groupes qui satisfont une condition sur un effectif ou un total.',
    goals: ['Distinguer un filtre sur les lignes d’un filtre sur les groupes.', 'Combiner WHERE, GROUP BY et HAVING.'],
    notes: [
      'WHERE filtre les lignes avant le regroupement. HAVING sélectionne les groupes après le calcul des agrégats.',
      'Pour afficher seulement les groupes qui comptent au moins deux lignes, utilise GROUP BY suivi de HAVING COUNT(*) >= 2.'
    ],
    example: 'SELECT villecli, COUNT(*) AS clients\nFROM Clients\nGROUP BY villecli\nHAVING COUNT(*) >= 3;',
    exampleNote: 'On forme les groupes par ville, puis on garde ceux dont l’effectif atteint au moins trois.',
    skills: ['Je peux exprimer une condition sur le résultat d’un agrégat.', 'Je peux expliquer l’effet du placement d’un filtre.'],
    exercises: [
      activity('c7-1','Clients les plus actifs','Affiche le code des clients qui cumulent plus de 6 jours de location et leur total de jours.', 'SELECT codecli, SUM(duree) FROM Locations GROUP BY codecli HAVING SUM(duree) > 6;', ['Calcule d’abord le total pour chaque client.', 'La condition sur SUM se place dans HAVING.'], 'Une durée individuelle peut être inférieure au seuil. C’est le total du groupe qui doit dépasser 6.'),
      activity('c7-2','Films populaires','Affiche le titre puis le nombre de locations des films loués au moins trois fois.', 'SELECT f.nomfilm, COUNT(*) FROM Films f JOIN Locations l ON f.codefilm = l.codefilm GROUP BY f.codefilm, f.nomfilm HAVING COUNT(*) >= 3;', ['Joins les deux tables et forme un groupe par film.', 'Compte les lignes de chaque groupe et conserve les effectifs à partir de trois.'], 'La jointure interne donne une ligne par location. HAVING retient uniquement les groupes suffisamment grands.'),
      activity('c7-3','Fréquentation en avril','Pour avril 2026 uniquement, affiche les codes des clients ayant réalisé au moins deux locations et leur nombre de locations.', "SELECT codecli, COUNT(*) FROM Locations WHERE datedebut BETWEEN '2026-04-01' AND '2026-04-30' GROUP BY codecli HAVING COUNT(*) >= 2;", ['Le mois est un critère sur chaque ligne.', 'Le nombre de locations est un critère sur le groupe.'], 'WHERE limite les lignes à avril. GROUP BY forme les groupes. HAVING écarte les groupes à une seule location.', apply)
    ]
  }
];
