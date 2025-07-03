"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { DataTableRowActions } from "./data-table-row-actions"
import { ProjectManagement } from "@/types/encrypt/project-management"
import { formatNumber } from "@/lib/utils"

export function getColumns(): ColumnDef<ProjectManagement>[] {
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
    // 项目编号
    {
      accessorKey: "project_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="项目编号" />
      ),
      cell: ({ row }) => {
        const projectCode = row.getValue("project_code") as string
        return (
          <div className="max-w-[120px] truncate font-mono text-sm">
            {projectCode || "-"}
          </div>
        )
      },
    },
    // 项目名称和LOGO
    {
      accessorKey: "project_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="项目名称" />
      ),
      cell: ({ row }) => {
        const projectName = row.getValue("project_name") as string
        const logoUrl = row.original.logo_url
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={logoUrl} alt={projectName} />
              <AvatarFallback className="text-xs">
                {projectName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="max-w-[150px] truncate font-medium">
              {projectName}
            </div>
          </div>
        )
      },
    },
    // 官网
    {
      accessorKey: "official_website",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="官网" />
      ),
      cell: ({ row }) => {
        const website = row.getValue("official_website") as string
        return website ? (
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 max-w-[200px] truncate block"
          >
            {website}
          </a>
        ) : "-"
      },
    },
    // 支持链
    {
      accessorKey: "support_chain",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="支持链" />
      ),
      cell: ({ row }) => {
        const supportChain = row.getValue("support_chain") as string
        return supportChain ? (
          <Badge variant="outline" className="max-w-[100px] truncate">
            {supportChain}
          </Badge>
        ) : "-"
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // 所属板块
    {
      accessorKey: "sector",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="所属板块" />
      ),
      cell: ({ row }) => {
        const sector = row.getValue("sector") as string
        return sector ? (
          <Badge variant="secondary" className="max-w-[100px] truncate">
            {sector}
          </Badge>
        ) : "-"
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // 赛道
    {
      accessorKey: "track",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="赛道" />
      ),
      cell: ({ row }) => {
        const track = row.getValue("track") as string
        return (
          <div className="max-w-[100px] truncate">
            {track || "-"}
          </div>
        )
      },
    },
    // 是否发币
    {
      accessorKey: "has_token",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="是否发币" />
      ),
      cell: ({ row }) => {
        const hasToken = row.getValue("has_token") as string
        return (
          <Badge variant={hasToken === "1" ? "default" : "outline"}>
            {hasToken === "1" ? "是" : "否"}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // 当前状态
    {
      accessorKey: "current_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="当前状态" />
      ),
      cell: ({ row }) => {
        const currentStatus = row.getValue("current_status") as string
        const statusMap: Record<string, { label: string; variant: any }> = {
          "not_started": { label: "未开始", variant: "outline" },
          "in_progress": { label: "进行中", variant: "default" },
          "completed": { label: "已结束", variant: "secondary" }
        }
        
        const status = statusMap[currentStatus] || { label: currentStatus || "-", variant: "outline" }
        return (
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // 推特粉丝
    {
      accessorKey: "twitter_followers",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="推特粉丝" />
      ),
      cell: ({ row }) => {
        const followers = row.getValue("twitter_followers") as number
        return (
          <div className="text-right">
            {followers ? formatNumber(followers) : "-"}
          </div>
        )
      },
    },
    // 融资
    {
      accessorKey: "financing_amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="融资" />
      ),
      cell: ({ row }) => {
        const financing = row.getValue("financing_amount") as string
        return (
          <div className="max-w-[120px] truncate">
            {financing || "-"}
          </div>
        )
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