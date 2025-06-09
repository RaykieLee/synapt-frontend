"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { LucideIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableFacetedFilter
} from "@/components/shared/data-table"
import { RoleSearchParams } from "@/types/role"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch: (params: RoleSearchParams) => void
  columnLabels?: Record<string, string>
  showCreateButton?: boolean
  onCreateClick?: () => void
  createButtonText?: string
  createButtonIcon?: LucideIcon
  selectedRowsCount?: number
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  columnLabels = {},
  showCreateButton = false,
  onCreateClick,
  createButtonText = "创建",
  createButtonIcon: CreateIcon,
  selectedRowsCount = 0
}: DataTableToolbarProps<TData>) {
  // 使用ref存储当前的搜索参数
  const searchParamsRef = React.useRef<RoleSearchParams>({})

  // 状态选项
  const statusOptions = [
    { label: "正常", value: "0" },
    { label: "禁用", value: "1" },
  ]

  // 更新搜索参数
  const updateSearchParams = (key: keyof RoleSearchParams, value: string | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch();
  }

  // 创建防抖搜索函数
  const debouncedSearchFn = React.useCallback(() => {
    if (onSearch) {
      onSearch(searchParamsRef.current)
    }
  }, [onSearch]);

  // 防抖搜索，500ms延迟
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null)
  
  const debouncedSearch = React.useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    const timer = setTimeout(() => {
      debouncedSearchFn()
    }, 500)
    
    setDebounceTimer(timer)
  }, [debouncedSearchFn, debounceTimer])

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 角色名称搜索 */}
        <Input
          placeholder="搜索角色名称..."
          value={searchParamsRef.current.role_name ?? ""}
          onChange={(event) => {
            const value = event.target.value
            updateSearchParams("role_name", value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* 权限标识搜索 */}
        <Input
          placeholder="搜索权限标识..."
          value={searchParamsRef.current.role_key ?? ""}
          onChange={(event) => {
            const value = event.target.value
            updateSearchParams("role_key", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />

        {/* 状态筛选 */}
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="状态"
          options={statusOptions}
          onSelect={(selectedValue) => {
            const status = selectedValue && selectedValue.length > 0 ? selectedValue[0] : undefined;
            updateSearchParams("status", status);
            if (onSearch) {
              const updatedParams = {
                ...searchParamsRef.current,
                status: status
              };
              onSearch(updatedParams);
            }
          }}
        />

                {/* 重置按钮 */}
        {(searchParamsRef.current.role_name || searchParamsRef.current.role_key || searchParamsRef.current.status) && (
          <Button
            variant="ghost"
            onClick={() => {
              searchParamsRef.current = {}
              if (onSearch) {
                onSearch({})
              }
            }}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* 批量删除按钮 */}
        {selectedRowsCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => {
              // 这里可以添加批量删除逻辑
              console.log('批量删除选中项')
            }}
          >
            删除选中
          </Button>
        )}

        {/* 创建按钮 */}
        {showCreateButton && onCreateClick && (
          <Button onClick={onCreateClick} size="sm" className="h-8">
            {CreateIcon && <CreateIcon className="mr-2 h-4 w-4" />}
            {createButtonText}
          </Button>
        )}
      </div>
    </div>
  )
} 