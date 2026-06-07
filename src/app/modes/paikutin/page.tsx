"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { useHydrated } from "@/hooks/useHydrated"
import SpinWheel from "@/components/SpinWheel"
import LoadingScreen from "@/components/LoadingScreen"
import afterPaikutinAnim from "@/animations/after-paikutin.json"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

export default function Paikutin() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const usedModes = useStore((state) => state.usedModes)
  const setWinner = useStore((state) => state.setWinner)
  const addUsedMode = useStore((state) => state.addUsedMode)
  const hydrated = useHydrated()

  const [spinning, setSpinning] = useState(false)
  const [targetIndex, setTargetIndex] = useState(0)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  const [showLoading, setShowLoading] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [winnerName, setWinnerName] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const spinLock = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (places.length === 0) router.replace("/filter")
    else if (!showLoading && usedModes.includes("paikutin")) router.replace("/winner")
  }, [hydrated, places, usedModes, showLoading, router])

  const fireConfetti = useCallback(() => {
    const opts = {
      particleCount: 60,
      spread: 70,
      colors: ["#C41E3A", "#E8820C", "#D4A017", "#C4780A", "#FDF6E3", "#A63220"],
      startVelocity: 28,
      gravity: 1.1,
      scalar: 0.9,
    }
    confetti({ ...opts, origin: { x: 0.35, y: 0.55 } })
    confetti({ ...opts, origin: { x: 0.65, y: 0.55 } })
  }, [])

  const spinWheel = useCallback(() => {
    if (spinning || spinLock.current || revealed) return
    spinLock.current = true
    const idx = Math.floor(Math.random() * places.length)
    setTargetIndex(idx)
    setSpinning(true)
    setHasSpun(true)
    setWinnerName(null)
  }, [spinning, revealed, places.length])

  const handleStop = useCallback((actualIndex: number) => {
    setSpinning(false)
    spinLock.current = false

    // Use actualIndex from the wheel's real final rotation — not targetIndex state.
    // targetIndex is React state and may be stale in this closure.
    const winner = places[actualIndex]
    setWinnerIndex(actualIndex)
    setWinnerName(winner.displayName.text)
    setWinner(winner)
    setRevealed(true)

    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 100])
    }

    // Confetti burst
    fireConfetti()

    // Navigate after a short celebration pause
    setTimeout(() => {
      setShowLoading(true)
      setTimeout(() => {
        addUsedMode("paikutin")
        router.push("/winner")
      }, 4000)
    }, 1600)
  }, [places, setWinner, addUsedMode, router, fireConfetti])

  if (showLoading) {
    return (
      <LoadingScreen
        animationData={afterPaikutinAnim}
        message="No more going in circles."
        sub="Huwag kang magreklamo."
        indicator="bar"
      />
    )
  }

  if (!hydrated || places.length === 0) {
    return <div style={{ background: "var(--surface)", height: "100dvh" }} />
  }

  const slices = places.map((p) => ({ label: p.displayName.text }))

  return (
    <main
      className="flex flex-col"
      style={{
        background: "var(--surface)",
        height: "100dvh",
        overflow: "hidden",  // clips the bottom half of the oversized wheel
        position: "relative",
        cursor: spinning || revealed ? "default" : "pointer",
      }}
      onClick={spinWheel}
    >
      {/* Header */}
      <div
        className="w-full px-5"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 28px)",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(40px, 12cqw, 64px)",
            color: "var(--text-main)",
            letterSpacing: "-1.5px",
            lineHeight: "0.88",
          }}
        >
          Paikutin
        </h1>

        {/* Fixed height subtitle */}
        <div style={{ height: "36px", marginTop: "6px", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={revealed ? "winner" : spinning ? "spinning" : "idle"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: revealed ? "clamp(20px, 5.5cqw, 26px)" : "13px",
                color: revealed ? "var(--brand)" : "var(--text-muted)",
                fontWeight: 800,
                letterSpacing: revealed ? "-0.5px" : "normal",
                lineHeight: 1.2,
              }}
            >
              {revealed && winnerName
                ? `It's ${winnerName}!`
                : spinning
                ? `${places.length} candidates · spinning...`
                : `${places.length} candidates`}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/*
        Wheel sits at the bottom of the flex column.
        SpinWheel internally sizes itself to ~155vw and pulls
        its bottom half below the viewport via negative marginBottom.
        flex:1 pushes it down so only top ~50% shows.
      */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <SpinWheel
          slices={slices}
          spinning={spinning}
          targetIndex={targetIndex}
          winnerIndex={winnerIndex}
          onStop={handleStop}
        />
      </div>

      {/* Pre-spin CTA — pinned to bottom of header block, above the wheel gap */}
      <AnimatePresence>
        {!hasSpun && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute",
              bottom: "calc(min(80vw, 360px) + 32px)",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              animation: "splash-tap-pulse 3s ease-in-out infinite",
            }}>
              Tap anywhere to spin
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
