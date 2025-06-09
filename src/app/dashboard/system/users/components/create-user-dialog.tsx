"use client"

import { useState } from "react"
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
import { UserCreateDto } from "@/types/user"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [newUser, setNewUser] = useState<Partial<UserCreateDto>>({
    user_name: "",
    nick_name: "",
    password: "",
    email: "",
    phonenumber: "",
    sex: "0",
    status: "0",
  })
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])

  // 获取所有角色
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', 'options'],
    queryFn: () => userApi.getRoles(),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 创建用户的mutation
  const createUserMutation = useMutation({
    mutationFn: (user: UserCreateDto) => userApi.create(user),
    onSuccess: () => {
      toast.success("用户创建成功")
      // 重置表单
      setNewUser({
        user_name: "",
        nick_name: "",
        password: "",
        email: "",
        phonenumber: "",
        sex: "0",
        status: "0",
      })
      setSelectedRoles([])
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error?.message || "创建用户失败，请稍后重试")
    }
  })

  // 添加用户
  const handleAddUser = async () => {
    // 验证必填字段
    if (!newUser.user_name || !newUser.password) {
      toast.error("用户名和密码为必填项")
      return
    }

    const user: UserCreateDto = {
      ...newUser as UserCreateDto,
      role_ids: selectedRoles
    }

    createUserMutation.mutate(user)
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
          <DialogTitle>添加新用户</DialogTitle>
          <DialogDescription>
            填写用户信息以创建新用户账号
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              用户名 *
            </Label>
            <Input
              id="username"
              value={newUser.user_name}
              onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nickname" className="text-right">
              昵称 *
            </Label>
            <Input
              id="nickname"
              value={newUser.nick_name}
              onChange={(e) => setNewUser({ ...newUser, nick_name: e.target.value })}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              密码 *
            </Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phonenumber" className="text-right">
              手机号
            </Label>
            <Input
              id="phonenumber"
              value={newUser.phonenumber}
              onChange={(e) => setNewUser({ ...newUser, phonenumber: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              性别
            </Label>
            <Select 
              value={newUser.sex} 
              onValueChange={(value) => setNewUser({ ...newUser, sex: value })}
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
              value={newUser.status} 
              onValueChange={(value) => setNewUser({ ...newUser, status: value })}
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
                    id={`role-${role.role_id}`} 
                    checked={selectedRoles.includes(role.role_id)}
                    onCheckedChange={(checked) => 
                      handleRoleChange(role.role_id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`role-${role.role_id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {role.role_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button 
            onClick={handleAddUser} 
            disabled={!newUser.user_name || !newUser.nick_name || !newUser.password || createUserMutation.isPending}
          >
            {createUserMutation.isPending ? "创建中..." : "确认添加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 