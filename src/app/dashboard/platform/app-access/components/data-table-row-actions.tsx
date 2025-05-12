"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AppAccess } from "@/types/app"
import { DeleteConfirmationDialog } from "@/components/shared/data-table"
import { appAccessAPI } from "@/api"
import { useState } from "react"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  
  const app = row.original as AppAccess
  
  // 删除应用接入
  const deleteMutation = useMutation({
    mutationFn: (id: number) => appAccessAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["app-access", "list"] })
      setDeleteOpen(false)
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
      setResetOpen(false)
    },
    onError: (error) => {
      toast.error(`重置失败: ${error}`)
    },
  })

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
          <DropdownMenuItem onClick={() => router.push(`/dashboard/platform/app-access/${app.id}`)}>
            查看详情
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/platform/app-access/${app.id}/edit`)}>
            编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setResetOpen(true)}
          >
            重置API密钥
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteMutation.mutate(app.id)}
        title="确认删除"
        description="确定要删除此应用接入吗？此操作不可恢复。"
        isDeleting={deleteMutation.isPending}
      />

      {/* 重置API密钥确认对话框 */}
      <DeleteConfirmationDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
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