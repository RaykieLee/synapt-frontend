"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { RefreshCw, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useState, useCallback, useRef, useEffect } from "react"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { schedulerApi } from "@/api/scheduler"
import { toast } from "sonner"
import { PipelineRunSearchParams, PipelineRun } from "@/types/scheduler"

interface RunDataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: PipelineRunSearchParams) => void
  columnLabels?: Record<string, string>
  defaultPipelineId?: string
}

export function RunDataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
  defaultPipelineId,
}: RunDataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<PipelineRunSearchParams>({
    pipeline_id: defaultPipelineId,
  })

  // 初始化时设置默认的管道ID过滤条件
  useEffect(() => {
    if (defaultPipelineId && onSearch) {
      searchParamsRef.current = { pipeline_id: defaultPipelineId }
      onSearch(searchParamsRef.current)
    }
  }, [defaultPipelineId, onSearch])
  
  // 状态选项
  const statusOptions = [
    { label: "等待中", value: "pending" },
    { label: "运行中", value: "running" },
    { label: "已完成", value: "completed" },
    { label: "失败", value: "failed" },
    { label: "已取消", value: "cancelled" },
    { label: "超时", value: "timeout" },
  ]

  // 批量删除
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => schedulerApi.runs.batchDelete(ids),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 更新搜索参数
  const updateSearchParams = (key: keyof PipelineRunSearchParams, value: string | undefined) => {
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

  // 获取选中的行ID
  const selectedRowIds = table.getSelectedRowModel().flatRows.map(row => {
    const runRow = row.original as PipelineRun
    return runRow.id
  })

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowIds.length > 0) {
      setDeleteOpen(true)
    }
  }

  // 确认删除
  const confirmDelete = () => {
    if (selectedRowIds.length > 0) {
      deleteMutation.mutate(selectedRowIds)
    }
  }

  // 自定义运行记录列标签
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
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {!defaultPipelineId && (
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
          )}
          <Input
            placeholder="搜索触发器ID..."
            value={(table.getColumn("trigger_id")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              const value = event.target.value
              table.getColumn("trigger_id")?.setFilterValue(value)
              updateSearchParams("trigger_id", value)
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
                searchParamsRef.current = defaultPipelineId ? { pipeline_id: defaultPipelineId } : {}
                if (onSearch) {
                  onSearch(searchParamsRef.current)
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
              onClick={handleBatchDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除选中 ({table.getSelectedRowModel().rows.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <DataTableViewOptions 
            table={table} 
            columnLabels={runColumnLabels}
          />
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        title={`确认删除 ${selectedRowIds.length} 条运行记录？`}
        description="删除运行记录将不可恢复，请确认操作。"
      />
    </>
  )
} 