"use client"

import { useStore } from "@/store"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useHydrated } from "@/hooks/useHydrated"
import { motion } from "framer-motion"
import PageTransition from "@/components/PageTransition"
import Script from "next/script"
import { MapPin, Clock, Banknote, PersonStanding, Share2, RotateCcw, RefreshCw } from "lucide-react"

const PRICE_LABEL: Record<string, string> = {
  PRICE_LEVEL_FREE:           "Free",
  PRICE_LEVEL_INEXPENSIVE:    "₱80 – ₱150 per person",
  PRICE_LEVEL_MODERATE:       "₱150 – ₱300 per person",
  PRICE_LEVEL_EXPENSIVE:      "₱300 – ₱500 per person",
  PRICE_LEVEL_VERY_EXPENSIVE: "₱500+ per person",
}

function getNameFontSize(name: string) {
  const len = name.length
  if (len <= 8)  return "clamp(72px, 22vw, 108px)"
  if (len <= 16) return "clamp(56px, 17vw, 84px)"
  if (len <= 28) return "clamp(44px, 13vw, 68px)"
  return "clamp(36px, 11vw, 56px)"
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
  const resetModes = useStore((state) => state.resetModes)
  const clearWinner = useStore((state) => state.clearWinner)

  const hydrated = useHydrated()
  const [confirmMode, setConfirmMode] = useState(false)
  const [confirmStartOver, setConfirmStartOver] = useState(false)
  const navigatingAway = useRef(false)
  const shownFeedback = useRef(false)
  const clickedDirections = useRef(false)

  useEffect(() => {
    if (hydrated && !winner && !navigatingAway.current) router.push("/filter")
  }, [hydrated, winner, router])

  useEffect(() => {
    if (!hydrated || !winner) return

    const openFeedback = () => {
      if (shownFeedback.current) return
      shownFeedback.current = true
      if (typeof window !== "undefined" && (window as any).Tally) {
        ;(window as any).Tally.openPopup("81RbMo", {
          layout: "modal",
          width: 376,
          alignLeft: true,
          hideTitle: true,
          overlay: true,
          emoji: { text: "👋", animation: "wave" },
          doNotShowAfterSubmit: true,
          autoClose: 3000,
        })
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible" && clickedDirections.current) {
        openFeedback()
      }
    }

    const timer = setTimeout(openFeedback, 15000)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [hydrated, winner])

  useEffect(() => {
    if (hydrated && winner) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([80, 60, 120])
      }
    }
  }, [hydrated, winner])

  if (!hydrated || !winner) return (
    <div style={{ background: "var(--surface)", height: "100dvh" }} />
  )

  const availableModes = [
    "bahala-na",
    ...(places.length >= 2 ? ["paikutin"] : []),
    ...(places.length >= 2 ? ["this-or-that"] : []),
  ]
  const allModesUsed = availableModes.every((m) => usedModes.includes(m))

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
    distanceText = walkMin <= 1 ? `${m}m away` : `${walkMin} min walk · ${m}m away`
  }

  const priceText = winner.priceLevel ? PRICE_LABEL[winner.priceLevel] : null

  const hours = winner.regularOpeningHours
  const openNow = hours?.openNow
  const todayHours = (() => {
    const desc: string[] = hours?.weekdayDescriptions ?? []
    if (!desc.length) return null
    const dayIndex = new Date().getDay()
    const adjusted = dayIndex === 0 ? 6 : dayIndex - 1
    const line = desc[adjusted] ?? ""
    const colonIdx = line.indexOf(":")
    return colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : null
  })()

  const openStatus = hours
    ? openNow ? "Open now" : "Closed right now"
    : null

  const addressParts = winner.formattedAddress.split(",")
  const shortAddress = addressParts.slice(0, 2).join(" ·").trim()

  const detailRows: { icon: React.ReactNode; label: string; sub?: string; accent?: boolean; muted?: boolean }[] = [
    {
      icon: <PersonStanding size={15} strokeWidth={2} aria-hidden />,
      label: distanceText ?? "Distance not available",
      muted: !distanceText,
    },
    {
      icon: <Clock size={15} strokeWidth={2} aria-hidden />,
      label: openStatus ?? "Hours not available",
      sub: todayHours ?? (!openStatus ? "Call ahead or check online." : undefined),
      accent: !!openStatus && !openNow,
      muted: !openStatus,
    },
    {
      icon: <Banknote size={15} strokeWidth={2} aria-hidden />,
      label: priceText ?? "Price not available",
      muted: !priceText,
    },
  ]

  const canShare = typeof navigator !== "undefined" && !!navigator.share

  return (
    <PageTransition>
      <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      <main
        className="flex flex-col"
        style={{ background: "var(--surface)", height: "100dvh", overflow: "hidden" }}
      >
        {/* Dark hero */}
        <div
          className="flex flex-col justify-end px-5 pb-6"
          style={{
            background: "var(--surface-dark)",
            minHeight: "44dvh",
            flexShrink: 0,
            paddingTop: "calc(32px + env(safe-area-inset-top))",
          }}
        >
          <motion.p
            className="uppercase tracking-widest mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "var(--brand)",
              letterSpacing: "0.12em",
            }}
          >
            {allModesUsed ? "Universe has spoken." : "It's decided."}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.82, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: getNameFontSize(winner.displayName.text),
              color: "var(--white)",
              letterSpacing: "-1.5px",
              lineHeight: "0.9",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {winner.displayName.text}
          </motion.h1>
          <motion.div
            className="flex items-center gap-1 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.55 }}
          >
            <MapPin size={11} strokeWidth={2.5} color="var(--text-muted)" aria-hidden />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              {shortAddress}
            </p>
          </motion.div>
        </div>

        {/* Details */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 20px",
            gap: "0px",
          }}
        >
          {detailRows.map((row, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.1, ease: "easeOut" }}
              style={{
                padding: "13px 0",
                borderBottom: i < detailRows.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span
                style={{
                  color: row.accent ? "var(--brand)" : "var(--text-muted)",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {row.icon}
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: row.accent ? "var(--brand)" : row.muted ? "var(--text-muted)" : "var(--text-main)",
                    lineHeight: 1.3,
                    fontStyle: row.muted ? "italic" : "normal",
                  }}
                >
                  {row.label}
                </span>
                {row.sub && (
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      lineHeight: 1.3,
                    }}
                  >
                    {row.sub}
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {/* Secondary actions */}
          <div className="flex gap-2 mt-4">
            {canShare && (
              <button
                onClick={() => navigator.share({
                  title: winner.displayName.text,
                  text: `${winner.displayName.text}. Final answer. Try it at saantayokakain.today`,
                  url: mapsUrl,
                })}
                className="flex items-center gap-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  background: "transparent",
                  border: "1.5px solid var(--border)",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                <Share2 size={12} strokeWidth={2} aria-hidden />
                Share
              </button>
            )}
            {!allModesUsed && (
              <button
                onClick={() => {
                  if (!confirmMode) { setConfirmMode(true); return }
                  navigatingAway.current = true
                  clearWinner()
                  router.push("/modes")
                }}
                onBlur={() => setConfirmMode(false)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: confirmMode ? "var(--brand)" : "var(--text-muted)",
                  background: "transparent",
                  border: confirmMode ? "1.5px solid var(--brand)" : "1.5px solid var(--border)",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  transition: "color 150ms ease, border-color 150ms ease",
                }}
              className="flex items-center gap-1.5"
              >
                <RotateCcw size={12} strokeWidth={2} aria-hidden />
                {confirmMode ? "Sure? Tap again" : "Try another mode"}
              </button>
            )}
          </div>

          {allModesUsed && (
            <div className="flex flex-col gap-2 mt-1">
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}
              >
                You've used all modes. Sige na, tara na doon.
              </p>
              <button
                onClick={() => {
                  if (!confirmStartOver) { setConfirmStartOver(true); return }
                  navigatingAway.current = true
                  resetModes()
                  router.push("/filter")
                }}
                onBlur={() => setConfirmStartOver(false)}
                className="flex items-center gap-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: confirmStartOver ? "var(--brand)" : "var(--text-muted)",
                  background: "transparent",
                  border: confirmStartOver ? "1.5px solid var(--brand)" : "1.5px solid var(--border)",
                  transition: "color 150ms ease, border-color 150ms ease",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                <RefreshCw size={12} strokeWidth={2} aria-hidden />
                {confirmStartOver ? "Sure? Tap again" : "Start over"}
              </button>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <div style={{ flexShrink: 0 }}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { clickedDirections.current = true }}
            className="flex flex-col items-center justify-center"
            style={{
              background: "var(--brand)",
              padding: "18px",
              paddingBottom: "calc(18px + env(safe-area-inset-bottom))",
              textDecoration: "none",
              borderTop: "2px solid var(--border)",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(18px, 5vw, 24px)",
                color: "var(--white)",
                letterSpacing: "-0.5px",
              }}
            >
              Get directions
            </span>
            <span style={{ color: "var(--white)", fontSize: "16px", opacity: 0.7 }}>→</span>
          </a>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              color: "var(--text-muted)",
              textAlign: "center",
              padding: "8px 20px",
              paddingBottom: "10px",
              fontStyle: "italic",
            }}
          >
            Results based on available data. Always check before heading out.
          </p>
        </div>
      </main>
    </PageTransition>
  )
}
