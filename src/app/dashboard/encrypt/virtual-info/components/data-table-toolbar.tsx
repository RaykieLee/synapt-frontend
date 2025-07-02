"use client"

import { useRef, useCallback, useState } from "react"
import { Table } from "@tanstack/react-table"
import debounce from "lodash/debounce"
import { X, Filter, Plus, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTableViewOptions } from "@/components/shared/data-table"

import { VirtualInfo, VirtualInfoSearchParams } from "@/types/encrypt"

interface DataTableToolbarProps {
  table: Table<VirtualInfo>
  onSearch?: (params: VirtualInfoSearchParams) => void
  selectedCount?: number
  onBatchDelete?: () => void
  onAddNew?: () => void
}

export function DataTableToolbar({ 
  table, 
  onSearch, 
  selectedCount = 0, 
  onBatchDelete,
  onAddNew
}: DataTableToolbarProps) {
  const searchParamsRef = useRef<VirtualInfoSearchParams>({})
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)

  // 防抖搜索
  const debouncedSearch = debounce(() => {
    if (onSearch) onSearch(searchParamsRef.current)
  }, 500)

  const updateSearchParams = useCallback((key: string, value: string | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch()
  }, [debouncedSearch])

  // 计算活跃筛选器数量
  const getActiveFiltersCount = () => {
    const filters = table.getState().columnFilters
    // 排除主要搜索字段
    const excludeColumns = ["first", "username", "status"]
    return filters.filter(filter => !excludeColumns.includes(filter.id) && filter.value).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  const isFiltered = table.getState().columnFilters.length > 0 || 
    Object.keys(searchParamsRef.current).some(key => searchParamsRef.current[key as keyof VirtualInfoSearchParams])

  const handleReset = () => {
    table.resetColumnFilters()
    searchParamsRef.current = {}
    if (onSearch) onSearch({})
  }

  const clearAdvancedFilters = () => {
    // 清除高级筛选器
    table.getColumn("email")?.setFilterValue("")
    table.getColumn("phone")?.setFilterValue("")
    table.getColumn("gender")?.setFilterValue("")
    table.getColumn("city")?.setFilterValue("")
    // 更新搜索参数
    updateSearchParams("email", undefined)
    updateSearchParams("phone", undefined)
    updateSearchParams("gender", undefined)
    updateSearchParams("city", undefined)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 姓名搜索 */}
        <Input
          placeholder="搜索姓名..."
          value={(table.getColumn("first")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("first")?.setFilterValue(value)
            updateSearchParams("first", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />

        {/* 用户名搜索 */}
        <Input
          placeholder="搜索用户名..."
          value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("username")?.setFilterValue(value)
            updateSearchParams("username", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />

        {/* 状态筛选 */}
        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
          onValueChange={(value) => {
            const filterValue = value === "all" ? "" : value
            table.getColumn("status")?.setFilterValue(filterValue)
            updateSearchParams("status", value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="0">启用</SelectItem>
            <SelectItem value="1">停用</SelectItem>
          </SelectContent>
        </Select>

        {/* 更多筛选Popover */}
        <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 border-dashed relative"
            >
              <Filter className="mr-2 h-4 w-4" />
              更多筛选
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none">高级筛选</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={clearAdvancedFilters}
                >
                  清除
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">邮箱</label>
                  <Input 
                    placeholder="搜索邮箱" 
                    className="h-8"
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => {
                      const value = event.target.value
                      table.getColumn("email")?.setFilterValue(value)
                      updateSearchParams("email", value)
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">电话</label>
                  <Input 
                    placeholder="搜索电话" 
                    className="h-8"
                    value={(table.getColumn("phone")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => {
                      const value = event.target.value
                      table.getColumn("phone")?.setFilterValue(value)
                      updateSearchParams("phone", value)
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">性别</label>
                  <Select
                    value={(table.getColumn("gender")?.getFilterValue() as string) || "all"}
                    onValueChange={(value) => {
                      const filterValue = value === "all" ? "" : value
                      table.getColumn("gender")?.setFilterValue(filterValue)
                      updateSearchParams("gender", value === "all" ? undefined : value)
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">城市</label>
                  <Input 
                    placeholder="搜索城市" 
                    className="h-8"
                    value={(table.getColumn("city")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => {
                      const value = event.target.value
                      table.getColumn("city")?.setFilterValue(value)
                      updateSearchParams("city", value)
                    }}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {activeFiltersCount > 0 ? `已应用 ${activeFiltersCount} 个筛选条件` : "未应用筛选条件"}
                </p>
                <Button
                  size="sm"
                  onClick={() => setMoreFiltersOpen(false)}
                  className="h-7"
                >
                  完成
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 重置按钮 */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* 批量删除 */}
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBatchDelete}
            className="h-8"
          >
            删除选中 ({selectedCount})
          </Button>
        )}
        
        {/* 显示列选择 */}
        <DataTableViewOptions 
          table={table} 
          columnLabels={{
            first: "姓名",
            username: "用户名", 
            email: "邮箱",
            phone: "电话",
            gender: "性别",
            city: "地址",
            nat: "国籍",
            status: "状态",
            create_time: "创建时间"
          }}
        />

        {/* 新增按钮 */}
        {onAddNew && (
          <Button onClick={onAddNew} size="sm" className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            新增虚拟信息
          </Button>
        )}
      </div>
    </div>
  )
} 