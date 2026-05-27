"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import PageTransition from "@/components/PageTransition"
import { useRouter } from "next/navigation"
import { useStore, type Place } from "@/store"
import LoadingScreen from "@/components/LoadingScreen"
import findingPlacesAnim from "@/animations/finding-places.json"

export default function Filter() {
  const router = useRouter()

  useEffect(() => {
    router.prefetch("/modes")
  }, [router])
  const [mealType, setMealType] = useState("All")
  const [budget, setBudget] = useState("Any")
  const setPlaces = useStore((state) => state.setPlaces)
  const resetModes = useStore((state) => state.resetModes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)

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
    setLocationDenied(false)
    resetModes()

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLoading(true)
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
          const filtered = allPlaces.filter((p: Place) => {
            if (p.businessStatus === "CLOSED_PERMANENTLY") return false
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
          setPlaces(filtered.slice(0, 10)) // matches MAX_PLACES in api/places/route.ts
          setLocationDenied(false)
          router.push("/modes")
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong.")
          setLoading(false)
        }
      },
      (geoError) => {
        setLoading(false)
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setLocationDenied(true)
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError("Could not determine your location.")
        } else if (geoError.code === geoError.TIMEOUT) {
          setError("Location request timed out. Please try again.")
        } else {
          setError("Could not get your location. Please try again.")
        }
      },
      { timeout: 10000 }
    )
  }

  if (locationDenied) {
    const steps = [
      "Check your browser's address bar for a permissions or settings icon",
      "Or go to your phone's Settings app and find your browser",
      "Allow location access for this site",
      "Tap Try again below",
    ]

    return (
      <main
        role="alert"
        className="flex flex-col"
        style={{ background: "var(--surface)", height: "100dvh", overflow: "hidden" }}
      >
        {/* Dark hero */}
        <div
          className="flex flex-col justify-end px-5 pb-6"
          style={{
            background: "var(--surface-dark)",
            minHeight: "38dvh",
            flexShrink: 0,
            paddingTop: "calc(32px + env(safe-area-inset-top))",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} strokeWidth={2.5} color="var(--brand)" />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Location Access
            </p>
          </div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 12vw, 56px)", color: "var(--white)", letterSpacing: "-1px", lineHeight: 0.9 }}>
            Location<br />access needed
          </h2>
          <p className="mt-3" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            We need your location to find places near you.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col flex-1 px-5 py-5" style={{ gap: "0px", overflowY: "auto" }}>
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-4"
              style={{
                paddingBottom: i < steps.length - 1 ? "16px" : 0,
                borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none",
                paddingTop: i > 0 ? "16px" : 0,
              }}
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: "var(--brand)", flexShrink: 0,
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                  fontSize: "13px", color: "var(--white)",
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-main)", lineHeight: 1.4, paddingTop: "3px" }}>
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            const isMobile = /iPhone|iPad|iPod|Android/.test(navigator.userAgent)
            isMobile ? window.location.reload() : fetchPlaces()
          }}
          style={{
            background: "var(--text-main)", color: "var(--white)",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: "clamp(18px, 5vw, 22px)", letterSpacing: "0.5px",
            padding: "16px", border: "none", borderTop: "2px solid var(--border)",
            width: "100%", flexShrink: 0, cursor: "pointer",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          }}
        >
          Try again
        </button>
      </main>
    )
  }

  if (loading) {
    return (
      <LoadingScreen
        animationData={findingPlacesAnim}
        message="Looking for places near you..."
        sub="Puro kasi kayo Kahit Saan."
        indicator="bar"
      />
    )
  }

  return (
    <PageTransition>
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
        className="px-5 pb-4"
        style={{ borderBottom: "2px solid var(--border)", flexShrink: 0, paddingTop: "calc(20px + env(safe-area-inset-top))" }}
      >
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(52px, 16cqw, 76px)",
            letterSpacing: "-1px",
            lineHeight: "0.88",
            color: "var(--text-main)",
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            style={{ display: "block" }}
          >
            Anong gusto
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
            style={{ display: "block" }}
          >
            mo ngayon?
          </motion.span>
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
              aria-label={`Select meal type: ${item.label}`}
              aria-pressed={isSelected}
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
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "15px",
          color: "var(--text-main)",
          marginRight: "4px",
          flexShrink: 0,
        }}>
          Budget
        </span>
        {["Any", "₱100", "₱200", "₱300"].map((item) => {
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
    </PageTransition>
  )
}
