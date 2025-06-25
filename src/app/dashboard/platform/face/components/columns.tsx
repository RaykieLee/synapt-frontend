"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { FaceLibrary } from "@/types/face"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<FaceLibrary>[] = [
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
    accessorKey: "library_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="人脸库名称" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.library_name}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "library_code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="人脸库编码" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[250px] truncate">
            {row.getValue("library_code")}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "total_persons",
    header: ({ column }) => <DataTableColumnHeader column={column} title="人员数量" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="truncate">
            {row.original.total_persons || 0}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "total_faces",
    header: ({ column }) => <DataTableColumnHeader column={column} title="人脸数量" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="truncate">
            {row.original.total_faces || 0}
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