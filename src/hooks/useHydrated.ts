"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/store"

export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated())

  useEffect(() => {
    if (useStore.persist.hasHydrated()) { setHydrated(true); return }
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [])

  return hydrated
}
