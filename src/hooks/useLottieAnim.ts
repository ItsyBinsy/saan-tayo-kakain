"use client"

import { useState, useEffect } from "react"

export function useLottieAnim(path: string) {
  const [animData, setAnimData] = useState<object | null>(null)

  useEffect(() => {
    fetch(path).then(r => r.json()).then(setAnimData)
  }, [path])

  return animData
}
