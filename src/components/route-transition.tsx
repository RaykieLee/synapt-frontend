"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import React from "react"

interface RouteTransitionProps {
  children: React.ReactNode
}

export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname()
  
  // 提取顶级路由路径（例如 /dashboard, /login）
  const baseRoute = `/${pathname.split('/')[1]}`
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={baseRoute}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}