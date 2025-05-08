"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"
import { useState, useCallback, useRef } from "react"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { alertCategoryAPI } from "@/api"
import { toast } from "sonner"
import { AlertCategory } from "@/types/alert"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: {
    name?: string;
    code?: string;
    status?: string;
  }) => void
  columnLabels?: Record<string, string>
  handleOpenCreateDialog?: () => void
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
  handleOpenCreateDialog,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<{
    name?: string;
    code?: string;
    status?: string;
  }>({})

  // 状态选项
  const statusOptions = [
    { label: "启用", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 批量删除
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => alertCategoryAPI.batchDelete(ids),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["alerts", "category"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 更新搜索参数
  const updateSearchParams = (key: string, value: string | undefined) => {
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

  // 自定义列标签
  const categoryColumnLabels = {
    name: "类别名称",
    code: "类别编码",
    description: "描述",
    status: "状态",
    create_time: "创建时间",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索类别名称..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("name")?.setFilterValue(value)
            updateSearchParams("name", value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="搜索类别编码..."
          value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("code")?.setFilterValue(value)
            updateSearchParams("code", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="状态"
            options={statusOptions}
            onSelect={() => {
              const value = table.getColumn("status")?.getFilterValue()
              updateSearchParams("status", Array.isArray(value) ? value[0] : value as string)
            }}
          />
        )}
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
        {table.getSelectedRowModel().rows.length > 0 && (
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
          columnLabels={categoryColumnLabels}
        />
        <Button
          size="sm"
          className="h-8"
          onClick={handleOpenCreateDialog}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          新建类别
        </Button>
      </div>

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const ids = table.getSelectedRowModel().rows.map(
            (row) => (row.original as AlertCategory).category_id
          )
          deleteMutation.mutate(ids)
        }}
        title="确认删除"
        description={`确定要删除选中的 ${table.getSelectedRowModel().rows.length} 个类别吗？此操作不可恢复。`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
} 