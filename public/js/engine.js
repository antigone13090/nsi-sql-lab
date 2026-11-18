import { seed, variant } from './data.js';

const ROW_LIMIT = 2000;
const leadingTrivia = /^(?:[\s;]+|--[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?(?:\*\/|$))+/;

export function createLab(SQL) {
  function snapshot(extra = '') {
    const database = new SQL.Database();
    try {
      database.run(seed + extra);
      return database.export();
    } finally {
      database.close();
    }
  }

  const base = snapshot();
  const alternate = snapshot(variant);

  function run(sql, useVariant = false) {
    if (typeof sql !== 'string' || !sql.trim()) throw new Error('Écris une requête avant de lancer l’exécution.');
    if (sql.length > 12000) throw new Error('La requête dépasse la taille maximale de 12 000 caractères.');
    if (sql.includes('\0')) throw new Error('La requête contient un caractère nul.');
    const query = sql.replace(leadingTrivia, '');
    if (!/^(SELECT|WITH)\b/i.test(query)) throw new Error('Utilise une requête SELECT. La base est en lecture seule.');

    const database = new SQL.Database(useVariant ? alternate : base);
    try {
      database.run('PRAGMA query_only = ON');
      const statements = database.iterateStatements(query);
      const statement = statements.next().value;
      if (!statement) throw new Error('Écris une requête SELECT.');
      try {
        if (statements.getRemainingSQL().replace(leadingTrivia, '')) {
          throw new Error('Exécute une seule requête à la fois.');
        }
        const columns = statement.getColumnNames();
        if (columns.length === 0) {
          throw new Error('La requête doit renvoyer un tableau. Utilise SELECT en lecture seule.');
        }
        const rows = [];
        while (statement.step()) {
          if (rows.length === ROW_LIMIT) throw new Error('Plus de 2 000 lignes. Vérifie les jointures ou réduis le résultat.');
          rows.push(statement.get());
        }
        return { columns, rows };
      } finally {
        statements.return();
      }
    } finally {
      database.close();
    }
  }

  function verify(sql, exercise) {
    const expected = run(exercise.solution);
    const actual = run(sql);
    const options = { ordered: exercise.ordered, headers: exercise.headers };
    const difference = compare(expected, actual, options);
    const alternateDifference = difference || compare(run(exercise.solution, true), run(sql, true), options);
    return {
      actual, expected, correct: !alternateDifference,
      message: difference || (alternateDifference
        ? 'Le tableau visible correspond, mais la requête échoue sur d’autres données. Vérifie que ta méthode se généralise.'
        : 'Bravo ! Le résultat est correct sur les deux jeux de données.')
    };
  }

  return { run, verify };
}

function rowKey(row) {
  return JSON.stringify(row.map(value => {
    if (value instanceof Uint8Array) return { blob: Array.from(value) };
    if (typeof value === 'number' && Number.isFinite(value)) return Number(value.toPrecision(12));
    if (typeof value === 'number') return { numeric: String(value) };
    return value;
  }));
}

export function compare(expected, actual, { ordered = false, headers = false } = {}) {
  if (actual.columns.length !== expected.columns.length) {
    return `Nombre de colonnes attendu : ${expected.columns.length}, obtenu : ${actual.columns.length}.`;
  }
  if (headers && expected.columns.some((column, index) => column !== actual.columns[index])) {
    return 'Les noms de colonnes diffèrent. Vérifie les alias demandés dans la consigne.';
  }
  if (actual.rows.length !== expected.rows.length) {
    return `Nombre de lignes attendu : ${expected.rows.length}, obtenu : ${actual.rows.length}.`;
  }
  const target = expected.rows.map(rowKey);
  const submitted = actual.rows.map(rowKey);
  const sameOrder = target.every((key, index) => key === submitted[index]);
  if (sameOrder) return '';
  target.sort();
  submitted.sort();
  if (!target.every((key, index) => key === submitted[index])) {
    return 'Certaines valeurs diffèrent. Compare les colonnes, les filtres et les éventuels doublons.';
  }
  return ordered ? 'Les valeurs correspondent, mais l’ordre des lignes diffère. Vérifie ORDER BY.' : '';
}

export function explainError(error) {
  const message = error.message || String(error);
  if (/no such table/i.test(message)) return `Table inconnue. Consulte le schéma. (${message})`;
  if (/no such column|ambiguous column/i.test(message)) return `Vérifie le nom de la colonne et précise sa table si nécessaire. (${message})`;
  if (/syntax error|incomplete input/i.test(message)) return `Syntaxe SQL à vérifier. Relis les mots-clés, virgules et parenthèses. (${message})`;
  if (/readonly/i.test(message)) return 'Cette opération modifie la base. Seules les requêtes de lecture sont autorisées.';
  if (/misuse of aggregate/i.test(message)) return 'La fonction d’agrégat est mal placée. Pour filtrer un résultat calculé par groupe, utilise HAVING.';
  return message;
}
