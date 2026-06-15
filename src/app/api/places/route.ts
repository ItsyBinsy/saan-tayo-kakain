import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

if (!process.env.GOOGLE_PLACES_API_KEY) {
  throw new Error("GOOGLE_PLACES_API_KEY is not set")
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const MAX_PLACES = 10

// Maps display name keywords to the ONE category they belong to.
// Order matters — first match wins. More specific patterns go first.
const KEYWORD_RULES: { pattern: RegExp; category: string }[] = [
  // Fast food chains
  { pattern: /jollibee|mcdonald|kfc|chowking|burger\s*king|greenwich|popeyes|wendy'?s|carl'?s\s*jr|bk\b/i, category: "Fast food" },
  { pattern: /angel'?s?\s*burger|minute\s*burger|tropical\s*hut|lotto\s*burger/i,                          category: "Fast food" },
  { pattern: /mang\s*inasal|andok'?s|baliwag|savory\s*chicken/i,                                          category: "Fast food" },

  // Rice meal spots — tapsi, silog, carinderia, lutong bahay
  { pattern: /tapsilugan|tapsihan|tapsilog|tapsi\b/i,                                                      category: "Rice meal" },
  { pattern: /carenderia|carinderia|carendaria|kainan|eatery|lutong\s*bahay|turo.?turo|ulam/i,             category: "Rice meal" },
  { pattern: /silog|longsilog|tocilog|bangsilog|cornsilog|hotsilog|chicksilog/i,                           category: "Rice meal" },
  { pattern: /lugawan|arroz\s*caldo|goto\b|bulalo\b|kanin/i,                                               category: "Rice meal" },

  // Snacks — bread-forward, merienda spots
  { pattern: /pandesal|panaderia|tinapay|bread\s*house|breadhaus/i, category: "Snacks" },

  // Drinks — boba, taho, juice-forward
  { pattern: /milk\s*tea|boba|taho\b|juice\s*bar|smoothie\s*bar|shake\s*bar/i, category: "Drinks" },

  // Dessert — cold/sweet-forward
  { pattern: /halo.?halo|ice\s*cream|gelato|dirty\s*ice|sorbetes|paleta|crepe|dessert/i, category: "Dessert" },
]

// Derive the requested category from either the `category` param (GPS) or the
// text query prefix (manual location). Returns null for "All" — no filtering.
function resolveCategory(category?: string, textQuery?: string): string | null {
  if (category && category !== "All") return category
  if (textQuery) {
    if (textQuery.startsWith("Filipino restaurant or carinderia"))  return "Rice meal"
    if (textQuery.startsWith("fast food restaurant"))               return "Fast food"
    if (textQuery.startsWith("cafe or bakery or bread"))            return "Snacks"
    if (textQuery.startsWith("dessert shop"))                       return "Dessert"
    if (textQuery.startsWith("cafe or juice bar"))                  return "Drinks"
  }
  return null
}

// Removes places whose display name strongly signals a different category.
function reclassifyPlaces(
  places: { displayName?: { text?: string } }[],
  requestedCategory: string | null,
): typeof places {
  if (!requestedCategory) return places // "All" — nothing to filter out
  return places.filter(place => {
    const name = place.displayName?.text ?? ""
    for (const { pattern, category } of KEYWORD_RULES) {
      if (pattern.test(name)) return category === requestedCategory
    }
    return true // no strong signal — keep it
  })
}

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

const WINDOW_S = 60
const MAX_REQUESTS = 5
const CACHE_TTL_S = 900 // 15 minutes

function buildCacheKey(body: Record<string, unknown>): string {
  if (typeof body.latitude === "number" && typeof body.longitude === "number") {
    // Round to ~100m grid so nearby users share the same cache bucket
    const lat = Math.round(body.latitude * 100) / 100
    const lng = Math.round(body.longitude * 100) / 100
    const radius = typeof body.radius === "number" ? body.radius : 500
    return `places:${lat}:${lng}:${body.category}:${radius}`
  }
  return `places:text:${body.textQuery}`
}

async function isRateLimited(ip: string): Promise<boolean> {
  const key = `rl:${ip}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, WINDOW_S)
  return count > MAX_REQUESTS
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (await isRateLimited(ip)) {
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

  const cacheKey = buildCacheKey({ category, textQuery, latitude, longitude, radius })
  const cached = await redis.get<string>(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
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
          maxResultCount: MAX_PLACES * 2,
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
          maxResultCount: MAX_PLACES * 2,
        }),
      })
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      console.error("Places API error:", errBody)
      return NextResponse.json({ error: "Places API error" }, { status: 502 })
    }

    const data = await response.json()
    const resolvedCategory = resolveCategory(category, textQuery)
    const places = reclassifyPlaces(data.places ?? [], resolvedCategory).slice(0, MAX_PLACES)
    const result = { ...data, places }
    await redis.set(cacheKey, result, { ex: CACHE_TTL_S })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Request timed out or failed" }, { status: 504 })
  } finally {
    clearTimeout(timeout)
  }
}
