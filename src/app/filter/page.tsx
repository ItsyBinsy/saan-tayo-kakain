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
    const [budget, setBudget] = useState("All")
    const setPlaces = useStore((state) => state.setPlaces)

    const categoryMap: Record<string, string> = {
    "All":       "restaurant or cafe or food near me",
    "Rice meal": "Filipino restaurant or carinderia or turo-turo",
    "Fast food": "fast food restaurant",
    "Merienda":  "cafe or bakery or bread",
    "Dessert":   "dessert shop or ice cream or milk tea",
    "Drinks":    "cafe or juice bar or milk tea or smoothie",
    }

    const fetchPlaces = async () => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords

            const response = await fetch(
            `https://places.googleapis.com/v1/places:searchText`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
                "X-Goog-FieldMask": "places.displayName,places.location,places.formattedAddress,places.businessStatus,places.priceLevel,places.rating",
                },
                body: JSON.stringify({
                textQuery: categoryMap[mealType],
                maxResultCount: 20,
                locationBias: {
                    circle: {
                    center: {
                        latitude,
                        longitude,
                    },
                    radius: 500,
                    },
                },
                }),
            }
            )

            const data = await response.json()
            const places = data.places.slice(0, 10)
            setPlaces(places)
            router.push("/modes")
        })
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
                    {["All", "<₱100", "<₱150", "<₱200", "<₱300"].map((item) => (
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
            className="w-full py-4 rounded-2xl text-sm font-medium transition-colors bg-[var(--text-main)] text-[var(--white)]"
            >
                Find places
            </button>
        </main>
    )
}



