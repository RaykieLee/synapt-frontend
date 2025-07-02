"use client"

import { useCallback, useRef, useMemo } from "react"
import { Table } from "@tanstack/react-table"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTableViewOptions } from "@/components/shared/data-table"
import { X } from "lucide-react"

import type { 
  BrowserEnvironment, 
  BrowserEnvironmentSearchParams 
} from "@/types/encrypt/browser-environment"
import { BROWSER_TYPE_OPTIONS, STATUS_OPTIONS } from "@/types/encrypt/browser-environment"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: BrowserEnvironmentSearchParams) => void
  columnLabels?: Record<string, string>
  showCreateButton?: boolean
  onCreateClick?: () => void
  createButtonText?: string
  createButtonIcon?: React.ComponentType<any>
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
  showCreateButton = false,
  onCreateClick,
  createButtonText = "新建",
  createButtonIcon: CreateIcon,
}: DataTableToolbarProps<TData>) {
  const searchParamsRef = useRef<BrowserEnvironmentSearchParams>({})

  // 防抖搜索 - 使用useMemo缓存debounce函数
  const debouncedSearch = useMemo(() => debounce(() => {
    if (onSearch) {
      onSearch(searchParamsRef.current)
    }
  }, 500), [onSearch])

  // 更新搜索参数
  const updateSearchParams = useCallback((key: string, value: string | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch()
  }, [debouncedSearch])

  // 检查是否有筛选条件
  const isFiltered = table.getState().columnFilters.length > 0

  // 重置筛选
  const resetFilters = () => {
    table.resetColumnFilters()
    searchParamsRef.current = {}
    if (onSearch) {
      onSearch({})
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 环境名称搜索 */}
        <Input
          placeholder="搜索环境名称..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => {
            table.getColumn("name")?.setFilterValue(e.target.value)
            updateSearchParams("name", e.target.value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />

        {/* 实例ID搜索 - 紧跟在环境名称后面 */}
        <Input
          placeholder="搜索实例ID..."
          value={(table.getColumn("browser_id")?.getFilterValue() as string) ?? ""}
          onChange={(e) => {
            table.getColumn("browser_id")?.setFilterValue(e.target.value)
            updateSearchParams("browser_id", e.target.value)
          }}
          className="h-8 w-[150px] lg:w-[160px]"
        />

        {/* 浏览器类型筛选 */}
        <Select
          value={(table.getColumn("browser_type")?.getFilterValue() as string) || "all"}
          onValueChange={(value) => {
            const filterValue = value === "all" ? "" : value
            table.getColumn("browser_type")?.setFilterValue(filterValue)
            updateSearchParams("browser_type", value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger className="h-8 w-[140px] lg:w-[160px]">
            <SelectValue placeholder="浏览器类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            {BROWSER_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 状态筛选 */}
        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
          onValueChange={(value) => {
            const filterValue = value === "all" ? "" : value
            table.getColumn("status")?.setFilterValue(filterValue)
            updateSearchParams("status", value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger className="h-8 w-[110px] lg:w-[120px]">
            <SelectValue placeholder="运行状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 重置按钮 */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {table.getSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
          >
            删除选中
          </Button>
        )}
        <DataTableViewOptions 
          table={table} 
          columnLabels={columnLabels || {
            name: "环境名称",
            browser_type: "浏览器类型",
            browser_id: "实例ID", 
            status: "运行状态",
            last_used: "最后使用",
            create_time: "创建时间",
            remark: "备注"
          }}
        />
        {showCreateButton && onCreateClick && (
          <Button
            size="sm"
            className="h-8"
            onClick={onCreateClick}
          >
            {CreateIcon && <CreateIcon className="mr-2 h-4 w-4" />}
            {createButtonText}
          </Button>
        )}
      </div>
    </div>
  )
} 