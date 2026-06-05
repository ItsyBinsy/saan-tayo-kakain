"use client"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition" style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {children}
      <style>{`
        .page-transition {
          animation: page-fade-up 0.18s ease-out both;
        }
        @keyframes page-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
