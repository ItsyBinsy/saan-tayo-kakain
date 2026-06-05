"use client"

import dynamic from "next/dynamic"
import { useLottieAnim } from "@/hooks/useLottieAnim"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type Props = {
  animationSrc: string
  message: string
  sub: string
  indicator?: "dots" | "bar"
}

export default function LoadingScreen({ animationSrc, message, sub, indicator = "bar" }: Props) {
  const animData = useLottieAnim(animationSrc)

  return (
    <main
      className="flex flex-col items-center justify-center gap-6"
      style={{
        background: "var(--surface)",
        height: "100svh",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      <div style={{ width: "50cqw", height: "50cqw", maxWidth: 240, maxHeight: 240 }}>
        {animData
          ? <Lottie animationData={animData} loop style={{ width: "100%", height: "100%", mixBlendMode: "multiply" }} />
          : <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--border)", animation: "lottie-pulse 1.2s ease-in-out infinite" }} />
        }
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 9cqw, 42px)",
            color: "var(--text-main)",
            letterSpacing: "-0.5px",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {message}
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--brand)",
            fontStyle: "italic",
            letterSpacing: "0.02em",
          }}
        >
          &ldquo;{sub}&rdquo;
        </p>
      </div>

      {indicator === "dots" && (
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: i === 0 ? "var(--brand)" : "var(--border)",
                opacity: i === 0 ? 1 : 0.25,
                animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {indicator === "bar" && (
        <div
          style={{
            width: 48,
            height: 3,
            borderRadius: 2,
            background: "var(--brand)",
            animation: "bar-pulse 1.4s ease-in-out infinite",
          }}
        />
      )}

      <style>{`
        @keyframes lottie-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes bar-pulse {
          0%, 100% { opacity: 1; width: 48px; }
          50% { opacity: 0.4; width: 24px; }
        }
      `}</style>
    </main>
  )
}
