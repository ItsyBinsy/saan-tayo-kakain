"use client"

import { useRef, useEffect, useCallback, useMemo } from "react"

interface Slice {
  label: string
}

interface Props {
  slices: Slice[]
  spinning: boolean
  targetIndex: number
  onStop: () => void
}

const SLICE_GRADIENTS: [string, string][] = [
  ["#C41E3A", "#7A0E22"],
  ["#F5EDD8", "#DDD0B0"],
]

const OUTLINE     = "#0E0A04"
const RIM_INNER   = "#C41E3A"
const RIM_OUTER   = "#0E0A04"
const CENTER_FILL = "#1A1208"
const CENTER_RING = "#C41E3A"
const CENTER_DOT  = "#F5EDD8"
const POINTER_FILL  = "#F5EDD8"
const POINTER_GLOW  = "#C41E3A"

const VBOX = 300
const cx   = VBOX / 2
const cy   = VBOX / 2
const r    = VBOX / 2 - 7

// Idle: one full revolution every 20 seconds
const IDLE_DEG_PER_MS = 360 / 20000

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text
}

function buildSlicePath(index: number, sliceDeg: number) {
  const start = (index * sliceDeg - 90) * (Math.PI / 180)
  const end   = ((index + 1) * sliceDeg - 90) * (Math.PI / 180)
  const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${sliceDeg > 180 ? 1 : 0} 1 ${x2} ${y2} Z`
}

function buildLabelTransform(index: number, sliceDeg: number) {
  const mid = (index + 0.5) * sliceDeg - 90
  const rad = mid * (Math.PI / 180)
  const dist = r * 0.66
  return { x: cx + dist * Math.cos(rad), y: cy + dist * Math.sin(rad), rotate: mid + 90 }
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

export default function SpinWheel({ slices, spinning, targetIndex, onStop }: Props) {
  const svgRef    = useRef<SVGSVGElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const rotRef    = useRef(0)
  const rafRef    = useRef<number>(0)
  const t0Ref     = useRef(0)
  const fromRef   = useRef(0)
  const toRef     = useRef(0)
  const durRef    = useRef(4200)
  const onStopRef = useRef(onStop)
  onStopRef.current = onStop

  const idleRafRef  = useRef<number>(0)
  const idleActive  = useRef(true)
  const lastTsRef   = useRef<number>(0)

  const n        = slices.length
  const sliceDeg = 360 / n
  const fontSize = n <= 3 ? 17 : n <= 5 ? 15 : n <= 7 ? 12 : 10
  const maxChars = n <= 3 ? 18 : n <= 5 ? 14 : n <= 7 ? 12 : 9

  // Pre-compute all slice geometry once — only recalculates when slices change
  const sliceData = useMemo(() => slices.map((slice, i) => ({
    path:   buildSlicePath(i, sliceDeg),
    label:  buildLabelTransform(i, sliceDeg),
    gradId: `sg-${i % SLICE_GRADIENTS.length}`,
    isDark: i % 2 === 0,
    text:   truncate(slice.label, maxChars),
  })), [slices, sliceDeg, maxChars])

  // Idle: uses real timestamp delta — framerate-independent
  const idleAnimate = useCallback((ts: number) => {
    if (!svgRef.current || !idleActive.current) return
    if (lastTsRef.current !== 0) {
      const delta = ts - lastTsRef.current
      rotRef.current = (rotRef.current + IDLE_DEG_PER_MS * delta) % 360
      svgRef.current.style.transform = `rotate(${rotRef.current}deg)`
    }
    lastTsRef.current = ts
    idleRafRef.current = requestAnimationFrame(idleAnimate)
  }, [])

  const startIdle = useCallback(() => {
    idleActive.current = true
    lastTsRef.current  = 0
    idleRafRef.current = requestAnimationFrame(idleAnimate)
  }, [idleAnimate])

  const stopIdle = useCallback(() => {
    idleActive.current = false
    lastTsRef.current  = 0
    cancelAnimationFrame(idleRafRef.current)
  }, [])

  // Spin animation — timestamp-based, no assumptions about frame rate
  const animate = useCallback((ts: number) => {
    if (!svgRef.current) return
    if (t0Ref.current === 0) t0Ref.current = ts
    const t = Math.min((ts - t0Ref.current) / durRef.current, 1)
    const cur = fromRef.current + (toRef.current - fromRef.current) * easeOut(t)
    rotRef.current = cur
    svgRef.current.style.transform = `rotate(${cur}deg)`
    if (t < 1) {
      rafRef.current = requestAnimationFrame(animate)
    } else {
      onStopRef.current()
      startIdle()
    }
  }, [startIdle])

  // Mount: start idle
  useEffect(() => {
    startIdle()
    return () => stopIdle()
  }, [startIdle, stopIdle])

  // Glow pulse — CSS animation on wrapper, not on the rotating SVG
  useEffect(() => {
    if (!wrapRef.current) return
    wrapRef.current.style.animation = spinning
      ? "stk-pulse 0.85s ease-in-out infinite"
      : "none"
  }, [spinning])

  // Spin trigger
  useEffect(() => {
    if (!spinning) return
    stopIdle()
    t0Ref.current = 0

    // --- Pointer landing math ---
    // Slices are drawn with a -90° offset so slice 0 starts at the top (12 o'clock).
    // Slice i's midpoint in wheel-local degrees (before any rotation):
    //   mid = i * sliceDeg + sliceDeg/2 - 90
    // The pointer sits at 0° (top). For the pointer to point at slice i,
    // we need the wheel rotated so that mid lands at 0°.
    // That means we need to ADD (360 - mid) % 360 to the current rotation,
    // normalised against the current accumulated rotation so we don't overshoot.
    const sliceMidLocal = targetIndex * sliceDeg + sliceDeg / 2 - 90
    const currentMod    = ((rotRef.current % 360) + 360) % 360 // always 0–360
    const needed        = ((360 - sliceMidLocal) % 360 + 360) % 360 // always 0–360
    const shortestAdd   = ((needed - currentMod) % 360 + 360) % 360 // 0–360 delta
    const extraSpins    = (6 + Math.floor(Math.random() * 3)) * 360

    fromRef.current = rotRef.current
    toRef.current   = rotRef.current + extraSpins + shortestAdd
    durRef.current  = 4000 + Math.random() * 800

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [spinning, targetIndex, sliceDeg, animate, stopIdle])

  return (
    <div style={{
      position: "relative",
      // vw only — works on iOS 9+, all IABs, no cqw needed.
      // min() with px cap is universally supported since iOS 11.
      width:  "min(160vw, 720px)",
      height: "min(160vw, 720px)",
      marginTop: "auto",
      // Pull bottom half below viewport — parent overflow:hidden clips it.
      marginBottom: "calc(-1 * min(80vw, 360px))",
      flexShrink: 0,
      alignSelf: "center",
    }}>
      {/* Pointer — outside the rotating SVG, never moves */}
      <svg
        viewBox="0 0 48 44"
        style={{
          position: "absolute",
          top: "-3.5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "9%",
          zIndex: 10,
          overflow: "visible",
          filter: `drop-shadow(0 0 6px ${POINTER_GLOW}) drop-shadow(0 3px 6px rgba(14,10,4,0.6))`,
        }}
      >
        <polygon points="24,42 1,6 47,6"   fill={OUTLINE} />
        <polygon points="24,35 8,10 40,10"  fill={POINTER_FILL} />
        <polygon points="24,42 17,28 31,28" fill={POINTER_GLOW} />
      </svg>

      {/*
        Wrapper: drop-shadow is here, NOT on the rotating SVG.
        This means the shadow is composited once and not recomputed
        every animation frame.
      */}
      <div
        ref={wrapRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          filter: "drop-shadow(0 8px 32px rgba(14,10,4,0.55))",
        }}
      >
        {/*
          Only `transform` changes during animation.
          willChange: "transform" tells the GPU to promote this to
          its own layer — no layout or paint triggered per frame.
          No filter here — that would break layer promotion.
        */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VBOX} ${VBOX}`}
          style={{ display: "block", width: "100%", height: "100%", willChange: "transform" }}
        >
          <defs>
            {SLICE_GRADIENTS.map(([inner, outer], gi) => (
              <radialGradient
                key={gi}
                id={`sg-${gi}`}
                cx="50%" cy="30%" r="80%"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%"   stopColor={inner} stopOpacity={0.9} />
                <stop offset="100%" stopColor={outer} />
              </radialGradient>
            ))}
          </defs>

          {/* Outer dark rim */}
          <circle cx={cx} cy={cy} r={VBOX / 2 - 1} fill={RIM_OUTER} />

          {/* Red ring — static, no SVG filter so no per-frame GPU cost */}
          <circle cx={cx} cy={cy} r={VBOX / 2 - 5} fill="none" stroke={RIM_INNER} strokeWidth={4} />

          {/* Slices — geometry pre-computed, only label text rendered here */}
          {sliceData.map(({ path, label: lbl, gradId, isDark, text }, i) => {
            const textFill = isDark ? "#F5EDD8" : "#1A1208"
            return (
              <g key={i}>
                <path d={path} fill={`url(#${gradId})`} stroke={OUTLINE} strokeWidth={1.5} />
                <text
                  x={lbl.x} y={lbl.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${lbl.rotate}, ${lbl.x}, ${lbl.y})`}
                  fill={textFill}
                  fontSize={fontSize}
                  fontWeight={900}
                  fontFamily="'Barlow Condensed', sans-serif"
                  letterSpacing={1}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {text}
                </text>
              </g>
            )
          })}

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={22} fill={OUTLINE} />
          <circle cx={cx} cy={cy} r={18} fill={CENTER_RING} />
          <circle cx={cx} cy={cy} r={13} fill={CENTER_FILL} />
          <circle cx={cx} cy={cy} r={5}  fill={CENTER_DOT} />
        </svg>
      </div>
    </div>
  )
}
