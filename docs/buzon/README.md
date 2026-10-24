# Buzón del equipo — Cauce / Shippear

Punto de lectura compartido para Franco, Cande, Oscar, Luz y las herramientas que el equipo use. Última actualización: 24/10/2026, hora de Argentina.

## Entrega nueva: lista completa, diseño, video y voz

[Plan completo y referencias](../ux/PRODUCTO-Y-EXPERIENCIA.md) · [Probar la experiencia](https://andromedaweb.store/cauce-experiencia/) · [Ver video de 30 s](https://andromedaweb.store/cauce-experiencia/recorrido-demo.mp4) · [Fuentes y verificación](../ux/README.md)

Franco confirmó que todavía no tiene cuenta de ElevenLabs. La guía de prueba usa la voz del navegador; la voz definitiva y su integración al caminar siguen pendientes. La lista original se conserva y ahora incluye video, guía de voz y diseño integral.

## Empezar por acá

**Objetivo de la demo:** una inmobiliaria sube un plano con medidas, revisa lo interpretado y obtiene un modelo que otra persona puede recorrer desde un enlace o QR. El beneficio que queremos demostrar es ayudar a entender la distribución de una propiedad antes de visitarla.

**Prioridad inmediata:** conectar y probar el circuito completo desde la plataforma hasta el servidor. Ya hay una prueba real de interpretación con Astra y construcción de una maqueta, pero todavía no demuestra una carga pública automática ni ejecución con la computadora apagada.

- [Aplicación compartida](https://andromedaweb.store/cauce/app.html)
- [Prueba independiente con Astra](https://andromedaweb.store/cauce-prueba-astra/)
- [Evidencia y alcance de la prueba](../pruebas/astra/README.md)
- [Despliegue y operación](../despliegue.md)
- [Guion de presentación existente](../pitch.md)
- [Registro cronológico](REGISTRO.md)

## Estado comprobado y pendientes

| Elemento | Evidencia | Estado |
|---|---|---|
| Interpretación de un plano ficticio con Astra | Imagen, JSON y tiempos en la carpeta de pruebas | Probado en dos ejecuciones locales de Codex CLI con sesión ChatGPT |
| Imagen → JSON → validación → OBJ → visor | Una ejecución completa tardó 14,11 s; consulta al modelo: 13,96 s | Probado para ese plano simple, sin corregir la geometría a mano |
| Distribución interpretada | 4 ambientes, 48 m², medidas y posiciones coincidentes, sin superposiciones | Validado contra la entrada de prueba |
| Modelo visible y descargable | Visor independiente y OBJ con 11 objetos, 88 vértices y 66 caras | Publicado y comprobado |
| Generación desde la aplicación pública | Falta conectar entrada, trabajo de generación, guardado y salida | Pendiente |
| Ejecución sin computadora local | El coordinador de la prueba corrió en la computadora de Franco | Pendiente en VPS / Cloud |
| Clave de API de la aplicación | Última lectura de /cauce/api/health: generation = not_configured | Pendiente; no publicar claves en GitHub |
| Cambios recientes de Cande | Commit ea4e762 y siguiente: guía con IA, sol, detalles del modelo y plano de Astra como ejemplo | Publicado; lógica probada en navegador simulado; falta revisión visual en celulares |
| Versión servida | Salud a las 13:20 ART: revision ea4e762 | Coincide con main de producto |
| Resultado de Astra en la app | Tercer plano de ejemplo en /cauce/app.html, mismo JSON sin adaptar | Publicado |
| Permisos de Cande | Configuración y pruebas previas documentadas en despliegue | Revalidar desde su propia sesión si aparece un error |

El permiso de una app de GitHub no equivale a permisos de consola del VPS ni prueba acceso a un modelo. No se modificaron permisos ni secretos al publicar este registro.

## Plan priorizado y definición de listo

### P0 — Demo completa y confiable

- [ ] **Arquitectura y contrato:** acordar una entrada de imagen + datos mínimos y una salida JSON validada que alimente el visor existente. Listo cuando una respuesta real del proveedor puede usarse sin editar código por propiedad.
- [ ] **Servidor y proveedor:** configurar el camino elegido en el VPS y probarlo con la computadora de Franco desconectada. Listo cuando una carga desde otro dispositivo termina correctamente.
- [ ] **Generación desde la plataforma:** unir carga, procesamiento, resultado y recuperación de errores. Listo cuando el equipo hace el circuito completo desde la interfaz.
- [ ] **Preguntas necesarias:** pedir una medida de referencia cuando falta escala y confirmar ambigüedades. Listo cuando no se inventan dimensiones como si estuvieran documentadas.
- [ ] **Validación y corrección:** comprobar dimensiones positivas, superposiciones, coherencia de muros y aberturas; ofrecer revisión. Listo cuando un plano con un dato ambiguo puede corregirse antes de publicar.
- [ ] **Compartir:** guardar cada propiedad con una URL propia y generar su QR. Listo cuando otro celular abre el resultado correcto sin sesión de desarrollo.
- [ ] **Despliegue:** confirmar que la versión pública corresponde al commit acordado. Listo cuando salud y prueba de interfaz coinciden con esa versión.
- [ ] **Permisos:** confirmar push, trabajo en el espacio aislado y despliegue desde el acceso de Cande. Listo cuando puede hacerlo sin permisos generales sobre otros proyectos.
- [ ] **Ensayo completo:** subir un plano nuevo, generar, revisar y abrir el QR en otro celular. Registrar duración, commit y resultado; no cerrar la tarea solo por un HTTP 200.

### P1 — Experiencia que convence

- [ ] **Diseño:** hacer evidente qué subir, qué falta y cuál es el siguiente paso.
- [ ] **Fluidez móvil:** probar controles táctiles, tiempos de carga y uso en dos celulares reales.
- [ ] **Estabilidad:** probar archivo inválido, error del proveedor y dos solicitudes simultáneas; mantener separados los resultados.
- [ ] **Avance real:** mostrar etapas respaldadas por el estado del trabajo. Si el proveedor entrega todo al final, mostrar procesamiento y luego construcción; no simular un porcentaje de IA.
- [ ] **Modelos reales:** probar al menos un plano distinto del ficticio, con medidas y aberturas, y registrar errores.
- [ ] **Recorrido premium:** revisar materiales, iluminación, puertas, cámara y guía sobre datos confirmados de la propiedad.
- [ ] **Guía y sol:** verificar los cambios recientes de Cande y señalar las orientaciones o ubicaciones asumidas.

### P2 — Presentación y potencial

- [ ] Ensayar un pitch corto con problema humano, demostración, resultado observado y próximo paso.
- [ ] Formular una hipótesis de negocio: quién paga, por qué lo usaría y qué costo tiene generar cada propiedad. No presentar ingresos o clientes no comprobados.
- [ ] Vincular los tracks a funcionalidades reales y a las bases del evento. Futuro puede ser una dimensión; no debe reemplazar el problema principal.
- [ ] Preparar un modelo ya generado como respaldo y señalarlo como tal si falla la conexión.

## Decisiones para coordinar con Cande

1. ¿Qué proveedor y autenticación usaremos en la demo? La prueba local confirma Astra en la sesión de Codex de Franco; no garantiza ese acceso desde el VPS. El código actual de lectura apunta a Anthropic. Elegir el camino con una generación verificable, sin asumir que ambas integraciones son intercambiables.
2. ¿Qué formato acepta el visor? La prueba devuelve ambientes rectangulares en metros; origen arriba a la izquierda, x hacia la derecha, y hacia abajo. Ver el esquema adjunto antes de adaptar.
3. ¿Dónde quedan trabajos y propiedades? Acordar persistencia, identificadores y rutas antes de conectar el QR.

Estas son decisiones pendientes del equipo, no cambios ya implementados.

## Coordinación permanente pedida por Franco

Antes de cada bloque de trabajo:
1. Leer el buzón, las issues y los últimos commits remotos de Cande; revisar los archivos que cambiaron.
2. Comparar esos cambios con el trabajo previsto. Coordinar cualquier solapamiento antes de editar producto.
3. Publicar sobre una referencia actualizada, sin forzar main, y conservar las entradas de otros integrantes.
4. Registrar cambios, evidencia y pendientes al terminar. Revisar nuevamente la referencia remota si pasó tiempo antes de publicar.

Esta revisión se hace al trabajar; no implica vigilancia automática mientras el chat está inactivo. El trabajo local de Cande sin subir a GitHub no es visible desde este registro.

**Buzón de conversación:** [issue #1](https://github.com/francoledesma12-bit/cauce/issues/1).
**Nuevo requisito visual:** [contraste del modelado y evidencia](CONTRASTE-3D.md).

## Cómo registrar el trabajo a partir de ahora

Cada entrega debe dejar una entrada en REGISTRO.md con fecha y hora de Argentina, objetivo, archivos o commit, pruebas realizadas, resultado, pendientes y siguiente paso. Usar estados **propuesto**, **en curso**, **probado**, **publicado** o **bloqueado**, con evidencia; publicado no significa probado.

Actualizar la tarea correspondiente y enlazar el commit o evidencia. Registrar también intentos fallidos y correcciones relevantes, sin contraseñas, claves privadas, tokens, datos personales de clientes ni logs sensibles.

Antes de publicar, actualizar la referencia remota y preservar los commits del equipo. No forzar main. Los cambios de producto deben coordinarse con Cande. Esta entrega agrega documentación y evidencia; no cambia su aplicación.

## Mensaje para la demo

> Cauce busca que una persona entienda cómo se distribuye y se recorre una propiedad antes de visitarla. Partimos de un plano, usamos IA para interpretar sus ambientes y construimos una maqueta que se puede explorar y compartir.

Hoy podemos mostrar una prueba real de ese camino con un plano simple. Cuando estén verificados la carga pública y el QR, podremos mostrar ese circuito completo. Los 14 segundos son una medición de esta prueba, no un tiempo garantizado.