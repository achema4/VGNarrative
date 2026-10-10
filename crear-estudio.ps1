param(
    [string]$ProjectPath = "C:\Proyectos\VGNarrative"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== INSTALACION LIMPIA DE VGNARRATIVE ===" `
    -ForegroundColor Cyan

$ProjectPath = [System.IO.Path]::GetFullPath($ProjectPath)

# Impedir rutas peligrosas o demasiado generales
$allowedPath = "C:\Proyectos\VGNarrative"

if ($ProjectPath.TrimEnd('\') -ne $allowedPath) {
    throw "Por seguridad, este script solo puede limpiar $allowedPath"
}

# Confirmar que el directorio existe
if (-not (Test-Path $ProjectPath -PathType Container)) {
    New-Item -ItemType Directory -Path $ProjectPath -Force |
        Out-Null
}

# Confirmar antes de eliminar archivos
Write-Host "Se limpiara el contenido de: $ProjectPath" `
    -ForegroundColor Yellow

$confirmation = Read-Host "Escribe LIMPIAR para continuar"

if ($confirmation -cne "LIMPIAR") {
    Write-Host "Operacion cancelada."
    exit 0
}

# Conservar el script que estamos ejecutando.
# Eliminar el resto de archivos y carpetas del proyecto.
$runningScript = [System.IO.Path]::GetFullPath($PSCommandPath)

Get-ChildItem -LiteralPath $ProjectPath -Force |
    Where-Object {
        $_.FullName -ne $runningScript
    } |
    Remove-Item -Recurse -Force

Write-Host "Contenido anterior eliminado." -ForegroundColor Green

# 1. Comprobar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js no esta instalado. Descargalo desde https://nodejs.org/"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "No se encuentra npm."
}

$nodeVersion = node -p "process.versions.node"
$major = [int]($nodeVersion.Split('.')[0])

if ($major -lt 22) {
    throw "Se necesita Node.js 22 o superior. Version actual: $nodeVersion"
}

Write-Host "Node.js $nodeVersion detectado." -ForegroundColor Green

# 2. Preparar la carpeta
if (-not (Test-Path $ProjectPath)) {
    New-Item -ItemType Directory -Path $ProjectPath -Force |
        Out-Null
}

if (Test-Path (Join-Path $ProjectPath "package.json")) {
    throw "Ya existe package.json en $ProjectPath. No se sobrescribira."
}

Set-Location $ProjectPath

$directories = @(
    "src\pug",
    "src\scss",
    "src\ts",
    "public\icons"
)

foreach ($directory in $directories) {
    New-Item -ItemType Directory -Path $directory -Force |
        Out-Null
}

# 3. Configurar package.json
@'
{
  "name": "vgnarrative",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "pug:build": "pug --pretty src/pug/index.pug --out .",
    "predev": "npm run pug:build",
    "dev": "concurrently -k \"pug --watch src/pug/index.pug --out .\" \"vite --host 0.0.0.0\"",
    "build": "npm run pug:build && tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "android:add": "cap add android",
    "android:sync": "npm run build && cap sync android",
    "android": "npm run android:sync && cap open android"
  }
}
'@ | Set-Content -Encoding utf8 package.json

# 4. Configurar TypeScript
@'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": [
      "vite/client",
      "vite-plugin-pwa/client"
    ]
  },
  "include": ["src/ts/**/*.ts"]
}
'@ | Set-Content -Encoding utf8 tsconfig.json

# 5. Configurar Vite y PWA
@'
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'VGNarrative',
        short_name: 'VGNarrative',
        description: 'Editor narrativo multiplataforma',
        theme_color: '#3157a4',
        background_color: '#f4f6f8',
        display: 'standalone',
        start_url: './',
        icons: [
          {
            src: './icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ]
});
'@ | Set-Content -Encoding utf8 vite.config.ts

# 6. Configurar Capacitor
@'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ejemplo.vgnarrative',
  appName: 'VGNarrative',
  webDir: 'dist'
};

export default config;
'@ | Set-Content -Encoding utf8 capacitor.config.ts

# 7. Crear la pagina Pug
@'
doctype html
html(lang="es")
  head
    meta(charset="UTF-8")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    meta(name="theme-color", content="#3157a4")
    title VGNarrative
  body
    main.contenedor
      h1 VGNarrative
      p Mi estudio de desarrollo web y aplicaciones moviles.
      button#saludar-btn(type="button") Probar aplicacion
      p#resultado(aria-live="polite")
    script(type="module", src="/src/ts/main.ts")
'@ | Set-Content -Encoding utf8 src\pug\index.pug

# 8. Crear los estilos SCSS
@'
$color-principal: #3157a4;
$color-fondo: #f4f6f8;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: $color-fondo;
  color: #222;
}

.contenedor {
  width: min(100% - 32px, 600px);
  margin: 48px auto;
  text-align: center;
}

h1 {
  color: $color-principal;
}

button {
  padding: 12px 20px;
  border: 0;
  border-radius: 8px;
  background: $color-principal;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}
'@ | Set-Content -Encoding utf8 src\scss\style.scss

# 9. Crear TypeScript
@'
import '../scss/style.scss';

const boton = document.querySelector<HTMLButtonElement>(
  '#saludar-btn'
);

const resultado = document.querySelector<HTMLParagraphElement>(
  '#resultado'
);

boton?.addEventListener('click', () => {
  if (resultado) {
    resultado.textContent = 'VGNarrative funciona correctamente.';
  }
});
'@ | Set-Content -Encoding utf8 src\ts\main.ts

# 10. Crear un icono SVG
@'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#3157a4"/>
  <text x="256" y="300" text-anchor="middle"
        font-family="sans-serif" font-size="150"
        font-weight="bold" fill="#ffffff">VGN</text>
</svg>
'@ | Set-Content -Encoding utf8 public\icons\icon.svg

# 11. Crear .gitignore
@'
node_modules/
dist/
android/
.DS_Store
'@ | Set-Content -Encoding utf8 .gitignore

# 12. Instalar dependencias
Write-Host "`nInstalando dependencias..." -ForegroundColor Cyan

npm install -D vite typescript sass pug-cli concurrently vite-plugin-pwa @capacitor/cli

if ($LASTEXITCODE -ne 0) {
    throw "Fallo la instalacion de dependencias de desarrollo."
}

npm install @capacitor/core @capacitor/android

if ($LASTEXITCODE -ne 0) {
    throw "Fallo la instalacion de Capacitor."
}

# 13. Compilar la primera version web
Write-Host "`nCompilando la aplicacion..." -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -ne 0) {
    throw "La compilacion fallo. Revisa los errores anteriores."
}

Write-Host "`nESTUDIO CREADO CORRECTAMENTE" -ForegroundColor Green
Write-Host "Proyecto: $ProjectPath"
Write-Host ""
Write-Host "Abrir en VS Code:"
Write-Host "  code `"$ProjectPath`""
Write-Host ""
Write-Host "Iniciar servidor:"
Write-Host "  cd `"$ProjectPath`""
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Anadir Android (solo la primera vez):"
Write-Host "  npm run android:add"
Write-Host ""
Write-Host "Sincronizar y abrir Android Studio:"
Write-Host "  npm run android"