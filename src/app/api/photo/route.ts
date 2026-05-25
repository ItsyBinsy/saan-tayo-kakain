import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")
  if (!name || !name.startsWith("places/")) {
    return new NextResponse("Invalid photo reference", { status: 400 })
  }

  const url = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=600&maxWidthPx=600`
  const response = await fetch(url, {
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
}
