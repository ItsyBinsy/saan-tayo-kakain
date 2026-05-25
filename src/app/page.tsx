"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()

  return (
    <main
      className="flex flex-col items-center justify-center relative cursor-pointer"
      style={{
        background: "var(--surface-dark)",
        minHeight: "100dvh",
        overflow: "hidden",
      }}
      onClick={() => router.push("/filter")}
    >
      <motion.div
        className="flex flex-col items-center gap-4 text-center px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--brand)" }}
        >
          <span className="text-3xl">🍴</span>
        </div>

        <div>
          <h1
            className="leading-none"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              color: "var(--white)",
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        Tap anywhere to start
      </motion.p>
    </main>
  )
}