---
name: reel-editor
description: >-
  End-to-end vertical reel editor. Takes a raw phone crudo (vertical 1080x1920)
  and produces a finished marketing reel: transcribe + cut, word-by-word
  white/orange captions (Poppins Black, slide-down from above, no stroke, warm
  glow), motion graphics (Instagram-counter growth chart + AI-tools hub), ducked
  music + SFX, rendered with Remotion to "CRUDO N - EDITADO.mp4". Use this
  whenever the user hands over a crudo / raw clip and asks to cut it, subtitle it,
  animate it with motion graphics, and add music and sounds.
---

# Reel editor — The Line Project

Full pipeline to turn a raw crudo into a finished vertical reel. The living
template is the already-built Remotion composition at
`<PROJECT>/src/Reel/Reel.tsx` — **read it first**; it is the source of truth for
every component, style and timing. This skill tells you how to drive it and what
to re-derive for each new crudo.

> `<PROJECT>` = the working copy of `maquina-edicion` created by the one-time
> setup: `~/the-line-project-editor/maquina-edicion` (macOS/Linux) or
> `%USERPROFILE%\the-line-project-editor\maquina-edicion` (Windows).
> **If that folder doesn't exist yet, the environment isn't set up — run the
> `/setup-editor` command first** (it installs ffmpeg/python/node, copies the
> project there, and runs `npm install`). If in doubt, search for `maquina-edicion`.

Style: vertical marketing reels. Colors: orange `#FF6A1A` / `#FF9330`, near-black
`#08080A`, white. Language: Argentine Spanish (voseo — "hacé", "accedé",
"apalancándonos"). Adapt copy/language to whatever the user's brand is.

## Environment (works on macOS and Windows — verify each session)

Same tools on both OSes; only the install command differs. Confirm they resolve:

- **FFmpeg / FFprobe** — macOS: `brew install ffmpeg`. Windows: `winget install Gyan.FFmpeg`. Check: `ffmpeg -version`, `ffprobe -version`.
- **Python 3** — macOS: `brew install python` (`python3`/`pip3`). Windows: `winget install Python.Python.3.12` (use `py` or the full `python.exe` path; the bare `python` alias may be the Store stub).
- **Python libs** — `pip install faster-whisper opencv-python-headless Pillow numpy` (on macOS use `pip3`). `faster-whisper` = es transcription with word timestamps. YuNet face model optional (auto face-framing) — from the OpenCV Zoo.
- **Node.js ≥ 18** — macOS: `brew install node`. Windows: `winget install OpenJS.NodeJS`.
- **Remotion project**: `<PROJECT>` (composition id `Reel`, 30fps, 1080x1920, in `src/Reel/Reel.tsx`; registered in `src/Root.tsx`). First run on a machine: `cd <PROJECT> && npm install`.
- **Render**: from the project dir, `npx remotion render src/index.ts Reel "videos/crudoN/reel_vX.mp4" --codec=h264 --crf=18` (~1 min).
- **Deliver**: copy the render next to the source crudo as `CRUDO N - EDITADO.mp4`.

## Assets living in `<PROJECT>/public/`

- **Music is NOT shipped** — drop your own royalty-free track at `public/musica.mp3` (see `public/PONE-TU-MUSICA-ACA.txt`). Without it, the reel renders fine but silent under the voice.
- `robot.png` — robot icon for the tools-hub MG. `basecut.mp4` is NOT shipped — it's the per-crudo a-roll and you regenerate it every time (step 3).
- `fonts/` — `Poppins-Black.ttf` (caption face, see below), `Montserrat-var.ttf` (fallback), `Inter-Bold.ttf`, `Inter-Regular.ttf`.
- `logos/` — `instagram.png` (counter marker), `claude.png`, `apify.png`, `heygen.png`, `elevenlabs.png` (tools hub), `hook1/2/3.png` (hook logos). Fetch new logos from `https://www.google.com/s2/favicons?domain=X&sz=256` or `https://cdn.simpleicons.org/<slug>` (Clearbit is dead); put them on white rounded tiles.
- `sfx/` — `whoosh.mp3`, `counter.mp3`, `robot.mp3`, `pop.mp3`, `impact.mp3`, `riser.mp3`.
- Optional hook PiP: a screen-recording (e.g. of a course/browser) can be added as `public/recurso.mov` and wired into the hook — not shipped; add your own if you want it.

## Pipeline (per crudo)

**1. Inspect the crudo.** `ffprobe` it. Phone clips carry a `rotation=-90` flag: ffprobe may report landscape (e.g. 3840x2160) but ffmpeg auto-rotates to portrait — the footage is ALREADY vertical, just `scale=1080:1920`, do NOT crop as if landscape.

**2. Transcribe.** Extract 16k mono wav (`ffmpeg -i crudo -ar 16000 -ac 1 out.wav`) → run faster-whisper (language `es`, `word_timestamps=True`). Voice gotcha: crudos may have a dictator BEHIND the camera (wanted voice, near the mic) and a person in front — they are NOT auto-separable. If the audio is messy, ask the user for a pre-cut clean take rather than trying to diarize.

**3. Build the cut + basecut.mp4.** From the transcript, hand-build a cut list dropping flubs, dupes and long silences. `ffmpeg` trim each keep-segment → concat → `scale=1080:1920` → `basecut.mp4` into `<PROJECT>/public/`. **Concatenation leaves hard cuts** — scene-detect them (`select='gt(scene,0.08)',metadata=print`); any hard cut inside the motion-graphics window must stay hidden under the opaque MG black (step 5). Note the exact frame length and update `durationInFrames` in `Root.tsx`.

**4. Captions — SUBS array.** The most important part. Group the transcript into **two-line compositions** `{a, b, s, e}` (a=top/white, b=bottom/orange, s/e in seconds). Each composition must read as a coherent phrase — split where it makes sense grammatically, not mid-idea. Keep lines short (1-3 words). Render style is fixed (see **Caption style**). Captions cover the whole video EXCEPT where the person is showing something on screen (`capAnchor` repositions them low/clear, or a section returns `null`).

**5. Motion graphics.** Two staged screens over continuous opaque black (`MGStage`), timed to the narration:
   - **MG1 — growth chart**: exponential curve draws in; an **Instagram logo PNG climbs the curve** as a `+count / SEGUIDORES` pill counts up. Anchor the counter to when the person says the follower claim.
   - **MG2 — AI tools hub**: a central robot in a glowing ring; tool tiles (on white tiles) pop in one-by-one with spokes, anchored to the "with AI … tools like these" line. Center vertically (no subs here).
   - `MGStage` opacity holds the black FULLY opaque past any a-roll hard cut, then fades to reveal stable footage. Re-anchor all local frame constants to the new transcript.
   - **IMPORTANT — some crudos forbid big MG.** If the person is showing their screen/laptop for most of the video, do NOT put big overlays on top (they cover the important content). Use subs-only, low and tidy, 2-3 words per line. The full-MG variant is archived in `templates/Reel.crudo1-full-mg.tsx`; a subs-only variant is the alternative.

**6. Music + SFX.** `MusicBed` = `musica.mp3` (if present) ducked to ~0.12 with fade in/out. `Sfx` cues: pop on hook beats, whoosh into MG, counter on the graph, robot on the hub reveal, pops per tool, impact on the CTA reveal.

**7. CTA.** Lower-third orange button doing a **heartbeat** (`scale(s*beat)`, two-bump lub-dub), no arrow. Captions sit above it.

**8. Render & deliver.** Render to `videos/crudoN/`, extract a few stills with ffmpeg to verify (word-by-word entrance, no subs covering the face/screen, CTA), THEN copy to `CRUDO N - EDITADO.mp4`. Always verify via stills before declaring done.

## Caption style (the approved look)

Two-line viral/Hormozi subs. **Top line WHITE and smaller, bottom line ORANGE and bigger** (hook ~64/108, CTA ~58/100). All-caps.

- **Font**: **Poppins Black 900** (`fonts/Poppins-Black.ttf`, from google/fonts `ofl/poppins`), loaded under FontFace family `"Tactic"` with `Montserrat` as CSS fallback. To swap in a different display face, replace the file and the one `file:` line in the loader.
- **NO STROKE.** No outline ever. Glyphs are gradient-filled (`WebkitBackgroundClip:"text"` + `WebkitTextFillColor:"transparent"`) and get depth from a layered `drop-shadow` (respects glyph alpha) — never `-webkit-text-stroke`.
- **Orange gloss** grad `linear-gradient(180deg,#FFB84D 0%,#FF7E1E 50%,#F25C0A 100%)`; **white** grad `#FFFFFF→#F1F3F8→#D9DCE7`.
- **Warm glow behind the block**: a blurred radial `rgba(255,125,30,…)` div behind the two lines.
- **Entrance = WORD BY WORD, not per phrase.** Each word slides DOWN from above (`translateY` negative → 0) and fades in, staggered ~3 frames via a per-word `spring`. Implementation is `CapWord` + the `appearFor(i)` stagger in `Captions`.
- Position: never over the face, and never over on-screen content the person is showing. `capAnchor(frame)` moves the block per section.

## Gotchas (consolidated)

- **ffprobe on Windows:** the Remotion `@remotion/compositor-win32-x64-msvc` may ship without `ffprobe.exe`; if a render fails with `ENOENT … ffprobe`, copy your Gyan `ffprobe.exe` into that compositor folder inside `node_modules`. On macOS the darwin compositor bundles ffprobe — nothing to do.
- **Non-ASCII project path:** OpenCV `imread`/ONNX loaders can choke on accents/spaces in the path. Keep the project in an ASCII path OR use `cv2.imdecode(np.fromfile(...))` and run ONNX models from a temp ASCII dir.
- Source rotation flag (step 1) — do not double-crop.
- `staticFile` for a missing public file doesn't throw; a failed FontFace `.load()` is caught and `continueRender`d, so a missing font/music degrades gracefully.
- Everything hardcoded to a specific crudo in `Reel.tsx` must be re-derived per crudo: `durationInFrames` (Root.tsx), all section `FROM`/`LEN` constants, all sfx cue frames, MG local anchors, and the entire `SUBS` array.

## Per-crudo checklist

- [ ] ffprobe + confirm orientation
- [ ] transcribe (es, word timestamps)
- [ ] cut list → basecut.mp4 (1080x1920) → note frame count; scene-detect hard cuts
- [ ] update `durationInFrames` (Root.tsx) + all timing constants (Reel.tsx)
- [ ] rebuild `SUBS` (coherent 2-line phrases, white/orange)
- [ ] decide MG vs subs-only (does the person show their screen the whole time?)
- [ ] re-anchor MG1 counter + MG2 hub to the narration; ensure MG black hides any hard cut
- [ ] wire logos / SFX / music (if a `musica.mp3` was added)
- [ ] render → verify stills → copy to `CRUDO N - EDITADO.mp4`
