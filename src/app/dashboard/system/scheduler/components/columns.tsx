"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { Pipeline } from "@/types/scheduler"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<Pipeline>[] = [
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
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="管道名称" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.name}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="管道ID" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[250px] truncate font-mono text-sm">
            {row.getValue("id")}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="描述" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate">
            {row.original.description || "-"}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "enabled",
    header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
    cell: ({ row }) => {
      const enabled = row.original.enabled;
      
      return (
        <Badge variant={enabled ? "default" : "secondary"}>
          {enabled ? "启用" : "禁用"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.enabled ? "1" : "0")
    },
    enableSorting: true,
  },
  {
    accessorKey: "triggers",
    header: ({ column }) => <DataTableColumnHeader column={column} title="触发器" />,
    cell: ({ row }) => {
      const triggers = row.original.triggers || [];
      
      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {triggers.length}个
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "tasks",
    header: ({ column }) => <DataTableColumnHeader column={column} title="任务" />,
    cell: ({ row }) => {
      const tasks = row.original.tasks || [];
      
      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {tasks.length}个
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "create_time",
    header: ({ column }) => <DataTableColumnHeader column={column} title="创建时间" />,
    cell: ({ row }) => {
      const createTime = row.original.create_time
      return <div>{createTime ? new Date(createTime).toLocaleString('zh-CN') : "-"}</div>
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 