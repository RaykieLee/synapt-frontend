"use client"

import * as React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { 
  Copy, 
  Edit, 
  MoreHorizontal, 
  Trash, 
  UserPlus 
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/animate-ui/radix/dialog'

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { userApi } from "@/api/user"

// 导入类型，但使用导入类型语法避免命名冲突
import type { User, UserCreateDto, UserUpdateDto } from "@/types/user"
import type { Role } from "@/types/role"

export default function UsersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0
  })
  
  // 新用户默认值
  const [newUser, setNewUser] = useState<Partial<UserCreateDto>>({
    user_name: "",
    nick_name: "",
    password: "",
    email: "",
    phonenumber: "",
    sex: "0",
    status: "0",
  })

  // 获取用户列表查询
  const { data: userData, isLoading } = useQuery({
    queryKey: ['users', 'list', { page: pagination.pageNum, size: pagination.pageSize, userName: searchTerm, status: statusFilter }],
    queryFn: () => userApi.getList({
      page_num: pagination.pageNum,
      page_size: pagination.pageSize,
      user_name: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined
    }),
    staleTime: 5, // 5秒不重新获取数据
  })
  
  // 获取所有角色
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', 'options'],
    queryFn: () => userApi.getRoles(),
    staleTime: 5, // 5秒不重新获取数据
  })

  // 创建用户的mutation
  const createUserMutation = useMutation({
    mutationFn: (user: UserCreateDto) => userApi.create(user),
    onSuccess: () => {
      setShowAddDialog(false)
      toast({
        title: "成功",
        description: "用户创建成功",
      })
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
      // 使相关查询失效，触发重新获取数据
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.message || "创建用户失败，请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 更新用户的mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: number, user: UserUpdateDto }) => 
      userApi.update(data.userId, data.user),
    onSuccess: () => {
      setShowEditDialog(false)
      toast({
        title: "成功",
        description: "用户更新成功",
      })
      // 重置表单
      setCurrentUser(null)
      setSelectedRoles([])
      // 使相关查询失效，触发重新获取数据
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.message || "更新用户失败，请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 删除用户的mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => userApi.delete(userId),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "用户删除成功",
      })
      // 使相关查询失效，触发重新获取数据
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.message || "删除用户失败，请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 添加用户
  const handleAddUser = async () => {
    // 验证必填字段
    if (!newUser.user_name || !newUser.password) {
      toast({
        title: "验证失败",
        description: "用户名和密码为必填项",
        variant: "destructive",
      })
      return
    }

    const user: UserCreateDto = {
      ...newUser as UserCreateDto,
      role_ids: selectedRoles
    }

    createUserMutation.mutate(user)
  }

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

  // 删除用户
  const handleDeleteUser = async (id: number) => {
    deleteUserMutation.mutate(id)
  }

  // 打开编辑对话框
  const openEditDialog = (user: User) => {
    setCurrentUser(user)
    setSelectedRoles(user.roles.map((role) => role.role_id))
    setShowEditDialog(true)
  }

  // 渲染状态标签
  const renderStatusBadge = (status: string) => {
    return status === "0" ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
    ) : (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">停用</Badge>
    )
  }

  // 处理角色选择变化
  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId])
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId))
    }
  }

  // 处理分页
  const handlePagination = (pageNum: number) => {
    setPagination({
      ...pagination,
      pageNum
    })
  }

  // 提取出来的用户列表渲染逻辑
  const users = userData?.rows || []
  const totalUsers = userData?.total || 0

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
          <p className="text-muted-foreground">
            管理系统用户，控制账号访问与权限
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="搜索用户名、昵称、邮箱或手机号..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="所有状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="0">正常</SelectItem>
                  <SelectItem value="1">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  添加用户
                </Button>
              </DialogTrigger>
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
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAddUser} 
                    disabled={!newUser.user_name || !newUser.nick_name || !newUser.password}
                  >
                    确认添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>昵称</TableHead>
                    <TableHead className="hidden md:table-cell">邮箱</TableHead>
                    <TableHead className="hidden md:table-cell">手机号</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="hidden md:table-cell">创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        没有找到符合条件的用户
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.user_name}</TableCell>
                        <TableCell>{user.nick_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.phonenumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(role => (
                              <Badge key={role.role_id} variant="outline" className="mr-1 mb-1">
                                {role.role_name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{renderStatusBadge(user.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(user.create_time).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.user_id.toString())}>
                                <Copy className="mr-2 h-4 w-4" />
                                复制ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.user_id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  共 {totalUsers} 条数据
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePagination(pagination.pageNum - 1)}
                    disabled={pagination.pageNum <= 1}
                  >
                    上一页
                  </Button>
                  <div className="text-sm">
                    第 {pagination.pageNum} 页 / 共 {Math.ceil(totalUsers / pagination.pageSize)} 页
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePagination(pagination.pageNum + 1)}
                    disabled={pagination.pageNum >= Math.ceil(totalUsers / pagination.pageSize)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 编辑用户对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
                  value={currentUser.email}
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
                  value={currentUser.phonenumber}
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
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button 
              onClick={handleEditUser} 
              disabled={!currentUser || !currentUser.user_name || !currentUser.nick_name}
            >
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 