'use strict';
const $=id=>document.getElementById(id);
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentPage='visita', selectedRoom=null, currentCaption='', voiceEnabled=false, tour=null, transition=null, recording=false, recorder=null, recordCanvas=null, recordContext=null, sceneReady=false;
let renderer,camera,controls,scene,planData,roomMeshes={},renderingOffline=false;
const visited=new Set();let voiceTimer=null,previewURL=null;
function stopVoice(){clearTimeout(voiceTimer);if('speechSynthesis' in window)speechSynthesis.cancel();}
function say(text,force=false){stopVoice();if(!voiceEnabled||recording||!('speechSynthesis' in window))return;if(!force&&selectedRoom&&visited.has(selectedRoom))return;const room=selectedRoom;voiceTimer=setTimeout(()=>{if(room!==selectedRoom||!voiceEnabled)return;const utterance=new SpeechSynthesisUtterance(text);const voices=speechSynthesis.getVoices();utterance.voice=voices.find(v=>/es[-_]AR/i.test(v.lang))||voices.find(v=>/^es/i.test(v.lang))||null;utterance.lang=utterance.voice?.lang||'es-AR';utterance.rate=.96;speechSynthesis.speak(utterance);if(room)visited.add(room);},650);}
function caption(text,label='Tu guía, sin apuro',speak=false){currentCaption=text;$('caption').textContent=text;$('guideLabel').textContent=label;if(speak)say(text);}
function showPage(id){if(recording)return;stopTour();stopVoice();currentPage=id;document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===id));document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('selected',el.dataset.page===id));if(id==='visita')requestAnimationFrame(resize);window.scrollTo({top:0,behavior:'instant'});}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));document.querySelector('.brand').onclick=e=>{e.preventDefault();showPage('visita');};
$('voice').onchange=()=>{voiceEnabled=$('voice').checked;if(voiceEnabled){caption(currentCaption||'Elegí un ambiente para escuchar una descripción breve.','Voz del navegador · prueba');say(currentCaption,true);}else stopVoice();};
$('repeat').onclick=()=>{if(!voiceEnabled){$('modeLabel').textContent='Activá la voz de prueba para escuchar la descripción.';return;}say(currentCaption,true);};
const roomDescriptions={estar:'Este es el estar y comedor. Un espacio integrado de veinte metros cuadrados.',cocina:'Esta es la cocina. En el plano ocupa seis metros cuadrados.',bano:'Este es el baño. Tiene cuatro metros cuadrados según el plano.',dormitorio:'Este es el dormitorio. Sus medidas son seis por tres metros.'};
const taskData=[
['Arquitectura','Unir carga, interpretación, revisión, modelo y enlace. Cierre: una propiedad completa sin editar código.','Pendiente'],
['Servidor','Generar desde el VPS con la computadora de Franco desconectada. Falta autenticar el proveedor.','Bloqueado: credencial'],
['Permisos','Revisar push, consola aislada y despliegue desde la sesión de Cande.','Revalidar en su sesión'],
['Modelado 3D','Un plano simple pasó la prueba. Falta otro plano real y validar aberturas.','Prueba parcial'],
['Preguntas necesarias','Pedir escala y confirmar ambigüedades; distinguir dato e hipótesis.','Pendiente'],
['Tiempo real','Estados verdaderos y resultados parciales solo si existen.','Pendiente'],
['Estabilidad','Ensayar error de proveedor, archivo inválido y solicitudes simultáneas.','Pendiente'],
['Fluidez','Probar cámara, carga y controles en dos celulares reales.','Pendiente'],
['Diseño y visibilidad','Prototipo de carga, revisión y visita. Letras grandes, controles claros y fondo contrastado.','Prototipo'],
['Recorrido premium','Conservar guía, iluminación y materiales de Cande; validar navegación y accesibilidad.','En desarrollo'],
['Video breve','Secuencia de 30 segundos y clip de maqueta con títulos. Versión final de interiores después.','Prototipo'],
['Guía de voz','Frases por ambiente, silencio, cancelación y subtítulos. ElevenLabs requiere integración.','Prototipo sin ElevenLabs'],
['Realismo','Primero geometría; luego materiales, luz, aberturas y muebles basados en evidencia.','Plan por etapas'],
['Compartir y QR','URL persistente por propiedad, video y QR que abran en otro celular.','Pendiente'],
['Pitch y negocio','Demostración verificable, beneficio humano, comprador y costos como hipótesis.','Pendiente']];
for(const [i,t] of taskData.entries()){const el=document.createElement('article');el.className='task';const n=document.createElement('span');n.className='task-number';n.textContent=String(i+1).padStart(2,'0');const c=document.createElement('div');const h=document.createElement('h2');h.textContent=t[0];const p=document.createElement('p');p.textContent=t[1];const status=document.createElement('span');status.className='task-status'+(/Prototipo|parcial/.test(t[2])?' tested':'');status.textContent=t[2];c.append(h,p,status);el.append(n,c);$('board').append(el);}
function uploadImage(file){if(!file)return;if(!['image/jpeg','image/png'].includes(file.type)||file.size>10*1024*1024){$('fileStatus').textContent='Elegí un JPG o PNG de hasta 10 MB.';return;}if(previewURL)URL.revokeObjectURL(previewURL);previewURL=URL.createObjectURL(file);$('preview').src=previewURL;$('previewLabel').textContent=file.name;$('fileStatus').textContent='Imagen abierta solo en este navegador. La IA para archivos nuevos todavía no está conectada.';$('review').disabled=true;}
$('file').onchange=()=>uploadImage($('file').files[0]);$('drop').ondragover=e=>{e.preventDefault();};$('drop').ondrop=e=>{e.preventDefault();uploadImage(e.dataTransfer.files[0]);};
$('useExample').onclick=()=>{$('preview').src='plano-prueba.png';$('previewLabel').textContent='Plano ficticio de ejemplo · 48 m²';$('fileStatus').textContent='Ejemplo elegido. Sus medidas ya fueron interpretadas y validadas en la prueba.';$('review').disabled=false;};
$('review').onclick=()=>{$('uploadStep').hidden=true;$('reviewStep').hidden=false;document.querySelectorAll('.steps li').forEach((e,i)=>e.classList.toggle('current',i===1));};
$('backUpload').onclick=()=>{$('uploadStep').hidden=false;$('reviewStep').hidden=true;document.querySelectorAll('.steps li').forEach((e,i)=>e.classList.toggle('current',i===0));};
$('confirmPlan').onchange=()=>{$('viewExample').disabled=!$('confirmPlan').checked;};$('viewExample').onclick=()=>{showPage('visita');resetView();};
function meshBox(w,h,d,color,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.82}));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
function furniture(){
  // Mobiliario ilustrativo, no inferido del plano.
  meshBox(2.5,.12,2.3,0x657b70,-1.0,.11,-1.5);meshBox(.9,.48,2.5,0x9da78a,-2.3,.36,-1.4);meshBox(.22,.65,2.5,0x8b9876,-2.65,.5,-1.4);meshBox(.9,.6,.2,0x8b9876,-2.3,.48,-2.6);meshBox(.9,.6,.2,0x8b9876,-2.3,.48,-.2);meshBox(.8,.3,1.1,0x654736,-.9,.27,-1.6);
  meshBox(1.6,.12,.9,0x88623e,-.9,.82,-3.15);for(const x of [-1.55,-.25])for(const z of [-3.48,-2.82])meshBox(.09,.7,.09,0x383932,x,.41,z);
  meshBox(.5,.82,2.45,0x809b87,2.61,.5,-2.4);meshBox(.54,.09,2.5,0xdce2d4,2.59,.95,-2.4);meshBox(.48,.03,.55,0x394b50,2.59,1.01,-2.3);meshBox(.45,.03,.45,0xa5b9b2,2.59,1.01,-3.2);
  meshBox(.62,.8,.54,0xe6e3d6,2.53,.5,-.48);meshBox(.67,.08,.58,0xd9e4dd,2.53,.93,-.48);meshBox(.8,.1,.8,0xdde7df,1.52,.15,.48);meshBox(.43,.35,.62,0xe9e9e0,2.4,.3,.5);
  meshBox(2,.25,2.5,0x6b503d,0,.22,2.35);meshBox(1.95,.28,2.38,0xe1dfca,0,.48,2.35);meshBox(2,.9,.18,0x8d9b83,0,.62,1.12);meshBox(1.92,.06,1.5,0x7e9278,0,.65,2.65);meshBox(.75,.12,.48,0xf0ead6,-.48,.68,1.55);meshBox(.75,.12,.48,0xf0ead6,.48,.68,1.55);for(const x of [-1.35,1.35])meshBox(.45,.45,.48,0x927251,x,.32,1.5);
}
async function init(){try{planData=await fetch('resultado.json').then(r=>{if(!r.ok)throw Error('No se pudo cargar el ejemplo');return r.json();});renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x14283e);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(40,1,.1,150);controls=new THREE.OrbitControls(camera,$('scene'));controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.46;controls.minDistance=4;controls.maxDistance=40;controls.addEventListener('start',()=>{if(recording)return;stopTour();transition=null;stopVoice();});scene.add(new THREE.HemisphereLight(0xffffff,0xa5b8bc,.65));const sun=new THREE.DirectionalLight(0xffffff,.85);sun.position.set(-6,16,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.normalBias=.025;scene.add(sun);
const colors={estar:0xb89e73,cocina:0x819d84,bano:0x759ab1,dormitorio:0xb7a180};for(const room of planData.plan.ambientes){const x=room.x+room.ancho/2-3,z=room.y+room.largo/2-4;roomMeshes[room.tipo]=meshBox(room.ancho-.08,.1,room.largo-.08,colors[room.tipo],x,.05,z);}
for(const wall of planData.walls){const length=wall.end-wall.start,mid=(wall.start+wall.end)/2;meshBox(wall.axis==='h'?length:.12,.9,wall.axis==='h'?.12:length,0xe9e8d9,(wall.axis==='h'?mid:wall.line)-3,.45,(wall.axis==='h'?wall.line:mid)-4);}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x02060c,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.02;ground.receiveShadow=true;scene.add(ground);furniture();sceneReady=true;resetView();new ResizeObserver(resize).observe($('stage'));resize();requestAnimationFrame(animate);
}catch(e){$('exportStatus').textContent='No se pudo abrir la maqueta: '+e.message;$('play').disabled=true;$('export').disabled=true;}}
function resize(){if(!sceneReady||recording||currentPage!=='visita')return;const w=$('stage').clientWidth,h=$('stage').clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function setCamera(pos,target,animateMove=true){if(!sceneReady)return;if(!animateMove||reduceMotion){camera.position.set(...pos);controls.target.set(...target);controls.update();transition=null;}else transition={start:performance.now(),from:camera.position.clone(),to:new THREE.Vector3(...pos),fromTarget:controls.target.clone(),toTarget:new THREE.Vector3(...target)};}
function resetView(){if(recording)return;stopTour();selectedRoom=null;setCamera(($('stage').clientWidth<500?[14.4,17.6,19.2]:[9,11,12]),[0,$('stage').clientWidth<500?-.5:0,0],false);document.querySelectorAll('[data-room]').forEach(b=>b.classList.remove('active'));caption('Elegí un ambiente o girá la maqueta para conocer la distribución.');$('modeLabel').textContent='Vos elegís dónde mirar.';}
function goRoom(type){if(recording||!sceneReady)return;stopTour();selectedRoom=type;const room=planData.plan.ambientes.find(r=>r.tipo===type),x=room.x+room.ancho/2-3,z=room.y+room.largo/2-4;setCamera([x+4.5,6.5,z+6.5],[x,0,z]);document.querySelectorAll('[data-room]').forEach(b=>b.classList.toggle('active',b.dataset.room===type));caption(roomDescriptions[type],room.nombre+' · guía breve',true);$('modeLabel').textContent='Exploración libre · '+room.nombre;}
document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>goRoom(b.dataset.room));$('reset').onclick=resetView;$('explore').onclick=()=>{resetView();$('stage').scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'center'});};
const shots=[
{pos:[9,11,12],target:[0,0,0],title:'Una visita, a tu ritmo.',text:'Conocé la distribución antes de visitar.',room:null},
{pos:[3,6,6],target:[-1,0,-1.5],title:'Estar y comedor',text:'20 m² para compartir el día.',room:'estar'},
{pos:[7,5,3],target:[2,0,-2.5],title:'Cocina',text:'6 m². Cada ambiente, en su contexto.',room:'cocina'},
{pos:[7,5,6],target:[2,0,0],title:'Baño',text:'4 m² según las medidas del plano.',room:'bano'},
{pos:[6,6,10],target:[0,0,2.5],title:'Dormitorio',text:'18 m². Espacio para imaginar tu lugar.',room:'dormitorio'},
{pos:[-8,11,12],target:[0,0,0],title:'Ahora, explorala vos.',text:'Pausá, elegí un ambiente y recorré a tu ritmo.',room:null}
];
function startTour(){if(!sceneReady)return;stopVoice();transition=null;tour={start:performance.now(),lastShot:-1};controls.enabled=false;$('play').textContent='■ Detener resumen';$('tourProgress').hidden=false;$('modeLabel').textContent=recording?'Grabando clip de maqueta · sin voz':'Resumen automático · podés detenerlo cuando quieras';}
function stopTour(){if(recording)return;tour=null;if(controls)controls.enabled=true;$('play').textContent='▶ Ver en 30 segundos';$('tourProgress').hidden=true;$('modeLabel').textContent='Vos elegís dónde mirar.';}
$('play').onclick=()=>{if(recording)return;if(tour)stopTour();else{startTour();if(matchMedia('(max-width:760px)').matches)$('stage').scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'center'});}};
function updateTour(now){const elapsed=Math.min((now-tour.start)/1000,30),idx=Math.min(Math.floor(elapsed/5),5),shot=shots[idx],previous=shots[Math.max(0,idx-1)];let f=Math.min((elapsed-idx*5)/2.2,1);f=f*f*(3-2*f);if(reduceMotion&&!recording)f=1;camera.position.lerpVectors(new THREE.Vector3(...previous.pos),new THREE.Vector3(...shot.pos),f);controls.target.lerpVectors(new THREE.Vector3(...previous.target),new THREE.Vector3(...shot.target),f);const drift=Math.max(0,elapsed-idx*5-2.2)*.04;camera.position.x+=drift;camera.lookAt(controls.target);if(idx!==tour.lastShot){tour.lastShot=idx;selectedRoom=shot.room;caption(shot.text,shot.title,!recording);document.querySelectorAll('[data-room]').forEach(b=>b.classList.toggle('active',b.dataset.room===shot.room));}$('progressBar').style.width=(elapsed/30*100)+'%';return {elapsed,shot,finished:elapsed>=30};}
function drawRecordFrame(state){const ctx=recordContext;ctx.drawImage(renderer.domElement,0,0,1280,720);ctx.fillStyle='#102438e8';ctx.fillRect(0,0,1280,90);ctx.fillRect(0,540,1280,180);ctx.fillStyle='#e6f5c2';ctx.font='600 44px Bricolage, sans-serif';ctx.fillText('cauce.',50,59);ctx.fillStyle='#edf2ed';ctx.font='20px IBMPlex, sans-serif';ctx.textAlign='right';ctx.fillText('48 m² · 4 ambientes',1230,54);ctx.textAlign='left';ctx.font='600 40px Bricolage, sans-serif';ctx.fillText(state.shot.title,50,601);ctx.font='24px IBMPlex, sans-serif';ctx.fillStyle='#d3deeb';ctx.fillText(state.shot.text,50,645);ctx.font='15px IBMPlex, sans-serif';ctx.fillStyle='#aebfd0';ctx.fillText('MAQUETA ILUSTRATIVA · MUEBLES DE EJEMPLO · SIN NARRACIÓN',50,688);ctx.fillStyle='#d6ed9e';ctx.fillRect(0,714,1280*(state.elapsed/30),6);}
function animate(now){requestAnimationFrame(animate);if(!sceneReady||renderingOffline)return;let state=null;if(tour)state=updateTour(now);else if(transition){let f=Math.min((now-transition.start)/850,1);f=f*f*(3-2*f);camera.position.lerpVectors(transition.from,transition.to,f);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,f);if(f===1)transition=null;}if(!tour)controls.update();renderer.render(scene,camera);if(recording&&state)drawRecordFrame(state);if(state?.finished){if(recording&&recorder?.state==='recording')recorder.stop();else stopTour();}}
$('export').onclick=async()=>{if(!sceneReady||recording)return;if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){$('exportStatus').textContent='Este navegador no permite exportar video. Podés reproducir el resumen.';return;}stopVoice();recording=true;$('export').disabled=true;$('play').disabled=true;$('exportStatus').textContent='Grabando 30 segundos de maqueta con títulos. Mantené esta pestaña abierta.';recordCanvas=document.createElement('canvas');recordCanvas.width=1280;recordCanvas.height=720;recordContext=recordCanvas.getContext('2d');renderer.setPixelRatio(1);renderer.setSize(1280,720,false);camera.aspect=1280/720;camera.updateProjectionMatrix();const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));const chunks=[];const stream=recordCanvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=async()=>{const blob=new Blob(chunks,{type:mime});stream.getTracks().forEach(t=>t.stop());recording=false;stopTour();renderer.setPixelRatio(Math.min(devicePixelRatio,2));resize();$('export').disabled=false;$('play').disabled=false;const a=$('videoDownload');if(a.dataset.blob)URL.revokeObjectURL(a.dataset.blob);a.href=URL.createObjectURL(blob);a.dataset.blob=a.href;a.hidden=false;$('exportStatus').textContent='Clip generado. Video de maqueta, sin narración; ElevenLabs todavía no está integrado.';if(location.hostname==='127.0.0.1'){try{const response=await fetch('/capture',{method:'POST',headers:{'Content-Type':'video/webm'},body:blob});if(!response.ok)throw Error('No se guardó la copia local');$('exportStatus').textContent+=' Copia local guardada.';}catch(e){$('exportStatus').textContent+=' '+e.message;}}};recorder.onerror=()=>{recording=false;stream.getTracks().forEach(t=>t.stop());stopTour();resize();$('export').disabled=false;$('play').disabled=false;$('exportStatus').textContent='Falló la exportación. Podés volver a intentarlo.';};recorder.start(1000);startTour();};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!recording){stopTour();stopVoice();}});
const recordInRealTime=$('export').onclick;
if(location.hostname!=='127.0.0.1')$('export').textContent='Descargar video · 30 s';
$('export').onclick=async()=>{
 if(location.hostname!=='127.0.0.1'){const download=document.createElement('a');download.href='recorrido-demo.mp4';download.download='cauce-recorrido-demo.mp4';download.click();return;}
 if(!sceneReady||recording)return;
 stopVoice();recording=true;renderingOffline=true;
 $('export').disabled=true;$('play').disabled=true;
 recordCanvas=document.createElement('canvas');recordCanvas.width=1280;recordCanvas.height=720;recordContext=recordCanvas.getContext('2d');
 renderer.setPixelRatio(1);renderer.setSize(1280,720,false);camera.aspect=1280/720;camera.updateProjectionMatrix();startTour();
 try{
  await document.fonts.ready;
  for(let frame=0;frame<900;frame++){
   const state=updateTour(tour.start+frame*1000/30);renderer.render(scene,camera);drawRecordFrame(state);
   const encoded=recordCanvas.toDataURL('image/jpeg',.92).split(',')[1];
   const blob=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
   const response=await fetch('/capture-frame/'+frame,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});
   if(!response.ok)throw Error('No se pudo guardar el cuadro '+frame);
   if(frame%30===0)$('exportStatus').textContent='Preparando video fluido: '+Math.round(frame/900*100)+'% · '+frame+'/900 cuadros';
  }
  $('exportStatus').textContent='900 cuadros guardados. Listos para convertir a MP4 de 30 segundos.';
 }catch(e){$('exportStatus').textContent='Exportación incompleta: '+e.message;}
 finally{recording=false;renderingOffline=false;stopTour();renderer.setPixelRatio(Math.min(devicePixelRatio,2));resize();$('export').disabled=false;$('play').disabled=false;}
};
init();
