let worker;
let sequence = 0;
let pending;

function reset(error) {
  worker?.terminate();
  worker = null;
  if (pending) {
    clearTimeout(pending.timer);
    pending.reject(error);
    pending = null;
  }
}

export function query(sql, exercise) {
  if (pending) return Promise.reject(new Error('Une requête est déjà en cours.'));
  if (!worker) {
    worker = new Worker(new URL('./sql-worker.js', import.meta.url), { type: 'module' });
    worker.onerror = event => {
      console.error('SQLite Web Worker', event.message);
      reset(new Error('Impossible de charger SQLite. Recharge la page et vérifie l’accès aux fichiers du site.'));
    };
    worker.onmessage = ({ data }) => {
      if (pending?.id !== data.id) return;
      const { resolve, reject, timer } = pending;
      clearTimeout(timer);
      pending = null;
      if (data.error) reject(new Error(data.error));
      else resolve(data.result);
    };
  }
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => reset(new Error('La requête a dépassé cinq secondes. Vérifie les jointures ou simplifie le calcul.')), 5000);
    pending = { id, resolve, reject, timer };
    worker.postMessage({ id, sql, exercise });
  });
}

export function resetDatabase() {
  reset(new Error('La base a été réinitialisée.'));
}
