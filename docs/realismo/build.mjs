import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const base=execFileSync('git',['show','origin/main:public/app.js'],{cwd:'../cauce',encoding:'utf8'});
let js=base.replace('renderPresets();\nconst start',await fs.readFile('customizer.js','utf8')+'\nrenderPresets();\nconst start');
if(js===base)throw Error('Injection failed');
js=js.replaceAll('"./api/','"/cauce/api/');
// Make asset failures observable instead of silently keeping primitives forever.
js=js.replace('catch(_){} ok(); }, undefined, () => ok()))','catch(e){ console.error("Modelo",k,e); } ok(); }, undefined, e => { console.error("Recurso",k,e); ok(); }))');
// Clone geometry so rebuilding a property never disposes cached model geometry.
js=js.replace('const o = r.obj.clone(true); o.scale.setScalar(k);','const o = r.obj.clone(true); o.traverse(n=>{if(n.isMesh)n.geometry=n.geometry.clone()}); o.scale.setScalar(k);');
js=js.replace('scene.environment = REAL.ciudadEnv;','/* use neutral interior environment; city HDR only for exterior */');
await fs.writeFile('public/app.js',js);
let html=execFileSync('git',['show','origin/main:public/app.html'],{cwd:'../cauce',encoding:'utf8'});
html=html.replace('</head>','<link rel="stylesheet" href="./realismo.css"></head>').replace('<title>Cauce · Del plano al recorrido 3D</title>','<title>Cauce · Realismo y materiales en vivo</title>');
await fs.writeFile('public/app.html',html);await fs.writeFile('public/index.html',html);


