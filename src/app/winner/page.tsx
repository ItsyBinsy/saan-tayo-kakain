"use client"

import { useStore } from "@/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Winner() {
  const router = useRouter()
  const winner = useStore((state) => state.winner)
  const usedModes = useStore((state) => state.usedModes)

  useEffect(() => {
    if (!winner) router.push("/filter")
  }, [])

  if (!winner) return null

  const allModesUsed = ["paikutin", "this-or-that", "bahala-na"].every(
    (mode) => usedModes.includes(mode)
  )
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(winner.displayName.text + " " + winner.formattedAddress)

  return (
    <main className="flex flex-col min-h-screen p-6 bg-[var(--surface)]">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--brand)] mb-2">
          {allModesUsed ? "Wala nang lusot." : "Napili na."}
        </p>
        <h1 className="text-4xl font-semibold text-[var(--text-main)] mb-2">
          {winner.displayName.text}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {winner.formattedAddress}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        
        <a href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 rounded-2xl text-sm font-medium bg-[var(--text-main)] text-[var(--white)] flex items-center justify-center gap-2"
        >
          Get directions
        </a>

        {!allModesUsed && (
          <button
            onClick={() => router.push("/modes")}
            className="w-full py-4 rounded-2xl text-sm font-medium border border-[var(--border-soft)] bg-white text-[var(--text-muted)]"
          >
            Try a different mode
          </button>
        )}
      </div>

      {allModesUsed && (
        <p className="text-xs text-center text-[var(--text-muted)] mt-6">
          Nagamit mo na lahat ng modes. Sige na, tara na doon.
        </p>
      )}
    </main>
  )
}