import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.wasm': 'application/wasm' };
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');

export function siteServer() {
  return createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + sep)) throw new Error('Invalid path');
      const data = await readFile(file);
      response.writeHead(200, { 'content-type': types[extname(file)] || 'text/plain; charset=utf-8', 'x-content-type-options': 'nosniff' });
      response.end(data);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Fichier introuvable.');
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.NSI_PORT || 8000);
  siteServer().listen(port, '127.0.0.1', () => console.log(`NSI SQL Lab : http://127.0.0.1:${port}/`));
}
