import { NextRequest, NextResponse } from "next/server"

const ALLOWED_CATEGORIES = new Set([
  "restaurant or cafe or food near me",
  "Filipino restaurant or carinderia or turo-turo",
  "fast food restaurant",
  "cafe or bakery or bread",
  "dessert shop or ice cream or milk tea",
  "cafe or juice bar or milk tea or smoothie",
])

const requestLog = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) return true
  requestLog.set(ip, [...timestamps, now])
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 })
  }

  const body = await req.json()
  const { textQuery, latitude, longitude } = body

  if (!ALLOWED_CATEGORIES.has(textQuery)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  }
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "Invalid location" }, { status: 400 })
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 })
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
      "X-Goog-FieldMask": "places.displayName,places.location,places.formattedAddress,places.businessStatus,places.priceLevel,places.rating",
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 20,
      locationBias: {
        circle: { center: { latitude, longitude }, radius: 500 },
      },
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: "Places API error" }, { status: 502 })
  }

  const data = await response.json()
  return NextResponse.json(data)
}