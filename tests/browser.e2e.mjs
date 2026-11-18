import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { promises as fs } from 'node:fs';
import { chromium } from 'playwright';
import { siteServer } from '../scripts/serve.mjs';
import { chapters } from '../public/js/lessons.js';

let browser;
let server;
let origin;
before(async () => {
  server = siteServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  if (server?.listening) await new Promise(resolve => server.close(resolve));
});
const heading = (page, name) => page.getByRole('heading', { name, exact: true });
const button = (page, name) => page.getByRole('button', { name, exact: true });

test('les sept chapitres et les sept exemples s’ouvrent dans Chromium', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(origin);
    await heading(page, 'Les sept chapitres').waitFor();
    assert.equal(await page.locator('.chapter-card').count(), 7);
    for (const [index, chapter] of chapters.entries()) {
      await page.getByRole('link', { name: `Chapitre ${index + 1} — ${chapter.title}`, exact: true }).click();
      await heading(page, chapter.title).waitFor();
      await button(page, 'Exécuter l’exemple').click();
      await heading(page, 'Résultat de l’exemple').waitFor();
      assert.ok(await page.locator('#example-result tbody tr').count());
    }
  } finally {
    await page.close();
  }
});

test('éditeur, progression, erreur et affichage adapté sur tablette', async () => {
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  try {
    await page.goto(origin + '/#chapitre/colonnes/c1-1');
    await button(page, 'Afficher l’indice 1').click();
    await page.getByText('La table est Clients.', { exact: true }).waitFor();
    await button(page, 'Voir le résultat attendu').click();
    await heading(page, 'Résultat attendu').waitFor();
    assert.equal(await page.locator('#exercise-results tbody tr').count(), 10);
    const editor = page.getByLabel('Ta requête SQL');
    await editor.fill('SELECT FROM Clients;');
    await button(page, 'Vérifier').click();
    await page.getByText(/Syntaxe SQL à vérifier/).waitFor();
    await editor.fill('SELECT villecli FROM Clients ORDER BY villecli DESC;');
    await editor.press('Control+Enter');
    await page.getByText(/Bravo ! Le résultat/).waitFor();
    assert.equal(await page.locator('#exercise-results table').count(), 2);
    assert.equal(await page.locator('progress').getAttribute('value'), '1');
    await page.reload();
    await page.getByText(/Exercice déjà validé/).waitFor();
    assert.equal(await editor.inputValue(), 'SELECT villecli FROM Clients ORDER BY villecli DESC;');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.goto(origin + '/#bases');
    await button(page, 'Voir les données de Locations').click();
    await heading(page, 'Données de Locations').waitFor();
    assert.equal(await page.locator('#sample-Locations tbody tr').count(), 24);
    await button(page, 'Réinitialiser SQLite').click();
    await page.getByText(/SQLite a été réinitialisée/).waitFor();
    assert.equal(await page.locator('#sample-Locations table').count(), 0);
  } finally {
    await page.close();
  }
});

test('création, édition, exports, import dans un autre navigateur et reset', async () => {
  const teacher = await browser.newPage({ acceptDownloads: true });
  const student = await browser.newPage();
  try {
    await teacher.goto(origin + '/#enseignant');
    const edit = teacher.locator('#editor-form');
    await edit.locator('[name=title]').fill('Défi du catalogue');
    await edit.locator('[name=task]').fill('Compte les films du catalogue.');
    await edit.locator('[name=solution]').fill('SELECT COUNT(*) FROM Films;');
    await edit.locator('[name=hints]').fill('Compte les lignes.\nUtilise COUNT.');
    await edit.locator('[name=explanation]').fill('COUNT(*) compte toutes les lignes.');
    await edit.getByRole('button', { name: 'Tester et enregistrer' }).click();
    await teacher.getByText(/Exercice enregistré/).waitFor();
    await edit.locator('[name=title]').fill('Défi catalogue modifié');
    await edit.getByRole('button', { name: 'Tester et enregistrer' }).click();
    await teacher.getByText(/Exercice enregistré/).waitFor();
    await button(teacher, 'Tout désélectionner').click();
    await teacher.locator('.teacher-chapter > summary').first().click();
    await teacher.getByLabel('Défi catalogue modifié', { exact: true }).check();
    const exportFile = async label => {
      const pending = teacher.waitForEvent('download');
      await button(teacher, label).click();
      return pending;
    };
    const worksheet = await fs.readFile(await (await exportFile('Exporter la fiche élève (.md)')).path(), 'utf8');
    assert.match(worksheet, /Compte les films du catalogue/);
    assert.doesNotMatch(worksheet, /SELECT COUNT/);
    const answers = await fs.readFile(await (await exportFile('Exporter le corrigé (.md)')).path(), 'utf8');
    assert.match(answers, /SELECT COUNT/);
    const json = await (await exportFile('Exporter la séance (.json)')).path();
    await student.goto(origin + '/#seance');
    await student.locator('#import-session').setInputFiles(json);
    await student.getByRole('link', { name: 'Commencer la séance' }).click();
    await heading(student, 'Défi catalogue modifié').waitFor();
    await student.getByLabel('Ta requête SQL').fill('SELECT COUNT(codefilm) FROM Films;');
    await button(student, 'Vérifier').click();
    await student.getByText(/Bravo ! Le résultat/).waitFor();
    await student.goto(origin + '/#enseignant');
    student.once('dialog', dialog => dialog.accept());
    await button(student, 'Réinitialiser la progression').click();
    await student.getByText('La progression a été réinitialisée.').waitFor();
    assert.equal(await student.locator('progress').getAttribute('value'), '0');
  } finally {
    await teacher.close();
    await student.close();
  }
});
