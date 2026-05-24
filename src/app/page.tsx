"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/filter")
    }, 2500)

    return () => clearTimeout(timer) 
  }, [router])

  return(
    <main className="flex flex-col items-center justify-center min-h-screen bg-[var(--splash-bg)]">
      <motion.div 
        className="flex flex-col gap-4 items-center text-center px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center bg-[var(--brand)]">
          <span className="text-3xl">🍴</span>
        </div>

        <div>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--white)]">
            Saan Tayo <br />Kakain
          </h1>
          <p className="text-sm mt-2 text-[var(--text-muted)]">
            Tabi. Ako na.
          </p>
        </div>
      </motion.div>
    </main>
  ) 
}