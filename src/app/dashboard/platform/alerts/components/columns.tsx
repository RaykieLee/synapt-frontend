"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertConfig, AlertCategory } from "@/types/alert"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { formatDateTime } from "@/lib/utils"

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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="配置名称" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[300px] truncate font-medium">
          {row.getValue("name")}
        </span>
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="配置编码" />
    ),
    cell: ({ row }) => <div className="w-[120px]">{row.getValue("code")}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "threshold",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="告警阈值" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">{row.getValue("threshold") || "-"}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "frequency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="告警频率" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("frequency") || "-"}分钟</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "categories",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="告警类别" />
    ),
    cell: ({ row }) => {
      const categories = row.getValue("categories") as AlertCategory[]
      return (
        <div className="flex flex-wrap gap-1 w-[180px]">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <Badge key={category.category_id} variant="outline">
                {category.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">暂无分类</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="状态" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      return (
        <div className="flex space-x-1 w-[120px]">
          <Badge variant={status === "0" ? "default" : "destructive"}>
            {status === "0" ? "启用" : "停用"}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: true,
  },
  {
    accessorKey: "create_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
    ),
    cell: ({ row }) => {
      const createTime = row.getValue("create_time") as string
      return (
        <div className="w-[180px] whitespace-nowrap">
          {createTime ? formatDateTime(createTime) : "-"}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 