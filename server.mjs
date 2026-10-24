import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, 'public');
const port = Number(process.env.PORT || 8797);
const base = '/cauce';
const revision = await readFile(path.join(root, '.revision'), 'utf8').then(s => s.trim()).catch(() => 'local');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.png': 'image/png', '.hdr': 'application/octet-stream' };

// Lectura de planos con IA. La clave vive solo en el VPS (/etc/cauce), nunca en el repositorio.
const apiKey = process.env.ANTHROPIC_API_KEY || '';
const model = process.env.CAUCE_MODEL || 'claude-sonnet-5-5';
const modelRapido = process.env.CAUCE_MODEL_RAPIDO || 'claude-haiku-5-5';
const generation = apiKey ? 'ready' : 'not_configured';
const MAX_BODY = 8 * 1024 * 1024;
let running = 0;

const json = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error('too_large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseJson(text) {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/); if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return null;
}

async function guia(req, res) {
  if (!apiKey) return json(res, 503, { error: 'La guía con IA todavía no está configurada en el servidor.' });
  if (running >= 6) return json(res, 429, { error: 'Muchas consultas a la vez. Probá en unos segundos.' });
  running++;
  try {
    const { prompt } = JSON.parse(await readBody(req));
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 30000) return json(res, 400, { error: 'Pedido inválido.' });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: modelRapido, max_tokens: 600, messages: [{ role: 'user', content: prompt + '\n\nRespondé solo con el JSON.' }] }),
      signal: AbortSignal.timeout(30000)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { console.error('guia', r.status, data?.error?.message); return json(res, 502, { error: 'La IA no respondió.' }); }
    const g = parseJson((data.content || []).filter(c => c.type === 'text').map(c => c.text).join(''));
    if (!g || typeof g.respuesta !== 'string') return json(res, 502, { error: 'Respuesta inválida.' });
    json(res, 200, { guia: { respuesta: g.respuesta.slice(0, 800), ir_a: typeof g.ir_a === 'string' ? g.ir_a : null } });
  } catch (error) {
    console.error('guia', error.message); json(res, 500, { error: 'No se pudo responder.' });
  } finally { running--; }
}

async function leerPlano(req, res) {
  if (!apiKey) return json(res, 503, { error: 'La lectura con IA todavía no está configurada en el servidor.' });
  if (running >= 3) return json(res, 429, { error: 'Hay varios planos procesándose. Probá en unos segundos.' });
  running++;
  try {
    const { prompt, imagen } = JSON.parse(await readBody(req));
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 20000) return json(res, 400, { error: 'Pedido inválido.' });
    const content = [];
    if (imagen) {
      const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(imagen);
      if (!m) return json(res, 400, { error: 'La imagen tiene que ser JPG, PNG o WebP.' });
      content.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } });
    }
    content.push({ type: 'text', text: prompt + '\n\nRespondé solo con el JSON, sin texto adicional.' });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 4000, messages: [{ role: 'user', content }] }),
      signal: AbortSignal.timeout(90000)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { console.error('IA', r.status, data?.error?.message); return json(res, 502, { error: 'La IA no respondió. Probá de nuevo.' }); }
    const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    const plano = parseJson(text);
    if (!plano || !Array.isArray(plano.ambientes)) return json(res, 502, { error: 'La IA respondió en un formato inválido. Probá de nuevo.' });
    json(res, 200, { plano });
  } catch (error) {
    if (error.status === 413) return json(res, 413, { error: 'La imagen es demasiado grande (máx. 6 MB).' });
    console.error('leer-plano', error.message);
    json(res, 500, { error: 'No se pudo leer el plano.' });
  } finally { running--; }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  try {
    if (req.method === 'POST' && req.url === `${base}/api/leer-plano`) { await leerPlano(req, res); return; }
    if (req.method === 'POST' && req.url === `${base}/api/guia`) { await guia(req, res); return; }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
    }
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === base) { res.writeHead(308, { Location: base + '/' }); res.end(); return; }
    if (url.pathname === `${base}/api/health`) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok', project: 'cauce', revision, generation })); return;
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
    if (/^(assets|vendor)\//.test(relative)) res.setHeader('Cache-Control', 'public, max-age=3600');
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
