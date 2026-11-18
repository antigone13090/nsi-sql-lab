import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSession, worksheet } from '../public/js/teacher.js';
import { chapters } from '../public/js/lessons.js';

const chapter = chapters[0];
const exercise = { ...chapter.exercises[0], chapter: chapter.id, ordered: false, headers: false };
const value = { format: 'nsi-sql-lab-seance-v1', title: '  SQL Première ', exercises: [exercise] };

test('une séance peut être exportée puis relue et les fiches élève ne contiennent pas le corrigé', () => {
  const session = validateSession(JSON.parse(JSON.stringify(value)));
  assert.equal(session.title, 'SQL Première');
  assert.ok(worksheet(session, false).includes(exercise.task));
  assert.ok(!worksheet(session, false).includes(exercise.solution));
  assert.ok(worksheet(session, true).includes(exercise.solution));
});

test('le format refuse les chapitres inconnus, les identifiants dupliqués et les exercices incomplets', () => {
  assert.throws(() => validateSession({ ...value, exercises: [exercise, exercise] }), /plusieurs fois/);
  assert.throws(() => validateSession({ ...value, exercises: [{ ...exercise, chapter: 'autre' }] }), /invalide/);
  assert.throws(() => validateSession({ ...value, exercises: [{ ...exercise, hints: [] }] }), /invalide/);
  assert.throws(() => validateSession({ ...value, exercises: [{ ...exercise, id: '__proto__' }] }), /invalide/);
});
