"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const STORAGE_KEY = "onboarding_seen"

const cards = [
  {
    headline: "No more\n\"kahit saan.\"",
    body: "Tell us where you are, set your vibe, pick a game mode. We handle the rest.",
    note: "Nearby = 200m.  Wider = 1.5km.",
  },
  {
    headline: "Results depend\non Google Maps.",
    body: "Not all places are listed, and some hours aren't updated. Always check before heading out.",
    note: null,
  },
  {
    headline: "Your location\nstays on your phone.",
    body: "We only use it to find food near you. Nothing is stored, nothing is shared.",
    note: null,
  },
]

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false
  return !localStorage.getItem(STORAGE_KEY)
}

export function markOnboardingSeen() {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, "1")
}

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const dragStartX = useRef(0)
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
        background: "var(--surface-dark)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Skip */}
      <div className="flex justify-end px-5 pt-4" style={{ flexShrink: 0 }}>
        {!isLast && (
          <button
            onClick={skip}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-muted)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            Skip
          </button>
        )}
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col justify-center px-6" style={{ minHeight: 0, overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{ cursor: "grab", userSelect: "none" }}
          >
            <h2
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(48px, 16cqw, 72px)",
                color: "var(--white)",
                letterSpacing: "-1px",
                lineHeight: 0.9,
                marginBottom: "24px",
                whiteSpace: "pre-line",
              }}
            >
              {card.headline}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "15px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
                marginBottom: card.note ? "16px" : 0,
              }}
            >
              {card.body}
            </p>
            {card.note && (
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  opacity: 0.6,
                }}
              >
                {card.note}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + CTA */}
      <div className="flex flex-col items-center gap-5 px-6 pb-6" style={{ flexShrink: 0 }}>
        {/* Dots */}
        <div className="flex gap-2">
          {cards.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i === index ? "var(--white)" : "var(--text-muted)",
                opacity: i === index ? 1 : 0.4,
                transition: "width 200ms ease, opacity 200ms ease",
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={next}
          style={{
            background: isLast ? "var(--brand)" : "var(--white)",
            color: isLast ? "var(--white)" : "var(--surface-dark)",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(18px, 5cqw, 22px)",
            letterSpacing: "0.5px",
            padding: "16px",
            border: "none",
            borderRadius: "6px",
            width: "100%",
            cursor: "pointer",
          }}
        >
          {isLast ? "Got it, let's eat →" : "Next →"}
        </button>
      </div>
    </div>
  )
}
