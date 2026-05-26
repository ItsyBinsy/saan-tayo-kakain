"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { Wheel } from "react-custom-roulette"
import LoadingScreen from "@/components/LoadingScreen"
import afterPaikutinAnim from "@/animations/after-paikutin.json"


export default function Paikutin() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const setWinner = useStore((state) => state.setWinner)
  const addUsedMode = useStore((state) => state.addUsedMode)

  const [spinning, setSpinning] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (places.length === 0) router.push("/filter")
  }, [])

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max - 1) + "…" : text

  const data = places.map((place) => ({
    option: truncate(place.displayName.text, 14),
  }))

  const spinWheel = () => {
    if (spinning) return
    const winner = Math.floor(Math.random() * places.length)
    setPrizeNumber(winner)
    setSpinning(true)
  }

  const handleStop = () => {
    setSpinning(false)
    setWinner(places[prizeNumber])
    addUsedMode("paikutin")
    setShowLoading(true)
    setTimeout(() => router.push("/winner"), 6000)
  }

  if (showLoading) {
    return (
      <LoadingScreen
        animationData={afterPaikutinAnim}
        message="And the winner is..."
        sub="Wag sana itong ayaw mo."
        indicator="bar"
      />
    )
  }

  if (places.length === 0) {
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
      style={{
        background: "var(--surface-dark)",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col justify-end px-5 pb-5"
        style={{ height: "28dvh", flexShrink: 0 }}
      >
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(56px, 18cqw, 88px)",
            color: "var(--white)",
            letterSpacing: "-2px",
            lineHeight: "0.85",
          }}
        >
          Paikutin
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          {places.length} candidates · {spinning ? "spinning..." : "tap to spin"}
        </p>
      </div>

      {/* Wheel area — all dark, tap anywhere */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          borderTop: "3px solid var(--text-muted)",
          flex: 1,
          minHeight: 0,
          cursor: spinning ? "default" : "pointer",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        onClick={spinWheel}
      >
        <Wheel
          mustStartSpinning={spinning}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={handleStop}
          backgroundColors={[
            "#C41E3A", "#F5F0E8", "#8B1020", "#F5F0E8",
            "#C41E3A", "#F5F0E8", "#8B1020", "#F5F0E8",
            "#C41E3A", "#F5F0E8",
          ]}
          textColors={[
            "#F5F0E8", "#1A1208", "#F5F0E8", "#1A1208",
            "#F5F0E8", "#1A1208", "#F5F0E8", "#1A1208",
            "#F5F0E8", "#1A1208",
          ]}
          outerBorderColor="#F5F0E8"
          outerBorderWidth={3}
          innerBorderColor="#F5F0E8"
          innerBorderWidth={0}
          radiusLineColor="#F5F0E8"
          radiusLineWidth={1}
          fontSize={10}
          pointerProps={{
            style: { display: "none" },
          }}
        />
      </div>
    </main>
  )
}
