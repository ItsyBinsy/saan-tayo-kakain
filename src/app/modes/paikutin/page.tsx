"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/LoadingScreen"
import afterPaikutinAnim from "@/animations/after-paikutin.json"
import { motion, AnimatePresence } from "framer-motion"

const Wheel = dynamic(() => import("react-custom-roulette").then(m => m.Wheel), { ssr: false })

export default function Paikutin() {
  const router = useRouter()
  const places = useStore((state) => state.places)
  const usedModes = useStore((state) => state.usedModes)
  const setWinner = useStore((state) => state.setWinner)
  const addUsedMode = useStore((state) => state.addUsedMode)

  const [spinning, setSpinning] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [showLoading, setShowLoading] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [winnerName, setWinnerName] = useState<string | null>(null)

  useEffect(() => {
    if (places.length === 0) router.replace("/filter")
    else if (!showLoading && usedModes.includes("paikutin")) router.replace("/winner")
  }, [places, usedModes, showLoading, router])

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max - 1) + "…" : text

  const data = places.map((place) => ({
    option: truncate(place.displayName.text, 14),
  }))

  const spinWheel = () => {
    if (spinning || stopping) return
    const winner = Math.floor(Math.random() * places.length)
    setPrizeNumber(winner)
    setSpinning(true)
    setHasSpun(true)
    setWinnerName(null)
  }

  const handleStop = () => {
    // Delay state updates one frame to let the wheel finish its final render
    requestAnimationFrame(() => {
      setSpinning(false)
      setStopping(true)
      setWinnerName(places[prizeNumber].displayName.text)
      setWinner(places[prizeNumber])

      setTimeout(() => {
        setShowLoading(true)
        setTimeout(() => {
          addUsedMode("paikutin")
          const tryNavigate = () => {
            router.push("/winner")
            setTimeout(() => {
              if (!window.location.pathname.includes("winner")) router.push("/winner")
            }, 2000)
          }
          tryNavigate()
        }, 6000)
      }, 1800)
    })
  }

  if (showLoading) {
    return (
      <LoadingScreen
        animationData={afterPaikutinAnim}
        message="No more going in circles."
        sub="Huwag kang magreklamo."
        indicator="bar"
      />
    )
  }

  if (places.length === 0) {
    return (
      <main
        className="flex flex-col items-center justify-center"
        style={{ background: "var(--surface-dark)", height: "100dvh" }}
      >
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "14px" }}>
          No places found. Go back and search again.
        </p>
      </main>
    )
  }

  return (
    <main
      className="flex flex-col items-center"
      style={{
        background: "var(--surface)",
        height: "100dvh",
        overflow: "hidden",
        paddingTop: "calc(env(safe-area-inset-top) + 32px)",
        paddingBottom: "env(safe-area-inset-bottom)",
        position: "relative",
      }}
      onClick={spinWheel}
    >
      {/* Title */}
      <div className="w-full px-5 mb-4" style={{ flexShrink: 0, minHeight: "72px" }}>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(40px, 12cqw, 64px)",
            color: "var(--text-main)",
            letterSpacing: "-1.5px",
            lineHeight: "0.88",
          }}
        >
          Paikutin
        </h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={stopping ? "winner" : spinning ? "spinning" : "idle"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-1"
            style={{
              fontFamily: stopping ? "'Barlow Condensed', sans-serif" : "var(--font-body)",
              fontSize: stopping ? "clamp(22px, 6cqw, 28px)" : "12px",
              color: stopping ? "var(--text-main)" : "var(--text-muted)",
              fontWeight: 800,
              letterSpacing: stopping ? "-0.5px" : "normal",
            }}
          >
            {stopping && winnerName
              ? `It's ${winnerName}!`
              : spinning
              ? `${places.length} candidates · spinning...`
              : `${places.length} candidates`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Wheel + pointer together */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          cursor: spinning || stopping ? "default" : "pointer",
          overflow: "hidden",
        }}
      >
        {/* Pointer — sits just above the wheel, always adjacent */}
        <motion.div
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "18px solid var(--brand)",
            marginBottom: "6px",
            flexShrink: 0,
            filter: "drop-shadow(0 2px 4px rgba(196,30,58,0.4))",
          }}
        />
        <div style={{
          filter: "drop-shadow(0px 8px 24px rgba(26,18,8,0.22)) drop-shadow(0px 2px 6px rgba(196,30,58,0.18))",
          borderRadius: "50%",
        }}>
          <Wheel
            mustStartSpinning={spinning}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={handleStop}
            backgroundColors={[
              "#C41E3A", "#1A1208", "#A01830", "#2A1F10",
              "#C41E3A", "#1A1208", "#A01830", "#2A1F10",
              "#C41E3A", "#1A1208",
            ]}
            textColors={[
              "#F5F0E8", "#F5F0E8", "#F5F0E8", "#F5F0E8",
              "#F5F0E8", "#F5F0E8", "#F5F0E8", "#F5F0E8",
              "#F5F0E8", "#F5F0E8",
            ]}
            outerBorderColor="#1A1208"
            outerBorderWidth={6}
            innerRadius={10}
            innerBorderColor="#C41E3A"
            innerBorderWidth={6}
            radiusLineColor="#1A1208"
            radiusLineWidth={1}
            fontSize={10}
            fontWeight={700}
            pointerProps={{ style: { display: "none" } }}
          />
        </div>
      </div>

      {/* Safe area spacer — always present so wheel doesn't shift */}
      <div style={{
        flexShrink: 0,
        height: "calc(16px + env(safe-area-inset-bottom))",
        width: "100%",
      }} />

      {/* Pre-spin CTA hint — removed from layout after first spin */}
      <AnimatePresence>
        {!hasSpun && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              bottom: "calc(16px + env(safe-area-inset-bottom))",
              left: 0,
              right: 0,
              borderTop: "2px solid var(--border)",
              padding: "16px",
              background: "var(--surface)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(18px, 5cqw, 22px)",
              color: "var(--text-main)",
              letterSpacing: "0.3px",
            }}>
              Tap anywhere to spin →
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
