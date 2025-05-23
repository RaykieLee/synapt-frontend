"use client"

import React, { useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/animate-ui/radix/dialog'
import { Button } from "@/components/ui/button"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  isDeleting?: boolean
  cancelText?: string
  confirmText?: string
  deletingText?: string
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "确认删除",
  description = "您确定要删除所选项目吗？此操作无法撤销。",
  isDeleting = false,
  cancelText = "取消",
  confirmText = "确认删除",
  deletingText = "删除中...",
}: DeleteConfirmationDialogProps) {
  
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
  
  // 为了确保弹窗关闭后彻底清除蒙版
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen && !isDeleting) {
      // 安全关闭弹窗
      safeCloseDialog(() => onOpenChange(false))
    } else if (isOpen) {
      onOpenChange(true)
    }
  }, [isDeleting, onOpenChange, safeCloseDialog])
  
  // 处理确认操作
  const handleConfirm = useCallback(() => {
    // 执行确认操作
    onConfirm()
  }, [onConfirm])
  
  // 处理取消操作
  const handleCancel = useCallback(() => {
    safeCloseDialog(() => onOpenChange(false))
  }, [onOpenChange, safeCloseDialog])
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? deletingText : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 