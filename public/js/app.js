import { chapters } from './lessons.js';
import { schema } from './data.js';
import { localStore, saveProgress, matchingProgress } from './storage.js';
import { query, resetDatabase } from './worker-client.js';
import { download, escape as e, pad, resultTable } from './view.js';
import { teacherView, wireTeacher, sessionView, wireSession } from './teacher.js';

const main = document.querySelector('main');
const sidebar = document.querySelector('#sidebar');
const topNav = document.querySelector('#top-nav');
let progress = localStore.read('progress', {});
let overrides = localStore.read('exercises', {});
let session = localStore.read('session', null);
let selection = localStore.read('selection', null);
let route;
let renderId = 0;

function curriculum() {
  return chapters.map(chapter => {
    const builtin = chapter.exercises.map(exercise => overrides[exercise.id] || exercise);
    const additional = Object.values(overrides).filter(exercise => exercise.chapter === chapter.id && exercise.id.startsWith('custom-'));
    return { ...chapter, exercises: [...builtin, ...additional] };
  });
}

function activeCurriculum() {
  if (!session) return curriculum();
  return chapters.map(chapter => ({ ...chapter, exercises: session.exercises.filter(exercise => exercise.chapter === chapter.id) }));
}
const completed = list => list.filter(exercise => matchingProgress(progress, exercise).passed).length;
const href = (chapter, exercise) => `#chapitre/${chapter.id}${exercise ? '/' + exercise.id : ''}`;

function renderNav(active) {
  const links = [['accueil','Parcours'],['bases','Bases de données'],['enseignant','Espace enseignant']];
  topNav.innerHTML = links.map(([id, label]) => `<a href="#${id}"${route[0] === id || (id === 'accueil' && route[0] === 'chapitre') ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const all = active.flatMap(chapter => chapter.exercises);
  const count = completed(all);
  sidebar.innerHTML = `<div class="sidebar-inner">
    <div class="progress-block">
      <div class="progress-label"><strong>Ta progression</strong><span>${count} / ${all.length}</span></div>
      <progress value="${count}" max="${all.length || 1}" aria-label="Exercices validés"></progress>
      <p>${all.length ? 'Exercices validés' : 'Aucun exercice dans la séance'}</p>
    </div>
    <nav class="chapter-nav" aria-label="Les sept chapitres">
      <h2>Le parcours</h2>
      ${active.map((chapter, index) => `<a href="${href(chapter)}" aria-label="Chapitre ${index + 1} — ${chapter.title}" ${route[1] === chapter.id ? 'aria-current="page"' : ''}>
        <span class="rail-num">${pad(index)}</span><span>${chapter.title}</span>
        ${chapter.exercises.length && completed(chapter.exercises) === chapter.exercises.length ? '<span class="tick" aria-label="Terminé">✓</span>' : ''}
      </a>`).join('')}
    </nav>
    <div class="sidebar-bottom"><a href="#seance">Ouvrir une séance de TP <span aria-hidden="true">↗</span></a></div>
  </div>`;
}

function home(active) {
  const first = active.find(chapter => chapter.exercises.some(exercise => !matchingProgress(progress, exercise).passed)) || active[0];
  return `<div class="hero">
    <div class="hero-copy"><p class="eyebrow">Première &amp; Terminale NSI</p>
      <h1>Apprendre le SQL<br> en pratiquant.</h1>
      <p>Écris des requêtes, explore une base de données et compare tes résultats à ceux attendus.</p>
      <div class="actions"><a class="button primary" href="${href(first)}">${completed(active.flatMap(chapter => chapter.exercises)) ? 'Reprendre le parcours' : 'Commencer le parcours'} <span aria-hidden="true">→</span></a>
        <a class="button quiet" href="#bases">Explorer les tables</a></div>
    </div>
    <div class="hero-code"><div class="hero-code-top"><span><i></i><i></i><i></i></span><span>premiere_requete.sql</span></div>
      <div class="hero-code-body" aria-label="Exemple SQL"><code><span><i>01</i><b>SELECT DISTINCT</b> villecli</span><span><i>02</i><b>FROM</b> Clients</span><span><i>03</i><b>ORDER BY</b> villecli;</span></code></div>
      <a href="${href(active[0])}"><span aria-hidden="true">▷</span> Ouvrir le premier chapitre <span aria-hidden="true">↗</span></a>
    </div>
  </div>
  ${session ? `<p class="notice">Séance active <strong>${e(session.title)}</strong> · <a href="#seance">Gérer la séance</a></p>` : ''}
  <section class="programme" aria-labelledby="programme-title">
    <div class="section-title"><h2 id="programme-title">Les sept chapitres</h2><span>${active.flatMap(chapter => chapter.exercises).length} exercices</span></div>
    <div class="chapter-grid">${active.map((chapter, i) => `<a class="chapter-card" href="${href(chapter)}">
      <div class="card-top"><span class="chapter-number">${pad(i)}</span><span aria-hidden="true" class="arrow">↗</span></div>
      <h3>${chapter.title}</h3><p>${chapter.summary}</p>
      <div class="card-foot"><code>${chapter.keywords.slice(0, 3).join(' · ')}</code><span>${completed(chapter.exercises)}/${chapter.exercises.length}</span></div>
    </a>`).join('')}</div>
  </section>`;
}

function lesson(chapter, number) {
  const exerciseLinks = chapter.exercises.map((exercise, i) => `<a class="exercise-link" href="${href(chapter, exercise)}">
    <span class="exercise-index">${i + 1}</span><span><strong>${e(exercise.title)}</strong><small>${e(exercise.level)}</small></span>
    <span class="exercise-mark">${matchingProgress(progress, exercise).passed ? '✓ Validé' : '→'}</span>
  </a>`).join('');
  const next = activeCurriculum()[number + 1];
  return `<p class="crumb"><a href="#accueil">Parcours</a> <span aria-hidden="true">/</span> Chapitre ${pad(number)}</p>
    <header class="page-title"><h1>${chapter.title}</h1><p>${chapter.summary}</p><div class="tags">${chapter.keywords.map(keyword => `<code>${keyword}</code>`).join('')}</div></header>
    <div class="lesson-grid">
      <section class="panel"><h2>Synthèse</h2>${chapter.notes.map(note => `<p>${note}</p>`).join('')}</section>
      <section class="panel"><h2>Objectifs</h2><ul>${chapter.goals.map(goal => `<li>${goal}</li>`).join('')}</ul></section>
    </div>
    <section class="panel example"><h2>Exemple à exécuter</h2><p>${chapter.exampleNote}</p>
      <pre><code>${e(chapter.example)}</code></pre>
      <button class="button secondary" id="run-example">Exécuter l’exemple</button><div id="example-status" role="status"></div><div id="example-result"></div>
    </section>
    <section class="programme"><div class="section-title"><h2>Exercices</h2><span>${completed(chapter.exercises)} sur ${chapter.exercises.length} validés</span></div>
      <div class="exercise-list">${exerciseLinks || '<p class="notice">Cette séance ne contient aucun exercice de ce chapitre.</p>'}</div>
    </section>
    <section class="panel bilan"><h2>Bilan de compétences</h2><ul>${chapter.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
    ${next ? `<a class="button secondary" href="${href(next)}">Chapitre suivant <span aria-hidden="true">→</span></a>` : ''}</section>`;
}

function exerciseView(chapter, activity, index) {
  const current = matchingProgress(progress, activity);
  const next = chapter.exercises[index + 1];
  return `<p class="crumb"><a href="#accueil">Parcours</a> <span aria-hidden="true">/</span> <a href="${href(chapter)}">${chapter.title}</a></p>
    <header class="page-title"><p class="eyebrow">Exercice ${index + 1} sur ${chapter.exercises.length} · ${e(activity.level)}</p><h1>${e(activity.title)}</h1><p>${e(activity.task)}</p></header>
    <div id="passed-before" class="notice ok" ${current.passed ? '' : 'hidden'}>✓ Exercice déjà validé sur ce navigateur.</div>
    <div class="workbench">
      <section class="panel editor-panel">
        <div class="editor-top"><label for="sql-input">Ta requête SQL</label><span>SQLite</span></div>
        <textarea id="sql-input" rows="7" maxlength="12000" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="SELECT …" aria-describedby="editor-help">${e(current.draft || '')}</textarea>
        <div class="editor-controls"><div class="actions">
          <button type="button" class="button primary" id="verify">Vérifier</button>
          <button type="button" class="button secondary" id="run">Exécuter</button>
          <button type="button" class="button quiet" id="show-expected">Voir le résultat attendu</button>
        </div><p id="editor-help" class="small">Ctrl ou ⌘ + Entrée pour vérifier.</p></div>
      </section>
      <aside class="help panel"><h2>Aide à la requête</h2>
        <p><a href="#bases">Consulter le schéma des tables</a></p>
        <button class="button secondary" id="hint">Afficher l’indice 1</button><ol id="hints" aria-live="polite"></ol>
        <details><summary>Voir la correction expliquée</summary><pre><code>${e(activity.solution)}</code></pre><p>${e(activity.explanation)}</p></details>
        <p class="small">${activity.ordered ? 'L’ordre des lignes est évalué.' : 'Les lignes peuvent apparaître dans n’importe quel ordre.'} ${activity.headers ? 'Les en-têtes demandés sont évalués.' : ''}</p>
      </aside>
    </div>
    <div id="exercise-status" role="status"></div><div class="results" id="exercise-results"></div>
    <div class="exercise-nav"><a class="button quiet" href="${href(chapter)}">← Retour aux exercices</a>
      ${next ? `<a class="button secondary" href="${href(chapter, next)}">Exercice suivant →</a>` : ''}</div>`;
}

function bases() {
  return `<header class="page-title"><p class="eyebrow">Vidéothèque et boutique</p><h1>Bases de données</h1>
    <p>Explore les tables, leurs colonnes et les relations utilisées dans les exercices.</p></header>
    <section class="panel relations"><h2>Relations</h2>
      <p>Un client peut avoir plusieurs locations. Un film peut être associé à plusieurs locations. Chaque location désigne exactement un client et un film.</p>
      <div class="relation-grid"><code>Clients.codecli</code><span aria-label="un à plusieurs">1 → N</span><code>Locations.codecli</code>
        <code>Films.codefilm</code><span aria-label="un à plusieurs">1 → N</span><code>Locations.codefilm</code></div>
      <button class="button secondary" id="reset-base">Réinitialiser SQLite</button><div id="base-status" role="status"></div>
    </section>
    <section class="schema-grid" aria-label="Dictionnaire des tables">${schema.map(table => `<section class="panel">
      <h2><code>${table.name}</code></h2><p>${table.about}</p>
      <div class="table-scroll"><table><thead><tr><th scope="col">Colonne</th><th scope="col">Type</th><th scope="col">Rôle</th></tr></thead>
      <tbody>${table.columns.map(([column, type, desc]) => `<tr><th scope="row"><code>${column}</code></th><td>${type}</td><td>${desc}</td></tr>`).join('')}</tbody></table></div>
      <button class="button secondary sample" data-table="${table.name}">Voir les données de ${table.name}</button>
      <div id="sample-status-${table.name}" role="status"></div><div id="sample-${table.name}"></div>
    </section>`).join('')}</section>`;
}

function notice(node, message, tone = '') {
  node.innerHTML = `<p class="notice ${tone}">${e(message)}</p>`;
}

async function showQuery(sql, button, status, display, label) {
  button.disabled = true;
  notice(status, 'Exécution de la requête…');
  try {
    const result = await query(sql);
    display.innerHTML = resultTable(result, label);
    status.textContent = '';
  } catch (error) {
    notice(status, error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

function wireExercise(activity, id) {
  const editor = document.querySelector('#sql-input');
  const verify = document.querySelector('#verify');
  const run = document.querySelector('#run');
  const expected = document.querySelector('#show-expected');
  const status = document.querySelector('#exercise-status');
  const results = document.querySelector('#exercise-results');
  const hints = document.querySelector('#hints');
  const hint = document.querySelector('#hint');
  let shown = 0;
  hint.addEventListener('click', () => {
    hints.insertAdjacentHTML('beforeend', `<li>${e(activity.hints[shown++])}</li>`);
    hint.disabled = shown >= activity.hints.length;
    hint.textContent = hint.disabled ? 'Tous les indices sont affichés' : `Afficher l’indice ${shown + 1}`;
  });
  editor.addEventListener('input', () => saveProgress(progress, activity, editor.value));
  async function execute(action) {
    const sql = editor.value;
    verify.disabled = run.disabled = expected.disabled = true;
    results.innerHTML = '';
    notice(status, 'SQLite exécute la requête…');
    try {
      const result = await query(action === 'expected' ? activity.solution : sql, action === 'verify' ? activity : null);
      if (id !== renderId) return;
      if (action === 'verify') {
        saveProgress(progress, activity, editor.value, result);
        renderNav(activeCurriculum());
        if (result.correct) document.querySelector('#passed-before').hidden = true;
        results.innerHTML = resultTable(result.actual, 'Ton résultat') + resultTable(result.expected, 'Résultat attendu');
        notice(status, result.message, result.correct ? 'ok' : 'error');
      } else {
        results.innerHTML = resultTable(result, action === 'expected' ? 'Résultat attendu' : 'Ton résultat');
        status.textContent = '';
      }
    } catch (error) {
      if (id === renderId) notice(status, error.message, 'error');
    } finally {
      verify.disabled = run.disabled = expected.disabled = false;
    }
  }
  verify.addEventListener('click', () => execute('verify'));
  run.addEventListener('click', () => execute('run'));
  expected.addEventListener('click', () => execute('expected'));
  editor.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !verify.disabled) {
      event.preventDefault();
      execute('verify');
    }
  });
}

function render(moveFocus = false) {
  const id = ++renderId;
  route = (location.hash.slice(1) || 'accueil').split('/');
  if (route[0] === 'contenu') return;
  const active = activeCurriculum();
  renderNav(active);
  const context = {
    catalogue: curriculum(), overrides, selection, session,
    updateSelection(value) { selection = value; return localStore.write('selection', value); },
    updateSession(value) { session = value; localStore.write('session', value); render(); },
    updateExercise(exercise) {
      overrides = { ...overrides, [exercise.id]: exercise };
      localStore.write('exercises', overrides);
      render();
    },
    resetProgress() {
      progress = {};
      localStore.write('progress', progress);
      renderNav(activeCurriculum());
    },
    query, notice, download
  };
  if (route[0] === 'chapitre') {
    const number = active.findIndex(chapter => chapter.id === route[1]);
    const chapter = active[number];
    if (!chapter) {
      main.innerHTML = '<h1>Chapitre introuvable</h1><p><a href="#accueil">Revenir au parcours</a></p>';
    } else if (route[2]) {
      const index = chapter.exercises.findIndex(exercise => exercise.id === route[2]);
      const activity = chapter.exercises[index];
      main.innerHTML = activity ? exerciseView(chapter, activity, index)
        : `<h1>Exercice indisponible</h1><p><a href="${href(chapter)}">Revenir au chapitre</a></p>`;
      if (activity) wireExercise(activity, id);
    } else {
      main.innerHTML = lesson(chapter, number);
      const button = document.querySelector('#run-example');
      button.addEventListener('click', () => showQuery(chapter.example, button,
        document.querySelector('#example-status'), document.querySelector('#example-result'), 'Résultat de l’exemple'));
    }
  } else if (route[0] === 'bases') {
    main.innerHTML = bases();
    document.querySelector('#reset-base').addEventListener('click', () => {
      resetDatabase();
      main.querySelectorAll('[id^=sample-]').forEach(node => { node.textContent = ''; });
      notice(document.querySelector('#base-status'), 'La base SQLite a été réinitialisée.', 'ok');
    });
    document.querySelectorAll('.sample').forEach(button => button.addEventListener('click', () => {
      const name = button.dataset.table;
      showQuery(`SELECT * FROM ${name};`, button, document.querySelector('#sample-status-' + name),
        document.querySelector('#sample-' + name), 'Données de ' + name);
    }));
  } else if (route[0] === 'enseignant') {
    main.innerHTML = teacherView(context);
    wireTeacher(context, render);
  } else if (route[0] === 'seance') {
    main.innerHTML = sessionView(context);
    wireSession(context);
  } else {
    main.innerHTML = home(active);
  }
  if (!localStore.available) main.insertAdjacentHTML('afterbegin', '<p class="notice">Le stockage du navigateur est indisponible. Les changements peuvent disparaître au rechargement.</p>');
  document.title = `${main.querySelector('h1')?.textContent.replace(/\s+/g, ' ') || 'Parcours'} · NSI SQL Lab`;
  if (moveFocus) {
    main.focus();
    window.scrollTo(0, 0);
  }
}

document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});
window.addEventListener('hashchange', () => render(true));
render();
