"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { FaceImage } from "@/types/face"

import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"
import { Image, FileX } from "lucide-react"

export const columns: ColumnDef<FaceImage>[] = [
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[50px]">{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "image_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="图片预览" />
    ),
    cell: ({ row }) => {
      const imageId = row.getValue("image_id") as string
      return (
        <div className="flex items-center space-x-2 w-[120px]">
          {imageId ? (
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10 rounded border overflow-hidden bg-gray-100">
                <Image className="w-4 h-4 text-gray-400 absolute inset-0 m-auto" />
                {/* TODO: 这里可以接入实际的图片预览功能 */}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => {
                  // TODO: 实现图片预览功能
                  console.log("预览图片:", imageId)
                }}
              >
                预览
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-400">
              <FileX className="w-4 h-4" />
              <span className="text-xs">无图片</span>
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "person.person_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="人员姓名" />
    ),
    cell: ({ row }) => {
      const person = row.original.person
      return (
        <div className="flex flex-col space-y-1 w-[120px]">
          <span className="font-medium">{person?.person_name || "-"}</span>
          {person?.person_face_id && (
            <span className="text-xs text-gray-500">{person.person_face_id}</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "library.library_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="所属人脸库" />
    ),
    cell: ({ row }) => {
      const library = row.original.library
      return (
        <div className="w-[120px]">
          <span className="font-medium">{library?.library_name || "-"}</span>
          {library?.library_code && (
            <div className="text-xs text-gray-500">{library.library_code}</div>
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
        <div className="w-[80px]">
          <Badge variant={status === "enabled" ? "default" : "secondary"}>
            {status === "enabled" ? "启用" : "禁用"}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "face_feature",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="特征值" />
    ),
    cell: ({ row }) => {
      const feature = row.getValue("face_feature") as string
      return (
        <div className="w-[100px]">
          {feature ? (
            <Badge variant="outline" className="text-xs">
              已提取
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              未提取
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "create_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("create_time") as string
      return (
        <div className="w-[120px]">
          {date ? new Date(date).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "remark",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="备注" />
    ),
    cell: ({ row }) => {
      const remark = row.getValue("remark") as string
      return (
        <div className="max-w-[150px] truncate" title={remark}>
          {remark || "-"}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
] 