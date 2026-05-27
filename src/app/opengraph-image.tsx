import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"

export const runtime = "nodejs"
export const alt = "Saan Tayo Kakain — Tabi. Ako na pipili."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  const iconData = readFileSync(join(process.cwd(), "public/web-app-manifest-512x512.png"))
  const iconBase64 = `data:image/png;base64,${iconData.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#F5F0E8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        <img
          src={iconBase64}
          width={160}
          height={160}
          style={{ borderRadius: "32px" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontWeight: 800,
              fontSize: "72px",
              color: "#1A1208",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Saan Tayo Kakain
          </span>
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: "28px",
              color: "#C41E3A",
              fontWeight: 600,
            }}
          >
            Tabi. Ako na pipili.
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
