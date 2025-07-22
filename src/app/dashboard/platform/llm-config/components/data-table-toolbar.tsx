import { useState, useCallback, useRef, useMemo } from "react"
import { Table } from "@tanstack/react-table"
import { X, Filter, ChevronDown, Plus } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/radix/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTableViewOptions } from "@/components/shared/data-table"
import { LLMConfigSearchParams } from "@/types/llm-config"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch: (searchParams: LLMConfigSearchParams) => void
  onAddNew?: () => void
  onBatchDelete?: (selectedIds: string[]) => void
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  onAddNew,
  onBatchDelete,
}: DataTableToolbarProps<TData>) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const searchParamsRef = useRef<LLMConfigSearchParams>({})

  // 防抖搜索
  const debouncedSearch = useMemo(() => debounce(() => {
    if (onSearch) onSearch(searchParamsRef.current)
  }, 500), [onSearch])

  const updateSearchParams = useCallback((key: string, value: string | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch()
  }, [debouncedSearch])

  // 计算活跃筛选器数量（排除主要搜索字段）
  const getActiveFiltersCount = () => {
    const filters = table.getState().columnFilters
    const excludeColumns = ["config_name", "provider"] // 排除主要搜索字段
    return filters.filter(filter => 
      !excludeColumns.includes(filter.id) && filter.value
    ).length
  }

  const activeFiltersCount = getActiveFiltersCount()
  const isFiltered = table.getState().columnFilters.length > 0

  // 清除所有筛选
  const clearAllFilters = () => {
    table.resetColumnFilters()
    searchParamsRef.current = {}
    if (onSearch) onSearch({})
  }

  // 清除高级筛选
  const clearAdvancedFilters = () => {
    // 保留主要搜索字段，清除其他筛选
    const mainFilters = ["config_name", "provider"]
    const newParams: LLMConfigSearchParams = {}
    
    mainFilters.forEach(field => {
      const value = table.getColumn(field)?.getFilterValue() as string
      if (value) {
        if (field === "config_name") {
          newParams.config_name = value
        } else if (field === "provider") {
          newParams.provider = value
        }
      }
    })
    
    // 清除非主要字段的筛选
    table.getState().columnFilters.forEach(filter => {
      if (!mainFilters.includes(filter.id)) {
        table.getColumn(filter.id)?.setFilterValue("")
      }
    })
    
    searchParamsRef.current = newParams
    if (onSearch) onSearch(newParams)
  }

  const selectedCount = table.getSelectedRowModel().rows.length

  const handleBatchDelete = () => {
    if (onBatchDelete) {
      const selectedIds = table.getSelectedRowModel().rows.map(
        (row) => (row.original as any).id
      )
      onBatchDelete(selectedIds)
      table.resetRowSelection()
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 主要搜索字段 */}
        <Input
          placeholder="搜索配置名称..."
          value={(table.getColumn("config_name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => {
            table.getColumn("config_name")?.setFilterValue(e.target.value)
            updateSearchParams("config_name", e.target.value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        <Select
          value={(table.getColumn("provider")?.getFilterValue() as string) || "all"}
          onValueChange={(value) => {
            const filterValue = value === "all" ? "" : value
            table.getColumn("provider")?.setFilterValue(filterValue)
            updateSearchParams("provider", value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="全部提供商" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部提供商</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="azure">Azure</SelectItem>
            <SelectItem value="deepseek">DeepSeek</SelectItem>
            <SelectItem value="moonshot">Moonshot</SelectItem>
            <SelectItem value="other">其他</SelectItem>
          </SelectContent>
        </Select>

        {/* 更多筛选 */}
        <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed relative">
              <Filter className="mr-2 h-4 w-4" />
              更多筛选
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">高级筛选</h4>
                <Button variant="ghost" size="sm" onClick={clearAdvancedFilters}>
                  清除
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">模型名称</label>
                  <Input
                    placeholder="搜索模型..."
                    value={(table.getColumn("model_name")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => {
                      table.getColumn("model_name")?.setFilterValue(e.target.value)
                      updateSearchParams("model_name", e.target.value)
                    }}
                    className="h-8"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">状态</label>
                  <Select
                    value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
                    onValueChange={(value) => {
                      const filterValue = value === "all" ? "" : value
                      table.getColumn("status")?.setFilterValue(filterValue)
                      updateSearchParams("status", value === "all" ? undefined : value)
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="0">启用</SelectItem>
                      <SelectItem value="1">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {activeFiltersCount > 0 ? `已应用 ${activeFiltersCount} 个筛选条件` : "未应用筛选条件"}
                </p>
                <Button size="sm" onClick={() => setMoreFiltersOpen(false)}>
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
            onClick={clearAllFilters}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* 右侧按钮 */}
      <div className="flex items-center space-x-2">
        {/* 批量删除按钮 */}
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={handleBatchDelete}
          >
            删除选中 ({selectedCount})
          </Button>
        )}
        
        {/* 显示列选择 */}
        <DataTableViewOptions 
          table={table} 
          columnLabels={{
            config_name: "配置名称",
            provider: "提供商",
            model_name: "模型名称",
            status: "状态",
            description: "描述",
            create_time: "创建时间"
          }}
        />
        
        {/* 新增配置按钮 */}
        {onAddNew && (
          <Button onClick={onAddNew} size="sm" className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            新增配置
          </Button>
        )}
      </div>
    </div>
  )
}