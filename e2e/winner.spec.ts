import { test, expect, SHORT_PLACES, LONG_PLACES, NO_DETAIL_PLACES } from "./fixtures"

test.describe("Winner Screen", () => {
  test("renders winner name and Get directions button", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 5000 })

    await expect(page.locator("h1")).not.toBeEmpty()
    await expect(page.getByText("Get directions")).toBeVisible()
    await expect(page.getByText("It's decided.")).toBeVisible()
  })

  test("long winner name expands hero without clipping", async ({ page, loadApp, goToMode }) => {
    await loadApp(LONG_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 5000 })

    const hero = await page.locator("main > div").first().boundingBox()
    const h1 = await page.locator("h1").boundingBox()

    expect(hero).not.toBeNull()
    expect(h1).not.toBeNull()

    if (hero && h1) {
      expect(h1.y + h1.height, "H1 clips outside hero section").toBeLessThanOrEqual(hero.y + hero.height + 5)
    }
  })

  test("shows 'Try a different mode' when not all modes used", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 5000 })

    await expect(page.getByText("Try a different mode")).toBeVisible()
    await expect(page.getByText("Wala nang lusot.")).not.toBeVisible()
  })

  test("shows 'Wala nang lusot' and hides Try button when all modes used", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)

    // Mode 1: Bahala Na
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 5000 })

    // Navigate back via in-app button (keeps store alive)
    await page.getByText("Try a different mode").click()
    await page.waitForURL("**/modes", { timeout: 3000 })

    // Mode 2: This or That — pick through all 4 rounds
    await goToMode("this-or-that")
    for (let i = 0; i < 4; i++) {
      if (page.url().includes("/winner")) break
      await page.locator("button").first().click()
      await page.waitForTimeout(350)
    }
    await page.waitForURL("**/winner", { timeout: 5000 })

    // Navigate back via in-app button
    await page.getByText("Try a different mode").click()
    await page.waitForURL("**/modes", { timeout: 3000 })

    // Mode 3: Paikutin — tap wheel to spin, wait for winner
    await goToMode("paikutin")
    await page.locator("main").click({ position: { x: 195, y: 480 } })
    await page.waitForURL("**/winner", { timeout: 12000 })

    await expect(page.getByText("Wala nang lusot.")).toBeVisible()
    await expect(page.getByText("Try a different mode")).not.toBeVisible()
    await expect(page.getByText(/Nagamit mo na lahat/)).toBeVisible()
  })

  test("shows distance detail when location available but no price level", async ({ page, loadApp, goToMode }) => {
    await loadApp(NO_DETAIL_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 5000 })

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
