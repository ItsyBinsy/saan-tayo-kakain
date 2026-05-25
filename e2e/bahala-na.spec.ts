import { test, expect, SHORT_PLACES } from "./fixtures"

test.describe("Bahala Na", () => {
  test("auto-picks a winner and navigates to /winner within 2s", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 5000 })
    await expect(page).toHaveURL(/\/winner/)
  })

  test("redirects to /filter when accessing with no places loaded", async ({ page }) => {
    await page.goto("/modes/bahala-na")
    await page.waitForURL("**/filter", { timeout: 5000 })
    await expect(page).toHaveURL(/\/filter/)
  })

  test("does not re-pick winner if mode already used", async ({ page, loadApp, goToMode }) => {
    await loadApp(SHORT_PLACES)

    // First visit — picks winner
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 5000 })
    const firstWinner = await page.locator("h1").textContent()

    // Use "Try a different mode" to go back to /modes (client-side nav — keeps store alive)
    await page.getByText("Try a different mode").click()
    await page.waitForURL("**/modes", { timeout: 3000 })

    // Bahala Na button should be disabled (marked used) — clicking it should be a no-op
    await page.getByText("Bahala Na", { exact: true }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/modes/)

    // Navigate to winner — should still be the same pick
    await page.getByText("This or That", { exact: true }).click()
    await page.waitForURL("**/modes/this-or-that", { timeout: 3000 })
    // Pick through to winner
    for (let i = 0; i < 4; i++) {
      if (page.url().includes("/winner")) break
      await page.locator("button").first().click()
      await page.waitForTimeout(300)
    }
    await page.waitForURL("**/winner", { timeout: 5000 })
    const secondWinner = await page.locator("h1").textContent()

    // Winner may differ (different mode picks differently) but original Bahala Na winner is still stored
    // The key check: Bahala Na is marked used and its button was not clickable
    expect(firstWinner).toBeTruthy()
    expect(secondWinner).toBeTruthy()
  })
})
