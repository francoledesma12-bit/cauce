# Registro de trabajo — Cauce

## 24/10/2026 — Prueba de Astra (13:13:57–13:14:11 ART)

- **Objetivo:** comprobar que un programa pueda interpretar un plano y producir una maqueta sin conversar manualmente con el modelo durante la ejecución.
- **Entrada:** plano ficticio de cuatro ambientes y medidas explícitas.
- **Ejecución:** Codex CLI con sesión ChatGPT, modelo gpt-6-astra; coordinador local. No se configuró API key para la prueba.
- **Resultado:** respuesta en 13,96 s; circuito de interpretación, validación, OBJ y visor en 14,11 s. Cuatro ambientes y 48 m² coincidentes con la entrada; no hubo correcciones manuales de la geometría.
- **Prueba previa:** interpretación equivalente en 12,3 s. No se usa esa medición como tiempo del circuito completo.
- **Supuestos declarados:** paredes de 2,6 m y espesor de 12 cm. No se inventaron aberturas.
- **Corrección del visor:** se ajustaron el empaquetado del JavaScript y la iluminación antes de verificar visualmente el resultado.
- **Publicación:** directorio independiente /cauce-prueba-astra/. Se comprobaron vista 3D, cambio de altura de paredes, respuesta pública y archivo OBJ.
- **Alcance:** no se modificó el repositorio de Cande durante la prueba. Aún faltan carga pública, ejecución en VPS/Cloud, persistencia y QR por propiedad.
- **Evidencia:** [carpeta de prueba](../pruebas/astra/README.md).
- **Estado:** probado para el ejemplo y publicado como resultado estático.

## 24/10/2026, 13:16 ART — Registro compartido solicitado por Franco

- **Pedido:** dejar el trabajo registrado y subirlo a GitHub para que Cande pueda leerlo con sus herramientas.
- **Referencia revisada:** main en ea4e76253a52f75bb70c935dec6f7ffbaa31ab74, con cambios nuevos de Cande.
- **Hallazgo:** esa referencia incorpora guía, sol y detalles del recorrido; no se validó de punta a punta en esta entrega.
- **Salud consultada:** status=ok, revision=2fae3d9702d955da02754fad44737080d00cceb6, generation=not_configured. Es una observación puntual, no un diagnóstico del motivo del desfase.
- **Cambios de esta entrega:** buzón de coordinación, tareas con criterios de cierre, registro, informe y archivos de evidencia de Astra.
- **Protección del trabajo compartido:** solo rutas nuevas de documentación y evidencia; sin cambios en src/, public/, server.mjs, despliegue ni secretos.
- **Siguiente paso prioritario:** elegir y conectar el proveedor desde el VPS y probar una carga desde otro celular.

## 24/10/2026, 13:25 ART — Entrega de Cande (con Claude): guía con IA, sol y plano de Astra en la app

- **Objetivo:** sumar el diferencial de la demo (recorrido que responde preguntas) y conectar el resultado de Astra con el visor de la aplicación.
- **Estado:** publicado; lógica probada en navegador simulado; visual pendiente de revisar en celulares reales.
- **Cambios y commit:**
  - ea4e762: guía con IA dentro del recorrido, sol de Rosario por hora y estación, puertas, carpintería, zócalos, techos con luminarias, cielo y ciudad, marca unificada con la portada.
  - Este commit: el resultado de Astra (`docs/pruebas/astra/resultado-astra.json`) se carga tal cual como tercer plano de ejemplo en `/cauce/app.html`. El formato de Astra y el del visor coinciden, no hizo falta adaptar nada.
- **Pruebas y evidencia:**
  - /cauce/api/health devolvió `revision=ea4e762…` a las 13:20 ART: la versión servida coincide con main de producto.
  - Navegador simulado (jsdom + three.js): carga de los 3 planos, 48 m² en el de Astra, preguntas locales de navegación, superficie, dormitorios, muebles y sol; sin errores de JavaScript.
  - Servidor local: `/api/leer-plano` y `/api/guia` responden 503 con mensaje claro mientras no haya clave.
- **Cómo funciona la guía:** primero intenta responder localmente (navegación, m², dormitorios, muebles contra largo libre de paredes, sol según orientación). Para lo demás usa IA: en Claude, la cuenta del usuario; en el VPS, `POST /cauce/api/guia` con `ANTHROPIC_API_KEY` y modelo rápido (`CAUCE_MODEL_RAPIDO`, por defecto `claude-haiku-5-5`). Si la IA falla, cae a las respuestas locales: la demo no se corta.
- **Supuestos declarados:** el norte del plano se toma "arriba" salvo que el plano diga otra cosa; el sol usa la latitud de Rosario (-32,95°). En el plano de Astra no hay aberturas, así que el recorrido muestra ambientes cerrados.
- **Límites:** sin clave en el VPS, la lectura de planos y las preguntas abiertas solo funcionan en la versión de Claude.
- **Siguiente paso:** decisión del proveedor (ver abajo) y ensayo en dos celulares.

### Propuesta de Cande para la decisión 1 (proveedor)

Para la demo de hoy: **clave de API de Anthropic en el VPS** (`/etc/cauce`, variable `ANTHROPIC_API_KEY`, reiniciar `cauce.service`). Es el único camino que hoy funciona sin la computadora de Franco y ya está implementado y probado del lado del código. Astra queda como evidencia de que el contrato JSON funciona con otro modelo: su resultado se carga en la app sin cambios. Si Franco prefiere otro proveedor, solo hay que reemplazar la llamada en `server.mjs`; el contrato no cambia.

**Para no pisarnos:** el producto (src/, public/, server.mjs) lo toca Cande; la documentación y el VPS, Franco. Antes de subir: `git pull --rebase`.

## 24/10/2026, 13:19 ART — Contraste visual y coordinación con Cande

- **Pedidos de Franco:** mejorar el contraste del fondo con el modelado y revisar siempre los avances de Cande mientras trabajamos.
- **Revisión previa:** se leyó b4f583822d30bda5ddb41cf25d7de026461baaa6 y su diff. Cande agregó el plano de Astra como ejemplo de la app y respondió en este registro. Su entrada se conserva íntegra.
- **Propuesta recibida:** Cande propone configurar Anthropic en el VPS. Está registrada como propuesta; esta entrega no configura ni compra credenciales y no verifica disponibilidad del modelo de ese proveedor.
- **Cambios realizados:** en la prueba independiente se oscureció el fondo a azul profundo, se reforzaron los colores de pisos y se ampliaron etiquetas. Se conserva la misma geometría y medición de generación.
- **Validación:** constructor ejecutado nuevamente sin consultar al modelo; cuatro ambientes, 48 m², sin superposiciones. Vista pública revisada en navegador y captura adjunta. Falta la revisión en celulares reales.
- **Publicación:** página independiente /cauce-prueba-astra/ actualizada; evidencia y plantilla del visor archivadas en docs/pruebas/astra/. La plantilla contiene marcadores de bibliotecas y datos y no es una página autónoma.
- **Estado del producto:** no se editaron src/, public/ ni server.mjs. El requisito de contraste para la app principal sigue abierto en la [issue #1](https://github.com/francoledesma12-bit/cauce/issues/1).
- **Lectura de salud actual:** status=ok, revision=479c9358fa4f0822d712626066e0c32294cf1af5, generation=not_configured. No es una prueba de generación.
- **Coordinación:** se agregó al buzón la rutina de leer commits, diffs e issues antes de cada bloque y registrar las entregas; no implica un monitor en segundo plano.
- **Evidencia:** [contraste](CONTRASTE-3D.md).
- **Siguiente paso:** que el equipo aplique y revise el contraste en el visor principal, y cierre proveedor/generación con una prueba desde otro dispositivo.

## 24/10/2026, 13:40 ART — Entrega de Cande (con Claude): realismo del recorrido y contraste pedido por Franco

- **Objetivo:** que el recorrido se vea como una casa real (pedido de Cande: "no de Sims") y aplicar en la app principal el contraste pedido por Franco.
- **Estado:** publicado; lógica probada en navegador simulado; visual pendiente en celulares reales.
- **Cambios y commit:**
  - 132d5e1: luz de entorno con reflejos suaves, luces cálidas por ambiente, piso de madera con veta y brillo, porcelanato 60x60, paredes con textura, sombras de contacto, muebles con bordes redondeados (sillón con almohadones, cama con acolchado, mesas de luz con lámparas, cocina modular con alacenas, baño con espejo, comedor, plantas) y paleta neutra.
  - Este commit: fondo del visor en verde pino profundo (color de la marca) en vista maqueta, suelo apenas más claro para que se lean las sombras, etiquetas más grandes. Criterio tomado de CONTRASTE-3D.md, sin perder guía, sol, ciudad ni materiales.
- **Pruebas:** navegador simulado con los 3 planos y la guía; sin errores de JavaScript.
- **Pendiente:** revisión visual en escritorio y dos celulares (checklist de issue #1). Rendimiento en equipos lentos: si se traba, bajar la calidad de sombras.

## 24/10/2026, 13:50 ART — Entrega de Cande (con Claude): muebles, parquet y ciudad reales

- **Objetivo:** subir la calidad visual (pedido de Cande: "baja calidad, que parezca un departamento real alquilable").
- **Estado:** publicado; lógica probada en navegador simulado; la carga de modelos solo se puede verificar en un navegador real.
- **Cambios:** `public/assets/` con modelos glTF reales (sillón GlamVelvetSofa de Wayfair, sillón individual SheenChair, planta, florero), textura de parquet real y panorama HDR de ciudad real que ilumina la escena y se ve por las ventanas. Texturas reducidas a 512 px: 9 MB en total. Si algún recurso no carga, la app usa los muebles armados con formas (no se rompe). El recorrido arranca con encuadre de foto inmobiliaria (esquina, 1,5 m, diagonal).
- **Servidor:** tipos para .glb/.jpg/.png/.hdr y caché de 1 hora en `/assets/` y `/vendor/` (antes todo era no-store: el celular bajaba 9 MB en cada visita).
- **Licencias:** ver `public/assets/CREDITOS.txt` (CC BY 4.0 y CC0). El sillón y la planta piden atribución: hay que mencionarlos en la web o en el README.
- **Pendiente:** revisar en celulares reales la carga y la fluidez; si va lento, sacar la planta (3 MB) o el sillón individual (3 MB).

## 24/10/2026, 13:36 ART — Lista completa, propuesta UX, video y voz

- **Pedido de Franco:** ejecutar la lista completa y sumar video breve, guía contextual con ElevenLabs, realismo progresivo y pantallas claras con letras grandes; buscar referencias del mercado.
- **Coordinación previa:** leídos el registro y los commits de Cande 132d5e1, 427ba48, 6cc8f22 y 3f20421. Se preserva su producto y sus entradas. El prototipo es una referencia de experiencia para integrar sobre su trabajo.
- **Investigación:** documentación oficial de Matterport, Zillow 3D Home, Planner 5D, CubiCasa y ElevenLabs. Fuentes y recomendaciones en [producto y experiencia](../ux/PRODUCTO-Y-EXPERIENCIA.md).
- **Entregado:** [prototipo navegable](https://andromedaweb.store/cauce-experiencia/) con visita, carga/revisión del ejemplo, lista completa y referencias; [clip de 30 segundos](https://andromedaweb.store/cauce-experiencia/recorrido-demo.mp4); fuentes reproducibles en docs/ux/prototipo/.
- **Pruebas:** selección del baño y subtítulo correspondiente; ejemplo de carga, paso de revisión y bloqueo hasta confirmar supuestos; vista móvil emulada y corrección de encuadre; sin desborde horizontal en la comprobación. La emulación no reemplaza dos celulares reales.
- **Video:** render determinista de 900 cuadros; MP4 H.264, 1280×720, 30 fps, duración 30 s. Verificado con ffprobe e inspección de cuadros. Archivo público responde 200 con tipo video/mp4 y 2.306.500 bytes. Es maqueta aérea con muebles ilustrativos, sin narración ni recorrido interior fotorrealista.
- **Corrección de exportación:** primera captura en tiempo real descartada por pocos cuadros; sustituida por render cuadro a cuadro y codificación MP4.
- **Voz:** Franco confirmó que todavía no tiene cuenta de ElevenLabs. No se encontró ELEVENLABS_API_KEY declarada en la configuración de Cauce. No se creó cuenta ni se compró crédito. Prototipo con voz del navegador y subtítulos; calidad auditiva y ElevenLabs no se dan por validados.
- **Diseño de guía:** activación voluntaria, una frase por ambiente, cancelación al cambiar, repetición a pedido, audio guardado por propiedad y estado silencioso como alternativa. La detección de entrada al caminar debe integrarse en el visor de Cande.
- **Pendientes explícitos:** proveedor de generación en VPS, cuenta/clave ElevenLabs, integración UX/voz en la aplicación, QR y persistencia por propiedad, propiedad real adicional y prueba en dispositivos reales.
- **Estado:** prototipo y clip publicados; fuentes y plan documentados. No es cierre de toda la lista.

## 24/10/2026, 14:00 ART — Decisión de Cande: fotos reales como experiencia principal

- **Decisión:** el 3D no se ve fotorrealista en navegador (Cande: "sigo viendo un Sims"). Como hacen Idealista, Zillow y Rightmove, la experiencia principal pasan a ser **fotos reales por ambiente** (comunes o 360°) y el plano 3D queda como mapa de navegación. La guía con IA lleva a las fotos de cada ambiente.
- **Estado:** publicado; flujo probado en navegador simulado (asignación por nombre de archivo, 360 detectada por proporción 2:1, navegación y vuelta al 3D).
- **Cómo cargar fotos de demo sin tocar código:** `public/assets/fotos/<plano>/fotos.json` con `{"Cocina": ["cocina-1.jpg"], "Estar": ["estar-360.jpg"]}` y las imágenes en esa carpeta (`<plano>` = montevideo, sarmiento o astra). Se cargan solas al abrir ese plano.
- **Necesitamos:** fotos REALES (de una propiedad de Ruiz con permiso, o sacadas hoy con celular, idealmente 360). Sin fotos, el modo no aparece.

## 24/10/2026, 14:15 ART — Fotos reales cargadas en la demo

- **Qué:** 10 fotos reales de un mismo departamento (living, cocina, dormitorio, baño, pasillo y balcón), tomadas de Unsplash (licencia libre para uso comercial), optimizadas a 1440–1600 px (1,6 MB en total) en `public/assets/fotos/depto/`. Manifiestos por plano en `public/assets/fotos/{montevideo,sarmiento,astra}/fotos.json`.
- **Honestidad en la demo:** la app las marca como "foto de ejemplo"; no son fotos de Montevideo 953 ni de otra propiedad de Ruiz. Créditos en `public/assets/CREDITOS.txt`.
- **Prueba:** navegador simulado: carga de manifiestos, 3 fotos en cocina, navegación, etiqueta "foto de ejemplo", vuelta al 3D; sin errores.
- **Siguiente paso ideal:** reemplazar por fotos reales de una propiedad de Ruiz (con permiso): solo hay que cambiar las imágenes y el fotos.json, sin tocar código.

## 24/10/2026, 14:20 ART — Recorrido entre fotos reales y compartir con QR

- **Pedido de Cande:** "que las fotos reales se vean como un recorrido 3D".
- **Recorrido fotográfico:** cada foto se proyecta sobre un cilindro alrededor de la cámara (las 360° sobre una esfera): se arrastra para mirar, rueda para acercar y paneo lento automático. Flechas hacia los ambientes conectados, calculadas desde las puertas, pasos y aberturas del plano (no inventadas). Al elegir una, la cámara avanza, la foto se funde y la siguiente aparece desde cerca. Minimapa del plano con "estás acá"; tocar un ambiente camina hasta él.
- **Compartir (P0 del buzón):** botón "Compartir" con link, QR y mensaje para WhatsApp. El plano viaja comprimido dentro del link (#p=…, deflate + base64url; ~330 caracteres): sirve también para planos leídos por IA, sin base de datos. Ida y vuelta verificada en los 3 planos (idéntico tras normalizar). Las fotos subidas por el usuario no viajan en el link (pendiente: persistencia).
- **Pruebas:** navegador simulado (flechas, minimapa, QR, mensaje, sin errores) y prueba de ida y vuelta del link en Node.
- **Pendiente:** ver la transición en un navegador real y en celular.

## Plantilla para próximas entradas

- Fecha y hora (ART):
- Objetivo:
- Estado:
- Cambios y commit:
- Pruebas y evidencia:
- Resultado observado:
- Límites o errores:
- Siguiente paso:

## 24/10/2026 — Realismo editable, variante aislada

Por pedido de Franco se publicó https://andromedaweb.store/cauce-realismo/app.html, preservando la entrega de Cande aac98ea. Pisos PBR descargados CC0, pintura y revestimientos, escala, brillo y exposición en vivo. Fuente, pruebas y límites en docs/realismo/README.md. No se modifican archivos del producto. Falta completar iluminación global y modernizar loaders; no se declara fotorrealismo terminado.

## 24/10/2026 — Prueba fotográfica 360° independiente
Pedido de Franco: probar experiencia realista desde fotos. Publicación en /cauce-360/, fuente docs/360. Panorama real Wooden Lounge CC0, un único punto panorámico y carga local de foto propia 2:1. Preservado producto de Cande y variante de materiales. No es un recorrido conectado ni reconstrucción desde fotos sueltas.
