"use client"

import { useRouter } from "next/navigation"
import { Row } from "@tanstack/react-table"
import { Edit, MoreHorizontal, Trash, Users, Image } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaceLibrary } from "@/types/face"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/animate-ui/radix/dialog'
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { faceLibraryAPI } from "@/api"
import { toast } from "sonner"
import { CreateEditDialog } from "./create-edit-dialog"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const library = row.original as FaceLibrary
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  // 删除人脸库
  const deleteMutation = useMutation({
    mutationFn: (id: number) => faceLibraryAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["face", "library"] })
      setOpenDeleteDialog(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  const confirmDelete = () => {
    deleteMutation.mutate(library.id)
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
          <DropdownMenuItem
            onClick={() => setOpenEditDialog(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/platform/face/person?library_id=${library.id}`)}
          >
            <Users className="mr-2 h-4 w-4" />
            人员管理
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/platform/face/image?library_id=${library.id}`)}
          >
            <Image className="mr-2 h-4 w-4" />
            人脸图片管理
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除人脸库"{library.library_name}"吗？此操作将同时删除该人脸库下的所有人员和人脸图片数据，此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑人脸库弹窗 */}
      <CreateEditDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        libraryId={library.id}
      />
    </>
  )
} 