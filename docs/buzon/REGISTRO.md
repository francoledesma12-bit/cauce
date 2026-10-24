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

## Plantilla para próximas entradas

- Fecha y hora (ART):
- Objetivo:
- Estado:
- Cambios y commit:
- Pruebas y evidencia:
- Resultado observado:
- Límites o errores:
- Siguiente paso:
