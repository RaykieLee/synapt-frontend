"use client"

import { motion } from "framer-motion"
import React from "react"

interface ContentTransitionProps {
  children: React.ReactNode
  delay?: number
}

export function ContentTransition({ 
  children, 
  delay = 0 
}: ContentTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: delay, 
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

// 用于创建内容项序列的容器
export function ContentSequence({ 
  children,
  staggerDelay = 0.1
}: { 
  children: React.ReactNode
  staggerDelay?: number 
}) {
  // 获取子元素数组
  const childrenArray = React.Children.toArray(children)
  
  return (
    <>
      {childrenArray.map((child, index) => (
        <ContentTransition key={index} delay={index * staggerDelay}>
          {child}
        </ContentTransition>
      ))}
    </>
  )
} 