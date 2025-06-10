"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/animate-ui/base/checkbox" 
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash 
} from "lucide-react"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { User } from "@/types/user"

interface ColumnsProps {
  onEdit: (user: User) => void
  onDelete: (userId: number) => void
  onBatchDelete: (userIds: number[]) => void
}

export const columns = ({ onEdit, onDelete, onBatchDelete }: ColumnsProps): ColumnDef<User>[] => [
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
    accessorKey: "user_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="用户名" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("user_name")}</div>
    ),
  },
  {
    accessorKey: "nick_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="昵称" />
    ),
    cell: ({ row }) => (
      <div>{row.getValue("nick_name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="邮箱" />
    ),
    cell: ({ row }) => (
      <div className="hidden md:table-cell">{row.getValue("email") || "-"}</div>
    ),
  },
  {
    accessorKey: "phonenumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="手机号" />
    ),
    cell: ({ row }) => (
      <div className="hidden md:table-cell">{row.getValue("phonenumber") || "-"}</div>
    ),
  },
  {
    accessorKey: "roles",
    header: "角色",
    cell: ({ row }) => {
      const roles = row.original.roles || []
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map(role => (
            <Badge key={role.role_id} variant="outline" className="mr-1 mb-1">
              {role.role_name}
            </Badge>
          ))}
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
        <div className="hidden md:table-cell">
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
      const user = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigator.clipboard.writeText(user.user_id.toString())}
            >
              <Copy className="mr-2 h-4 w-4" />
              复制ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(user.user_id)}
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