"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { 
  Copy, 
  Edit, 
  MoreHorizontal, 
  Trash,
  Eye
} from "lucide-react"
import { DataTableColumnHeader } from "@/components/shared/data-table"

import { DictType } from "@/types/dict"

interface ColumnsProps {
  onEdit: (dictType: DictType) => void
  onDelete: (dictId: number) => void
  onView: (dictType: string) => void
}

export const columns = ({
  onEdit,
  onDelete,
  onView
}: ColumnsProps): ColumnDef<DictType>[] => {

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value)
    // 使用简单的剪贴板操作，避免hook问题
  }

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
          aria-label="选择全部"
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
    {
      accessorKey: "dict_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="字典名称" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("dict_name")}</div>
      ),
    },
    {
      accessorKey: "dict_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="字典类型" />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
          {row.getValue("dict_type")}
        </code>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="状态" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return status === "0" ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">停用</Badge>
        )
      },
    },
    {
      accessorKey: "create_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
      cell: ({ row }) => {
        const createTime = row.getValue("create_time") as string
        return (
          <div className="text-muted-foreground">
            {createTime ? new Date(createTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }) : '-'}
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
          <div className="max-w-xs truncate text-muted-foreground">
            {remark || '-'}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <div className="text-center">操作</div>
      ),
      cell: ({ row }) => {
        const dictType = row.original

        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">打开菜单</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(dictType.dict_type)}>
                  <Eye className="mr-2 h-4 w-4" />
                  编辑字典数据
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(dictType)}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleCopy(dictType.dict_id.toString(), "字典ID")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  复制ID
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleCopy(dictType.dict_type, "字典类型")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  复制类型
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {
                    if (window.confirm(`确定要删除字典类型 "${dictType.dict_name}" 吗？\n此操作无法撤销，请谨慎操作。`)) {
                      onDelete(dictType.dict_id)
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
} 