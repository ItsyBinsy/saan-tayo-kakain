"use client"

import { useEffect, useState } from "react"

export default function OpenInBrowserBanner() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const inIAB = /FBAN|FBAV|FB_IAB|Instagram|Line|Twitter|Snapchat|TikTok/.test(ua)
    if (inIAB) {
      setShow(true)
      setIsIOS(/iPhone|iPad|iPod/.test(ua))
    }
  }, [])

  if (!show) return null

  const instruction = isIOS
    ? 'Tap ··· then "Open in Safari"'
    : 'Tap ··· then "Open in Chrome"'

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "var(--surface-dark)",
        borderBottom: "2px solid var(--border)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "15px",
          color: "var(--white)",
          margin: 0,
        }}>
          Open in your browser
        </p>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          color: "#9A8A72",
          margin: 0,
        }}>
          {instruction} for the best experience.
        </p>
      </div>
      <button
        onClick={() => setShow(false)}
        style={{
          background: "transparent",
          border: "none",
          color: "#9A8A72",
          fontSize: "20px",
          cursor: "pointer",
          flexShrink: 0,
          padding: "4px",
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
