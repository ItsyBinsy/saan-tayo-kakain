"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import splashAnim from "@/animations/splash.json"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.prefetch("/filter")
  }, [router])

  return (
    <main
      role="button"
      tabIndex={0}
      aria-label="Tap to start"
      className="flex flex-col items-center justify-center relative cursor-pointer"
      style={{
        background: "var(--surface)",
        minHeight: "100dvh",
        overflow: "hidden",
      }}
      onClick={() => router.push("/filter")}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push("/filter") }}
    >
      <motion.div
        className="flex flex-col items-center gap-4 text-center px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div
          className="w-52 h-52 rounded-full flex items-center justify-center"
        >
          <Lottie
            animationData={splashAnim}
            loop
            style={{ width: "clamp(120px, 38vw, 192px)", height: "clamp(120px, 38vw, 192px)", marginBottom: -58 }}
          />
        </div>

        <div>
          <h1
            className="leading-none"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              color: "var(--text-main)",
              letterSpacing: "-1px",
              lineHeight: "0.88",
              fontSize: "clamp(72px, 22cqw, 110px)",
            }}
          >
            Saan<br />Tayo<br />Kakain
          </h1>
          <p
            className="text-sm mt-3"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
          >
            Tabi. Ako na.
          </p>
        </div>
      </motion.div>

      <motion.p
        className="absolute bottom-8 text-xs uppercase tracking-widest"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 0.5, 0.5, 0.2, 0.5], y: [8, 0, -4, 0, -4] }}
        transition={{ delay: 1, duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        Tap anywhere to start
      </motion.p>
    </main>
  )
}