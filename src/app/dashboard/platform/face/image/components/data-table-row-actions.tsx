"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaceImage } from "@/types/face"
import { useState } from "react"
import { CreateEditDialog } from "./create-edit-dialog"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const faceImage = row.original as FaceImage
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            编辑
          </DropdownMenuItem>
          {faceImage.image_id && (
            <DropdownMenuItem onClick={() => console.log("预览图片:", faceImage.image_id)}>
              预览图片
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700"
          >
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        faceImage={faceImage}
        mode="edit"
      />

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">确认删除</h3>
            <p className="text-gray-600 mb-4">
              确定要删除这张人脸图片吗？此操作不可恢复。
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  console.log("删除人脸图片:", faceImage.id)
                  setShowDeleteDialog(false)
                }}
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 