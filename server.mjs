import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, 'public');
const port = Number(process.env.PORT || 8797);
const base = '/cauce';
const revision = await readFile(path.join(root, '.revision'), 'utf8').then(s => s.trim()).catch(() => 'local');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  try {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
    }
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === base) { res.writeHead(308, { Location: base + '/' }); res.end(); return; }
    if (url.pathname === `${base}/api/health`) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok', project: 'cauce', revision, generation: 'not_configured' })); return;
    }
    if (!url.pathname.startsWith(base + '/')) { res.writeHead(404); res.end('No encontrado'); return; }
    let relative = decodeURIComponent(url.pathname.slice(base.length + 1));
    if (!relative) relative = 'index.html';
    if (relative.split(/[\\/]/).some(p => p.startsWith('.')) || relative.includes('\0')) { res.writeHead(404); res.end(); return; }
    const target = path.resolve(publicRoot, relative);
    if (!target.startsWith(publicRoot + path.sep)) { res.writeHead(404); res.end(); return; }
    const info = await stat(target);
    if (!info.isFile()) { res.writeHead(404); res.end(); return; }
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Content-Length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 400); res.end('Recurso no disponible');
  }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(port, '127.0.0.1', () => console.log(`Cauce listo en http://127.0.0.1:${port}/cauce/`));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
