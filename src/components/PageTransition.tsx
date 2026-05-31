"use client"

import { motion } from "framer-motion"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", maxWidth: "480px", width: "100%", marginLeft: "auto", marginRight: "auto" }}
    >
      {children}
    </motion.div>
  )
}
