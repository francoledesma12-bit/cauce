# Cauce en el VPS

URL de desarrollo compartida: https://andromedaweb.store/cauce/

La aplicación inicial usa Node.js 22 y no requiere instalar paquetes. `npm start` levanta el servidor local en http://127.0.0.1:8797/cauce/.

## Publicar cambios

Los commits enviados a `main` se despliegan automáticamente. El servidor revisa el repositorio aproximadamente cada minuto, valida la sintaxis, prepara una versión separada y comprueba su salud. Si falla, vuelve a la versión anterior. Cande ya tiene permiso de escritura en GitHub; no necesita credenciales de administrador del VPS.

Esta primera canalización publica `server.mjs`, `package.json` y `public/`. No ejecuta instalaciones ni scripts del repositorio. Si el equipo incorpora un framework, dependencias o una compilación, hay que adaptar el despliegue antes de subir esos cambios. Límite inicial de la versión: 20 MB.

Los procesos y archivos de Cauce están aislados de los otros proyectos. Los secretos se configuran únicamente en el VPS; nunca se agregan al repositorio público.

## Estado real

- Servidor y página inicial de Cauce.
- Endpoint `GET /cauce/api/health` para comprobar versión y estado.
- Generación por Astra, carga de planos, almacenamiento de trabajos y QR por propiedad: pendientes de implementación y prueba.
- El enlace a Ruiz abre un recorrido anterior del equipo, expresamente identificado como referencia.

## Operación del servidor

Servicio: `cauce.service`. Sincronización: `cauce-sync.timer` y `cauce-sync.service`.
Los archivos del proyecto viven en `/srv/cauce`; datos de ejecución en `/var/lib/cauce`; configuración privada en `/etc/cauce`.
No se da acceso de shell ni privilegios generales a los colaboradores. GitHub es el punto de colaboración y publicación.
