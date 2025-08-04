"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { TreeCheckbox } from "@/components/ui/tree-checkbox"
import { roleApi } from "@/api/role"
import { Role, MenuNode, RoleUpdateDto } from "@/types/role"

interface RolePermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSuccess: () => void
}

export function RolePermissionDialog({
  open,
  onOpenChange,
  role,
  onSuccess
}: RolePermissionDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 菜单权限状态
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([])

  // 获取菜单树
  const { data: menuTree = [] } = useQuery<MenuNode[]>({
    queryKey: ['menuTree'],
    queryFn: () => roleApi.getMenuTree(),
    staleTime: 5 * 60 * 1000,
  })

  // 获取角色详情（包含菜单权限）
  const { data: roleDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['role', 'detail', role?.role_id],
    queryFn: () => roleApi.getDetail(role!.role_id),
    enabled: !!role && open,
    staleTime: 0, // 每次都重新获取最新数据
  })

  // 更新角色权限mutation
  const updatePermissionMutation = useMutation({
    mutationFn: (data: { roleId: number; role: RoleUpdateDto }) =>
      roleApi.update(data.roleId, data.role),
    onSuccess: () => {
      toast({
        title: "权限更新成功",
        description: "角色权限已更新",
      })
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      onSuccess()
    },
    onError: (error: Error) => {
      toast({
        title: "权限更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 当角色详情加载完成时，初始化菜单权限
  useEffect(() => {
    if (roleDetail && open) {
      setSelectedMenuIds(roleDetail.menu_ids || [])
    }
  }, [roleDetail, open])

  // 当对话框关闭时重置状态
  useEffect(() => {
    if (!open) {
      setSelectedMenuIds([])
    }
  }, [open])

  // 处理权限保存
  const handleSavePermission = async () => {
    if (!role) return

    const updateData: RoleUpdateDto = {
      menu_ids: selectedMenuIds
    }

    updatePermissionMutation.mutate({
      roleId: role.role_id,
      role: updateData
    })
  }

  const isLoading = isLoadingDetail || !roleDetail
  const isPending = updatePermissionMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold">权限控制</div>
              <div className="text-sm text-muted-foreground font-normal">
                {role?.role_name} ({role?.role_key})
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <div className="text-muted-foreground">加载角色权限中...</div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {/* 菜单权限头部 */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">菜单权限</h4>
                <div className="text-xs text-muted-foreground">
                  已选择 {selectedMenuIds.length} 项
                </div>
              </div>

              {/* 菜单权限树 - 移除内部滚动，使用外层滚动 */}
              <div className="border rounded-lg bg-background p-4">
                {menuTree.length > 0 ? (
                  <div className="space-y-1">
                    {menuTree.map(node => (
                      <TreeCheckbox
                        key={node.id}
                        node={node}
                        selectedIds={selectedMenuIds}
                        onSelectedChange={setSelectedMenuIds}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <div className="text-muted-foreground text-sm">暂无菜单权限数据</div>
                      <div className="text-xs text-muted-foreground">请联系管理员配置菜单</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              {!isLoading && `共 ${menuTree.length} 个菜单模块`}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="min-w-[80px]"
              >
                取消
              </Button>
              <Button
                onClick={handleSavePermission}
                disabled={isLoading || isPending}
                className="min-w-[100px]"
              >
                {isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>保存中</span>
                  </div>
                ) : (
                  "保存权限"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
