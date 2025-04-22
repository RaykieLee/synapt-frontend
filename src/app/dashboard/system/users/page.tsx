"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Copy, 
  Edit, 
  MoreHorizontal, 
  Trash, 
  User, 
  UserPlus 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { toast } from "@/components/ui/use-toast"

// 用户类型定义
interface User {
  user_id: number
  user_name: string
  nick_name: string
  email: string
  phonenumber: string
  status: string
  sex: string
  avatar: string
  roles: Array<{
    role_id: number
    role_name: string
    role_key: string
  }>
  create_time: string
}

// 角色类型定义
interface Role {
  role_id: number
  role_name: string
  role_key: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [newUser, setNewUser] = useState({
    user_name: "",
    nick_name: "",
    password: "",
    email: "",
    phonenumber: "",
    sex: "0",
    status: "0",
  })
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0
  })

  // API基础URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  // 获取token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || ''
    }
    return ''
  }

  // 初始化加载用户数据
  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [pagination.pageNum, pagination.pageSize])

  // 过滤用户
  useEffect(() => {
    if (!isLoading) {
      let result = [...users]

      // 按搜索词过滤
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        result = result.filter(
          (user) =>
            user.user_name.toLowerCase().includes(term) ||
            user.nick_name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.phonenumber.includes(term)
        )
      }

      // 按状态过滤
      if (statusFilter !== "all") {
        result = result.filter((user) => user.status === statusFilter)
      }

      setFilteredUsers(result)
    }
  }, [searchTerm, statusFilter, users, isLoading])

  // 获取用户列表
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      console.log("使用的Token:", token ? token.substring(0, 15) + "..." : "无Token");
      
      if (!token) {
        throw new Error("未找到认证令牌，请重新登录");
      }
      
      const url = `${API_BASE_URL}/api/v1/users/list`;
      console.log("请求URL:", url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_num: pagination.pageNum,
          page_size: pagination.pageSize,
          search_params: {
            user_name: searchTerm || undefined
          }
        }),
      });

      console.log("响应状态:", response.status);
      
      // 处理特定的HTTP状态码
      if (response.status === 401 || response.status === 403) {
        // 认证失败，可能是令牌过期
        localStorage.removeItem("token");
        console.error("认证失败，请重新登录");
        toast({
          title: "认证失败",
          description: "请重新登录",
          variant: "destructive",
        });
        // window.location.href = "/login";
        return;
      }
      
      if (response.status === 422) {
        const errorData = await response.json();
        console.error("请求参数验证失败:", errorData);
        toast({
          title: "请求参数错误",
          description: "请求参数无效，详情请查看控制台",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`请求错误: ${response.status}`);
      }

      const data = await response.json();
      console.log("API响应数据:", data);
      
      if (data.code === 200) {
        setUsers(data.data.rows);
        setPagination({
          ...pagination,
          total: data.data.total
        });
      } else {
        throw new Error(data.msg || "获取用户列表失败");
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "获取用户列表失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const token = getToken();
      console.log("获取角色列表使用的Token:", token ? token.substring(0, 15) + "..." : "无Token");
      
      if (!token) {
        throw new Error("未找到认证令牌，请重新登录");
      }
      
      const url = `${API_BASE_URL}/api/v1/users/roles`;
      console.log("角色请求URL:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("角色响应状态:", response.status);
      
      // 处理特定的HTTP状态码
      if (response.status === 401 || response.status === 403) {
        // 认证失败，可能是令牌过期
        localStorage.removeItem("token");
        console.error("认证失败，请重新登录");
        toast({
          title: "认证失败",
          description: "请重新登录",
          variant: "destructive",
        });
        return;
      }
      
      if (response.status === 422) {
        const errorData = await response.json();
        console.error("角色请求参数验证失败:", errorData);
        toast({
          title: "请求参数错误", 
          description: "角色请求参数无效，详情请查看控制台",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`请求错误: ${response.status}`);
      }

      const data = await response.json();
      console.log("角色API响应数据:", data);
      
      if (data.code === 200) {
        setAvailableRoles(data.data);
      } else {
        throw new Error(data.msg || "获取角色列表失败");
      }
    } catch (error) {
      console.error("获取角色列表失败:", error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "获取角色列表失败，请稍后重试",
        variant: "destructive",
      });
    }
  }

  // 获取用户详情
  const fetchUserDetail = async (userId: number) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      if (data.code === 200) {
        setCurrentUser(data.data)
        setSelectedRoles(data.data.roles.map((role: any) => role.role_id))
      } else {
        throw new Error(data.msg || "获取用户详情失败")
      }
    } catch (error) {
      console.error("获取用户详情失败:", error)
      toast({
        title: "错误",
        description: "获取用户详情失败，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 处理添加用户
  const handleAddUser = async () => {
    try {
      const token = getToken()
      
      // 构建API URL查询参数
      const roleIdsParams = selectedRoles.map(id => `role_ids=${id}`).join('&')
      const apiUrl = `${API_BASE_URL}/api/v1/users${roleIdsParams ? `?${roleIdsParams}` : ''}`
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.msg || `Error: ${response.status}`)
      }

      const data = await response.json()
      if (data.code === 200) {
        toast({
          title: "成功",
          description: "添加用户成功",
        })
        setShowAddDialog(false)
        
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
        
        // 刷新用户列表
        fetchUsers()
      } else {
        throw new Error(data.msg || "添加用户失败")
      }
    } catch (error) {
      console.error("添加用户失败:", error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "添加用户失败，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 处理编辑用户
  const handleEditUser = async () => {
    if (!currentUser) return

    try {
      const token = getToken()
      
      // 构建API URL查询参数
      const roleIdsParams = selectedRoles.map(id => `role_ids=${id}`).join('&')
      const apiUrl = `${API_BASE_URL}/api/v1/users/${currentUser.user_id}${roleIdsParams ? `?${roleIdsParams}` : ''}`
      
      // 准备更新的用户数据
      const updateData = {
        user_id: currentUser.user_id,
        user_name: currentUser.user_name,
        nick_name: currentUser.nick_name,
        email: currentUser.email,
        phonenumber: currentUser.phonenumber,
        sex: currentUser.sex,
        status: currentUser.status,
        avatar: currentUser.avatar,
      }
      
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.msg || `Error: ${response.status}`)
      }

      const data = await response.json()
      if (data.code === 200) {
        toast({
          title: "成功",
          description: "更新用户成功",
        })
        setShowEditDialog(false)
        setCurrentUser(null)
        setSelectedRoles([])
        
        // 刷新用户列表
        fetchUsers()
      } else {
        throw new Error(data.msg || "更新用户失败")
      }
    } catch (error) {
      console.error("更新用户失败:", error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "更新用户失败，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 处理删除用户
  const handleDeleteUser = async (id: number) => {
    if (!confirm("确定要删除此用户吗？")) {
      return
    }
    
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.msg || `Error: ${response.status}`)
      }

      const data = await response.json()
      if (data.code === 200) {
        toast({
          title: "成功",
          description: "删除用户成功",
        })
        
        // 刷新用户列表
        fetchUsers()
      } else {
        throw new Error(data.msg || "删除用户失败")
      }
    } catch (error) {
      console.error("删除用户失败:", error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "删除用户失败，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 打开编辑对话框
  const openEditDialog = async (user: User) => {
    await fetchUserDetail(user.user_id)
    setShowEditDialog(true)
  }

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    if (status === "0") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">禁用</Badge>
  }

  // 处理角色选择
  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId])
    } else {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId))
    }
  }

  // 处理分页
  const handlePagination = (pageNum: number) => {
    setPagination({
      ...pagination,
      pageNum
    })
  }

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
                    <Label htmlFor="phone" className="text-right">
                      手机号
                    </Label>
                    <Input
                      id="phone"
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
                      {availableRoles.map((role) => (
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
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        没有找到符合条件的用户
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
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
                  共 {pagination.total} 条数据
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
                    第 {pagination.pageNum} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePagination(pagination.pageNum + 1)}
                    disabled={pagination.pageNum >= Math.ceil(pagination.total / pagination.pageSize)}
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
                <Label htmlFor="edit-phone" className="text-right">
                  手机号
                </Label>
                <Input
                  id="edit-phone"
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
                  {availableRoles.map((role) => (
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