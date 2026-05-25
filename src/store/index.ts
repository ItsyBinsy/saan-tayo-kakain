import { create } from "zustand"

type Place = {
    displayName: { text: string }
    formattedAddress: string
    location: { latitude: number; longitude: number }
    rating?: number
    priceLevel?: string
    businessStatus?: string
}

type Store = {
    places: Place[]
    mealType: string
    budget: string
    winner: Place | null
    setPlaces: (places: Place[]) => void
    setMealType: (mealType: string) => void
    setBudget: (budget: string) => void
    setWinner: (winner: Place) => void
}

export const useStore = create<Store>((set) => ({
    places: [],
    mealType: "All",
    budget: "All",
    winner: null,
    setPlaces: (places) => set({ places }),
    setMealType: (mealType) => set({ mealType }),
    setBudget: (budget) => set({ budget }),
    setWinner: (winner) => set({ winner }),
}))
