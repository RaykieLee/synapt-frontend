"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Square, Trash2, StopCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { PipelineRun, PipelineRunStatus } from "@/types/scheduler"
import { schedulerApi } from "@/api/scheduler"

// 状态徽章组件
function getStatusBadge(status: PipelineRunStatus) {
  const statusMap = {
    pending: { variant: "secondary" as const, text: "等待中", className: "bg-yellow-100 text-yellow-800" },
    running: { variant: "default" as const, text: "运行中", className: "bg-blue-100 text-blue-800" }, 
    completed: { variant: "default" as const, text: "已完成", className: "bg-green-100 text-green-800" },
    failed: { variant: "destructive" as const, text: "失败", className: "bg-red-100 text-red-800" },
    cancelled: { variant: "outline" as const, text: "已取消", className: "bg-gray-100 text-gray-800" },
    timeout: { variant: "destructive" as const, text: "超时", className: "bg-red-100 text-red-800" }
  }
  
  const config = statusMap[status] || { variant: "secondary" as const, text: status, className: "" }
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.text}
    </Badge>
  )
}

// 格式化持续时间
function formatDuration(duration: number) {
  if (!duration) return "-"
  
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = Math.floor(duration % 60)
  
  if (hours > 0) return `${hours}小时${minutes}分钟${seconds}秒`
  if (minutes > 0) return `${minutes}分钟${seconds}秒`
  return `${seconds}秒`
}

// 行操作组件
function RunRowActions({ row }: { row: any }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const run = row.original as PipelineRun

  // 删除运行记录
  const deleteMutation = useMutation({
    mutationFn: () => schedulerApi.runs.delete(run.id),
    onSuccess: () => {
      toast.success("运行记录已删除")
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
    },
    onError: (error: any) => {
      toast.error(error.message || "删除失败")
    },
  })

  // 停止运行
  const stopMutation = useMutation({
    mutationFn: () => schedulerApi.runs.stop(run.id),
    onSuccess: () => {
      toast.success("运行已停止")
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
    },
    onError: (error: any) => {
      toast.error(error.message || "停止失败")
    },
  })

  const handleView = () => {
    router.push(`/dashboard/system/scheduler/runs/${run.id}`)
  }

  const handleStop = () => {
    if (confirm(`确认停止运行 #${run.id}？`)) {
      stopMutation.mutate()
    }
  }

  const handleDelete = () => {
    if (confirm(`确认删除运行记录 #${run.id}？此操作不可撤销。`)) {
      deleteMutation.mutate()
    }
  }

  const canStop = run.status === PipelineRunStatus.RUNNING || run.status === PipelineRunStatus.PENDING

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          查看详情
        </DropdownMenuItem>
        {canStop && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleStop}>
              <StopCircle className="mr-2 h-4 w-4" />
              停止运行
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<PipelineRun>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="全选"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="选择行"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="运行ID" />,
    cell: ({ row }) => {
      const id = row.original.id
      return <div className="font-medium">#{id}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "pipeline_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="管道ID" />,
    cell: ({ row }) => {
      const pipelineId = row.original.pipeline_id
      return <div className="max-w-[150px] truncate font-mono text-sm">{pipelineId}</div>
    },
    filterFn: (row, id, value) => {
      return row.original.pipeline_id.toLowerCase().includes(value.toLowerCase())
    },
    enableSorting: true,
  },
  {
    accessorKey: "trigger_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="触发器ID" />,
    cell: ({ row }) => {
      const triggerId = row.original.trigger_id
      return <div className="max-w-[150px] truncate font-mono text-sm">{triggerId}</div>
    },
    filterFn: (row, id, value) => {
      return row.original.trigger_id.toLowerCase().includes(value.toLowerCase())
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="运行状态" />,
    cell: ({ row }) => {
      return getStatusBadge(row.original.status)
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.status)
    },
    enableSorting: true,
  },
  {
    accessorKey: "start_time",
    header: ({ column }) => <DataTableColumnHeader column={column} title="开始时间" />,
    cell: ({ row }) => {
      const startTime = row.original.start_time
      return <div className="text-sm">{startTime ? new Date(startTime).toLocaleString('zh-CN') : "-"}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="运行时长" />,
    cell: ({ row }) => {
      const duration = row.original.duration
      return <div className="text-sm">{duration ? formatDuration(duration) : "-"}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "tasks_run",
    header: ({ column }) => <DataTableColumnHeader column={column} title="任务数量" />,
    cell: ({ row }) => {
      const tasksRun = row.original.tasks_run || []
      
      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {tasksRun.length}个
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "error_message",
    header: ({ column }) => <DataTableColumnHeader column={column} title="错误信息" />,
    cell: ({ row }) => {
      const errorMessage = row.original.error_message
      
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate text-sm text-red-600">
            {errorMessage || "-"}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <RunRowActions row={row} />,
  },
] 