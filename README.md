# 🎬 Line System · The Line Project (plugin de Claude Code)

Sistema de edición de reels verticales con IA. Le tirás un crudo (video vertical
de celular) y te devuelve un reel terminado: **cortes + subtítulos dinámicos
palabra por palabra + motion graphics + música + efectos**. 100% local, sin APIs
pagas.

Incluye un **catálogo visual de estilos** (motion graphics, subtítulos y b-rolls)
que se te muestra como guía la primera vez, para que veas qué se puede lograr y
elijas.

Este repo es un **marketplace de Claude Code**: tus alumnos instalan el sistema
con dos comandos, sin descargar nada a mano.

---

## 🚀 Instalación (para alumnos)

Necesitás **Claude Code** (app de escritorio o terminal). Adentro de Claude Code,
escribí:

```
/plugin marketplace add the-line-project/maquina-bythelineedicion-plugin
```
```
/plugin install line-system@the-line-project
```

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

La **primera vez** te muestra el **catálogo de estilos** como guía. Después hace
todo: **transcribe → corta → subtítulos palabra por palabra → motion graphics (o
subs-only) → música + efectos → render → te entrega `CRUDO N - EDITADO.mp4`**.

- `/line-system` — abre el sistema y su catálogo de estilos (la guía).
- `/setup-editor` — prepara (o repara) el entorno de render.

---

## 🎵 Música

El sistema **no trae música** (por derechos de autor). Poné tu propia pista
royalty-free en `~/the-line-project-editor/maquina-edicion/public/musica.mp3`
(instrucciones en el `PONE-TU-MUSICA-ACA.txt` de esa carpeta). Sin música, el reel
igual se renderiza con la voz sola.

---

## 📂 Qué hay adentro

```
maquina-edicion-plugin/            ← este repo = marketplace
├── .claude-plugin/marketplace.json
└── line-system/                   ← el plugin
    ├── .claude-plugin/plugin.json
    ├── skills/
    │   ├── line-system/           ← la guía + catálogo (catalogo.html)
    │   └── reel-editor/           ← el "cómo editar" (producción Remotion)
    ├── commands/setup-editor.md   ← comando /setup-editor
    ├── maquina-edicion/           ← proyecto Remotion (motor)
    ├── setup-mac.sh
    └── setup-windows.ps1
```

Funciona en **macOS y Windows**. No incluye `node_modules` (se instala en el
`/setup-editor`) ni música (la pone cada uno).
