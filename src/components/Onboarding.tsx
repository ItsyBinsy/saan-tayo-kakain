"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { markOnboardingSeen } from "@/lib/onboarding"

const cards: { headline: React.ReactNode; body: string; note: string | null }[] = [
  {
    headline: <>No more<br />"kahit saan."</>,
    body: "Tell me where you are. The universe picks from there.",
    note: "Nearby = within 200m.  Wider = within 1.5km.",
  },
  {
    headline: <>Powered by<br />Google&nbsp;Maps.</>,
    body: "Open places only. Stores with no listed hours may still show up.",
    note: null,
  },
  {
    headline: <>Your location<br />stays on your device.</>,
    body: "Your location is used to find food near you. Nothing stored, nothing shared.",
    note: null,
  },
  {
    headline: <>Add to your<br />home screen.</>,
    body: "For the best experience, install it like an app. No App Store needed.",
    note: "iOS: Share → Add to Home Screen\nAndroid: Menu (⋮) → Install app",
  },
]

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const isLast = index === cards.length - 1

  function next() {
    if (isLast) {
      markOnboardingSeen()
      onDone()
      return
    }
    setDirection(1)
    setIndex(i => i + 1)
  }

  function skip() {
    markOnboardingSeen()
    onDone()
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const swipe = info.offset.x + info.velocity.x * 0.3
    if (swipe < -40 && !isLast) {
      setDirection(1)
      setIndex(i => i + 1)
    } else if (swipe > 40 && index > 0) {
      setDirection(-1)
      setIndex(i => i - 1)
    }
  }

  const card = cards[index]

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Dark top — headline + body */}
      <div
        className="flex-1 flex flex-col justify-center"
        style={{
          background: "var(--surface-dark)",
          padding: "28px",
          paddingTop: "calc(env(safe-area-inset-top) + 28px)",
          minHeight: 0,
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={handleDragEnd}
            style={{ userSelect: "none" }}
          >
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(52px, 17cqw, 76px)",
                color: "var(--white)",
                letterSpacing: "-1px",
                lineHeight: 0.88,
                marginBottom: "24px",
              }}
            >
              {card.headline}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                color: "#C4B49A",
                lineHeight: 1.65,
                marginBottom: 0,
              }}
            >
              {card.body}
            </p>
            {card.note && (
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "#9A8A72",
                  lineHeight: 1.8,
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid #2E2216",
                  whiteSpace: "pre-line",
                }}
              >
                {card.note}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cream bottom — dots + CTA + skip */}
      <div
        style={{
          background: "var(--surface)",
          borderTop: "2px solid var(--border)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 28px",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)",
        }}
      >
        {/* Dots */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", justifyContent: "center", width: "100%" }}>
          {cards.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? "22px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i === index ? "var(--text-main)" : "var(--border)",
                transition: "width 220ms ease, background 220ms ease",
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={next}
          style={{
            background: "var(--text-main)",
            color: "var(--white)",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(19px, 5cqw, 23px)",
            letterSpacing: "0.5px",
            padding: "16px",
            border: "none",
            borderRadius: "4px",
            width: "100%",
            cursor: "pointer",
            marginBottom: "4px",
          }}
        >
          {isLast ? "Got it, let's eat →" : "Next →"}
        </button>

        {/* Skip */}
        <div style={{ height: "36px", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          {!isLast && (
            <button
              onClick={skip}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 16px",
              }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
