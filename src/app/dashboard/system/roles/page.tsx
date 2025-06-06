"use client"

import * as React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { 
  Copy, 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Trash 
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/animate-ui/radix/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { TreeCheckbox } from "@/components/ui/tree-checkbox"

// 导入类型和API服务
import { MenuNode, Role, RoleCreateDto, RoleUpdateDto } from "@/types/role"
import { roleApi } from "@/api/role"

export default function RolesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([])
  
  // 新角色默认值
  const [newRole, setNewRole] = useState<Partial<RoleCreateDto>>({
    role_name: "",
    role_key: "",
    role_sort: 0,
    status: "0",
    remark: "",
    menu_ids: []
  })

  // 获取角色列表查询
  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => roleApi.getList(),
    staleTime: 5, // 5秒不重新获取数据
  })
  
  // 获取菜单树查询
  const { data: menuTree = [] } = useQuery<MenuNode[]>({
    queryKey: ['menuTree'],
    queryFn: () => roleApi.getMenuTree(),
    staleTime: 5, // 5秒不重新获取数据
  })

  // 添加角色的mutation
  const addRoleMutation = useMutation({
    mutationFn: (role: RoleCreateDto) => roleApi.create(role),
    onSuccess: () => {
      toast({
        title: "添加成功",
        description: "角色已成功添加",
      })
      setShowAddDialog(false)
      // 重置表单
      setNewRole({
        role_name: "",
        role_key: "",
        role_sort: 0,
        status: "0",
        remark: "",
        menu_ids: []
      })
      setSelectedMenuIds([])
      // 刷新角色列表
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error: Error) => {
      toast({
        title: "添加失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 修改角色的mutation
  const updateRoleMutation = useMutation({
    mutationFn: (data: { roleId: number; role: RoleUpdateDto }) => 
      roleApi.update(data.roleId, data.role),
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "角色信息已更新",
      })
      setShowEditDialog(false)
      // 刷新角色列表
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error: Error) => {
      toast({
        title: "更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 删除角色的mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) => roleApi.delete(roleId),
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "角色已删除",
      })
      // 刷新角色列表
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error: Error) => {
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 获取角色详情的查询
  const getRoleDetail = async (roleId: number) => {
    try {
      const data = await roleApi.getDetail(roleId)
      setCurrentRole(data)
      setSelectedMenuIds(data.menu_ids || [])
      return data
    } catch (error) {
      console.error("获取角色详情失败", error)
      toast({
        title: "获取角色详情失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 过滤角色列表
  const filteredRoles = React.useMemo(() => {
    let result = roles

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(
        (role) =>
          role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.role_key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 状态过滤
    if (statusFilter !== "all") {
      result = result.filter((role) => role.status === statusFilter)
    }

    return result
  }, [roles, searchTerm, statusFilter])

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 添加角色
  const handleAddRole = async () => {
    if (!newRole.role_name || !newRole.role_key) {
      toast({
        title: "请完善必填信息",
        description: "角色名称和权限标识为必填项",
        variant: "destructive",
      })
      return
    }

    addRoleMutation.mutate({
      ...newRole,
      menu_ids: selectedMenuIds
    } as RoleCreateDto)
  }

  // 编辑角色
  const handleEditRole = async () => {
    if (!currentRole || !currentRole.role_name || !currentRole.role_key) {
      toast({
        title: "请完善必填信息",
        description: "角色名称和权限标识为必填项",
        variant: "destructive",
      })
      return
    }

    updateRoleMutation.mutate({
      roleId: currentRole.role_id,
      role: {
        ...currentRole,
        menu_ids: selectedMenuIds
      } as RoleUpdateDto
    })
  }

  // 删除角色
  const handleDeleteRole = async (id: number) => {
    if (!confirm("确定要删除此角色吗？")) {
      return
    }
    deleteRoleMutation.mutate(id)
  }

  // 打开编辑对话框
  const openEditDialog = async (role: Role) => {
    await getRoleDetail(role.role_id)
    setShowEditDialog(true)
  }

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    if (status === "0") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">禁用</Badge>
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">角色管理</h2>
            <p className="text-muted-foreground">
              管理系统角色和权限分配
            </p>
          </div>
        </div>

        {/* 搜索和操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="搜索角色名称或权限标识..."
              value={searchTerm}
              onChange={handleSearch}
              className="h-8 w-[150px] lg:w-[250px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="所有状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="0">正常</SelectItem>
                <SelectItem value="1">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8">
                  <Plus className="mr-2 h-4 w-4" />
                  添加角色
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>添加新角色</DialogTitle>
                  <DialogDescription>
                    创建新角色并配置权限
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role_name" className="text-right">
                      角色名称 *
                    </Label>
                    <Input
                      id="role_name"
                      value={newRole.role_name}
                      onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role_key" className="text-right">
                      权限标识 *
                    </Label>
                    <Input
                      id="role_key"
                      value={newRole.role_key}
                      onChange={(e) => setNewRole({ ...newRole, role_key: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role_sort" className="text-right">
                      显示顺序
                    </Label>
                    <Input
                      id="role_sort"
                      type="number"
                      value={newRole.role_sort?.toString()}
                      onChange={(e) => setNewRole({ ...newRole, role_sort: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      状态
                    </Label>
                    <Select 
                      value={newRole.status} 
                      onValueChange={(value) => setNewRole({ ...newRole, status: value })}
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
                    <Label htmlFor="remark" className="text-right pt-2">
                      备注
                    </Label>
                    <Textarea
                      id="remark"
                      value={newRole.remark || ""}
                      onChange={(e) => setNewRole({ ...newRole, remark: e.target.value })}
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                      菜单权限
                    </Label>
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
                        <p className="text-muted-foreground text-sm">加载菜单树中...</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAddRole} 
                    disabled={!newRole.role_name || !newRole.role_key}
                  >
                    确认添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 表格 */}
        <div className="rounded-md border">
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          ) : (
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>角色名称</TableHead>
                    <TableHead>权限标识</TableHead>
                    <TableHead>显示顺序</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="hidden md:table-cell">创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        没有找到符合条件的角色
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => (
                      <TableRow key={role.role_id}>
                        <TableCell className="font-medium">{role.role_name}</TableCell>
                        <TableCell>{role.role_key}</TableCell>
                        <TableCell>{role.role_sort}</TableCell>
                        <TableCell>{renderStatusBadge(role.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(role.create_time).toLocaleString('zh-CN', {
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
                              <DropdownMenuItem onClick={() => openEditDialog(role)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(role.role_id.toString())}>
                                <Copy className="mr-2 h-4 w-4" />
                                复制ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteRole(role.role_id)}
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
            )}
        </div>

      {/* 编辑角色对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
            <DialogDescription>
              修改角色信息和权限配置
            </DialogDescription>
          </DialogHeader>
          {currentRole && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role-name" className="text-right">
                  角色名称 *
                </Label>
                <Input
                  id="edit-role-name"
                  value={currentRole.role_name}
                  onChange={(e) => setCurrentRole({ ...currentRole, role_name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role-key" className="text-right">
                  权限标识 *
                </Label>
                <Input
                  id="edit-role-key"
                  value={currentRole.role_key}
                  onChange={(e) => setCurrentRole({ ...currentRole, role_key: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role-sort" className="text-right">
                  显示顺序
                </Label>
                <Input
                  id="edit-role-sort"
                  type="number"
                  value={currentRole.role_sort.toString()}
                  onChange={(e) => setCurrentRole({ ...currentRole, role_sort: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  状态
                </Label>
                <Select 
                  value={currentRole.status} 
                  onValueChange={(value) => setCurrentRole({ ...currentRole, status: value })}
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
                <Label htmlFor="edit-remark" className="text-right pt-2">
                  备注
                </Label>
                <Textarea
                  id="edit-remark"
                  value={currentRole.remark || ""}
                  onChange={(e) => setCurrentRole({ ...currentRole, remark: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  菜单权限
                </Label>
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
                    <p className="text-muted-foreground text-sm">加载菜单树中...</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button 
              onClick={handleEditRole} 
              disabled={!currentRole || !currentRole.role_name || !currentRole.role_key}
            >
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
} 