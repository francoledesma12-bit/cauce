import http from 'node:http';
import { readFile, stat, mkdir, writeFile, readdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
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
// Respaldo: si no hay clave de Anthropic, se usa Gemini (también solo en el VPS).
const geminiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.CAUCE_GEMINI_MODEL || 'gemini-flash-lite-latest';
const generation = apiKey ? 'ready' : geminiKey ? 'ready_gemini' : 'not_configured';
const MAX_BODY = 8 * 1024 * 1024;
// Recorridos grabados: se guardan en disco (en el VPS, /var/lib/cauce; en la compu, .datos/ dentro del proyecto)
const datos = process.env.CAUCE_DATA || (process.platform === 'win32' ? path.join(root, '.datos') : '/var/lib/cauce');
const recDir = path.join(datos, 'recorridos');
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

// Pide texto a la IA disponible. content: [{type:'image', media_type, data} | {type:'text', text}]
async function pedirIA(content, { modelo, maxTokens, timeout }) {
  if (apiKey) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: modelo, max_tokens: maxTokens, messages: [{ role: 'user', content: content.map(c => c.type === 'image' ? { type: 'image', source: { type: 'base64', media_type: c.media_type, data: c.data } } : c) }] }),
      signal: AbortSignal.timeout(timeout)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`anthropic ${r.status} ${data?.error?.message || ''}`);
    return (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  }
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: content.map(c => c.type === 'image' ? { inline_data: { mime_type: c.media_type, data: c.data } } : { text: c.text }) }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: Math.max(maxTokens, 2000) }
  });
  // Gemini gratis a veces responde "mucha demanda" (503/429): se reintenta solo antes de darse por vencido
  const limite = Date.now() + timeout;
  for (let intento = 1; ; intento++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': geminiKey }, body,
      signal: AbortSignal.timeout(Math.max(5000, limite - Date.now()))
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok) return (data.candidates?.[0]?.content?.parts || []).filter(p => p.text && !p.thought).map(p => p.text).join('');
    const reintentable = [429, 500, 503].includes(r.status);
    console.error('gemini', r.status, 'intento', intento, data?.error?.message || '');
    if (!reintentable || intento >= 4 || Date.now() + 2000 * intento > limite - 10000) throw new Error(`gemini ${r.status} ${data?.error?.message || ''}`);
    await new Promise(ok => setTimeout(ok, 2000 * intento));
  }
}

// POST /api/recorridos {datos} -> {id}; POST /api/recorridos/<id>/img/<k> {imagen}; GET /api/recorridos -> lista
const idOk = id => /^[0-9a-f]{10}$/.test(id);
async function crearRecorrido(req, res) {
  try {
    const { datos: d } = JSON.parse(await readBody(req));
    if (!d || !d.plan || !Array.isArray(d.plan.ambientes)) return json(res, 400, { error: 'Recorrido inválido.' });
    const id = randomBytes(5).toString('hex');
    await mkdir(path.join(recDir, id), { recursive: true });
    await writeFile(path.join(recDir, id, 'datos.json'), JSON.stringify({ ...d, id, fecha: new Date().toISOString() }));
    json(res, 200, { id });
  } catch (e) { console.error('recorrido', e.message); json(res, 500, { error: 'No se pudo guardar.' }); }
}
async function subirImagen(req, res, id, k) {
  try {
    if (!idOk(id) || !(k >= 0 && k < 40)) return json(res, 400, { error: 'Pedido inválido.' });
    await stat(path.join(recDir, id, 'datos.json'));
    const { imagen } = JSON.parse(await readBody(req));
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(imagen || '');
    if (!m) return json(res, 400, { error: 'La imagen tiene que ser JPG.' });
    await writeFile(path.join(recDir, id, k + '.jpg'), Buffer.from(m[1], 'base64'));
    json(res, 200, { ok: true });
  } catch (e) {
    if (e.status === 413) return json(res, 413, { error: 'Imagen demasiado grande.' });
    console.error('imagen', e.message); json(res, 500, { error: 'No se pudo guardar la imagen.' });
  }
}
async function listarRecorridos(res) {
  const ids = await readdir(recDir).catch(() => []);
  const lista = [];
  for (const id of ids.filter(idOk)) {
    try {
      const d = JSON.parse(await readFile(path.join(recDir, id, 'datos.json'), 'utf8'));
      lista.push({ id, nombre: d.plan.nombre, fecha: d.fecha, ambientes: d.plan.ambientes.length, tipo: d.tipo || 'recorrido' });
    } catch {}
  }
  lista.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  json(res, 200, { recorridos: lista.slice(0, 40) });
}

async function guia(req, res) {
  if (!apiKey && !geminiKey) return json(res, 503, { error: 'La guía con IA todavía no está configurada en el servidor.' });
  if (running >= 6) return json(res, 429, { error: 'Muchas consultas a la vez. Probá en unos segundos.' });
  running++;
  try {
    const { prompt } = JSON.parse(await readBody(req));
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 30000) return json(res, 400, { error: 'Pedido inválido.' });
    let text;
    try { text = await pedirIA([{ type: 'text', text: prompt + '\n\nRespondé solo con el JSON.' }], { modelo: modelRapido, maxTokens: 600, timeout: 30000 }); }
    catch (e) { console.error('guia', e.message); return json(res, 502, { error: 'La IA no respondió.' }); }
    const g = parseJson(text);
    if (!g || typeof g.respuesta !== 'string') return json(res, 502, { error: 'Respuesta inválida.' });
    json(res, 200, { guia: { respuesta: g.respuesta.slice(0, 800), ir_a: typeof g.ir_a === 'string' ? g.ir_a : null } });
  } catch (error) {
    console.error('guia', error.message); json(res, 500, { error: 'No se pudo responder.' });
  } finally { running--; }
}

async function leerPlano(req, res) {
  if (!apiKey && !geminiKey) return json(res, 503, { error: 'La lectura con IA todavía no está configurada en el servidor.' });
  if (running >= 3) return json(res, 429, { error: 'Hay varios planos procesándose. Probá en unos segundos.' });
  running++;
  try {
    const { prompt, imagen } = JSON.parse(await readBody(req));
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 20000) return json(res, 400, { error: 'Pedido inválido.' });
    const content = [];
    // imagen: un data URL o una lista de hasta 8 (cuadros de un video)
    const imagenes = (Array.isArray(imagen) ? imagen : imagen ? [imagen] : []).slice(0, 8);
    for (const im of imagenes) {
      const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(im);
      if (!m) return json(res, 400, { error: 'La imagen tiene que ser JPG, PNG o WebP.' });
      content.push({ type: 'image', media_type: m[1], data: m[2] });
    }
    content.push({ type: 'text', text: prompt + '\n\nRespondé solo con el JSON, sin texto adicional.' });
    let text;
    try { text = await pedirIA(content, { modelo: model, maxTokens: 4000, timeout: 55000 }); }
    catch (e) { console.error('IA', e.message); return json(res, 502, { error: 'La IA no respondió. Probá de nuevo.' }); }
    const plano = parseJson(text);
    if (!plano || !Array.isArray(plano.ambientes)) return json(res, 502, { error: 'La IA respondió en un formato inválido. Probá de nuevo.' });
    console.log('leer-plano', imagenes.length, 'imagen(es) ->', plano.ambientes.length, 'ambiente(s):', plano.ambientes.map(a => a.nombre).join(', ').slice(0, 200));
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
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  try {
    if (req.method === 'POST' && req.url === `${base}/api/leer-plano`) { await leerPlano(req, res); return; }
    if (req.method === 'POST' && req.url === `${base}/api/guia`) { await guia(req, res); return; }
    if (req.method === 'POST' && req.url === `${base}/api/recorridos`) { await crearRecorrido(req, res); return; }
    const mImg = req.method === 'POST' && /^\/cauce\/api\/recorridos\/([0-9a-f]{10})\/img\/(\d{1,2})$/.exec(req.url);
    if (mImg) { await subirImagen(req, res, mImg[1], +mImg[2]); return; }
    if (req.method === 'GET' && req.url === `${base}/api/recorridos`) { await listarRecorridos(res); return; }
    const mRec = (req.method === 'GET' || req.method === 'HEAD') && /^\/cauce\/rec\/([0-9a-f]{10})\/(datos\.json|\d{1,2}\.jpg)$/.exec(req.url);
    if (mRec) {
      const body = await readFile(path.join(recDir, mRec[1], mRec[2])).catch(() => null);
      if (!body) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': mRec[2].endsWith('.json') ? 'application/json; charset=utf-8' : 'image/jpeg', 'Content-Length': body.length, 'Cache-Control': 'public, max-age=300' });
      res.end(req.method === 'HEAD' ? undefined : body); return;
    }
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
