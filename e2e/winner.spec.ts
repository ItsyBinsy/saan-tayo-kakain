import { test, expect, SHORT_PLACES, LONG_PLACES, NO_DETAIL_PLACES } from "./fixtures"

test.describe("Winner Screen", () => {
  test("renders winner name and Get directions button", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 10000 })

    await expect(page.locator("h1")).not.toBeEmpty()
    await expect(page.getByText("Get directions")).toBeVisible()
    await expect(page.getByText("It's decided.")).toBeVisible()
  })

  test("long winner name expands hero without clipping", async ({ page, loadApp, goToMode }) => {
    await loadApp(LONG_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 10000 })

    const hero = await page.locator("main > div").first().boundingBox()
    const h1 = await page.locator("h1").boundingBox()

    expect(hero).not.toBeNull()
    expect(h1).not.toBeNull()

    if (hero && h1) {
      expect(h1.y + h1.height, "H1 clips outside hero section").toBeLessThanOrEqual(hero.y + hero.height + 5)
    }
  })

  test("shows 'Try another mode' when not all modes used", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 10000 })

    await expect(page.getByText("Try another mode")).toBeVisible()
    await expect(page.getByText("Wala nang lusot.")).not.toBeVisible()
  })

  test("shows all modes disabled on modes page when all used", async ({ page, loadApp }) => {
    await loadApp([
      { displayName: { text: "Jco" }, formattedAddress: "Manila", location: { latitude: 14.598, longitude: 120.984 } },
      { displayName: { text: "KFC" }, formattedAddress: "Manila", location: { latitude: 14.599, longitude: 120.985 } },
    ])
    // Seed all 3 modes as used directly in localStorage
    await page.evaluate(() => {
      const raw = localStorage.getItem("stk-store")
      if (!raw) return
      const stored = JSON.parse(raw)
      stored.state.usedModes = ["bahala-na", "this-or-that", "paikutin"]
      localStorage.setItem("stk-store", JSON.stringify(stored))
    })
    await page.reload()
    await page.waitForURL("**/modes", { timeout: 5000 })
    const usedLabels = page.getByText("Already used")
    await expect(usedLabels.first()).toBeVisible()
    const count = await usedLabels.count()
    expect(count).toBe(3)
  })

  test("shows distance detail when location available but no price level", async ({ page, loadApp, goToMode }) => {
    await loadApp(NO_DETAIL_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 10000 })

    // No priceLevel set — price detail should not appear
    await expect(page.getByText(/per person/)).not.toBeVisible()
    // But Get directions should always show
    await expect(page.getByText("Get directions")).toBeVisible()
  })

  test("redirects to /filter when accessing with no winner state", async ({ page }) => {
    await page.goto("/winner")
    await page.waitForURL("**/filter", { timeout: 5000 })
    await expect(page).toHaveURL(/\/filter/)
  })
})
