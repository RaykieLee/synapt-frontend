"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertConfig } from "@/types/alert"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<AlertConfig>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="配置名称" />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="配置编码" />,
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
    accessorKey: "threshold",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警阈值" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="truncate">
            {row.original.threshold || "-"}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "frequency",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警频率" />,
    cell: ({ row }) => {
      const frequency = row.original.frequency;
      return (
        <div className="flex space-x-2">
          <span className="truncate">
            {frequency ? `${frequency}次/分钟` : "-"}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "categories",
    header: ({ column }) => <DataTableColumnHeader column={column} title="告警类别" />,
    cell: ({ row }) => {
      const categories = row.original.categories
      
      if (!categories || !categories.length) {
        return (
          <div className="flex space-x-2">
            <span className="truncate">-</span>
          </div>
        )
      }
      
      return (
        <div className="flex flex-wrap gap-1 max-w-[250px]">
          {categories.slice(0, 3).map((category) => (
            <Badge key={category.category_id} variant="outline" className="truncate">
              {category.name}
            </Badge>
          ))}
          {categories.length > 3 && (
            <Badge variant="outline">+{categories.length - 3}</Badge>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const categories = row.original.categories;
      if (!categories || !categories.length) return false;
      
      const categoryIds = categories.map(c => c.category_id.toString());
      return value.some((val: string) => categoryIds.includes(val));
    },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const isActive = status === "0";
      
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "启用" : "停用"}
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 