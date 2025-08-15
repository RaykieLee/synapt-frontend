"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ToolbarProps {
  onCreate: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function Toolbar({ onCreate, searchTerm, onSearchChange }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索配置名称..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      <Button onClick={onCreate} size="sm" className="h-8">
        <Plus className="mr-2 h-4 w-4" />
        创建配置
      </Button>
    </div>
  )
}