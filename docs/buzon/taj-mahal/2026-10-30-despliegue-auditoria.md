# Taj Mahal: talles y cantidades — entrega de Luz

30/10/2026 · pedido de Franco · para Cande y Claude.

Se integraron los archivos de Cande y se amplió la implementación:

- Panel: botones XS, S, M, L, XL y XXL; también escritura libre y número opcional por fila de color/cantidad. Talle visible en el listado; sin U abreviada.
- Web: combinación color/talle, sin contador de prendas ni «Queda 1 en este color»; se conserva «Agotada».
- Sincronización: combina color y talle en el valor de la variante existente de Tiendanube, conservando su identificador y stock. No crea un segundo atributo ni asigna cantidades automáticamente.
- Productos sin talles conservan su comportamiento. Una fila representa una combinación y su cantidad real.

Web publicada `r-20261030-051032-e5d6f8`; panel `r-20261030-020717-882ff8`. Publicadores confirmados. Pruebas de API y navegador móvil, guardado/reapertura y opciones agotadas; archivos web comprobados por HTTPS. Se verificó el ID de la combinación enviada al checkout interceptando la solicitud, sin crear pedido. No se hizo una compra real ni una modificación de talles de un producto real en Tiendanube: falta esa comprobación funcional con datos reales antes de dar por validado el cobro con talles.

## Informe y acceso

Este repositorio es público. La auditoría de infraestructura, respaldos y guía completa de acceso quedaron en el espacio privado de Taj:

`/workspace/documentacion/2026-10-30-auditoria-y-talles.txt`

También hay una nota en `/workspace/inbox/2026-10-30-luz-despliegue-y-auditoria.md`.

Con la llave privada propia ya autorizada y el host de Taj configurado:

```sh
sftp -i RUTA_A_SU_CLAVE candela_taj@SERVIDOR_TAJ
cd /workspace
get documentacion/2026-10-30-auditoria-y-talles.txt
```

Consola: `ssh -t -i RUTA_A_SU_CLAVE candela_taj_lab@SERVIDOR_TAJ`, luego `taj ayuda`. La primera cuenta es para SFTP; la segunda entra al laboratorio de Taj. Un conector GitHub no proporciona por sí solo SSH ni la llave privada. No subir llaves al repositorio.

Leer esta actualización antes que las guías históricas de demo: la web y el panel actuales son productivos. Descargar código vigente antes de editar. Los servicios del host requieren despliegue administrativo; no hace falta ni corresponde usar root desde la consola confinada.

La invitación GitHub a `candepilar` en `taj-mahal-catalogo-ia` se envió con escritura y estaba pendiente de aceptación al verificar. El código operativo vigente está en el workspace privado del VPS.


Actualización: portada y llamadas a la acción dicen «Nuestros productos»; se revisaron los tres banners y catálogo renderizados. Botones finales XS a XXL, sin XXS/XXXL. Informe privado ampliado con pruebas de acceso anónimo y respaldo SQLite. No equivale a restauración total ni auditoría completa entre cuentas.
