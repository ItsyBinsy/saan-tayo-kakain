"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import {
    UtensilsCrossed,
    Beef,
    Sandwich,
    Coffee,
    IceCream,
    GlassWater,
}   from "lucide-react"

export default function Filter() {
    
    const mealTypes = [
        { label: "All", icon: <UtensilsCrossed size={14} /> },
        { label: "Rice meal", icon: <Beef size={14} /> },
        { label: "Fast food", icon: <Sandwich size={14} /> },
        { label: "Merienda", icon: <Coffee size={14} /> },
        { label: "Dessert", icon: <IceCream size={14} /> },
        { label: "Drinks", icon: <GlassWater size={14} /> },
    ]

    const router = useRouter()
    const [mealType, setMealType] = useState("All")
    const [budget, setBudget] = useState("Any price")
    const setPlaces = useStore((state) => state.setPlaces)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const categoryMap: Record<string, string> = {
    "All":       "restaurant or cafe or food near me",
    "Rice meal": "Filipino restaurant or carinderia or turo-turo",
    "Fast food": "fast food restaurant",
    "Merienda":  "cafe or bakery or bread",
    "Dessert":   "dessert shop or ice cream or milk tea",
    "Drinks":    "cafe or juice bar or milk tea or smoothie",
    }

    const fetchPlaces = async () => {
    setError(null)
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
        async (position) => {
        try {
            const { latitude, longitude } = position.coords
            const response = await fetch("/api/places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                textQuery: categoryMap[mealType],
                latitude,
                longitude,
            }),
            })

            if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error ?? "Failed to fetch places")
            }

            const data = await response.json()
            const priceLevelMap: Record<string, number> = {
            "Any price": Infinity,
            "₱100": 1,
            "₱200": 2,
            "₱300": 3,
            "₱400": 4,
            }

                const allPlaces = (data.places ?? [])
                const maxLevel = priceLevelMap[budget]
                const filtered = allPlaces.filter((p: any) => {
                if (!p.priceLevel || p.priceLevel === "PRICE_LEVEL_UNSPECIFIED") return true
                const levels = [
                    "PRICE_LEVEL_FREE",
                    "PRICE_LEVEL_INEXPENSIVE",
                    "PRICE_LEVEL_MODERATE",
                    "PRICE_LEVEL_EXPENSIVE",
                    "PRICE_LEVEL_VERY_EXPENSIVE"
                ]
                const level = levels.indexOf(p.priceLevel)
                return level <= maxLevel
                })

                if (filtered.length === 0) {
                setError("Walang nahanap sa budget na yan. Try a wider filter.")
                setLoading(false)
                return
                }

                const places = filtered.slice(0, 10)

            if (places.length === 0) {
            setError("Walang nahanap. Try a different filter.")
            setLoading(false)
            return
            }

            setPlaces(places)
            router.push("/modes")

        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.")
            setLoading(false)
        }
        },
        (geoError) => {
        setLoading(false)
        if (geoError.code === geoError.PERMISSION_DENIED) {
            setError("Location permission denied. Please enable it in your browser settings.")
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            setError("Could not determine your location.")
        } else {
            setError("Location request timed out.")
        }
        },
        { timeout: 10000 }
    )
    }

    return (
        <main className="flex flex-col min-h-screen p-6 bg-[var-(--surface)]">
            {/* Header */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full mb-6 bg-[var(--brand-light)] text-[var(--brand-dark)]">
                    <span>📍</span>
                    <span>Detecting location...</span>
                </div>

                <h1 className="text-4xl font-semibold leading-tight mb-2 text-[var(--text-main)]">
                Saan Tayo<br />Kakain
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                Tabi. Ako na.
                </p>                
            </div>

            {/* Meal Type */}
            <div className="mb-6">
                <p className="text-xs uppercase tracking-widest mb-3 text-[var(--text-muted)]">
                    Meal type
                </p>
                <div className="flex flex-wrap gap-2">
                    {mealTypes.map((item) => (
                        <button
                        key={item.label}
                        onClick={() => setMealType(item.label)}
                        className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-colors ${
                            mealType === item.label
                            ? "bg-[var(--text-main)] text-[var(--white)] border-[var(--text-main)]"
                            : "bg-white text-[var(--text-muted)] border-[var(--border-soft)]"
                        }`}
                        >
                        {item.icon}
                        {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px mb-6 bg-[var(--border-soft)]"></div>

            {/* Budget */}
            <div className="mb-8">
                <p className="text-xs uppercase tracking-widest mb-3 text-[var(--text-muted)]">
                    Budget
                </p>
                <div className="flex flex-wrap gap-2">
                    {["Any price", "₱100", "₱200", "₱300", "₱400"].map((item) => (
                        <button
                        key={item}
                        onClick={() => setBudget(item)}
                        className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                            budget === item
                                ? "bg-[var(--brand)] text-[var(--white)] border-[var(--brand)]"
                                : "bg-white text-[var(--text-muted)] border-[var(--border-soft)]"
                        }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Find places */}
            <button
            onClick={fetchPlaces}
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-sm font-medium transition-colors ${
                loading
                ? "bg-[var(--border-soft)] text-[var(--text-muted)]"
                : "bg-[var(--text-main)] text-[var(--white)]"
            }`}
            >
            {loading ? "Finding places..." : "Find places"}
            </button>
            
            {error && (
            <p className="text-sm text-center mt-4" style={{ color: "#E8472A" }}>
                {error}
            </p>
            )}
        </main>
    )
}



