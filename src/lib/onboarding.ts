const STORAGE_KEY = "onboarding_seen"

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false
  return !localStorage.getItem(STORAGE_KEY)
}

export function markOnboardingSeen() {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, "1")
}
