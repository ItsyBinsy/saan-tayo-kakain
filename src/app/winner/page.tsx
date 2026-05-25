"use client"

import { useStore } from "@/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const PRICE_LABEL: Record<string, string> = {
  PRICE_LEVEL_FREE:           "Free",
  PRICE_LEVEL_INEXPENSIVE:    "₱80 – ₱150 per person",
  PRICE_LEVEL_MODERATE:       "₱150 – ₱300 per person",
  PRICE_LEVEL_EXPENSIVE:      "₱300 – ₱500 per person",
  PRICE_LEVEL_VERY_EXPENSIVE: "₱500+ per person",
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function Winner() {
  const router = useRouter()
  const winner = useStore((state) => state.winner)
  const usedModes = useStore((state) => state.usedModes)
  const places = useStore((state) => state.places)
  useEffect(() => {
    if (!winner) router.push("/filter")
  }, [])

  if (!winner) return null

  const allModesUsed = ["paikutin", "this-or-that", "bahala-na"].every(
    (m) => usedModes.includes(m)
  )

  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(winner.displayName.text + " " + winner.formattedAddress)

  const userRef = places[0]?.location
  let distanceText: string | null = null
  if (userRef && winner.location) {
    const km = getDistanceKm(
      userRef.latitude, userRef.longitude,
      winner.location.latitude, winner.location.longitude
    )
    const m = Math.round(km * 1000)
    const walkMin = Math.round(m / 80)
    distanceText = walkMin <= 1
      ? `${m}m away`
      : `${walkMin} min walk · ${m}m away`
  }

  const priceText = winner.priceLevel ? PRICE_LABEL[winner.priceLevel] : null
  const details = [distanceText, priceText].filter(Boolean) as string[]
  const addressParts = winner.formattedAddress.split(",")
  const shortAddress = addressParts.slice(0, 2).join(" ·").trim()

  return (
    <main
      className="flex flex-col"
      style={{ background: "var(--surface)", height: "100dvh", overflow: "hidden" }}
    >
      {/* Dark hero — name + address */}
      <div
        className="flex flex-col justify-end px-5 pb-5"
        style={{
          background: "var(--surface-dark)",
          minHeight: "38dvh",
          flexShrink: 0,
          paddingTop: "20px",
        }}
      >
        <p
          className="uppercase tracking-widest mb-3"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: "var(--brand)",
            letterSpacing: "0.12em",
          }}
        >
          {allModesUsed ? "Wala nang lusot." : "It's decided."}
        </p>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(40px, 13cqw, 72px)",
            color: "var(--white)",
            letterSpacing: "-1.5px",
            lineHeight: "0.9",
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        >
          {winner.displayName.text}
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          {shortAddress}
        </p>
      </div>

      {/* Details list */}
      <div
        style={{
          borderBottom: "2px solid var(--border)",
          padding: "16px 20px",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "14px",
        }}
      >
        {details.length === 0 && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-muted)" }}>
            Tara na doon!
          </p>
        )}
        {details.map((detail, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              paddingBottom: i < details.length - 1 ? "14px" : 0,
              borderBottom: i < details.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--brand)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--text-main)",
              }}
            >
              {detail}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex flex-col items-center justify-center"
          style={{
            background: "var(--brand)",
            borderBottom: "2px solid var(--border)",
            padding: "18px",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(20px, 6cqw, 26px)",
              color: "var(--white)",
              letterSpacing: "-0.5px",
            }}
          >
            Get directions
          </span>
          <span style={{ color: "var(--white)", fontSize: "18px", marginTop: "2px", opacity: 0.7 }}>→</span>
        </a>

        {!allModesUsed && (
          <button
            onClick={() => router.push("/modes")}
            className="w-full flex items-center justify-center"
            style={{
              background: "var(--surface)",
              padding: "18px",
              border: "none",
              borderTop: "2px solid var(--brand)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(20px, 6cqw, 26px)",
              color: "var(--brand)",
              letterSpacing: "-0.5px",
              cursor: "pointer",
            }}
          >
            Try a different mode
          </button>
        )}

        {allModesUsed && (
          <p
            className="text-center"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-muted)",
              padding: "16px",
            }}
          >
            Nagamit mo na lahat ng modes. Sige na, tara na doon.
          </p>
        )}
      </div>
    </main>
  )
}
