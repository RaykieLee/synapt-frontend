"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"
import { VirtualInfo } from "@/types/encrypt"

export function getColumns(): ColumnDef<VirtualInfo>[] {
  return [
    // 选择列
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="全选"
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
    // 姓名
    {
      accessorKey: "first",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="姓名" />
      ),
      cell: ({ row }) => {
        const first = row.getValue("first") as string
        const last = row.original.last
        const fullName = [first, last].filter(Boolean).join(" ")
        return (
          <div className="max-w-[200px] truncate font-medium">
            {fullName || "-"}
          </div>
        )
      },
    },
    // 用户名
    {
      accessorKey: "username",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="用户名" />
      ),
      cell: ({ row }) => {
        const username = row.getValue("username") as string
        return (
          <div className="max-w-[150px] truncate">
            {username || "-"}
          </div>
        )
      },
    },
    // 邮箱
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="邮箱" />
      ),
      cell: ({ row }) => {
        const email = row.getValue("email") as string
        return (
          <div className="max-w-[200px] truncate">
            {email || "-"}
          </div>
        )
      },
    },
    // 电话
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="电话" />
      ),
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string
        return (
          <div className="max-w-[150px] truncate">
            {phone || "-"}
          </div>
        )
      },
    },
    // 性别
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="性别" />
      ),
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string
        if (!gender) return "-"
        
        const genderMap: Record<string, string> = {
          "male": "男",
          "female": "女",
          "other": "其他"
        }
        
        return (
          <Badge variant="outline">
            {genderMap[gender] || gender}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // 地址
    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="地址" />
      ),
      cell: ({ row }) => {
        const city = row.getValue("city") as string
        const state = row.original.state
        const country = row.original.country
        
        const address = [city, state, country].filter(Boolean).join(", ")
        return (
          <div className="max-w-[200px] truncate">
            {address || "-"}
          </div>
        )
      },
    },
    // 国籍
    {
      accessorKey: "nat",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="国籍" />
      ),
      cell: ({ row }) => {
        const nat = row.getValue("nat") as string
        return (
          <div className="max-w-[100px] truncate">
            {nat || "-"}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // 状态
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="状态" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "0" ? "default" : "secondary"}>
            {status === "0" ? "启用" : "停用"}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // 创建时间
    {
      accessorKey: "create_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
      cell: ({ row }) => {
        const createTime = row.getValue("create_time") as string
        return (
          <div className="text-sm text-muted-foreground">
            {createTime ? new Date(createTime).toLocaleString("zh-CN") : "-"}
          </div>
        )
      },
    },
    // 操作列
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} />,
      enableSorting: false,
      enableHiding: false,
    },
  ]
} 