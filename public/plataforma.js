document.getElementById('ampliarExplorador').onclick=()=>{const el=document.getElementById('exploradorMarco');if(document.fullscreenElement)document.exitFullscreen();else el.requestFullscreen().catch(()=>{el.classList.toggle('ampliado');});};
if(location.hash==='#tecnoteca'){document.getElementById('exploradorApp').src='./app.html#tecnoteca';document.getElementById('explorar').scrollIntoView();}
