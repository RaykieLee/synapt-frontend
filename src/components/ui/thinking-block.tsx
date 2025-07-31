"use client"

import React, { useState } from "react"
import { Brain, ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"

interface ThinkingBlockProps {
  content: string
  isThinkingComplete?: boolean
  className?: string
}

/**
 * 思维链组件
 * 使用 Collapsible 折叠显示 AI 的思考过程
 */
export function ThinkingBlock({ content, isThinkingComplete = true, className }: ThinkingBlockProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!content || content.trim().length === 0) {
    return null
  }

  // 使用传入的完成状态
  const isThinking = !isThinkingComplete

  return (
    <div className={cn("w-full max-w-none", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border rounded-lg">
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Brain className={cn("h-4 w-4", isThinking && "animate-pulse")} />
              <span>思考过程</span>
              {isThinking && (
                <span className="text-xs opacity-70 animate-pulse">
                  (思考中...)
                </span>
              )}
              {!isThinking && (
                <span className="text-xs opacity-70">
                  ({content.length} 字符)
                </span>
              )}
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="border-t pt-3">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <MarkdownRenderer>{content}</MarkdownRenderer>
                {isThinking && (
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    <span className="text-xs">AI 正在思考...</span>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

ThinkingBlock.displayName = "ThinkingBlock"
