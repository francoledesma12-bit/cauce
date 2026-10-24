# Propuesta de experiencia — Cauce

[Prototipo publicado](https://andromedaweb.store/cauce-experiencia/) · [Video MP4 de 30 s](https://andromedaweb.store/cauce-experiencia/recorrido-demo.mp4) · [Lista completa y fuentes](PRODUCTO-Y-EXPERIENCIA.md) · [Buzón](../buzon/README.md)

![Propuesta de visita](https://andromedaweb.store/cauce-experiencia/diseno.png)

## Qué contiene

Visita con maqueta ilustrativa, selección de ambientes, subtítulos, voz opcional del navegador, resumen automático y descarga de un clip. Pantallas de carga local y revisión del ejemplo, lista de tareas y referencias oficiales del mercado. Letras grandes, contraste y adaptación a pantalla chica.

La imagen nueva solo se previsualiza en el navegador. No hay generación conectada ni publicación de propiedades. El modelo y el mobiliario son de ejemplo. ElevenLabs no está conectado. No se editaron src/, public/ ni server.mjs del producto.

## Reproducir la interfaz

Desde la raíz del repositorio, con Node.js 22:

```bash
node docs/ux/prototipo/preparar.mjs
node docs/ux/prototipo/servir.mjs
```

Abrir http://127.0.0.1:8851/. El preparador copia las fuentes a work/cauce-experiencia y usa las bibliotecas, fuentes y licencia ya presentes en public/vendor. Usa los datos de docs/pruebas/astra. No instala paquetes ni configura credenciales.

El exportador local guarda 900 cuadros en work/cauce-ux/frames. Con FFmpeg instalado se pueden convertir:

```bash
ffmpeg -framerate 30 -i work/cauce-ux/frames/%05d.jpg -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart work/cauce-experiencia/recorrido-demo.mp4
```

El botón del sitio publicado descarga la pieza ya generada; no exporta nuevas propiedades.

## Verificación realizada

- Sintaxis de JavaScript comprobada.
- Flujo de ejemplo: elegir plano → revisar → confirmar supuestos → abrir maqueta.
- Selección del baño actualiza la vista y su descripción de 4 m².
- Vista de celular emulada solicitada a 390×844; ancho CSS observado de 341 px por la escala del navegador, sin desborde horizontal. Se ajustó el encuadre y el orden de bloques. Falta prueba física en dos celulares.
- MP4 validado: 900 cuadros, 30 fps, 30 s, 1280×720, H.264, sin pista de audio. [Metadatos](video-verificacion.json), [SHA-256](video-sha256.json).
- Página y video publicados: respuestas HTTP 200. Video con Content-Type video/mp4 y 2.306.500 bytes.
- Inspección visual de la interfaz y cuadros del clip. La síntesis de voz del navegador está implementada; no se certifica su calidad auditiva ni la integración de ElevenLabs.

## Para integrar con Cande

Conservar su cámara, detección de ambiente, guía, sol, materiales y activos. Tomar de esta entrega la organización de pantallas, jerarquía visual, estados y comportamiento de la narración. Coordinar cambios de producto en la [issue #1](https://github.com/francoledesma12-bit/cauce/issues/1). No reemplazar su aplicación completa por este prototipo.

El video y las capturas están alojados como entregables en el VPS; las fuentes, contrato y evidencias verificables están versionados aquí.
