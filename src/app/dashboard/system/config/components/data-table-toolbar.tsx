"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
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
import { configAPI } from "@/api/config"
import { toast } from "sonner"
import { Config, ConfigSearchParams } from "@/types/config"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: ConfigSearchParams) => void
  onCreateConfig?: () => void
  columnLabels?: Record<string, string>
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  onCreateConfig,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<ConfigSearchParams>({})

  // 状态选项
  const statusOptions = [
    { label: "正常", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 批量删除
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map(id => configAPI.delete(id))
      await Promise.all(promises)
      return { success: true }
    },
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["configs"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 更新搜索参数
  const updateSearchParams = (key: keyof ConfigSearchParams, value: string | undefined) => {
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

  // 自定义配置列标签
  const configColumnLabels = {
    config_name: "配置名称",
    config_key: "配置键名",
    config_value: "配置键值",
    status: "状态",
    remark: "备注",
    create_time: "创建时间",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索配置名称..."
          value={(table.getColumn("config_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("config_name")?.setFilterValue(value)
            updateSearchParams("config_name", value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="搜索配置键名..."
          value={(table.getColumn("config_key")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("config_key")?.setFilterValue(value)
            updateSearchParams("config_key", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        {table.getColumn("status") && (
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
          columnLabels={configColumnLabels}
        />
        <Button
          size="sm"
          className="h-8"
          onClick={onCreateConfig}
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
            (row) => (row.original as Config).config_id
          ).filter((id): id is number => id !== undefined)
          deleteMutation.mutate(ids)
        }}
        title="确认删除"
        description={`确定要删除选中的 ${table.getSelectedRowModel().rows.length} 个配置吗？此操作不可恢复。`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
} 