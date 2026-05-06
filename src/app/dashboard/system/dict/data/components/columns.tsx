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
  Trash
} from "lucide-react"
import { DataTableColumnHeader } from "@/components/shared/data-table"

import { DictData } from "@/types/dict"

interface ColumnsProps {
  onEdit: (dictData: DictData) => void
  onDelete: (dictCode: number) => void
}

export const columns = ({
  onEdit,
  onDelete
}: ColumnsProps): ColumnDef<DictData>[] => {

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
      accessorKey: "dict_sort",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="排序" />
      ),
      cell: ({ row }) => (
        <div className="text-center w-16">{row.getValue("dict_sort")}</div>
      ),
    },
    {
      accessorKey: "dict_label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="字典标签" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("dict_label")}</div>
      ),
    },
    {
      accessorKey: "dict_value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="字典键值" />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
          {row.getValue("dict_value")}
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
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">正常</Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">停用</Badge>
        )
      },
    },
    {
      accessorKey: "is_default",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="是否默认" />
      ),
      cell: ({ row }) => {
        const isDefault = row.getValue("is_default") as string
        return isDefault === "Y" ? (
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">是</Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">否</Badge>
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
      header: "操作",
      cell: ({ row }) => {
        const dictData = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">打开菜单</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(dictData)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleCopy(dictData.dict_code.toString(), "字典编码")}
              >
                <Copy className="mr-2 h-4 w-4" />
                复制编码
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleCopy(dictData.dict_value, "字典键值")}
              >
                <Copy className="mr-2 h-4 w-4" />
                复制键值
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  if (window.confirm(`确定要删除字典数据 "${dictData.dict_label}" 吗？\n此操作无法撤销，请谨慎操作。`)) {
                    onDelete(dictData.dict_code)
                  }
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
} 