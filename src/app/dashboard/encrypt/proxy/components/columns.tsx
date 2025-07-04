"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Edit, Trash, Activity } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ProxyEntity } from "@/types/encrypt/proxy"
import { proxyAPI } from "@/api/encrypt/proxy"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/animate-ui/radix/dialog"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

// 行操作组件
function RowActions({ proxy }: { proxy: ProxyEntity }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [checkOpen, setCheckOpen] = useState(false)

  // 删除单个代理
  const deleteMutation = useMutation({
    mutationFn: () => proxyAPI.delete(proxy.id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "proxy", "list"] })
      setDeleteOpen(false)
    },
    onError: (error: any) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  // 检测代理
  const checkMutation = useMutation({
    mutationFn: () => proxyAPI.checkSingleProxy(proxy.id, 10),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`检测成功，响应时间: ${result.response_time}ms`)
      } else {
        toast.warning(`检测失败: ${result.error_message}`)
      }
      queryClient.invalidateQueries({ queryKey: ["encrypt", "proxy", "list"] })
    },
    onError: (error: any) => {
      toast.error(`检测异常: ${error.message}`)
    },
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/encrypt/proxy/edit?id=${proxy.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => checkMutation.mutate()}
            disabled={checkMutation.isPending}
          >
            <Activity className="mr-2 h-4 w-4" />
            检测连通性
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除代理 "{proxy.host}:{proxy.port}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function getColumns(): ColumnDef<ProxyEntity>[] {
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
    // 代理类型
    {
      accessorKey: "proxy_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          代理类型
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("proxy_type")}
        </Badge>
      ),
    },
    // 主机地址
    {
      accessorKey: "host",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          主机地址
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-mono">
          {row.getValue("host")}
        </div>
      ),
    },
    // 端口
    {
      accessorKey: "port",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          端口
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono">
          {row.getValue("port")}
        </div>
      ),
    },
    // 用户名
    {
      accessorKey: "username",
      header: "用户名",
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate">
          {row.getValue("username") || "-"}
        </div>
      ),
    },
    // 分组
    {
      accessorKey: "group",
      header: "分组",
      cell: ({ row }) => {
        const group = row.getValue("group") as string
        return group ? (
          <Badge variant="secondary">{group}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    // 状态
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const getStatusVariant = (status: string) => {
          switch (status) {
            case "normal": return "default"
            case "error": return "destructive"
            case "unknown": return "secondary"
            default: return "outline"
          }
        }
        return status ? (
          <Badge variant={getStatusVariant(status)}>
            {status === "normal" ? "正常" : 
             status === "error" ? "异常" : 
             status === "unknown" ? "未知" : status}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    // 是否激活
    {
      accessorKey: "is_active",
      header: "是否激活",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "激活" : "禁用"}
          </Badge>
        )
      },
    },
    // 最后检测时间
    {
      accessorKey: "last_check",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          最后检测
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const lastCheck = row.getValue("last_check") as string
        return lastCheck ? (
          <div className="text-sm">
            {new Date(lastCheck).toLocaleString('zh-CN')}
          </div>
        ) : (
          <span className="text-muted-foreground">未检测</span>
        )
      },
    },
    // 创建时间
    {
      accessorKey: "create_time",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          创建时间
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const createTime = row.getValue("create_time") as string
        return createTime ? (
          <div className="text-sm">
            {new Date(createTime).toLocaleString('zh-CN')}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    // 操作列
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => <RowActions proxy={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ]
} 