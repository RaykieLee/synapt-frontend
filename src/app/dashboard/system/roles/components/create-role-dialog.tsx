"use client"

import * as React from "react"
import { useState } from "react"
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
import { TreeCheckbox } from "@/components/ui/tree-checkbox"

import { roleApi } from "@/api/role"
import { RoleCreateDto, MenuNode } from "@/types/role"

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateRoleDialogProps) {
  const { toast } = useToast()

  // 表单状态
  const [formData, setFormData] = useState<Partial<RoleCreateDto>>({
    role_name: "",
    role_key: "",
    role_sort: 0,
    status: "0",
    remark: "",
    menu_ids: []
  })

  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([])

  // 获取菜单树
  const { data: menuTree = [] } = useQuery<MenuNode[]>({
    queryKey: ['menuTree'],
    queryFn: () => roleApi.getMenuTree(),
    staleTime: 5 * 60 * 1000,
  })

  // 创建角色mutation
  const createMutation = useMutation({
    mutationFn: (role: RoleCreateDto) => roleApi.create(role),
    onSuccess: () => {
      toast({
        title: "创建成功",
        description: "角色已成功创建",
      })
      onSuccess()
      handleReset()
    },
    onError: (error: Error) => {
      toast({
        title: "创建失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 重置表单
  const handleReset = () => {
    setFormData({
      role_name: "",
      role_key: "",
      role_sort: 0,
      status: "0",
      remark: "",
      menu_ids: []
    })
    setSelectedMenuIds([])
  }

  // 处理表单提交
  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.role_name || !formData.role_key) {
      toast({
        title: "验证失败",
        description: "角色名称和权限标识为必填项",
        variant: "destructive",
      })
      return
    }

    const roleData: RoleCreateDto = {
      ...formData as RoleCreateDto,
      menu_ids: selectedMenuIds
    }

    createMutation.mutate(roleData)
  }

  // 处理表单字段变化
  const handleFieldChange = (field: keyof RoleCreateDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新角色</DialogTitle>
          <DialogDescription>
            添加新的系统角色并配置相应权限
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 角色名称 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role_name" className="text-right">
              角色名称 *
            </Label>
            <Input
              id="role_name"
              value={formData.role_name || ""}
              onChange={(e) => handleFieldChange("role_name", e.target.value)}
              className="col-span-3"
              placeholder="请输入角色名称"
            />
          </div>

          {/* 权限标识 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role_key" className="text-right">
              权限标识 *
            </Label>
            <Input
              id="role_key"
              value={formData.role_key || ""}
              onChange={(e) => handleFieldChange("role_key", e.target.value)}
              className="col-span-3"
              placeholder="请输入权限标识，如：admin、user"
            />
          </div>

          {/* 显示顺序 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role_sort" className="text-right">
              显示顺序
            </Label>
            <Input
              id="role_sort"
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
            <Label htmlFor="remark" className="text-right pt-2">
              备注
            </Label>
            <Textarea
              id="remark"
              value={formData.remark || ""}
              onChange={(e) => handleFieldChange("remark", e.target.value)}
              className="col-span-3"
              rows={3}
              placeholder="角色描述信息"
            />
          </div>

          {/* 菜单权限 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">菜单权限</Label>
            <div className="col-span-3 max-h-[300px] overflow-auto border rounded-md p-3">
              {menuTree.length > 0 ? (
                menuTree.map(node => (
                  <TreeCheckbox
                    key={node.id}
                    node={node}
                    selectedIds={selectedMenuIds}
                    onSelectedChange={setSelectedMenuIds}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-sm">加载菜单权限中...</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.role_name ||
              !formData.role_key ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "创建中..." : "创建角色"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 