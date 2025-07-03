"use client"

import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Edit, Trash, Eye, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/animate-ui/radix/dialog"

import { projectManagementAPI } from "@/api/encrypt/project-management"
import { ProjectManagement } from "@/types/encrypt/project-management"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const project = row.original as ProjectManagement

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectManagementAPI.delete(id),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "项目删除成功",
      })
      queryClient.invalidateQueries({ queryKey: ["encrypt", "project-management", "list"] })
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
    router.push(`/dashboard/encrypt/project-management/edit?id=${project.id}`)
  }

  const handleView = () => {
    router.push(`/dashboard/encrypt/project-management/view/${project.id}`)
  }

  const handleDelete = () => {
    deleteMutation.mutate(project.id)
  }

  const handleViewWebsite = () => {
    if (project.official_website) {
      window.open(project.official_website, '_blank')
    }
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
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            查看详情
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          {project.official_website && (
            <DropdownMenuItem onClick={handleViewWebsite}>
              <ExternalLink className="mr-2 h-4 w-4" />
              访问官网
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除项目 "{project.project_name}" 吗？此操作无法撤销。
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