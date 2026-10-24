# Cauce: lista completa, experiencia, video y voz

Actualización del 24/10/2026. Propuesta de Luz para coordinar con Cande. Las prioridades se mantienen hasta que tengan una prueba de cierre; un prototipo no equivale a funcionalidad integrada en producción.

## Decisión de producto

Dos experiencias conectadas: **la inmobiliaria prepara una propiedad** y **la persona la conoce a su ritmo**. Para el visitante, las dos acciones principales son «Ver en 30 segundos» y «Explorar a mi ritmo». La guía se activa voluntariamente y no bloquea los controles.

La conversión de plano a 3D ya existe en el mercado. La propuesta de Cauce debe demostrar una experiencia útil: comprender la distribución, elegir dónde mirar, recibir una explicación breve y compartir la visita sin instalar una app. La duración de 30 segundos es una decisión de diseño a probar; no se apoya en una afirmación médica sobre la atención de las personas.

## Referencias seleccionadas

| Referencia oficial | Qué ofrece y qué tomar para Cauce | Límite de la comparación |
|---|---|---|
| [Matterport: edición y visitas guiadas](https://support.matterport.com/s/article/Overview-of-Matterport-s-Editing-Features?language=en_US) | Paradas, títulos, descripciones y navegación espacial. Tomar un ambiente actual visible y acceso directo a otras habitaciones. | Es una referencia de experiencia; la prueba de Cauce no reproduce su captura ni su fidelidad. |
| [Zillow 3D Home: planos interactivos](https://www.zillow.com/3d-home/floor-plans/) | Vincula recorrido y plano. Tomar un minimapa y el contexto de dónde está cada imagen o ambiente. | Su flujo de captura usa panoramas; no demuestra reconstrucción fiel desde fotos aisladas. |
| [Planner 5D: carga de planos](https://support.planner5d.com/en/articles/14434484-how-to-upload-a-floor-plan) | Importación, indicaciones de calidad, procesamiento y revisión del resultado. Tomar una carga guiada y la corrección posterior. | Las medidas y claridad del plano importan; no prometer interpretación perfecta ni instantánea. |
| [CubiCasa: video 3D](https://help.cubi.casa/en/articles/7854003-3d-video-renders) | Recorrido de una propiedad exportado a video; ofrece MP4 Full HD. Tomar una secuencia definida y exportación lista para compartir. | Nuestra primera pieza es una maqueta de prueba, no un video final de interiores de ese nivel. |

**Recomendación:** orientación de Matterport y Zillow, carga/revisión de Planner 5D y video breve como salida independiente siguiendo la idea de CubiCasa. Mantener la identidad propia de Cauce; no copiar marcas, imágenes o interfaces completas.

## Pantallas y dinámica

1. **Propiedades:** una tarjeta por propiedad, estado legible y «Crear propiedad». Sin controles técnicos mezclados con la gestión comercial.
2. **Cargar:** plano primero; fotos complementarias asociadas a su ambiente después. Botón grande, vista previa, formatos y límites visibles. Pedir escala cuando no hay medidas. No interpretar una foto de un interior como un plano medido.
3. **Procesar:** mostrar etapas reales (archivo recibido, interpretación, validación, construcción), posibilidad de volver y errores accionables. No inventar un porcentaje ni representar una animación como avance de IA.
4. **Revisar:** plano y modelo juntos; resaltar datos dudosos y permitir correcciones. Señalar altura, orientación o terminaciones asumidas. No publicar automáticamente una ambigüedad como dato confirmado.
5. **Publicar:** vista previa del visitante, enlace por propiedad, QR y video. Enlace y QR deben abrir el mismo resultado guardado desde otro celular.
6. **Visitar:** modelo protagonista, resumen breve o exploración libre, ambiente actual, acceso a cada habitación, guía opcional y contacto de la inmobiliaria.

El prototipo adjunto implementa navegación entre visita, carga/revisión del ejemplo, lista completa y referencias. La carga de una imagen nueva solo la previsualiza localmente: no se manda al servidor ni se usa para fingir un modelo generado. La publicación por propiedad sigue pendiente.

### Visibilidad y controles

- Texto principal alrededor de 18 px; títulos entre 36 y 52 px; etiquetas secundarias reservadas para aclaraciones.
- Controles importantes de al menos 48 px de alto, con texto además del ícono y foco de teclado visible.
- Fondo oscuro en maqueta, geometría clara y etiquetas separadas del fondo; comprobar también interiores y tema elegido por Cande.
- Estados con palabras y no solo colores; errores junto a la acción que los resuelve.
- Subtítulos para toda narración, silencio accesible, movimiento reducido y pausa del resumen.
- No declarar conformidad con una norma de accesibilidad sin auditarla. Validar legibilidad y uso en dos celulares reales, además del escritorio.

## Video breve: propuesta editorial

**Objetivo:** despertar interés y ubicar a la persona. El video complementa el recorrido libre y no lo reemplaza.

| Tiempo | Imagen | Mensaje sugerido |
|---|---|---|
| 0–5 s | Vista general con identidad de Cauce | «Conocé la distribución antes de visitar.» |
| 5–10 s | Estar y comedor | Un único dato útil confirmado. |
| 10–15 s | Cocina | Una frase breve sobre el ambiente. |
| 15–20 s | Baño | Mostrarlo con claridad, sin transición brusca. |
| 20–25 s | Dormitorio | Dimensión o característica documentada. |
| 25–30 s | Vista general y llamada a explorar | «Ahora, explorala vos.» |

Propuesta final: MP4 H.264, 1080p, 30 fps, títulos grandes y voz opcional. Producir versión horizontal y un encuadre vertical pensado para celular; no recortar a ciegas el horizontal. Música, si se usa, con licencia y volumen bajo. Evitar atravesar paredes, giros rápidos y cambios de escala que desorienten.

La pieza inicial de esta entrega es **video de una maqueta ilustrativa**, con vistas aéreas y muebles de ejemplo. No es una visita interior fotorrealista, no contiene voz de ElevenLabs y no prueba navegación por puertas: el plano de prueba no tiene aberturas.

## Guía contextual y ElevenLabs

Franco confirmó que **todavía no tiene cuenta de ElevenLabs**. En `/etc/cauce` tampoco se encontró una declaración de `ELEVENLABS_API_KEY`. No se creó cuenta, compró crédito ni se configuró una clave.

### Primera integración recomendada

Preparar frases verificadas por ambiente, generar el audio una vez con ElevenLabs y guardarlo por propiedad/versión. Así la entrada a una habitación reproduce un audio ya disponible. ElevenLabs documenta tanto generación a archivo como reproducción en streaming: [documentación oficial](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/streaming).

Para la demo, esto alcanza para «Esta es la cocina» sin mantener una conversación permanente. Si después incorporamos preguntas por voz, ElevenLabs permite herramientas del cliente para accionar la interfaz y mecanismos de interrupción: [client tools](https://elevenlabs.io/docs/eleven-agents/customization/tools/client-tools), [conversation flow](https://elevenlabs.io/docs/eleven-agents/customization/conversation-flow). Esa segunda etapa requiere integrar y probar un agente; no se considera lista por reproducir una frase.

### Comportamiento propuesto

- Audio apagado inicialmente; el visitante elige «Activar guía». Subtítulos siempre disponibles.
- Detectar el ambiente desde la posición real de la cámara. Esperar unos 800 ms de permanencia para evitar disparos al cruzar un límite.
- Presentación de una frase, aproximadamente 4–7 segundos. Ejemplo: «Este es el baño. Tiene cuatro metros cuadrados según el plano».
- Una presentación automática por ambiente durante la sesión. Repetición solo a pedido; no encadenar saludos al volver a entrar.
- Al cambiar de habitación, detener la frase anterior y descartar su respuesta si llega tarde. Un único audio activo.
- Botones de silenciar y repetir siempre accesibles. Si falla la voz, mantener texto y recorrido funcionando.
- Mientras la persona pregunte, priorizarla. El micrófono solo se activa por acción explícita; no se necesita para la guía por ambientes.
- Preguntas sobre medidas, luz, accesibilidad o servicios se responden con datos confirmados; las suposiciones se identifican.

### Contrato para coordinar la implementación

Evento del visor: `room-entered { propertyId, propertyVersion, roomId }`. El cliente valida el identificador y consulta la narración aprobada para esa habitación. La respuesta contiene `text`, `audioUrl`, `source` y `version`. Los secretos quedan en el servidor. El audio debe invalidarse cuando cambian los datos de la propiedad.

Para conversación posterior: herramienta limitada `navigate_to_room(roomId)` y lectura de atributos confirmados. No ejecutar JavaScript arbitrario devuelto por el modelo. Usar el sistema de cámara, habitación actual y guía que Cande ya implementó.

El prototipo actual prueba selección de ambiente, subtítulos, cancelación, repetición voluntaria y síntesis del navegador. No detecta caminata libre ni usa ElevenLabs; es una demostración del comportamiento de interfaz.

## Realismo por etapas

1. **Geometría fiel:** escala, muros, aberturas y conexiones correctas. Un error aquí no se arregla con materiales bonitos.
2. **Lectura espacial:** contraste, cámara a altura humana, transiciones y controles claros. Cande ya subió cambios de encuadre y contraste.
3. **Presentación:** materiales, luz, sombras suaves, muebles proporcionados y detalles. Cande publicó avances; falta validarlos en la experiencia real y en celulares.
4. **Fidelidad a la propiedad:** vincular materiales, estado y mobiliario a fotos o captura real, señalando lo ilustrativo. Un plano solo no contiene esa información.

Priorizar que el recorrido sea estable y claro durante la demo. No vender la maqueta de prueba como un gemelo exacto del inmueble.

## Lista completa y prueba de cierre

| Prioridad | Tarea | Estado observado | Para cerrarla |
|---|---|---|---|
| P0 | Arquitectura | Circuito local probado con ejemplo | Carga pública → modelo guardado, sin edición manual de código |
| P0 | Servidor | Proveedor de generación sin configurar en última lectura | Generar con la computadora de Franco desconectada |
| P0 | Permisos | Acceso aislado configurado previamente | Push, consola y despliegue desde la sesión de Cande |
| P0 | Modelado 3D | Plano simple validado; ejemplo en app | Probar otro plano real, escala, muros y aberturas |
| P0 | Preguntas necesarias | Comportamiento definido | Pedir lo faltante y permitir corregir ambigüedades |
| P0 | Tiempo real | Diseño de estados definido | Cada etapa visible corresponde a un estado real |
| P0 | Estabilidad | Pendiente de pruebas completas | Archivo inválido, caída del proveedor y dos usuarios sin mezclar resultados |
| P0 | Fluidez | Pendiente en equipos reales | Recorrido usable en dos celulares; registrar carga y respuesta |
| P1 | Diseño y letras grandes | Prototipo de esta entrega | Integración en producto y prueba de carga/revisión/visita |
| P1 | Recorrido premium | Cande agregó guía, sol, materiales y cámara | Verificación visual, navegación y ausencia de cruces incorrectos |
| P1 | Video breve | Clip de maqueta en esta entrega | Video final de la propiedad, con títulos y versión móvil |
| P1 | Voz contextual | Interfaz de prueba; sin cuenta ElevenLabs | Hablar al entrar, callar al salir, no repetir y poder silenciar |
| P1 | Realismo | Avances de Cande, objetivo progresivo | Materiales y detalles coherentes; distinguir ilustración y datos reales |
| P0 | Compartir y QR | Pendiente por propiedad | Otra persona abre el mismo resultado desde su celular |
| P1 | Profesionalismo, pitch y negocio | Guion y criterios propuestos | Ensayo completo; separar resultados, hipótesis y próximos pasos |

## Coordinación y límites de la entrega

Referencias revisadas durante el trabajo: `132d5e1` (materiales), `427ba48` (contraste) `6cc8f22` (encuadre de recorrido) y `3f20421` (activos de muebles y materiales), además del buzón. No se editaron los archivos de producto de Cande. El prototipo y sus fuentes se entregan como referencia para integrar, no como una segunda aplicación que deba sustituir la suya.

La generación pública necesita el proveedor configurado y una prueba real. ElevenLabs necesita cuenta y credencial. La validación final necesita dispositivos reales y una propiedad/plano adicional. Esos puntos no se marcan completados en esta entrega.
