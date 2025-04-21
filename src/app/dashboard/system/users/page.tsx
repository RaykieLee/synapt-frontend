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

// 用户类型定义
interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: "active" | "inactive"
  role: string
  createdAt: string
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    nickname: "管理员",
    email: "admin@example.com",
    phone: "13800000000",
    status: "active",
    role: "超级管理员",
    createdAt: "2023-01-15 08:30:00",
  },
  {
    id: 2,
    username: "zhangsan",
    nickname: "张三",
    email: "zhangsan@example.com",
    phone: "13811111111",
    status: "active",
    role: "开发人员",
    createdAt: "2023-02-20 10:15:00",
  },
  {
    id: 3,
    username: "lisi",
    nickname: "李四",
    email: "lisi@example.com",
    phone: "13822222222",
    status: "inactive",
    role: "测试人员",
    createdAt: "2023-03-05 14:45:00",
  },
  {
    id: 4,
    username: "wangwu",
    nickname: "王五",
    email: "wangwu@example.com",
    phone: "13833333333",
    status: "active",
    role: "运维人员",
    createdAt: "2023-04-10 09:20:00",
  },
  {
    id: 5,
    username: "zhaoliu",
    nickname: "赵六",
    email: "zhaoliu@example.com",
    phone: "13844444444",
    status: "active",
    role: "客服",
    createdAt: "2023-05-15 16:30:00",
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    nickname: "",
    email: "",
    phone: "",
    role: "开发人员",
    status: "active",
  })

  // 初始化加载用户数据
  useEffect(() => {
    // 模拟API调用延迟
    const timer = setTimeout(() => {
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // 过滤用户
  useEffect(() => {
    let result = users

    // 按搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.nickname.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.phone.includes(term)
      )
    }

    // 按状态过滤
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(result)
  }, [searchTerm, statusFilter, users])

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 处理添加用户
  const handleAddUser = () => {
    const newId = Math.max(...users.map((user) => user.id)) + 1
    const currentDate = new Date().toISOString().split("T")[0] + " " + 
                        new Date().toTimeString().split(" ")[0].substring(0, 5) + ":00"
    
    const userToAdd: User = {
      id: newId,
      username: newUser.username,
      nickname: newUser.nickname,
      email: newUser.email,
      phone: newUser.phone,
      status: newUser.status as "active" | "inactive",
      role: newUser.role,
      createdAt: currentDate,
    }

    setUsers([...users, userToAdd])
    setShowAddDialog(false)
    
    // 重置表单
    setNewUser({
      username: "",
      nickname: "",
      email: "",
      phone: "",
      role: "开发人员",
      status: "active",
    })
  }

  // 处理编辑用户
  const handleEditUser = () => {
    if (!currentUser) return

    setUsers(
      users.map((user) =>
        user.id === currentUser.id ? { ...currentUser } : user
      )
    )
    setShowEditDialog(false)
    setCurrentUser(null)
  }

  // 处理删除用户
  const handleDeleteUser = (id: number) => {
    if (confirm("确定要删除此用户吗？")) {
      setUsers(users.filter((user) => user.id !== id))
    }
  }

  // 打开编辑对话框
  const openEditDialog = (user: User) => {
    setCurrentUser({ ...user })
    setShowEditDialog(true)
  }

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">禁用</Badge>
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
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
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
              <DialogContent className="sm:max-w-[425px]">
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
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
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
                      value={newUser.nickname}
                      onChange={(e) => setNewUser({ ...newUser, nickname: e.target.value })}
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
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      角色 *
                    </Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="超级管理员">超级管理员</SelectItem>
                        <SelectItem value="开发人员">开发人员</SelectItem>
                        <SelectItem value="测试人员">测试人员</SelectItem>
                        <SelectItem value="运维人员">运维人员</SelectItem>
                        <SelectItem value="客服">客服</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      状态
                    </Label>
                    <Select 
                      value={newUser.status} 
                      onValueChange={(value) => setNewUser({ ...newUser, status: value as "active" | "inactive" })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">正常</SelectItem>
                        <SelectItem value="inactive">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <Button onClick={handleAddUser} disabled={!newUser.username || !newUser.nickname}>确认添加</Button>
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
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.nickname}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{renderStatusBadge(user.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.createdAt}</TableCell>
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
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id.toString())}>
                                <Copy className="mr-2 h-4 w-4" />
                                复制ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id)}
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
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  共 {filteredUsers.length} 条数据
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 编辑用户对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
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
                  value={currentUser.username}
                  onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
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
                  value={currentUser.nickname}
                  onChange={(e) => setCurrentUser({ ...currentUser, nickname: e.target.value })}
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
                  value={currentUser.phone}
                  onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  角色 *
                </Label>
                <Select 
                  value={currentUser.role} 
                  onValueChange={(value) => setCurrentUser({ ...currentUser, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="超级管理员">超级管理员</SelectItem>
                    <SelectItem value="开发人员">开发人员</SelectItem>
                    <SelectItem value="测试人员">测试人员</SelectItem>
                    <SelectItem value="运维人员">运维人员</SelectItem>
                    <SelectItem value="客服">客服</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  状态
                </Label>
                <Select 
                  value={currentUser.status} 
                  onValueChange={(value) => setCurrentUser({ ...currentUser, status: value as "active" | "inactive" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">正常</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button 
              onClick={handleEditUser} 
              disabled={!currentUser || !currentUser.username || !currentUser.nickname}
            >
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 