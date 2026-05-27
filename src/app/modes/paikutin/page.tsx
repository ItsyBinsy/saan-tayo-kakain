"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/LoadingScreen"
import afterPaikutinAnim from "@/animations/after-paikutin.json"

const Wheel = dynamic(() => import("react-custom-roulette").then(m => m.Wheel), { ssr: false })


export default function Paikutin() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const usedModes = useStore((state) => state.usedModes)
  const setWinner = useStore((state) => state.setWinner)
  const addUsedMode = useStore((state) => state.addUsedMode)

  const [spinning, setSpinning] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (places.length === 0) router.replace("/filter")
    else if (!showLoading && usedModes.includes("paikutin")) router.replace("/winner")
  }, [places, usedModes, showLoading, router])

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
      className="flex flex-col items-center"
      style={{
        background: "var(--surface)",
        height: "100dvh",
        overflow: "hidden",
        paddingTop: "calc(env(safe-area-inset-top) + 32px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onClick={spinWheel}
    >
      {/* Title — small, above the wheel */}
      <div className="w-full px-5 mb-4" style={{ flexShrink: 0 }}>
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
        <p
          className="mt-1"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          {places.length} candidates · {spinning ? "spinning..." : "tap anywhere to spin"}
        </p>
      </div>

      {/* Wheel — hero element, takes remaining space */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          cursor: spinning ? "default" : "pointer",
        }}
      >
        <div style={{
          filter: "drop-shadow(0px 8px 24px rgba(26,18,8,0.22)) drop-shadow(0px 2px 6px rgba(196,30,58,0.18))",
          borderRadius: "50%",
        }}>
          <Wheel
            mustStartSpinning={spinning}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={handleStop}
            backgroundColors={[
              "#C41E3A", "#1A1208", "#A01830", "#2A1F10",
              "#C41E3A", "#1A1208", "#A01830", "#2A1F10",
              "#C41E3A", "#1A1208",
            ]}
            textColors={[
              "#F5F0E8", "#F5F0E8", "#F5F0E8", "#F5F0E8",
              "#F5F0E8", "#F5F0E8", "#F5F0E8", "#F5F0E8",
              "#F5F0E8", "#F5F0E8",
            ]}
            outerBorderColor="#1A1208"
            outerBorderWidth={6}
            innerRadius={10}
            innerBorderColor="#C41E3A"
            innerBorderWidth={6}
            radiusLineColor="#1A1208"
            radiusLineWidth={1}
            fontSize={10}
            fontWeight={700}
            pointerProps={{
              style: { display: "none" },
            }}
          />
        </div>
      </div>
    </main>
  )

}
