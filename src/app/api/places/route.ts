import { NextRequest, NextResponse } from "next/server"

if (!process.env.GOOGLE_PLACES_API_KEY) {
  throw new Error("GOOGLE_PLACES_API_KEY is not set")
}

const MAX_PLACES = 10

// nearbySearch uses includedTypes (Google place type codes)
const CATEGORY_TYPES: Record<string, string[]> = {
  "All":        ["restaurant", "cafe", "food_court", "fast_food_restaurant", "meal_takeaway", "meal_delivery"],
  "Rice meal":  ["restaurant", "food_court", "meal_takeaway", "filipino_restaurant"],
  "Fast food":  ["fast_food_restaurant", "hamburger_restaurant", "meal_takeaway", "meal_delivery", "chicken_restaurant", "pizza_restaurant", "sandwich_shop"],
  "Snacks":     ["bakery", "cafe", "sandwich_shop", "donut_shop"],
  "Dessert":    ["dessert_shop", "ice_cream_shop", "chocolate_shop", "candy_store"],
  "Drinks":     ["cafe", "tea_house", "coffee_shop"],
}

// searchText fallback (manual location) — still uses text queries
const ALLOWED_TEXT_CATEGORIES = new Set([
  "restaurant or cafe or food",
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
  if (timestamps.length === 0) {
    requestLog.delete(ip)
    requestLog.set(ip, [now])
  } else {
    requestLog.set(ip, [...timestamps, now])
  }
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { category, textQuery, latitude, longitude, radius } = body

  const hasCoords = typeof latitude === "number" && typeof longitude === "number"

  if (hasCoords) {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 })
    }
    if (!category || !CATEGORY_TYPES[category]) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }
  } else {
    if (typeof textQuery !== "string" || textQuery.trim().length === 0 || textQuery.length > 200) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }
    const isAllowed = [...ALLOWED_TEXT_CATEGORIES].some(cat => textQuery.startsWith(cat))
    if (!isAllowed) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    let response: Response

    if (hasCoords) {
      // GPS flow — use nearbySearch for hard radius guarantee
      response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
          "X-Goog-FieldMask": "places.displayName,places.location,places.formattedAddress,places.businessStatus,places.priceLevel,places.regularOpeningHours",
        },
        body: JSON.stringify({
          includedTypes: CATEGORY_TYPES[category],
          maxResultCount: MAX_PLACES,
          rankPreference: "DISTANCE",
          locationRestriction: {
            circle: {
              center: { latitude, longitude },
              radius: typeof radius === "number" && radius > 0 ? radius : 500,
            },
          },
        }),
      })
    } else {
      // Manual location fallback — use searchText
      response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
          "X-Goog-FieldMask": "places.displayName,places.location,places.formattedAddress,places.businessStatus,places.priceLevel,places.regularOpeningHours",
        },
        body: JSON.stringify({
          textQuery,
          maxResultCount: MAX_PLACES,
        }),
      })
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      console.error("Places API error:", errBody)
      return NextResponse.json({ error: "Places API error" }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Request timed out or failed" }, { status: 504 })
  } finally {
    clearTimeout(timeout)
  }
}
