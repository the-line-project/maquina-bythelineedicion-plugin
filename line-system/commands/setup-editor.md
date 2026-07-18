---
description: Instala las herramientas y prepara el proyecto de edición (correr una sola vez)
---

Sos el instalador del editor de reels de The Line Project. Tu tarea es dejar esta
computadora lista para editar, corriendo el script de setup correcto según el
sistema operativo. Hacé esto:

1. Detectá el sistema operativo (usá el Bash tool: `uname` en Mac/Linux; en
   Windows usá PowerShell).

2. Corré el script de setup que viene con el plugin:
   - **macOS / Linux:**
     ```bash
     bash "${CLAUDE_PLUGIN_ROOT}/setup-mac.sh"
     ```
   - **Windows (PowerShell):**
     ```powershell
     powershell -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/setup-windows.ps1"
     ```

   El script instala ffmpeg, python, node y las librerías de IA, copia el proyecto
   Remotion a una carpeta de trabajo (`~/the-line-project-editor/maquina-edicion`)
   y corre `npm install`.

3. Si alguna herramienta no queda en el PATH (típico en Windows la primera vez),
   avisale al usuario que cierre y reabra la terminal / Claude Code y vuelva a
   correr `/setup-editor` — el script retoma sin romper nada.

4. Cuando termine, confirmale al usuario la ruta del proyecto de trabajo y decile
   que ya puede editar diciendo: "Editá este crudo en nuestro estilo: <ruta al video>".

No inventes rutas ni claves. Este editor es 100% local y no usa ninguna API paga.
