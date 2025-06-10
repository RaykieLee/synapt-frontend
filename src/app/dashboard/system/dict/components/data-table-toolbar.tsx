"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useState, useCallback, useRef } from "react"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { DictTypeSearchParams, DictType } from "@/types/dict"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: DictTypeSearchParams) => void
  columnLabels?: Record<string, string>
  showCreateButton?: boolean
  onCreateClick?: () => void
  createButtonText?: string
  createButtonIcon?: React.ComponentType<any>
  selectedRowsCount?: number
  onBatchDelete?: (ids: number[]) => void
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
  showCreateButton = false,
  onCreateClick,
  createButtonText = "新建",
  createButtonIcon: CreateIcon,
  selectedRowsCount = 0,
  onBatchDelete,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<DictTypeSearchParams>({})

  // 状态选项
  const statusOptions = [
    { label: "正常", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 更新搜索参数
  const updateSearchParams = (key: keyof DictTypeSearchParams, value: string | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch();
  }

  // 创建防抖搜索函数
  const debouncedSearchFn = useCallback(() => {
    if (onSearch) {
      onSearch(searchParamsRef.current)
    }
  }, [onSearch]);

  // 使用防抖处理搜索
  const debouncedSearch = debounce(debouncedSearchFn, 500);

  // 自定义字典类型列标签
  const dictTypeColumnLabels = {
    dict_name: "字典名称",
    dict_type: "字典类型",
    status: "状态",
    create_time: "创建时间",
    remark: "备注",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索字典名称..."
          value={(table.getColumn("dict_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            updateSearchParams("dict_name", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        <Input
          placeholder="搜索字典类型..."
          value={(table.getColumn("dict_type")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            updateSearchParams("dict_type", value)
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
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              searchParamsRef.current = {}
              if (onSearch) {
                onSearch({})
              }
            }}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {selectedRowsCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setDeleteOpen(true)}
          >
            删除选中
          </Button>
        )}
        <DataTableViewOptions 
          table={table} 
          columnLabels={dictTypeColumnLabels}
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

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const ids = table.getSelectedRowModel().rows.map(
            (row) => (row.original as DictType).dict_id
          )
          if (onBatchDelete) {
            onBatchDelete(ids)
          }
          setDeleteOpen(false)
        }}
        title="确认删除"
        description={`您确定要删除选中的 ${selectedRowsCount} 个字典类型吗？此操作无法撤销。`}
      />
    </div>
  )
} 