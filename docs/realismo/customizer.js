/* Runs inside app.js scope. Independent visual laboratory, not Cande's product. */
const finishState={floor:'wood_floor',wall:'paint',color:'#eee8de',scale:2,shine:.7};
const finishMaps={};let finishSequence=0;
const finishPanel=document.createElement('section');finishPanel.className='finish-panel';
finishPanel.innerHTML=`<h2>Hacelo tuyo <small>VERSIÓN REALISMO</small></h2><p>Cambiá materiales y luz mientras recorrés. Propuesta ilustrativa, no acabados verificados de la propiedad.</p>
<label>Piso · interiores<select id="finish-floor"><option value="wood_floor">Madera natural</option><option value="floor_tiles_06">Cerámica mineral</option><option value="grey_plaster">Microcemento</option></select></label>
<label>Paredes<select id="finish-wall"><option value="paint">Pintura mate</option><option value="painted_plaster_wall">Revoque texturado</option><option value="grey_plaster">Acabado mineral</option></select></label>
<label>Color de paredes<input id="finish-color" type="color" value="#eee8de"></label><div class="swatches">${['#eee8de','#b1b8a2','#bd8870','#52666c','#d3c2a5'].map(c=>`<button aria-label="Pared ${c}" data-color="${c}" style="background:${c}"></button>`).join('')}</div>
<label>Escala del material<input id="finish-scale" type="range" min="0.6" max="4" step="0.1" value="2"></label>
<label>Acabado del piso<select id="finish-shine"><option value="0.7">Satinado</option><option value="1">Mate</option><option value="0.25">Pulido</option></select></label>
<label>Exposición<input id="finish-light" type="range" min="0.5" max="1.4" step="0.05" value="0.85"></label>
<button id="finish-reset">Restablecer propuesta</button><p id="finish-status" role="status">Cargando materiales…</p><a href="./assets/CREDITOS.txt" target="_blank">Créditos de modelos</a> · <a href="https://polyhaven.com" target="_blank">Powered by Poly Haven · CC0</a>`;
document.querySelector('.panel').prepend(finishPanel);
async function materialMaps(id){
 if(finishMaps[id])return finishMaps[id];
 const tl=new THREE.TextureLoader();
 const out=await Promise.all(['Diffuse','nor_gl','Rough'].map((k)=>new Promise((resolve,reject)=>tl.load('./assets/pbr/'+id+'-'+k+'.jpg',t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(k==='Diffuse')t.encoding=THREE.sRGBEncoding;resolve(t)},undefined,reject))));
 finishMaps[id]=out;return out;
}
function finishTexture(t,x,y){const n=t.clone();n.repeat.set(x,y);n.needsUpdate=true;return n;}
function releaseFinish(m){if(!m?.userData?.customFinish)return;for(const k of ['map','normalMap','roughnessMap'])m[k]?.dispose();m.dispose();}
async function applyFinish(){
 const seq=++finishSequence;document.getElementById('finish-status').textContent='Preparando materiales…';
 try{
 const maps=await materialMaps(finishState.floor);const wallMaps=finishState.wall==='paint'?null:await materialMaps(finishState.wall);
 if(seq!==finishSequence)return;
 floors.forEach((f,i)=>{const a=plan.ambientes[i];if(['balcon','patio'].includes(a.tipo))return;
 const m=new THREE.MeshStandardMaterial({map:finishTexture(maps[0],a.ancho/finishState.scale,a.largo/finishState.scale),normalMap:finishTexture(maps[1],a.ancho/finishState.scale,a.largo/finishState.scale),roughnessMap:finishTexture(maps[2],a.ancho/finishState.scale,a.largo/finishState.scale),roughness:finishState.shine,normalScale:new THREE.Vector2(.35,.35),envMapIntensity:.65});m.userData.customFinish=true;releaseFinish(f.material);f.material=m;});
 matWall.color.set(finishState.color);matWall.map=wallMaps?wallMaps[0]:null;matWall.normalMap=wallMaps?wallMaps[1]:null;matWall.roughnessMap=wallMaps?wallMaps[2]:null;matWall.normalScale.set(.18,.18);matWall.roughness=.95;matWall.needsUpdate=true;
 document.getElementById('finish-status').textContent='Aplicado en vivo · '+document.getElementById('finish-floor').selectedOptions[0].text;
 }catch(e){document.getElementById('finish-status').textContent='No se pudo cargar ese material. Probá nuevamente.';console.error('Material',e);}
}
document.getElementById('finish-floor').onchange=e=>{finishState.floor=e.target.value;applyFinish()};
document.getElementById('finish-wall').onchange=e=>{finishState.wall=e.target.value;applyFinish()};
document.getElementById('finish-color').oninput=e=>{finishState.color=e.target.value;matWall.color.set(e.target.value)};
finishPanel.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{finishState.color=b.dataset.color;document.getElementById('finish-color').value=b.dataset.color;matWall.color.set(b.dataset.color)});
document.getElementById('finish-scale').oninput=e=>{finishState.scale=+e.target.value;applyFinish()};
document.getElementById('finish-shine').onchange=e=>{finishState.shine=+e.target.value;applyFinish()};
document.getElementById('finish-light').oninput=e=>renderer.toneMappingExposure=+e.target.value;
document.getElementById('finish-reset').onclick=()=>{Object.assign(finishState,{floor:'wood_floor',wall:'paint',color:'#eee8de',scale:2,shine:.7});for(const k of ['floor','wall','color','scale','shine'])document.getElementById('finish-'+k).value=finishState[k];renderer.toneMappingExposure=.85;document.getElementById('finish-light').value=.85;applyFinish()};
renderer.toneMappingExposure=.85;
const originalBuild=construir;construir=function(p){originalBuild(p);applyFinish()};
document.querySelector('.tag').textContent='Imaginá cómo querés vivirlo';document.querySelector('.pill').textContent='LAB REALISMO · VERSIÓN SEPARADA';
document.getElementById('gClose').click();
