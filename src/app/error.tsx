"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main
      className="flex flex-col items-center justify-center"
      style={{ background: "var(--surface-dark)", height: "100dvh", padding: "24px" }}
    >
      <p
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(36px, 10vw, 56px)",
          color: "var(--white)",
          letterSpacing: "-1px",
          lineHeight: 1,
          textAlign: "center",
          marginBottom: "12px",
        }}
      >
        May nangyari.
      </p>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--text-muted)",
          textAlign: "center",
          marginBottom: "32px",
        }}
      >
        Something broke. Try again or start over.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={reset}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--white)",
            background: "var(--brand)",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/filter")}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-muted)",
            background: "transparent",
            border: "1.5px solid var(--border)",
            borderRadius: "4px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Start over
        </button>
      </div>
    </main>
  )
}
