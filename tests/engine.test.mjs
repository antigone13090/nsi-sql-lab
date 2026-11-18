import { test } from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { createLab, compare, explainError } from '../public/js/engine.js';
import { chapters } from '../public/js/lessons.js';
import { seed, variant } from '../public/js/data.js';

const SQL = await initSqlJs();
const lab = createLab(SQL);
const find = id => chapters.flatMap(chapter => chapter.exercises).find(exercise => exercise.id === id);

test('le programme comprend sept chapitres et 34 exercices uniques', () => {
  assert.deepEqual(chapters.map(chapter => chapter.exercises.length), [6, 6, 5, 6, 5, 3, 3]);
  assert.equal(new Set(chapters.flatMap(chapter => chapter.exercises.map(exercise => exercise.id))).size, 34);
});

for (const chapter of chapters) {
  test(`exemple exécutable — ${chapter.title}`, () => {
    assert.ok(lab.run(chapter.example).rows.length);
  });
  for (const exercise of chapter.exercises) {
    test(`corrigé sur les deux bases — ${exercise.id} ${exercise.title}`, () => {
      const result = lab.verify(exercise.solution, exercise);
      assert.ok(result.correct, result.message);
      assert.ok(result.expected.rows.length, 'Le tableau de référence doit contenir au moins une ligne.');
      assert.ok(lab.run(exercise.solution, true).rows.length);
    });
  }
}

test('comptages, jointure gauche, groupes et HAVING ont des résultats connus', () => {
  assert.deepEqual(lab.run('SELECT COUNT(*) FROM Locations').rows, [[24]]);
  assert.deepEqual(lab.run('SELECT COUNT(*) FROM Locations', true).rows, [[27]]);
  assert.deepEqual(lab.run(find('c6-1').solution).rows, [['Colmar', 2], ['Mulhouse', 2], ['Strasbourg', 4], ['Sélestat', 2]]);
  assert.deepEqual(lab.run(find('c7-3').solution).rows, [[1, 3], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2]]);
  assert.deepEqual(lab.run(find('c3-5').solution).rows, [['Atlas des silences'], ['Le Dernier Phare']]);
  assert.deepEqual(lab.run(find('c3-5').solution, true).rows, [['Le Dernier Phare']]);
  assert.deepEqual(lab.run(find('c5-3').solution).rows, [['2026-03-27', '2026-05-24']]);
});

test('les données sont reproductibles et les clés étrangères sont valides', () => {
  const db = new SQL.Database();
  try {
    db.run(seed + variant);
    assert.deepEqual(db.exec('PRAGMA foreign_key_check'), []);
    assert.throws(() => db.run("INSERT INTO Locations VALUES(99,999,1,'2026-03-01',1)"), /FOREIGN KEY/);
  } finally {
    db.close();
  }
});

test('acceptation d’une formulation équivalente avec OR ou filtre par sous-requête', () => {
  assert.ok(lab.verify("SELECT nomcli, villecli FROM Clients WHERE villecli = 'Colmar' OR villecli = 'Mulhouse'", find('c4-5')).correct);
  assert.ok(lab.verify('SELECT f.nomfilm FROM Films f WHERE NOT EXISTS (SELECT 1 FROM Locations l WHERE l.codefilm = f.codefilm)', find('c3-5')).correct);
  assert.ok(lab.verify('WITH villes AS (SELECT villecli FROM Clients) SELECT villecli FROM villes ORDER BY villecli DESC;', find('c1-1')).correct);
});

test('ordre, alias, doublons, types et NULL sont comparés selon la consigne', () => {
  assert.match(lab.verify('SELECT nompro, prixpro FROM Produit ORDER BY prixpro DESC, codepro;', find('c2-1')).message, /ordre/);
  assert.match(lab.verify('SELECT DISTINCT codefilm FROM Locations;', find('c1-5')).message, /alias/);
  assert.match(lab.verify('SELECT DISTINCT villecli FROM Clients;', find('c1-1')).message, /lignes/);
  assert.equal(compare({ columns: ['a'], rows: [[null], [1], [1]] }, { columns: ['b'], rows: [[1], [null], [1]] }), '');
  assert.match(compare({ columns: ['a'], rows: [[1]] }, { columns: ['a'], rows: [['1']] }), /valeurs/);
  assert.match(compare({ columns: ['a'], rows: [[null]] }, { columns: ['a'], rows: [['NULL']] }), /valeurs/);
  assert.equal(compare({ columns: ['a'], rows: [] }, { columns: ['b'], rows: [] }), '');
});

test('la base variante rejette une constante correcte sur la première base', () => {
  const exercise = { solution: 'SELECT COUNT(*) FROM Locations' };
  const result = lab.verify('SELECT 24;', exercise);
  assert.equal(result.correct, false);
  assert.match(result.message, /d’autres données/);
});

test('la lecture seule bloque les écritures et laisse intacte la base suivante', () => {
  for (const command of ['DELETE FROM Clients;', 'DROP TABLE Films;', "ATTACH DATABASE ':memory:' AS other;", 'PRAGMA query_only=OFF;']) {
    assert.throws(() => lab.run(command), /lecture seule/);
  }
  assert.throws(() => lab.run('SELECT 1; SELECT 2;'), /une seule/);
  assert.throws(() => lab.run('WITH x AS (SELECT 1) DELETE FROM Clients RETURNING codecli;'), /readonly/);
  assert.deepEqual(lab.run(" /* SQL */ -- premier test\nSELECT 'a;b'; -- fin").rows, [['a;b']]);
  assert.deepEqual(lab.run('SELECT COUNT(*) FROM Clients').rows, [[10]]);
});

test('les requêtes vides, volumineuses et les erreurs de syntaxe sont traitées', () => {
  assert.throws(() => lab.run(''), /Écris une requête/);
  assert.throws(() => lab.run('SELECT * FROM Clients a, Clients b, Clients c, Clients d'), /2 000 lignes/);
  assert.throws(() => lab.run('SELECT oops FROM Clients'), error => explainError(error).startsWith('Vérifie le nom de la colonne'));
  assert.throws(() => lab.run('SELECT FROM Clients'), error => explainError(error).startsWith('Syntaxe SQL'));
});
