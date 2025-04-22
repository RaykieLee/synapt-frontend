"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
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
} from "@/components/ui/dialog"
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
import { Copy, Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

// 菜单类型定义
interface Menu {
  menu_id: number
  menu_name: string
  parent_id: number
  order_num: number
  path: string
  component?: string
  query?: string
  is_frame: number
  is_cache: number
  menu_type: string
  visible: string
  status: string
  perms?: string
  icon: string
  create_time: string
  update_time: string
  remark?: string
  children?: Menu[]
}

export default function MenusPage() {
  // 状态管理
  const { toast } = useToast()
  const [menus, setMenus] = useState<Menu[]>([])
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null)
  const [parentMenus, setParentMenus] = useState<{ id: number, name: string }[]>([])
  
  // 新菜单默认值
  const [newMenu, setNewMenu] = useState<Partial<Menu>>({
    menu_name: "",
    parent_id: 0,
    order_num: 0,
    path: "",
    component: "",
    is_frame: 1,
    is_cache: 0,
    menu_type: "M",
    visible: "0",
    status: "0",
    perms: "",
    icon: "#",
    remark: ""
  })

  // 获取认证令牌
  const getToken = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        title: "认证失败",
        description: "请重新登录",
        variant: "destructive",
      })
      throw new Error("认证失败")
    }
    return token
  }

  // 获取所有菜单
  const fetchMenus = async () => {
    try {
      setIsLoading(true)
      const token = getToken()
      
      const response = await fetch("/api/system/menu/list", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.status === 401) {
        toast({
          title: "认证失败",
          description: "请重新登录",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      
      if (data.code === 200) {
        setMenus(data.data)
        setFilteredMenus(data.data)
        
        // 生成父菜单选项
        const parentOptions = [{ id: 0, name: "作为一级菜单" }]
        data.data
          .filter((menu: Menu) => menu.menu_type !== "F") // 排除按钮类型
          .forEach((menu: Menu) => {
            parentOptions.push({ id: menu.menu_id, name: menu.menu_name })
          })
        setParentMenus(parentOptions)
        
        // 获取菜单树结构
        fetchMenuTree()
      } else {
        toast({
          title: "获取菜单失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取菜单失败",
        description: error instanceof Error ? error.message : "请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取菜单树
  const fetchMenuTree = async () => {
    try {
      const token = getToken()
      
      const response = await fetch("/api/system/menu/tree", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.status === 401) {
        toast({
          title: "认证失败",
          description: "请重新登录",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      
      if (data.code !== 200) {
        toast({
          title: "获取菜单树失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取菜单树失败",
        description: error instanceof Error ? error.message : "请检查网络连接",
        variant: "destructive",
      })
    }
  }

  // 获取菜单详情
  const fetchMenuDetail = async (menuId: number) => {
    try {
      const token = getToken()
      
      const response = await fetch(`/api/system/menu/${menuId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.status === 401) {
        toast({
          title: "认证失败",
          description: "请重新登录",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      
      if (data.code === 200) {
        setCurrentMenu(data.data)
      } else {
        toast({
          title: "获取菜单详情失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取菜单详情失败",
        description: error instanceof Error ? error.message : "请检查网络连接",
        variant: "destructive",
      })
    }
  }

  // 初始加载数据
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchMenus()
  }, [])

  // 处理搜索和筛选
  useEffect(() => {
    let result = menus

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(
        (menu) =>
          menu.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (menu.perms && menu.perms.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 状态过滤
    if (statusFilter !== "all") {
      result = result.filter((menu) => menu.status === statusFilter)
    }

    setFilteredMenus(result)
  }, [menus, searchTerm, statusFilter])

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 添加菜单
  const handleAddMenu = async () => {
    try {
      if (!newMenu.menu_name) {
        toast({
          title: "请完善必填信息",
          description: "菜单名称为必填项",
          variant: "destructive",
        })
        return
      }

      const token = getToken()
      
      const response = await fetch("/api/system/menu", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newMenu)
      })
      
      const data = await response.json()
      
      if (data.code === 200) {
        toast({
          title: "添加成功",
          description: "菜单已成功添加",
        })
        
        // 重置表单
        setNewMenu({
          menu_name: "",
          parent_id: 0,
          order_num: 0,
          path: "",
          component: "",
          is_frame: 1,
          is_cache: 0,
          menu_type: "M",
          visible: "0",
          status: "0",
          perms: "",
          icon: "#",
          remark: ""
        })
        setShowAddDialog(false)
        
        // 刷新菜单列表
        fetchMenus()
      } else {
        toast({
          title: "添加失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "添加失败",
        description: error instanceof Error ? error.message : "请检查网络连接",
        variant: "destructive",
      })
    }
  }

  // 打开编辑对话框
  const openEditDialog = async (menu: Menu) => {
    await fetchMenuDetail(menu.menu_id)
    setShowEditDialog(true)
  }

  // 编辑菜单
  const handleEditMenu = async () => {
    try {
      if (!currentMenu || !currentMenu.menu_name) {
        toast({
          title: "请完善必填信息",
          description: "菜单名称为必填项",
          variant: "destructive",
        })
        return
      }

      const token = getToken()
      
      const response = await fetch(`/api/system/menu/${currentMenu.menu_id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(currentMenu)
      })
      
      const data = await response.json()
      
      if (data.code === 200) {
        toast({
          title: "更新成功",
          description: "菜单信息已更新",
        })
        
        setShowEditDialog(false)
        
        // 刷新菜单列表
        fetchMenus()
      } else {
        toast({
          title: "更新失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "请检查网络连接",
        variant: "destructive",
      })
    }
  }

  // 删除菜单
  const handleDeleteMenu = async (id: number) => {
    try {
      if (!confirm("确定要删除此菜单吗？删除后不可恢复。")) {
        return
      }

      const token = getToken()
      
      const response = await fetch(`/api/system/menu/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      const data = await response.json()
      
      if (data.code === 200) {
        toast({
          title: "删除成功",
          description: "菜单已删除",
        })
        
        // 刷新菜单列表
        fetchMenus()
      } else {
        toast({
          title: "删除失败",
          description: data.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "请检查网络连接",
        variant: "destructive",
      })
    }
  }

  // 渲染菜单类型
  const renderMenuType = (type: string) => {
    switch (type) {
      case "M":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">目录</Badge>
      case "C":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">菜单</Badge>
      case "F":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">按钮</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // 渲染状态徽章
  const renderStatusBadge = (status: string) => {
    if (status === "0") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">停用</Badge>
  }

  // 渲染可见性
  const renderVisibleBadge = (visible: string) => {
    if (visible === "0") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">显示</Badge>
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">隐藏</Badge>
  }

  // 获取父菜单名称
  const getParentMenuName = (parentId: number) => {
    if (parentId === 0) return "无";
    
    const parent = menus.find(menu => menu.menu_id === parentId);
    return parent ? parent.menu_name : `ID: ${parentId}`;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">菜单管理</h2>
          <p className="text-muted-foreground">
            管理系统菜单和权限配置
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="搜索菜单名称或权限标识..."
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
                  <SelectItem value="1">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加菜单
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>添加菜单</DialogTitle>
                  <DialogDescription>
                    创建新的系统菜单
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="menu-type" className="text-right">
                      菜单类型 *
                    </Label>
                    <Select 
                      value={newMenu.menu_type} 
                      onValueChange={(value) => {
                        setNewMenu({ 
                          ...newMenu, 
                          menu_type: value,
                          // 重置与类型相关的字段
                          path: value === "F" ? "" : newMenu.path,
                          component: value === "F" ? "" : newMenu.component
                        })
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择菜单类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">目录</SelectItem>
                        <SelectItem value="C">菜单</SelectItem>
                        <SelectItem value="F">按钮</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parent-menu" className="text-right">
                      上级菜单
                    </Label>
                    <Select 
                      value={newMenu.parent_id?.toString()} 
                      onValueChange={(value) => setNewMenu({ ...newMenu, parent_id: parseInt(value) })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择上级菜单" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentMenus.map(menu => (
                          <SelectItem key={menu.id} value={menu.id.toString()}>
                            {menu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="menu-name" className="text-right">
                      菜单名称 *
                    </Label>
                    <Input
                      id="menu-name"
                      value={newMenu.menu_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMenu({ ...newMenu, menu_name: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="order-num" className="text-right">
                      显示顺序
                    </Label>
                    <Input
                      id="order-num"
                      type="number"
                      value={newMenu.order_num?.toString()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMenu({ ...newMenu, order_num: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                    />
                  </div>
                  {newMenu.menu_type !== "F" && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">
                          图标
                        </Label>
                        <Input
                          id="icon"
                          value={newMenu.icon}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMenu({ ...newMenu, icon: e.target.value })}
                          className="col-span-3"
                          placeholder="输入图标类名或符号"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="path" className="text-right">
                          路由地址
                        </Label>
                        <Input
                          id="path"
                          value={newMenu.path}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMenu({ ...newMenu, path: e.target.value })}
                          className="col-span-3"
                          placeholder={newMenu.menu_type === "M" ? "例如: system" : "例如: user"}
                        />
                      </div>
                    </>
                  )}
                  
                  {newMenu.menu_type === "C" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="component" className="text-right">
                        组件路径
                      </Label>
                      <Input
                        id="component"
                        value={newMenu.component}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMenu({ ...newMenu, component: e.target.value })}
                        className="col-span-3"
                        placeholder="例如: system/user/index"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="perms" className="text-right">
                      权限标识
                    </Label>
                    <Input
                      id="perms"
                      value={newMenu.perms}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMenu({ ...newMenu, perms: e.target.value })}
                      className="col-span-3"
                      placeholder={newMenu.menu_type === "F" ? "例如: system:user:add" : ""}
                    />
                  </div>
                  
                  {newMenu.menu_type !== "F" && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                          显示状态
                        </Label>
                        <Select 
                          value={newMenu.visible} 
                          onValueChange={(value) => setNewMenu({ ...newMenu, visible: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="选择显示状态" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">显示</SelectItem>
                            <SelectItem value="1">隐藏</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                          菜单状态
                        </Label>
                        <Select 
                          value={newMenu.status} 
                          onValueChange={(value) => setNewMenu({ ...newMenu, status: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="选择菜单状态" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">正常</SelectItem>
                            <SelectItem value="1">停用</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="remark" className="text-right pt-2">
                      备注
                    </Label>
                    <Textarea
                      id="remark"
                      value={newMenu.remark || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMenu({ ...newMenu, remark: e.target.value })}
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAddMenu}
                    disabled={!newMenu.menu_name}
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
                    <TableHead>菜单名称</TableHead>
                    <TableHead>图标</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>权限标识</TableHead>
                    <TableHead>路径</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        没有找到符合条件的菜单
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMenus.map((menu) => (
                      <TableRow key={menu.menu_id}>
                        <TableCell className="font-medium">{menu.menu_name}</TableCell>
                        <TableCell>{menu.icon}</TableCell>
                        <TableCell>{menu.order_num}</TableCell>
                        <TableCell>{menu.perms || '-'}</TableCell>
                        <TableCell>{menu.path || '-'}</TableCell>
                        <TableCell>{renderMenuType(menu.menu_type)}</TableCell>
                        <TableCell>{renderStatusBadge(menu.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(menu)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(menu.menu_id.toString())}>
                                <Copy className="mr-2 h-4 w-4" />
                                复制ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteMenu(menu.menu_id)}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* 编辑菜单对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑菜单</DialogTitle>
            <DialogDescription>
              修改菜单信息
            </DialogDescription>
          </DialogHeader>
          {currentMenu && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-menu-type" className="text-right">
                  菜单类型 *
                </Label>
                <Select 
                  value={currentMenu.menu_type} 
                  onValueChange={(value) => {
                    setCurrentMenu({ 
                      ...currentMenu, 
                      menu_type: value,
                      // 重置与类型相关的字段
                      path: value === "F" ? "" : currentMenu.path,
                      component: value === "F" ? "" : currentMenu.component
                    })
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择菜单类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">目录</SelectItem>
                    <SelectItem value="C">菜单</SelectItem>
                    <SelectItem value="F">按钮</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-parent-menu" className="text-right">
                  上级菜单
                </Label>
                <Select 
                  value={currentMenu.parent_id.toString()} 
                  onValueChange={(value) => setCurrentMenu({ ...currentMenu, parent_id: parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择上级菜单" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentMenus
                      .filter(menu => menu.id !== currentMenu.menu_id) // 防止选择自己为父菜单
                      .map(menu => (
                        <SelectItem key={menu.id} value={menu.id.toString()}>
                          {menu.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-menu-name" className="text-right">
                  菜单名称 *
                </Label>
                <Input
                  id="edit-menu-name"
                  value={currentMenu.menu_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentMenu({ ...currentMenu, menu_name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-order-num" className="text-right">
                  显示顺序
                </Label>
                <Input
                  id="edit-order-num"
                  type="number"
                  value={currentMenu.order_num.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentMenu({ ...currentMenu, order_num: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              {currentMenu.menu_type !== "F" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-icon" className="text-right">
                      图标
                    </Label>
                    <Input
                      id="edit-icon"
                      value={currentMenu.icon}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentMenu({ ...currentMenu, icon: e.target.value })}
                      className="col-span-3"
                      placeholder="输入图标类名或符号"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-path" className="text-right">
                      路由地址
                    </Label>
                    <Input
                      id="edit-path"
                      value={currentMenu.path}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentMenu({ ...currentMenu, path: e.target.value })}
                      className="col-span-3"
                      placeholder={currentMenu.menu_type === "M" ? "例如: system" : "例如: user"}
                    />
                  </div>
                </>
              )}
              
              {currentMenu.menu_type === "C" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-component" className="text-right">
                    组件路径
                  </Label>
                  <Input
                    id="edit-component"
                    value={currentMenu.component || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentMenu({ ...currentMenu, component: e.target.value })}
                    className="col-span-3"
                    placeholder="例如: system/user/index"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-perms" className="text-right">
                  权限标识
                </Label>
                <Input
                  id="edit-perms"
                  value={currentMenu.perms || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentMenu({ ...currentMenu, perms: e.target.value })}
                  className="col-span-3"
                  placeholder={currentMenu.menu_type === "F" ? "例如: system:user:add" : ""}
                />
              </div>
              
              {currentMenu.menu_type !== "F" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      显示状态
                    </Label>
                    <Select 
                      value={currentMenu.visible} 
                      onValueChange={(value) => setCurrentMenu({ ...currentMenu, visible: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择显示状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">显示</SelectItem>
                        <SelectItem value="1">隐藏</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      菜单状态
                    </Label>
                    <Select 
                      value={currentMenu.status} 
                      onValueChange={(value) => setCurrentMenu({ ...currentMenu, status: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择菜单状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">正常</SelectItem>
                        <SelectItem value="1">停用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-remark" className="text-right pt-2">
                  备注
                </Label>
                <Textarea
                  id="edit-remark"
                  value={currentMenu.remark || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentMenu({ ...currentMenu, remark: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button 
              onClick={handleEditMenu}
              disabled={!currentMenu || !currentMenu.menu_name}
            >
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 