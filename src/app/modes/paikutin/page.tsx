"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { Wheel } from "react-custom-roulette"

export default function Paikutin() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const setWinner = useStore((state) => state.setWinner)

  const [spinning, setSpinning] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)

  const data = places.map((place) => ({
    option: place.displayName.text
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
    router.push("/winner")
  }

  if (places.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-[var(--surface)]">
        <p className="text-[var(--text-muted)]">
          No places found. Go back and search again.
        </p>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-6 bg-[var(--surface)]">

      <div className="w-full mb-8">
        <h1 className="text-4xl font-semibold text-[var(--text-main)] mb-2">
          Paikutin
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {places.length} candidates
        </p>
      </div>

      <Wheel
        mustStartSpinning={spinning}
        prizeNumber={prizeNumber}
        data={data}
        onStopSpinning={handleStop}
        backgroundColors={[
          "#4F46E5", "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE",
          "#E0E7FF", "#4F46E5", "#6366F1", "#818CF8", "#A5B4FC",
        ]}
        textColors={["#FAFAFA"]}
        outerBorderColor="#0D0F1A"
        outerBorderWidth={4}
        innerBorderColor="#0D0F1A"
        innerBorderWidth={2}
        radiusLineColor="#0D0F1A"
        radiusLineWidth={1}
        fontSize={10}
      />

      <button
        onClick={spinWheel}
        disabled={spinning}
        className={`mt-8 px-12 py-4 rounded-full text-sm font-medium transition-colors ${
          spinning
            ? "bg-[var(--border-soft)] text-[var(--text-muted)]"
            : "bg-[var(--text-main)] text-[var(--white)]"
        }`}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>

    </main>
  )

}

