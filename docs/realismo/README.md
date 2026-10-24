# Cauce Realismo — versión independiente

Publicado: https://andromedaweb.store/cauce-realismo/app.html

Pedido de Franco: mejorar realismo y modificar pisos, paredes y acabados en vivo, sin pisar la versión de Cande.

Base preservada: aac98eaca744b40da80bb1f9e4bca3544414e54c. No se modifican public/, src/ ni server.mjs del producto. El despliegue es una carpeta estática independiente /var/www/andromeda/cauce-realismo. Las llamadas a IA conservan /cauce/api; esta entrega no configura proveedor ni credenciales.

## Implementado
- Madera, cerámica mineral y acabado tipo microcemento; 12 imágenes PBR 1K de Poly Haven, licencia CC0, URLs en sources.json.
- Pintura, revoque y acabado mineral; color libre y cinco muestras.
- Escala del material, acabado mate/satinado/pulido y exposición, sin regenerar la geometría.
- Muebles glTF de la base; clonación de geometrías para evitar disponer geometrías compartidas cuando se reconstruye el modelo.
- Estado visible de aplicación y error de materiales. Los cambios abarcan pisos interiores y todas las paredes, no una pared individual. No se guardan al recargar.
- Entorno neutro para materiales interiores, conservando panorama exterior. La calidad del panorama y la iluminación global requieren una siguiente iteración.

## Verificación
Node --check pasó. En navegador real se verificaron controles, recorrido al estar, madera → cerámica y cambio de color de paredes. Se observaron modelos detallados de sofá y planta. El cargador r128 advierte UV sets no soportados de KHR_texture_transform; pendiente migrar conjuntamente motor y loaders para materiales modernos. No se afirma fotorrealismo terminado ni prueba de dispositivos físicos.

## Fuentes y reproducción
https://polyhaven.com/license
https://threejs.org/docs/pages/MeshStandardMaterial.html

Los scripts build.mjs, customizer.js y download.mjs son las fuentes de esta variante. build.mjs espera un checkout ../cauce; extraer public/ de la revisión base en ./public, ejecutar node download.mjs y node build.mjs, incluir realismo.css. Fijar la revisión base antes de regenerar, revisar futuros commits de Cande y no sobrescribirlos. Los assets base mantienen sus créditos en public/assets/CREDITOS.txt. La documentación se almacena fuera del producto para no interferir con su despliegue.
