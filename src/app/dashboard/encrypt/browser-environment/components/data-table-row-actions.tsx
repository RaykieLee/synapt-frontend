"use client"

import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/animate-ui/radix/dialog"

import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  RefreshCw,
  Copy,
  Activity
} from "lucide-react"
import { toast } from "sonner"

import { browserEnvironmentAPI } from "@/api/encrypt/browser-environment"
import type { BrowserEnvironment } from "@/types/encrypt/browser-environment"

interface DataTableRowActionsProps {
  row: Row<BrowserEnvironment>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const environment = row.original

  const [deleteOpen, setDeleteOpen] = useState(false)

  // 更新最后使用时间
  const updateLastUsedMutation = useMutation({
    mutationFn: () => browserEnvironmentAPI.updateLastUsed(environment.id),
    onSuccess: () => {
      toast.success("已更新最后使用时间")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
    },
    onError: (error: any) => {
      toast.error(`更新失败: ${error.message || '未知错误'}`)
    },
  })

  // 删除环境
  const deleteMutation = useMutation({
    mutationFn: () => browserEnvironmentAPI.delete(environment.id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
      setDeleteOpen(false)
    },
    onError: (error: any) => {
      toast.error(`删除失败: ${error.message || '未知错误'}`)
    },
  })

  // 编辑
  const handleEdit = () => {
    router.push(`/dashboard/encrypt/browser-environment/edit?id=${environment.id}`)
  }

  // 复制实例ID
  const handleCopyId = () => {
    if (environment.browser_id) {
      navigator.clipboard.writeText(environment.browser_id)
      toast.success("实例ID已复制到剪贴板")
    } else {
      toast.warning("该环境暂无实例ID")
    }
  }

  // 复制环境名称
  const handleCopyName = () => {
    navigator.clipboard.writeText(environment.name)
    toast.success("环境名称已复制到剪贴板")
  }

  // 确认删除
  const handleDeleteConfirm = () => {
    deleteMutation.mutate()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => updateLastUsedMutation.mutate()}>
            <Activity className="mr-2 h-4 w-4" />
            标记使用
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCopyName}>
            <Copy className="mr-2 h-4 w-4" />
            复制名称
          </DropdownMenuItem>
          
          {environment.browser_id && (
            <DropdownMenuItem onClick={handleCopyId}>
              <Copy className="mr-2 h-4 w-4" />
              复制实例ID
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-red-600 focus:text-red-600"
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
              确定要删除浏览器环境 "{environment.name}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 