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
import { AlertLog, AlertLogUpdateDto } from "@/types/alert"
import { DeleteConfirmationDialog } from "@/components/shared/data-table"
import { alertLogAPI } from "@/api/alert"
import { useState } from "react"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (data: AlertLog) => void
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  
  const log = row.original as AlertLog
  
  const statusText = {
    "0": "未处理",
    "1": "已处理",
    "2": "已忽略"
  }

  // 删除告警日志
  const deleteMutation = useMutation({
    mutationFn: (id: number) => alertLogAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["alerts", "log"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 处理告警日志状态
  const processLogMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: AlertLogUpdateDto }) => 
      alertLogAPI.update(id, data),
    onSuccess: () => {
      toast.success("操作成功")
      queryClient.invalidateQueries({ queryKey: ["alerts", "log"] })
      setProcessingStatus(null)
    },
    onError: (error) => {
      toast.error(`操作失败: ${error}`)
      setProcessingStatus(null)
    },
  })

  const handleProcess = (status: string) => {
    // 状态未变更，不需要处理
    if (log.status === status) return;
    
    setProcessingStatus(status);
    processLogMutation.mutate({
      id: log.id,
      data: {
        status,
        process_note: `状态变更为${statusText[status as keyof typeof statusText]}`
      }
    });
  }

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
          <DropdownMenuItem onClick={() => onEdit && onEdit(log)}>
            查看详情
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {log.status !== "1" && (
            <DropdownMenuItem 
              disabled={!!processingStatus}
              onClick={() => handleProcess("1")}
            >
              {processingStatus === "1" ? "处理中..." : "标记为已处理"}
            </DropdownMenuItem>
          )}
          {log.status !== "2" && (
            <DropdownMenuItem 
              disabled={!!processingStatus}
              onClick={() => handleProcess("2")}
            >
              {processingStatus === "2" ? "处理中..." : "标记为已忽略"}
            </DropdownMenuItem>
          )}
          {log.status !== "0" && (
            <DropdownMenuItem 
              disabled={!!processingStatus}
              onClick={() => handleProcess("0")}
            >
              {processingStatus === "0" ? "处理中..." : "标记为未处理"}
            </DropdownMenuItem>
          )}
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
        onConfirm={() => deleteMutation.mutate(log.id)}
        title="确认删除"
        description="确定要删除此告警日志吗？此操作不可恢复。"
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
} 