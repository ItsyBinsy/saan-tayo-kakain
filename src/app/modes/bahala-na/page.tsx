"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { useHydrated } from "@/hooks/useHydrated"
import LoadingScreen from "@/components/LoadingScreen"
import bahalaNaAnim from "@/animations/bahala-na.json"

export default function BahalaNa() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const setWinner = useStore((state) => state.setWinner)
  const addUsedMode = useStore((state) => state.addUsedMode)
  const usedModes = useStore((state) => state.usedModes)

  const hydrated = useHydrated()

  useEffect(() => {
    if (!hydrated) return
    if (places.length === 0) { router.push("/filter"); return }

    if (!usedModes.includes("bahala-na")) {
      const winner = Math.floor(Math.random() * places.length)
      setWinner(places[winner])
      addUsedMode("bahala-na")
    }

    const timer = setTimeout(() => {
      router.push("/winner")
    }, 6000)

    return () => clearTimeout(timer)
  }, [hydrated, places, router, setWinner, addUsedMode, usedModes])

  return (
    <LoadingScreen
      animationData={bahalaNaAnim}
      message="Picking one for you..."
      sub="Huwag sana itong ayaw mo."
      indicator="dots"
    />
  )
}
