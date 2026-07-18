#!/bin/bash
# ============================================================================
#  Setup — reel-editor plugin (macOS)
#  Instala el toolchain, copia el proyecto Remotion a una carpeta de trabajo
#  y corre npm install. La skill la provee el plugin (no se copia acá).
# ============================================================================
set -e

PLUGIN_ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="$HOME/the-line-project-editor"
echo "==> Plugin: $PLUGIN_ROOT"
echo "==> Carpeta de trabajo: $WORK"

# --- 1. Homebrew ---
if ! command -v brew >/dev/null 2>&1; then
  echo "==> Instalando Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
  if [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"; fi
fi

# --- 2. Herramientas base ---
echo "==> Instalando ffmpeg, python, node (si faltan)..."
brew install ffmpeg python node || true

# --- 3. Librerías de Python ---
echo "==> Instalando librerías de Python..."
if ! pip3 install faster-whisper opencv-python-headless Pillow numpy 2>/dev/null; then
  pip3 install --break-system-packages faster-whisper opencv-python-headless Pillow numpy
fi

# --- 4. Copiar el proyecto Remotion a la carpeta de trabajo ---
mkdir -p "$WORK"
if [ ! -d "$WORK/maquina-edicion" ]; then
  echo "==> Copiando el proyecto Remotion a la carpeta de trabajo..."
  cp -R "$PLUGIN_ROOT/maquina-edicion" "$WORK/maquina-edicion"
else
  echo "==> Ya existía $WORK/maquina-edicion (no lo piso)."
fi

# --- 5. npm install ---
echo "==> npm install..."
cd "$WORK/maquina-edicion"
npm install

echo ""
echo "============================================================"
echo "  LISTO. Editor preparado."
echo "  Proyecto de trabajo: $WORK/maquina-edicion"
echo "  (Opcional) Poné tu música en public/musica.mp3 — ver PONE-TU-MUSICA-ACA.txt"
echo "  Ahora pedile a Claude: 'Editá este crudo en nuestro estilo: <ruta>'"
echo "============================================================"
