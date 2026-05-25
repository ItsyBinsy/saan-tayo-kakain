"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { MapPin } from "lucide-react"

export default function Filter() {
  const router = useRouter()
  const [mealType, setMealType] = useState("All")
  const [budget, setBudget] = useState("Any")
  const setPlaces = useStore((state) => state.setPlaces)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoryMap: Record<string, string> = {
    "All":       "restaurant or cafe or food near me",
    "Rice meal": "Filipino restaurant or carinderia or turo-turo",
    "Fast food": "fast food restaurant",
    "Merienda":  "cafe or bakery or bread",
    "Dessert":   "dessert shop or ice cream or milk tea",
    "Drinks":    "cafe or juice bar or milk tea or smoothie",
  }

  const priceLevelMap: Record<string, number> = {
    "Any":  Infinity,
    "₱100": 1,
    "₱200": 2,
    "₱300": 3,
    "₱400": 4,
  }

  const mealTypes = [
    { label: "All",       icon: "🍽️" },
    { label: "Rice meal", icon: "🍚" },
    { label: "Fast food", icon: "🍔" },
    { label: "Merienda",  icon: "☕" },
    { label: "Dessert",   icon: "🍨" },
    { label: "Drinks",    icon: "🧋" },
  ]

  const fetchPlaces = async () => {
    setError(null)
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch("/api/places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              textQuery: categoryMap[mealType],
              latitude,
              longitude,
            }),
          })
          if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error ?? "Failed to fetch places")
          }
          const data = await response.json()
          const allPlaces = (data.places ?? [])
          const maxLevel = priceLevelMap[budget]
          const filtered = allPlaces.filter((p: any) => {
            if (!p.priceLevel || p.priceLevel === "PRICE_LEVEL_UNSPECIFIED") return true
            const levels = [
              "PRICE_LEVEL_FREE",
              "PRICE_LEVEL_INEXPENSIVE",
              "PRICE_LEVEL_MODERATE",
              "PRICE_LEVEL_EXPENSIVE",
              "PRICE_LEVEL_VERY_EXPENSIVE"
            ]
            return levels.indexOf(p.priceLevel) <= maxLevel
          })
          if (filtered.length === 0) {
            setError("No places found. Try a different filter.")
            setLoading(false)
            return
          }
          setPlaces(filtered.slice(0, 10))
          router.push("/modes")
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong.")
          setLoading(false)
        }
      },
      (geoError) => {
        setLoading(false)
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Location permission denied. Please enable it in your browser settings.")
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError("Could not determine your location.")
        } else {
          setError("Location request timed out.")
        }
      },
      { timeout: 10000 }
    )
  }

  return (
    <main
      className="flex flex-col"
      style={{
        background: "var(--surface)",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: "2px solid var(--border)", flexShrink: 0 }}
      >
        <div
          className="flex items-center gap-1 mb-3"
          style={{ color: "var(--brand)", fontFamily: "var(--font-body)" }}
        >
          <MapPin size={10} strokeWidth={2.5} />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            España · Manila
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(44px, 14cqw, 64px)",
            letterSpacing: "-1px",
            lineHeight: "0.88",
            color: "var(--text-main)",
          }}
        >
          Anong gusto<br />mo ngayon?
        </h1>
      </div>

      {/* Meal type grid — fills remaining space */}
      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
          minHeight: 0,
        }}
      >
        {mealTypes.map((item, index) => {
          const isSelected = mealType === item.label
          const isLastRow = index >= 4
          const isRightCol = index % 2 === 1
          return (
            <button
              key={item.label}
              onClick={() => setMealType(item.label)}
              className="flex flex-col justify-between text-left"
              style={{
                padding: "14px 16px",
                borderRight: !isRightCol ? "1.5px solid var(--border)" : "none",
                borderBottom: !isLastRow ? "1.5px solid var(--border)" : "none",
                background: isSelected ? "var(--brand)" : "transparent",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(16px, 4.5cqw, 22px)",
                  color: isSelected ? "var(--white)" : "var(--text-main)",
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: "clamp(22px, 6cqw, 30px)",
                  alignSelf: "flex-end",
                  lineHeight: 1,
                }}
              >
                {item.icon}
              </span>
            </button>
          )
        })}
      </div>

      {/* Budget row */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          borderTop: "2px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {["Any", "₱100", "₱200", "₱300", "₱400"].map((item) => {
          const isSelected = budget === item
          return (
            <button
              key={item}
              onClick={() => setBudget(item)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "4px",
                border: "1.5px solid var(--border)",
                background: isSelected ? "var(--brand)" : "transparent",
                color: isSelected ? "var(--white)" : "var(--text-main)",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <p
          className="text-xs text-center px-5 pb-1"
          style={{ color: "var(--brand)", fontFamily: "var(--font-body)", flexShrink: 0 }}
        >
          {error}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={fetchPlaces}
        disabled={loading}
        style={{
          background: loading ? "var(--text-muted)" : "var(--text-main)",
          color: "var(--white)",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(18px, 5cqw, 22px)",
          letterSpacing: "0.5px",
          padding: "16px",
          border: "none",
          borderTop: "2px solid var(--border)",
          width: "100%",
          flexShrink: 0,
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Looking for places..." : "Find places →"}
      </button>
    </main>
  )
}
