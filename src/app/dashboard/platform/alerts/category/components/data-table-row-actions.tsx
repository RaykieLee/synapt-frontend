"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmationDialog } from "@/components/shared/data-table"
import { alertCategoryAPI } from "@/api"
import { AlertCategory } from "@/types/alert"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (category: AlertCategory) => void
}

export function DataTableRowActions<TData extends AlertCategory>({
  row,
  onEdit,
}: DataTableRowActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()
  
  // 删除操作
  const deleteMutation = useMutation({
    mutationFn: (id: number) => alertCategoryAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["alerts", "category"] })
      setShowDeleteDialog(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  const handleEdit = () => {
    if (onEdit) {
      onEdit(row.original)
    }
  }
  
  const handleDelete = () => {
    setShowDeleteDialog(true)
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">打开菜单</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => router.push(`/dashboard/platform/alerts/log?category_id=${row.original.category_id}`)}
          >
            <Bell className="mr-2 h-4 w-4" />
            查看告警日志
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={handleDelete}
          >
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => deleteMutation.mutate(row.original.category_id)}
        title="确认删除"
        description="确定要删除该告警类别吗？此操作不可恢复。"
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
} 