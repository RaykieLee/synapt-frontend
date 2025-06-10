"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useState, useCallback, useRef } from "react"
import debounce from "lodash/debounce"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { DictDataSearchParams, DictData } from "@/types/dict"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: DictDataSearchParams) => void
  columnLabels?: Record<string, string>
  showCreateButton?: boolean
  onCreateClick?: () => void
  createButtonText?: string
  createButtonIcon?: React.ComponentType<any>
  selectedRowsCount?: number
  showBackButton?: boolean
  onBackClick?: () => void
  dictTypeName?: string
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
  showBackButton = false,
  onBackClick,
  dictTypeName = "",
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  // 使用本地状态管理搜索框的值
  const [dictLabelSearch, setDictLabelSearch] = useState("")
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<DictDataSearchParams>({})

  // 状态选项
  const statusOptions = [
    { label: "正常", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 更新搜索参数
  const updateSearchParams = (key: keyof DictDataSearchParams, value: string | undefined) => {
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

  // 自定义字典数据列标签
  const dictDataColumnLabels = {
    dict_sort: "排序",
    dict_label: "字典标签",
    dict_value: "字典键值",
    status: "状态",
    is_default: "是否默认",
    remark: "备注",
    ...columnLabels
  }

  // 处理搜索框重置
  const handleReset = () => {
    table.resetColumnFilters()
    searchParamsRef.current = {}
    setDictLabelSearch("")
    if (onSearch) {
      onSearch({})
    }
  }

  return (
    <div className="space-y-4">
      {/* 页面标题和返回按钮 */}
      {showBackButton && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onBackClick}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              字典数据管理：{dictTypeName}
            </h1>
          </div>
        </div>
      )}

      {/* 搜索和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="搜索字典标签..."
            value={dictLabelSearch}
            onChange={(event) => {
              const value = event.target.value
              setDictLabelSearch(value)
              updateSearchParams("dict_label", value)
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
          {(isFiltered || dictLabelSearch) && (
            <Button
              variant="ghost"
              onClick={handleReset}
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
            columnLabels={dictDataColumnLabels}
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
              (row) => (row.original as DictData).dict_code
            )
            // 这里需要调用批量删除的回调
            console.log("批量删除字典数据IDs:", ids)
          }}
          title="确认删除"
          description={`您确定要删除选中的 ${selectedRowsCount} 个字典数据吗？此操作无法撤销。`}
        />
      </div>
    </div>
  )
} 