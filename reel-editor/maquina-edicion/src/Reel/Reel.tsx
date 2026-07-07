import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
} from "remotion";
/* ----------------------------- fonts ----------------------------- */
const BOLD = "InterBold";
const REG = "InterReg";
// Caption face: user asked for Tactic Sans Black (commercial, can't fetch it
// legally) so we use Poppins Black (900) — the closest free geometric heavy
// sans. Swap the file below for TacticSans if the user ever provides it.
const CAP = "Tactic";
const CAP_STACK = "'Tactic','Montserrat',sans-serif";
(() => {
  if (typeof document === "undefined") return;
  const specs: { fam: string; file: string; desc?: FontFaceDescriptors }[] = [
    { fam: BOLD, file: "fonts/Inter-Bold.ttf" },
    { fam: REG, file: "fonts/Inter-Regular.ttf" },
    { fam: "Montserrat", file: "fonts/Montserrat-var.ttf", desc: { weight: "100 900" } },
    { fam: CAP, file: "fonts/Poppins-Black.ttf", desc: { weight: "900" } },
  ];
  for (const s of specs) {
    const h = delayRender(`font-${s.fam}`);
    const f = new FontFace(s.fam, `url('${staticFile(s.file)}')`, s.desc);
    f.load()
      .then((loaded) => {
        (document.fonts as FontFaceSet).add(loaded);
        continueRender(h);
      })
      .catch(() => continueRender(h));
  }
})();

/* ----------------------------- theme ----------------------------- */
const ORANGE = "#FF6A1A";
const ORANGE2 = "#FF9330";
const BLACK = "#08080A";
const WHITE = "#FFFFFF";
const FPS = 30;

/* --------------------------- helpers ----------------------------- */
const sp = (frame: number, delay: number, config?: Parameters<typeof spring>[0]["config"]) =>
  spring({ frame: frame - delay, fps: FPS, config: config ?? { damping: 14, mass: 0.7 } });

/* ==================================================================
   CRUDO 3 — "13 herramientas me editaron un video" demo reel.
   The person shows his laptop screen (his own edited reel) almost the
   whole time, so per the user: NO big motion graphics / nothing large
   that covers the screen. Just 3 tool logos above his head in the hook,
   low + tidy word-by-word subs (2-3 words, near the chin over a-roll /
   low over the laptop so they never cover the demo), and the class
   screenshot on the outro CTA. ~22.7s / 681 frames @30fps.

   Sections (abs frames):  HOOK 0-110 (person) · DEMO 110-588 (laptop)
                           · OUTRO 588-681 (person + class card)
   ================================================================== */

/* ------------------------- progress bar -------------------------- */
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start" }}>
      <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,0.14)" }}>
        <div style={{ height: "100%", width: `${p * 100}%`, background: ORANGE }} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------ hook logos (above the head) ------------------ */
// "Estas 13 herramientas acá arriba..." — 3 tool tiles pop in above his
// head, plus a small "+10" chip so it reads as 13. They fade out before
// the laptop demo starts. Kept small so they sit in the empty space over
// his head and never cover his face.
const HOOK_LOGOS = ["logos/hook1.png", "logos/hook2.png", "logos/hook3.png"];
const HookLogos: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [90, 104], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div style={{ marginTop: 138, display: "flex", gap: 22, alignItems: "center", opacity: out }}>
        {HOOK_LOGOS.map((f, i) => {
          const s = sp(frame, 8 + i * 5, { damping: 12, mass: 0.8 });
          return (
            <div
              key={f}
              style={{
                width: 124,
                height: 124,
                borderRadius: 28,
                background: WHITE,
                boxShadow: "0 14px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `translateY(${(1 - s) * -44}px) scale(${s})`,
                opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              <Img src={staticFile(f)} style={{ width: 92, height: 92, objectFit: "contain" }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* --------------------- class card (outro CTA) -------------------- */
// "Comentá acá abajo EDICIÓN y te envío una clase" — the class screenshot
// drops in at the TOP of the frame, above the person's head, so it never
// covers his face. Local frame (its own Sequence).
const ClassCard: React.FC = () => {
  const f = useCurrentFrame();
  const s = sp(f, 2, { damping: 15, mass: 0.9 });
  const op = interpolate(f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div
        style={{
          marginTop: 46,
          width: 648,
          transform: `translateY(${(1 - s) * -56}px) scale(${0.92 + s * 0.08})`,
          opacity: op,
          borderRadius: 22,
          overflow: "hidden",
          border: "5px solid rgba(255,255,255,0.95)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.72)",
          background: BLACK,
        }}
      >
        <Img src={staticFile("clase.png")} style={{ width: "100%", display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------- captions ---------------------------- */
// Two-line word-by-word "viral" captions (Poppins Black, top WHITE /
// bottom ORANGE). Grouped as short coherent 2-3 word phrases — the user
// wants them "bajitos y prolijos", never covering what's on screen.
type Comp = { a: string; b: string; s: number; e: number };
const SUBS: Comp[] = [
  { a: "ESTAS 13", b: "HERRAMIENTAS", s: 0.0, e: 0.86 },
  { a: "ACÁ", b: "ARRIBA", s: 0.88, e: 1.18 },
  { a: "ME ACABAN", b: "DE EDITAR", s: 1.2, e: 1.9 },
  { a: "TODO UN", b: "VIDEO", s: 1.92, e: 2.44 },
  { a: "EN", b: "AUTOMÁTICO", s: 2.46, e: 3.0 },
  { a: "MIRÁ", b: "TE MUESTRO", s: 3.02, e: 3.66 },
  { a: "MIRÁ", b: "ESTO", s: 3.86, e: 4.6 },
  { a: "UNA CAPTURA", b: "DE PANTALLA", s: 4.76, e: 6.0 },
  { a: "SUBTÍTULOS", b: "DINÁMICOS", s: 6.3, e: 7.5 },
  { a: "ACÁ METIÓ", b: "MOTION GRAPHICS", s: 7.74, e: 9.1 },
  { a: "MÁS MOTION", b: "GRAPHICS", s: 9.22, e: 10.3 },
  { a: "SÚPER", b: "ANIMADO", s: 10.34, e: 11.4 },
  { a: "LA ROMPE", b: "TODAVÍA MÁS", s: 11.5, e: 12.98 },
  { a: "LE PUSE", b: "LA MÚSICA", s: 13.08, e: 13.98 },
  { a: "ESE TIPO", b: "DE BOTONES", s: 14.12, e: 15.4 },
  { a: "LO HACE TODO", b: "EXCELENTE", s: 15.52, e: 16.9 },
  { a: "Y LO MEJOR", b: "DE TODO", s: 16.92, e: 18.04 },
  { a: "LO CORTÓ", b: "AL 100%", s: 18.06, e: 19.4 },
  { a: "COMENTÁ", b: "ACÁ ABAJO", s: 19.62, e: 20.2 },
  { a: "COMENTÁ", b: "EDICIÓN", s: 20.22, e: 20.82 },
  { a: "Y TE ENVÍO", b: "UNA CLASE", s: 20.84, e: 21.98 },
  { a: "VOS TAMBIÉN", b: "PODÉS", s: 22.0, e: 22.7 },
];

// Glossy fill per line: vivid orange gloss for the bottom line, clean white
// for the top. NO stroke — readability comes from a layered drop-shadow plus
// the warm glow behind the block.
const capGrad = (variant: "white" | "orange") =>
  variant === "orange"
    ? "linear-gradient(180deg, #FFB84D 0%, #FF7E1E 50%, #F25C0A 100%)"
    : "linear-gradient(180deg, #FFFFFF 0%, #F1F3F8 58%, #D9DCE7 100%)";

// One word. Enters by sliding DOWN from above into place (translateY negative
// -> 0) and fading in. Gradient-filled glyphs get a soft shadow via drop-shadow
// (respects the glyph alpha), so there is no stroke at all.
const CapWord: React.FC<{ text: string; size: number; variant: "white" | "orange"; appear: number }> = ({ text, size, variant, appear }) => {
  const dy = (1 - appear) * -(size * 0.85);
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: CAP_STACK,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.9,
        textTransform: "uppercase",
        letterSpacing: -1,
        background: capGrad(variant),
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.62)) drop-shadow(0 9px 18px rgba(0,0,0,0.42))",
        transform: `translateY(${dy}px)`,
        opacity: interpolate(appear, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      } as React.CSSProperties}
    >
      {text}
    </span>
  );
};

// Subs move per section so they stay near the chin over the person and sit low
// (over the empty laptop/keyboard area) during the demo so they never cover the
// screen he is showing. Bottom (orange) line is a touch bigger than the top.
const capAnchor = (frame: number): { y: number; top: number; bot: number } => {
  if (frame >= 588) return { y: 1500, top: 46, bot: 62 }; // OUTRO — low (card is up top), clear of the face
  if (frame >= 110) return { y: 1500, top: 42, bot: 58 }; // DEMO  — low, clear of the laptop screen
  return { y: 1230, top: 50, bot: 68 };                    // HOOK  — below the chin, not touching the face
};

const STAGGER = 3; // frames between word entrances → one word at a time

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const anchor = capAnchor(frame);
  const t = frame / FPS;
  const active = SUBS.find((c) => t >= c.s && t <= c.e + 0.1);
  if (!active) return null;
  const startF = active.s * FPS;
  const wordsA = active.a.split(" ");
  const wordsB = active.b.split(" ");
  const appearFor = (i: number) =>
    spring({ frame: frame - (startF + i * STAGGER), fps: FPS, config: { damping: 18, mass: 0.6 } });
  const blockIn = interpolate(frame - startF, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: anchor.y,
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: -Math.round(anchor.bot * 0.18), // pull the two lines closer together
        }}
      >
        {/* warm glow behind the caption block */}
        <div
          style={{
            position: "absolute",
            inset: "-42px -66px",
            background:
              "radial-gradient(ellipse at center, rgba(255,125,30,0.32) 0%, rgba(255,125,30,0.12) 42%, rgba(0,0,0,0) 72%)",
            filter: "blur(26px)",
            opacity: blockIn,
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: `0 ${Math.round(anchor.top * 0.28)}px`, whiteSpace: "nowrap" }}>
          {wordsA.map((w, i) => (
            <CapWord key={"a" + i} text={w} size={anchor.top} variant="white" appear={appearFor(i)} />
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: `0 ${Math.round(anchor.bot * 0.26)}px`, whiteSpace: "nowrap" }}>
          {wordsB.map((w, i) => (
            <CapWord key={"b" + i} text={w} size={anchor.bot} variant="orange" appear={appearFor(wordsA.length + i)} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------- music ------------------------------- */
const MusicBed: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => (
  <Audio
    src={staticFile("musica.mp3")}
    volume={(f) =>
      interpolate(f, [0, 15, durationInFrames - 30, durationInFrames], [0, 0.12, 0.12, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    }
  />
);

/* --------------------------- sfx --------------------------------- */
const Sfx: React.FC<{ from: number; src: string; vol?: number }> = ({ from, src, vol = 0.6 }) => (
  <Sequence from={from} durationInFrames={40} layout="none">
    <Audio src={staticFile(src)} volume={vol} />
  </Sequence>
);

/* --------------------------- main -------------------------------- */
export const Reel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const DEMO_FROM = 110;   // person hook → laptop demo
  const OUTRO_FROM = 588;  // laptop demo → person outro (class card)

  return (
    <AbsoluteFill style={{ background: BLACK }}>
      {/* base video (a-roll + his voice) */}
      <OffthreadVideo src={staticFile("basecut.mp4")} />

      {/* ducked music under his voice */}
      <MusicBed durationInFrames={durationInFrames} />

      {/* ---------- light sound effects ---------- */}
      <Sfx from={10} src="sfx/pop.mp3" vol={0.4} />
      <Sfx from={15} src="sfx/pop.mp3" vol={0.4} />
      <Sfx from={20} src="sfx/pop.mp3" vol={0.4} />
      <Sfx from={DEMO_FROM - 2} src="sfx/whoosh.mp3" vol={0.5} />
      <Sfx from={OUTRO_FROM + 2} src="sfx/pop.mp3" vol={0.45} />

      {/* ---------- HOOK — 3 tool logos above the head ---------- */}
      <Sequence from={0} durationInFrames={DEMO_FROM}>
        <HookLogos />
      </Sequence>

      {/* ---------- OUTRO — class screenshot (CTA) ---------- */}
      <Sequence from={OUTRO_FROM} durationInFrames={durationInFrames - OUTRO_FROM}>
        <ClassCard />
      </Sequence>

      {/* captions (whole video, repositioned per section) */}
      <Captions />

      {/* progress bar */}
      <ProgressBar />
    </AbsoluteFill>
  );
};
