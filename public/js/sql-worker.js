import { createLab, explainError } from './engine.js';
import initSqlJs from '../vendor/sql-wasm.js';

const sqlite = initSqlJs({
  locateFile: file => new URL('../vendor/' + file, import.meta.url).href
}).then(createLab);

self.onmessage = async ({ data }) => {
  try {
    const lab = await sqlite;
    const result = data.exercise ? lab.verify(data.sql, data.exercise) : lab.run(data.sql);
    self.postMessage({ id: data.id, result });
  } catch (error) {
    self.postMessage({ id: data.id, error: explainError(error) });
  }
};
