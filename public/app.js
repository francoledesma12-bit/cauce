(() => {
"use strict";
/* ===================== Planos de ejemplo ===================== */
const PRESETS = {
  montevideo: {
    nombre: "Monoambiente · Montevideo 953",
    zona: "Rosario Centro",
    norte: "abajo",
    ambientes: [
      {nombre:"Entrada", tipo:"entrada", x:0, y:0, ancho:1.6, largo:2.0},
      {nombre:"Baño", tipo:"bano", x:0, y:2.0, ancho:1.6, largo:2.2},
      {nombre:"Cocina", tipo:"cocina", x:1.6, y:0, ancho:4.0, largo:2.6},
      {nombre:"Estar", tipo:"estar", x:1.6, y:2.6, ancho:4.0, largo:4.0},
      {nombre:"Dormir", tipo:"dormitorio", x:0, y:4.2, ancho:1.6, largo:2.4},
      {nombre:"Balcón", tipo:"balcon", x:1.6, y:6.6, ancho:4.0, largo:1.3}
    ],
    aberturas: [
      {tipo:"puerta", orientacion:"h", x:0.8, y:0, ancho:0.9},
      {tipo:"paso", orientacion:"v", x:1.6, y:1.0, ancho:0.9},
      {tipo:"puerta", orientacion:"h", x:0.8, y:2.0, ancho:0.7},
      {tipo:"abierto", orientacion:"h", x:3.6, y:2.6, ancho:4.0},
      {tipo:"abierto", orientacion:"v", x:1.6, y:5.4, ancho:2.0},
      {tipo:"ventanal", orientacion:"h", x:3.6, y:6.6, ancho:2.6},
      {tipo:"ventana", orientacion:"h", x:3.6, y:0, ancho:1.6},
      {tipo:"ventana", orientacion:"h", x:0.8, y:6.6, ancho:1.0},
      {tipo:"ventana", orientacion:"v", x:0, y:3.1, ancho:0.6}
    ]
  },
  sarmiento: {
    nombre: "2 dormitorios · Sarmiento y Córdoba",
    zona: "Rosario Centro",
    norte: "arriba",
    ambientes: [
      {nombre:"Balcón", tipo:"balcon", x:0, y:0, ancho:5.2, largo:1.3},
      {nombre:"Living comedor", tipo:"estar", x:0, y:1.3, ancho:5.2, largo:4.0},
      {nombre:"Cocina", tipo:"cocina", x:5.2, y:1.3, ancho:2.6, largo:4.0},
      {nombre:"Pasillo", tipo:"pasillo", x:0, y:5.3, ancho:7.8, largo:1.1},
      {nombre:"Dormitorio 1", tipo:"dormitorio", x:0, y:6.4, ancho:3.6, largo:3.2},
      {nombre:"Baño", tipo:"bano", x:3.6, y:6.4, ancho:1.8, largo:3.2},
      {nombre:"Dormitorio 2", tipo:"dormitorio", x:5.4, y:6.4, ancho:2.4, largo:3.2}
    ],
    aberturas: [
      {tipo:"ventanal", orientacion:"h", x:2.6, y:1.3, ancho:2.4},
      {tipo:"paso", orientacion:"v", x:5.2, y:3.3, ancho:1.2},
      {tipo:"paso", orientacion:"h", x:2.6, y:5.3, ancho:1.6},
      {tipo:"puerta", orientacion:"h", x:2.8, y:6.4, ancho:0.8},
      {tipo:"puerta", orientacion:"h", x:4.5, y:6.4, ancho:0.7},
      {tipo:"puerta", orientacion:"h", x:6.6, y:6.4, ancho:0.8},
      {tipo:"puerta", orientacion:"v", x:7.8, y:5.85, ancho:0.9},
      {tipo:"ventana", orientacion:"h", x:1.8, y:9.6, ancho:1.5},
      {tipo:"ventana", orientacion:"h", x:6.6, y:9.6, ancho:1.2},
      {tipo:"ventana", orientacion:"h", x:4.5, y:9.6, ancho:0.6},
      {tipo:"ventana", orientacion:"v", x:7.8, y:2.8, ancho:1.2},
      {tipo:"ventana", orientacion:"v", x:0, y:3.3, ancho:1.8}
    ]
  },
  astra: {"nombre": "Plano de prueba · leído por Astra", "zona": "Interpretado por IA en 14 s, sin correcciones", "norte": "arriba", "ambientes": [{"nombre": "Estar / Comedor", "tipo": "estar", "x": 0, "y": 0, "ancho": 4, "largo": 5}, {"nombre": "Cocina", "tipo": "cocina", "x": 4, "y": 0, "ancho": 2, "largo": 3}, {"nombre": "Baño", "tipo": "bano", "x": 4, "y": 3, "ancho": 2, "largo": 2}, {"nombre": "Dormitorio", "tipo": "dormitorio", "x": 0, "y": 5, "ancho": 6, "largo": 3}], "aberturas": []}
};

const TIPOS = {
  estar:{floor:"wood", color:"#c79a6b"}, comedor:{floor:"wood", color:"#c79a6b"},
  dormitorio:{floor:"wood", color:"#b9875a"}, cocina:{floor:"tile", color:"#d9d6cf"},
  bano:{floor:"tile", color:"#cfdbe0"}, lavadero:{floor:"tile", color:"#d6d3cc"},
  entrada:{floor:"wood", color:"#d2ad80"}, pasillo:{floor:"wood", color:"#d2ad80"},
  balcon:{floor:"deck", color:"#a9a49b"}, patio:{floor:"deck", color:"#a5a89a"},
  otro:{floor:"tile", color:"#d8d4ca"}
};

/* ===================== Normalización del plano ===================== */
const G = 0.1;                 // grilla de 10 cm
const H = 2.6, T = 0.12;       // alto y espesor de pared
const r1 = v => Math.round(v / G) * G;

function normalizar(raw){
  if (!raw || !Array.isArray(raw.ambientes)) throw new Error("El plano no tiene ambientes.");
  let amb = raw.ambientes.map((a, i) => ({
    nombre: String(a.nombre || ("Ambiente " + (i+1))).slice(0, 40),
    tipo: TIPOS[a.tipo] ? a.tipo : "otro",
    x: r1(+a.x || 0), y: r1(+a.y || 0),
    ancho: r1(Math.abs(+a.ancho || 0)), largo: r1(Math.abs(+a.largo || 0))
  })).filter(a => a.ancho >= 0.6 && a.largo >= 0.6);
  if (!amb.length) throw new Error("No se encontraron ambientes válidos.");
  const minX = Math.min(...amb.map(a => a.x)), minY = Math.min(...amb.map(a => a.y));
  amb.forEach(a => { a.x = r1(a.x - minX); a.y = r1(a.y - minY); });

  const hLines = new Set(), vLines = new Set();
  amb.forEach(a => { hLines.add(Math.round(a.y/G)); hLines.add(Math.round((a.y+a.largo)/G));
                     vLines.add(Math.round(a.x/G)); vLines.add(Math.round((a.x+a.ancho)/G)); });
  const snap = (v, set) => { let best = null, d = Infinity;
    set.forEach(l => { const dd = Math.abs(l*G - v); if (dd < d){ d = dd; best = l; } });
    return d <= 0.5 ? best : null; };

  const ab = (raw.aberturas || []).map(o => {
    const tipo = ["puerta","paso","abierto","ventanal","ventana"].includes(o.tipo) ? o.tipo : "puerta";
    const ori = o.orientacion === "v" ? "v" : "h";
    const x = (+o.x || 0) - minX, y = (+o.y || 0) - minY;
    const line = ori === "h" ? snap(y, hLines) : snap(x, vLines);
    if (line === null) return null;
    return {tipo, orientacion: ori, line, centro: ori === "h" ? x : y, ancho: Math.max(0.5, Math.abs(+o.ancho || 0.8))};
  }).filter(Boolean);

  const norte = ["arriba","abajo","izquierda","derecha"].includes(raw.norte) ? raw.norte : "arriba";
  return {nombre: String(raw.nombre || "Plano sin nombre").slice(0, 60), zona: raw.zona || "", norte, ambientes: amb, aberturas: ab};
}

/* ===================== Escena 3D ===================== */
const canvas = document.getElementById("gl");
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 3; controls.maxDistance = 40;

const hemi = new THREE.HemisphereLight(0xeef3ff, 0xb9b3a6, 0.7);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e3, 0.9);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({color:0xdcdcd3, roughness:1}));
ground.rotation.x = -Math.PI/2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);

// el entorno toma el color del tema (claro u oscuro); desde adentro, vereda y calle
const groundOut = new THREE.Color(0xdcdcd3), groundIn = new THREE.Color(0xa8a79f);
function themeScene(){
  const c = getComputedStyle(document.documentElement).getPropertyValue("--stage").trim() || "#e9ebe6";
  const col = new THREE.Color(c);
  groundOut.copy(col).multiplyScalar(0.96);
  ground.material.color.copy(ground.userData.inside ? groundIn : groundOut);
  scene.fog = new THREE.Fog(col, 30, 90);
}
themeScene();
try{ matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeScene); }catch(_){}
new MutationObserver(themeScene).observe(document.documentElement, {attributes:true, attributeFilter:["data-theme"]});

const cutPlane = new THREE.Plane(new THREE.Vector3(0,-1,0), 1.3);
const clip = [cutPlane];
const matWall = new THREE.MeshStandardMaterial({color:0xf2f0eb, roughness:0.92, clippingPlanes:clip});
const matPoche = new THREE.MeshBasicMaterial({color:0x2a3140, side:THREE.BackSide, clippingPlanes:clip});
const matFrame = new THREE.MeshStandardMaterial({color:0x6b5a48, roughness:0.7, clippingPlanes:clip});
const matGlass = new THREE.MeshStandardMaterial({color:0x9cc7e0, transparent:true, opacity:0.28, roughness:0.1, metalness:0.1, clippingPlanes:clip, depthWrite:false});
const matRail = new THREE.MeshStandardMaterial({color:0x3b4250, roughness:0.5, metalness:0.4, clippingPlanes:clip});
const matCeil = new THREE.MeshStandardMaterial({color:0xfbfaf7, roughness:1, side:THREE.DoubleSide});
const matZocalo = new THREE.MeshStandardMaterial({color:0xe2ddd3, roughness:0.6, clippingPlanes:clip});
const matLeaf = new THREE.MeshStandardMaterial({color:0xb08d67, roughness:0.55, clippingPlanes:clip});
const matAlu = new THREE.MeshStandardMaterial({color:0x3d4446, roughness:0.4, metalness:0.5, clippingPlanes:clip});
const matLamp = new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xfff2d6, emissiveIntensity:0.9});
const M = (color, rough = 0.8, metal = 0) => new THREE.MeshStandardMaterial({color, roughness:rough, metalness:metal, clippingPlanes:clip});
const FM = {
  tela:M(0x5c6f8a), telaClara:M(0xe9e4da), madera:M(0x9a7350), maderaOsc:M(0x5e4632),
  blanco:M(0xf4f3ef, 0.4), mesada:M(0x2f3236, 0.35), acero:M(0xb8bcc2, 0.3, 0.6),
  alfombra:M(0xc9b9a3, 1), maceta:M(0x9b5d3c), planta:M(0x4f7a46), almohada:M(0xfaf8f3)
};

const texCache = {};
function floorTex(kind, color){
  const key = kind + color; if (texCache[key]) return texCache[key];
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  const base = new THREE.Color(color);
  const shade = k => "#" + base.clone().multiplyScalar(k).getHexString();
  g.fillStyle = shade(1); g.fillRect(0,0,256,256);
  if (kind === "wood"){
    for (let r = 0; r < 8; r++){ let x = -((r*97) % 160);
      while (x < 256){ const w = 120 + ((r*53 + x) % 90);
        g.fillStyle = shade(0.9 + ((r*7 + Math.abs(x)) % 13)/60); g.fillRect(x, r*32, w-2, 30);
        g.fillStyle = "rgba(0,0,0,.05)"; for (let k=0;k<4;k++) g.fillRect(x, r*32 + 6 + k*6, w-2, 1);
        x += w; } }
  } else if (kind === "tile"){
    g.strokeStyle = shade(0.82); g.lineWidth = 3;
    for (let i = 0; i <= 256; i += 64){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,256); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(256,i); g.stroke(); }
  } else {
    for (let r = 0; r < 16; r++){ g.fillStyle = shade(r % 2 ? 0.95 : 1.02); g.fillRect(0, r*16, 256, 14); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texCache[key] = t; return t;
}

let model = null, plan = null, floors = [], bounds = null, ceilings = null;

/* ===================== Muebles ===================== */
// Elige la pared más larga sin puertas y amuebla contra ella, según el tipo de ambiente.
function paredes(a, ab){
  const L = v => Math.round(v/G);
  const lados = [
    {side:"top", along:a.ancho, depth:a.largo, ori:"h", line:L(a.y), from:a.x},
    {side:"bottom", along:a.ancho, depth:a.largo, ori:"h", line:L(a.y + a.largo), from:a.x},
    {side:"left", along:a.largo, depth:a.ancho, ori:"v", line:L(a.x), from:a.y},
    {side:"right", along:a.largo, depth:a.ancho, ori:"v", line:L(a.x + a.ancho), from:a.y}
  ];
  lados.forEach(l => {
    const hits = ab.filter(o => o.orientacion === l.ori && o.line === l.line && o.centro + o.ancho/2 > l.from + 0.05 && o.centro - o.ancho/2 < l.from + l.along - 0.05);
    l.blocked = hits.some(o => o.tipo !== "ventana");
  });
  return lados.sort((p, q) => (p.blocked - q.blocked) || (q.along - p.along));
}
function put(a, w, geo, mat, u, s, y, group, d){
  // w = lado de pared, u = desplazamiento sobre la pared, s = distancia a la pared, d = profundidad del objeto
  const cx = a.x + a.ancho/2, cz = a.y + a.largo/2, off = T/2 + s + d/2;
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
  if (w.side === "top"){ m.position.set(cx + u, y, a.y + off); }
  else if (w.side === "bottom"){ m.position.set(cx - u, y, a.y + a.largo - off); m.rotation.y = Math.PI; }
  else if (w.side === "left"){ m.position.set(a.x + off, y, cz - u); m.rotation.y = Math.PI/2; }
  else { m.position.set(a.x + a.ancho - off, y, cz + u); m.rotation.y = -Math.PI/2; }
  group.add(m); return m;
}
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function amueblar(a, ab, g){
  const w = paredes(a, ab)[0], along = w.along, depth = w.depth;
  const P = (geo, mat, u, s, y, d) => put(a, w, geo, mat, u, s, y, g, d);
  switch (a.tipo){
    case "dormitorio": {
      if (depth < 2.3 || along < 1.2) break;
      const bw = (along >= 2.6 && depth >= 2.6) ? 1.4 : 0.9;
      P(B(bw + 0.1, 1.0, 0.06), FM.maderaOsc, 0, 0, 0.5, 0.06);
      P(B(bw, 0.35, 1.9), FM.madera, 0, 0.06, 0.175, 1.9);
      P(B(bw - 0.04, 0.2, 1.86), FM.telaClara, 0, 0.08, 0.45, 1.86);
      P(B(bw - 0.2, 0.1, 0.35), FM.almohada, 0, 0.12, 0.6, 0.35);
      P(B(bw + 0.02, 0.06, 1.2), FM.tela, 0, 0.72, 0.57, 1.2);
      if (along >= bw + 1.1) [-1, 1].forEach(k => P(B(0.45, 0.5, 0.4), FM.madera, k*(bw/2 + 0.32), 0, 0.25, 0.4));
      break;
    }
    case "estar": case "comedor": {
      if (depth < 2.2 || along < 1.8) break;
      const sw = Math.min(2.2, along - 0.6);
      if (a.tipo === "estar"){
        const rug = P(B(Math.min(2.6, sw + 0.4), 0.01, 1.7), FM.alfombra, 0, 0.55, 0.006, 1.7); rug.castShadow = false;
        P(B(sw, 0.42, 0.9), FM.tela, 0, 0.02, 0.21, 0.9);
        P(B(sw, 0.42, 0.2), FM.tela, 0, 0.02, 0.63, 0.2);
        [-1, 1].forEach(k => P(B(0.18, 0.62, 0.9), FM.tela, k*(sw/2 - 0.09), 0.02, 0.31, 0.9));
        if (depth >= 2.6) P(B(1.0, 0.38, 0.55), FM.madera, 0, 1.3, 0.19, 0.55);
      }
      if (a.tipo === "comedor" || (a.ancho * a.largo > 16 && depth >= 3.6)){
        const s = a.tipo === "comedor" ? Math.max(0.6, depth/2 - 0.45) : Math.max(2.3, depth - 1.6);
        P(B(1.4, 0.04, 0.85), FM.maderaOsc, 0, s, 0.74, 0.85);
        P(B(1.2, 0.72, 0.65), FM.madera, 0, s + 0.1, 0.36, 0.65).scale.set(0.1, 1, 0.1);
        [-0.35, 0.35].forEach(u => { P(B(0.42, 0.45, 0.42), FM.madera, u, s - 0.45, 0.225, 0.42); P(B(0.42, 0.45, 0.42), FM.madera, u, s + 0.88, 0.225, 0.42); });
      }
      break;
    }
    case "cocina": {
      if (along < 1.4) break;
      const fridge = along >= 2.3;
      const len = Math.min(fridge ? along - 1.0 : along - 0.2, 3.0);
      const uc = fridge ? 0.4 : 0;
      P(B(len, 0.86, 0.6), FM.blanco, uc, 0, 0.43, 0.6);
      P(B(len + 0.02, 0.04, 0.63), FM.mesada, uc, 0, 0.88, 0.63);
      P(B(0.6, 0.02, 0.5), FM.acero, uc + len/2 - 0.5, 0.05, 0.905, 0.5);
      if (fridge) P(B(0.7, 1.8, 0.68), FM.acero, uc - len/2 - 0.42, 0, 0.9, 0.68);
      break;
    }
    case "bano": {
      if (along < 1.2) break;
      P(B(0.38, 0.4, 0.55), FM.blanco, -along/2 + 0.42, 0.18, 0.2, 0.55);
      P(B(0.42, 0.38, 0.18), FM.blanco, -along/2 + 0.42, 0, 0.6, 0.18);
      P(B(0.6, 0.82, 0.45), FM.blanco, along/2 - 0.45, 0, 0.41, 0.45);
      break;
    }
    case "lavadero": P(B(0.6, 0.85, 0.6), FM.blanco, 0, 0, 0.425, 0.6); break;
    case "balcon": case "patio": {
      P(new THREE.CylinderGeometry(0.2, 0.15, 0.45, 16), FM.maceta, along/2 - 0.4, 0.05, 0.225, 0.4);
      P(new THREE.SphereGeometry(0.35, 16, 12), FM.planta, along/2 - 0.4, 0.0, 0.75, 0.7);
      if (along >= 2.4) [-0.3, 0.35].forEach(u => P(B(0.45, 0.45, 0.45), FM.maderaOsc, u - 0.4, 0.15, 0.225, 0.45));
      break;
    }
  }
}

function box(w, h, d, x, y, z, mats, group, shadow = true){
  const geo = new THREE.BoxGeometry(w, h, d);
  for (const m of mats){ const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z);
    if (shadow && m !== matPoche && m !== matGlass){ mesh.castShadow = true; mesh.receiveShadow = true; }
    group.add(mesh); }
}

function construir(p){
  if (model){ scene.remove(model); model.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  model = new THREE.Group(); floors = [];
  const amb = p.ambientes;

  // pisos
  amb.forEach((a, i) => {
    const t = TIPOS[a.tipo];
    const tex = floorTex(t.floor, t.color).clone(); tex.needsUpdate = true;
    const tile = t.floor === "tile" ? 1.2 : t.floor === "deck" ? 1.6 : 2.4;
    tex.repeat.set(a.ancho / tile, a.largo / tile);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(a.ancho, a.largo), new THREE.MeshStandardMaterial({map:tex, roughness:0.8}));
    m.rotation.x = -Math.PI/2; m.position.set(a.x + a.ancho/2, 0.001, a.y + a.largo/2);
    m.receiveShadow = true; m.userData.room = i; model.add(m); floors.push(m);
  });

  // bordes de la grilla: cada segmento de 10 cm de borde de ambiente
  const segs = new Map();
  const add = (ori, i, j, room) => { const k = ori + ":" + i + ":" + j;
    if (!segs.has(k)) segs.set(k, {ori, i, j, rooms:[]}); segs.get(k).rooms.push(room); };
  amb.forEach((a, r) => {
    const i0 = Math.round(a.x/G), j0 = Math.round(a.y/G), i1 = Math.round((a.x+a.ancho)/G), j1 = Math.round((a.y+a.largo)/G);
    for (let i = i0; i < i1; i++){ add("h", i, j0, r); add("h", i, j1, r); }
    for (let j = j0; j < j1; j++){ add("v", i0, j, r); add("v", i1, j, r); }
  });

  // clasificar cada segmento
  const runs = new Map();
  segs.forEach(s => {
    const line = s.ori === "h" ? s.j : s.i, pos = s.ori === "h" ? s.i : s.j;
    const mid = (pos + 0.5) * G;
    const o = p.aberturas.find(o => o.orientacion === s.ori && o.line === line && Math.abs(mid - o.centro) < o.ancho/2);
    let kind = o ? o.tipo : "pared";
    const exterior = s.rooms.length === 1;
    const allOutdoor = s.rooms.every(r => ["balcon","patio"].includes(amb[r].tipo));
    if (kind === "pared" && allOutdoor && exterior) kind = "baranda";
    if (kind === "pared" && allOutdoor && !exterior) kind = "abierto";
    if (kind === "abierto") return;
    const rk = s.ori + ":" + line + ":" + kind;
    if (!runs.has(rk)) runs.set(rk, {ori:s.ori, line, kind, pos:[]});
    runs.get(rk).pos.push(pos);
  });

  const walls = new THREE.Group();
  runs.forEach(run => {
    run.pos.sort((a,b) => a-b);
    let start = run.pos[0], prev = start;
    const flush = (a, b) => buildRun(run, a*G, (b+1)*G, walls);
    for (let k = 1; k < run.pos.length; k++){
      if (run.pos[k] !== prev + 1){ flush(start, prev); start = run.pos[k]; }
      prev = run.pos[k];
    }
    flush(start, prev);
  });
  model.add(walls);

  // techos (solo se ven en el recorrido)
  ceilings = new THREE.Group();
  amb.forEach(a => {
    if (["balcon","patio"].includes(a.tipo)) return;
    const c = new THREE.Mesh(new THREE.PlaneGeometry(a.ancho, a.largo), matCeil);
    c.rotation.x = Math.PI/2; c.position.set(a.x + a.ancho/2, H, a.y + a.largo/2);
    c.castShadow = true; c.receiveShadow = true; ceilings.add(c);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 24), matLamp);
    lamp.position.set(a.x + a.ancho/2, H - 0.015, a.y + a.largo/2); ceilings.add(lamp);
  });
  ceilings.visible = mode === "recorrido";
  model.add(ceilings);

  const furn = new THREE.Group();
  amb.forEach(a => amueblar(a, p.aberturas, furn));
  model.add(furn);
  scene.add(model);

  const xs = amb.flatMap(a => [a.x, a.x + a.ancho]), ys = amb.flatMap(a => [a.y, a.y + a.largo]);
  bounds = {minX:Math.min(...xs), maxX:Math.max(...xs), minY:Math.min(...ys), maxY:Math.max(...ys)};
  bounds.cx = (bounds.minX + bounds.maxX)/2; bounds.cy = (bounds.minY + bounds.maxY)/2;
  bounds.size = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);

  const s = bounds.size;
  const sc = sun.shadow.camera; sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s; sc.near = 0.5; sc.far = s*6 + 40; sc.updateProjectionMatrix();
  // flecha de norte junto a la maqueta
  const [nx, nz] = NORTE[p.norte] || NORTE.arriba;
  const tri = new THREE.Shape(); tri.moveTo(0, 0.55); tri.lineTo(0.32, -0.35); tri.lineTo(0, -0.15); tri.lineTo(-0.32, -0.35); tri.closePath();
  const arrow = new THREE.Mesh(new THREE.ShapeGeometry(tri), new THREE.MeshBasicMaterial({color:0x758a60, side:THREE.DoubleSide}));
  arrow.rotation.x = -Math.PI/2; arrow.rotation.z = Math.atan2(-nx, -nz);
  const off = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY)/2 + 1.2;
  arrow.position.set(bounds.cx + nx*off, 0.01, bounds.cy + nz*off);
  arrow.userData.norte = true; model.add(arrow); norteArrow = arrow;
  construirEntorno();
  aplicarSol();
}
let norteArrow = null;

/* ===================== Entorno: cielo y ciudad (se ve desde adentro) ===================== */
let entorno = null;
const skyTex = (() => {
  const c = document.createElement("canvas"); c.width = 4; c.height = 256; const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#5f8fc4"); gr.addColorStop(0.45, "#a9c6e2"); gr.addColorStop(0.52, "#dfe7ea"); gr.addColorStop(1, "#cfd2c8");
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
})();
function construirEntorno(){
  if (entorno){ scene.remove(entorno); entorno.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  entorno = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(140, 32, 16), new THREE.MeshBasicMaterial({map:skyTex, side:THREE.BackSide, fog:false, toneMapped:false}));
  sky.position.set(bounds.cx, 0, bounds.cy); entorno.add(sky);
  // manzanas de Rosario alrededor: edificios bajos y medianos, deterministas
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tonos = [0xd8d2c6, 0xc9c3b8, 0xe4dfd5, 0xbfc4c2, 0xd2c7b4];
  const mats = tonos.map(c => new THREE.MeshStandardMaterial({color:c, roughness:0.95}));
  const r0 = bounds.size/2 + 9;
  for (let i = 0; i < 70; i++){
    const ang = rnd() * Math.PI * 2, r = r0 + rnd() * 45;
    const w = 6 + rnd() * 10, d = 6 + rnd() * 10, h = 6 + Math.pow(rnd(), 2) * 40;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats[i % mats.length]);
    b.position.set(bounds.cx + Math.cos(ang) * r, h/2 - 0.02, bounds.cy + Math.sin(ang) * r);
    b.rotation.y = Math.round(rnd()*3) * 0.02; b.receiveShadow = true;
    entorno.add(b);
  }
  entorno.visible = mode === "recorrido";
  scene.add(entorno);
}

/* ===================== Sol de Rosario ===================== */
const LAT = -32.95 * Math.PI / 180;
const sol = {hora: 11, estacion: "invierno"};
const NORTE = {arriba:[0,-1], abajo:[0,1], izquierda:[-1,0], derecha:[1,0]};
function posicionSolar(hora, estacion){
  const dia = estacion === "verano" ? 355 : estacion === "invierno" ? 172 : 80;
  const dec = 23.44 * Math.PI/180 * Math.sin(2*Math.PI*(284 + dia)/365);
  const ha = (hora - 12) * 15 * Math.PI/180;
  const sinAlt = Math.sin(LAT)*Math.sin(dec) + Math.cos(LAT)*Math.cos(dec)*Math.cos(ha);
  const alt = Math.asin(sinAlt);
  let cosAz = (Math.sin(dec) - sinAlt*Math.sin(LAT)) / (Math.cos(alt)*Math.cos(LAT));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));   // desde el norte, hacia el este
  if (ha > 0) az = 2*Math.PI - az;
  return {alt, az};
}
function aplicarSol(){
  if (!bounds) return;
  const {alt, az} = posicionSolar(sol.hora, sol.estacion);
  const [nx, nz] = NORTE[plan.norte] || NORTE.arriba, ex = -nz, ez = nx;
  const h = Math.cos(Math.max(alt, 0.02));
  const dir = new THREE.Vector3((Math.cos(az)*nx + Math.sin(az)*ex)*h, Math.sin(Math.max(alt, 0.02)), (Math.cos(az)*nz + Math.sin(az)*ez)*h).normalize();
  const dist = bounds.size*2 + 20;
  sun.position.set(bounds.cx + dir.x*dist, dir.y*dist, bounds.cy + dir.z*dist);
  sun.target.position.set(bounds.cx, 0, bounds.cy);
  const k = Math.max(0, Math.sin(alt));
  sun.intensity = alt <= 0 ? 0 : 0.35 + 1.05*Math.pow(k, 0.5);
  sun.color.setHSL(0.09, 0.9, 0.6 + 0.35*Math.min(1, k*2.2));
  hemi.intensity = 0.32 + 0.45*Math.pow(k, 0.6);
  const txt = document.getElementById("solTxt");
  if (txt){
    const hh = Math.floor(sol.hora), mm = Math.round((sol.hora - hh)*60);
    txt.textContent = alt <= 0 ? "Sin sol a esta hora" : `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")} · sol a ${Math.round(alt*180/Math.PI)}° de altura`;
  }
}

function buildRun(run, a, b, group){
  const len = b - a, c = (a + b) / 2;
  const L = run.kind === "pared" ? len + T : len;   // las paredes se estiran para cerrar las esquinas
  const place = (w, h, yc, mats) => {
    if (run.ori === "h") box(L === len ? w : w, h, T, c, yc, run.line*G, mats, group);
    else box(T, h, w, run.line*G, yc, c, mats, group);
  };
  const solid = [matWall, matPoche];
  switch (run.kind){
    case "pared":
      place(L, H, H/2, solid);
      if (run.ori === "h") box(L, 0.08, T + 0.024, c, 0.04, run.line*G, [matZocalo], group, false);
      else box(T + 0.024, 0.08, L, run.line*G, 0.04, c, [matZocalo], group, false);
      break;
    case "puerta": case "paso":
      place(len, H - 2.05, (H + 2.05)/2, solid);
      if (run.kind === "puerta"){
        const ft = 0.05;
        if (run.ori === "h"){ box(ft, 2.05, T+0.02, a+ft/2, 1.025, run.line*G, [matFrame], group); box(ft, 2.05, T+0.02, b-ft/2, 1.025, run.line*G, [matFrame], group); }
        else { box(T+0.02, 2.05, ft, run.line*G, 1.025, a+ft/2, [matFrame], group); box(T+0.02, 2.05, ft, run.line*G, 1.025, b-ft/2, [matFrame], group); }
        // hoja de la puerta, entreabierta
        const w = len - 0.1, geo = new THREE.BoxGeometry(w, 2.0, 0.04); geo.translate(w/2, 1.0, 0);
        const leaf = new THREE.Mesh(geo, matLeaf); leaf.castShadow = true; leaf.receiveShadow = true;
        if (run.ori === "h"){ leaf.position.set(a + 0.05, 0, run.line*G + T/2); leaf.rotation.y = -1.25; }
        else { leaf.position.set(run.line*G + T/2, 0, a + 0.05); leaf.rotation.y = -Math.PI/2 + 1.25; }
        group.add(leaf);
      }
      break;
    case "ventanal":
      place(len, H - 2.15, (H + 2.15)/2, solid);
      place(len, 2.15, 1.075, [matGlass]);
      carpinteria(run, a, b, 0.02, 2.15, group);
      break;
    case "ventana":
      place(len, 0.95, 0.475, solid);
      place(len, H - 2.1, (H + 2.1)/2, solid);
      place(len, 1.15, 1.525, [matGlass]);
      carpinteria(run, a, b, 0.95, 2.1, group);
      if (run.ori === "h") box(len + 0.08, 0.035, T + 0.08, c, 0.95, run.line*G, [matZocalo], group);
      else box(T + 0.08, 0.035, len + 0.08, run.line*G, 0.95, c, [matZocalo], group);
      break;
    case "baranda":
      place(len, 1.0, 0.5, [matGlass]);
      if (run.ori === "h") box(len, 0.05, 0.06, c, 1.0, run.line*G, [matRail], group);
      else box(0.06, 0.05, len, run.line*G, 1.0, c, [matRail], group);
      break;
  }
}

// marco de aluminio: perímetro y parante central si la abertura es ancha
function carpinteria(run, a, b, y0, y1, group){
  const f = 0.045, len = b - a, c = (a + b)/2, z = run.line*G, ym = (y0 + y1)/2, hh = y1 - y0;
  const bar = (w, h, pos, y) => run.ori === "h" ? box(w, h, 0.06, pos, y, z, [matAlu], group) : box(0.06, h, w, z, y, pos, [matAlu], group);
  bar(len, f, c, y1 - f/2); bar(len, f, c, y0 + f/2);
  bar(f, hh, a + f/2, ym); bar(f, hh, b - f/2, ym);
  const n = Math.floor(len / 1.0);
  for (let k = 1; k < n; k++) bar(f, hh, a + len*k/n, ym);
}

/* ===================== Cámara: maqueta y recorrido ===================== */
let mode = "maqueta", cutOn = true, cutTarget = 1.3;
const look = {yaw: 0, pitch: -0.05};
const tweens = [];
function tween(dur, fn, done){ tweens.push({t0: performance.now(), dur, fn, done}); }
const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;

function maquetaView(animate = true){
  const s = bounds.size, to = new THREE.Vector3(bounds.cx + s*0.75, s*1.05 + 2, bounds.cy + s*1.15);
  const target = new THREE.Vector3(bounds.cx, 0, bounds.cy);
  camera.fov = 45; camera.updateProjectionMatrix();
  if (!animate){ camera.position.copy(to); controls.target.copy(target); controls.update(); return; }
  const from = camera.position.clone(), tFrom = controls.target.clone();
  tween(900, k => { camera.position.lerpVectors(from, to, k); controls.target.lerpVectors(tFrom, target, k); camera.lookAt(controls.target); });
}

function setMode(m, roomIndex){
  mode = m;
  document.getElementById("mMaqueta").setAttribute("aria-pressed", m === "maqueta");
  document.getElementById("mRecorrido").setAttribute("aria-pressed", m === "recorrido");
  document.getElementById("cut").hidden = m !== "maqueta";
  canvas.classList.toggle("walk", m === "recorrido");
  controls.enabled = m === "maqueta";
  cutTarget = (m === "maqueta" && cutOn) ? 1.3 : 50;
  clearTimeout(setMode.t);
  const dentro = v => { ground.userData.inside = v; if (ceilings) ceilings.visible = v; if (entorno) entorno.visible = v; ground.material.color.copy(v ? groundIn : groundOut); scene.fog.far = v ? 400 : 90; scene.fog.near = v ? 200 : 30; };
  if (m === "maqueta") dentro(false); else setMode.t = setTimeout(() => { if (mode === "recorrido") dentro(true); }, 950);
  setHint();
  if (m === "maqueta"){ maquetaView(true); }
  else { irA(roomIndex ?? entradaIndex(), true); }
  renderLabels();
}

function entradaIndex(){
  const i = plan.ambientes.findIndex(a => a.tipo === "entrada");
  if (i >= 0) return i;
  const j = plan.ambientes.findIndex(a => ["estar","comedor"].includes(a.tipo));
  return j >= 0 ? j : 0;
}

function irA(i, fromMaqueta){
  const a = plan.ambientes[i]; if (!a) return;
  const to = new THREE.Vector3(a.x + a.ancho/2, 1.6, a.y + a.largo/2);
  // mirar hacia el centro de la propiedad (o hacia el lado más largo si ya estamos en el centro)
  let dx = bounds.cx - to.x, dz = bounds.cy - to.z;
  if (Math.hypot(dx, dz) < 0.5){ dx = a.ancho >= a.largo ? 1 : 0; dz = a.ancho >= a.largo ? 0 : 1; }
  const yaw = Math.atan2(-dx, -dz);
  const from = camera.position.clone(), y0 = look.yaw, p0 = look.pitch;
  if (fromMaqueta){
    const q0 = camera.quaternion.clone();
    camera.fov = 72; camera.updateProjectionMatrix();
    tween(1100, k => {
      camera.position.lerpVectors(from, to, k);
      const qt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.05, yaw, 0, "YXZ"));
      camera.quaternion.copy(q0).slerp(qt, k);
    }, () => { look.yaw = yaw; look.pitch = -0.05; });
  } else {
    let dy = yaw - y0; while (dy > Math.PI) dy -= 2*Math.PI; while (dy < -Math.PI) dy += 2*Math.PI;
    tween(800, k => { camera.position.lerpVectors(from, to, k); look.yaw = y0 + dy*k; look.pitch = p0 + (-0.05 - p0)*k; applyLook(); });
  }
}
function applyLook(){ camera.quaternion.setFromEuler(new THREE.Euler(look.pitch, look.yaw, 0, "YXZ")); }

function roomAt(x, z){ return plan.ambientes.findIndex(a => x >= a.x && x <= a.x + a.ancho && z >= a.y && z <= a.y + a.largo); }

/* ===================== Interacción ===================== */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let drag = null;
canvas.addEventListener("pointerdown", e => {
  drag = {x:e.clientX, y:e.clientY, moved:0, yaw:look.yaw, pitch:look.pitch};
  if (mode === "recorrido") canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
  if (mode === "recorrido" && !tweens.length){
    look.yaw = drag.yaw + dx * 0.005; look.pitch = Math.max(-1.1, Math.min(1.1, drag.pitch + dy * 0.005)); applyLook();
  }
});
canvas.addEventListener("pointerup", e => {
  if (drag && drag.moved < 6) clickAt(e);
  drag = null;
});
function clickAt(e){
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left)/r.width)*2 - 1, -((e.clientY - r.top)/r.height)*2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(floors)[0]; if (!hit) return;
  if (mode === "maqueta"){ setMode("recorrido", hit.object.userData.room); return; }
  const to = new THREE.Vector3(hit.point.x, 1.6, hit.point.z), from = camera.position.clone();
  const d = from.distanceTo(to);
  tween(Math.min(1400, 300 + d*260), k => camera.position.lerpVectors(from, to, k));
}

const keys = new Set();
addEventListener("keydown", e => { if (e.target.closest("textarea,input")) return; keys.add(e.key.toLowerCase()); });
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
function walk(dt){
  if (mode !== "recorrido" || tweens.length) return;
  let f = 0, s = 0;
  if (keys.has("w") || keys.has("arrowup")) f += 1;
  if (keys.has("s") || keys.has("arrowdown")) f -= 1;
  if (keys.has("a")) s -= 1;
  if (keys.has("d")) s += 1;
  if (keys.has("arrowleft")) { look.yaw += dt*1.6; applyLook(); }
  if (keys.has("arrowright")) { look.yaw -= dt*1.6; applyLook(); }
  if (!f && !s) return;
  const sp = 1.8*dt, sy = Math.sin(look.yaw), cy = Math.cos(look.yaw);
  const nx = camera.position.x + (-sy*f + cy*s)*sp, nz = camera.position.z + (-cy*f - sy*s)*sp;
  if (roomAt(nx, nz) >= 0){ camera.position.x = nx; camera.position.z = nz; }
}

/* ===================== UI ===================== */
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString("es-AR", {minimumFractionDigits:1, maximumFractionDigits:1});
let currentRoom = -1;

function setHint(){
  $("hint").textContent = mode === "maqueta"
    ? "Arrastrá para girar · tocá un ambiente para entrar"
    : "Arrastrá para mirar · tocá el piso para caminar · WASD en compu";
}

function renderPanel(){
  const ul = $("rooms"); ul.innerHTML = "";
  let total = 0;
  plan.ambientes.forEach((a, i) => {
    const m2 = a.ancho * a.largo; total += m2;
    const li = document.createElement("li"), b = document.createElement("button");
    b.innerHTML = `<span class="sw"></span><span class="rn"></span><span class="rm">${fmt(m2)} m²</span>`;
    b.querySelector(".sw").style.background = TIPOS[a.tipo].color;
    b.querySelector(".rn").textContent = a.nombre;
    b.onclick = () => mode === "recorrido" ? irA(i) : setMode("recorrido", i);
    li.append(b); ul.append(li);
  });
  $("total").textContent = fmt(total) + " m² totales";
  $("title3d").textContent = plan.nombre;

  const chips = $("chips"); chips.innerHTML = "";
  plan.ambientes.forEach((a, i) => {
    const b = document.createElement("button"); b.textContent = a.nombre; b.dataset.i = i;
    b.onclick = () => mode === "recorrido" ? irA(i) : setMode("recorrido", i);
    chips.append(b);
  });
}

const labels = $("labels");
function renderLabels(){
  labels.innerHTML = "";
  if (mode !== "maqueta" || !plan) return;
  plan.ambientes.forEach((a, i) => {
    const d = document.createElement("div"); d.className = "lbl";
    d.innerHTML = `<span></span><small>${fmt(a.ancho*a.largo)} m²</small>`;
    d.querySelector("span").textContent = a.nombre;
    d.onclick = () => setMode("recorrido", i);
    d.dataset.i = i; labels.append(d);
  });
}
const v3 = new THREE.Vector3();
function placeLabels(){
  if (mode !== "maqueta") return;
  const w = stage.clientWidth, h = stage.clientHeight;
  labels.childNodes.forEach(d => {
    const a = plan.ambientes[+d.dataset.i];
    v3.set(a.x + a.ancho/2, 0.4, a.y + a.largo/2).project(camera);
    d.style.left = ((v3.x + 1)/2 * w) + "px"; d.style.top = ((1 - v3.y)/2 * h) + "px";
    d.style.display = v3.z < 1 ? "" : "none";
  });
}
function updateChips(){
  const r = mode === "recorrido" ? roomAt(camera.position.x, camera.position.z) : -1;
  if (r === currentRoom) return; currentRoom = r;
  $("chips").childNodes.forEach(b => b.setAttribute("aria-current", +b.dataset.i === r));
}

function cargar(raw, key){
  plan = normalizar(raw);
  construir(plan);
  renderPanel();
  if (typeof iniciarGuia === "function" && document.getElementById("msgs")) setTimeout(iniciarGuia, 0);
  document.querySelectorAll(".preset").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === key));
  mode = "recorrido"; // fuerza la transición de cámara
  maquetaView(false);
  setMode("maqueta");
}

function renderPresets(){
  const box = $("presets");
  Object.entries(PRESETS).forEach(([k, p]) => {
    const m2 = p.ambientes.reduce((s, a) => s + a.ancho*a.largo, 0);
    const b = document.createElement("button"); b.className = "preset"; b.dataset.k = k;
    b.innerHTML = `<span><b></b><small></small></span><span class="m">${Math.round(m2)} m²</span>`;
    b.querySelector("b").textContent = p.nombre.split(" · ")[1] || p.nombre;
    b.querySelector("small").textContent = (p.nombre.split(" · ")[0]) + " · " + p.zona;
    b.onclick = () => { cargar(p, k); try{ history.replaceState(null, "", "#" + k); }catch(_){} };
    box.append(b);
  });
}

$("mMaqueta").onclick = () => mode !== "maqueta" && setMode("maqueta");
$("mRecorrido").onclick = () => mode !== "recorrido" && setMode("recorrido");
$("cut").onclick = () => {
  cutOn = !cutOn; cutTarget = cutOn ? 1.3 : 50;
  $("cut").textContent = cutOn ? "Ver paredes completas" : "Cortar paredes";
};

/* ===================== IA: leer el plano ===================== */
const PROMPT_BASE = `Convertís planos de propiedades en datos para generar una maqueta 3D.
Devolvé SOLO un objeto JSON con esta forma exacta:
{"nombre": string, "ambientes": [{"nombre": string, "tipo": string, "x": number, "y": number, "ancho": number, "largo": number}], "aberturas": [{"tipo": string, "orientacion": "h"|"v", "x": number, "y": number, "ancho": number}]}

Reglas:
- Medidas en metros. Origen arriba a la izquierda del plano; x crece a la derecha, y crece hacia abajo.
- Cada ambiente es un rectángulo alineado a los ejes: (x, y) es su esquina superior izquierda, "ancho" es la medida en x y "largo" la medida en y.
- Los ambientes NO se superponen. Donde dos ambientes comparten una pared, sus bordes coinciden exactamente (mismas coordenadas).
- Si un ambiente tiene forma de L, dividilo en dos rectángulos (ej. "Estar" y "Estar (rincón)") y unilos con una abertura "abierto".
- tipo de ambiente: estar, comedor, cocina, dormitorio, bano, lavadero, entrada, pasillo, balcon, patio u otro.
- aberturas.tipo: "puerta" (con hoja), "paso" (vano sin puerta), "abierto" (no hay pared, ambientes integrados), "ventanal" (puerta vidriada, ej. al balcón), "ventana".
- Una abertura está sobre un borde de ambiente. orientacion "h" si el borde es horizontal (y constante), "v" si es vertical (x constante). (x, y) es el CENTRO de la abertura sobre ese borde; "ancho" es su largo en metros.
- Todos los ambientes tienen que ser accesibles desde la puerta de entrada, que va en un borde exterior.
- Si hay cotas, usalas. Si no, estimá con medidas típicas de Argentina (puerta 0.8 m, dormitorio ~3x3 m, baño ~1.6x2.2 m).
- Redondeá a múltiplos de 0.1 m.`;

let sampleFn = null, imagesOk = false, pickedFile = null;
const status = (t, cls = "") => { const s = $("status"); s.textContent = t; s.className = "status " + cls; };

(async () => {
  if (!window.claude || !window.claude.use) return;
  try{
    sampleFn = await window.claude.use("sample");
    if (sampleFn){ const lim = await sampleFn.limits().catch(() => null); imagesOk = !!(lim && lim.images); }
  }catch(_){ sampleFn = null; }
  if (sampleFn && !imagesOk){ $("dropsub").textContent = "La lectura de imágenes no está disponible en esta vista; podés describir el plano"; }
})();

function pick(f){
  if (!f || !/^image\//.test(f.type)){ status("Elegí una imagen JPG, PNG o WebP.", "err"); return; }
  pickedFile = f;
  const t = $("thumb"); t.src = URL.createObjectURL(f); t.hidden = false;
  status("Plano listo para leer.");
}
$("file").addEventListener("change", e => pick(e.target.files[0]));
const drop = $("drop");
drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); });
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("over"); pick(e.dataTransfer.files[0]); });
addEventListener("paste", e => { const f = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith("image/")); if (f) pick(f); });

const ERR = {
  not_granted:"Hace falta permitir que esta página use Claude para leer planos.",
  sampling_disabled:"La IA no está disponible para esta cuenta.",
  rate_limited:"Muchos pedidos seguidos. Esperá un momento y probá de nuevo.",
  image_rejected:"No pude abrir esa imagen. Probá con otra captura del plano.",
  images_unavailable:"Esta vista no puede enviar imágenes; describí el plano con texto.",
  invalid_json:"La IA respondió en un formato inválido. Probá de nuevo.",
  refused:"La IA no pudo procesar ese plano. Probá con otra imagen."
};

async function pedirPlano(prompt, file){
  if (sampleFn){
    return await sampleFn.json(prompt, {images: file && imagesOk ? [file] : undefined, modelTier: "default", cache: false});
  }
  // Fuera de Claude (servidor de Cauce): API propia
  let imagen = null;
  if (file) imagen = await new Promise((ok, ko) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = ko; fr.readAsDataURL(file); });
  let r;
  try { r = await fetch("./api/leer-plano", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({prompt, imagen})}); }
  catch(_) { throw {code:"api", message:"No hay conexión con el servidor de Cauce."}; }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw {code:"api", message: body.error || "El servidor no pudo leer el plano."};
  return body.plano;
}

$("read").onclick = async () => {
  const desc = $("desc").value.trim();
  if (!pickedFile && !desc){ status("Subí un plano o escribí una descripción.", "err"); return; }
  let prompt = PROMPT_BASE;
  if (pickedFile) prompt += "\n\nLa imagen adjunta es el plano. Leelo con cuidado." + (desc ? "\nDatos extra del corredor: " + desc : "");
  else prompt += "\n\nNo hay imagen: diseñá un plano realista y coherente para esta propiedad descripta por el corredor: " + desc;
  $("read").disabled = true; $("busy").hidden = false; status("");
  $("busytxt").textContent = pickedFile ? "La IA está detectando ambientes, medidas y aberturas." : "La IA está armando la distribución de la propiedad.";
  try{
    const data = await pedirPlano(prompt, pickedFile);
    cargar(data, null);
    status(`Listo: ${plan.ambientes.length} ambientes, ${fmt(plan.ambientes.reduce((s,a)=>s+a.ancho*a.largo,0))} m².`, "ok");
  }catch(e){
    status(ERR[e && e.code] || (e && e.message) || "No se pudo leer el plano. Probá con un ejemplo.", "err");
  }finally{
    $("read").disabled = false; $("busy").hidden = true;
  }
};


/* ===================== Sol: controles ===================== */
document.getElementById("hora").addEventListener("input", e => { sol.hora = +e.target.value; aplicarSol(); });
document.querySelectorAll(".seg button").forEach(b => b.onclick = () => {
  sol.estacion = b.dataset.e;
  document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b));
  aplicarSol();
});

/* ===================== Guía con IA ===================== */
const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const CARD = {
  arriba:   {top:"norte", bottom:"sur", left:"oeste", right:"este"},
  abajo:    {top:"sur", bottom:"norte", left:"este", right:"oeste"},
  izquierda:{top:"este", bottom:"oeste", left:"norte", right:"sur"},
  derecha:  {top:"oeste", bottom:"este", left:"sur", right:"norte"}
};
function resumenPlano(){
  const card = CARD[plan.norte] || CARD.arriba;
  const L = v => Math.round(v/G);
  const amb = plan.ambientes;
  return {
    nombre: plan.nombre, zona: plan.zona || "Rosario",
    superficie_total_m2: +amb.reduce((t, a) => t + a.ancho*a.largo, 0).toFixed(1),
    ambientes: amb.map((a, i) => {
      const lados = [
        ["top", "h", L(a.y), a.x, a.ancho], ["bottom", "h", L(a.y + a.largo), a.x, a.ancho],
        ["left", "v", L(a.x), a.y, a.largo], ["right", "v", L(a.x + a.ancho), a.y, a.largo]
      ];
      return {
        nombre: a.nombre, tipo: a.tipo, medidas: `${fmt(a.ancho)} x ${fmt(a.largo)} m`, m2: +(a.ancho*a.largo).toFixed(1),
        paredes: lados.map(([side, ori, line, from, len]) => {
          const hits = plan.aberturas.filter(o => o.orientacion === ori && o.line === line && o.centro + o.ancho/2 > from + 0.05 && o.centro - o.ancho/2 < from + len - 0.05);
          const vecino = amb.find((b, j) => j !== i && (ori === "h"
            ? (L(b.y) === line || L(b.y + b.largo) === line) && b.x < from + len - 0.05 && b.x + b.ancho > from + 0.05
            : (L(b.x) === line || L(b.x + b.ancho) === line) && b.y < from + len - 0.05 && b.y + b.largo > from + 0.05));
          const libre = len - hits.filter(o => o.tipo !== "ventana").reduce((t, o) => t + o.ancho, 0);
          return { orientacion: card[side], largo_m: +len.toFixed(2), largo_libre_m: +Math.max(0, libre).toFixed(2),
                   da_a: vecino ? vecino.nombre : "exterior", aberturas: hits.map(o => `${o.tipo} de ${fmt(o.ancho)} m`) };
        })
      };
    })
  };
}

const SIN = {estar:["living","estar","comedor","sala"], dormitorio:["dormitorio","pieza","habitacion","cuarto","dormir"], bano:["bano","toilette"],
  cocina:["cocina"], balcon:["balcon","terraza"], entrada:["entrada","hall","recibidor"], pasillo:["pasillo"], lavadero:["lavadero"], patio:["patio"]};
function buscarAmbiente(q){
  const n = norm(q), amb = plan.ambientes;
  // nombre exacto primero (ej. "dormitorio 2"), del más largo al más corto
  const porNombre = amb.map((a, i) => [norm(a.nombre), i]).sort((x, y) => y[0].length - x[0].length).find(([nm]) => n.includes(nm));
  if (porNombre) return porNombre[1];
  for (const [tipo, words] of Object.entries(SIN)) if (words.some(w => n.includes(w))){
    const c = amb.map((a, i) => [a, i]).filter(([a]) => a.tipo === tipo || (tipo === "estar" && a.tipo === "comedor"));
    if (c.length) return c.sort((x, y) => y[0].ancho*y[0].largo - x[0].ancho*x[0].largo)[0][1];
  }
  return -1;
}
function respuestaLocal(q, conIA){
  const n = norm(q), amb = plan.ambientes, m2 = a => a.ancho*a.largo;
  const nav = /(llev|lleva|mostr|ir a|vamos|quiero ver|ver el|ver la|entrar|pasame|anda)/.test(n);
  if (/mas grande|mayor/.test(n)){
    const dorm = /dorm|pieza|habitac|cuarto/.test(n);
    const pool = amb.map((a, i) => [a, i]).filter(([a]) => !dorm || a.tipo === "dormitorio");
    if (pool.length){ const [a, i] = pool.sort((x, y) => m2(y[0]) - m2(x[0]))[0];
      return {respuesta:`${dorm ? "El dormitorio más grande" : "El ambiente más grande"} es ${a.nombre}: ${fmt(a.ancho)} × ${fmt(a.largo)} m, ${fmt(m2(a))} m². Te llevo.`, ir_a:i}; }
  }
  if (/cuant.*(dorm|habitac|pieza)/.test(n)){ const d = amb.filter(a => a.tipo === "dormitorio").length;
    return {respuesta: d ? `Tiene ${d} dormitorio${d > 1 ? "s" : ""}.` : "Es un monoambiente: el sector de dormir está integrado al estar.", ir_a:null}; }
  const i = buscarAmbiente(q);
  const pregunta = /(cuant|que |cual|como|donde|entra|cabe|tiene|recibe|hay)/.test(n);
  if (i >= 0 && (nav || (!pregunta && n.split(/\s+/).length <= 3))){
    const a = amb[i];
    return {respuesta:`Vamos a ${a.nombre}: ${fmt(a.ancho)} × ${fmt(a.largo)} m, ${fmt(m2(a))} m².`, ir_a:i};
  }
  if (conIA) return null;
  const med = n.match(/(\d+(?:[.,]\d+)?)\s*(m|mt|mts|metro|metros|cm)\b/);
  if (med && /(entra|cabe|meter|pongo|poner)/.test(n)){
    let largo = parseFloat(med[1].replace(",", ".")); if (med[2] === "cm") largo /= 100;
    const k = i >= 0 ? i : Math.max(0, amb.findIndex(a => a.tipo === "estar"));
    const r = resumenPlano().ambientes[k], mejor = r.paredes.reduce((x, y) => y.largo_libre_m > x.largo_libre_m ? y : x);
    const ok = mejor.largo_libre_m >= largo + 0.2;
    return {respuesta: ok
      ? `Sí. La pared ${mejor.orientacion} de ${amb[k].nombre} tiene ${fmt(mejor.largo_libre_m)} m libres, así que un mueble de ${fmt(largo)} m entra con margen.`
      : `Va justo: la pared libre más larga de ${amb[k].nombre} mide ${fmt(mejor.largo_libre_m)} m. Para ${fmt(largo)} m conviene revisarlo con la inmobiliaria.`, ir_a:k};
  }
  if (/(sol|luz|luminos|claro)/.test(n)){
    const peso = {norte:3, este:1.6, oeste:1.4, sur:0.4};
    const res = resumenPlano().ambientes.map((r, k) => [k, r.paredes.reduce((t, w) => t + w.aberturas.reduce((u, a) => u + parseFloat(a.replace(/[^0-9,]/g, "").replace(",", ".")) * (/ventan/.test(a) ? 1 : 0), 0) * peso[w.orientacion], 0)]);
    const [k, sc] = res.sort((x, y) => y[1] - x[1])[0];
    if (sc > 0){
      const w = resumenPlano().ambientes[k].paredes.filter(p => p.aberturas.some(a => /ventan/.test(a))).map(p => p.orientacion);
      return {respuesta:`${amb[k].nombre} es el más luminoso: tiene aberturas al ${[...new Set(w)].join(" y al ")}. Probá mover la barra del sol para ver cómo entra la luz.`, ir_a:k};
    }
  }
  if (i >= 0 && /m2|metros|mide|medida|tamano|grande/.test(n)){
    const a = amb[i]; return {respuesta:`${a.nombre} mide ${fmt(a.ancho)} × ${fmt(a.largo)} m, ${fmt(m2(a))} m².`, ir_a:i};
  }
  if (/total|superficie|cuantos metros|m2/.test(n)) return {respuesta:`La propiedad tiene ${fmt(amb.reduce((t, a) => t + m2(a), 0))} m² cubiertos y semicubiertos, en ${amb.length} ambientes.`, ir_a:null};
  return {respuesta:"Puedo llevarte a cualquier ambiente y decirte sus medidas. Para consultas más detalladas, la inmobiliaria te responde enseguida.", ir_a:null};
}

let historial = [];
async function preguntarIA(q){
  const actual = mode === "recorrido" ? (plan.ambientes[roomAt(camera.position.x, camera.position.z)] || {}).nombre || "la maqueta" : "la vista de maqueta";
  const prev = historial.slice(-4).map(h => `${h.rol === "yo" ? "Visitante" : "Guía"}: ${h.texto}`).join("\n");
  const prompt = `Sos la guía virtual de una propiedad en venta. Respondés las preguntas de posibles compradores mientras recorren su maqueta 3D.
Datos de la propiedad (medidas en metros, obtenidas del plano):
${JSON.stringify(resumenPlano())}
El visitante está en: ${actual}.
${prev ? "Conversación previa:\n" + prev + "\n" : ""}Pregunta del visitante: "${q}"

Respondé SOLO un objeto JSON: {"respuesta": string, "ir_a": string o null}
- respuesta: español rioplatense, cálido y profesional, máximo 3 oraciones, con medidas concretas cuando sirvan.
- Usá solo estos datos. Si preguntan algo que no está (precio, expensas, antigüedad, estado, amenities), decí que eso lo responde la inmobiliaria.
- Para saber si entra un mueble, compará su medida con "largo_libre_m" de las paredes del ambiente (ya descuenta puertas y pasos) y dejá un margen razonable.
- Para sol y luz: en Rosario (hemisferio sur) las aberturas al norte reciben más sol todo el año; al este, de mañana; al oeste, de tarde; al sur, casi nada.
- ir_a: el nombre exacto de un ambiente si conviene mostrarlo o si lo pidieron; si no, null.`;
  if (sampleFn) return await sampleFn.json(prompt, {modelTier:"quick", cache:false});
  let r;
  try { r = await fetch("./api/guia", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({prompt})}); }
  catch(_) { throw {code:"api"}; }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw {code:"api", status:r.status, message: body.error};
  return body.guia;
}

const msgs = $("msgs");
function burbuja(rol, texto, extra){
  const d = document.createElement("div"); d.className = "msg " + rol; d.textContent = texto;
  if (extra){ const g = document.createElement("span"); g.className = "go"; g.textContent = extra; d.append(g); }
  msgs.append(d); msgs.scrollTop = msgs.scrollHeight; return d;
}
let iaDisponible = null;   // null = no sabemos todavía
async function preguntar(q){
  q = q.trim(); if (!q) return;
  burbuja("yo", q); historial.push({rol:"yo", texto:q});
  $("gIn").value = ""; $("gSend").disabled = true;
  const usarIA = iaDisponible !== false;
  let r = respuestaLocal(q, usarIA);
  if (!r){
    const p = burbuja("ella pensando", "Mirando el plano…");
    try{
      const data = await preguntarIA(q);
      const idx = data && data.ir_a ? plan.ambientes.findIndex(a => norm(a.nombre) === norm(data.ir_a)) : -1;
      r = {respuesta: String((data && data.respuesta) || "No tengo ese dato; la inmobiliaria te lo responde enseguida."), ir_a: idx >= 0 ? idx : null};
      iaDisponible = true;
    }catch(e){
      if (e && (e.code === "not_granted" || e.code === "sampling_disabled" || e.status === 503)) iaDisponible = false;
      r = respuestaLocal(q, false);
    }
    p.remove();
  }
  const extra = r.ir_a != null ? "→ Te llevo a " + plan.ambientes[r.ir_a].nombre : "";
  burbuja("ella", r.respuesta, extra); historial.push({rol:"ella", texto:r.respuesta});
  if (r.ir_a != null) mode === "recorrido" ? irA(r.ir_a) : setMode("recorrido", r.ir_a);
  $("gSend").disabled = false;
}
function iniciarGuia(){
  msgs.innerHTML = ""; historial = [];
  const amb = plan.ambientes, tot = amb.reduce((t, a) => t + a.ancho*a.largo, 0);
  burbuja("ella", `Hola, soy la guía de ${plan.nombre}. Son ${fmt(tot)} m² en ${amb.length} ambientes. Preguntame lo que quieras o pedime que te lleve a un ambiente.`);
  const big = amb.map((a, i) => [a, i]).sort((x, y) => y[0].ancho*y[0].largo - x[0].ancho*x[0].largo);
  const estar = amb.find(a => a.tipo === "estar" || a.tipo === "comedor");
  const sug = [
    amb.some(a => a.tipo === "balcon") ? "Llevame al balcón" : `Llevame a ${(amb.find(a => a.tipo === "dormitorio") || big[0][0]).nombre}`,
    estar ? `¿Entra un sillón de 2,20 m en ${estar.nombre.toLowerCase()}?` : "¿Cuál es el ambiente más grande?",
    "¿Qué ambiente recibe más sol?",
    "¿Cuántos m² tiene en total?"
  ];
  const box = $("sugs"); box.innerHTML = "";
  sug.forEach(t => { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.onclick = () => preguntar(t); box.append(b); });
}
$("gForm").addEventListener("submit", e => { e.preventDefault(); preguntar($("gIn").value); });
function guia(open){
  $("guide").hidden = !open; $("gOpen").hidden = open; stage.classList.toggle("g-open", open);
}
$("gClose").onclick = () => guia(false);
$("gOpen").onclick = () => guia(true);
if (matchMedia("(max-width: 820px)").matches) guia(false);

/* ===================== Loop ===================== */
function resize(){
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / Math.max(h, 1); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);

let last = performance.now();
function frame(now){
  const dt = Math.min(0.05, (now - last)/1000); last = now;
  for (let k = tweens.length - 1; k >= 0; k--){
    const tw = tweens[k], p = Math.min(1, (now - tw.t0)/tw.dur);
    tw.fn(ease(p)); if (p >= 1){ tweens.splice(k, 1); tw.done && tw.done(); }
  }
  cutPlane.constant += (cutTarget - cutPlane.constant) * Math.min(1, dt*6);
  if (mode === "maqueta" && !tweens.length) controls.update();
  walk(dt);
  placeLabels(); updateChips();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

renderPresets();
const start = (location.hash || "").slice(1);
const k0 = PRESETS[start] ? start : "montevideo";
resize();
cargar(PRESETS[k0], k0);
requestAnimationFrame(frame);
})();
