"use client"

import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { RotateCw, ArrowLeftRight, Shuffle } from "lucide-react"


export default function Modes() {
  const router = useRouter()
  const places = useStore((state) => state.places)


  const modes = [
    {
      id: "paikutin",
      name: "Paikutin",
      description: "Spin the wheel, fate decides",
      icon: <RotateCw size={20} />
    },
    {
      id: "this-or-that",
      name: "This or That",
      description: "Pick one, eliminate the rest",
      icon: <ArrowLeftRight size={20} />
    },
    {
      id: "bahala-na",
      name: "Bahala na",
      description: "Instant random pick",
      icon: <Shuffle size={20} />
    },
  ]

  return (
    <main className="flex flex-col min-h-screen p-6 bg-[var(--surface)]">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-2 text-[var(--text-muted)]">
          {places.length} places found
        </p>
        <h1 className="text-4xl font-semibold leading-tight mb-2 text-[var(--text-main)]">
          Pick a mode
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Paano natin pagpapasiyahan?
        </p>
      </div>

      {/* Mode cards */}
      <div className="flex flex-col gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={()=> router.push(`/modes/${mode.id}`)}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-white border-[var(--border-soft)] text-left transition-colors active:bg-[var(--brand-light)]"
          >
            <div className="w-12 h-12 rounded-xl flex justify-center items-center bg-[var(--brand-light)] text-[var(--brand)]" >
              {mode.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-main)]">
                {mode.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {mode.description}
              </p>
            </div>
          </button>
        ))}

      </div>
    </main>
  )
}
