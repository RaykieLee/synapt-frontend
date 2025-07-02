"use client"

import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { MoreHorizontal, Edit, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/animate-ui/radix/dialog"

import { virtualInfoAPI } from "@/api/encrypt"
import { VirtualInfo } from "@/types/encrypt"

interface DataTableRowActionsProps {
  row: Row<VirtualInfo>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const virtualInfo = row.original

  // 删除变异
  const deleteMutation = useMutation({
    mutationFn: (id: string) => virtualInfoAPI.delete(id),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "删除成功",
      })
      queryClient.invalidateQueries({ queryKey: ["encrypt", "virtual-info", "list"] })
      setDeleteDialogOpen(false)
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: `删除失败: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  const handleEdit = () => {
    router.push(`/dashboard/encrypt/virtual-info/edit?id=${virtualInfo.id}`)
  }

  const handleDelete = () => {
    deleteMutation.mutate(virtualInfo.id)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">打开菜单</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除虚拟信息 &quot;{[virtualInfo.first, virtualInfo.last].filter(Boolean).join(" ") || virtualInfo.username || virtualInfo.email}&quot; 吗？
              此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
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