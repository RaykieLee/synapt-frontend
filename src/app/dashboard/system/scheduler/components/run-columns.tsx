"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PipelineRun, PipelineRunStatus } from "@/types/scheduler"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { RunRowActions } from "./run-row-actions"

// 获取状态徽章
const getStatusBadge = (status: PipelineRunStatus) => {
  const statusConfig: Record<PipelineRunStatus, {
    variant: "default" | "destructive" | "outline" | "secondary";
    text: string;
    className?: string;
  }> = {
    [PipelineRunStatus.PENDING]: { 
      variant: "secondary", 
      text: "等待中" 
    },
    [PipelineRunStatus.RUNNING]: { 
      variant: "default", 
      text: "运行中" 
    },
    [PipelineRunStatus.COMPLETED]: { 
      variant: "default", 
      text: "已完成",
      className: "bg-green-100 text-green-800 hover:bg-green-100"
    },
    [PipelineRunStatus.FAILED]: { 
      variant: "destructive", 
      text: "失败" 
    },
    [PipelineRunStatus.CANCELLED]: { 
      variant: "secondary", 
      text: "已取消" 
    },
  }

  const config = statusConfig[status] || statusConfig[PipelineRunStatus.PENDING]

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.text}
    </Badge>
  )
}

// 格式化持续时间
const formatDuration = (duration: number) => {
  if (duration < 1000) {
    return `${Math.round(duration)}ms`
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`
  } else {
    return `${(duration / 60000).toFixed(1)}m`
  }
}

export const runColumns: ColumnDef<PipelineRun>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <label className="translate-y-[2px]">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
          }}
          aria-label="全选"
        />
      </label>
    ),
    cell: ({ row }) => (
      <label className="translate-y-[2px]">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
          }}
          aria-label="选择行"
        />
      </label>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="运行ID" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="font-medium">
            #{row.original.id}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "pipeline_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="管道ID" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-mono text-sm">
            {row.getValue("pipeline_id")}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "trigger_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="触发器ID" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[150px] truncate text-sm">
            {row.getValue("trigger_id") || "-"}
          </span>
        </div>
      )
    },
    enableSorting: false,
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
      return <div>{startTime ? new Date(startTime).toLocaleString('zh-CN') : "-"}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="运行时长" />,
    cell: ({ row }) => {
      const duration = row.original.duration
      return <div>{duration ? formatDuration(duration) : "-"}</div>
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