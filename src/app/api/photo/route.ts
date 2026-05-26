import { NextRequest, NextResponse } from "next/server"

const PHOTO_NAME_REGEX = /^places\/[A-Za-z0-9_\-]+\/photos\/[A-Za-z0-9_\-]+$/

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")
  if (!name || !PHOTO_NAME_REGEX.test(name) || name.length > 200) {
    return new NextResponse("Invalid photo reference", { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const url = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=600&maxWidthPx=600`
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY! },
      redirect: "follow",
    })

    if (!response.ok || !response.body) {
      return new NextResponse("Photo fetch failed", { status: 502 })
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    return new NextResponse("Photo fetch failed", { status: 504 })
  } finally {
    clearTimeout(timeout)
  }
}
