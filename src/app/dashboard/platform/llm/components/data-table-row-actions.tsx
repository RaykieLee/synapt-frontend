import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Edit, Trash, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { LLMConfig } from "@/types/llm"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { llmConfigAPI } from "@/api/llm"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (config: LLMConfig) => void
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
}: DataTableRowActionsProps<TData>) {
  const queryClient = useQueryClient()
  const [openDelete, setOpenDelete] = useState(false)
  const config = row.original as LLMConfig

  // 删除配置
  const deleteMutation = useMutation({
    mutationFn: (id: string) => llmConfigAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["llm", "list"] })
      setOpenDelete(false)
    },
    onError: (error: any) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  const handleEdit = () => {
    if (onEdit) {
      onEdit(config)
    } else {
      console.warn('编辑函数未提供')
    }
  }

  const handleDelete = () => {
    deleteMutation.mutate(config.id)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> 编辑
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setOpenDelete(true)} 
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除配置 "{config.config_name}" 吗？该操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}