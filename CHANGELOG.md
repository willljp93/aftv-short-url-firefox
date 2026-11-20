# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado [SemVer](https://semver.org/lang/es/).

## [1.2.0] - 2026-11-19

### Añadido
- Opción «Abrir directo al destino, sin pasar por el acortador» (se recuerda y también la respeta la barra de direcciones).
- Botón para alternar entre modo claro y oscuro (por defecto sigue el tema del sistema).
- Pruebas automáticas, CI y publicación automática del zip en GitHub Releases.
- Documentación: guía para subir el proyecto desde Windows, guía de firma y publicación en Firefox, captura del popup.

### Cambiado
- El rótulo del campo ahora es «Código o Short URL de AFTVnews (Downloader)».
- Versión mínima de Firefox: 142.

## [1.1.0] - 2026-11-19

### Añadido
- «Ver destino» muestra la URL final real (leída de la página intermedia del acortador), no solo `go.aftvnews.com/código`.
- El último código escrito se conserva al reabrir el popup.
- Botón circular con una X para borrar el campo.

## [1.0.0] - 2026-11-19

### Añadido
- Popup para escribir un código o Short URL de AFTVnews y abrirlo en una pestaña nueva.
- Palabra clave `aftv` en la barra de direcciones y atajo `Alt+Shift+A`.
