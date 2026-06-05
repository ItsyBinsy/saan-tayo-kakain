"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import splashAnim from "@/animations/splash.json"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

export default function Home() {
  const router = useRouter()
  // Defer Lottie mount by one frame so the h1 paints first and wins LCP
  const [showLottie, setShowLottie] = useState(false)

  useEffect(() => {
    router.prefetch("/filter")
    const id = requestAnimationFrame(() => setShowLottie(true))
    return () => cancelAnimationFrame(id)
  }, [router])

  return (
    <main
      role="button"
      tabIndex={0}
      aria-label="Tap to start"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
        background: "var(--surface)",
        minHeight: "100dvh",
        overflow: "hidden",
      }}
      onClick={() => router.push("/filter")}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push("/filter") }}
    >
      <div
        className="flex flex-col items-center px-6"
        style={{ animation: "splash-fade-up 0.7s ease-out both" }}
      >
        <div className="flex items-end gap-1">
          {/* Placeholder holds space until Lottie mounts — h1 paints first */}
          <div style={{
            width: "clamp(80px, 24cqw, 140px)",
            height: "clamp(80px, 24cqw, 140px)",
            flexShrink: 0,
          }}>
            {showLottie && (
              <Lottie
                animationData={splashAnim}
                loop
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </div>
          <div>
            <h1
              className="leading-none"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-1px",
                lineHeight: "0.88",
                fontSize: "clamp(72px, 22cqw, 110px)",
              }}
            >
              Saan<br />Tayo<br />Kakain
            </h1>
            <p
              className="text-sm mt-3 text-right"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
            >
              Tabi. Ako na.
            </p>
          </div>
        </div>
      </div>

      <p
        style={{
          position: "absolute",
          bottom: "2rem",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--text-muted)",
          fontFamily: "var(--font-body)",
          animation: "splash-tap-pulse 3s ease-in-out 1s infinite",
        }}
      >
        Tap anywhere to start
      </p>

      <style>{`
        @keyframes splash-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-tap-pulse {
          0%, 100% { opacity: 0.5; transform: translateY(0); }
          50%       { opacity: 0.2; transform: translateY(-4px); }
        }
      `}</style>
    </main>
  )
}
