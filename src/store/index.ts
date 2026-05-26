import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Place = {
    displayName: { text: string }
    formattedAddress: string
    location: { latitude: number; longitude: number }
    rating?: number
    priceLevel?: string
    businessStatus?: string
    photos?: { name: string }[]
    regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] }
}

type Store = {
    places: Place[]
    mealType: string
    budget: string
    winner: Place | null
    usedModes: string[]
    setPlaces: (places: Place[]) => void
    setMealType: (mealType: string) => void
    setBudget: (budget: string) => void
    setWinner: (winner: Place) => void
    addUsedMode: (mode: string) => void
    resetModes: () => void
}

export const useStore = create<Store>()(
    persist(
        (set) => ({
            places: [],
            mealType: "All",
            budget: "All",
            winner: null,
            usedModes: [],
            setPlaces: (places) => set({ places }),
            setMealType: (mealType) => set({ mealType }),
            setBudget: (budget) => set({ budget }),
            setWinner: (winner) => set({ winner }),
            addUsedMode: (mode) => set((state) => ({
                usedModes: [...state.usedModes, mode]
            })),
            resetModes: () => set({ usedModes: [], winner: null }),
        }),
        {
            name: "stk-store",
            partialize: (state) => ({ usedModes: state.usedModes }),
        }
    )
)
