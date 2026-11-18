const prefix = 'nsi-sql-lab:v1:';

export const localStore = {
  available: true,
  read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback;
    } catch {
      this.available = false;
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(prefix + key, JSON.stringify(value));
      return true;
    } catch {
      this.available = false;
      return false;
    }
  }
};

export function saveProgress(progress, exercise, sql, result) {
  const previous = matchingProgress(progress, exercise);
  progress[exercise.id] = {
    definition: JSON.stringify([exercise.solution, !!exercise.ordered, !!exercise.headers]),
    draft: sql,
    passed: Boolean(result?.correct || previous?.passed),
    attempts: (previous?.attempts || 0) + (result ? 1 : 0)
  };
  localStore.write('progress', progress);
}

export function matchingProgress(progress, exercise) {
  const record = progress[exercise.id];
  return record?.definition === JSON.stringify([exercise.solution, !!exercise.ordered, !!exercise.headers]) ? record : {};
}
