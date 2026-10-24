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
  estar:{floor:"wood", color:"#b8916a"}, comedor:{floor:"wood", color:"#b8916a"},
  dormitorio:{floor:"wood", color:"#b8916a"}, cocina:{floor:"tile", color:"#d6d2cb"},
  bano:{floor:"tile", color:"#dcd9d3"}, lavadero:{floor:"tile", color:"#d6d2cb"},
  entrada:{floor:"wood", color:"#b8916a"}, pasillo:{floor:"wood", color:"#b8916a"},
  balcon:{floor:"deck", color:"#9c968c"}, patio:{floor:"deck", color:"#9c968c"},
  otro:{floor:"tile", color:"#d6d2cb"}
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
  return {nombre: String(raw.nombre || "Plano sin nombre").slice(0, 60), zona: raw.zona || "", norte, ambientes: amb, aberturas: ab,
          origen: ["video", "demo"].includes(raw.origen) ? raw.origen : null};
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
renderer.toneMappingExposure = 1.0;
renderer.physicallyCorrectLights = false;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 3; controls.maxDistance = 40;

const hemi = new THREE.HemisphereLight(0xeef3ff, 0xb9b3a6, 0.45);
scene.add(hemi);
// luz ambiente con reflejos suaves (estudio neutro), lo que más saca el aspecto "de juego"
try{
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
}catch(_){}
const sun = new THREE.DirectionalLight(0xfff4e3, 0.9);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
scene.add(sun, sun.target);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({color:0xdcdcd3, roughness:1}));
ground.rotation.x = -Math.PI/2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);

// el entorno toma el color del tema (claro u oscuro); desde adentro, vereda y calle
const groundOut = new THREE.Color(0xdcdcd3), groundIn = new THREE.Color(0xa8a79f);
function themeScene(){
  const c = getComputedStyle(document.documentElement).getPropertyValue("--stage").trim() || "#e9ebe6";
  const col = new THREE.Color(c);
  groundOut.copy(col).offsetHSL(0, -0.05, 0.035);
  ground.material.color.copy(ground.userData.inside ? groundIn : groundOut);
  scene.fog = new THREE.Fog(col, 30, 90);
}
themeScene();
try{ matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeScene); }catch(_){}
new MutationObserver(themeScene).observe(document.documentElement, {attributes:true, attributeFilter:["data-theme"]});

const cutPlane = new THREE.Plane(new THREE.Vector3(0,-1,0), 1.3);
const clip = [cutPlane];
/* ---------- texturas procedurales (sin descargas) ---------- */
function canvasTex(size, draw, srgb = true){
  const c = document.createElement("canvas"); c.width = c.height = size; draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t;
}
let seedR = 11; const rr = () => (seedR = (seedR * 16807) % 2147483647) / 2147483647;
const plaster = canvasTex(256, (g, n) => {
  g.fillStyle = "#f1eee8"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 2600; i++){ const v = 228 + Math.floor(rr()*22); g.fillStyle = `rgba(${v},${v-3},${v-8},.35)`; g.fillRect(rr()*n, rr()*n, 2 + rr()*3, 2 + rr()*3); }
});
const linenTex = canvasTex(128, (g, n) => {
  g.fillStyle = "#fff"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < n; i += 2){ g.fillStyle = `rgba(0,0,0,${0.03 + rr()*0.04})`; g.fillRect(0, i, n, 1); g.fillRect(i, 0, 1, n); }
});
linenTex.repeat.set(4, 4);

const matWall = new THREE.MeshStandardMaterial({color:0xffffff, map:plaster, roughness:0.95, envMapIntensity:0.5, clippingPlanes:clip});
const matPoche = new THREE.MeshBasicMaterial({color:0x2b302d, side:THREE.BackSide, clippingPlanes:clip});
const matFrame = new THREE.MeshStandardMaterial({color:0xe9e5de, roughness:0.5, clippingPlanes:clip});
const matGlass = new THREE.MeshPhysicalMaterial({color:0xcfe3ec, transparent:true, opacity:0.18, roughness:0.02, metalness:0, reflectivity:0.6, envMapIntensity:1.4, clippingPlanes:clip, depthWrite:false});
const matRail = new THREE.MeshStandardMaterial({color:0x2e3233, roughness:0.35, metalness:0.7, clippingPlanes:clip});
const matCeil = new THREE.MeshStandardMaterial({color:0xf7f6f2, roughness:1, envMapIntensity:0.4, side:THREE.DoubleSide});
const matZocalo = new THREE.MeshStandardMaterial({color:0xf3f1ec, roughness:0.45, clippingPlanes:clip});
const matLeaf = new THREE.MeshStandardMaterial({color:0xefece6, roughness:0.4, clippingPlanes:clip});
const matAlu = new THREE.MeshStandardMaterial({color:0x2f3436, roughness:0.35, metalness:0.75, clippingPlanes:clip});
const matLamp = new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xfff0d8, emissiveIntensity:1.2});
const M = (color, rough = 0.8, metal = 0, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({color, roughness:rough, metalness:metal, clippingPlanes:clip}, extra));
const FM = {
  tela:M(0x8f8a82, 0.95, 0, {map:linenTex}),          // lino gris cálido
  telaOsc:M(0x5d5b56, 0.95, 0, {map:linenTex}),
  telaClara:M(0xf2efe9, 0.9, 0, {map:linenTex}),      // sábanas
  duvet:M(0xd9d1c3, 0.95, 0, {map:linenTex}),
  acentoSalvia:M(0x8a9580, 0.95, 0, {map:linenTex}),
  acentoOcre:M(0xb69560, 0.95, 0, {map:linenTex}),
  madera:M(0xb48b62, 0.5), maderaOsc:M(0x6b5240, 0.5), roble:M(0xc5a27a, 0.45),
  blanco:M(0xeeece7, 0.35), porcelana:M(0xf8f8f6, 0.12), mesada:M(0xd5d1c9, 0.25), vidrioNegro:M(0x111213, 0.08),
  acero:M(0xc4c7ca, 0.28, 0.9), negroMetal:M(0x1d1f20, 0.4, 0.6), espejo:M(0xdfe6ea, 0.03, 1),
  alfombra:M(0xcfc6b8, 1), maceta:M(0x8a7d70, 0.9), planta:M(0x3f5a39, 0.75), planta2:M(0x55703f, 0.75),
  pantalla:M(0xf3eadb, 0.9, 0, {emissive:0x6b5a40, emissiveIntensity:0.25, side:THREE.DoubleSide}), zocaloOsc:M(0x2a2b2a, 0.8)
};

const texCache = {};
function floorTex(kind, color){
  const key = kind + color; if (texCache[key]) return texCache[key];
  const base = new THREE.Color(color);
  const tone = (k, a = 1) => { const c = base.clone().multiplyScalar(k); return `rgba(${c.r*255|0},${c.g*255|0},${c.b*255|0},${a})`; };
  const t = canvasTex(512, (g, n) => {
    g.fillStyle = tone(1); g.fillRect(0, 0, n, n);
    if (kind === "wood"){
      const rows = 12, h = n / rows;
      for (let r = 0; r < rows; r++){
        let x = -rr()*n*0.6;
        while (x < n){
          const w = n*(0.45 + rr()*0.5), k = 0.88 + rr()*0.22;
          g.fillStyle = tone(k); g.fillRect(x, r*h, w, h);
          for (let l = 0; l < 7; l++){                  // veta
            g.strokeStyle = tone(k*(0.8 + rr()*0.12), 0.35); g.lineWidth = 0.6 + rr();
            g.beginPath(); const y0 = r*h + rr()*h; g.moveTo(x, y0);
            for (let q = 0; q <= 8; q++) g.lineTo(x + w*q/8, y0 + Math.sin(q*1.3 + l)*h*0.12);
            g.stroke();
          }
          g.fillStyle = "rgba(40,25,10,.35)"; g.fillRect(x + w - 1, r*h, 1.2, h);   // junta
          x += w;
        }
        g.fillStyle = "rgba(40,25,10,.28)"; g.fillRect(0, r*h, n, 1.2);
      }
    } else if (kind === "tile"){
      const k = 2, s = n / k;                            // porcelanato 60x60
      for (let i = 0; i < k; i++) for (let j = 0; j < k; j++){
        g.fillStyle = tone(0.97 + rr()*0.05); g.fillRect(i*s, j*s, s, s);
        for (let q = 0; q < 900; q++){ g.fillStyle = tone(0.9 + rr()*0.15, 0.25); g.fillRect(i*s + rr()*s, j*s + rr()*s, 2, 2); }
      }
      g.fillStyle = tone(0.78); for (let i = 0; i <= k; i++){ g.fillRect(i*s - 1, 0, 2.5, n); g.fillRect(0, i*s - 1, n, 2.5); }
    } else {
      for (let r = 0; r < 10; r++){ g.fillStyle = tone(0.93 + rr()*0.1); g.fillRect(0, r*n/10, n, n/10 - 3); }
    }
  });
  texCache[key] = t; return t;
}
// sombra de contacto (simula oclusión ambiental debajo de muebles y en el encuentro piso-pared)
const blobTex = canvasTex(128, (g, n) => {
  const gr = g.createRadialGradient(n/2, n/2, 0, n/2, n/2, n/2);
  gr.addColorStop(0, "rgba(0,0,0,.45)"); gr.addColorStop(0.6, "rgba(0,0,0,.18)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, n, n);
}, false);
const matBlob = new THREE.MeshBasicMaterial({map:blobTex, transparent:true, depthWrite:false, toneMapped:false, clippingPlanes:clip});
function aoPiso(a){
  const px = 48, W = Math.max(8, Math.round(a.ancho*px)), Hh = Math.max(8, Math.round(a.largo*px)), e = 0.28*px;
  const c = document.createElement("canvas"); c.width = W; c.height = Hh; const g = c.getContext("2d");
  const lado = (x0, y0, x1, y1, rx, ry, rw, rh) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, "rgba(0,0,0,.32)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(rx, ry, rw, rh); };
  lado(0,0,0,e, 0,0,W,e); lado(0,Hh,0,Hh-e, 0,Hh-e,W,e); lado(0,0,e,0, 0,0,e,Hh); lado(W,0,W-e,0, W-e,0,e,Hh);
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(a.ancho, a.largo), new THREE.MeshBasicMaterial({map:t, transparent:true, depthWrite:false, toneMapped:false}));
  m.rotation.x = -Math.PI/2; m.position.set(a.x + a.ancho/2, 0.004, a.y + a.largo/2); m.renderOrder = 1; return m;
}

let model = null, plan = null, floors = [], bounds = null, ceilings = null;

/* ===================== Recursos reales (modelos, parquet y panorama de ciudad) ===================== */
const REAL = {};
let pmremGen = null; try{ pmremGen = new THREE.PMREMGenerator(renderer); }catch(_){}
function prepararModelo(gltf){
  const root = gltf.scene;
  const quitar = []; root.traverse(o => { if (o.isLight) quitar.push(o); });
  quitar.forEach(o => o.parent && o.parent.remove(o));
  root.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    const fix = m => { m = m.clone(); m.clippingPlanes = clip; if (m.transparent) m.depthWrite = false; return m; };
    o.material = Array.isArray(o.material) ? o.material.map(fix) : fix(o.material);
  });
  const box3 = new THREE.Box3().setFromObject(root), size = box3.getSize(new THREE.Vector3()), c = box3.getCenter(new THREE.Vector3());
  const wrap = new THREE.Group(); root.position.set(-c.x, -box3.min.y, -c.z); wrap.add(root);
  return {obj:wrap, size};
}
// clona un modelo real escalado a un ancho (o alto) objetivo
function real(nombre, {ancho, alto} = {}){
  const r = REAL[nombre]; if (!r) return null;
  const k = ancho ? ancho / r.size.x : alto ? alto / r.size.y : 1;
  const o = r.obj.clone(true); o.scale.setScalar(k);
  return {obj:o, d:r.size.z*k, w:r.size.x*k, h:r.size.y*k};
}
function cargarRecursos(){
  const pend = [];
  if (THREE.GLTFLoader){
    const gl = new THREE.GLTFLoader();
    [["sofa","sofa.glb"], ["sillon","sillon.glb"], ["planta","planta.glb"], ["florero","florero.glb"]].forEach(([k, f]) =>
      pend.push(new Promise(ok => gl.load("./assets/" + f, g => { try{ REAL[k] = prepararModelo(g); }catch(_){} ok(); }, undefined, () => ok()))));
  }
  const tl = new THREE.TextureLoader();
  pend.push(new Promise(ok => tl.load("./assets/parquet.jpg", t => { t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); REAL.parquet = t; ok(); }, undefined, () => ok())));
  pend.push(new Promise(ok => tl.load("./assets/parquet-rugosidad.jpg", t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; REAL.parquetR = t; ok(); }, undefined, () => ok())));
  if (THREE.RGBELoader){
    pend.push(new Promise(ok => new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load("./assets/ciudad.hdr", t => {
      REAL.ciudad = t; try{ if (pmremGen){ REAL.ciudadEnv = pmremGen.fromEquirectangular(t).texture; scene.environment = REAL.ciudadEnv; } }catch(_){}
      ok(); }, undefined, () => ok())));
  }
  Promise.all(pend).then(() => { if (plan){ const cam = camera.position.clone(), q = camera.quaternion.clone(); construir(plan); camera.position.copy(cam); camera.quaternion.copy(q); } });
}

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
  const m = geo && geo.isObject3D ? geo : new THREE.Mesh(geo, mat);
  if (m.isMesh){ m.castShadow = true; m.receiveShadow = true; }
  if (w.side === "top"){ m.position.set(cx + u, y, a.y + off); }
  else if (w.side === "bottom"){ m.position.set(cx - u, y, a.y + a.largo - off); m.rotation.y = Math.PI; }
  else if (w.side === "left"){ m.position.set(a.x + off, y, cz - u); m.rotation.y = Math.PI/2; }
  else { m.position.set(a.x + a.ancho - off, y, cz + u); m.rotation.y = -Math.PI/2; }
  group.add(m); return m;
}
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const R = (w, h, d, r = 0.03) => { try{ return new THREE.RoundedBoxGeometry(w, h, d, 3, Math.min(r, w/2 - 0.001, h/2 - 0.001, d/2 - 0.001)); }catch(_){ return B(w, h, d); } };
const CYL = (rt, rb, h, n = 28) => new THREE.CylinderGeometry(rt, rb, h, n);
function amueblar(a, ab, g){
  const lados = paredes(a, ab), w = lados[0], along = w.along, depth = w.depth;
  const P = (geo, mat, u, s, y, d, sombra = true) => { const m = put(a, w, geo, mat, u, s, y, g, d); if (!sombra) m.castShadow = false; return m; };
  const blob = (ww, dd, u, s) => { const m = P(new THREE.PlaneGeometry(ww*1.25, dd*1.25), matBlob, u, s - dd*0.125, 0.006, dd*1.25, false); m.rotation.order = "YXZ"; m.rotation.x = -Math.PI/2; m.receiveShadow = false; m.renderOrder = 2; };
  const planta = (u, s, esc = 1) => {
    const rp = real("planta", {alto: 1.15*esc});
    if (rp){ P(rp.obj, null, u, s, 0, rp.d); blob(rp.w*0.7, rp.d*0.7, u, s); return; }
    P(CYL(0.17*esc, 0.13*esc, 0.42*esc), FM.maceta, u, s, 0.21*esc, 0.34*esc);
    [[0,0.78,0,0.26],[0.12,0.92,0.06,0.2],[-0.1,0.95,-0.05,0.19],[0.03,1.12,0.02,0.16],[-0.08,0.7,0.1,0.18]].forEach(([dx,y,dz,r], k) =>
      P(new THREE.SphereGeometry(r*esc, 18, 14), k % 2 ? FM.planta2 : FM.planta, u + dx*esc, s + dz*esc + 0.04, y*esc, 0.34*esc));
    blob(0.34*esc, 0.34*esc, u, s);
  };
  const lampara = (u, s, y0) => {
    P(CYL(0.06, 0.07, 0.03), FM.negroMetal, u, s, y0 + 0.015, 0.14);
    P(CYL(0.008, 0.008, 0.3, 8), FM.negroMetal, u, s + 0.065, y0 + 0.18, 0.016);
    P(CYL(0.1, 0.13, 0.19, 32), FM.pantalla, u, s, y0 + 0.4, 0.26);
  };
  switch (a.tipo){
    case "dormitorio": {
      if (depth < 2.3 || along < 1.2) break;
      const bw = (along >= 2.6 && depth >= 2.6) ? 1.4 : 0.9, L = 2.0;
      P(R(bw + 0.16, 1.05, 0.09, 0.03), FM.tela, 0, 0, 0.525, 0.09);
      P(R(bw + 0.04, 0.28, L, 0.025), FM.tela, 0, 0.09, 0.2, L);
      P(R(bw, 0.24, L - 0.04, 0.07), FM.telaClara, 0, 0.11, 0.45, L - 0.04);
      P(R(bw + 0.06, 0.08, L*0.66, 0.035), FM.duvet, 0, 0.11 + L*0.34, 0.6, L*0.66);
      P(R(bw + 0.08, 0.085, 0.36, 0.035), FM.acentoSalvia, 0, 0.11 + L - 0.5, 0.605, 0.36);
      const nP = bw > 1 ? 2 : 1;
      for (let k = 0; k < nP; k++) P(R(nP > 1 ? 0.6 : 0.7, 0.14, 0.4, 0.065), FM.telaClara, nP > 1 ? (k ? 0.33 : -0.33) : 0, 0.16, 0.66, 0.4);
      blob(bw + 0.1, L, 0, 0.09);
      if (along >= bw + 1.1) [-1, 1].forEach(k => {
        const u = k*(bw/2 + 0.32);
        P(R(0.46, 0.5, 0.38, 0.015), FM.roble, u, 0.02, 0.25, 0.38); blob(0.46, 0.38, u, 0.02);
        lampara(u, 0.1, 0.5);
      });
      if (lados[1] && lados[1].along >= 2.2 && !lados[1].blocked) planta(0, 0.1, 0.9);
      { const rc = real("sillon", {ancho: 0.78});
        if (rc && depth >= 3.0 && along >= bw + 1.9){ const ch = P(rc.obj, null, -(along/2 - 0.55), L - 0.2, 0, rc.d); ch.rotation.y += 0.5; blob(0.78, 0.78, -(along/2 - 0.55), L - 0.2); } }
      break;
    }
    case "estar": case "comedor": {
      if (depth < 2.2 || along < 1.8) break;
      const sw = Math.min(2.3, along - 0.7);
      if (a.tipo === "estar"){
        const rug = P(R(Math.min(2.8, sw + 0.6), 0.012, 1.9, 0.005), FM.alfombra, 0, 0.5, 0.006, 1.9, false); rug.receiveShadow = true;
        // sillón: modelo real si está cargado; si no, uno armado con formas
        const rs = real("sofa", {ancho: Math.min(sw, 2.25)});
        if (rs){
          P(rs.obj, null, 0, 0.03, 0, rs.d); blob(rs.w, rs.d, 0, 0.03);
          const rc = real("sillon", {ancho: 0.8});
          if (rc && depth >= 3.0 && along >= rs.w + 1.4){
            const ch = P(rc.obj, null, rs.w/2 + 0.65, 0.9, 0, rc.d); ch.rotation.y += -0.7; blob(0.8, 0.8, rs.w/2 + 0.65, 0.9);
          }
        } else {
        const arm = 0.16, n = sw > 1.9 ? 3 : 2, cw = (sw - arm*2)/n;
        P(R(sw, 0.2, 0.94, 0.03), FM.tela, 0, 0.02, 0.17, 0.94);
        [-1, 1].forEach(k => P(R(arm, 0.6, 0.94, 0.05), FM.tela, k*(sw/2 - arm/2), 0.02, 0.36, 0.94));
        for (let k = 0; k < n; k++){
          const u = -sw/2 + arm + cw*(k + 0.5);
          P(R(cw - 0.015, 0.17, 0.66, 0.07), FM.tela, u, 0.28, 0.355, 0.66);
          P(R(cw - 0.015, 0.46, 0.22, 0.09), FM.tela, u, 0.05, 0.6, 0.22);
        }
        P(R(0.44, 0.42, 0.13, 0.07), FM.acentoOcre, -sw/2 + arm + 0.3, 0.25, 0.64, 0.13);
        P(R(0.42, 0.4, 0.13, 0.07), FM.acentoSalvia, sw/2 - arm - 0.3, 0.25, 0.63, 0.13);
        [-1, 1].forEach(k => [0.06, 0.86].forEach(sv => P(CYL(0.02, 0.015, 0.08, 10), FM.maderaOsc, k*(sw/2 - 0.08), 0.02 + sv, 0.04, 0.04)));
        blob(sw, 0.94, 0, 0.02);
        }
        if (depth >= 2.6){
          P(CYL(0.42, 0.42, 0.035, 48), FM.roble, 0, 1.25, 0.4, 0.84);
          P(CYL(0.08, 0.14, 0.37, 24), FM.maderaOsc, 0, 1.25 + 0.34, 0.2, 0.16);
          blob(0.84, 0.84, 0, 1.25);
          P(R(0.32, 0.04, 0.22, 0.01), FM.telaOsc, 0.12, 1.45, 0.43, 0.22);   // libro
          const fl = real("florero", {alto: 0.32}); if (fl){ const o = P(fl.obj, null, -0.12, 1.2, 0.0, fl.d); o.position.y = 0.418; }
        }
        if (along >= sw + 1.2){ const u = sw/2 + 0.35;
          P(CYL(0.13, 0.15, 0.03, 24), FM.negroMetal, u, 0.1, 0.015, 0.3);
          P(CYL(0.012, 0.012, 1.45, 8), FM.negroMetal, u, 0.24, 0.74, 0.024);
          P(CYL(0.17, 0.22, 0.26, 32), FM.pantalla, u, 0.12, 1.55, 0.44);
          planta(-(sw/2 + 0.4), 0.05);
        }
        // mueble bajo y tele en la pared de enfrente
        if (depth >= 3.2){
          const s2 = depth - T - 0.42;
          P(R(1.7, 0.46, 0.4, 0.015), FM.roble, 0, s2, 0.25, 0.4);
          P(R(1.3, 0.76, 0.045, 0.01), FM.vidrioNegro, 0, s2 + 0.18, 1.0, 0.045);
          blob(1.7, 0.4, 0, s2);
        }
      }
      if (a.tipo === "comedor" || (a.ancho * a.largo > 16 && depth >= 3.6)){
        const s = a.tipo === "comedor" ? Math.max(0.6, depth/2 - 0.45) : Math.max(2.4, depth - 1.7);
        P(R(1.6, 0.04, 0.9, 0.012), FM.roble, 0, s, 0.75, 0.9);
        [[-0.72, 0.06], [0.72, 0.06], [-0.72, 0.78], [0.72, 0.78]].forEach(([u, sv]) => P(B(0.05, 0.73, 0.05), FM.maderaOsc, u, s + sv, 0.365, 0.05));
        [-0.38, 0.38].forEach(u => [[-0.5, 0], [0.96, 1]].forEach(([sv, back]) => {
          P(R(0.44, 0.05, 0.44, 0.015), FM.tela, u, s + sv, 0.46, 0.44);
          P(R(0.44, 0.42, 0.04, 0.015), FM.tela, u, s + sv + (back ? 0.4 : 0), 0.7, 0.04);
          [[-0.19, 0.03], [0.19, 0.03], [-0.19, 0.39], [0.19, 0.39]].forEach(([du, ds]) => P(CYL(0.012, 0.012, 0.44, 8), FM.negroMetal, u + du, s + sv + ds, 0.22, 0.024));
        }));
        blob(1.9, 1.5, 0, s - 0.3);
        { const fl = real("florero", {alto: 0.36}); if (fl){ const o = P(fl.obj, null, 0, s + 0.3, 0, fl.d); o.position.y = 0.77; } }
        P(CYL(0.005, 0.005, 0.6, 6), FM.negroMetal, 0, s + 0.43, H - 0.3, 0.01);
        P(new THREE.SphereGeometry(0.17, 32, 16, 0, Math.PI*2, 0, Math.PI/2), FM.pantalla, 0, s + 0.28, H - 0.6, 0.34);
      }
      break;
    }
    case "cocina": {
      if (along < 1.4) break;
      const fridge = along >= 2.3;
      const len = Math.min(fridge ? along - 1.0 : along - 0.2, 3.0);
      const uc = fridge ? 0.4 : 0, mods = Math.max(1, Math.round(len/0.6)), mw = len/mods;
      P(B(len, 0.1, 0.5), FM.zocaloOsc, uc, 0.02, 0.05, 0.5);
      for (let k = 0; k < mods; k++){
        const u = uc - len/2 + mw*(k + 0.5);
        P(R(mw - 0.004, 0.74, 0.58, 0.006), FM.blanco, u, 0, 0.47, 0.58);
        P(R(mw - 0.004, 0.68, 0.34, 0.006), FM.blanco, u, 0, 1.86, 0.34);
        P(B(0.12, 0.012, 0.012), FM.acero, u, 0.585, 0.78, 0.012);
      }
      P(R(len + 0.02, 0.03, 0.62, 0.004), FM.mesada, uc, 0, 0.855, 0.62);
      P(B(len, 0.6, 0.012), FM.porcelana, uc, 0, 1.17, 0.012);          // revestimiento
      P(R(0.56, 0.012, 0.5, 0.004), FM.vidrioNegro, uc - len/2 + 0.45, 0.04, 0.876, 0.5);
      P(R(0.5, 0.02, 0.4, 0.01), FM.acero, uc + len/2 - 0.5, 0.08, 0.866, 0.4);
      P(CYL(0.012, 0.012, 0.32, 10), FM.acero, uc + len/2 - 0.5, 0.03, 1.03, 0.024);
      blob(len, 0.6, uc, 0);
      if (fridge){ P(R(0.7, 1.86, 0.68, 0.02), FM.acero, uc - len/2 - 0.42, 0, 0.93, 0.68); blob(0.7, 0.68, uc - len/2 - 0.42, 0); }
      break;
    }
    case "bano": {
      if (along < 1.2) break;
      const ut = -along/2 + 0.42, uv = along/2 - 0.42;
      P(R(0.37, 0.4, 0.55, 0.12), FM.porcelana, ut, 0.17, 0.2, 0.55);
      P(R(0.4, 0.36, 0.17, 0.04), FM.porcelana, ut, 0, 0.6, 0.17);
      blob(0.4, 0.6, ut, 0.05);
      P(R(0.62, 0.42, 0.45, 0.015), FM.roble, uv, 0, 0.6, 0.45);
      P(R(0.64, 0.1, 0.47, 0.035), FM.porcelana, uv, 0, 0.86, 0.47);
      P(R(0.6, 0.8, 0.02, 0.01), FM.espejo, uv, 0, 1.5, 0.02);
      P(CYL(0.01, 0.01, 0.14, 8), FM.acero, uv, 0.08, 0.98, 0.02);
      break;
    }
    case "lavadero": P(R(0.6, 0.85, 0.6, 0.03), FM.blanco, 0, 0, 0.425, 0.6); blob(0.6, 0.6, 0, 0); break;
    case "balcon": case "patio": {
      planta(along/2 - 0.4, 0.06);
      if (along >= 2.4){
        [-0.75, -0.05].forEach(u => { P(R(0.46, 0.04, 0.46, 0.01), FM.roble, u, 0.15, 0.45, 0.46);
          P(R(0.46, 0.4, 0.03, 0.01), FM.roble, u, 0.15, 0.68, 0.03);
          [[-0.2, 0.02], [0.2, 0.02], [-0.2, 0.42], [0.2, 0.42]].forEach(([du, ds]) => P(CYL(0.012, 0.012, 0.45, 8), FM.negroMetal, u + du, 0.15 + ds, 0.22, 0.024));
          blob(0.46, 0.46, u, 0.15); });
        P(CYL(0.25, 0.25, 0.03, 32), FM.negroMetal, -0.4, 0.8, 0.6, 0.5);
        P(CYL(0.015, 0.015, 0.6, 8), FM.negroMetal, -0.4, 1.03, 0.3, 0.03);
      }
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
    const tile = t.floor === "tile" ? 1.2 : t.floor === "deck" ? 1.6 : 2.6;
    tex.repeat.set(a.ancho / tile, a.largo / tile);
    const rough = t.floor === "wood" ? 0.42 : t.floor === "tile" ? 0.28 : 0.9;
    let fm;
    if (t.floor === "wood" && REAL.parquet){
      const map = REAL.parquet.clone(); map.needsUpdate = true; map.repeat.set(a.ancho/1.6, a.largo/1.6);
      const rm = REAL.parquetR ? REAL.parquetR.clone() : null; if (rm){ rm.needsUpdate = true; rm.repeat.copy(map.repeat); }
      fm = new THREE.MeshStandardMaterial({map, roughnessMap:rm, roughness:rm ? 1 : 0.45, envMapIntensity:0.9});
    } else fm = new THREE.MeshStandardMaterial({map:tex, roughness:rough, envMapIntensity:0.8});
    const m = new THREE.Mesh(new THREE.PlaneGeometry(a.ancho, a.largo), fm);
    m.rotation.x = -Math.PI/2; m.position.set(a.x + a.ancho/2, 0.001, a.y + a.largo/2);
    m.receiveShadow = true; m.userData.room = i; model.add(m); floors.push(m);
    if (!["balcon","patio"].includes(a.tipo)) model.add(aoPiso(a));
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
    const pl = new THREE.PointLight(0xffe7c4, 0.32, Math.max(a.ancho, a.largo) + 2.5, 2);
    pl.position.set(a.x + a.ancho/2, H - 0.25, a.y + a.largo/2); ceilings.add(pl);
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
  const pano = REAL.ciudad;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(140, 48, 24), new THREE.MeshBasicMaterial({map:pano || skyTex, side:THREE.BackSide, fog:false, toneMapped:!!pano}));
  if (pano){ sky.scale.x = -1; sky.position.set(bounds.cx, -8, bounds.cy); } else sky.position.set(bounds.cx, 0, bounds.cy);
  entorno.add(sky);
  if (pano){ entorno.visible = mode === "recorrido"; scene.add(entorno); return; }   // con panorama real no hacen falta edificios dibujados
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
  if (typeof cerrarFotos === "function") cerrarFotos();
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

// Encuadre de foto inmobiliaria: desde una esquina, a 1,5 m, en diagonal hacia la pared amueblada.
function encuadre(a){
  const cx = a.x + a.ancho/2, cz = a.y + a.largo/2;
  if (Math.min(a.ancho, a.largo) < 1.7 || ["pasillo","entrada"].includes(a.tipo)){
    let dx = bounds.cx - cx, dz = bounds.cy - cz;
    if (Math.hypot(dx, dz) < 0.5){ dx = a.ancho >= a.largo ? 1 : 0; dz = a.ancho >= a.largo ? 0 : 1; }
    return {pos:new THREE.Vector3(cx, 1.55, cz), yaw:Math.atan2(-dx, -dz), pitch:-0.08};
  }
  const w = paredes(a, plan.aberturas)[0], m = 0.45;
  // punto que queremos mostrar: centro de la pared amueblada, a 1 m de ella
  const foco = {top:[cx, a.y + 1], bottom:[cx, a.y + a.largo - 1], left:[a.x + 1, cz], right:[a.x + a.ancho - 1, cz]}[w.side];
  // la cámara va a una de las dos esquinas opuestas a esa pared (la más lejana a puertas)
  const opp = {top:"bottom", bottom:"top", left:"right", right:"left"}[w.side];
  const esq = (opp === "top" || opp === "bottom")
    ? [[a.x + m, opp === "top" ? a.y + m : a.y + a.largo - m], [a.x + a.ancho - m, opp === "top" ? a.y + m : a.y + a.largo - m]]
    : [[opp === "left" ? a.x + m : a.x + a.ancho - m, a.y + m], [opp === "left" ? a.x + m : a.x + a.ancho - m, a.y + a.largo - m]];
  const puertas = plan.aberturas.filter(o => o.tipo !== "ventana").map(o => o.orientacion === "h" ? [o.centro, o.line*G] : [o.line*G, o.centro]);
  const libre = p => Math.min(99, ...puertas.map(([x, z]) => Math.hypot(x - p[0], z - p[1])));
  const [px, pz] = libre(esq[0]) >= libre(esq[1]) ? esq[0] : esq[1];
  const dx = foco[0] - px, dz = foco[1] - pz;
  return {pos:new THREE.Vector3(px, 1.5, pz), yaw:Math.atan2(-dx, -dz), pitch:-0.12};
}
function irA(i, fromMaqueta){
  const a = plan.ambientes[i]; if (!a) return;
  const {pos:to, yaw, pitch} = encuadre(a);
  const from = camera.position.clone(), y0 = look.yaw, p0 = look.pitch;
  if (fromMaqueta){
    const q0 = camera.quaternion.clone();
    camera.fov = 64; camera.updateProjectionMatrix();
    tween(1100, k => {
      camera.position.lerpVectors(from, to, k);
      const qt = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));
      camera.quaternion.copy(q0).slerp(qt, k);
    }, () => { look.yaw = yaw; look.pitch = pitch; });
  } else {
    let dy = yaw - y0; while (dy > Math.PI) dy -= 2*Math.PI; while (dy < -Math.PI) dy += 2*Math.PI;
    tween(900, k => { camera.position.lerpVectors(from, to, k); look.yaw = y0 + dy*k; look.pitch = p0 + (pitch - p0)*k; applyLook(); });
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
  if (mode === "maqueta"){ abrirAmbiente(hit.object.userData.room); return; }
  const to = new THREE.Vector3(hit.point.x, 1.5, hit.point.z), from = camera.position.clone();
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
    ? (Object.values(FOTOS).some(l => l.length) ? "Tocá un ambiente para ver sus fotos reales" : "Arrastrá para girar · tocá un ambiente para entrar")
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
    if (fotosDe(i).length) b.querySelector(".rm").insertAdjacentHTML("afterbegin", `<span class="cam">${fotosDe(i).length} foto${fotosDe(i).length > 1 ? "s" : ""} ·</span>`);
    b.onclick = () => abrirAmbiente(i);
    li.append(b); ul.append(li);
  });
  $("total").textContent = fmt(total) + " m² totales";
  $("title3d").textContent = plan.nombre;
  const vb = $("vbadge"); vb.hidden = !plan.origen;
  vb.className = "vbadge" + (plan.origen === "demo" ? " demo" : "");
  vb.textContent = plan.origen === "video" ? "Distribución estimada por IA a partir de tu video · no es una medición"
    : plan.origen === "demo" ? "Escena de demostración: no es tu espacio. Las fotos sí son cuadros de tu video" : "";

  const chips = $("chips"); chips.innerHTML = "";
  plan.ambientes.forEach((a, i) => {
    const b = document.createElement("button"); b.textContent = a.nombre; b.dataset.i = i;
    b.onclick = () => abrirAmbiente(i);
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
    d.onclick = () => abrirAmbiente(i);
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
  if (!$("fotos").hidden) return;
  const r = mode === "recorrido" ? roomAt(camera.position.x, camera.position.z) : -1;
  if (r === currentRoom) return; currentRoom = r;
  $("chips").childNodes.forEach(b => b.setAttribute("aria-current", +b.dataset.i === r));
}

function cargar(raw, key){
  FOTOS = {}; planKey = key || null; cerrarFotos();
  plan = normalizar(raw);
  construir(plan);
  renderPanel();
  if (typeof iniciarGuia === "function" && document.getElementById("msgs")) setTimeout(iniciarGuia, 0);
  if (key) cargarFotosDemo(key);
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

$("mMaqueta").onclick = () => { cerrarFotos(); mode !== "maqueta" && setMode("maqueta"); };
$("mRecorrido").onclick = () => { cerrarFotos(); mode !== "recorrido" && setMode("recorrido"); };
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


/* ===================== Video del espacio: análisis real en el navegador ===================== */
// El video no sale de la compu: se recorre cuadro por cuadro en un canvas y se miden luz, nitidez y cambios de toma.
// Solo los cuadros clave (achicados) viajan a la IA, que estima ambientes y medidas. No es una reconstrucción medida.
let VIDEO = null;
const vEl = $("vsrc");
const vstatus = (t, cls = "") => { const s = $("vstatus"); s.textContent = t; s.className = "status " + cls; };
const mmss = t => Math.floor(t/60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
const promedio = l => l.reduce((s, v) => s + v, 0) / Math.max(1, l.length);
const evento = (el, ev, ms = 8000) => new Promise((ok, ko) => {
  const quitar = () => { clearTimeout(t); el.removeEventListener(ev, fin); el.removeEventListener("error", fin); };
  const fin = e => { quitar(); e.type === "error" ? ko(new Error("video")) : ok(); };
  const t = setTimeout(() => { quitar(); ko(new Error("timeout")); }, ms);
  el.addEventListener(ev, fin); el.addEventListener("error", fin);
});
async function irAlSegundo(t){ const p = evento(vEl, "seeked"); vEl.currentTime = t; await p; }

function medir(px, w, h){
  const N = w*h, gris = new Float32Array(N), hist = new Float32Array(48);
  let luz = 0;
  for (let i = 0, p = 0; i < N; i++, p += 4){
    const r = px[p], g = px[p+1], b = px[p+2];
    gris[i] = 0.299*r + 0.587*g + 0.114*b; luz += gris[i];
    hist[r >> 4]++; hist[16 + (g >> 4)]++; hist[32 + (b >> 4)]++;
  }
  for (let k = 0; k < 48; k++) hist[k] /= N;
  // nitidez: varianza del laplaciano (cuadro movido = valor bajo)
  let s = 0, s2 = 0, c = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++){
    const i = y*w + x, L = 4*gris[i] - gris[i-1] - gris[i+1] - gris[i-w] - gris[i+w];
    s += L; s2 += L*L; c++;
  }
  return {luz: luz / N / 255, nitidez: c ? s2/c - (s/c)**2 : 0, hist};
}
const distancia = (a, b) => { let d = 0; for (let k = 0; k < 48; k++) d += Math.abs(a[k] - b[k]); return d / 6; };

async function analizarVideo(file){
  if (!file || !/^video\//.test(file.type)){ $("vres").hidden = false; vstatus("Elegí un archivo de video (MP4 o MOV).", "err"); return; }
  VIDEO = null;
  $("vres").hidden = false; $("vgo").disabled = true; $("vframes").innerHTML = ""; $("vstats").innerHTML = "";
  $("vbar").style.width = "0"; $("vsub").textContent = file.name; vstatus("Abriendo el video…");
  if (vEl.src) URL.revokeObjectURL(vEl.src);
  vEl.src = URL.createObjectURL(file);
  const cargado = evento(vEl, "loadeddata", 20000);
  vEl.load();
  // en iPhone el video no se decodifica hasta que se reproduce una vez (mudo y en línea no pide permiso)
  vEl.play().then(() => vEl.pause()).catch(() => {});
  try{ await cargado; vEl.pause(); }
  catch(_){ vstatus("Este navegador no puede abrir ese video. Probá con un MP4 (en iPhone: Ajustes › Cámara › Formatos › Más compatible).", "err"); return; }
  const dur = vEl.duration, vw = vEl.videoWidth, vh = vEl.videoHeight;
  if (!isFinite(dur) || dur <= 0 || !vw){ vstatus("No pude leer la duración del video.", "err"); return; }
  const t0 = performance.now();
  const n = Math.max(8, Math.min(48, Math.round(dur * 2)));
  const w = 96, h = Math.max(8, Math.round(96 * vh / vw));
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const cx = cv.getContext("2d", {willReadFrequently:true});
  const muestras = [];
  for (let k = 0; k < n; k++){
    const t = Math.min(dur - 0.05, (k + 0.5) * dur / n);
    try{ await irAlSegundo(t); }catch(_){ continue; }
    cx.drawImage(vEl, 0, 0, w, h);
    const m = medir(cx.getImageData(0, 0, w, h).data, w, h);
    m.t = t; m.cambio = muestras.length ? distancia(m.hist, muestras[muestras.length - 1].hist) : 0;
    muestras.push(m);
    $("vbar").style.width = Math.round((k + 1) / n * 80) + "%";
    vstatus(`Analizando cuadro ${k + 1} de ${n}…`);
  }
  if (muestras.length < 3){ vstatus("No pude recorrer el video. Probá con otro archivo.", "err"); return; }

  // tomas: hay corte donde el cambio de imagen supera la media + 1,2 desvíos
  const cs = muestras.slice(1).map(m => m.cambio), media = promedio(cs);
  const sd = Math.sqrt(promedio(cs.map(c => (c - media)**2)));
  const umbral = Math.max(0.18, media + 1.2*sd);
  const tomas = [[muestras[0]]];
  muestras.slice(1).forEach(m => {
    if (m.cambio > umbral && tomas[tomas.length - 1].length >= 2){ m.corte = true; tomas.push([m]); }
    else tomas[tomas.length - 1].push(m);
  });
  // para elegir cuadros clave: si hay pocas tomas en un video largo, se parte en tramos parejos para no perder ambientes
  let grupos = tomas;
  const partes = Math.min(6, Math.max(3, Math.round(dur / 6)));
  if (grupos.length < partes){ grupos = []; for (let p = 0; p < partes; p++) grupos.push(muestras.slice(Math.floor(p*muestras.length/partes), Math.floor((p+1)*muestras.length/partes))); }
  grupos = grupos.filter(g => g.length).sort((a, b) => b.length - a.length).slice(0, 6).sort((a, b) => a[0].t - b[0].t);
  const elegidos = grupos.map(g => { const ok = g.filter(m => m.luz > 0.08 && m.luz < 0.95); return (ok.length ? ok : g).reduce((x, y) => y.nitidez > x.nitidez ? y : x); });

  const W = Math.min(640, vw), Hc = Math.round(W * vh / vw);
  const big = document.createElement("canvas"); big.width = W; big.height = Hc;
  const bx = big.getContext("2d");
  const claves = [];
  for (const [j, m] of elegidos.entries()){
    try{ await irAlSegundo(m.t); }catch(_){ continue; }
    bx.drawImage(vEl, 0, 0, W, Hc);
    claves.push({t: m.t, url: big.toDataURL("image/jpeg", 0.72), luz: m.luz, nitidez: m.nitidez});
    $("vbar").style.width = Math.round(80 + (j + 1) / elegidos.length * 20) + "%";
  }
  const nits = muestras.map(m => m.nitidez).sort((a, b) => a - b), mediana = nits[Math.floor(nits.length/2)];
  VIDEO = {
    nombre: file.name, mb: file.size / 1e6, duracion: dur, ancho: vw, alto: vh, muestras, tomas: tomas.length, claves,
    luz: promedio(muestras.map(m => m.luz)), borrosos: muestras.filter(m => m.nitidez < 0.4*mediana).length / muestras.length,
    cambioMedio: media, segundos: (performance.now() - t0) / 1000, ia: null
  };
  mostrarAnalisis();
}

function mostrarAnalisis(){
  const v = VIDEO;
  const filas = [["Duración", mmss(v.duracion)], ["Resolución", `${v.ancho}×${v.alto}`], ["Cuadros analizados", v.muestras.length],
    ["Tomas detectadas", v.tomas], ["Luz promedio", Math.round(v.luz*100) + " %"], ["Cuadros movidos", Math.round(v.borrosos*100) + " %"]];
  const dl = $("vstats"); dl.innerHTML = "";
  filas.forEach(([k, val]) => { const d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = k; dd.textContent = val; d.append(dt, dd); dl.append(d); });
  // gráfico: luz (línea), cambio de imagen (barras), tomas nuevas (rayas), cuadros clave (puntos)
  const c = $("vchart"), g = c.getContext("2d"), W = c.width, Hh = c.height, css = getComputedStyle(document.documentElement);
  const col = n => css.getPropertyValue(n).trim() || "#888";
  const X = t => 6 + (W - 12) * t / v.duracion;
  g.clearRect(0, 0, W, Hh);
  const maxC = Math.max(0.05, ...v.muestras.map(m => m.cambio));
  g.fillStyle = col("--olive");
  v.muestras.forEach(m => { const bh = (Hh - 14) * m.cambio / maxC; g.fillRect(X(m.t) - 2, Hh - 4 - bh, 4, bh); });
  g.fillStyle = col("--brick");
  v.muestras.filter(m => m.corte).forEach(m => g.fillRect(X(m.t) - 1, 2, 2, Hh - 4));
  g.strokeStyle = col("--gold"); g.lineWidth = 2.5; g.beginPath();
  v.muestras.forEach((m, i) => { const y = Hh - 6 - (Hh - 14) * m.luz; i ? g.lineTo(X(m.t), y) : g.moveTo(X(m.t), y); });
  g.stroke();
  g.fillStyle = col("--ink");
  v.claves.forEach(k => { g.beginPath(); g.arc(X(k.t), 7, 3.5, 0, 7); g.fill(); });

  const box = $("vframes"); box.innerHTML = "";
  v.claves.forEach(k => { const f = document.createElement("figure"), im = new Image(), cap = document.createElement("figcaption");
    im.src = k.url; im.alt = "Cuadro del segundo " + k.t.toFixed(1); cap.textContent = mmss(k.t); f.append(im, cap); box.append(f); });
  $("vgo").disabled = !v.claves.length;
  vstatus(`Listo en ${v.segundos.toFixed(1)} s: ${v.claves.length} cuadros clave elegidos por nitidez y cambio de toma.`, "ok");
}

function datosVideo(){
  const v = VIDEO;
  return {
    archivo: v.nombre, duracion_s: +v.duracion.toFixed(1), resolucion: `${v.ancho}×${v.alto}`,
    cuadros_analizados: v.muestras.length, tomas_detectadas: v.tomas,
    luz_promedio_pct: Math.round(v.luz*100), cuadros_borrosos_pct: Math.round(v.borrosos*100),
    cuadros_clave: v.claves.map((c, i) => ({cuadro: i + 1, segundo: +c.t.toFixed(1), luz_pct: Math.round(c.luz*100), ambiente: c.ambiente || null, que_se_ve: c.descripcion || null})),
    lectura_ia: v.ia
  };
}

const promptVideo = v => `Te paso ${v.claves.length} cuadros, en orden, sacados de un video que recorre un espacio real (casa, departamento, local u oficina).
${v.claves.map((c, i) => `Cuadro ${i + 1}: segundo ${c.t.toFixed(1)}`).join("\n")}
Estimá la distribución del espacio para armar una maqueta 3D.
Devolvé SOLO un objeto JSON con esta forma exacta:
{"nombre": string, "tipo_espacio": string, "resumen": string, "confianza": "baja"|"media"|"alta",
 "ambientes": [{"nombre": string, "tipo": string, "x": number, "y": number, "ancho": number, "largo": number, "observaciones": string}],
 "aberturas": [{"tipo": string, "orientacion": "h"|"v", "x": number, "y": number, "ancho": number}],
 "cuadros": [{"cuadro": number, "ambiente": string, "descripcion": string}]}

Reglas del video:
- Incluí SOLO ambientes que se ven en los cuadros. Si todo el video es un único ambiente, devolvé un único ambiente. No inventes ambientes.
- Las medidas son estimaciones a ojo: usá referencias de tamaño conocido (puerta 0,8 m de ancho y 2 m de alto, mesada 0,6 m de fondo, cama doble 1,4 x 1,9 m, baldosas).
- "cuadros": un elemento por cada cuadro, con el nombre EXACTO de uno de tus ambientes y una descripción corta de lo que se ve.
- "observaciones": solo lo que se ve de verdad (piso, paredes, ventanas, luz natural, muebles, estado). Nada inventado.
- "resumen": una oración sobre el espacio. "confianza": qué tan seguro estás de la distribución.

Reglas de geometría:${PROMPT_BASE.split("Reglas:")[1]}`;

async function pedirCuadros(prompt, urls){
  if (sampleFn){
    const blobs = await Promise.all(urls.map(u => fetch(u).then(r => r.blob())));
    return await sampleFn.json(prompt, {images: imagesOk ? blobs : undefined, modelTier:"default", cache:false});
  }
  let r;
  try { r = await fetch("./api/leer-plano", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({prompt, imagen: urls})}); }
  catch(_) { throw new Error("no hay conexión con el servidor"); }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || "el servidor no respondió");
  return body.plano;
}

$("vgo").onclick = async () => {
  if (!VIDEO || !VIDEO.claves.length) return;
  const v = VIDEO, titulo = $("busy").querySelector("b"), tituloViejo = titulo.textContent;
  $("vgo").disabled = true; $("busy").hidden = false; vstatus("");
  titulo.textContent = "Mirando tu video…";
  $("busytxt").textContent = `La IA está mirando ${v.claves.length} cuadros para estimar ambientes y medidas.`;
  let data = null, fallo = null;
  try{ data = await pedirCuadros(promptVideo(v), v.claves.map(c => c.url)); }catch(e){ fallo = e; }
  try{
    if (!data || !Array.isArray(data.ambientes) || !data.ambientes.length) throw fallo || new Error("la IA no encontró ambientes");
    v.ia = {tipo_espacio: data.tipo_espacio || null, resumen: data.resumen || null, confianza: data.confianza || null,
            observaciones_por_ambiente: Object.fromEntries(data.ambientes.map(a => [a.nombre, String(a.observaciones || "").slice(0, 300)]))};
    (data.cuadros || []).forEach(c => { const k = (+c.cuadro) - 1;
      if (v.claves[k]){ v.claves[k].ambiente = String(c.ambiente || ""); v.claves[k].descripcion = String(c.descripcion || "").slice(0, 200); } });
    cargar(Object.assign({}, data, {nombre: data.nombre || "Espacio del video", zona: "Estimado desde video", origen: "video"}), null);
    vstatus(`Listo: ${plan.ambientes.length} ambiente${plan.ambientes.length > 1 ? "s" : ""} estimado${plan.ambientes.length > 1 ? "s" : ""} (confianza ${v.ia.confianza || "sin dato"}). Tocá un ambiente para caminar sus cuadros.`, "ok");
  }catch(e){
    v.ia = null; v.claves.forEach(c => { c.ambiente = "Espacio del video"; c.descripcion = null; });
    cargar({nombre: "Escena de demostración", origen: "demo",
      ambientes: [{nombre: "Espacio del video", tipo: "estar", x: 0, y: 0, ancho: 4.5, largo: 5}],
      aberturas: [{tipo: "puerta", orientacion: "h", x: 1, y: 0, ancho: 0.9}, {tipo: "ventanal", orientacion: "h", x: 2.8, y: 5, ancho: 2}]}, null);
    vstatus(`La IA no pudo leer el video (${(e && e.message) || "sin respuesta"}). Mostramos una escena de demostración con tus cuadros reales.`, "err");
  }
  // los cuadros reales del video quedan como fotos de cada ambiente (visor para caminar adentro de la foto)
  let previo = 0;
  for (const c of v.claves){
    let i = plan.ambientes.findIndex(a => norm(a.nombre) === norm(c.ambiente || ""));
    if (i < 0 && c.ambiente) i = buscarAmbiente(c.ambiente);
    if (i < 0) i = previo;
    previo = i;
    await agregarFoto(i, c.url, "Video " + mmss(c.t));
  }
  renderPanel(); actualizarBotonFotos(); setHint();
  titulo.textContent = tituloViejo; $("busy").hidden = true; $("vgo").disabled = false;
  try{ history.replaceState(null, "", location.pathname); }catch(_){}
  if (matchMedia("(min-width: 821px)").matches) guia(true);
  else stage.scrollIntoView({behavior: "smooth", block: "start"});
};
$("vfile").addEventListener("change", e => analizarVideo(e.target.files[0]));
const vdrop = $("vdrop");
vdrop.addEventListener("dragover", e => { e.preventDefault(); vdrop.classList.add("over"); });
vdrop.addEventListener("dragleave", () => vdrop.classList.remove("over"));
vdrop.addEventListener("drop", e => { e.preventDefault(); vdrop.classList.remove("over"); analizarVideo(e.dataTransfer.files[0]); });

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
  if (plan.origen && VIDEO && /(video|dura|toma|borros|nitid|calidad|cuadro)/.test(n)){
    const d = datosVideo();
    return {respuesta:`El video dura ${d.duracion_s} s (${d.resolucion}). Analicé ${d.cuadros_analizados} cuadros: ${d.tomas_detectadas} tomas distintas, luz promedio ${d.luz_promedio_pct} % y ${d.cuadros_borrosos_pct} % de cuadros movidos. ${d.cuadros_borrosos_pct > 30 ? "Conviene grabar más despacio." : "Se ve bien para armar el recorrido."}`, ir_a:null};
  }
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
${plan.origen ? `Datos del espacio (medidas en metros ESTIMADAS por IA mirando un video; si preguntan medidas, aclará que son aproximadas):` : `Datos de la propiedad (medidas en metros, obtenidas del plano):`}
${JSON.stringify(resumenPlano())}
${plan.origen && VIDEO ? `Análisis real del video (procesado cuadro por cuadro en el navegador) y lo que la IA vio en cada cuadro:
${JSON.stringify(datosVideo())}
${plan.origen === "demo" ? "OJO: la maqueta 3D es una escena de demostración, NO la distribución real del espacio. Respondé solo con lo que dice el análisis del video.\n" : ""}` : ""}
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
  if (r.ir_a != null) abrirAmbiente(r.ir_a);
  $("gSend").disabled = false;
}
function iniciarGuia(){
  msgs.innerHTML = ""; historial = [];
  const amb = plan.ambientes, tot = amb.reduce((t, a) => t + a.ancho*a.largo, 0);
  if (plan.origen && VIDEO){
    burbuja("ella", plan.origen === "video"
      ? `Miré tu video: ${VIDEO.claves.length} cuadros clave y ${amb.length} ambiente${amb.length > 1 ? "s" : ""} (~${fmt(tot)} m², medidas estimadas). ${VIDEO.ia && VIDEO.ia.resumen ? VIDEO.ia.resumen : ""} Preguntame lo que quieras.`
      : `La IA no estuvo disponible, así que el 3D es de demostración. Igual tengo el análisis real de tu video (${VIDEO.claves.length} cuadros clave). Preguntame por él.`);
    const box = $("sugs"); box.innerHTML = "";
    const sug = plan.origen === "video"
      ? [`¿Qué se ve en ${amb[0].nombre.toLowerCase()}?`, "¿Qué ambiente tiene más luz natural?", "¿Cuál es el ambiente más grande?", "¿Qué tan bueno es el video?"]
      : ["¿Qué tan bueno es el video?", "¿Cuántas tomas tiene el video?"];
    sug.forEach(t => { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.onclick = () => preguntar(t); box.append(b); });
    return;
  }
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
try{ matchMedia("(max-width: 820px)").addEventListener("change", e => { if (e.matches) guia(false); }); }catch(_){}


/* ===================== Fotos reales por ambiente ===================== */
// Las fotos son la experiencia; el plano 3D es el mapa para moverse entre ellas.
let FOTOS = {}, planKey = null, fotoAmb = -1, fotoIdx = 0;
const fotosDe = i => FOTOS[i] || [];
function actualizarBotonFotos(){
  const hay = Object.values(FOTOS).some(l => l.length);
  $("mFotos").hidden = !hay;
}
function abrirAmbiente(i){
  if (fotosDe(i).length){ if (!$("fotos").hidden && fotoAmb !== i) caminarA(i, 0, 1); else verFotos(i, 0); }
  else { cerrarFotos(); mode === "recorrido" ? irA(i) : setMode("recorrido", i); }
}
function agregarFoto(i, url, nombre, demo = false, caja = null){
  return new Promise(ok => {
    const img = new Image();
    img.onload = () => { (FOTOS[i] = FOTOS[i] || []).push({url, pano: img.naturalWidth / img.naturalHeight >= 1.9, nombre, demo, caja}); ok(true); };
    img.onerror = () => ok(false);
    img.src = url;
  });
}
async function cargarFotosDemo(key){
  try{
    const r = await fetch(`./assets/fotos/${key}/fotos.json`, {cache:"no-cache"}); if (!r.ok) return;
    const man = await r.json();
    for (const [nombre, lista] of Object.entries(man)){
      const i = plan.ambientes.findIndex(a => norm(a.nombre) === norm(nombre)); if (i < 0) continue;
      for (const e of lista){ const f = typeof e === "string" ? e : e.f; await agregarFoto(i, `./assets/fotos/${key}/${f}`, f, true, e.caja || null); }
    }
    if (planKey === key){ renderPanel(); actualizarBotonFotos(); setHint(); }
  }catch(_){}
}
$("fotosIn").addEventListener("change", e => subirFotos([...e.target.files]));
const fdrop = $("fotodrop");
fdrop.addEventListener("dragover", e => { e.preventDefault(); fdrop.classList.add("over"); });
fdrop.addEventListener("dragleave", () => fdrop.classList.remove("over"));
fdrop.addEventListener("drop", e => { e.preventDefault(); fdrop.classList.remove("over"); subirFotos([...e.dataTransfer.files]); });
async function subirFotos(files){
  files = files.filter(f => /^image\//.test(f.type)); if (!files.length) return;
  const destino = fotoAmb >= 0 ? fotoAmb : (mode === "recorrido" ? roomAt(camera.position.x, camera.position.z) : -1);
  let sinAsignar = 0, primera = -1;
  for (const f of files){
    let i = buscarAmbiente(f.name.replace(/\.[a-z]+$/i, "").replace(/[-_]+/g, " "));
    if (i < 0) i = destino;
    if (i < 0){ sinAsignar++; continue; }
    if (await agregarFoto(i, URL.createObjectURL(f), f.name) && primera < 0) primera = i;
  }
  renderPanel(); actualizarBotonFotos();
  status(sinAsignar ? `${sinAsignar} foto(s) sin ambiente: nombralas como el ambiente (ej. cocina.jpg) o abrí el ambiente antes de subirlas.` : "Fotos agregadas.", sinAsignar ? "err" : "ok");
  if (primera >= 0) verFotos(primera, fotosDe(primera).length - 1);
}

// visor 360: esfera vista desde adentro, arrastrar para mirar, rueda para acercar
// Visor inmersivo: la foto se proyecta sobre un cilindro (foto común) o una esfera (360°) alrededor de la cámara.
// Moverse a otro ambiente es una "caminata": la cámara avanza, la foto se funde y la siguiente aparece desde cerca.
let pano = null;
// Reconstrucción "Tour Into the Picture" (Horry et al.): la foto común se proyecta sobre una caja
// (pared del fondo, piso, techo y paredes laterales) estimada desde su perspectiva. Desde el punto
// de la toma se ve idéntica a la foto; al avanzar aparece la profundidad real.
const HFOV = 78 * Math.PI/180;           // gran angular típico de fotografía inmobiliaria
const PROF = 4.2;                         // distancia a la pared del fondo (m)
const CAJA_DEF = [0.3, 0.24, 0.7, 0.64];
function panoInit(){
  if (pano) return pano;
  const cv = $("fpano");
  let r; try{ r = new THREE.WebGLRenderer({canvas:cv, antialias:true}); }catch(_){ return null; }
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); r.outputEncoding = THREE.sRGBEncoding;
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(60, 1, 0.05, 200);
  const mat = new THREE.MeshBasicMaterial({transparent:true, opacity:1, side:THREE.DoubleSide});
  const sph = new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), mat); sph.scale.x = -1;
  const caja = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  sc.add(sph, caja);
  pano = {r, sc, cam, mat, sph, caja, yaw:0, pitch:0, z:0, x:0, t:0, tex:null, esPano:false, vf:1, fovMul:1, drag:false, auto:true};
  let d = null;
  cv.addEventListener("pointerdown", e => { d = {x:e.clientX, y:e.clientY, yaw:pano.yaw, pitch:pano.pitch}; pano.drag = true; pano.auto = false; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", e => { if (!d) return; pano.yaw = d.yaw + (e.clientX - d.x)*0.0035; pano.pitch = d.pitch + (e.clientY - d.y)*0.0035; limitar(); });
  cv.addEventListener("pointerup", () => { d = null; pano.drag = false; });
  cv.addEventListener("wheel", e => { e.preventDefault(); pano.auto = false;
    if (pano.esPano){ pano.fovMul = Math.max(0.6, Math.min(1, pano.fovMul + e.deltaY*0.0006)); ajustarCamara(); }
    else { pano.z = Math.max(0, Math.min(PROF*0.62, pano.z - e.deltaY*0.003)); } }, {passive:false});
  return pano;
}
function limitar(){
  const p = pano; if (p.esPano){ p.pitch = Math.max(-1.3, Math.min(1.3, p.pitch)); return; }
  p.yaw = Math.max(-0.42, Math.min(0.42, p.yaw)); p.pitch = Math.max(-0.25, Math.min(0.25, p.pitch));
}
function ajustarCamara(){
  const p = pano, w = stage.clientWidth, h = Math.max(1, stage.clientHeight), asp = w / h;
  p.r.setSize(w, h, false); p.cam.aspect = asp;
  if (p.esPano) p.cam.fov = 72 * p.fovMul;
  else {
    // encuadre inicial = la foto completa, sin bordes vacíos
    const porAlto = p.vf, porAncho = 2*Math.atan(Math.tan(HFOV/2)/asp);
    p.cam.fov = Math.min(porAlto, porAncho) * 180/Math.PI * 0.97 * p.fovMul;
  }
  p.cam.updateProjectionMatrix(); p.w = w; p.h = h;
}
function texturaPara(f){
  return new Promise((ok, ko) => { setTimeout(() => ko(new Error("timeout")), 9000);
    new THREE.TextureLoader().load(f.url, t => { t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; ok(t); }, undefined, ko); });
}
function geometriaCaja(asp, c){
  const tx = Math.tan(HFOV/2), ty = tx / asp, NX = 96, NY = Math.round(96/asp);
  // pared del fondo en coordenadas normalizadas (-1..1)
  const bx0 = Math.min(-0.04, 2*c[0] - 1), bx1 = Math.max(0.04, 2*c[2] - 1), by1 = Math.max(0.04, 1 - 2*c[1]), by0 = Math.min(-0.04, 1 - 2*c[3]);
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++){
    const u = i/NX, v = j/NY, x = 2*u - 1, y = 1 - 2*v;
    let Z = PROF;
    if (x > bx1) Z = Math.min(Z, PROF*bx1/x);
    if (x < bx0) Z = Math.min(Z, PROF*bx0/x);
    if (y > by1) Z = Math.min(Z, PROF*by1/y);
    if (y < by0) Z = Math.min(Z, PROF*by0/y);
    Z = Math.max(0.35, Z);
    pos.push(x*tx*Z, y*ty*Z, -Z); uv.push(u, 1 - v);
  }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++){
    const a = j*(NX + 1) + i, b = a + 1, c2 = a + NX + 1, d = c2 + 1; idx.push(a, c2, b, b, c2, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}
function montar(t, f){
  const p = pano; if (p.tex && p.tex !== t) p.tex.dispose(); p.tex = t; p.mat.map = t; p.mat.needsUpdate = true;
  p.esPano = !!f.pano; p.sph.visible = p.esPano; p.caja.visible = !p.esPano;
  if (!p.esPano){
    const asp = t.image.width / t.image.height;
    p.caja.geometry.dispose(); p.caja.geometry = geometriaCaja(asp, f.caja || CAJA_DEF);
    p.vf = 2*Math.atan(Math.tan(HFOV/2)/asp);
  }
  p.yaw = 0; p.pitch = p.esPano ? -0.06 : 0; p.fovMul = 1; p.t = 0; p.z = 0; p.x = 0; p.auto = true; ajustarCamara();
  $("fwalkBox").hidden = p.esPano;
}
let caminando = false;
const anim = (dur, fn) => new Promise(res => { const t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0)/dur); fn(k); k < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); });
async function caminarA(i, k = 0, dir = 0){
  const l = fotosDe(i); if (!l.length){ verFotos(i, 0); return; }
  const f = l[((k % l.length) + l.length) % l.length];
  const p = panoInit(); if (!p){ verFotos(i, k); return; }
  if (caminando) return; caminando = true;
  try{
    const tex = await texturaPara(f);
    // avanzar dentro de la foto actual hacia la salida y fundir
    const z0 = p.z, y0 = p.yaw;
    await anim(650, k2 => { const e = k2*k2;
      if (p.esPano){ p.fovMul = 1 - 0.45*e; ajustarCamara(); } else p.z = z0 + (PROF*0.7 - z0)*e;
      p.yaw = y0 + dir*0.18*e; p.mat.opacity = 1 - 0.9*e; });
    verFotos(i, k, tex);
    // entrar a la siguiente desde atrás de la toma
    p.z = -0.9; p.mat.opacity = 0.1; if (p.esPano){ p.fovMul = 0.7; ajustarCamara(); }
    await anim(750, k2 => { const e = 1 - Math.pow(1 - k2, 3); p.z = -0.9*(1 - e); p.mat.opacity = 0.1 + 0.9*e;
      if (p.esPano){ p.fovMul = 0.7 + 0.3*e; ajustarCamara(); } });
  }catch(_){ verFotos(i, k); }
  finally{ caminando = false; p.mat.opacity = 1; }
}
function panoFrame(dt){
  if (!pano || $("fpano").hidden || $("fotos").hidden) return;
  if (pano.w !== stage.clientWidth || pano.h !== stage.clientHeight) ajustarCamara();
  pano.t += dt;
  if (pano.esPano){ if (!pano.drag && pano.auto) pano.yaw += dt*0.04; }
  else {
    if (keysF.has("arrowup") || keysF.has("w")) { pano.z = Math.min(PROF*0.62, pano.z + dt*1.2); pano.auto = false; }
    if (keysF.has("arrowdown") || keysF.has("s")) { pano.z = Math.max(0, pano.z - dt*1.2); pano.auto = false; }
    // paseo automático suave: avanza y retrocede un metro, como una toma con estabilizador
    if (pano.auto && !caminando) pano.z = (1 - Math.cos(pano.t*0.32))*0.5*1.1;
  }
  if (avanzar) { pano.z = Math.min(PROF*0.62, pano.z + dt*1.1*avanzar); if (pano.z < 0) pano.z = 0; }
  pano.cam.position.set(pano.x, 0, pano.esPano ? 0 : -pano.z);
  pano.cam.quaternion.setFromEuler(new THREE.Euler(pano.pitch, pano.yaw, 0, "YXZ"));
  pano.r.render(pano.sc, pano.cam);
}
const keysF = new Set(); let avanzar = 0;
addEventListener("keydown", e => { if (!$("fotos").hidden && !e.target.closest("textarea,input")) keysF.add(e.key.toLowerCase()); });
addEventListener("keyup", e => keysF.delete(e.key.toLowerCase()));

// ambientes conectados por puertas, pasos o aberturas (salen del plano, no se inventan)
function vecinos(i){
  // por cada puerta, paso o abertura en el borde del ambiente, quién está del otro lado en ese punto
  const a = plan.ambientes[i], card = CARD[plan.norte] || CARD.arriba, ord = {norte:0, este:1, sur:2, oeste:3}, L = v => Math.round(v/G), out = [];
  const lados = [["top","h",L(a.y)], ["bottom","h",L(a.y + a.largo)], ["left","v",L(a.x)], ["right","v",L(a.x + a.ancho)]];
  plan.aberturas.filter(o => o.tipo !== "ventana").forEach(o => {
    const lado = lados.find(([, ori, line]) => ori === o.orientacion && line === o.line); if (!lado) return;
    const dentro = o.orientacion === "h" ? (o.centro > a.x && o.centro < a.x + a.ancho) : (o.centro > a.y && o.centro < a.y + a.largo);
    if (!dentro) return;
    const j = plan.ambientes.findIndex((b, k) => k !== i && (o.orientacion === "h"
      ? (L(b.y) === o.line || L(b.y + b.largo) === o.line) && o.centro > b.x && o.centro < b.x + b.ancho
      : (L(b.x) === o.line || L(b.x + b.ancho) === o.line) && o.centro > b.y && o.centro < b.y + b.largo));
    if (j >= 0 && !out.some(v => v.j === j)){ const c = card[lado[0]]; out.push({j, lado:c, ord:ord[c]}); }
  });
  return out;
}
function minimapa(i){
  const amb = plan.ambientes, xs = amb.flatMap(a => [a.x, a.x + a.ancho]), ys = amb.flatMap(a => [a.y, a.y + a.largo]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), W = Math.max(...xs) - x0, H2 = Math.max(...ys) - y0;
  const svg = [`<svg viewBox="${x0 - 0.3} ${y0 - 0.3} ${W + 0.6} ${H2 + 0.6}" role="img" aria-label="Plano: estás en ${amb[i].nombre}">`];
  amb.forEach((a, k) => svg.push(`<rect data-i="${k}" x="${a.x}" y="${a.y}" width="${a.ancho}" height="${a.largo}" class="${k === i ? "on" : ""}${fotosDe(k).length ? " ft" : ""}"><title>${a.nombre}</title></rect>`));
  const a = amb[i]; svg.push(`<circle cx="${a.x + a.ancho/2}" cy="${a.y + a.largo/2}" r="${Math.max(W, H2)*0.035}" class="yo"/>`);
  svg.push("</svg>");
  const box = $("fmap"); box.innerHTML = svg.join("");
  box.querySelectorAll("rect").forEach(r => r.addEventListener("click", () => { const j = +r.dataset.i; if (j !== fotoAmb) caminarA(j, 0, 1); }));
}
function flechas(i){
  const box = $("fgo"); box.innerHTML = "";
  const flecha = {};
  vecinos(i).sort((x, y) => x.ord - y.ord).forEach(v => {
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<span class="ar">${flecha[v.lado] || "→"}</span><span></span>`;
    b.lastChild.textContent = plan.ambientes[v.j].nombre;
    if (!fotosDe(v.j).length) b.classList.add("sinfoto");
    b.onclick = () => fotosDe(v.j).length ? caminarA(v.j, 0, v.ord === 1 ? 1 : v.ord === 3 ? -1 : 0) : (cerrarFotos(), mode === "recorrido" ? irA(v.j) : setMode("recorrido", v.j));
    box.append(b);
  });
}
function verFotos(i, k, texLista){
  const l = fotosDe(i); fotoAmb = i;
  $("fotos").hidden = false;
  ["mMaqueta","mRecorrido"].forEach(id => $(id).setAttribute("aria-pressed", "false")); $("mFotos").setAttribute("aria-pressed", "true");
  $("labels").hidden = true; $("hint").hidden = true; $("title3d").hidden = true;
  document.querySelector(".tools").hidden = true;
  const a = plan.ambientes[i], n = l.length ? ((k % l.length) + l.length) % l.length : 0;
  $("ftag").innerHTML = ""; $("ftag").append(document.createTextNode(a.nombre)); $("ftag").insertAdjacentHTML("beforeend", `<small>${fmt(a.ancho)} × ${fmt(a.largo)} m · ${fmt(a.ancho*a.largo)} m²${l.length ? " · " + (n + 1) + "/" + l.length : ""}${l.length && l[n].pano ? " · 360°" : ""}${l.length && l[n].demo ? " · foto de ejemplo" : ""}</small>`);
  $("fempty").hidden = !!l.length; $("fprev").hidden = $("fnext").hidden = l.length < 2;
  minimapa(i); flechas(i); marcarChip(i);
  if (!l.length){ $("fimg").hidden = true; $("fpano").hidden = true; $("fbg").style.backgroundImage = "none"; return; }
  fotoIdx = n;
  const f = l[n];
  $("fbg").style.backgroundImage = `url("${f.url}")`;
  const p = panoInit();
  if (p){
    $("fimg").hidden = true; $("fpano").hidden = false;
    if (texLista) montar(texLista, f);
    else texturaPara(f).then(t => { if (fotoAmb === i && fotoIdx === n) montar(t, f); }).catch(() => {});
  } else { $("fpano").hidden = true; const im = $("fimg"); im.hidden = false; im.src = f.url; im.alt = "Foto real de " + a.nombre; }
}
function marcarChip(i){ $("chips").childNodes.forEach(b => b.setAttribute("aria-current", +b.dataset.i === i)); currentRoom = i; }
function cerrarFotos(){
  if (!document.getElementById("fotos") || $("fotos").hidden) return;
  $("fotos").hidden = true; fotoAmb = -1; $("mFotos").setAttribute("aria-pressed", "false");
  $("labels").hidden = false; $("hint").hidden = false; $("title3d").hidden = false; document.querySelector(".tools").hidden = false;
  $("mMaqueta").setAttribute("aria-pressed", mode === "maqueta"); $("mRecorrido").setAttribute("aria-pressed", mode === "recorrido");
  currentRoom = -2;
}
[["fAdel", 1], ["fAtras", -1]].forEach(([id, v]) => { const b = $(id);
  b.addEventListener("pointerdown", e => { avanzar = v; if (pano) pano.auto = false; b.setPointerCapture(e.pointerId); });
  ["pointerup","pointercancel","pointerleave"].forEach(ev => b.addEventListener(ev, () => avanzar = 0)); });
$("fprev").onclick = () => caminarA(fotoAmb, fotoIdx - 1, -1);
$("fnext").onclick = () => caminarA(fotoAmb, fotoIdx + 1, 1);
$("f3d").onclick = () => { const i = fotoAmb; cerrarFotos(); mode === "recorrido" ? irA(i) : setMode("recorrido", i); };
$("mFotos").onclick = () => {
  const con = Object.keys(FOTOS).map(Number).filter(i => fotosDe(i).length);
  if (con.length) verFotos(con.includes(currentRoom) ? currentRoom : con[0], 0);
};
addEventListener("keydown", e => { if ($("fotos").hidden || e.target.closest("textarea,input")) return;
  if (e.key === "ArrowRight") caminarA(fotoAmb, fotoIdx + 1, 1); if (e.key === "ArrowLeft") caminarA(fotoAmb, fotoIdx - 1, -1); if (e.key === "Escape") cerrarFotos(); });


/* ===================== Compartir: link con el plano adentro + QR ===================== */
// El plano se compacta (ambientes en decímetros, aberturas en centímetros), se comprime (deflate) y viaja en el #hash: sin servidor ni base de datos.
const TIPO_AB = ["puerta","paso","abierto","ventanal","ventana"];
function compactar(p){
  const d = v => Math.round(v * 10);
  return {n:p.nombre, z:p.zona || "", o:p.norte, a:p.ambientes.map(a => [a.nombre, a.tipo, d(a.x), d(a.y), d(a.ancho), d(a.largo)]),
    b:p.aberturas.map(o => [TIPO_AB.indexOf(o.tipo), o.orientacion === "h" ? 0 : 1, o.line, Math.round(o.centro*100), Math.round(o.ancho*100)])};
}
function expandir(c){
  const m = v => v / 10;
  return {nombre:c.n, zona:c.z, norte:c.o,
    ambientes:c.a.map(([nombre, tipo, x, y, w, l]) => ({nombre, tipo, x:m(x), y:m(y), ancho:m(w), largo:m(l)})),
    aberturas:c.b.map(([t, ori, line, centro, w]) => ori === 0 ? {tipo:TIPO_AB[t], orientacion:"h", x:centro/100, y:line*G, ancho:w/100} : {tipo:TIPO_AB[t], orientacion:"v", x:line*G, y:centro/100, ancho:w/100})};
}
const b64u = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), ch => ch.charCodeAt(0));
async function zip(str, inverso){
  if (typeof CompressionStream === "undefined") return null;
  const st = new Blob([str]).stream().pipeThrough(inverso ? new DecompressionStream("deflate-raw") : new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(st).arrayBuffer());
}
async function linkDelPlano(){
  const base = location.href.split("#")[0];
  if (planKey) return base + "#" + planKey;
  const json = JSON.stringify(compactar(plan));
  const z = await zip(new TextEncoder().encode(json), false).catch(() => null);
  return base + "#p=" + (z ? "z" + b64u(z) : "j" + b64u(new TextEncoder().encode(json)));
}
async function planDesdeLink(h){
  const s = h.slice(2), raw = unb64u(s.slice(1));
  const bytes = s[0] === "z" ? await zip(raw, true) : raw;
  return expandir(JSON.parse(new TextDecoder().decode(bytes)));
}
async function abrirCompartir(){
  const link = await linkDelPlano();
  $("mLink").value = link;
  const tot = plan.ambientes.reduce((t, a) => t + a.ancho*a.largo, 0);
  const dorm = plan.ambientes.filter(a => a.tipo === "dormitorio").length;
  $("mMsg").value = `${plan.nombre}${plan.zona ? " · " + plan.zona : ""}\n${fmt(tot)} m² · ${plan.ambientes.length} ambientes${dorm ? " · " + dorm + " dormitorio" + (dorm > 1 ? "s" : "") : ""}\nRecorrela por dentro, mirá las fotos y preguntale lo que quieras a la guía:\n${link}`;
  const box = $("qr"); box.innerHTML = "";
  try{
    const q = qrcode(0, link.length > 600 ? "L" : "M"); q.addData(link); q.make();
    box.innerHTML = q.createSvgTag({cellSize:4, margin:2, scalable:true});
  }catch(_){ box.textContent = "No se pudo generar el QR (link demasiado largo)."; }
  const enClaude = !/^https?:\/\/[^/]*andromedaweb/.test(location.href) && !!window.claude;
  $("mNota").textContent = enClaude
    ? "Estás en la vista previa: el link y el QR sirven desde la versión publicada (andromedaweb.store/cauce/app.html)."
    : "El plano viaja dentro del link: no hace falta cuenta ni base de datos. Imprimí el QR en el cartel o mandalo por WhatsApp.";
  $("modal").hidden = false; $("mCopyLink").focus();
}
async function copiar(txt, btn){
  const prev = btn.textContent;
  try{ await navigator.clipboard.writeText(txt); btn.textContent = "Copiado"; }
  catch(_){ btn.textContent = "Seleccioná y copiá"; }
  setTimeout(() => btn.textContent = prev, 1600);
}
$("share").onclick = abrirCompartir;
$("mClose").onclick = () => $("modal").hidden = true;
$("modal").addEventListener("click", e => { if (e.target.id === "modal") $("modal").hidden = true; });
$("mCopyLink").onclick = e => { $("mLink").select(); copiar($("mLink").value, e.currentTarget); };
$("mCopyMsg").onclick = e => { $("mMsg").select(); copiar($("mMsg").value, e.currentTarget); };
addEventListener("keydown", e => { if (e.key === "Escape" && !$("modal").hidden) $("modal").hidden = true; });

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
  if ($("fotos").hidden) renderer.render(scene, camera);
  panoFrame(dt);
  requestAnimationFrame(frame);
}

renderPresets();
const start = (location.hash || "").slice(1);
const k0 = PRESETS[start] ? start : "montevideo";
resize();
cargar(PRESETS[k0], k0);
if (start.startsWith("p=")) planDesdeLink(start).then(p => { cargar(p, null); status("Plano abierto desde un link compartido.", "ok"); }).catch(() => status("El link del plano está incompleto o dañado.", "err"));
cargarRecursos();
requestAnimationFrame(frame);
})();
