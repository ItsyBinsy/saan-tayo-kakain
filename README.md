# Saan Tayo Kakain

> GPS-based restaurant decision app for groups who can't agree on where to eat.

**Live:** [saantayokakain.today](https://saantayokakain.today)

---

## Overview

A progressive web app that eliminates the "saan tayo kakain" group chat debate. Users share their location, set filters, and let one of three game modes pick a nearby restaurant for them.

**Game modes**
- **Paikutin** — spin-the-wheel random pick
- **This or That** — bracket elimination, one by one
- **Bahala Na** — instant random pick

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| State | Zustand with persist middleware |
| Animations | Framer Motion, Lottie |
| Places data | Google Places API (New) — `searchNearby` |
| Testing | Playwright E2E |
| Deployment | Vercel |

---

## Architecture

```
Browser → /api/places (Next.js server route)
               ↓
         Input validation + rate limiting
               ↓
         Google Places API (key never exposed to client)
               ↓
         Filtered results → Zustand store → game modes
```

The API key is server-side only. The client never touches Google's API directly.

---

## Key Implementation Details

- **Server-side API proxy** — sliding-window rate limiter, `AbortController` timeout, strict `includedTypes` allowlist
- **GPS accuracy** — `nearbySearch` with `locationRestriction` circle enforces hard radius (200m or 1.5km), unlike `searchText` which uses a soft location bias
- **Hydration guard** — custom `useHydrated` hook with lazy `useState` initializer prevents Zustand persist middleware from firing redirect guards on empty initial state
- **Redirect guards** — every game screen has a `useEffect` guard that redirects if state is missing or mode is already used, preventing back-button abuse
- **PWA** — installable, offline fallback page, service worker via `next-pwa`

---

## Local Development

```bash
npm install --legacy-peer-deps
```

Create `.env.local`:
```
GOOGLE_PLACES_API_KEY=your_key_here
```

```bash
npm run dev
```

---

## Testing

```bash
npm run test:e2e
```

37 Playwright tests covering all screens, redirect guards, back-button loopholes, low place counts, and mobile viewports. Tests mock the Places API — no real API calls or billing during test runs.

CI runs automatically on every push via GitHub Actions.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_PLACES_API_KEY` | Yes | Google Places API (New) key — server-side only |

---

## Security Notes

- API key restricted to server-side use only — no `NEXT_PUBLIC_` prefix
- Google Cloud billing cap set at $0 hard limit
- Rate limiting: 5 requests per minute per IP
- Input allowlist enforced before forwarding to Google

---

Built by [Vince Carl Viaña](https://vinceviana.com)
