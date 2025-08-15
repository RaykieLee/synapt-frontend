"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/animate-ui/radix/dialog'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { roleApi } from "@/api/role"
import { Role, RoleUpdateDto } from "@/types/role"

interface EditRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSuccess: () => void
}

export function EditRoleDialog({
  open,
  onOpenChange,
  role,
  onSuccess
}: EditRoleDialogProps) {
  const { toast } = useToast()

  // 表单状态
  const [formData, setFormData] = useState<Partial<RoleUpdateDto>>({})

  // 获取角色详情
  const { data: roleDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['role', 'detail', role?.role_id],
    queryFn: () => roleApi.getDetail(role!.role_id),
    enabled: !!role && open,
    staleTime: 0, // 每次都重新获取最新数据
  })

  // 更新角色mutation
  const updateMutation = useMutation({
    mutationFn: (data: { roleId: number; role: RoleUpdateDto }) =>
      roleApi.update(data.roleId, data.role),
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "角色信息已更新",
      })
      onSuccess()
    },
    onError: (error: Error) => {
      toast({
        title: "更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 当角色详情加载完成时，初始化表单数据
  useEffect(() => {
    if (roleDetail && open) {
      setFormData({
        role_id: roleDetail.role_id,
        role_name: roleDetail.role_name,
        role_key: roleDetail.role_key,
        role_sort: roleDetail.role_sort,
        status: roleDetail.status,
        remark: roleDetail.remark || ""
      })
    }
  }, [roleDetail, open])

  // 当对话框关闭时重置表单
  useEffect(() => {
    if (!open) {
      setFormData({})
    }
  }, [open])

  // 处理表单提交
  const handleSubmit = async () => {
    if (!role) return

    // 验证必填字段
    if (!formData.role_name || !formData.role_key) {
      toast({
        title: "验证失败",
        description: "角色名称和权限标识为必填项",
        variant: "destructive",
      })
      return
    }

    const updateData: RoleUpdateDto = {
      ...formData as RoleUpdateDto
    }

    updateMutation.mutate({
      roleId: role.role_id,
      role: updateData
    })
  }

  // 处理表单字段变化
  const handleFieldChange = (field: keyof RoleUpdateDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isLoading = isLoadingDetail || !roleDetail
  const isPending = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑角色</DialogTitle>
          <DialogDescription>
            修改角色信息和权限配置
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">加载角色信息中...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* 角色名称 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role-name" className="text-right">
                角色名称 *
              </Label>
              <Input
                id="edit-role-name"
                value={formData.role_name || ""}
                onChange={(e) => handleFieldChange("role_name", e.target.value)}
                className="col-span-3"
                placeholder="请输入角色名称"
              />
            </div>

            {/* 权限标识 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role-key" className="text-right">
                权限标识 *
              </Label>
              <Input
                id="edit-role-key"
                value={formData.role_key || ""}
                onChange={(e) => handleFieldChange("role_key", e.target.value)}
                className="col-span-3"
                placeholder="请输入权限标识，如：admin、user"
              />
            </div>

            {/* 显示顺序 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role-sort" className="text-right">
                显示顺序
              </Label>
              <Input
                id="edit-role-sort"
                type="number"
                value={formData.role_sort?.toString() || "0"}
                onChange={(e) => handleFieldChange("role_sort", parseInt(e.target.value) || 0)}
                className="col-span-3"
                placeholder="数字越小排序越靠前"
              />
            </div>

            {/* 状态 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">状态</Label>
              <Select
                value={formData.status || "0"}
                onValueChange={(value) => handleFieldChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">正常</SelectItem>
                  <SelectItem value="1">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 备注 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-remark" className="text-right pt-2">
                备注
              </Label>
              <Textarea
                id="edit-remark"
                value={formData.remark || ""}
                onChange={(e) => handleFieldChange("remark", e.target.value)}
                className="col-span-3"
                rows={3}
                placeholder="角色描述信息"
              />
            </div>


          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !formData.role_name ||
              !formData.role_key ||
              isPending
            }
          >
            {isPending ? "保存中..." : "保存修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 