# Cauce en el VPS

URL de desarrollo compartida: https://andromedaweb.store/cauce/

La aplicación inicial usa Node.js 22 y no requiere instalar paquetes. `npm start` levanta el servidor local en http://127.0.0.1:8797/cauce/.

## Publicar cambios

Los commits enviados a `main` se despliegan automáticamente. El servidor revisa el repositorio aproximadamente cada minuto, valida la sintaxis, prepara una versión separada y comprueba su salud. Si falla, vuelve a la versión anterior. Cande ya tiene permiso de escritura en GitHub; no necesita credenciales de administrador del VPS.

Esta primera canalización publica `server.mjs`, `package.json` y `public/`. No ejecuta instalaciones ni scripts del repositorio. Si el equipo incorpora un framework, dependencias o una compilación, hay que adaptar el despliegue antes de subir esos cambios. Límite inicial de la versión: 20 MB.

Los procesos y archivos de Cauce están aislados de los otros proyectos. Los secretos se configuran únicamente en el VPS; nunca se agregan al repositorio público.

## Estado real

- Servidor, página inicial y app 3D en `/cauce/app.html`.
- Endpoint `GET /cauce/api/health` para comprobar versión y estado.
- Modelos de ejemplo y navegación 3D publicados desde los cambios de Cande.
- El código de lectura de planos usa actualmente Anthropic; requiere configurar una clave del proyecto en el servidor y probar una generación real. La API pública de salud informa si la clave está configurada.
- Almacenamiento de trabajos y QR por propiedad: pendientes de implementación y prueba.
- El enlace a Ruiz abre un recorrido anterior del equipo, expresamente identificado como referencia.

## Operación del servidor

Servicio: `cauce.service`. Sincronización: `cauce-sync.timer` y `cauce-sync.service`.
Los archivos del proyecto viven en `/srv/cauce`; datos de ejecución en `/var/lib/cauce`; configuración privada en `/etc/cauce`.
Candela tiene una consola aislada para Cauce, con Node, npm y Git y escritura únicamente en su espacio de trabajo. Los datos de conexión se entregan por separado; se reutiliza su clave pública existente de Taj Mahal. No tiene shell de administrador ni acceso al socket de Docker.

Dentro de esa consola, la copia de trabajo está en `/work/cauce`. Los cambios no publicados del equipo se preservan: la sincronización de producción usa otra copia del repositorio.

```bash
git pull --ff-only
# Editar src/app.html si se cambia la aplicación 3D.
node scripts/build.mjs
npm run check
git status
# Agregar los archivos modificados, crear el commit y hacer git push.
```

El workspace de desarrollo tiene una cuota inicial de 768 MB y la consola, un límite de 256 MB de RAM. La clave de publicación de la consola permite escribir únicamente en este repositorio.

Además de los comandos de desarrollo, se admiten cuatro operaciones enviadas como comando SSH: `cauce status`, `cauce logs`, `cauce restart` y `cauce deploy`. Actúan exclusivamente sobre Cauce. No son comandos del shell interactivo del contenedor.
