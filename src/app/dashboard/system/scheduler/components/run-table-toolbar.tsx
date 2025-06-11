"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
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
import { PipelineRunSearchParams, PipelineRunStatus } from "@/types/scheduler"

interface RunTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: PipelineRunSearchParams) => void
  columnLabels?: Record<string, string>
}

export function RunTableToolbar<TData>({
  table,
  onSearch,
  columnLabels,
}: RunTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<PipelineRunSearchParams>({})
  
  // 状态选项
  const statusOptions = [
    { label: "等待中", value: PipelineRunStatus.PENDING },
    { label: "运行中", value: PipelineRunStatus.RUNNING },
    { label: "已完成", value: PipelineRunStatus.COMPLETED },
    { label: "失败", value: PipelineRunStatus.FAILED },
    { label: "已取消", value: PipelineRunStatus.CANCELLED },
  ]

  // 批量删除运行记录
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => schedulerApi.runs.batchDelete(ids),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "批量删除成功",
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
      table.resetRowSelection()
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "批量删除失败",
        variant: "destructive",
      })
    },
  })

  // 更新搜索参数
  const updateSearchParams = (key: keyof PipelineRunSearchParams, value: string | undefined) => {
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
  const selectedRunIds = selectedRows.map(row => (row.original as any).id)

  const handleBatchDelete = () => {
    if (selectedRunIds.length > 0) {
      if (confirm(`确认删除选中的 ${selectedRunIds.length} 条运行记录？此操作不可撤销。`)) {
        batchDeleteMutation.mutate(selectedRunIds)
      }
    }
  }

  // 自定义列标签
  const runColumnLabels = {
    id: "运行ID",
    pipeline_id: "管道ID",
    trigger_id: "触发器ID",
    status: "运行状态",
    start_time: "开始时间",
    duration: "运行时长",
    tasks_run: "任务数量",
    error_message: "错误信息",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索管道ID..."
          value={(table.getColumn("pipeline_id")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("pipeline_id")?.setFilterValue(value)
            updateSearchParams("pipeline_id", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="状态"
            options={statusOptions}
            onSelect={(selectedValue) => {
              const status = selectedValue && selectedValue.length > 0 ? selectedValue[0] : undefined
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
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={handleBatchDelete}
            disabled={batchDeleteMutation.isPending}
          >
            删除选中
          </Button>
        )}
        <DataTableViewOptions 
          table={table} 
          columnLabels={runColumnLabels}
        />
      </div>
    </div>
  )
} 