# Saan Tayo Kakain — Dev Notes
*Para kay Vince. I-save mo ito para hindi ka magsimula sa zero.*

---

## App Vision

**Name:** Saan Tayo Kakain  
**Tagline:** Tabi. Ako na.  
**Target users:** Students na hindi makapag-decide kung saan kakain (España, Katipunan, Taft areas)  
**Platform:** Web app (Next.js PWA) — shareable link, no install needed  
**Deploy target:** Vercel (free, forever)

### The Problem
Short vacant periods. Group of friends. Nobody can decide. App solves this by randomly picking a nearby restaurant based on your filters.

---

## Tech Stack (Locked)

```
Next.js 15            → framework, App Router
TypeScript            → type safety
Tailwind CSS          → mobile-first styling
shadcn/ui             → UI components (Nova preset)
Framer Motion         → animations
Zustand               → global state management
react-custom-roulette → lucky wheel
Google Places API     → nearby restaurant search
Vercel                → deployment
```

---

## Design System (LOCKED — implemented)

### Colors (FINAL)
```
--brand:        #C41E3A   → crimson red, main accent
--brand-light:  #F5E0E4   → light red, backgrounds
--brand-dark:   #8B1020   → dark red
--text-main:    #1A1208   → near black, warm
--text-muted:   #9C8060   → warm gray
--surface:      #F5F0E8   → warm cream, page background
--surface-dark: #1A1208   → dark hero backgrounds
--border:       #1A1208   → same as text-main
--white:        #F5F0E8   → same as surface (cream, not pure white)
--splash-bg:    #1A1208   → splash screen background
```

### Language Rule (Option C — LOCKED)
```
English  → UI labels, buttons, actions
          (Find places, Spin, Try again, Get directions,
           Meal type, Budget, Open until)

Filipino → Personality, flavor texts
          (Tabi. Ako na. / Napili na! / Paano natin pagpapasiyahan?
           Tara na, gutom na tayo. / Pinipili na...)
```

### Game Mode Names (LOCKED)
```
Paikutin     → lucky wheel spin
This or That → bracket elimination (pick one, remove one)
Bahala Na    → instant random pick
```

---

## App Flow (Screens — ALL COMPLETE)

```
Screen 1 — Splash         /                    ✅
Screen 2 — Filter         /filter               ✅
Screen 3 — Game modes     /modes                ✅
Screen 4A — Paikutin      /modes/paikutin       ✅
Screen 4B — This or That  /modes/this-or-that   ✅
Screen 4C — Bahala Na     /modes/bahala-na      ✅
Screen 5 — Winner         /winner               ✅
```

### Filter Screen Chips (LOCKED)
```
Meal type: All · Rice meal · Fast food · Merienda · Dessert · Drinks
Budget:    All · <₱100 · <₱150 · <₱200 · <₱300
```

---

## Current Progress

```
✅ Project setup (Next.js + Tailwind + shadcn)
✅ Splash screen (dark bg, fade+slide animation, tap anywhere to start)
✅ Filter screen (meal type chips + budget chips + Find places)
✅ GPS integration (navigator.geolocation)
✅ Google Places API (searchText endpoint — server-side proxy)
✅ Zustand store (places, winner, mealType, budget, usedModes)
✅ Modes screen (3 mode cards — Paikutin, This or That, Bahala Na)
✅ Paikutin wheel (react-custom-roulette, working spin + winner)
✅ This or That screen (5 candidates, 4 rounds, bracket elimination)
✅ Bahala Na screen (instant random pick, 1.5s delay, navigate to winner)
✅ Winner screen (place name, address, directions, try again)
✅ Server-side API proxy (src/app/api/places/route.ts)
✅ Rate limiting (5 requests per minute per IP)
✅ Error handling (GPS denied, network error, empty results)
✅ API key hidden (no NEXT_PUBLIC_ prefix — server-side only)
✅ Security headers (next.config.ts)
✅ Budget filter applied to results
✅ Edge case guards (direct URL navigation → redirect to /filter)
✅ Color scheme (warm cream + crimson red — FINAL)
✅ Mode tracking (usedModes — can't reuse same mode, fate is final)
✅ Mobile viewport fix (100dvh + dvh splits + safe-area-inset-bottom)
✅ Desktop layout (responsive — card view on wide screens)
⬜ Logo / mascot design
⬜ Dark mode support
⬜ Polish + back buttons
⬜ Vercel deployment
```

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    ← Splash screen
│   ├── layout.tsx                  ← Root layout
│   ├── globals.css                 ← Global styles + CSS variables
│   ├── api/
│   │   └── places/
│   │       └── route.ts            ← Server-side API proxy ← NEW
│   ├── filter/
│   │   └── page.tsx                ← Filter screen
│   ├── modes/
│   │   ├── page.tsx                ← Game mode picker
│   │   ├── paikutin/
│   │   │   └── page.tsx            ← Lucky wheel screen
│   │   ├── this-or-that/
│   │   │   └── page.tsx            ← This or That screen
│   │   └── bahala-na/
│   │       └── page.tsx            ← Bahala Na screen
│   └── winner/
│       └── page.tsx                ← Winner reveal screen
├── store/
│   └── index.ts                    ← Zustand global store
components/
└── ui/                             ← shadcn components
```

---

## Key Concepts Learned

### 1. Next.js App Router — Folder = Route
```
src/app/filter/page.tsx     → localhost:3000/filter
src/app/modes/page.tsx      → localhost:3000/modes
src/app/winner/page.tsx     → localhost:3000/winner
src/app/api/places/route.ts → localhost:3000/api/places (API endpoint)
```
No config needed. Folder name = URL. Always lowercase folders.

---

### 2. "use client"
```tsx
"use client"
// Required when using:
// - hooks (useState, useEffect, useRef)
// - browser APIs (navigator.geolocation)
// - event handlers (onClick)
// Without it → Next.js renders on server → hooks won't work
// API routes (route.ts) never need "use client" — always server
```

---

### 3. JSX — HTML-like syntax in JavaScript
```tsx
// Not HTML — JSX
// Difference: use className not class
<div className="flex">Hello</div>

// JavaScript inside JSX needs {}
<p>{place.displayName.text}</p>

// Without {} → renders literally as text
<p>place.displayName.text</p>  // wrong
```

---

### 4. () vs {} vs ({}) — The Tricky One

```tsx
// () — parentheses
// 1. Function call
useState(false)
useRouter()

// 2. Parameters
(place) => ...
(state) => ...

// {} — curly braces
// 1. JavaScript object
{ option: "Jollibee" }

// 2. JSX expression (JavaScript inside JSX)
<p>{place.displayName.text}</p>

// 3. Function body
() => { return something }

// ({}) — returning object from arrow function
// Need () wrapper so JS doesn't think {} is function body
places.map((place) => ({   // () = "this is a return value"
  option: place.displayName.text  // {} = object
}))
```

---

### 5. Tailwind CSS — Mobile-First Utility Classes
```tsx
className="flex flex-col items-center justify-center"

// flex     → display: flex
// flex-col → flex-direction: column (vertical)
// items-center   → align-items: center (cross axis)
// justify-center → justify-content: center (main axis)

// Memory trick:
// justify → same direction as flex
// items   → opposite direction
// When in doubt → use both (centers everything)
```

### Common Tailwind Classes Used
```
Layout:     flex flex-col flex-wrap items-center justify-center
Spacing:    p-6 px-4 py-2 mb-8 mt-4 gap-3
Sizing:     w-full w-16 h-16 min-h-screen
Text:       text-sm text-xs text-4xl font-semibold leading-tight
Colors:     bg-white text-[var(--brand)] border-[var(--border-soft)]
Borders:    rounded-full rounded-2xl border
Other:      transition-colors cursor-pointer uppercase tracking-widest
```

---

### 6. CSS Variables in Tailwind
```tsx
// Custom values use square brackets
className="text-[var(--text-main)]"
className="bg-[var(--brand)]"
className="border-[var(--border-soft)]"

// Pre-defined Tailwind values → no brackets needed
className="text-white"
className="bg-indigo-600"

// Rule: brackets = arbitrary/custom values
```

---

### 7. useState
```tsx
const [value, setValue] = useState(initialValue)
// value    → current state
// setValue → function to update state
// When setValue is called → component re-renders

const [spinning, setSpinning] = useState(false)
const [mealType, setMealType] = useState("All")
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
// string | null = TypeScript: "either a string or null"
// | means OR in TypeScript
```

---

### 8. useEffect
```tsx
useEffect(() => {
  // runs after component mounts
  const timer = setTimeout(() => {
    router.push("/filter")
  }, 2500)

  return () => clearTimeout(timer) // cleanup on unmount
}, [router]) // dependency array — re-run when router changes

// [] empty array = run once only
// [value] = run when value changes
// no array = run every render (usually a bug)
```

---

### 9. useRef
```tsx
const winnerRef = useRef<number>(0)
// stores a value WITHOUT triggering re-render
// access/update via .current

winnerRef.current = 5  // update
console.log(winnerRef.current)  // read
```

---

### 10. .map() — Loop Through Array
```tsx
// For each item in array, return something
const data = places.map((place) => ({
  option: place.displayName.text
}))

// The parameter name is yours to choose:
places.map((place) => ...)
places.map((restaurant) => ...)  // same thing

// Always need key prop in JSX:
places.map((place, index) => (
  <div key={index}>{place.displayName.text}</div>
))
```

---

### 11. .filter() — Remove Items from Array
```tsx
// Keeps only items that pass the condition
const newRemaining = remaining.filter(
  (p) => p !== left && p !== right
)
// removes both left and right from the array
// keeps everything else

// Another example:
const openPlaces = places.filter(
  (p) => p.businessStatus === "OPERATIONAL"
)
```

---

### 12. Array Methods
```tsx
// .slice(start, end) — get portion of array
data.places.slice(0, 10)  // first 10 items
// start = inclusive, end = exclusive
// 0-indexed (starts at 0, not 1)

// .length — number of items
places.length  // 10

// Math.floor(Math.random() * n) — random index
Math.floor(Math.random() * 10)  // random number 0-9

// Array indexing
places[0]           // first item
places[3]           // fourth item
places[prizeNumber] // item at prizeNumber index
```

---

### 13. TypeScript Types
```tsx
// type = blueprint/contract for an object
type Place = {
  displayName: { text: string }  // nested object
  formattedAddress: string        // required string
  rating?: number                 // optional (?) number
}

// ? means optional — field might not exist
// no ? means required — must always be there

// Union types
string | null    // string OR null
number | string  // number OR string

// Array type
Place[]   // array of Place objects
string[]  // array of strings
```

---

### 14. Zustand — Global State
```tsx
// store/index.ts — define once
export const useStore = create<Store>((set) => ({
  places: [],
  setPlaces: (places) => set({ places }),
}))

// Any component — read from store
const places = useStore((state) => state.places)

// Any component — write to store
const setPlaces = useStore((state) => state.setPlaces)
setPlaces(newPlaces)

// Pattern is always:
const XXX = useStore((state) => state.XXX)
// state is just a convention name, could be anything
```

---

### 15. async/await
```tsx
// async = "this function has async operations"
// await = "wait for this before moving on"
// Always together — can't use await without async

const fetchPlaces = async () => {
  const response = await fetch(url)  // wait for response
  const data = await response.json() // wait for parsing
  // these run in order, one after another
}
```

---

### 16. try/catch — Error Handling
```tsx
try {
  // code that might fail
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch")  // manually trigger error
  }
  const data = await response.json()
} catch (e) {
  // runs if anything in try block fails
  // e = the error object
  setError(e instanceof Error ? e.message : "Something went wrong.")
}

// instanceof = checks what type of object something is
// e instanceof Error → is e an Error object? true/false
```

---

### 17. useRouter — Navigation
```tsx
const router = useRouter()

router.push("/filter")           // navigate to /filter
router.push("/modes/paikutin")   // navigate to /modes/paikutin

// Dynamic route with template literal:
router.push(`/modes/${mode.id}`)
// mode.id = "paikutin" → navigates to /modes/paikutin
```

---

### 18. Template Literals
```tsx
// Backtick strings — can embed JavaScript
const url = `https://api.com?ll=${latitude},${longitude}`
// ${} = insert JavaScript value here
```

---

### 19. Ternary Operator
```tsx
// Shorthand if/else
condition ? valueIfTrue : valueIfFalse

// Example:
className={spinning ? "bg-gray-300" : "bg-black"}
// if spinning → "bg-gray-300"
// if not spinning → "bg-black"
```

---

### 20. Destructuring
```tsx
// Object destructuring
const { latitude, longitude } = position.coords
// same as: const latitude = position.coords.latitude

// Array destructuring
const [spinning, setSpinning] = useState(false)
// first item → spinning, second item → setSpinning

// Function parameter destructuring
const { textQuery, latitude, longitude } = body
// instead of: body.textQuery, body.latitude, body.longitude
```

---

### 21. const vs let
```tsx
const  // value won't be reassigned — use by default
let    // value might change — use when needed
var    // old way — never use

// Rule: always use const, switch to let only if you get an error
```

---

### 22. Framer Motion — Animations
```tsx
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 24 }}  // start state
  animate={{ opacity: 1, y: 0 }}   // end state
  transition={{ duration: 0.8, ease: "easeOut" }}
>
```

---

### 23. Next.js API Routes — Server-Side Code
```ts
// src/app/api/places/route.ts
// This runs on the SERVER, not the browser
// URL: /api/places

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()           // read request body
  return NextResponse.json({ data: ... }) // send response
}

// Key difference from page.tsx:
// page.tsx   → renders UI in browser
// route.ts   → handles API requests on server
// route.ts never needs "use client"
```

---

### 24. Set and Map — Advanced Data Structures
```ts
// Set — collection of unique values, fast lookup
const ALLOWED = new Set(["value1", "value2"])
ALLOWED.has("value1")  // true — fast check
ALLOWED.has("other")   // false

// Map — key-value store
const log = new Map<string, number[]>()
log.set("192.168.1.1", [1234, 5678])  // store
log.get("192.168.1.1")                // retrieve → [1234, 5678]
log.get("unknown") ?? []              // ?? = "or empty array if null"
```

---

### 25. Rate Limiting Pattern
```ts
// Sliding window rate limiter
const requestLog = new Map<string, number[]>()
const WINDOW_MS = 60_000  // 60 seconds (60_000 = 60000, _ is visual separator)
const MAX_REQUESTS = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  // get past requests, filter out old ones
  const timestamps = (requestLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) return true  // blocked
  requestLog.set(ip, [...timestamps, now])  // log this request
  return false  // allowed
}

// ...before using the request:
const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
if (isRateLimited(ip)) {
  return NextResponse.json({ error: "Too many requests." }, { status: 429 })
}
```

---

### 26. HTTP Status Codes — What They Mean
```
200 → OK, success
400 → Bad request (invalid input from user)
401 → Unauthorized (missing/wrong API key)
403 → Forbidden (valid key but blocked)
404 → Not found
429 → Too many requests (rate limited)
500 → Server error (our code crashed)
502 → Bad gateway (our server couldn't reach upstream service)
```

---

### 27. Optional Chaining (?.)
```tsx
left?.displayName.text
// if left is undefined/null → returns undefined (no crash)
// if left exists → returns left.displayName.text

// Without ?. → crashes if left is undefined
left.displayName.text  // TypeError if left is undefined

// Use ?. when the value might not exist yet
```

---

### 28. Double Negation (!!)
```ts
!!process.env.GOOGLE_PLACES_API_KEY
// converts any value to boolean
// !!"some string" → true
// !!undefined     → false
// !!null          → false

// Used in console.log to check if value exists
// without exposing the actual value in logs
console.log("Key exists:", !!process.env.API_KEY)
// logs: "Key exists: true" or "Key exists: false"
```

---

### 29. Debugging with console.log
```ts
// Always label your logs
console.log("API Key exists:", !!process.env.KEY)
console.log("Response status:", response.status)
console.log("Data received:", data)

// Debugging strategy — follow the data flow:
// 1. Did the request reach our server?  → log at top of route handler
// 2. Is the data correct?               → log the input
// 3. What did the API return?           → log the response
// 4. Where did it break?                → narrow down step by step

// Server-side logs appear in TERMINAL, not browser console
// Client-side logs appear in BROWSER DevTools console
```

---

### 30. Environment Variables
```
.env.local  ← never commit to GitHub (already in .gitignore)

NEXT_PUBLIC_KEY=value  → accessible in browser (visible to users!)
KEY=value              → server-side only (hidden from browser)

// After changing .env.local → always restart dev server
// Ctrl+C → npm run dev
```

---

## API Call Flow — How It All Works

This is the full journey of a request in this app, start to finish.

### Flow 1 — Searching for places (filter screen → modes screen)

```
[User taps "Find places"]
        ↓
filter/page.tsx (browser)
  → navigator.geolocation.getCurrentPosition()   ← asks phone for GPS
        ↓ (lat, lng received)
  → fetch("POST /api/places", { textQuery, lat, lng })
        ↓
src/app/api/places/route.ts (our Next.js server)
  → validates input (allowed category? valid coords?)
  → checks rate limit (5 req/min per IP)
  → fetch("POST https://places.googleapis.com/v1/places:searchText")
      headers: { X-Goog-Api-Key: process.env.KEY }  ← key never leaves server
        ↓
  ← Google responds with places[]
  → filters by priceLevel (budget)
  → slices to 10 results
  ← returns JSON to browser
        ↓
filter/page.tsx
  → setPlaces(filtered)   ← saved to Zustand store
  → router.push("/modes") ← navigate to next screen
```

### Flow 2 — Loading a place photo (winner screen)
> ⚠️ REMOVED — costs 1 extra API call per winner (up to 3x per session).
> Decided to keep it 1 call per session total. Code and learnings kept below for reference.

<!--
[Winner screen loads]
        ↓
winner/page.tsx (browser)
  → reads winner.photos[0].name from Zustand store
    (photo NAME = "places/ABC123/photos/XYZ" — not a URL yet)
        ↓
  <img src="/api/photo?name=places/ABC123/photos/XYZ" />
  → browser automatically fetches this when rendering the img tag
  → NO extra useState or fetch() needed — the img tag does it
        ↓
src/app/api/photo/route.ts (our Next.js server)
  → validates name starts with "places/"
  → fetch("https://places.googleapis.com/v1/{name}/media")
      headers: { X-Goog-Api-Key: process.env.KEY }
        ↓
  ← Google redirects to actual image CDN URL
  → streams image bytes back to browser
  → Cache-Control: 86400 (cached 24h — no repeat calls)
        ↓
winner/page.tsx
  ← img renders the photo
-->

### Key insight — why we use an image proxy instead of fetch()
> Still valid learning even though photos were removed.

<!--
// BAD — two round trips, extra state, flickering:
const [photoUri, setPhotoUri] = useState(null)
useEffect(() => {
  fetch("/api/photo?name=...")
    .then(r => r.json())
    .then(d => setPhotoUri(d.photoUri))  // causes re-render
}, [])
<img src={photoUri} />

// GOOD — one round trip, browser handles it, no state needed:
<img src="/api/photo?name=..." />
// Browser fetches it naturally when rendering — same result, less code
-->

### What lives where

```
BROWSER (page.tsx files)          SERVER (route.ts files)
─────────────────────────         ──────────────────────────
reads from Zustand store          calls external APIs
calls our /api/* routes           holds the API key
handles navigation                validates & rate-limits
renders UI                        returns data/images
```

---

## Google Places API Notes

**Endpoint (via our proxy):** `POST /api/places`

**Direct endpoint (server-side only):** `POST https://places.googleapis.com/v1/places:searchText`

**Required headers (server-side):**
```
Content-Type: application/json
X-Goog-Api-Key: your_api_key  ← server only, never browser
X-Goog-FieldMask: places.displayName,places.location,places.formattedAddress,places.businessStatus,places.priceLevel,places.rating
// Note: places.photos was removed — photos require a separate /api/photo call per winner.
// With 3 modes = up to 3 extra calls. Decision: keep it 1 call per session total.
```

**Category map:**
```tsx
const categoryMap = {
  "All":       "restaurant or cafe or food near me",
  "Rice meal": "Filipino restaurant or carinderia or turo-turo",
  "Fast food": "fast food restaurant",
  "Merienda":  "cafe or bakery or bread",
  "Dessert":   "dessert shop or ice cream or milk tea",
  "Drinks":    "cafe or juice bar or milk tea or smoothie",
}
```

**priceLevel values from Google:**
```
PRICE_LEVEL_FREE           → index 0
PRICE_LEVEL_INEXPENSIVE    → index 1 (~<₱100)
PRICE_LEVEL_MODERATE       → index 2 (~<₱200)
PRICE_LEVEL_EXPENSIVE      → index 3 (~<₱300)
PRICE_LEVEL_VERY_EXPENSIVE → index 4
PRICE_LEVEL_UNSPECIFIED    → treat as "include anyway"
```

**Pricing:** $200 free credit/month (resets monthly). Set $0 hard cap in Google Cloud Console. API key restriction: set to "None" for application restriction (protected by server-side proxy), restrict to "Places API (New)" only.

---

## Security Architecture

```
BEFORE (insecure):
Browser → directly calls places.googleapis.com
          API key visible in DevTools Network tab

AFTER (secure):
Browser → calls /api/places (our server)
              ↓
          Validates input (allowed categories, valid coords)
          Checks rate limit (5 requests/minute per IP)
              ↓
          Calls places.googleapis.com (key hidden server-side)
              ↓
          Returns results to browser
```

**Remaining security tasks:**
- Add security headers in `next.config.ts`
- Apply budget filter to results using priceLevel
- Add redirect guards for direct URL navigation

---

## Git Commands (Use Regularly)

```bash
git add .
git commit -m "feat: description of what you built"
git push

# Good commit message examples:
# "feat: paikutin wheel working"
# "fix: winner screen navigation"
# "security: server-side API proxy + rate limiting"
# "style: update color scheme"
```

---

### 31. Mobile Viewport Units — The Right Way
```css
/* The problem: 100vh ignores browser chrome (address bar, nav bar) */
height: 100vh   /* BAD — overflows on mobile */
height: 100svh  /* OK — small viewport (conservative), but still quirky */
height: 100dvh  /* BEST — dynamic, updates as browser chrome shows/hides */

/* Use dvh for anything that should fill the screen on mobile */
```

---

### 32. Safe Area Insets — iPhone Notch & Android Nav Bar
```css
/* viewport-fit=cover in layout.tsx lets you reach screen edges */
/* Then pad away from the unsafe zones using env() */

padding-bottom: env(safe-area-inset-bottom);
/* → adds space for iPhone home indicator / Android gesture bar */
/* → 0px on desktop (no-op, safe to always include) */

/* In Next.js, export viewport from layout.tsx: */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",  // enables safe-area-inset-* variables
}
```

---

### 33. CSS Units — vw vs cqw, which to use
```css
/* vw = % of the full browser viewport width */
font-size: 10vw;  /* on a 1440px desktop → 144px — way too big! */

/* cqw = % of the nearest container with container-type set */
font-size: 10cqw; /* body has max-width: 480px + container-type: inline-size */
                  /* so 10cqw = max 48px — consistent everywhere */

/* Rule: */
/* Use vw  → when you WANT to scale with the full viewport (rare) */
/* Use cqw → when you want to scale with your content container (fonts, icons) */
/* Use px  → when you want it fixed no matter what */
/* Use clamp() → to set a floor and ceiling */

clamp(min, preferred, max)
font-size: clamp(36px, 9cqw, 48px)
/* → never smaller than 36px, never bigger than 48px, scales in between */
```

---

### 34. Responsive Layout — Mobile vs Desktop
```css
/* Mobile-first approach: write mobile styles first, override for desktop */

/* In globals.css: */
.modes-hero {
  height: 42dvh;   /* mobile: takes 42% of screen */
}

@media (min-width: 600px) {
  .modes-hero {
    height: auto;   /* desktop: natural height, no fixed split */
    padding-top: 48px;
  }
}

/* Why 600px? Our body max-width is 480px. At 600px+ the app */
/* is clearly on desktop, centered as a card. */
```

---

### 35. container-type: inline-size — What It Does
```css
body {
  max-width: 480px;
  container-type: inline-size; /* makes body a "container" for cqw units */
}

/* Without this: cqw falls back to viewport width (same as vw) */
/* With this: cqw is relative to body's width (max 480px) */
/* This is why fonts look the same on mobile and desktop — */
/* they scale to the 480px container, not the screen */
```

---

### 36. Two :root blocks — A Mistake To Avoid
```css
/* globals.css had TWO :root blocks — this is a bug */
:root {
  --background: oklch(1 0 0);   /* first block — shadcn defaults */
  --primary: oklch(0.205 0 0);
}

:root {
  --brand: #C41E3A;             /* second block — custom overrides */
  --primary: oklch(0.35 0.18 20); /* OVERRIDES the first --primary */
}

/* CSS uses the LAST definition — so the second block wins */
/* This is technically fine but confusing */
/* Better: merge into one :root block */
/* Lesson: search for duplicate :root or duplicate variable names */
```

---

### 37. Debugging Mobile Layout Without a Device
```
Problem: You can't see the real mobile layout from your PC browser.
Solution: Use Playwright to take screenshots at exact phone dimensions.

# Install
npm install --save-dev playwright --legacy-peer-deps
npx playwright install chromium

# Screenshot script (ss.mjs)
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
await page.goto('http://localhost:3000/modes');
await page.waitForTimeout(1500); // wait for fonts/animations
await page.screenshot({ path: 'screenshot.png' });
await browser.close();

# Run
node ss.mjs

Common phone sizes to test:
390 x 844  → iPhone 14
375 x 667  → iPhone SE (small)
360 x 780  → Android mid-range
1280 x 800 → Desktop
```

---

### 38. flex: 1 vs fixed height — When Each Breaks
```css
/* flex: 1 = "take all remaining space" */
/* Problem: if parent has no defined height, flex: 1 = 0 */

/* This breaks: */
<main style="height: 100dvh">           /* OK — has height */
  <div style="flex: 1">                 /* takes remaining space */
    <button style="flex: 1">...</button> /* flex: 1 inside flex: 1 */
  </div>                                /* works because parent has height */
</main>

/* The chain must be unbroken: */
/* html: height 100% → body: height 100% → main: height 100dvh */
/* → each flex child can grow/shrink properly */

/* Fixed height = predictable, but doesn't adapt to screen size */
/* dvh splits = proportional, adapts to any phone height */
/* Rule: use dvh splits for full-screen mobile layouts */
```

---

### 39. Image Proxy Pattern — Serving External Images Securely
```ts
// Problem: Google photo URLs require an API key
// You can't put the URL directly in <img src> — key would be exposed

// Solution: route the image through your own server
// src/app/api/photo/route.ts

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")
  const url = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=600`

  const response = await fetch(url, {
    headers: { "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY! },
    redirect: "follow",
  })

  // Stream the image bytes directly back — no JSON, no extra step
  return new NextResponse(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",  // cache 24h
    },
  })
}

// In the component — just use it as an img src:
<img src={`/api/photo?name=${encodeURIComponent(photoName)}`} />
// Browser fetches it automatically — no useState, no useEffect needed
```

---

### 40. Google Places Photo Reference — How It Works
```
Step 1: searchText API returns places with photos array:
{
  photos: [
    { name: "places/ABC123/photos/XYZ789" }  ← this is a NAME, not a URL
  ]
}

Step 2: Use that name to fetch the actual image:
GET https://places.googleapis.com/v1/places/ABC123/photos/XYZ789/media
  ?maxHeightPx=600&maxWidthPx=600
  headers: { X-Goog-Api-Key: ... }

→ Google redirects to actual CDN image URL
→ Stream that back to the browser

// Field mask to request photos in searchText:
"X-Goog-FieldMask": "...,places.photos"

// Store type to hold it:
type Place = {
  photos?: { name: string }[]
}
```

---

### 41. Cache-Control — Don't Repeat Expensive Calls
```ts
// Add this header to any response that rarely changes:
"Cache-Control": "public, max-age=86400"
// → browser caches the response for 24 hours (86400 seconds)
// → same photo won't be fetched again for 24h
// → saves API quota + faster load on revisit

// For data that changes often:
"Cache-Control": "no-store"

// For data that's user-specific:
"Cache-Control": "private, max-age=300"
```

---

### 42. Haversine Formula — Distance Between Two Coordinates
```ts
// Used in winner screen to show "X min walk · Ym away"
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371  // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Walking speed assumption: ~80 meters per minute
const m = Math.round(km * 1000)
const walkMin = Math.round(m / 80)
// "5 min walk · 400m away"

// Limitation: we use places[0].location as the user location proxy
// (not perfect — the real user location isn't stored in the Zustand store)
```

---

### 43. Text Truncation for Third-Party Components
```ts
// react-custom-roulette has NO built-in text truncation
// Long names overflow past the wheel edge

// Fix: truncate before passing to the component
const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max - 1) + "…" : text

const data = places.map((place) => ({
  option: truncate(place.displayName.text, 14),
}))

// Key: 14 chars fits in a wheel slice at 10 slices
// The full name is still in the Zustand store → winner screen shows full name
// Rule: always truncate display text, never truncate stored data
```

---

### 44. Streaming Responses in Next.js Route Handlers
```ts
// Instead of fetching data and returning JSON:
const data = await response.json()
return NextResponse.json(data)  // parsed + re-serialized

// For images/binary, stream directly — faster, less memory:
return new NextResponse(response.body, {
  headers: { "Content-Type": "image/jpeg" }
})
// response.body is a ReadableStream — piped directly to the client
// No buffering in memory — efficient for large files
```

---

## Common Errors and Fixes

| Error | Fix |
|---|---|
| `Cannot find name 'router'` | Add `const router = useRouter()` inside component |
| `API Key exists: false` | Restart dev server after changing .env.local |
| `403 API_KEY_HTTP_REFERRER_BLOCKED` | Change Google Cloud key restriction from "Websites" to "None" |
| `502 Bad Gateway` | Google Places API error — check response body in terminal logs |
| `useEffect` not running | Add `"use client"` at top of file |
| `hydration mismatch` | Usually browser extension — ignore in development |
| `ERESOLVE` on npm install | Try `npm install package --legacy-peer-deps` |
| `echo ""` creates corrupt file | Always use VS Code sidebar to create files on Windows |
| Encoding error on page.tsx | Delete file, recreate via VS Code sidebar |
| `Places API error` in app | Check terminal (not browser) for actual error message |
| Mobile layout compressed/squished | Switch `100vh` → `100dvh`, use dvh splits not px heights |
| Font too small on mobile | Use `cqw` not `vw` — `vw` scales with full viewport, `cqw` scales with container |
| Font too big on desktop | Use `cqw` — it caps at container width (480px), won't blow up on wide screens |
| "This or That" text wrapping | Add `whiteSpace: "nowrap"` + reduce font size, or use `cqw` instead of `vw` |
| Layout overflows browser nav bar | Add `env(safe-area-inset-bottom)` padding + `viewportFit: "cover"` in layout.tsx |
| `Cannot find package 'playwright'` | Run `npm install --save-dev playwright --legacy-peer-deps` first |
| flex: 1 not filling space | Check the height chain: html → body → main must all have explicit heights |
| Photo not showing on winner screen | Check `places.photos` is in the field mask in route.ts |
| `Cannot find name 'useState'` after cleanup | You removed the import but left usage — remove both the import AND usage |
| Wheel text overflows outside slices | Truncate text to ~14 chars before passing to `data` prop |
| Image loads twice / flickers | Don't use useState + fetch for images — use `<img src="/api/photo?...">` directly |

---

## Things To Remember

1. **Folder name = URL** in Next.js — always lowercase
2. **Component name = PascalCase** — `function Filter()` not `function filter()`
3. **Always `"use client"`** when using hooks or browser APIs
4. **`route.ts` never needs `"use client"`** — always server-side
5. **Restart dev server** after `npm install` or changing `.env.local`
6. **Never commit `.env.local`** — already in `.gitignore`
7. **Create files via VS Code sidebar** on Windows — not terminal `echo`
8. **`const` by default**, `let` only when value needs to change
9. **Server logs → terminal**, client logs → browser DevTools console
10. **Programmers don't memorize** — they understand concepts and Google the syntax
11. **AI is a tool, not a replacement** — you need to understand the output to catch bugs
12. **`100dvh` not `100vh`** — always use `dvh` for mobile full-screen layouts
13. **`cqw` not `vw` for fonts** — `vw` breaks on desktop, `cqw` stays bounded to container
14. **Test on actual phone dimensions** — PC browser DevTools ≠ real mobile. Use Playwright screenshots.
15. **The height chain must be unbroken** — `html: 100%` → `body: 100%` → `main: 100dvh` for flex to work
16. **Duplicate CSS rules are valid but dangerous** — last definition wins. Search for duplicates when styles act weird.
17. **`clamp(min, preferred, max)`** — always set a floor and ceiling for responsive font sizes
18. **Never call `useState` for images** — just use `<img src="/api/route">` and let the browser handle it
19. **Photo names ≠ photo URLs** — Google returns a `name` string, you need to pass it through your proxy to get an actual image
20. **Add `Cache-Control` to proxy routes** — photos and static data should be cached to save API quota
21. **Truncate display text, not stored data** — wheel shows short names, winner screen shows full names from store
22. **Always check what fields you're requesting** — if data is missing, first check the `X-Goog-FieldMask` in route.ts
23. **When confused about an API call** — draw the flow: Browser → Our Server → External API → back. Each arrow is one network call. Minimize arrows.

---

*Last updated: May 26, 2026*  
*GitHub: github.com/ItsyBinsy/saan-tayo-kakain*
