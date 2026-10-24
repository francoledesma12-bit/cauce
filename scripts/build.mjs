// Genera public/app.html, public/app.css y public/app.js a partir de src/app.html.
// src/app.html es la fuente única: se usa tal cual como demo en Claude y se separa acá
// para el servidor del VPS, cuya política de seguridad no permite estilos ni scripts embebidos
// ni librerías desde CDN.
// Uso: node scripts/build.mjs
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = await readFile(path.join(root, 'src/app.html'), 'utf8');

const take = (re, name) => { const m = src.match(re); if (!m) throw new Error('No encontré ' + name); return m[1]; };
const title = take(/<title>([\s\S]*?)<\/title>/, 'title');
const css = take(/<style>([\s\S]*?)<\/style>/, 'style');
const js = take(/<script>([\s\S]*?)<\/script>\s*$/, 'script principal');
const markup = take(/<\/style>([\s\S]*?)<script src=/, 'contenido');

const fonts = [
  ['Bricolage Grotesque', 600, 'bricolage-grotesque-latin-600-normal'],
  ['Bricolage Grotesque', 800, 'bricolage-grotesque-latin-800-normal'],
  ['IBM Plex Sans', 400, 'ibm-plex-sans-latin-400-normal'],
  ['IBM Plex Sans', 500, 'ibm-plex-sans-latin-500-normal'],
  ['IBM Plex Sans', 600, 'ibm-plex-sans-latin-600-normal'],
  ['IBM Plex Mono', 400, 'ibm-plex-mono-latin-400-normal'],
  ['IBM Plex Mono', 500, 'ibm-plex-mono-latin-500-normal'],
].map(([f, w, file]) => `@font-face{font-family:"${f}";font-style:normal;font-weight:${w};font-display:swap;src:url(./vendor/fonts/${file}.woff2) format("woff2")}`).join('\n');

const reset = `*,*::before,*::after{box-sizing:border-box}
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0}img{max-width:100%}[hidden]{display:none!important}`;

const html = `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title} · Del plano al recorrido 3D</title>
<link rel="stylesheet" href="./app.css">
</head>
<body>${markup.trim()}
<script src="./vendor/three.min.js"></script>
<script src="./vendor/OrbitControls.js"></script>
<script src="./vendor/RoomEnvironment.js"></script>
<script src="./vendor/RoundedBoxGeometry.js"></script>
<script src="./app.js"></script>
</body>
</html>
`;

await writeFile(path.join(root, 'public/app.css'), `${fonts}\n${reset}\n${css.trim()}\n`);
await writeFile(path.join(root, 'public/app.js'), js.trim() + '\n');
await writeFile(path.join(root, 'public/app.html'), html);
console.log('Listo: public/app.html, public/app.css, public/app.js');
