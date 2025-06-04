"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { PlusCircle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useCallback, useRef } from "react"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
} from "@/components/shared/data-table"
import { useToast } from "@/components/ui/use-toast"
import { schedulerApi } from "@/api/scheduler"
import { PipelineSearchParams } from "@/types/scheduler"
import { CreatePipelineDialog } from "./create-pipeline-dialog"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: PipelineSearchParams) => void
  columnLabels?: Record<string, string>
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<PipelineSearchParams>({})
  
  // 状态选项
  const statusOptions = [
    { label: "启用", value: "1" },
    { label: "禁用", value: "0" },
  ]

  // 批量启用
  const enableMutation = useMutation({
    mutationFn: (ids: string[]) => schedulerApi.pipelines.batchEnable(ids),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "批量启用成功",
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "pipelines"] })
      table.resetRowSelection()
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "批量启用失败",
        variant: "destructive",
      })
    },
  })

  // 批量禁用
  const disableMutation = useMutation({
    mutationFn: (ids: string[]) => schedulerApi.pipelines.batchDisable(ids),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "批量禁用成功",
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "pipelines"] })
      table.resetRowSelection()
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "批量禁用失败",
        variant: "destructive",
      })
    },
  })

  // 更新搜索参数
  const updateSearchParams = (key: keyof PipelineSearchParams, value: string | number | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch()
  }

  // 创建防抖搜索函数
  const debouncedSearchFn = useCallback(() => {
    if (onSearch) {
      onSearch(searchParamsRef.current)
    }
  }, [onSearch])

  // 使用防抖处理搜索
  const debouncedSearch = debounce(debouncedSearchFn, 500)

  // 获取选中的行
  const selectedRows = table.getSelectedRowModel().rows
  const selectedPipelineIds = selectedRows.map(row => (row.original as any).id)

  const handleBatchEnable = () => {
    if (selectedPipelineIds.length > 0) {
      enableMutation.mutate(selectedPipelineIds)
    }
  }

  const handleBatchDisable = () => {
    if (selectedPipelineIds.length > 0) {
      disableMutation.mutate(selectedPipelineIds)
    }
  }

  // 自定义列标签
  const pipelineColumnLabels = {
    name: "管道名称",
    id: "管道ID", 
    description: "描述",
    enabled: "状态",
    triggers: "触发器",
    tasks: "任务",
    create_time: "创建时间",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索管道名称..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("name")?.setFilterValue(value)
            updateSearchParams("name", value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="搜索描述..."
          value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("description")?.setFilterValue(value)
            updateSearchParams("description", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        {table.getColumn("enabled") && (
          <DataTableFacetedFilter
            column={table.getColumn("enabled")}
            title="状态"
            options={statusOptions}
            onSelect={(selectedValue) => {
              const status = selectedValue && selectedValue.length > 0 ? parseInt(selectedValue[0]) : undefined
              updateSearchParams("status", status)
              if (onSearch) {
                const updatedParams = {
                  ...searchParamsRef.current,
                  status: status
                }
                onSearch(updatedParams)
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
        {selectedRows.length > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleBatchEnable}
              disabled={enableMutation.isPending}
            >
              批量启用
            </Button>
            <Button
              variant="outline" 
              size="sm"
              className="h-8"
              onClick={handleBatchDisable}
              disabled={disableMutation.isPending}
            >
              批量禁用
            </Button>
          </>
        )}
        <DataTableViewOptions 
          table={table} 
          columnLabels={pipelineColumnLabels}
        />
        <Button
          size="sm"
          className="h-8"
          onClick={() => setCreateDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          新建管道
        </Button>
      </div>

      {/* 新建管道弹窗 */}
      <CreatePipelineDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
} 