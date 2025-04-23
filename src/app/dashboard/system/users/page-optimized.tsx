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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

// 导入类型和API服务
import { User as UserType, UserCreateDto, UserQuery, UserUpdateDto } from "@/types/user"
import { Role } from "@/types/role"
import { userApi } from "@/api/user"

// 定义返回类型
interface UserListResponse {
  rows: UserType[];
  total: number;
}

export default function UsersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10
  })
  
  // 新用户默认值
  const [newUser, setNewUser] = useState<Partial<UserCreateDto>>({
    user_name: "",
    nick_name: "",
    password: "",
    email: "",
    phone: "",
    sex: "0",
    status: "0",
    role_ids: []
  })

  // 获取用户列表查询
  const { data: userData, isLoading } = useQuery<UserListResponse>({
    queryKey: ['users', pagination.pageNum, pagination.pageSize, searchTerm, statusFilter],
    queryFn: () => userApi.getList({
      page_num: pagination.pageNum,
      page_size: pagination.pageSize,
      user_name: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined
    }),
    staleTime: 1000 * 60 * 5, // 5分钟内不重新获取数据
  })
  
  // 获取所有角色
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => userApi.getRoles(),
  })

  // 添加用户的mutation
  const addUserMutation = useMutation({
    mutationFn: (user: UserCreateDto) => userApi.create(user),
    onSuccess: () => {
      toast({
        title: "添加成功",
        description: "用户已成功添加",
      })
      setShowAddDialog(false)
      // 重置表单
      setNewUser({
        user_name: "",
        nick_name: "",
        password: "",
        email: "",
        phone: "",
        sex: "0",
        status: "0",
        role_ids: []
      })
      // 刷新用户列表
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast({
        title: "添加失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 修改用户的mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: number; user: UserUpdateDto }) => 
      userApi.update(data.userId, data.user),
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "用户信息已更新",
      })
      setShowEditDialog(false)
      // 刷新用户列表
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast({
        title: "更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 删除用户的mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => userApi.delete(userId),
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "用户已删除",
      })
      // 刷新用户列表
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 获取用户详情的查询
  const getUserDetail = async (userId: number) => {
    try {
      const data = await userApi.getDetail(userId)
      setCurrentUser(data)
      setSelectedRoles(data.role_ids || [])
      return data
    } catch (error) {
      console.error("获取用户详情失败", error)
      toast({
        title: "获取用户详情失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 添加用户
  const handleAddUser = async () => {
    if (!newUser.user_name || !newUser.nick_name) {
      toast({
        title: "请完善必填信息",
        description: "用户名和昵称为必填项",
        variant: "destructive",
      })
      return
    }

    addUserMutation.mutate({
      ...newUser,
      role_ids: selectedRoles
    } as UserCreateDto)
  }

  // 编辑用户
  const handleEditUser = async () => {
    if (!currentUser || !currentUser.user_name || !currentUser.nick_name) {
      toast({
        title: "请完善必填信息",
        description: "用户名和昵称为必填项",
        variant: "destructive",
      })
      return
    }

    updateUserMutation.mutate({
      userId: currentUser.user_id,
      user: {
        ...currentUser,
        role_ids: selectedRoles
      } as UserUpdateDto
    })
  }

  // 删除用户
  const handleDeleteUser = async (id: number) => {
    if (!confirm("确定要删除此用户吗？")) {
      return
    }
    deleteUserMutation.mutate(id)
  }

  // 打开编辑对话框
  const openEditDialog = async (user: UserType) => {
    await getUserDetail(user.user_id)
    setShowEditDialog(true)
  }

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    if (status === "0") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">禁用</Badge>
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
    setPagination(prev => ({ ...prev, pageNum }))
  }

  // 提取用户数据和分页信息
  const users = userData?.rows || []
  const total = userData?.total || 0

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
          <p className="text-muted-foreground">
            系统用户管理，包括添加、编辑和删除用户
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="搜索用户名或昵称..."
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
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>添加新用户</DialogTitle>
                  <DialogDescription>
                    创建一个新的系统用户
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user_name" className="text-right">
                      用户名 *
                    </Label>
                    <Input
                      id="user_name"
                      value={newUser.user_name}
                      onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nick_name" className="text-right">
                      昵称 *
                    </Label>
                    <Input
                      id="nick_name"
                      value={newUser.nick_name}
                      onChange={(e) => setNewUser({ ...newUser, nick_name: e.target.value })}
                      className="col-span-3"
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
                    <Label htmlFor="phone" className="text-right">
                      手机号
                    </Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">性别</Label>
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
                    <Label className="text-right">状态</Label>
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
                    <Label className="text-right pt-2">角色</Label>
                    <div className="col-span-3 space-y-2">
                      {roles.map((role) => (
                        <div key={role.role_id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role.role_id}`}
                            checked={selectedRoles.includes(role.role_id)}
                            onCheckedChange={(checked) =>
                              handleRoleChange(role.role_id, checked === true)
                            }
                          />
                          <Label htmlFor={`role-${role.role_id}`}>{role.role_name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <Button onClick={handleAddUser}>确认添加</Button>
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
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>昵称</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>手机</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        没有找到符合条件的用户
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.user_name}</TableCell>
                        <TableCell>{user.nick_name}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>{renderStatusBadge(user.status)}</TableCell>
                        <TableCell>
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
              
              {/* 分页控件 */}
              {total > 0 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePagination(pagination.pageNum - 1)}
                    disabled={pagination.pageNum === 1}
                  >
                    上一页
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    第 <span className="font-medium">{pagination.pageNum}</span> 页，
                    共 <span className="font-medium">{Math.ceil(total / pagination.pageSize)}</span> 页
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePagination(pagination.pageNum + 1)}
                    disabled={pagination.pageNum >= Math.ceil(total / pagination.pageSize)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑用户对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户信息
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user-name" className="text-right">
                  用户名 *
                </Label>
                <Input
                  id="edit-user-name"
                  value={currentUser.user_name}
                  onChange={(e) => setCurrentUser({ ...currentUser, user_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nick-name" className="text-right">
                  昵称 *
                </Label>
                <Input
                  id="edit-nick-name"
                  value={currentUser.nick_name}
                  onChange={(e) => setCurrentUser({ ...currentUser, nick_name: e.target.value })}
                  className="col-span-3"
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
                <Label htmlFor="edit-phone" className="text-right">
                  手机号
                </Label>
                <Input
                  id="edit-phone"
                  value={currentUser.phone || ""}
                  onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">性别</Label>
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
                <Label className="text-right">状态</Label>
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
                <Label className="text-right pt-2">角色</Label>
                <div className="col-span-3 space-y-2">
                  {roles.map((role) => (
                    <div key={role.role_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-role-${role.role_id}`}
                        checked={selectedRoles.includes(role.role_id)}
                        onCheckedChange={(checked) =>
                          handleRoleChange(role.role_id, checked === true)
                        }
                      />
                      <Label htmlFor={`edit-role-${role.role_id}`}>{role.role_name}</Label>
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
            <Button onClick={handleEditUser}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 