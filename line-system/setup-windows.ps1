# ============================================================================
#  Setup — reel-editor plugin (Windows)
#  Instala el toolchain, copia el proyecto Remotion a una carpeta de trabajo
#  y corre npm install. La skill la provee el plugin (no se copia acá).
# ============================================================================
$ErrorActionPreference = "Stop"
$PluginRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Work = Join-Path $env:USERPROFILE "the-line-project-editor"
Write-Host "==> Plugin: $PluginRoot" -ForegroundColor Cyan
Write-Host "==> Carpeta de trabajo: $Work" -ForegroundColor Cyan

function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# --- 1. Herramientas base con winget ---
if (-not (Have winget)) {
  Write-Host "!! No tenés winget. Actualizá 'App Installer' desde la Microsoft Store y volvé a correr /setup-editor." -ForegroundColor Red
  exit 1
}
Write-Host "==> Instalando ffmpeg, python y node con winget (si faltan)..." -ForegroundColor Cyan
winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements 2>$null
winget install --id Python.Python.3.12 -e --accept-source-agreements --accept-package-agreements 2>$null
winget install --id OpenJS.NodeJS -e --accept-source-agreements --accept-package-agreements 2>$null

# --- 2. Librerías de Python ---
$py = $null
foreach ($c in @("python","py","python3")) { if (Have $c) { $py = $c; break } }
if ($py) {
  Write-Host "==> Instalando librerías de Python con '$py'..." -ForegroundColor Cyan
  & $py -m pip install --upgrade pip
  & $py -m pip install faster-whisper opencv-python-headless Pillow numpy
} else {
  Write-Host "!! Python no está en el PATH todavía. Cerrá y reabrí la terminal y volvé a correr /setup-editor." -ForegroundColor Yellow
}

# --- 3. Copiar el proyecto Remotion a la carpeta de trabajo ---
New-Item -ItemType Directory -Force -Path $Work | Out-Null
$dest = Join-Path $Work "maquina-edicion"
if (-not (Test-Path $dest)) {
  Write-Host "==> Copiando el proyecto Remotion a la carpeta de trabajo..." -ForegroundColor Cyan
  Copy-Item -Recurse -Force (Join-Path $PluginRoot "maquina-edicion") $dest
} else {
  Write-Host "==> Ya existía $dest (no lo piso)." -ForegroundColor Yellow
}

# --- 4. npm install ---
if (Have npm) {
  Write-Host "==> npm install..." -ForegroundColor Cyan
  Push-Location $dest
  npm install
  Pop-Location
} else {
  Write-Host "!! npm no está en el PATH todavía. Cerrá y reabrí la terminal y volvé a correr /setup-editor." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  LISTO. Editor preparado." -ForegroundColor Green
Write-Host "  Proyecto de trabajo: $dest"
Write-Host "  (Opcional) Pone tu musica en public\musica.mp3 — ver PONE-TU-MUSICA-ACA.txt"
Write-Host "  Ahora pedile a Claude: 'Edita este crudo en nuestro estilo: <ruta>'"
Write-Host "============================================================" -ForegroundColor Green
