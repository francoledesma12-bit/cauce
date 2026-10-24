# Prueba GPU de Tecnoteca

Estado: proceso preparado; NO ejecutado sobre video real ni validado en GPU. No hay pod conectado ni video completo disponible al preparar este archivo.

## Configuración propuesta para el pod

- GPU: 1 × RTX 4090, 24 GB VRAM; memoria RAM preferentemente 32 GB o más.
- Volumen persistente: 50 GB como punto de partida de esta prueba; revisar espacio libre antes de ejecutar.
- Imagen oficial de referencia: `ghcr.io/nerfstudio-project/nerfstudio:1.1.3`. Confirmar disponibilidad y herramientas dentro del pod antes de usarla. No ejecutar Docker dentro del pod: la imagen es el contenedor del pod.
- Almacenamiento del trabajo: `/workspace/cauce/`. Acceso al pod por SSH; no publicar Jupyter ni endpoints sin autenticar.
- Referencia consultada 24/10/2026: https://www.runpod.io/pricing muestra RTX 4090 USD 0,89/h; el precio final depende del pod disponible y del almacenamiento. No se contrató nada.

## Ejecución, una vez conectado

Colocar el video original terminado en `/workspace/cauce/input/IMG_6732.MOV` y este script en `/workspace/cauce/pipeline.py`.

```bash
python /workspace/cauce/pipeline.py \
  --video /workspace/cauce/input/IMG_6732.MOV \
  --output /workspace/cauce/runs/tecnoteca-001 \
  --frames 200 --iterations 7000 --max-minutes 60
```

El límite de 60 minutos detiene los procesos del experimento, NO apaga el pod ni impone un límite monetario. Detener el pod desde RunPod cuando termine la prueba; conservar antes los resultados en almacenamiento persistente.

## Estados verdaderos

`status.json` registra comprobación GPU → cuadros → alineación → entrenamiento → exportación → revisión visual pendiente. No contiene porcentajes simulados. Los logs se conservan por etapa. La validación de alineación exige al menos 30 cámaras y 70 % de cuadros registrados: es un criterio experimental, no una garantía de precisión. No continúa si faltan datos o falla un comando.

## Integración que falta ejecutar

1. Video completo y conexión SSH al pod.
2. Verificar imagen, CUDA, COLMAP, PyTorch y gsplat; correr un ensayo pequeño.
3. Ejecutar el video real y revisar alineación, zonas faltantes, personas en movimiento y escala.
4. Abrir PLY con un visor de Gaussian Splats compatible (por ejemplo SuperSplat) y validar reproducción web. Un PLY de splats no es una malla editable de Three.js.
5. Publicar el visor en una ruta separada de Cauce y conectar estados de trabajo autenticados. El script es un ejecutor, todavía no un servicio público de carga/cola.
6. Para 360 conectados: renderizar panoramas desde puntos revisados de la reconstrucción. Los renders heredan huecos y errores; no rellenar sin indicarlo.
7. Para cambiar paredes/pisos: reconstrucción de superficies y segmentación adicionales; no lo resuelve exportar splats.

## Fuentes

- https://docs.nerf.studio/quickstart/installation.html
- https://docs.nerf.studio/quickstart/custom_dataset.html
- https://docs.nerf.studio/nerfology/methods/splat.html

No requiere créditos OpenAI/Anthropic para este pipeline: FFmpeg + COLMAP + Nerfstudio/Splatfacto ejecutan en la GPU alquilada. Es reconstrucción por lote; no se ha demostrado reconstrucción en vivo durante la grabación ni un tiempo de entrega.
