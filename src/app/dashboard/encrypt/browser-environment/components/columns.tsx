"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"

import type { BrowserEnvironment } from "@/types/encrypt/browser-environment"
import { STATUS_COLORS } from "@/types/encrypt/browser-environment"

export function getColumns(): ColumnDef<BrowserEnvironment>[] {
  return [
    // 选择列
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
    
    // 环境名称
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="环境名称" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string
        return (
          <div className="max-w-[200px] truncate font-medium">
            {name}
          </div>
        )
      },
    },

    // 浏览器类型
    {
      accessorKey: "browser_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="浏览器类型" />
      ),
      cell: ({ row }) => {
        const browserType = row.getValue("browser_type") as string
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            {browserType}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },

    // 浏览器实例ID
    {
      accessorKey: "browser_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="实例ID" />
      ),
      cell: ({ row }) => {
        const browserId = row.getValue("browser_id") as string
        return (
          <div className="max-w-[150px] truncate text-muted-foreground">
            {browserId || "-"}
          </div>
        )
      },
    },

    // 运行状态
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="运行状态" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        if (!status) return <span className="text-muted-foreground">-</span>
        
        const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'gray'
        const statusLabels: { [key: string]: string } = {
          active: '活跃',
          idle: '空闲',
          stopped: '停止',
          error: '错误',
          unsync: '未同步'
        }
        
        return (
          <Badge 
            variant="outline" 
            className={`whitespace-nowrap border-${color}-200 text-${color}-700 bg-${color}-50`}
          >
            {statusLabels[status] || status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },

    // 最后使用时间
    {
      accessorKey: "last_used",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="最后使用" />
      ),
      cell: ({ row }) => {
        const lastUsed = row.getValue("last_used") as string
        if (!lastUsed) return <span className="text-muted-foreground">-</span>
        
        try {
          const date = new Date(lastUsed)
          return (
            <div className="text-sm">
              {date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )
        } catch {
          return <span className="text-muted-foreground">-</span>
        }
      },
    },

    // 创建时间
    {
      accessorKey: "create_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
      cell: ({ row }) => {
        const createTime = row.getValue("create_time") as string
        if (!createTime) return <span className="text-muted-foreground">-</span>
        
        try {
          const date = new Date(createTime)
          return (
            <div className="text-sm">
              {date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )
        } catch {
          return <span className="text-muted-foreground">-</span>
        }
      },
    },

    // 备注
    {
      accessorKey: "remark",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="备注" />
      ),
      cell: ({ row }) => {
        const remark = row.getValue("remark") as string
        return (
          <div className="max-w-[200px] truncate text-muted-foreground">
            {remark || "-"}
          </div>
        )
      },
    },

    // 操作列
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => <DataTableRowActions row={row} />,
      enableSorting: false,
      enableHiding: false,
    },
  ]
} 