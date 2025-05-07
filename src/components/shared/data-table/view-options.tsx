"use client"

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Table } from "@tanstack/react-table"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  columnLabels?: Record<string, string>
}

export function DataTableViewOptions<TData>({
  table,
  columnLabels = {},
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 flex"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          显示列
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>切换列显示</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) => 
              typeof column.accessorFn !== "undefined" && 
              column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) =>
                  column.toggleVisibility(!!value)
                }
              >
                {getColumnLabel(column.id, columnLabels)}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// 列ID转显示标签
function getColumnLabel(columnId: string, customLabels: Record<string, string> = {}): string {
  // 默认列标签
  const defaultColumnLabels: Record<string, string> = {
    name: "名称",
    code: "编码",
    title: "标题",
    description: "描述",
    type: "类型",
    status: "状态",
    price: "价格",
    amount: "数量",
    create_time: "创建时间",
    update_time: "更新时间",
  }
  
  // 优先使用自定义标签，其次使用默认标签，最后使用列ID本身
  return customLabels[columnId] || defaultColumnLabels[columnId] || columnId
} 