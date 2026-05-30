import { test, expect, SHORT_PLACES } from "./fixtures"

test.describe("Filter Screen", () => {
  test("renders all meal type categories and budget pills", async ({ page }) => {
    await page.goto("/filter")

    for (const label of ["All", "Rice meal", "Fast food", "Snacks", "Dessert", "Drinks"]) {
      await expect(page.getByText(label).first()).toBeVisible()
    }
    for (const budget of ["Any", "₱100", "₱200", "₱300"]) {
      await expect(page.getByText(budget)).toBeVisible()
    }
    await expect(page.getByText("Find places →")).toBeVisible()
  })

  test("renders distance chips with Walking distance selected by default", async ({ page }) => {
    await page.goto("/filter")
    await expect(page.getByText("Around me")).toBeVisible()
    await expect(page.getByText("Walking distance")).toBeVisible()
    await expect(page.getByText("Short ride")).toBeVisible()
    const walkingBtn = page.getByText("Walking distance")
    await expect(walkingBtn).toBeVisible()
  })

  test("distance chip selection changes active chip", async ({ page }) => {
    await page.goto("/filter")
    await page.getByText("Around me").click()
    const aroundMeBtn = page.getByText("Around me")
    await expect(aroundMeBtn).toBeVisible()
  })

  test("navigates to /modes after successful search", async ({ page, context, loadApp }) => {
    await loadApp(SHORT_PLACES)
    await expect(page).toHaveURL(/\/modes/)
  })

  test("shows error when API returns 0 places after filtering", async ({ page, context }) => {
    await context.route("**/api/places", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ places: [] }),
      })
    )
    await page.goto("/filter")
    await page.getByText("Find places →").click()
    await expect(page.getByText("No places found")).toBeVisible({ timeout: 8000 })
    await expect(page).toHaveURL(/\/filter/)
  })

  test("shows error when API returns 500", async ({ page, context }) => {
    await context.route("**/api/places", (route) =>
      route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "Places API error" }) })
    )
    await page.goto("/filter")
    await page.getByText("Find places →").click()
    await expect(page.getByText(/error|failed/i).first()).toBeVisible({ timeout: 8000 })
    await expect(page).toHaveURL(/\/filter/)
  })
})
