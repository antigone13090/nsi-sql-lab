import { chapters } from './lessons.js';
import { escape as e } from './view.js';

const levels = ['Entraînement', 'Application', 'Approfondissement facultatif'];
const chapterIds = new Set(chapters.map(chapter => chapter.id));
const standardIds = new Map(chapters.flatMap(chapter => chapter.exercises.map(exercise => [exercise.id, chapter.id])));

function randomId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

function field(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

export function validateSession(value) {
  if (!value || value.format !== 'nsi-sql-lab-seance-v1' || !field(value.title, 120)
    || !Array.isArray(value.exercises) || value.exercises.length < 1 || value.exercises.length > 120) {
    throw new Error('Séance invalide. Choisis un fichier JSON exporté par NSI SQL Lab.');
  }
  const seen = new Set();
  const exercises = value.exercises.map(exercise => {
    if (!exercise || typeof exercise.id !== 'string' || !chapterIds.has(exercise.chapter)
      || !(standardIds.get(exercise.id) === exercise.chapter || /^custom-[a-f\d-]{36}$/.test(exercise.id))
      || seen.has(exercise.id) || !levels.includes(exercise.level) || !field(exercise.title, 120)
      || !field(exercise.task, 2000) || !field(exercise.solution, 12000) || !field(exercise.explanation, 2400)
      || typeof exercise.ordered !== 'boolean' || typeof exercise.headers !== 'boolean'
      || !Array.isArray(exercise.hints) || exercise.hints.length < 1 || exercise.hints.length > 5
      || exercise.hints.some(hint => !field(hint, 400))) {
      throw new Error('Un exercice du fichier est invalide ou apparaît plusieurs fois.');
    }
    seen.add(exercise.id);
    const { id, chapter, level, title, task, solution, explanation, ordered, headers, hints } = exercise;
    return { id, chapter, level, title, task, solution, explanation, ordered, headers, hints };
  });
  return { format: value.format, title: value.title.trim(), exercises };
}

export function worksheet(session, answers) {
  const lines = [`# ${session.title.replaceAll('\n', ' ')}`, '', answers ? 'Corrigé enseignant' : 'Fiche élève', '',
    'Schéma des tables et pratique dans NSI SQL Lab.', ''];
  for (const chapter of chapters) {
    const list = session.exercises.filter(exercise => exercise.chapter === chapter.id);
    if (!list.length) continue;
    lines.push('## ' + chapter.title, '');
    list.forEach((exercise, index) => {
      lines.push(`### ${index + 1}. ${exercise.title}`, '', exercise.task, '');
      if (answers) {
        const fence = '`'.repeat(Math.max(3, ...Array.from(exercise.solution.matchAll(/`+/g), match => match[0].length + 1)));
        lines.push(fence + 'sql', exercise.solution, fence, '', exercise.explanation, '');
      }
    });
  }
  return lines.join('\n');
}

export function teacherView({ catalogue, selection }) {
  const options = catalogue.map(chapter => `<optgroup label="${e(chapter.title)}">${chapter.exercises.map(exercise =>
    `<option value="${exercise.id}">${e(exercise.title)}</option>`).join('')}</optgroup>`).join('');
  const list = catalogue.map(chapter => `<details class="teacher-chapter"><summary>${chapter.title} <span>${chapter.exercises.length}</span></summary>
    <div class="teacher-list">${chapter.exercises.map(exercise => `<div class="teacher-row">
      <label><input type="checkbox" name="include" value="${exercise.id}" ${!selection || selection.ids.includes(exercise.id) ? 'checked' : ''}> ${e(exercise.title)}</label>
      <details><summary>Énoncé et correction</summary><p>${e(exercise.task)}</p><pre><code>${e(exercise.solution)}</code></pre><p>${e(exercise.explanation)}</p>
      <button class="button secondary edit-shortcut" data-id="${exercise.id}" type="button">Modifier cet exercice</button></details>
    </div>`).join('')}</div></details>`).join('');
  return `<header class="page-title"><h1>Espace enseignant</h1>
    <p>Choisissez les exercices, créez une séance et exportez les documents à distribuer.</p></header>
    <p class="notice">Les corrigés sont accessibles dans l’application. Les modifications et la progression sont enregistrées dans ce navigateur. Aucun compte élève n’est créé.</p>
    <section class="panel teacher-section"><h2>Préparer une séance de TP</h2>
      <form id="selection-form">
      <label class="field">Titre de la séance<input id="session-title" required maxlength="120" value="${e(selection?.title || 'TP SQL')}"></label>
      <div class="actions"><button type="button" class="button quiet" id="select-all">Tout sélectionner</button>
        <button type="button" class="button quiet" id="deselect-all">Tout désélectionner</button></div>
      <div class="teacher-catalogue">${list}</div>
      <div class="actions"><button type="submit" class="button primary">Activer la séance ici</button>
        <button type="button" class="button secondary" data-export="json">Exporter la séance (.json)</button>
        <button type="button" class="button secondary" data-export="student">Exporter la fiche élève (.md)</button>
        <button type="button" class="button secondary" data-export="answers">Exporter le corrigé (.md)</button></div>
      <div id="selection-status" role="status"></div></form>
    </section>
    <section class="panel teacher-section" id="edition"><h2>Créer ou modifier un exercice</h2>
      <label class="field">Exercice à éditer<select id="exercise-select"><option value="">Nouvel exercice</option>${options}</select></label>
      <form id="editor-form">
        <div class="form-grid">
          <label class="field">Chapitre<select name="chapter">${chapters.map(chapter => `<option value="${chapter.id}">${chapter.title}</option>`).join('')}</select></label>
          <label class="field">Type d’exercice<select name="level">${levels.map(level => `<option>${level}</option>`).join('')}</select></label>
        </div>
        <label class="field">Titre<input name="title" required maxlength="120"></label>
        <label class="field">Énoncé<textarea name="task" required maxlength="2000" rows="3"></textarea></label>
        <label class="field">Requête de référence<textarea class="code-input" name="solution" required maxlength="12000" rows="4" spellcheck="false"></textarea></label>
        <label class="field">Indices progressifs (un par ligne, cinq maximum)<textarea name="hints" required maxlength="2004" rows="3"></textarea></label>
        <label class="field">Explication du corrigé<textarea name="explanation" required maxlength="2400" rows="3"></textarea></label>
        <div class="checks"><label><input type="checkbox" name="ordered"> Évaluer l’ordre des lignes</label><label><input type="checkbox" name="headers"> Évaluer les en-têtes de colonnes</label></div>
        <div class="actions"><button class="button primary" type="submit">Tester et enregistrer</button><button class="button secondary" type="button" id="test-reference">Tester la requête</button></div>
        <div id="edit-status" role="status"></div>
      </form>
    </section>
    <section class="panel teacher-section"><h2>Progression locale</h2>
      <p>Efface les validations et les brouillons enregistrés dans ce navigateur.</p>
      <button type="button" class="button danger" id="reset-progress">Réinitialiser la progression</button><div id="progress-status" role="status"></div>
    </section>`;
}

export function wireTeacher(context) {
  const { catalogue, notice, download } = context;
  const all = catalogue.flatMap(chapter => chapter.exercises.map(exercise => ({ ...exercise, chapter: chapter.id })));
  const form = document.querySelector('#selection-form');
  const checks = Array.from(form.querySelectorAll('[name=include]'));
  const status = document.querySelector('#selection-status');
  const title = document.querySelector('#session-title');
  function saveSelection() {
    const ids = checks.filter(check => check.checked).map(check => check.value);
    context.updateSelection({ title: title.value, ids });
    return ids;
  }
  form.addEventListener('input', saveSelection);
  for (const [id, check] of [['select-all', true], ['deselect-all', false]]) {
    document.querySelector('#' + id).addEventListener('click', () => {
      checks.forEach(box => { box.checked = check; });
      saveSelection();
    });
  }
  function prepare() {
    const ids = new Set(saveSelection());
    return validateSession({
      format: 'nsi-sql-lab-seance-v1', title: title.value,
      exercises: all.filter(exercise => ids.has(exercise.id)).map(exercise => ({
        ...exercise, ordered: Boolean(exercise.ordered), headers: Boolean(exercise.headers)
      }))
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      context.updateSession(prepare());
      location.hash = 'seance';
    } catch (error) {
      notice(status, error.message + ' Vérifie le titre et la sélection.', 'error');
    }
  });
  for (const button of form.querySelectorAll('[data-export]')) {
    button.addEventListener('click', () => {
      try {
        const session = prepare();
        if (button.dataset.export === 'json') {
          download('seance-nsi-sql.json', JSON.stringify(session, null, 2), 'application/json');
        } else {
          const answers = button.dataset.export === 'answers';
          download(answers ? 'corrige-tp-sql.md' : 'fiche-eleve-tp-sql.md', worksheet(session, answers), 'text/markdown;charset=utf-8');
        }
        notice(status, 'Fichier prêt à être téléchargé.', 'ok');
      } catch (error) {
        notice(status, error.message + ' Vérifie le titre et la sélection.', 'error');
      }
    });
  }

  const selector = document.querySelector('#exercise-select');
  const editor = document.querySelector('#editor-form');
  const editStatus = document.querySelector('#edit-status');
  const testing = document.querySelector('#test-reference');
  const save = editor.querySelector('[type=submit]');
  function populate() {
    const exercise = all.find(item => item.id === selector.value);
    editor.reset();
    if (exercise) {
      for (const key of ['chapter', 'level', 'title', 'task', 'solution', 'explanation']) editor.elements[key].value = exercise[key];
      editor.elements.hints.value = exercise.hints.join('\n');
      editor.elements.ordered.checked = Boolean(exercise.ordered);
      editor.elements.headers.checked = Boolean(exercise.headers);
    }
    editor.elements.chapter.disabled = Boolean(exercise);
    editStatus.textContent = '';
  }
  selector.addEventListener('change', populate);
  for (const button of form.querySelectorAll('.edit-shortcut')) {
    button.addEventListener('click', () => {
      selector.value = button.dataset.id;
      populate();
      selector.focus();
    });
  }

  async function checkReference(persist) {
    const data = new FormData(editor);
    const solution = String(data.get('solution')).trim();
    testing.disabled = save.disabled = true;
    notice(editStatus, 'Vérification de la requête de référence…');
    try {
      if (!persist) {
        const result = await context.query(solution);
        notice(editStatus, `La requête renvoie ${result.rows.length} ligne(s).`, 'ok');
        return;
      }
      const { exercises: [exercise] } = validateSession({
        format: 'nsi-sql-lab-seance-v1', title: 'Exercice',
        exercises: [{
          id: selector.value || 'custom-' + randomId(), chapter: editor.elements.chapter.value, level: data.get('level'),
          title: String(data.get('title')).trim(), task: String(data.get('task')).trim(), solution,
          hints: String(data.get('hints')).split(/\r?\n/).map(hint => hint.trim()).filter(Boolean),
          explanation: String(data.get('explanation')).trim(), ordered: data.has('ordered'), headers: data.has('headers')
        }]
      });
      const result = await context.query(solution, exercise);
      if (!result.correct) throw new Error('La requête ne produit pas un résultat stable. Vérifie les fonctions aléatoires ou l’ordre des lignes.');
      if (!editor.isConnected) return;
      context.updateExercise(exercise);
      const updatedSelector = document.querySelector('#exercise-select');
      updatedSelector.value = exercise.id;
      updatedSelector.dispatchEvent(new Event('change'));
      notice(document.querySelector('#edit-status'), 'Exercice enregistré. Une séance déjà active garde sa propre copie.', 'ok');
    } catch (error) {
      notice(editStatus, error.message, 'error');
    } finally {
      testing.disabled = save.disabled = false;
    }
  }
  testing.addEventListener('click', () => checkReference(false));
  editor.addEventListener('submit', event => {
    event.preventDefault();
    checkReference(true);
  });
  document.querySelector('#reset-progress').addEventListener('click', () => {
    if (!window.confirm('Effacer la progression et les brouillons de ce navigateur ?')) return;
    context.resetProgress();
    notice(document.querySelector('#progress-status'), 'La progression a été réinitialisée.', 'ok');
  });
}

export function sessionView({ session }) {
  return `<header class="page-title"><h1>Séance de TP</h1>
    <p>Ouvre le fichier JSON transmis par ton enseignant pour accéder aux exercices de la séance.</p></header>
    <section class="panel teacher-section"><h2>${session ? e(session.title) : 'Ouvrir une séance'}</h2>
    ${session ? `<p>${session.exercises.length} exercices sélectionnés.</p><div class="actions">
      <a class="button primary" href="#chapitre/${session.exercises[0].chapter}/${session.exercises[0].id}">Commencer la séance</a>
      <button type="button" class="button quiet" id="end-session">Revenir au catalogue complet</button></div>` : ''}
    <label class="field">Fichier de séance (.json)<input id="import-session" type="file" accept=".json,application/json"></label>
    <div id="import-status" role="status"></div></section>`;
}

export function wireSession(context) {
  document.querySelector('#end-session')?.addEventListener('click', () => context.updateSession(null));
  const input = document.querySelector('#import-session');
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const status = document.querySelector('#import-status');
    input.disabled = true;
    try {
      if (file.size > 2000000) throw new Error('Le fichier de séance dépasse 2 Mo.');
      const session = validateSession(JSON.parse(await file.text()));
      if (input.isConnected) context.updateSession(session);
    } catch (error) {
      context.notice(status, error instanceof SyntaxError ? 'Ce fichier ne contient pas un JSON valide.' : error.message, 'error');
      input.value = '';
    } finally {
      input.disabled = false;
    }
  });
}
