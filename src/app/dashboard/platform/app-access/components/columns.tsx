"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { AppAccess } from "@/types/app"
import { formatDateTime } from "@/lib/utils"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<AppAccess>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate") as any
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "app_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="应用编码" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("app_code")}</div>
    ),
  },
  {
    accessorKey: "app_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="应用名称" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("app_name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="状态" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "0" ? "default" : "destructive"}>
          {status === "0" ? "启用" : "停用"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "api_key",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="API密钥" />
    ),
    cell: ({ row }) => {
      const apiKey = row.getValue("api_key") as string
      // 显示API密钥的截断版本
      return (
        <div className="font-mono text-xs">
          {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 8)}
        </div>
      )
    },
  },
  {
    accessorKey: "last_access_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="最后访问时间" />
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue("last_access_time") as string
      return timestamp ? formatDateTime(timestamp) : "未访问"
    },
  },
  {
    accessorKey: "expire_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="过期时间" />
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue("expire_time") as string
      return timestamp ? formatDateTime(timestamp) : "永不过期"
    },
  },
  {
    accessorKey: "create_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
    ),
    cell: ({ row }) => {
      return formatDateTime(row.getValue("create_time") as string)
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 