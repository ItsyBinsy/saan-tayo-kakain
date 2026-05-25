"use client"

import { useStore } from "@/store"
import { useRouter } from "next/navigation"

export default function Winner() {
  const router = useRouter()
  const winner = useStore((state) => state.winner)

  if (!winner) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-[var(--surface)]">
        <p className="text-[var(--text-muted)]">Walang winner. Go back and spin again.</p>
        <button
          onClick={() => router.push("/filter")}
          className="mt-4 px-6 py-3 rounded-full bg-[var(--text-main)] text-[var(--white)] text-sm"
        >
          Go back
        </button>
      </main>
    )
  }

  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(winner.displayName.text + " " + winner.formattedAddress)

  return (
    <main className="flex flex-col min-h-screen p-6 bg-[var(--surface)]">
      <h1 className="text-4xl font-semibold text-[var(--text-main)] mb-2">
        Napili na!
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Tara na, gutom na tayo.
      </p>

      <div className="bg-white rounded-2xl border border-[var(--border-soft)] p-6">
        <p className="text-xs uppercase tracking-widest text-[var(--brand)] mb-2">
          Winner
        </p>
        <h2 className="text-2xl font-semibold text-[var(--text-main)] mb-1">
          {winner.displayName.text}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          {winner.formattedAddress}
        </p>

        
        <a href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 rounded-2xl text-sm font-medium bg-[var(--brand)] text-[var(--white)] flex items-center justify-center gap-2 mb-3"
        >
          Get directions
        </a>

        <button
          onClick={() => router.push("/filter")}
          className="w-full py-4 rounded-2xl text-sm font-medium border border-[var(--border-soft)] bg-white text-[var(--text-main)]"
        >
          Try again
        </button>
      </div>
    </main>
  )
}