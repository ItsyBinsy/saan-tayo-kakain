"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import LoadingScreen from "@/components/LoadingScreen"
import afterThisOrThatAnim from "@/animations/after-this-or-that.json"
import { motion, AnimatePresence } from "framer-motion"

export default function ThisOrThat() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const usedModes = useStore((state) => state.usedModes)
  const setWinner = useStore((state) => state.setWinner)
  const addUsedMode = useStore((state) => state.addUsedMode)

  const candidates = places.slice(0, 5)
  const [remaining, setRemaining] = useState(candidates)
  const [left, setLeft] = useState(candidates[0])
  const [right, setRight] = useState(candidates[1])
  const [round, setRound] = useState(1)
  const [showLoading, setShowLoading] = useState(false)
  const [picked, setPicked] = useState<"left" | "right" | null>(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (candidates.length < 2) router.replace("/filter")
    else if (!showLoading && usedModes.includes("this-or-that")) router.replace("/winner")
  }, [candidates.length, usedModes, showLoading, router])

  const handlePick = (side: "left" | "right") => {
    if (animating) return
    const winner = side === "left" ? left : right
    setPicked(side)
    setAnimating(true)

    setTimeout(() => {
      const newRemaining = remaining.filter((p) => p !== left && p !== right)
      setPicked(null)
      setAnimating(false)

      if (newRemaining.length === 0) {
        setWinner(winner)
        setShowLoading(true)
        setTimeout(() => {
          addUsedMode("this-or-that")
          router.push("/winner")
        }, 6000)
        return
      }

      const nextRight = newRemaining[0]
      setRemaining(newRemaining.slice(1))
      setLeft(winner)
      setRight(nextRight)
      setRound(r => r + 1)
    }, 420)
  }

  if (showLoading) {
    return (
      <LoadingScreen
        animationData={afterThisOrThatAnim}
        message="The decision has been made."
        sub="Tara na bago ka pa magbago ng isip."
        indicator="dots"
      />
    )
  }

  if (candidates.length < 2) {
    return (
      <main
        className="flex flex-col items-center justify-center"
        style={{ background: "var(--surface-dark)", height: "100dvh" }}
      >
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "14px" }}>
          No places found. Go back and search again.
        </p>
      </main>
    )
  }

  return (
    <main
      className="flex flex-col"
      style={{ background: "var(--surface)", height: "100dvh", overflow: "hidden" }}
    >
      {/* Header */}
      <div
        className="flex flex-col justify-end px-5 pb-5"
        style={{
          height: "30dvh",
          flexShrink: 0,
          paddingTop: "calc(env(safe-area-inset-top) + 20px)",
        }}
      >
        <p
          className="uppercase tracking-widest mb-3"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: "var(--brand)",
            letterSpacing: "0.12em",
          }}
        >
          Round {round} of {candidates.length - 1}
        </p>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(56px, 18cqw, 88px)",
            color: "var(--text-main)",
            letterSpacing: "-2px",
            lineHeight: "0.88",
          }}
        >
          This or<br />That?
        </h1>
      </div>

      {/* Two cards side by side */}
      <div
        style={{
          borderTop: "2px solid var(--border)",
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
        }}
      >
        {/* Option A */}
        <motion.button
          onClick={() => handlePick("left")}
          className="flex flex-col text-left"
          style={{
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
            padding: "20px 16px",
            cursor: animating ? "default" : "pointer",
            overflow: "hidden",
            justifyContent: "space-between",
            originY: 1,
          }}
          animate={
            picked === "right"
              ? { y: "105%", opacity: 0 }
              : picked === "left"
              ? { scale: 1.03 }
              : { y: 0, opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.35, ease: "easeIn" }}
          whileTap={animating ? {} : { scale: 0.97 }}
        >
          <p
            className="uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              color: "var(--brand)",
              letterSpacing: "0.12em",
              flexShrink: 0,
            }}
          >
            Option A
          </p>
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(22px, 6.5cqw, 34px)",
              color: "var(--text-main)",
              lineHeight: 1.05,
              letterSpacing: "-0.5px",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {left?.displayName.text}
          </p>
        </motion.button>

        {/* Option B */}
        <motion.button
          onClick={() => handlePick("right")}
          className="flex flex-col text-left"
          style={{
            background: "var(--surface)",
            padding: "20px 16px",
            cursor: animating ? "default" : "pointer",
            overflow: "hidden",
            justifyContent: "space-between",
            originY: 1,
          }}
          animate={
            picked === "left"
              ? { y: "105%", opacity: 0 }
              : picked === "right"
              ? { scale: 1.03 }
              : { y: 0, opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.35, ease: "easeIn" }}
          whileTap={animating ? {} : { scale: 0.97 }}
        >
          <p
            className="uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              color: "var(--brand)",
              letterSpacing: "0.12em",
              flexShrink: 0,
            }}
          >
            Option B
          </p>
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(22px, 6.5cqw, 34px)",
              color: "var(--text-main)",
              lineHeight: 1.05,
              letterSpacing: "-0.5px",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {right?.displayName.text}
          </p>
        </motion.button>
      </div>

      {/* Bottom hint */}
      <div
        className="flex items-center justify-center"
        style={{
          borderTop: "2px solid var(--border)",
          background: "var(--surface)",
          padding: "12px",
          flexShrink: 0,
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={animating ? "eliminating" : "idle"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            {animating ? "Eliminated." : "Tap to pick · loser is eliminated"}
          </motion.p>
        </AnimatePresence>
      </div>
    </main>
  )
}
