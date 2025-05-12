"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertLog } from "@/types/alert"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"

export const getColumns = (onEdit?: (log: AlertLog) => void): ColumnDef<AlertLog>[] => [
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
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警标题" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.title}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "level",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警级别" />,
    cell: ({ row }) => {
      const level = row.original.level;
      const levelMap: Record<string, { label: string, variant: "default" | "destructive" | "outline" | "secondary" }> = {
        "info": { label: "信息", variant: "default" },
        "warning": { label: "警告", variant: "secondary" },
        "error": { label: "错误", variant: "destructive" },
        "critical": { label: "严重", variant: "destructive" },
      };
      
      const levelInfo = levelMap[level] || { label: level, variant: "outline" };
      
      return (
        <Badge variant={levelInfo.variant}>
          {levelInfo.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.level)
    },
    enableSorting: true,
  },
  {
    accessorKey: "config",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警配置" />,
    cell: ({ row }) => {
      const config = row.original.config;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[250px] truncate">
            {config ? config.name : "-"}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const configId = row.original.alert_config_id?.toString();
      return configId ? value.includes(configId) : false;
    },
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警类别" />,
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[250px] truncate">
            {category ? category.name : "-"}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const categoryId = row.original.category_id?.toString();
      return categoryId ? value.includes(categoryId) : false;
    },
    enableSorting: false,
  },
  {
    accessorKey: "source",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警来源" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate">
            {row.original.source || "-"}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "device_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="设备名称" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate">
            {row.original.device_name || "-"}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="处理状态" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "outline" }> = {
        "0": { label: "未处理", variant: "outline" },
        "1": { label: "已处理", variant: "default" },
        "2": { label: "已忽略", variant: "secondary" },
      };
      
      const statusInfo = statusMap[status] || { label: "未知", variant: "outline" };
      
      return (
        <Badge variant={statusInfo.variant}>
          {statusInfo.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.status)
    },
    enableSorting: true,
  },
  {
    accessorKey: "create_time",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警时间" />,
    cell: ({ row }) => {
      const createTime = row.original.create_time
      return <div>{createTime ? new Date(createTime).toLocaleString('zh-CN') : "-"}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "process_by",
    header: ({ column }) => <DataTableColumnHeader column={column} title="处理人" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[150px] truncate">
            {row.original.process_by || "-"}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => onEdit && onEdit(row.original)}
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">打开操作菜单</span>
        </Button>
      )
    },
  },
] 