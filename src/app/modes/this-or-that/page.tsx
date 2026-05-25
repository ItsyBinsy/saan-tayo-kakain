"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"

export default function ThisOrThat() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const setWinner = useStore((state) => state.setWinner)

  const candidates = places.slice(0, 5)
  const [remaining, setRemaining] = useState(candidates)
  const [left, setLeft] = useState(candidates[0])
  const [right, setRight] = useState(candidates[1])
  const [round, setRound] = useState(1)

  const handlePick = (winner: typeof candidates[0]) => {
    const newRemaining = remaining.filter(
      (p) => p !== left && p !== right
    )

    if (newRemaining.length === 0) {
      setWinner(winner)
      router.push("/winner")
      return
    }

    const nextRight = newRemaining[0]
    setRemaining(newRemaining.slice(1))
    setLeft(winner)
    setRight(nextRight)
    setRound(round + 1)
  }


  if (candidates.length === 0) {
      return (
        <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-[var(--surface)]">
          <p className="text-[var(--text-muted)]">No places found. Go back and search again.</p>
        </main>
      )
    }

    return (
      <main className="flex flex-col min-h-screen p-6 bg-[var(--surface)]">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-[var(--text-main)] mb-2">
            This or That
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Round {round} of 4
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4">

          <button
            onClick={() => handlePick(left)}
            className="w-full p-6 rounded-2xl border bg-white border-[var(--border-soft)] text-left active:bg-[var(--brand-light)] transition-colors"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--brand)] mb-2">
              Option A
            </p>
            <p className="text-lg font-semibold text-[var(--text-main)]">
              {left?.displayName.text}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {left?.formattedAddress}
            </p>
          </button>

          <div className="text-center text-sm font-medium text-[var(--text-muted)]">
            or
          </div>

          <button
            onClick={() => handlePick(right)}
            className="w-full p-6 rounded-2xl border bg-white border-[var(--border-soft)] text-left active:bg-[var(--brand-light)] transition-colors"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--brand)] mb-2">
              Option B
            </p>
            <p className="text-lg font-semibold text-[var(--text-main)]">
              {right?.displayName.text}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {right?.formattedAddress}
            </p>
          </button>

        </div>

      </main>
    )
  }