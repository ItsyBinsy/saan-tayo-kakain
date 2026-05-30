"use client"

import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { motion } from "framer-motion"
import PageTransition from "@/components/PageTransition"
import { useEffect, useRef } from "react"
import { useHydrated } from "@/hooks/useHydrated"

export default function Modes() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const usedModes = useStore((state) => state.usedModes)
  const hydrated = useHydrated()
  const navigating = useRef(false)

  useEffect(() => {
    if (hydrated && places.length === 0) router.replace("/filter")
  }, [hydrated, places, router])

  const modes = [
    { id: "paikutin", name: "Paikutin", sub: "Spin the wheel" },
    { id: "this-or-that", name: "This or That", sub: "Eliminate one by one" },
    { id: "bahala-na", name: "Bahala Na", sub: "Instant pick" },
  ]

  if (!hydrated) return (
    <div style={{ background: "var(--surface-dark)", height: "100dvh" }} />
  )

  return (
    <PageTransition>
      <main
        className="flex flex-col"
        style={{
          background: "var(--surface-dark)",
          height: "100dvh",
          overflow: "hidden"
        }}
    >
      {/* Context — top */}
      <div className="modes-hero flex flex-col justify-end pb-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <p
          className="uppercase tracking-widest mb-2 px-5"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "0.12em",
          }}
        >
          {places.length} places found near you
        </p>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(72px, 28cqw, 130px)",
            color: "var(--white)",
            letterSpacing: "-1px",
            lineHeight: "0.88",
            width: "100%",
            paddingLeft: "16px",
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            style={{ display: "block" }}
          >
            Ano,
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
            style={{ display: "block" }}
          >
            tara?
          </motion.span>
        </h1>
        <p
          className="mt-2 px-5"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
          }}
        >
          Pick how we decide.
        </p>
      </div>

      {/* Actions */}
      <div
        className="modes-actions"
        style={{
          background: "var(--surface)",
          borderTop: "2px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {modes.map((mode, index) => {
          const isUsed = usedModes.includes(mode.id)
          const isUnavailable = (mode.id === "this-or-that" || mode.id === "paikutin") && places.length < 2
          const isDisabled = isUsed || isUnavailable
          return (
            <button
              key={mode.id}
              onClick={() => {
                if (isDisabled || navigating.current) return
                navigating.current = true
                router.push(`/modes/${mode.id}`)
              }}
              aria-disabled={isDisabled}
              aria-label={isUsed ? `${mode.name} — already used` : isUnavailable ? `${mode.name} — needs at least 2 places` : mode.name}
              className="w-full flex items-center justify-between px-6"
              style={{
                borderBottom: index < 2 ? "1.5px solid var(--border)" : "none",
                background: "transparent",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.35 : 1,
                flex: 1,
              }}
            >
              <div className="flex flex-col items-start">
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(36px, 9cqw, 48px)",
                    color: "var(--text-main)",
                    letterSpacing: "-0.5px",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {mode.name}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(12px, 3cqw, 14px)",
                    color: isDisabled ? "var(--text-muted)" : "#9C8060",
                    marginTop: "4px",
                  }}
                >
                  {isUsed ? "Already used" : isUnavailable ? "Needs 2+ places" : mode.sub}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "26px",
                  color: isUsed ? "var(--text-muted)" : "var(--brand)",
                  fontWeight: 700,
                  flexShrink: 0,
                  marginLeft: "12px",
                }}
              >
                →
              </span>
            </button>
          )
        })}
      </div>
      </main>
    </PageTransition>
  )
}
