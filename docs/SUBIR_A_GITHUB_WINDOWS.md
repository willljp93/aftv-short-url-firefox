# Subir el proyecto a GitHub desde Windows

Usuario de GitHub: **XxXxX**. Repositorio sugerido: **aftv-short-url-firefox**.

## 1. Instalar Git y Node.js (una sola vez)

Abre **PowerShell** (menú Inicio → «PowerShell») y ejecuta:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

Cierra y vuelve a abrir PowerShell. Comprueba que funcionan:

```powershell
git --version
node --version
```

Si `winget` no existe, descarga los instaladores desde <https://git-scm.com/download/win> y <https://nodejs.org>. Node.js solo hace falta si quieres ejecutar las pruebas o `npm start` en tu equipo; para subir el proyecto basta con Git.

## 2. Crear el repositorio vacío en GitHub

1. Entra en <https://github.com/new> con tu cuenta.
2. Nombre: `aftv-short-url-firefox`. Visibilidad: **Public**.
3. **No** marques «Add a README», «.gitignore» ni «license» (el proyecto ya los trae).
4. Pulsa **Create repository**.

## 3. Preparar la carpeta

1. Descomprime `aftv-short-url-firefox-repo.zip` (clic derecho → **Extraer todo…**), por ejemplo en `C:\Users\TU_USUARIO_WINDOWS\Documents`.
2. Abre PowerShell dentro de la carpeta `aftv-short-url-firefox` (en el Explorador: clic derecho en un espacio vacío → **Abrir en Terminal**), o escribe:

```powershell
cd "$HOME\Documents\aftv-short-url-firefox"
```

## 4. Configurar tu identidad en Git (una sola vez)

```powershell
git config --global user.name "xXxXxXx"
git config --global user.email "TU_CORREO"
```

Usa el correo de tu cuenta de GitHub o el correo privado `...@users.noreply.github.com` que aparece en **GitHub → Settings → Emails**.

## 5. Subir el código

```powershell
git init -b main
git add .
git commit -m "Versión 1.2.0"
git remote add origin https://github.com/XxXxX/aftv-short-url-firefox.git
git push -u origin main
```

La primera vez, Git para Windows abre el navegador para que inicies sesión en GitHub (Git Credential Manager). GitHub ya no acepta la contraseña de la cuenta por línea de comandos; si pide un token, créalo en **Settings → Developer settings → Personal access tokens** y úsalo como contraseña.

Es normal ver avisos como `LF will be replaced by CRLF`; el proyecto incluye `.gitattributes` para que los saltos de línea no den problemas.

## 6. Publicar la primera release (zip automático)

```powershell
git tag v1.2.0
git push origin v1.2.0
```

En GitHub, pestaña **Actions**: verás el workflow **Release** en marcha. Al terminar (1-2 minutos), la pestaña **Releases** tendrá la versión `v1.2.0` con `aftv-short-url-1.2.0.zip`.

Si el workflow falla con un error 403 al crear la release: **Settings → Actions → General → Workflow permissions → Read and write permissions → Save**, y vuelve a lanzar el workflow desde **Actions → Release → Re-run all jobs**.

## 7. Nuevas versiones

1. Cambia la versión en `src/manifest.json` **y** en `package.json` (los dos iguales) y añade una entrada en `CHANGELOG.md`.
2. Sube los cambios y la etiqueta:

```powershell
git add .
git commit -m "Versión 1.3.0"
git push
git tag v1.3.0
git push origin v1.3.0
```

Si la etiqueta no coincide con las versiones, el workflow se detiene con un mensaje claro.

## Alternativa con interfaz gráfica

Instala [GitHub Desktop](https://desktop.github.com/), inicia sesión, elige **File → Add local repository…** (la carpeta descomprimida) y pulsa **Publish repository**. Para la etiqueta de release usa **Repository → Create tag…** y luego **Push origin**.

## Probar en tu equipo antes de subir (opcional)

```powershell
npm ci
npm test
npm run lint
npm start
```

`npm start` abre Firefox con la extensión cargada; hace falta Firefox instalado.
