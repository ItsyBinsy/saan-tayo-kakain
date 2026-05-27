"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import LoadingScreen from "@/components/LoadingScreen"
import afterThisOrThatAnim from "@/animations/after-this-or-that.json"

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

  useEffect(() => {
    if (candidates.length < 2) router.replace("/filter")
    else if (!showLoading && usedModes.includes("this-or-that")) router.replace("/winner")
  }, [candidates.length, usedModes, showLoading, router])

  const handlePick = (winner: typeof candidates[0]) => {
    const newRemaining = remaining.filter((p) => p !== left && p !== right)
    if (newRemaining.length === 0) {
      setWinner(winner)
      addUsedMode("this-or-that")
      setShowLoading(true)
      setTimeout(() => router.push("/winner"), 6000)
      return
    }
    const nextRight = newRemaining[0]
    setRemaining(newRemaining.slice(1))
    setLeft(winner)
    setRight(nextRight)
    setRound(round + 1)
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
          height: "42dvh",
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
          Round {round} of 4
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
        <button
          onClick={() => handlePick(left)}
          className="flex flex-col text-left"
          style={{
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
            padding: "20px 16px",
            cursor: "pointer",
            overflow: "hidden",
            justifyContent: "space-between",
          }}
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
        </button>

        {/* Option B */}
        <button
          onClick={() => handlePick(right)}
          className="flex flex-col text-left"
          style={{
            background: "var(--surface)",
            padding: "20px 16px",
            cursor: "pointer",
            overflow: "hidden",
            justifyContent: "space-between",
          }}
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
        </button>
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
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          Tap to pick · loser is eliminated
        </p>
      </div>
    </main>
  )
}
