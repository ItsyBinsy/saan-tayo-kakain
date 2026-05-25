import { test as base } from "@playwright/test"

export type Place = {
  displayName: { text: string }
  formattedAddress: string
  location: { latitude: number; longitude: number }
  priceLevel?: string
  rating?: number
}

export const SHORT_PLACES: Place[] = [
  { displayName: { text: "Jco" }, formattedAddress: "123 Main St, Sampaloc, Manila", location: { latitude: 14.598, longitude: 120.984 }, priceLevel: "PRICE_LEVEL_MODERATE" },
  { displayName: { text: "KFC" }, formattedAddress: "456 Rizal Ave, Sampaloc, Manila", location: { latitude: 14.599, longitude: 120.985 }, priceLevel: "PRICE_LEVEL_INEXPENSIVE" },
  { displayName: { text: "BK" }, formattedAddress: "321 Orosa St, Manila", location: { latitude: 14.596, longitude: 120.982 }, priceLevel: "PRICE_LEVEL_MODERATE" },
  { displayName: { text: "Max" }, formattedAddress: "654 Padre Faura, Manila", location: { latitude: 14.595, longitude: 120.981 }, priceLevel: "PRICE_LEVEL_EXPENSIVE" },
  { displayName: { text: "McDo" }, formattedAddress: "789 Taft Ave, Manila", location: { latitude: 14.597, longitude: 120.983 }, priceLevel: "PRICE_LEVEL_INEXPENSIVE" },
]

export const LONG_PLACES: Place[] = [
  { displayName: { text: "Army Navy Burger + Burrito - Mezza Residences" }, formattedAddress: "Mezza Residences Blvd, 29 Aurora Blvd, Quezon City", location: { latitude: 14.598, longitude: 120.984 }, priceLevel: "PRICE_LEVEL_MODERATE" },
  { displayName: { text: "Jollibee Espana Blvd near UST Gate 2F" }, formattedAddress: "Espana Blvd, Sampaloc, Manila", location: { latitude: 14.599, longitude: 120.985 }, priceLevel: "PRICE_LEVEL_INEXPENSIVE" },
  { displayName: { text: "Max's Restaurant Quezon Ave Branch Main" }, formattedAddress: "789 Quezon Ave, Quezon City", location: { latitude: 14.597, longitude: 120.983 }, priceLevel: "PRICE_LEVEL_EXPENSIVE" },
  { displayName: { text: "Chowking Espana near UST Lacson Gate" }, formattedAddress: "321 Orosa St, Manila", location: { latitude: 14.596, longitude: 120.982 }, priceLevel: "PRICE_LEVEL_MODERATE" },
  { displayName: { text: "Greenwich Pizza Espana Mall Branch" }, formattedAddress: "654 Padre Faura, Manila", location: { latitude: 14.595, longitude: 120.981 }, priceLevel: "PRICE_LEVEL_MODERATE" },
]

// No location or priceLevel — triggers "Tara na doon!" fallback on winner screen
export const NO_DETAIL_PLACES: Place[] = [
  { displayName: { text: "Mystery Cafe" }, formattedAddress: "Somewhere, Manila", location: { latitude: 0, longitude: 0 } },
  { displayName: { text: "Ghost Kitchen" }, formattedAddress: "Nowhere, Manila", location: { latitude: 0, longitude: 0 } },
  { displayName: { text: "Void Resto" }, formattedAddress: "Void, Manila", location: { latitude: 0, longitude: 0 } },
  { displayName: { text: "Blank Eats" }, formattedAddress: "Blank, Manila", location: { latitude: 0, longitude: 0 } },
  { displayName: { text: "No Name" }, formattedAddress: "Unknown, Manila", location: { latitude: 0, longitude: 0 } },
]

type Fixtures = {
  /**
   * Mocks the Places API and navigates through filter → /modes,
   * leaving the Zustand store populated with the given places.
   * Always call this before navigating to a game mode.
   */
  loadApp: (places: Place[]) => Promise<void>
  /**
   * Clicks a mode button from /modes (keeps store alive vs page.goto).
   * mode: "paikutin" | "this-or-that" | "bahala-na"
   */
  goToMode: (mode: "paikutin" | "this-or-that" | "bahala-na") => Promise<void>
}

export const test = base.extend<Fixtures>({
  loadApp: async ({ page, context }, use) => {
    const load = async (places: Place[]) => {
      await context.unroute("**/api/places")
      await context.route("**/api/places", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ places }),
        })
      )
      await page.goto("/filter")
      await page.getByText("Find places →").click()
      // Store is now populated — we're at /modes
      await page.waitForURL("**/modes", { timeout: 10000 })
    }
    await use(load)
  },

  goToMode: async ({ page }, use) => {
    const go = async (mode: "paikutin" | "this-or-that" | "bahala-na") => {
      // Must already be on /modes. Click the mode button (not page.goto — that resets the store).
      const modeLabels: Record<string, string> = {
        "paikutin": "Paikutin",
        "this-or-that": "This or That",
        "bahala-na": "Bahala Na",
      }
      await page.getByText(modeLabels[mode], { exact: true }).click()
      await page.waitForURL(`**/modes/${mode}`, { timeout: 5000 })
    }
    await use(go)
  },
})

export { expect } from "@playwright/test"
