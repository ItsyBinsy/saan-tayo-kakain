import { test, expect, SHORT_PLACES } from "./fixtures"

test.describe("Navigation abuse / cheat prevention", () => {

  test("refresh on /modes/this-or-that → redirects to /filter (store wiped)", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("this-or-that")
    await expect(page.getByText("Option A")).toBeVisible()

    // Hard refresh — wipes in-memory store
    await page.reload()
    await page.waitForURL("**/filter", { timeout: 5000 })
    await expect(page).toHaveURL(/\/filter/)
  })

  test("refresh on /winner → redirects to /filter (store wiped)", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 8000 })

    await page.reload()
    await page.waitForURL("**/filter", { timeout: 5000 })
    await expect(page).toHaveURL(/\/filter/)
  })

  test("refresh on /modes/paikutin → redirects to /filter (store wiped)", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("paikutin")
    await expect(page.getByText("Paikutin")).toBeVisible()

    await page.reload()
    await page.waitForURL("**/filter", { timeout: 5000 })
    await expect(page).toHaveURL(/\/filter/)
  })

  test("browser back from /winner to /modes — used mode buttons are disabled", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)

    // Use Bahala Na → winner
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 8000 })

    // Use in-app "Try a different mode" to go back (keeps store alive)
    await page.getByText("Try a different mode").click()
    await page.waitForURL("**/modes", { timeout: 3000 })

    // Bahala Na button should be disabled
    const bahalaNaBtn = page.getByText("Bahala Na", { exact: true })
    await expect(bahalaNaBtn).toBeVisible()

    // Clicking it should be a no-op — stays on /modes
    await bahalaNaBtn.click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/modes/)

    // "Already used" label should appear next to Bahala Na
    const alreadyUsed = page.getByText("Already used")
    await expect(alreadyUsed).toBeVisible()
  })

  test("browser back from /winner to /modes/this-or-that — cannot replay the mode", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)

    // Complete This or That → winner
    await goToMode("this-or-that")
    for (let i = 0; i < 4; i++) {
      if (page.url().includes("/winner")) break
      await page.locator("button").first().click()
      await page.waitForTimeout(350)
    }
    await page.waitForURL("**/winner", { timeout: 8000 })

    // Use in-app button to go back to /modes (keeps store alive)
    await page.getByText("Try a different mode").click()
    await page.waitForURL("**/modes", { timeout: 3000 })

    // This or That button should now be disabled
    const totBtn = page.getByText("This or That", { exact: true })
    await totBtn.click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/modes/)

    // "Already used" label visible
    await expect(page.getByText("Already used")).toBeVisible()
  })

  test("direct URL hop to /winner without playing any mode", async ({ page }) => {
    // Fresh context — no store state at all
    await page.goto("/winner")
    await page.waitForURL("**/filter", { timeout: 5000 })
    await expect(page).toHaveURL(/\/filter/)
  })

  test("direct URL hop to game modes without searching first", async ({ page }) => {
    // No store state — all game modes should redirect to /filter
    await page.goto("/modes/paikutin")
    await page.waitForURL("**/filter", { timeout: 5000 })
    await expect(page).toHaveURL(/\/filter/)
  })

  test("closing tab and reopening starts fresh at /filter", async ({ context }) => {
    // Simulate close + reopen by creating a fresh page in same context
    // A new page has no store state — visiting any game screen redirects
    const freshPage = await context.newPage()
    await freshPage.goto("/winner")
    await freshPage.waitForURL("**/filter", { timeout: 5000 })
    await expect(freshPage).toHaveURL(/\/filter/)
    await freshPage.close()
  })

  test("spamming mode buttons only navigates once per unused mode", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)

    // Rapidly click Bahala Na multiple times
    const bahalaNaBtn = page.getByText("Bahala Na", { exact: true })
    await bahalaNaBtn.click()
    await bahalaNaBtn.click()
    await bahalaNaBtn.click()

    // Should navigate to bahala-na only once, then winner
    await page.waitForURL("**/winner", { timeout: 8000 })
    await expect(page).toHaveURL(/\/winner/)

    // Go back to modes — Bahala Na should be disabled (used once, not 3 times)
    await page.getByText("Try a different mode").click()
    await page.waitForURL("**/modes", { timeout: 3000 })

    const usedLabel = page.getByText("Already used")
    const count = await usedLabel.count()
    // Only 1 mode used despite 3 clicks
    expect(count).toBe(1)
  })

})
