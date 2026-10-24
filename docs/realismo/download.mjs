import fs from 'node:fs/promises';
const dir=new URL('./public/assets/pbr/',import.meta.url);await fs.mkdir(dir,{recursive:true});
const manifest=[];
for(const id of ['wood_floor','floor_tiles_06','grey_plaster','painted_plaster_wall']){
 const r=await fetch('https://api.polyhaven.com/files/'+id);if(!r.ok)throw Error(id+r.status);const f=await r.json();
 for(const map of ['Diffuse','nor_gl','Rough']){const u=f[map]?.['1k']?.jpg?.url;if(!u)throw Error(id+map);const d=await fetch(u);if(!d.ok)throw Error(u);const b=Buffer.from(await d.arrayBuffer());await fs.writeFile(new URL(id+'-'+map+'.jpg',dir),b);manifest.push({id,map,url:u,bytes:b.length,license:'CC0'});}
 console.log(id,'downloaded');
}
await fs.writeFile(new URL('sources.json',dir),JSON.stringify(manifest,null,2));
