"use client"

import { useRouter } from "next/navigation"
import { Row } from "@tanstack/react-table"
import { Edit, Trash, ChevronDown, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FacePerson } from "@/types/face"
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
import { facePersonAPI } from "@/api"
import { toast } from "sonner"
import { CreateEditDialog } from "./create-edit-dialog"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function DataTableRowActions<TData>({
  row,
  isExpanded = false,
  onToggleExpand,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const person = row.original as FacePerson
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  // 删除人员
  const deleteMutation = useMutation({
    mutationFn: (id: string) => facePersonAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["face", "person"] })
      setOpenDeleteDialog(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  const confirmDelete = () => {
    deleteMutation.mutate(person.id)
  }

  return (
    <>
      <div className="flex items-center gap-1">


        {/* 编辑按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setOpenEditDialog(true)}
          title="编辑人员"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {/* 删除按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50"
          onClick={() => setOpenDeleteDialog(true)}
          title="删除人员"
        >
          <Trash className="h-4 w-4" />
        </Button>
                {/* 展开/折叠按钮 */}
                <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleExpand}
          title={isExpanded ? "折叠人脸图片" : "展开人脸图片"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除人员"{person.person_name}"吗？此操作将同时删除该人员的所有人脸图片数据，此操作无法撤销。
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

      {/* 编辑人员弹窗 */}
      <CreateEditDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        personId={person.id}
        defaultLibraryId={person.library_id}
      />
    </>
  )
} 