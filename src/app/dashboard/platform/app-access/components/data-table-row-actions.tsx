"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmationDialog } from "@/components/shared/data-table"
import { AppAccess } from "@/types/app"
import { appAccessAPI } from "@/api"
import { AppDialog } from "./app-dialog"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  
  const app = row.original as AppAccess
  
  // 删除应用接入
  const deleteMutation = useMutation({
    mutationFn: (id: number) => appAccessAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["app-access", "list"] })
      
      // 使用更安全的方式关闭弹窗
      safeCloseDialog(() => setDeleteOpen(false))
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 重置API密钥
  const resetApiKeyMutation = useMutation({
    mutationFn: (id: number) => appAccessAPI.resetApiKey({ id }),
    onSuccess: () => {
      toast.success("API密钥重置成功")
      queryClient.invalidateQueries({ queryKey: ["app-access", "list"] })
      queryClient.invalidateQueries({ queryKey: ["app-access", "detail", app.id] })
      
      // 使用更安全的方式关闭弹窗
      safeCloseDialog(() => setResetOpen(false))
    },
    onError: (error) => {
      toast.error(`重置失败: ${error}`)
    },
  })

  // 安全关闭弹窗的函数
  const safeCloseDialog = useCallback((closeFunc: () => void) => {
    // 首先使用RAF确保在下一帧执行
    requestAnimationFrame(() => {
      // 然后使用setTimeout确保React有时间更新DOM
      setTimeout(() => {
        closeFunc()
      }, 150)
    })
  }, [])

  // 处理对话框成功回调
  const handleDialogSuccess = () => {
    // 安全关闭对话框
    safeCloseDialog(() => {
      setViewOpen(false)
      setEditOpen(false)
    })
  }

  // 处理通用的弹窗打开
  const handleOpenDialog = useCallback((setter: (open: boolean) => void) => {
    // 确保其他所有弹窗都关闭
    setDeleteOpen(false)
    setResetOpen(false)
    setViewOpen(false)
    setEditOpen(false)
    
    // 延迟打开新弹窗，确保其他弹窗已完全关闭
    setTimeout(() => {
      setter(true)
    }, 100)
  }, [])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => handleOpenDialog(setViewOpen)}>
            查看详情
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenDialog(setEditOpen)}>
            编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleOpenDialog(setResetOpen)}
          >
            重置API密钥
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => handleOpenDialog(setDeleteOpen)}
          >
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 查看应用详情对话框 */}
      <AppDialog
        app={app}
        mode="view"
        open={viewOpen}
        onOpenChange={(open) => {
          if (!open) safeCloseDialog(() => setViewOpen(false))
          else setViewOpen(open)
        }}
        onSuccess={handleDialogSuccess}
      />

      {/* 编辑应用对话框 */}
      <AppDialog
        app={app}
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) safeCloseDialog(() => setEditOpen(false))
          else setEditOpen(open)
        }}
        onSuccess={handleDialogSuccess}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) safeCloseDialog(() => setDeleteOpen(false))
          else setDeleteOpen(open)
        }}
        onConfirm={() => deleteMutation.mutate(app.id)}
        title="确认删除"
        description="确定要删除此应用接入吗？此操作不可恢复。"
        isDeleting={deleteMutation.isPending}
      />

      {/* 重置API密钥确认对话框 */}
      <DeleteConfirmationDialog
        open={resetOpen}
        onOpenChange={(open) => {
          if (!open) safeCloseDialog(() => setResetOpen(false))
          else setResetOpen(open)
        }}
        onConfirm={() => resetApiKeyMutation.mutate(app.id)}
        title="确认重置API密钥"
        description="确定要重置API密钥吗？此操作将使当前密钥失效，需要更新使用此接入的所有应用。"
        confirmText="重置"
        cancelText="取消"
        isDeleting={resetApiKeyMutation.isPending}
      />
    </>
  )
} 