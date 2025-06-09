"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/animate-ui/base/checkbox"
import { toast } from "sonner"
import { userApi } from "@/api/user"
import { User, UserUpdateDto } from "@/types/user"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSuccess: () => void
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])

  // 当用户信息变化时更新本地状态
  useEffect(() => {
    if (user) {
      setCurrentUser(user)
      setSelectedRoles(user.roles.map((role) => role.role_id))
    }
  }, [user])

  // 获取所有角色
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', 'options'],
    queryFn: () => userApi.getRoles(),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 更新用户的mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: number, user: UserUpdateDto }) => 
      userApi.update(data.userId, data.user),
    onSuccess: () => {
      toast.success("用户更新成功")
      setCurrentUser(null)
      setSelectedRoles([])
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error?.message || "更新用户失败，请稍后重试")
    }
  })

  // 编辑用户
  const handleEditUser = async () => {
    if (!currentUser) return

    const updatedUser: UserUpdateDto = {
      user_id: currentUser.user_id,
      user_name: currentUser.user_name,
      nick_name: currentUser.nick_name,
      email: currentUser.email || "",
      phonenumber: currentUser.phonenumber || "",
      sex: currentUser.sex,
      status: currentUser.status,
      role_ids: selectedRoles
    }

    updateUserMutation.mutate({ 
      userId: currentUser.user_id, 
      user: updatedUser 
    })
  }

  // 处理角色选择变化
  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId])
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
          <DialogDescription>
            修改用户信息
          </DialogDescription>
        </DialogHeader>
        {currentUser && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                用户名 *
              </Label>
              <Input
                id="edit-username"
                value={currentUser.user_name}
                onChange={(e) => setCurrentUser({ ...currentUser, user_name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nickname" className="text-right">
                昵称 *
              </Label>
              <Input
                id="edit-nickname"
                value={currentUser.nick_name}
                onChange={(e) => setCurrentUser({ ...currentUser, nick_name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                邮箱
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={currentUser.email || ""}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phonenumber" className="text-right">
                手机号
              </Label>
              <Input
                id="edit-phonenumber"
                value={currentUser.phonenumber || ""}
                onChange={(e) => setCurrentUser({ ...currentUser, phonenumber: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                性别
              </Label>
              <Select 
                value={currentUser.sex} 
                onValueChange={(value) => setCurrentUser({ ...currentUser, sex: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">男</SelectItem>
                  <SelectItem value="1">女</SelectItem>
                  <SelectItem value="2">未知</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                状态
              </Label>
              <Select 
                value={currentUser.status} 
                onValueChange={(value) => setCurrentUser({ ...currentUser, status: value })}
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                角色分配
              </Label>
              <div className="col-span-3 flex flex-col gap-3">
                {roles.map((role) => (
                  <div key={role.role_id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`edit-role-${role.role_id}`} 
                      checked={selectedRoles.includes(role.role_id)}
                      onCheckedChange={(checked) => 
                        handleRoleChange(role.role_id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`edit-role-${role.role_id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {role.role_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button 
            onClick={handleEditUser} 
            disabled={!currentUser || !currentUser.user_name || !currentUser.nick_name || updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? "保存中..." : "保存修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 