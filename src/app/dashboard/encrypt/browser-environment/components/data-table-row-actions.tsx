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
  Activity,
  Play,
  Square,
  Power,
  ArrowLeftRight,
  Bot
} from "lucide-react"
import { toast } from "sonner"

import { browserEnvironmentAPI } from "@/api/encrypt/browser-environment"
import type { BrowserEnvironment } from "@/types/encrypt/browser-environment"
import { ExecuteTaskDialog } from "./execute-task-dialog"

interface DataTableRowActionsProps {
  row: Row<BrowserEnvironment>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const environment = row.original

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [executeTaskOpen, setExecuteTaskOpen] = useState(false)

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

  // 启动浏览器
  const startMutation = useMutation({
    mutationFn: () => browserEnvironmentAPI.start(environment.id),
    onSuccess: () => {
      toast.success("浏览器启动成功")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
    },
    onError: (error: any) => {
      toast.error(`启动失败: ${error.message || '未知错误'}`)
    },
  })

  // 停止浏览器
  const stopMutation = useMutation({
    mutationFn: () => browserEnvironmentAPI.stop(environment.id),
    onSuccess: () => {
      toast.success("浏览器停止成功")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
    },
    onError: (error: any) => {
      toast.error(`停止失败: ${error.message || '未知错误'}`)
    },
  })

  // 删除环境（仅数据库）
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

  // 删除环境（含API调用）
  const deleteWithApiMutation = useMutation({
    mutationFn: () => browserEnvironmentAPI.deleteWithApi(environment.id),
    onSuccess: () => {
      toast.success("删除成功（已同步删除远程环境）")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
      setDeleteOpen(false)
    },
    onError: (error: any) => {
      toast.error(`删除失败: ${error.message || '未知错误'}`)
    },
  })

  // 同步到浏览器
  const syncToBrowserMutation = useMutation({
    mutationFn: () => browserEnvironmentAPI.syncToBrowser(environment.id),
    onSuccess: (data) => {
      toast.success("同步成功，已在浏览器中创建环境")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
    },
    onError: (error: any) => {
      toast.error(`同步失败: ${error.message || '未知错误'}`)
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

  // 启动浏览器
  const handleStart = () => {
    if (!environment.browser_id) {
      toast.warning("该环境暂无浏览器实例ID，无法启动")
      return
    }
    startMutation.mutate()
  }

  // 停止浏览器
  const handleStop = () => {
    if (!environment.browser_id) {
      toast.warning("该环境暂无浏览器实例ID，无法停止")
      return
    }
    stopMutation.mutate()
  }

  // 确认删除（仅数据库）
  const handleDeleteConfirm = () => {
    deleteMutation.mutate()
  }

  // 确认删除（含API调用）
  const handleDeleteWithApiConfirm = () => {
    deleteWithApiMutation.mutate()
  }

  // 同步到浏览器
  const handleSyncToBrowser = () => {
    syncToBrowserMutation.mutate()
  }

  // 判断是否可以执行浏览器操作
  const canOperateBrowser = environment.browser_id && 
    (environment.browser_type === "MoreLogin" || environment.browser_type === "HubStudio")

  // 判断浏览器是否正在运行
  const isRunning = environment.status === "active" || environment.status === "running"

  // 判断是否是未同步状态
  const isUnsync = environment.status === "unsync"

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
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>

          {/* 同步到浏览器操作 - 仅对未同步状态显示 */}
          {isUnsync && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSyncToBrowser}
                disabled={syncToBrowserMutation.isPending}
                className="text-blue-600 focus:text-blue-600"
              >
                {syncToBrowserMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                )}
                同步到浏览器
              </DropdownMenuItem>
            </>
          )}

          {/* 浏览器操作区域 */}
          {canOperateBrowser && (
            <>
              <DropdownMenuSeparator />
              {!isRunning ? (
                <DropdownMenuItem 
                  onClick={handleStart}
                  disabled={startMutation.isPending}
                  className="text-green-600 focus:text-green-600"
                >
                  {startMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  启动浏览器
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem 
                    onClick={() => setExecuteTaskOpen(true)}
                    className="text-blue-600 focus:text-blue-600"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    执行任务
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleStop}
                    disabled={stopMutation.isPending}
                    className="text-orange-600 focus:text-orange-600"
                  >
                    {stopMutation.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Square className="mr-2 h-4 w-4" />
                    )}
                    停止浏览器
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
          
          <DropdownMenuSeparator />
          
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
            <DialogDescription className="space-y-2">
              <div>确定要删除浏览器环境 "{environment.name}" 吗？此操作不可撤销。</div>
              {environment.browser_id && (
                <div className="text-amber-600 text-sm">
                  检测到该环境有远程浏览器实例，建议同时删除远程环境。
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              仅删除本地记录
            </Button>
            
            {environment.browser_id && (
              <Button 
                variant="destructive"
                onClick={handleDeleteWithApiConfirm}
                disabled={deleteWithApiMutation.isPending}
                className="bg-red-700 hover:bg-red-800"
              >
                {deleteWithApiMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                <Power className="mr-2 h-4 w-4" />
                删除本地和远程
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 执行任务对话框 */}
      <ExecuteTaskDialog 
        open={executeTaskOpen}
        onOpenChange={setExecuteTaskOpen}
        environment={environment}
      />
    </>
  )
} 