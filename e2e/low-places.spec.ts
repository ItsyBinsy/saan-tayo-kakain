"use strict"
import { test, expect, ONE_PLACE, TWO_PLACES, THREE_PLACES, FOUR_PLACES } from "./fixtures"

test.describe("Paikutin — low place counts", () => {
  test("1 place: wheel page renders with correct candidate count", async ({ page, loadApp, goToMode }) => {
    await loadApp(ONE_PLACE)
    await goToMode("paikutin")
    await expect(page.getByText("1 candidates")).toBeVisible()
    await expect(page.getByText("Paikutin")).toBeVisible()
  })

  test("2 places: wheel page renders with correct candidate count", async ({ page, loadApp, goToMode }) => {
    await loadApp(TWO_PLACES)
    await goToMode("paikutin")
    await expect(page.getByText("2 candidates")).toBeVisible()
    await expect(page.getByText("Paikutin")).toBeVisible()
  })
})

test.describe("This or That — low place counts", () => {
  test("2 places: shows Round 1 of 1, one pick ends game", async ({ page, loadApp, goToMode }) => {
    await loadApp(TWO_PLACES)
    await goToMode("this-or-that")
    await expect(page.getByText("Round 1 of 1")).toBeVisible()
    await page.getByText("Option A").click()
    await page.waitForURL("**/winner", { timeout: 12000 })
  })

  test("3 places: shows Round 1 of 2, two rounds to finish", async ({ page, loadApp, goToMode }) => {
    await loadApp(THREE_PLACES)
    await goToMode("this-or-that")
    await expect(page.getByText("Round 1 of 2")).toBeVisible()
    await page.getByText("Option A").click()
    await expect(page.getByText("Round 2 of 2")).toBeVisible()
    await page.getByText("Option A").click()
    await page.waitForURL("**/winner", { timeout: 12000 })
  })

  test("4 places: shows Round 1 of 3, three rounds to finish", async ({ page, loadApp, goToMode }) => {
    await loadApp(FOUR_PLACES)
    await goToMode("this-or-that")
    await expect(page.getByText("Round 1 of 3")).toBeVisible()
    await page.getByText("Option A").click()
    await expect(page.getByText("Round 2 of 3")).toBeVisible()
    await page.getByText("Option A").click()
    await expect(page.getByText("Round 3 of 3")).toBeVisible()
    await page.getByText("Option A").click()
    await page.waitForURL("**/winner", { timeout: 12000 })
  })
})

test.describe("Bahala Na — low place counts", () => {
  test("1 place: auto-picks and navigates to /winner", async ({ page, loadApp, goToMode }) => {
    await loadApp(ONE_PLACE)
    await goToMode("bahala-na")
    await page.waitForURL("**/winner", { timeout: 10000 })
    await expect(page.locator("h1")).not.toBeEmpty()
  })
})
