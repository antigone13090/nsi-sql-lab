import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';

const require = createRequire(import.meta.url);
const sqlRoot = resolve(dirname(require.resolve('sql.js')), '..');
const output = new URL('../dist/', import.meta.url);
const vendor = new URL('vendor/', output);

await rm(output, { recursive: true, force: true });
await cp(new URL('../public/', import.meta.url), output, { recursive: true });
await mkdir(vendor);
const browserLoader = await readFile(resolve(sqlRoot, 'dist/sql-wasm-browser.js'), 'utf8');
// La distribution universelle écrit dans module. Déclare-le localement pour le mode strict des modules ESM.
await writeFile(new URL('sql-wasm.js', vendor), 'let module;\n' + browserLoader + '\nexport default initSqlJs;\n');
await cp(resolve(sqlRoot, 'dist/sql-wasm-browser.wasm'), new URL('sql-wasm-browser.wasm', vendor));
await cp(resolve(sqlRoot, 'LICENSE'), new URL('LICENSE.txt', vendor));
await cp(resolve(sqlRoot, 'AUTHORS'), new URL('AUTHORS.txt', vendor));
await writeFile(new URL('.nojekyll', output), '');
console.log('Site statique prêt dans dist/.');
