if(new URLSearchParams(location.search).has('embed'))document.body.classList.add('embedded');
'use strict';
const box=document.getElementById('visor'), canvas=document.getElementById('panorama'), state=document.getElementById('estado');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(70,1,.1,100);
const geometry=new THREE.SphereGeometry(20,80,48);geometry.scale(-1,1,1);
const material=new THREE.MeshBasicMaterial({color:0xffffff});scene.add(new THREE.Mesh(geometry,material));
let yaw=0,pitch=0,down=false,lastX=0,lastY=0,sequence=0;
function resize(){renderer.setSize(box.clientWidth,box.clientHeight,false);camera.aspect=box.clientWidth/box.clientHeight;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(box);
function draw(){const p=pitch*Math.PI/180,y=yaw*Math.PI/180;camera.lookAt(Math.cos(p)*Math.sin(y),Math.sin(p),Math.cos(p)*Math.cos(y));renderer.render(scene,camera);requestAnimationFrame(draw)}
canvas.addEventListener('pointerdown',e=>{down=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!down)return;yaw-=(e.clientX-lastX)*.15;pitch=Math.max(-80,Math.min(80,pitch+(e.clientY-lastY)*.15));lastX=e.clientX;lastY=e.clientY});
['pointerup','pointercancel'].forEach(t=>canvas.addEventListener(t,()=>down=false));
function zoom(delta){camera.fov=Math.max(35,Math.min(90,camera.fov+delta));camera.updateProjectionMatrix()}
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY*.025)},{passive:false});
document.getElementById('mas').onclick=()=>zoom(-8);document.getElementById('menos').onclick=()=>zoom(8);
document.getElementById('pantalla').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else box.requestFullscreen().catch(()=>{})};
function load(name){const id=++sequence;state.textContent='Cargando imágenes reales…';new THREE.TextureLoader().load('./assets/tecnoteca360/'+name+'.jpg',texture=>{if(id!==sequence){texture.dispose();return}texture.encoding=THREE.sRGBEncoding;if(material.map)material.map.dispose();material.map=texture;material.needsUpdate=true;yaw=name === 'hall' ? 105 : 0;pitch=0;state.textContent='Panorámica real · cobertura parcial';document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.scene===name))},undefined,()=>{if(id===sequence)state.textContent='No se pudo cargar este punto. Elegí otro.'})}
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>load(b.dataset.scene));
resize();draw();load('hall');



