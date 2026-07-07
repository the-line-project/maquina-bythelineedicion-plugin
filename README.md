# 🎬 The Line Project · Máquina de Edición (plugin de Claude Code)

Editor de reels verticales con IA. Le tirás un crudo (video vertical de celular)
y te devuelve un reel terminado: **cortes + subtítulos dinámicos palabra por
palabra + motion graphics + música + efectos**. 100% local, sin APIs pagas.

Este repo es un **marketplace de Claude Code**: tus alumnos instalan el editor
con dos comandos, sin descargar nada a mano.

---

## 🚀 Instalación (para alumnos)

Necesitás **Claude Code** (app de escritorio o terminal). Adentro de Claude Code,
escribí:

```
/plugin marketplace add TU-USUARIO/maquina-edicion-plugin
```
```
/plugin install reel-editor
```

> Reemplazá `TU-USUARIO` por el usuario/repo de GitHub donde esté publicado.

Después, **la primera vez**, preparás la máquina (instala las herramientas y el
motor de render) con:

```
/setup-editor
```

Eso instala ffmpeg, Python, Node y deja el proyecto listo. Tarda ~10-15 min una
sola vez (es Claude quien lo hace por vos).

---

## ✏️ Cómo se usa

Adentro de Claude Code, pedile:

> "Editá este crudo en nuestro estilo: /ruta/a/mi-video.mp4"

Y hace todo: **transcribe → corta → subtítulos blanco/naranja palabra por palabra
→ motion graphics (o subs-only) → música + efectos → render → te entrega
`CRUDO N - EDITADO.mp4`**.

Escribí `/reel-editor` para ver la skill, o `/setup-editor` si necesitás preparar
el entorno de nuevo.

---

## 🎵 Música

La máquina **no trae música** (por derechos de autor). Poné tu propia pista
royalty-free en `~/the-line-project-editor/maquina-edicion/public/musica.mp3`
(instrucciones en el `PONE-TU-MUSICA-ACA.txt` de esa carpeta). Sin música, el reel
igual se renderiza con la voz sola.

---

## 📂 Qué hay adentro

```
maquina-edicion-plugin/            ← este repo = marketplace
├── .claude-plugin/marketplace.json
└── reel-editor/                   ← el plugin
    ├── .claude-plugin/plugin.json
    ├── skills/reel-editor/        ← la skill (el "cómo editar")
    ├── commands/setup-editor.md   ← comando /setup-editor
    ├── maquina-edicion/           ← proyecto Remotion (motor)
    ├── setup-mac.sh
    └── setup-windows.ps1
```

Funciona en **macOS y Windows**. No incluye `node_modules` (se instala en el
`/setup-editor`) ni música (la pone cada uno).
