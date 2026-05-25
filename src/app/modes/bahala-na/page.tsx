"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"

export default function BahalaNa() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const setWinner = useStore((state) => state.setWinner)

  const addUsedMode = useStore((state) => state.addUsedMode)
  const usedModes = useStore((state) => state.usedModes)

  useEffect(() => {
    if (places.length === 0) { router.push("/filter"); return }
    
    if (!usedModes.includes("bahala-na")) {
      const winner = Math.floor(Math.random() * places.length)
      setWinner(places[winner])
      addUsedMode("bahala-na")
    }

    const timer = setTimeout(() => {
      router.push("/winner")
    }, 1500)

    return () => clearTimeout(timer)
  }, [places, router, setWinner, addUsedMode, usedModes])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[var(--surface)]">
      <div className="text-center px-6">
        <p className="text-xs uppercase tracking-widest text-[var(--brand)] mb-4">
          Bahala Na
        </p>
        <h1 className="text-4xl font-semibold text-[var(--text-main)] mb-2">
          Pinipili na...
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Ako na bahala.
        </p>
      </div>
    </main>
  )
}