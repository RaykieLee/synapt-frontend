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

import { Role } from "@/types/role"

interface ColumnsProps {
  onEdit: (role: Role) => void
  onDelete: (roleId: number) => void
  onBatchDelete: (roleIds: number[]) => void
}

export const columns = ({
  onEdit,
  onDelete,
  onBatchDelete
}: ColumnsProps): ColumnDef<Role>[] => {

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value)
    // 使用简单的alert代替toast，避免hook问题
    // TODO: 在父组件中处理toast
  }

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: "role_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="角色名称" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("role_name")}</div>
      ),
    },
    {
      accessorKey: "role_key",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="权限标识" />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
          {row.getValue("role_key")}
        </code>
      ),
    },
    {
      accessorKey: "role_sort",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="显示顺序" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("role_sort")}
        </span>
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
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">禁用</Badge>
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
            {new Date(createTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const role = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">打开菜单</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(role)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleCopy(role.role_id.toString(), "角色ID")}
              >
                <Copy className="mr-2 h-4 w-4" />
                复制ID
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleCopy(role.role_key, "权限标识")}
              >
                <Copy className="mr-2 h-4 w-4" />
                复制权限标识
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  if (window.confirm(`确定要删除角色 "${role.role_name}" 吗？\n此操作无法撤销，请谨慎操作。`)) {
                    onDelete(role.role_id)
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