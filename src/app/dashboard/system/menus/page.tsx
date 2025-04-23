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

// 导入类型和API服务
import { Menu, MenuCreateDto, MenuUpdateDto, ParentMenu } from "@/types/menu"
import { menuApi } from "@/api/menu"

export default function MenusPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null)
  
  // 新菜单默认值
  const [newMenu, setNewMenu] = useState<Partial<MenuCreateDto>>({
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

  // 获取菜单列表查询
  const { data: menus = [], isLoading } = useQuery<Menu[]>({
    queryKey: ['menus'],
    queryFn: () => menuApi.getList(),
    staleTime: 1000 * 60 * 5, // 5分钟内不重新获取数据
  })
  
  // 生成父菜单选项
  const parentMenus = React.useMemo(() => {
    const parentOptions = [{ id: 0, name: "作为一级菜单" }]
    menus
      .filter((menu: Menu) => menu.menu_type !== "F") // 排除按钮类型
      .forEach((menu: Menu) => {
        parentOptions.push({ id: menu.menu_id, name: menu.menu_name })
      })
    return parentOptions
  }, [menus])

  // 添加菜单的mutation
  const addMenuMutation = useMutation({
    mutationFn: (menu: MenuCreateDto) => menuApi.create(menu),
    onSuccess: () => {
      toast({
        title: "添加成功",
        description: "菜单已成功添加",
      })
      setShowAddDialog(false)
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
      // 刷新菜单列表
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
    onError: (error: Error) => {
      toast({
        title: "添加失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 修改菜单的mutation
  const updateMenuMutation = useMutation({
    mutationFn: (data: { menuId: number; menu: MenuUpdateDto }) => 
      menuApi.update(data.menuId, data.menu),
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "菜单信息已更新",
      })
      setShowEditDialog(false)
      // 刷新菜单列表
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
    onError: (error: Error) => {
      toast({
        title: "更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 删除菜单的mutation
  const deleteMenuMutation = useMutation({
    mutationFn: (menuId: number) => menuApi.delete(menuId),
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "菜单已删除",
      })
      // 刷新菜单列表
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
    onError: (error: Error) => {
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 获取菜单详情的查询
  const getMenuDetail = async (menuId: number) => {
    try {
      const data = await menuApi.getDetail(menuId)
      setCurrentMenu(data)
      return data
    } catch (error) {
      console.error("获取菜单详情失败", error)
      toast({
        title: "获取菜单详情失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 过滤菜单列表
  const filteredMenus = React.useMemo(() => {
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

    return result
  }, [menus, searchTerm, statusFilter])

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 添加菜单
  const handleAddMenu = async () => {
    if (!newMenu.menu_name) {
      toast({
        title: "请完善必填信息",
        description: "菜单名称为必填项",
        variant: "destructive",
      })
      return
    }

    addMenuMutation.mutate(newMenu as MenuCreateDto)
  }

  // 打开编辑对话框
  const openEditDialog = async (menu: Menu) => {
    await getMenuDetail(menu.menu_id)
    setShowEditDialog(true)
  }

  // 编辑菜单
  const handleEditMenu = async () => {
    if (!currentMenu || !currentMenu.menu_name) {
      toast({
        title: "请完善必填信息",
        description: "菜单名称为必填项",
        variant: "destructive",
      })
      return
    }

    updateMenuMutation.mutate({
      menuId: currentMenu.menu_id,
      menu: currentMenu as MenuUpdateDto
    })
  }

  // 删除菜单
  const handleDeleteMenu = async (id: number) => {
    if (!confirm("确定要删除此菜单吗？删除后不可恢复。")) {
      return
    }
    deleteMenuMutation.mutate(id)
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
                      onChange={(e) => setNewMenu({ ...newMenu, menu_name: e.target.value })}
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
                      onChange={(e) => setNewMenu({ ...newMenu, order_num: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                    />
                  </div>
                  {newMenu.menu_type !== "F" && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="path" className="text-right">
                          路由地址
                        </Label>
                        <Input
                          id="path"
                          value={newMenu.path}
                          onChange={(e) => setNewMenu({ ...newMenu, path: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      {newMenu.menu_type === "C" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="component" className="text-right">
                            组件路径
                          </Label>
                          <Input
                            id="component"
                            value={newMenu.component || ""}
                            onChange={(e) => setNewMenu({ ...newMenu, component: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      )}
                    </>
                  )}
                  {newMenu.menu_type === "F" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="perms" className="text-right">
                        权限标识
                      </Label>
                      <Input
                        id="perms"
                        value={newMenu.perms || ""}
                        onChange={(e) => setNewMenu({ ...newMenu, perms: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      状态
                    </Label>
                    <Select 
                      value={newMenu.status} 
                      onValueChange={(value) => setNewMenu({ ...newMenu, status: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">正常</SelectItem>
                        <SelectItem value="1">停用</SelectItem>
                      </SelectContent>
                    </Select>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>菜单名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>权限标识</TableHead>
                  <TableHead>路径</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      没有找到符合条件的菜单
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMenus.map((menu) => (
                    <TableRow key={menu.menu_id}>
                      <TableCell className="font-medium">
                        <span className="ml-2">{menu.menu_name}</span>
                      </TableCell>
                      <TableCell>{renderMenuType(menu.menu_type)}</TableCell>
                      <TableCell>{menu.order_num}</TableCell>
                      <TableCell>{menu.perms || "-"}</TableCell>
                      <TableCell>{menu.path || "-"}</TableCell>
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
                    {parentMenus.map(menu => (
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
                  onChange={(e) => setCurrentMenu({ ...currentMenu, menu_name: e.target.value })}
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
                  onChange={(e) => setCurrentMenu({ ...currentMenu, order_num: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              {currentMenu.menu_type !== "F" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-path" className="text-right">
                      路由地址
                    </Label>
                    <Input
                      id="edit-path"
                      value={currentMenu.path}
                      onChange={(e) => setCurrentMenu({ ...currentMenu, path: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  {currentMenu.menu_type === "C" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-component" className="text-right">
                        组件路径
                      </Label>
                      <Input
                        id="edit-component"
                        value={currentMenu.component || ""}
                        onChange={(e) => setCurrentMenu({ ...currentMenu, component: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  )}
                </>
              )}
              {currentMenu.menu_type === "F" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-perms" className="text-right">
                    权限标识
                  </Label>
                  <Input
                    id="edit-perms"
                    value={currentMenu.perms || ""}
                    onChange={(e) => setCurrentMenu({ ...currentMenu, perms: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  状态
                </Label>
                <Select 
                  value={currentMenu.status} 
                  onValueChange={(value) => setCurrentMenu({ ...currentMenu, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">正常</SelectItem>
                    <SelectItem value="1">停用</SelectItem>
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