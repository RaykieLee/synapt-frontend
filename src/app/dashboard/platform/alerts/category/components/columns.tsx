"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCategory } from "@/types/alert"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "@/app/dashboard/platform/alerts/category/components/data-table-row-actions"

export const getColumns = (onEdit?: (category: AlertCategory) => void): ColumnDef<AlertCategory>[] => [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="类别名称" />,
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
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="类别编码" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[250px] truncate">
            {row.getValue("code")}
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
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const isActive = status === "1"; // 修正逻辑: 1表示启用, 0表示禁用
      
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "启用" : "禁用"}
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="创建时间" />,
    cell: ({ row }) => {
      const createTime = row.original.create_time
      return <div>{createTime ? new Date(createTime).toLocaleString('zh-CN') : "-"}</div>
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} onEdit={onEdit} />,
  },
] 