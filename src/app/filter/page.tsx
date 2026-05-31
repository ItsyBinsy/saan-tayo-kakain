"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import PageTransition from "@/components/PageTransition"
import { useRouter } from "next/navigation"
import { useStore, type Place } from "@/store"
import LoadingScreen from "@/components/LoadingScreen"
import findingPlacesAnim from "@/animations/finding-places.json"
import Onboarding, { shouldShowOnboarding } from "@/components/Onboarding"


export default function Filter() {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    router.prefetch("/modes")
    if (shouldShowOnboarding()) setShowOnboarding(true)
  }, [router])
  const [mealType, setMealType] = useState("All")
  const [budget, setBudget] = useState("Any")
  const [distance, setDistance] = useState("Wider")
  const setPlaces = useStore((state) => state.setPlaces)
  const resetModes = useStore((state) => state.resetModes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [manualLocation, setManualLocation] = useState("")
  const [manualLoading, setManualLoading] = useState(false)

  const categoryMap: Record<string, string> = {
    "All":       "restaurant or cafe or food near me",
    "Rice meal": "Filipino restaurant or carinderia or turo-turo",
    "Fast food": "fast food restaurant",
    "Snacks":    "cafe or bakery or bread",
    "Dessert":   "dessert shop or ice cream or milk tea",
    "Drinks":    "cafe or juice bar or milk tea or smoothie",
  }

  const distanceMap: Record<string, number> = {
    "Nearby": 200,
    "Wider":  1500,
  }

  const priceLevelMap: Record<string, number> = {
    "Any":  Infinity,
    "₱100": 1,
    "₱200": 2,
  }

  const mealTypes = [
    { label: "All",       icon: "/icons/all.png" },
    { label: "Rice meal", icon: "/icons/rice.png" },
    { label: "Fast food", icon: "/icons/fastfood.png" },
    { label: "Snacks",    icon: "/icons/snack.png" },
    { label: "Dessert",   icon: "/icons/dessert.png" },
    { label: "Drinks",    icon: "/icons/drinks.png" },
  ]

  const fetchPlacesByText = async () => {
    if (!manualLocation.trim()) return
    setManualLoading(true)
    setError(null)
    resetModes()
    try {
      const baseCategory = categoryMap[mealType].replace(" near me", "")
      const query = `${baseCategory} near ${manualLocation.trim()}`
      const response = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textQuery: query }),
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
        const levels = ["PRICE_LEVEL_FREE","PRICE_LEVEL_INEXPENSIVE","PRICE_LEVEL_MODERATE","PRICE_LEVEL_EXPENSIVE","PRICE_LEVEL_VERY_EXPENSIVE"]
        return levels.indexOf(p.priceLevel) <= maxLevel
      })
      if (filtered.length === 0) {
        setError("No places found. Try a more specific location.")
        setManualLoading(false)
        return
      }
      setPlaces(filtered.slice(0, 10))
      router.push("/modes")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setManualLoading(false)
    }
  }

  const fetchPlaces = async () => {
    setError(null)
    setLocationDenied(false)
    resetModes()

    if (!navigator.geolocation) {
      setError("Your browser does not support location access. Try a different browser.")
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch("/api/places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category: mealType,
              latitude,
              longitude,
              radius: distanceMap[distance],
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
            if (p.regularOpeningHours?.openNow === false) return false
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
            setError("No places found nearby. Try a wider distance or different filter.")
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
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    )
  }

  if (locationDenied) {
    const steps = [
      "If a location prompt appeared, tap Allow then Try again below",
      "If no prompt appeared, go to Settings, find your browser, and set Location to While Using",
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
            minHeight: "28dvh",
            flexShrink: 0,
            paddingTop: "calc(20px + env(safe-area-inset-top))",
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
        </div>

        {/* Steps + manual fallback */}
        <div className="flex flex-col flex-1 px-5 py-3" style={{ gap: "0px", overflowY: "auto" }}>
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3"
              style={{
                paddingBottom: "10px",
                borderBottom: "1px solid var(--border)",
                paddingTop: i > 0 ? "10px" : 0,
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

          {/* Manual location fallback */}
          <div className="flex flex-col gap-2" style={{ paddingTop: "12px" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
              Still not working? Type your area instead.
            </p>
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchPlacesByText() }}
              placeholder="e.g. Katipunan, Quezon City"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--text-main)",
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: "4px",
                padding: "10px 12px",
                outline: "none",
                width: "100%",
              }}
            />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
              Be specific. Include your city or a nearby landmark for better results.
            </p>
            {error && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--brand)" }}>
                {error}
              </p>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ flexShrink: 0, borderTop: "2px solid var(--border)" }}>
          <button
            onClick={fetchPlacesByText}
            disabled={!manualLocation.trim() || manualLoading}
            style={{
              background: manualLocation.trim() ? "var(--brand)" : "var(--border)",
              color: "var(--white)",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: "clamp(18px, 5vw, 22px)", letterSpacing: "0.5px",
              padding: "16px", border: "none",
              width: "100%", cursor: manualLocation.trim() ? "pointer" : "default",
            }}
          >
            {manualLoading ? "Searching..." : "Search this area"}
          </button>
          <button
            onClick={fetchPlaces}
            style={{
              background: "transparent", color: "var(--text-muted)",
              fontFamily: "var(--font-body)", fontWeight: 600,
              fontSize: "13px",
              padding: "14px 16px",
              border: "none", borderTop: "1px solid var(--border)",
              width: "100%", cursor: "pointer",
              paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
            }}
          >
            Or try again with GPS
          </button>
        </div>
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
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
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
        <div className="flex justify-end" style={{ marginBottom: "4px" }}>
          <button
            onClick={() => setShowOnboarding(true)}
            aria-label="How this works"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "1.5px solid var(--border)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "14px",
              color: "var(--text-muted)",
            }}
          >
            ?
          </button>
        </div>
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
          containerType: "inline-size",
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
              <img
                src={item.icon}
                alt=""
                aria-hidden
                className="meal-icon"
                style={{
                  alignSelf: "flex-end",
                  objectFit: "contain",
                  ...(item.label === "Snacks" ? { transform: "scale(0.75)" } : {}),
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Distance + Budget row */}
      <div
        className="flex items-stretch"
        style={{ borderTop: "2px solid var(--border)", flexShrink: 0 }}
      >
        {/* Distance half */}
        <div className="flex items-center gap-2 px-3 py-3" style={{ width: "50%" }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "13px",
            color: "var(--text-main)",
            flexShrink: 0,
          }}>
            Distance
          </span>
          {["Nearby", "Wider"].map((item) => {
            const isSelected = distance === item
            return (
              <button
                key={item}
                onClick={() => setDistance(item)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(9px, 2.5cqw, 11px)",
                  fontWeight: 600,
                  borderRadius: "4px",
                  border: "1.5px solid var(--border)",
                  background: isSelected ? "var(--brand)" : "transparent",
                  color: isSelected ? "var(--white)" : "var(--text-main)",
                  padding: "3px clamp(5px, 1.5cqw, 10px)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {item}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="filter-divider" />

        {/* Budget half */}
        <div className="flex items-center gap-2 px-3 py-3" style={{ width: "50%" }}>
          <div className="flex flex-col" style={{ flexShrink: 0 }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "13px",
              color: "var(--text-main)",
              lineHeight: 1.1,
            }}>
              Budget
            </span>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              color: "var(--text-muted)",
              lineHeight: 1,
            }}>
              /person
            </span>
          </div>
          {["Any", "₱100", "₱200"].map((item) => {
            const isSelected = budget === item
            return (
              <button
                key={item}
                onClick={() => setBudget(item)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(9px, 2.5cqw, 11px)",
                  fontWeight: 600,
                  borderRadius: "4px",
                  border: "1.5px solid var(--border)",
                  background: isSelected ? "var(--brand)" : "transparent",
                  color: isSelected ? "var(--white)" : "var(--text-main)",
                  padding: "3px clamp(5px, 1.5cqw, 10px)",
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            )
          })}
        </div>
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
