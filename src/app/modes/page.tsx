"use client"

import { useRouter } from "next/navigation"
import { useStore } from "@/store"

export default function Modes() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const usedModes = useStore((state) => state.usedModes)

  const modes = [
    { id: "paikutin", name: "Paikutin", sub: "Spin the wheel" },
    { id: "this-or-that", name: "This or That", sub: "Eliminate one by one" },
    { id: "bahala-na", name: "Bahala Na", sub: "Instant pick" },
  ]

  return (
    <main
      className="flex flex-col"
      style={{
        background: "var(--surface-dark)",
        height: "100dvh",
        overflow: "hidden"
      }}
    >
      {/* Context — top */}
      <div className="modes-hero flex flex-col justify-end pb-6">
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
          Ano,<br />tara?
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
        }}
      >
        {modes.map((mode, index) => {
          const isUsed = usedModes.includes(mode.id)
          return (
            <button
              key={mode.id}
              onClick={() => !isUsed && router.push(`/modes/${mode.id}`)}
              className="w-full flex items-center justify-between px-6"
              style={{
                borderBottom: index < 2 ? "1.5px solid var(--border)" : "none",
                background: "transparent",
                cursor: isUsed ? "not-allowed" : "pointer",
                opacity: isUsed ? 0.35 : 1,
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
                    color: isUsed ? "var(--text-muted)" : "#9C8060",
                    marginTop: "4px",
                  }}
                >
                  {isUsed ? "Already used" : mode.sub}
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
  )
}
