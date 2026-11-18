export const schema = [
  { name: 'Clients', about: 'Les adhérents de la vidéothèque.', columns: [
    ['codecli', 'INTEGER', 'Clé primaire'], ['nomcli', 'TEXT', 'Nom fictif'], ['villecli', 'TEXT', 'Ville']
  ] },
  { name: 'Films', about: 'Les films du catalogue.', columns: [
    ['codefilm', 'INTEGER', 'Clé primaire'], ['nomfilm', 'TEXT', 'Titre fictif'], ['genre', 'TEXT', 'Genre'],
    ['annee', 'INTEGER', 'Année de sortie'], ['tarif', 'REAL', 'Prix de location par jour, en euros']
  ] },
  { name: 'Locations', about: 'Chaque ligne correspond à une location d’un film par un client.', columns: [
    ['codeloc', 'INTEGER', 'Clé primaire'], ['codecli', 'INTEGER', 'Clé étrangère vers Clients.codecli'],
    ['codefilm', 'INTEGER', 'Clé étrangère vers Films.codefilm'],
    ['datedebut', 'TEXT', 'Date ISO au format AAAA-MM-JJ'], ['duree', 'INTEGER', 'Durée en jours']
  ] },
  { name: 'Produit', about: 'Les articles de la boutique. Cette table est indépendante.', columns: [
    ['codepro', 'INTEGER', 'Clé primaire'], ['nompro', 'TEXT', 'Libellé'], ['categorie', 'TEXT', 'Famille'],
    ['prixpro', 'REAL', 'Prix unitaire en euros'], ['stock', 'INTEGER', 'Quantité en stock']
  ] }
];

export const seed = `
PRAGMA foreign_keys = ON;
CREATE TABLE Clients(codecli INTEGER PRIMARY KEY, nomcli TEXT NOT NULL, villecli TEXT NOT NULL);
CREATE TABLE Films(codefilm INTEGER PRIMARY KEY, nomfilm TEXT NOT NULL, genre TEXT NOT NULL,
  annee INTEGER NOT NULL, tarif REAL NOT NULL CHECK(tarif > 0));
CREATE TABLE Locations(codeloc INTEGER PRIMARY KEY, codecli INTEGER NOT NULL REFERENCES Clients(codecli),
  codefilm INTEGER NOT NULL REFERENCES Films(codefilm), datedebut TEXT NOT NULL, duree INTEGER NOT NULL CHECK(duree > 0));
CREATE TABLE Produit(codepro INTEGER PRIMARY KEY, nompro TEXT NOT NULL, categorie TEXT NOT NULL,
  prixpro REAL NOT NULL CHECK(prixpro >= 0), stock INTEGER NOT NULL CHECK(stock >= 0));

INSERT INTO Clients VALUES
 (1,'Camille Orme','Strasbourg'),(2,'Dorian Lune','Colmar'),(3,'Lina Silex','Strasbourg'),
 (4,'Nora Houx','Mulhouse'),(5,'Célia Nacre','Sélestat'),(6,'Sami Brume','Colmar'),
 (7,'Ana Saule','Strasbourg'),(8,'Jules Érable','Mulhouse'),(9,'Maël Rivage','Sélestat'),
 (10,'Zoé Flocon','Strasbourg');
INSERT INTO Films VALUES
 (1,'La Cité des lucioles','Animation',2017,2.5),(2,'Orbites croisées','Science-fiction',2022,3.4),
 (3,'Les Archives du vent','Documentaire',2019,2),(4,'Au bout du quai','Drame',2016,2.6),
 (5,'Le Bal des nuages','Animation',2023,3.2),(6,'La Route de givre','Aventure',2021,3.4),
 (7,'Le Signal d’Opale','Science-fiction',2018,2.8),(8,'Sous les toits','Drame',2020,2.6),
 (9,'Atlas des silences','Documentaire',2024,3.1),(10,'Le Dernier Phare','Aventure',2022,3.4);
INSERT INTO Locations VALUES
 (1,1,2,'2026-03-27',2),(2,2,1,'2026-04-01',4),(3,1,5,'2026-04-03',3),
 (4,3,3,'2026-04-03',2),(5,4,2,'2026-04-05',3),(6,6,6,'2026-04-08',5),
 (7,5,1,'2026-04-09',4),(8,3,2,'2026-04-10',2),(9,1,2,'2026-04-12',4),
 (10,7,4,'2026-04-13',1),(11,4,7,'2026-04-17',2),(12,8,6,'2026-04-20',2),
 (13,2,5,'2026-04-22',1),(14,5,3,'2026-04-25',2),(15,6,7,'2026-04-28',3),
 (16,1,8,'2026-04-30',1),(17,8,8,'2026-05-01',2),(18,2,2,'2026-05-08',3),
 (19,3,4,'2026-05-12',1),(20,4,3,'2026-05-15',3),(21,7,5,'2026-05-16',2),
 (22,5,6,'2026-05-19',2),(23,6,8,'2026-05-20',4),(24,8,7,'2026-05-24',1);
INSERT INTO Produit VALUES
 (1,'Affiche A3','Papeterie',5.5,12),(2,'Carnet kraft','Papeterie',4.8,18),
 (3,'Badge étoile','Accessoire',2.5,29),(4,'Mug bleu','Accessoire',8.9,7),
 (5,'Marque-page','Papeterie',2.5,22),(6,'Puzzle du phare','Jeu',12.5,4),
 (7,'Jeu des silhouettes','Jeu',8.9,0),(8,'Cabas cinéma','Accessoire',7.2,5),
 (9,'Cartes paysages','Papeterie',4.8,8),(10,'Mini-jeu des genres','Jeu',5.5,3);
`;

// Une seconde base change les effectifs, les valeurs et les correspondances.
export const variant = `
INSERT INTO Clients VALUES (11,'Diane Mistral','Colmar'),(12,'Carla Ardoise','Obernai');
INSERT INTO Films VALUES (11,'Le Jardin imaginaire','Animation',2025,4.1);
INSERT INTO Locations VALUES (25,11,2,'2026-04-01',5),(26,11,9,'2026-04-30',3),(27,5,11,'2026-05-04',2);
INSERT INTO Produit VALUES (11,'Album des affiches','Papeterie',9.4,0);
UPDATE Produit SET prixpro = 6.2 WHERE codepro = 5;
UPDATE Locations SET duree = 6 WHERE codeloc = 3;
`;
