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
const GRAY = "#8A8F98";
const WHITE = "#FFFFFF";
const FPS = 30;

/* --------------------------- helpers ----------------------------- */
const sp = (frame: number, delay: number, config?: Parameters<typeof spring>[0]["config"]) =>
  spring({ frame: frame - delay, fps: FPS, config: config ?? { damping: 14, mass: 0.7 } });
const fmt = (n: number) => Math.round(n).toLocaleString("de-DE"); // 10.000

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

/* ---------------------- futuristic grid bg ----------------------- */
const GridBG: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.6) % 90;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: -90,
          backgroundImage:
            `linear-gradient(rgba(255,106,26,0.09) 1px, transparent 1px),` +
            `linear-gradient(90deg, rgba(255,106,26,0.09) 1px, transparent 1px)`,
          backgroundSize: "90px 90px",
          transform: `translateY(${shift}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(60% 45% at 50% 46%, rgba(255,106,26,0.26), rgba(8,8,10,0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = [
    [140, 380, 0], [930, 300, 12], [220, 1400, 6], [880, 1500, 18],
    [520, 250, 24], [120, 900, 9], [960, 980, 3], [300, 1650, 15],
  ];
  return (
    <AbsoluteFill>
      {dots.map(([x, y, d], i) => {
        const a = 0.22 + 0.32 * (0.5 + 0.5 * Math.sin((frame + (d as number) * 6) / 14));
        const yy = (y as number) + Math.sin((frame + (d as number) * 10) / 22) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x as number,
              top: yy,
              width: 8,
              height: 8,
              borderRadius: 99,
              background: ORANGE2,
              opacity: a,
              boxShadow: `0 0 12px ${ORANGE}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* -------------------------- brand mark --------------------------- */
const BrandMark: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 12], [0, 0.92], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div
        style={{
          marginTop: 34,
          opacity: o,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 18px 8px 10px",
          borderRadius: 999,
          background: "rgba(8,8,10,0.42)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Img src={staticFile("logo-tlg.png")} style={{ width: 42, height: 42 }} />
        <div style={{ fontFamily: BOLD, fontSize: 26, color: WHITE, letterSpacing: 4 }}>THE LINE PROJECT</div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------- stat placas (user-made glass PNGs) -------------- */
// The user designed these plates; we keyed out the black background so the
// panel reads like translucent glass over the a-roll. They pop in as each is
// named ("30 clases" ~f17, "24 horas" ~f43) and sit big above the head.
const Placa: React.FC<{ src: string; s: number; out: number }> = ({ src, s, out }) => (
  <Img
    src={staticFile(src)}
    style={{
      width: 322,
      transform: `scale(${s}) translateY(${(1 - s) * -30}px)`,
      opacity: Math.min(interpolate(s, [0, 0.5], [0, 1]), out),
      filter: "drop-shadow(0 22px 46px rgba(0,0,0,0.5))",
    }}
  />
);
const BadgesRow: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = sp(frame, 17, { damping: 12, mass: 0.85 });
  const s2 = sp(frame, 43, { damping: 12, mass: 0.85 });
  const out = interpolate(frame, [100, 112], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div style={{ marginTop: 58, display: "flex", gap: 28, alignItems: "flex-start" }}>
        <Placa src="placa-30.png" s={s1} out={out} />
        <Placa src="placa-24.png" s={s2} out={out} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------- recurso card (PiP) -------------------- */
const RecursoCard: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const s = sp(frame, 0, { damping: 15, mass: 0.9 });
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }), out);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div
        style={{
          marginTop: 150,
          width: 600,
          transform: `translateY(${(1 - s) * -40}px) scale(${0.92 + s * 0.08})`,
          opacity,
          borderRadius: 20,
          overflow: "hidden",
          border: `4px solid rgba(255,255,255,0.9)`,
          boxShadow: "0 22px 60px rgba(0,0,0,0.65)",
          background: BLACK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", background: "#17181c" }}>
          <div style={{ width: 11, height: 11, borderRadius: 99, background: "#ff5f57" }} />
          <div style={{ width: 11, height: 11, borderRadius: 99, background: "#febc2e" }} />
          <div style={{ width: 11, height: 11, borderRadius: 99, background: "#28c840" }} />
          <div style={{ fontFamily: REG, fontSize: 18, color: "#9aa0a6", marginLeft: 10 }}>thelineguide · contenido</div>
        </div>
        <OffthreadVideo src={staticFile("recurso.mov")} startFrom={30} muted style={{ width: "100%", display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};

/* ===================== MG1 — ESCALAR MARCAS ===================== */
const MG1Content: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 108) return null;
  const inS = interpolate(f, [2, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outO = interpolate(f, [96, 106], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = Math.min(inS, outO);
  const slide = (1 - inS) * 40 - (1 - outO) * 40;

  // exponential curve
  const N = 60;
  const W = 840, H = 430;
  const px = (t: number) => 46 + t * (W - 92);
  const py = (t: number) => H - 40 - Math.pow(t, 2.5) * (H - 110);
  let path = "";
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    path += `${i === 0 ? "M" : "L"}${px(t).toFixed(1)},${py(t).toFixed(1)} `;
  }
  const draw = interpolate(f, [16, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tipT = draw;
  const tipX = px(tipT), tipY = py(tipT);
  const count = interpolate(f, [16, 74], [0, 10000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const total = 2600;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", opacity: o }}>
      {/* chart panel (reference style) — vertically centered, no heading/subs */}
      <div
        style={{
          marginTop: 700,
          width: W + 48,
          padding: 24,
          borderRadius: 28,
          background: "linear-gradient(180deg, rgba(20,21,26,0.95), rgba(10,11,14,0.95))",
          border: "1px solid rgba(255,106,26,0.28)",
          boxShadow: "0 26px 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(255,106,26,0.06)",
          position: "relative",
          transform: `translateY(${slide * 0.5}px)`,
        }}
      >
        <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor={ORANGE2} />
              <stop offset="100%" stopColor={ORANGE} />
            </linearGradient>
            <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,106,26,0.35)" />
              <stop offset="100%" stopColor="rgba(255,106,26,0)" />
            </linearGradient>
          </defs>
          {/* grid */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={"h" + i} x1={30} y1={40 + i * 68} x2={W - 20} y2={40 + i * 68} stroke="rgba(255,106,26,0.12)" strokeWidth={1.5} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={"v" + i} x1={46 + i * 108} y1={30} x2={46 + i * 108} y2={H - 30} stroke="rgba(255,106,26,0.08)" strokeWidth={1.5} />
          ))}
          {/* area under curve */}
          <path d={`${path} L${tipX.toFixed(1)},${H - 40} L46,${H - 40} Z`} fill="url(#fillGrad)" opacity={draw > 0.02 ? 0.9 : 0}
            clipPath="none" style={{ transition: "none" }} />
          {/* the line */}
          <path
            d={path}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={total}
            strokeDashoffset={total * (1 - draw)}
            style={{ filter: `drop-shadow(0 0 12px ${ORANGE})` }}
          />
        </svg>
        {/* leading marker — Instagram logo climbing the curve (padding-offset: 24) */}
        <div
          style={{
            position: "absolute",
            left: 24 + tipX - 52,
            top: 24 + tipY - 52,
            width: 104,
            height: 104,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,106,26,0.5), rgba(255,106,26,0) 70%)", filter: "blur(4px)" }} />
          <Img src={staticFile("logos/instagram.png")} style={{ width: 92, height: 92, borderRadius: 22, filter: "drop-shadow(0 8px 18px rgba(255,106,26,0.6))" }} />
        </div>
        {/* value pill top-left */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 34,
            background: "rgba(8,8,10,0.85)",
            border: `1px solid ${ORANGE}`,
            borderRadius: 14,
            padding: "8px 18px",
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            boxShadow: `0 8px 24px rgba(255,106,26,0.35)`,
          }}
        >
          <span style={{ fontFamily: BOLD, fontSize: 44, color: WHITE, letterSpacing: -1 }}>+{fmt(count)}</span>
          <span style={{ fontFamily: BOLD, fontSize: 20, color: ORANGE2, letterSpacing: 1 }}>SEGUIDORES</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ===================== MG2 — HERRAMIENTAS IA (hub) ============== */
const TOOLS = [
  { file: "logos/claude.png", name: "Claude", pos: [300, 715] },
  { file: "logos/apify.png", name: "Apify", pos: [780, 715] },
  { file: "logos/heygen.png", name: "HeyGen", pos: [300, 1165] },
  { file: "logos/elevenlabs.png", name: "ElevenLabs", pos: [780, 1165] },
];
const HUB = [540, 940]; // vertically centered composition (no subs on MG)
// MG2 local reference: l = 0 when the person says "con la inteligencia artificial".
// Robot + circle come in on l>=0; the 4 tools pop one-by-one starting at l=TOOLS_AT
// (aligned to "herramientas como estas ... y muchas más"), and then STAY.
const IA_LOCAL = 107;   // local frame (rel. MG stage) where "inteligencia" starts
const TOOLS_AT = 60;    // l-frames after IA where tools begin appearing
const TOOL_GAP = 12;    // one tool every ~0.4s
const MG2Content: React.FC = () => {
  const f = useCurrentFrame();
  if (f < IA_LOCAL - 12) return null;
  const l = f - IA_LOCAL;
  const inO = interpolate(l, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outO = interpolate(f, [232, 244], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = Math.min(inO, outO);
  const robotS = sp(l, 0, { damping: 12, mass: 0.9 });
  const toolS = (i: number) => sp(l, TOOLS_AT + i * TOOL_GAP, { damping: 12, mass: 0.8 });

  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* rings + spokes (SVG) */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* concentric rings around the robot (grow in with the robot) */}
        {[150, 250, 350].map((r, i) => {
          const pulse = 0.16 + 0.14 * (0.5 + 0.5 * Math.sin((l - i * 6) / 12));
          return (
            <circle key={r} cx={HUB[0]} cy={HUB[1]} r={r * interpolate(robotS, [0, 1], [0.55, 1])}
              fill="none" stroke={ORANGE} strokeWidth={2} opacity={pulse * robotS} />
          );
        })}
        {/* spokes: drawn as each tool appears */}
        {TOOLS.map((t, i) => {
          const [cx, cy] = t.pos;
          const s = toolS(i);
          const p = interpolate(s, [0.05, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const ex = cx + (HUB[0] - cx) * p;
          const ey = cy + (HUB[1] - cy) * p;
          const tp = ((l + i * 8) % 40) / 40;
          const dx = cx + (HUB[0] - cx) * tp;
          const dy = cy + (HUB[1] - cy) * tp;
          return (
            <g key={t.name}>
              <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,106,26,0.45)" strokeWidth={3} />
              {p > 0.99 && <circle cx={dx} cy={dy} r={5} fill={ORANGE2} style={{ filter: `drop-shadow(0 0 6px ${ORANGE})` }} />}
            </g>
          );
        })}
      </svg>

      {/* central robot inside a glowing circle */}
      <div
        style={{
          position: "absolute",
          left: HUB[0] - 150,
          top: HUB[1] - 150,
          width: 300,
          height: 300,
          transform: `scale(${robotS})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* soft radial halo */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,106,26,0.42), rgba(255,106,26,0) 68%)" }} />
        {/* solid circle disc behind the robot */}
        <div style={{ position: "absolute", inset: 34, borderRadius: "50%", background: "radial-gradient(circle at 50% 38%, #16171c, #0b0c0f)", border: `2px solid ${ORANGE}`, boxShadow: `0 0 40px rgba(255,106,26,0.5), inset 0 0 30px rgba(255,106,26,0.18)` }} />
        <Img src={staticFile("robot.png")} style={{ width: 190, height: 190, filter: "drop-shadow(0 10px 26px rgba(255,106,26,0.5))" }} />
      </div>

      {/* tool tiles — pop in one at a time, then stay */}
      {TOOLS.map((t, i) => {
        const s = toolS(i);
        const [tx, ty] = t.pos;
        return (
          <div key={t.name} style={{ position: "absolute", left: tx - 82, top: ty - 82, width: 164, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${s})`, opacity: interpolate(s, [0, 0.4], [0, 1]) }}>
            <div style={{ width: 164, height: 164, borderRadius: 28, background: WHITE, boxShadow: "0 14px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile(t.file)} style={{ width: 108, height: 108, objectFit: "contain" }} />
            </div>
            <div style={{ fontFamily: BOLD, fontSize: 26, color: WHITE }}>{t.name}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------------- MG stage (continuous black) -------------- */
const MGStage: React.FC = () => {
  const f = useCurrentFrame();
  // Hold the black FULLY opaque past the a-roll's hard cut (abs frame 343 =
  // local 229) so the jump stays hidden; only then reveal the stable footage.
  const op = Math.min(
    interpolate(f, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(f, [232, 244], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill style={{ background: BLACK }} />
      <GridBG />
      <Particles />
      <MG1Content />
      <MG2Content />
    </AbsoluteFill>
  );
};

/* ==================== CTA (lower third, no face) ================ */
const CTASection: React.FC = () => {
  const frame = useCurrentFrame();
  const s = sp(frame, 4, { damping: 13 });
  // heartbeat: two quick beats (lub-dub) then rest, ~1.4s cycle
  const tb = (frame % 42) / 42;
  const b1 = Math.exp(-Math.pow((tb - 0.1) / 0.05, 2));
  const b2 = Math.exp(-Math.pow((tb - 0.26) / 0.05, 2));
  const beat = 1 + 0.07 * b1 + 0.05 * b2;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 300 }}>
      <div
        style={{
          transform: `scale(${s * beat})`,
          background: `linear-gradient(180deg, ${ORANGE2}, ${ORANGE})`,
          borderRadius: 22,
          padding: "24px 44px",
          boxShadow: "0 20px 55px rgba(255,106,26,0.5), inset 0 1px 0 rgba(255,255,255,0.35)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontFamily: BOLD, fontSize: 52, color: WHITE, letterSpacing: 0.5 }}>HACÉ CLIC ACÁ ABAJO</div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------- captions ---------------------------- */
// Two-line "viral" captions (Montserrat 900, top WHITE / bottom ORANGE) that
// cover the whole video. Phrases are grouped so each 2-line composition reads
// as a coherent unit. During the motion-graphic stage they sit below the graph.
type Comp = { a: string; b: string; s: number; e: number };
const SUBS: Comp[] = [
  { a: "TENEMOS MÁS DE", b: "30 CLASES", s: 0.0, e: 1.42 },
  { a: "Y 24 HORAS DE", b: "CONTENIDO", s: 1.42, e: 3.1 },
  { a: "DENTRO DE", b: "THE LINE PROJECT", s: 3.1, e: 3.8 },
  { a: "DONDE TE ENSEÑAMOS", b: "CÓMO ESCALAR", s: 3.82, e: 5.2 },
  { a: "MARCAS PERSONALES", b: "A MÁS DE", s: 5.2, e: 6.18 },
  { a: "+10.000", b: "SEGUIDORES", s: 6.18, e: 7.34 },
  { a: "CON LA INTELIGENCIA", b: "ARTIFICIAL", s: 7.38, e: 9.0 },
  { a: "APALANCÁNDONOS DE", b: "HERRAMIENTAS", s: 9.0, e: 10.3 },
  { a: "COMO ESTAS", b: "Y MUCHAS MÁS", s: 10.3, e: 11.4 },
  { a: "HACÉ CLIC", b: "ACÁ ABAJO", s: 11.52, e: 12.6 },
  { a: "Y ACCEDÉ", b: "HOY MISMO", s: 12.6, e: 13.3 },
  { a: "ANTES DE QUE", b: "TERMINE", s: 13.3, e: 14.1 },
  { a: "EL PRECIO DEL", b: "LANZAMIENTO", s: 14.1, e: 15.2 },
];

// Glossy fill per line: vivid orange gloss for the bottom line, clean white for
// the top. NO stroke — the user finds it ugly; readability comes from a layered
// drop-shadow plus the warm glow behind the block.
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
        lineHeight: 1.0,
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

// Bottom (orange) line is bigger than the top (white) line, per the reference.
// Subs sit at the BOTTOM over the a-roll and are REMOVED during motion graphics.
const capAnchor = (frame: number): { y: number; top: number; bot: number } | null => {
  if (frame >= 114 && frame < 346) return null; // no subs on the MG screens
  if (frame >= 346) return { y: 1360, top: 58, bot: 100 }; // CTA — above the button
  return { y: 1650, top: 64, bot: 108 }; // hook — near the bottom
};

const STAGGER = 3; // frames between word entrances → one word at a time

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const anchor = capAnchor(frame);
  if (!anchor) return null;
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
          gap: 2,
        }}
      >
        {/* warm glow behind the caption block */}
        <div
          style={{
            position: "absolute",
            inset: "-48px -74px",
            background:
              "radial-gradient(ellipse at center, rgba(255,125,30,0.32) 0%, rgba(255,125,30,0.12) 42%, rgba(0,0,0,0) 72%)",
            filter: "blur(28px)",
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
  const HOOK_END = 114;
  const MG_FROM = 114, MG_LEN = 248; // 114 -> 362 (black holds past the a-roll cut)
  const CTA_FROM = 346;              // reveal begins AFTER the cut (abs 343), stable footage

  // sfx cue frames (absolute)
  const COUNT_AT = MG_FROM + 14;            // graph counter starts rolling
  const IA = MG_FROM + 107;                 // "con la inteligencia artificial"
  const TOOL0 = MG_FROM + 167;              // "herramientas como estas"

  return (
    <AbsoluteFill style={{ background: BLACK }}>
      {/* base video (a-roll + correct voice) */}
      <OffthreadVideo src={staticFile("basecut.mp4")} />

      {/* ducked music */}
      <MusicBed durationInFrames={durationInFrames} />

      {/* ---------- sound effects ---------- */}
      <Sfx from={8} src="sfx/pop.mp3" vol={0.5} />
      <Sfx from={14} src="sfx/pop.mp3" vol={0.5} />
      <Sfx from={MG_FROM - 2} src="sfx/whoosh.mp3" vol={0.55} />
      <Sfx from={COUNT_AT} src="sfx/counter.mp3" vol={0.4} />
      <Sfx from={IA} src="sfx/robot.mp3" vol={0.5} />
      <Sfx from={TOOL0} src="sfx/pop.mp3" vol={0.45} />
      <Sfx from={TOOL0 + 12} src="sfx/pop.mp3" vol={0.45} />
      <Sfx from={TOOL0 + 24} src="sfx/pop.mp3" vol={0.45} />
      <Sfx from={TOOL0 + 36} src="sfx/pop.mp3" vol={0.45} />
      <Sfx from={CTA_FROM} src="sfx/impact.mp3" vol={0.55} />

      {/* ---------- HOOK (a-roll) — resource PiP below the subs ---------- */}
      <Sequence from={12} durationInFrames={HOOK_END - 12}>
        <RecursoCard durationInFrames={HOOK_END - 12} />
      </Sequence>

      {/* ---------- MG stage (continuous black, MG1 -> MG2) ---------- */}
      <Sequence from={MG_FROM} durationInFrames={MG_LEN}>
        <MGStage />
      </Sequence>

      {/* ---------- CTA (a-roll) ---------- */}
      <Sequence from={CTA_FROM} durationInFrames={durationInFrames - CTA_FROM}>
        <CTASection />
      </Sequence>

      {/* captions (a-roll only) */}
      <Captions />

      {/* progress bar */}
      <ProgressBar />
    </AbsoluteFill>
  );
};
