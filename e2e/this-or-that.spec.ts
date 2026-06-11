import { test, expect, SHORT_PLACES, LONG_PLACES, TWO_PLACES } from "./fixtures"

test.describe("This or That", () => {
  test("shows Option A/B cards and round label", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("this-or-that")

    await expect(page.getByText("Option A")).toBeVisible()
    await expect(page.getByText("Option B")).toBeVisible()
    await expect(page.getByText(/Round 1 of/)).toBeVisible()
    await expect(page.getByText("Tap to pick · loser is eliminated")).toBeVisible()
  })

  test("short names render without card overflow", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("this-or-that")

    await expect(page.getByText("Option A")).toBeVisible()

    const viewport = page.viewportSize()!
    const cards = page.locator("button:has-text('Option')")
    const count = await cards.count()

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox()
      if (box) {
        expect(box.x + box.width, `Card ${i} overflows viewport`).toBeLessThanOrEqual(viewport.width + 2)
      }
    }
  })

  test("long names wrap inside cards without overflowing viewport", async ({ page, loadApp, goToMode }) => {
    await loadApp(LONG_PLACES)
    await goToMode("this-or-that")

    await expect(page.getByText("Option A")).toBeVisible()

    const viewport = page.viewportSize()!
    const cards = page.locator("button:has-text('Option')")
    const count = await cards.count()

    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox()
      if (box) {
        expect(box.x + box.width, `Card ${i} overflows viewport with long name`).toBeLessThanOrEqual(viewport.width + 2)
      }
    }
  })

  test("completes 4-round elimination and navigates to /winner", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("this-or-that")

    for (let round = 1; round <= 4; round++) {
      if (page.url().includes("/winner")) break
      await expect(page.getByText(new RegExp(`Round ${round} of`))).toBeVisible()
      await page.locator("button").first().click()
      await page.waitForTimeout(500)
    }

    await page.waitForURL("**/winner", { timeout: 20000 })
    await expect(page.locator("h1")).not.toBeEmpty()
  })

  test("2 places: shows Round 1 of 1 and one pick ends the game", async ({ page, loadApp, goToMode }) => {
    await loadApp(TWO_PLACES)
    await goToMode("this-or-that")
    await expect(page.getByText("Round 1 of 1")).toBeVisible()
    await page.locator("button").first().click()
    await page.waitForURL("**/winner", { timeout: 20000 })
    await expect(page.locator("h1")).not.toBeEmpty()
  })

  test("redirects to /filter when accessing with no places loaded", async ({ page }) => {
    await page.goto("/modes/this-or-that")
    await page.waitForURL("**/filter", { timeout: 5000 })
    await expect(page).toHaveURL(/\/filter/)
  })
})
