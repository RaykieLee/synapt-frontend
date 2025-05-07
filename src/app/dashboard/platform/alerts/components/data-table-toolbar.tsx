"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
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
import { alertConfigAPI, alertCategoryAPI } from "@/api"
import { toast } from "sonner"
import { AlertCategory, AlertConfig, AlertSearchParams } from "@/types/alert"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: AlertSearchParams) => void
  columnLabels?: Record<string, string>
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<AlertSearchParams>({})

  // 获取所有告警类别
  const { data: categoriesResponse } = useQuery({
    queryKey: ["alerts", "category", "all"],
    queryFn: () => alertCategoryAPI.getAll(),
  })

  const categories = categoriesResponse?.data || []
  const categoryOptions = categories.map((category: AlertCategory) => ({
    label: category.name,
    value: category.category_id.toString(),
  }))

  // 状态选项
  const statusOptions = [
    { label: "启用", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 批量删除
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => alertConfigAPI.batchDelete(ids),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["alerts", "config"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 更新搜索参数
  const updateSearchParams = (key: keyof AlertSearchParams, value: any) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch();
  }

  // 使用防抖处理搜索
  const debouncedSearch = useCallback(
    debounce(() => {
      if (onSearch) {
        onSearch(searchParamsRef.current)
      }
    }, 500),
    [onSearch]
  )

  // 从表格过滤状态更新搜索参数
  const updateFromFilters = useCallback(() => {
    if (onSearch) {
      const filters = table.getState().columnFilters
      const searchParams: AlertSearchParams = {}

      filters.forEach((filter) => {
        if (filter.id === "name") {
          searchParams.name = filter.value as string
        } else if (filter.id === "code") {
          searchParams.code = filter.value as string
        } else if (filter.id === "status") {
          searchParams.status = Array.isArray(filter.value) 
            ? (filter.value[0] as string) 
            : (filter.value as string)
        } else if (filter.id === "categories") {
          searchParams.category_ids = filter.value as number[]
        }
      })

      // 更新当前的搜索参数
      searchParamsRef.current = searchParams
      onSearch(searchParams)
    }
  }, [table, onSearch])

  // 自定义告警列标签
  const alertColumnLabels = {
    name: "配置名称",
    code: "配置编码",
    threshold: "告警阈值",
    frequency: "告警频率",
    categories: "告警类别",
    status: "状态",
    create_time: "创建时间",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索配置名称..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("name")?.setFilterValue(value)
            updateSearchParams("name", value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="搜索配置编码..."
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
              updateSearchParams("status", Array.isArray(value) ? value[0] : value)
            }}
          />
        )}
        {table.getColumn("categories") && (
          <DataTableFacetedFilter
            column={table.getColumn("categories")}
            title="告警类别"
            options={categoryOptions}
            onSelect={() => {
              const value = table.getColumn("categories")?.getFilterValue()
              updateSearchParams("category_ids", value)
            }}
            multiple={true}
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
          columnLabels={alertColumnLabels}
        />
        <Button
          size="sm"
          className="h-8"
          onClick={() => router.push("/dashboard/platform/alerts/create")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          新建配置
        </Button>
      </div>

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const ids = table.getSelectedRowModel().rows.map(
            (row) => (row.original as AlertConfig).id
          )
          deleteMutation.mutate(ids)
        }}
        title="确认删除"
        description={`确定要删除选中的 ${table.getSelectedRowModel().rows.length} 个配置吗？此操作不可恢复。`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
} 