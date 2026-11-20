# Publicar de verdad en Firefox (`.xpi` firmado)

## Qué hay que entender primero

Firefox estable **solo instala de forma permanente extensiones firmadas por Mozilla**. El `.zip` de las releases sirve para probar (instalación temporal en `about:debugging`), pero desaparece al cerrar Firefox. Para instalarla «de verdad» necesitas un **`.xpi` firmado**. La firma es gratuita.

Hay dos caminos:

| | A) Sin listar | B) Listada en addons.mozilla.org (AMO) |
| --- | --- | --- |
| Qué obtienes | Un `.xpi` firmado que distribuyes tú (en GitHub Releases) | Una página pública en AMO con botón «Añadir a Firefox» |
| Revisión de Mozilla | Comprobaciones automáticas, normalmente en minutos | Revisión que puede tardar de horas a varios días |
| Actualizaciones | Manuales: instalas el `.xpi` nuevo | Automáticas para todos los usuarios |
| Ideal para | Uso personal o compartirla con conocidos | Difusión pública |
| Automatizable con GitHub Actions | Sí, ya está configurado | No, se sube a mano desde el panel de AMO |

Recomendación: empieza por **A**. Si más adelante quieres difusión pública, haz **B**.

## Camino A: `.xpi` firmado sin listar

### 1. Cuenta de desarrollador

1. Entra en <https://addons.mozilla.org> y pulsa **Iniciar sesión** (usa una cuenta de Firefox; es gratis).
2. Si te lo pide, acepta el acuerdo de distribución para desarrolladores.

### 2. El ID de la extensión

El manifiesto ya trae el ID `aftv-short-url@willljp93.github.io` (`browser_specific_settings.gecko.id`). Es único en AMO y **no debe cambiar nunca**: Mozilla vincula todas las versiones a ese ID.

### 3. Claves de API

1. Abre <https://addons.mozilla.org/developers/addon/api/key/>.
2. Pulsa **Generate new credentials**.
3. Obtienes dos valores:
   - **JWT issuer**, parecido a `user:12345678:123`.
   - **JWT secret**, una cadena larga.
4. Guárdalos como si fueran contraseñas. No los pongas nunca en el código ni en el repositorio.

### 4. Guardarlas en GitHub

En tu repositorio: **Settings → Secrets and variables → Actions → New repository secret**. Crea dos secretos con estos nombres exactos:

| Nombre | Valor |
| --- | --- |
| `AMO_JWT_ISSUER` | el JWT issuer |
| `AMO_JWT_SECRET` | el JWT secret |

### 5. Publicar una versión

Sube la versión (en `src/manifest.json`, `package.json` y `CHANGELOG.md`), crea la etiqueta y súbela:

```powershell
git tag v1.3.0
git push origin v1.3.0
```

El workflow **Release** genera el zip, lo firma en AMO (canal `unlisted`) y adjunta a la release el `.zip` y el `.xpi` firmado. La primera firma crea la extensión en tu cuenta de AMO automáticamente.

### 6. Instalarla en Firefox

1. Abre la release en GitHub y descarga el archivo **`.xpi`** (no el `.zip`).
2. Ábrelo con Firefox o arrástralo a una ventana de Firefox y pulsa **Añadir**.

Queda instalada de forma permanente.

### Cosas que conviene saber

- **Cada versión necesita un número nuevo.** AMO rechaza firmar dos veces la misma versión.
- Si la firma falla, el workflow publica igualmente el `.zip` y verás el error en el registro de **Actions**.
- Una extensión sin listar **no se actualiza sola**. Para eso hay que añadir `update_url` al manifiesto y alojar un `updates.json` (por ejemplo en GitHub Pages). Es opcional y se puede añadir más adelante.

### Firmar desde tu equipo (opcional)

```powershell
$env:WEB_EXT_API_KEY = "TU_JWT_ISSUER"
$env:WEB_EXT_API_SECRET = "TU_JWT_SECRET"
npm run sign
```

El `.xpi` queda en `dist-signed\`.

## Camino B: listada en addons.mozilla.org

1. Entra en <https://addons.mozilla.org/developers/> y elige **Submit a New Add-on**.
2. Elige **On this site** (distribución listada) y sube el `.zip` de la release (o `dist/` si lo compilas en tu equipo).
3. Compatibilidad: solo **Firefox para escritorio**. La palabra clave de la barra de direcciones no existe en Android.
4. Código fuente: no hace falta enviarlo, porque la extensión no está minificada ni generada. Si Mozilla lo pide, indica el repositorio.
5. Rellena la ficha:
   - Nombre, resumen (hasta 250 caracteres) y descripción.
   - Categoría, licencia (MIT) y correo de soporte.
   - Capturas: usa `docs/img/popup.png`.
   - Datos: la extensión no recopila ninguno (el manifiesto ya lo declara).
6. En las **notas para el revisor**, explica los permisos de host: `aftv.news` y `go.aftvnews.com` son los servidores del acortador, y se consultan solo cuando el usuario pulsa «Ver destino» o activa abrir directo.
7. Envía y espera la revisión. Cuando se apruebe, aparecerá en AMO. Cada versión nueva se sube igual y también se revisa.

Nombre: AMO no permite insinuar que el proyecto es oficial. Conviene un nombre como **«Short URL Opener para AFTVnews (no oficial)»** y dejar claro en la descripción que no está afiliado a AFTVnews.

## Problemas frecuentes

| Síntoma | Causa y solución |
| --- | --- |
| `Version already exists` al firmar | Esa versión ya se firmó. Sube el número de versión. |
| `Add-on ID already taken` | Otro desarrollador usa ese ID. Cambia `gecko.id` en el manifiesto **antes** de la primera firma. |
| Firefox dice «archivo dañado» al instalar | Estás instalando el `.zip` sin firmar. Usa el `.xpi`. |
| La release no incluye `.xpi` | Faltan los secretos `AMO_JWT_ISSUER` y `AMO_JWT_SECRET`, o la firma falló. Mira el registro del paso de firma en **Actions**. |

## Sin firma (solo desarrollo)

En Firefox Developer Edition, Nightly o ESR puedes poner `xpinstall.signatures.required` en `false` (`about:config`) e instalar el `.zip` desde **Complementos → Instalar complemento desde archivo…**. En Firefox estable este ajuste no tiene efecto.
