"use client"

import { useRef, useEffect, useCallback, useMemo } from "react"

interface Slice {
  label: string
}

interface Props {
  slices: Slice[]
  spinning: boolean
  targetIndex: number
  winnerIndex: number | null
  onStop: (actualIndex: number) => void
}

const SLICE_GRADIENTS: [string, string][] = [
  ["#C41E3A", "#7A0E22"],
  ["#F5EDD8", "#DDD0B0"],
]

const OUTLINE       = "#0E0A04"
const RIM_INNER     = "#C41E3A"
const RIM_OUTER     = "#0E0A04"
const CENTER_FILL   = "#1A1208"
const CENTER_RING   = "#C41E3A"
const CENTER_DOT    = "#F5EDD8"
const POINTER_FILL  = "#F5EDD8"
const POINTER_GLOW  = "#C41E3A"

const VBOX            = 300
const cx              = VBOX / 2
const cy              = VBOX / 2
const r               = VBOX / 2 - 7
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

export default function SpinWheel({ slices, spinning, targetIndex, winnerIndex, onStop }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // All animation state lives in refs — zero React re-renders per frame
  const rotRef  = useRef(0)
  const rafRef  = useRef<number>(0)
  const t0Ref   = useRef(0)
  const fromRef = useRef(0)
  const toRef   = useRef(0)
  const durRef  = useRef(4200)

  // Always-current copies of props/derived values for use inside callbacks
  const onStopRef   = useRef(onStop)
  const sliceDegRef = useRef(0)
  const nRef        = useRef(0)
  onStopRef.current = onStop

  // Idle loop state
  const idleRafRef = useRef<number>(0)
  const idleActive = useRef(false)
  const lastTsRef  = useRef(0)

  // Derived — declared after refs so refs can be updated below
  const n        = slices.length
  const sliceDeg = 360 / n
  const fontSize = n <= 3 ? 17 : n <= 5 ? 15 : n <= 7 ? 12 : 10
  const maxChars = n <= 3 ? 18 : n <= 5 ? 14 : n <= 7 ? 12 : 9

  // Keep refs in sync every render (safe — refs don't trigger re-renders)
  sliceDegRef.current = sliceDeg
  nRef.current        = n

  const sliceData = useMemo(() => slices.map((slice, i) => ({
    path:   buildSlicePath(i, sliceDeg),
    label:  buildLabelTransform(i, sliceDeg),
    gradId: `sg-${i % SLICE_GRADIENTS.length}`,
    isDark: i % 2 === 0,
    text:   truncate(slice.label, maxChars),
  })), [slices, sliceDeg, maxChars])

  // Idle rotation — framerate-independent via real timestamp delta
  const idleAnimate = useCallback((ts: number) => {
    if (!svgRef.current || !idleActive.current) return
    if (lastTsRef.current !== 0) {
      const delta = ts - lastTsRef.current
      rotRef.current = (rotRef.current + IDLE_DEG_PER_MS * delta) % 360
      svgRef.current.style.transform = `rotate(${rotRef.current}deg)`
    }
    lastTsRef.current  = ts
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

  // Spin animation — reads sliceDeg/n from refs so it's always current
  const animate = useCallback((ts: number) => {
    if (!svgRef.current) return
    if (t0Ref.current === 0) t0Ref.current = ts
    const t   = Math.min((ts - t0Ref.current) / durRef.current, 1)
    const cur = fromRef.current + (toRef.current - fromRef.current) * easeOut(t)
    rotRef.current = cur
    svgRef.current.style.transform = `rotate(${cur}deg)`

    if (t < 1) {
      rafRef.current = requestAnimationFrame(animate)
    } else {
      // Reading: at rotation X, slice at pointer satisfies i*sd + sd/2 + X ≡ 0
      //   i = floor( ((-X mod 360 + 360) mod 360) / sd )
      const sd          = sliceDegRef.current
      const negMod      = ((-cur % 360) + 360) % 360
      const actualIndex = Math.floor(negMod / sd) % nRef.current
      onStopRef.current(actualIndex)
      startIdle()
    }
  }, [startIdle])

  // Mount: start idle spin
  useEffect(() => {
    startIdle()
    return () => stopIdle()
  }, [startIdle, stopIdle])

  // Glow pulse while spinning
  useEffect(() => {
    if (!wrapRef.current) return
    wrapRef.current.style.animation = spinning
      ? "stk-pulse 0.85s ease-in-out infinite"
      : "none"
  }, [spinning])

  // Spin trigger — target landing math
  useEffect(() => {
    if (!spinning) return
    stopIdle()
    t0Ref.current = 0

    // CSS rotate(X) clockwise. Slice i center is at SVG angle (i*sd + sd/2 - 90).
    // After rotating X, its visual angle = i*sd + sd/2 - 90 + X.
    // Pointer is at -90 (12 o'clock). For slice i to land at pointer:
    //   i*sd + sd/2 + X ≡ 0  →  X ≡ -(i*sd + sd/2)
    const needed      = -(targetIndex * sliceDeg + sliceDeg / 2)
    const currentMod  = ((rotRef.current % 360) + 360) % 360
    const neededMod   = ((needed % 360) + 360) % 360
    const shortestAdd = ((neededMod - currentMod) % 360 + 360) % 360
    const extraSpins  = (6 + Math.floor(Math.random() * 3)) * 360

    fromRef.current = rotRef.current
    toRef.current   = rotRef.current + extraSpins + shortestAdd
    durRef.current  = 4000 + Math.random() * 800

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [spinning, targetIndex, sliceDeg, animate, stopIdle])

  return (
    <div style={{
      position: "relative",
      width:  "min(160vw, 720px)",
      height: "min(160vw, 720px)",
      marginTop: "auto",
      marginBottom: "calc(-1 * min(80vw, 360px))",
      flexShrink: 0,
      alignSelf: "center",
    }}>
      {/* Pointer — static, never rotates */}
      <svg
        viewBox="0 0 48 44"
        style={{
          position: "absolute",
          top: "-4.24%",
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

      {/* Wrapper: drop-shadow here so it's composited once, not per frame */}
      <div
        ref={wrapRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          filter: "drop-shadow(0 8px 32px rgba(14,10,4,0.55))",
        }}
      >
        {/* Only transform mutates per frame — GPU layer promoted via willChange */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VBOX} ${VBOX}`}
          style={{ display: "block", width: "100%", height: "100%", willChange: "transform" }}
        >
          <defs>
            {SLICE_GRADIENTS.map(([inner, outer], gi) => (
              <radialGradient key={gi} id={`sg-${gi}`} cx="50%" cy="30%" r="80%" gradientUnits="objectBoundingBox">
                <stop offset="0%"   stopColor={inner} stopOpacity={0.9} />
                <stop offset="100%" stopColor={outer} />
              </radialGradient>
            ))}
          </defs>

          <circle cx={cx} cy={cy} r={VBOX / 2 - 1} fill={RIM_OUTER} />
          <circle cx={cx} cy={cy} r={VBOX / 2 - 5} fill="none" stroke={RIM_INNER} strokeWidth={4} />

          {sliceData.map(({ path, label: lbl, gradId, isDark, text }, i) => {
            const isWinner = winnerIndex === i
            return (
              <g key={i}>
                <path
                  d={path}
                  fill={isWinner ? "#FFD700" : `url(#${gradId})`}
                  stroke={isWinner ? "#FFD700" : OUTLINE}
                  strokeWidth={isWinner ? 3 : 1.5}
                />
                <text
                  x={lbl.x} y={lbl.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${lbl.rotate}, ${lbl.x}, ${lbl.y})`}
                  fill={isWinner ? "#1A1208" : isDark ? "#F5EDD8" : "#1A1208"}
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

          <circle cx={cx} cy={cy} r={22} fill={OUTLINE} />
          <circle cx={cx} cy={cy} r={18} fill={CENTER_RING} />
          <circle cx={cx} cy={cy} r={13} fill={CENTER_FILL} />
          <circle cx={cx} cy={cy} r={5}  fill={CENTER_DOT} />
        </svg>
      </div>
    </div>
  )
}
