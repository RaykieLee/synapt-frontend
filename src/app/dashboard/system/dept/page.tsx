"use client"

import * as React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Folder, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash 
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 导入类型和API服务
import { Dept, DeptCreateDto, DeptUpdateDto } from "@/types/dept"
import { deptApi } from "@/api/dept"

export default function DeptPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentDept, setCurrentDept] = useState<Dept | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  
  // 新部门默认值
  const [newDept, setNewDept] = useState<Partial<DeptCreateDto>>({
    parent_id: 0,
    dept_name: "",
    order_num: 0,
    leader: "",
    phone: "",
    email: "",
    status: "0"
  })

  // 获取部门树结构
  const { data: depts = [], isLoading: isLoadingTree } = useQuery<Dept[]>({
    queryKey: ['deptTree'],
    queryFn: () => deptApi.getTree(),
    staleTime: 5, // 5秒不重新获取数据
  })
  
  // 获取部门列表（扁平结构，用于搜索和筛选）
  const { data: deptList = [] } = useQuery<Dept[]>({
    queryKey: ['deptList'],
    queryFn: () => deptApi.getList(),
    staleTime: 5, // 5秒不重新获取数据
  })

  // 添加部门的mutation
  const addDeptMutation = useMutation({
    mutationFn: (dept: DeptCreateDto) => deptApi.create(dept),
    onSuccess: () => {
      toast({
        title: "添加成功",
        description: "部门已成功添加",
      })
      setShowAddDialog(false)
      // 重置表单
      setNewDept({
        parent_id: 0,
        dept_name: "",
        order_num: 0,
        leader: "",
        phone: "",
        email: "",
        status: "0"
      })
      // 刷新部门列表
      queryClient.invalidateQueries({ queryKey: ['deptTree'] })
      queryClient.invalidateQueries({ queryKey: ['deptList'] })
    },
    onError: (error: Error) => {
      toast({
        title: "添加失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 修改部门的mutation
  const updateDeptMutation = useMutation({
    mutationFn: (data: { deptId: number; dept: DeptUpdateDto }) => 
      deptApi.update(data.deptId, data.dept),
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "部门信息已更新",
      })
      setShowEditDialog(false)
      // 刷新部门列表
      queryClient.invalidateQueries({ queryKey: ['deptTree'] })
      queryClient.invalidateQueries({ queryKey: ['deptList'] })
    },
    onError: (error: Error) => {
      toast({
        title: "更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 删除部门的mutation
  const deleteDeptMutation = useMutation({
    mutationFn: (deptId: number) => deptApi.delete(deptId),
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "部门已删除",
      })
      // 刷新部门列表
      queryClient.invalidateQueries({ queryKey: ['deptTree'] })
      queryClient.invalidateQueries({ queryKey: ['deptList'] })
    },
    onError: (error: Error) => {
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    }
  })

  // 获取部门详情
  const getDeptDetail = async (deptId: number) => {
    try {
      const data = await deptApi.getDetail(deptId)
      setCurrentDept(data)
      return data
    } catch (error) {
      console.error("获取部门详情失败", error)
      toast({
        title: "获取部门详情失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 添加部门
  const handleAddDept = async () => {
    if (!newDept.dept_name) {
      toast({
        title: "请完善必填信息",
        description: "部门名称为必填项",
        variant: "destructive",
      })
      return
    }

    addDeptMutation.mutate(newDept as DeptCreateDto)
  }

  // 编辑部门
  const handleUpdateDept = async () => {
    if (!currentDept || !currentDept.dept_name) {
      toast({
        title: "请完善必填信息",
        description: "部门名称为必填项",
        variant: "destructive",
      })
      return
    }

    updateDeptMutation.mutate({
      deptId: currentDept.dept_id,
      dept: {
        dept_id: currentDept.dept_id,
        parent_id: currentDept.parent_id,
        dept_name: currentDept.dept_name,
        order_num: currentDept.order_num,
        leader: currentDept.leader,
        phone: currentDept.phone,
        email: currentDept.email,
        status: currentDept.status
      }
    })
  }

  // 删除部门
  const handleDeleteDept = async (deptId: number) => {
    if (!confirm("确定要删除此部门吗？删除后不可恢复，且会同时删除所有下级部门。")) {
      return
    }
    deleteDeptMutation.mutate(deptId)
  }

  // 打开编辑对话框
  const openEditDialog = async (dept: Dept) => {
    await getDeptDetail(dept.dept_id)
    setShowEditDialog(true)
  }

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 展开/折叠部门树
  const toggleExpand = (deptId: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(deptId)) {
      newExpandedRows.delete(deptId)
    } else {
      newExpandedRows.add(deptId)
    }
    setExpandedRows(newExpandedRows)
  }
  
  // 获取子部门
  const getChildDepts = (deptId: number): Dept[] => {
    return deptList.filter(dept => dept.parent_id === deptId)
  }

  // 获取部门路径
  const getDeptPath = (dept: Dept) => {
    if (!dept.ancestors || dept.ancestors === "0") {
      return dept.dept_name
    }
    
    const ancestorIds = dept.ancestors.split(",").map(id => parseInt(id))
    const path = ancestorIds
      .map(id => {
        const ancestor = deptList.find(d => d.dept_id === id)
        return ancestor ? ancestor.dept_name : null
      })
      .filter(Boolean)
      .join(" / ")
    
    return path + " / " + dept.dept_name
  }

  // 渲染部门树结构
  const renderDeptTree = (depts: Dept[], level = 0): React.ReactNode => {
    return depts.map(dept => {
      const children = getChildDepts(dept.dept_id)
      const hasChildren = children.length > 0
      const isExpanded = expandedRows.has(dept.dept_id)
      
      // 过滤掉不匹配的部门
      if (searchTerm && !dept.dept_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        // 但如果子部门中有匹配项，仍需显示该部门
        const hasMatchingChildren = children.some(child => 
          child.dept_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        if (!hasMatchingChildren) return null
      }
      
      // 按状态过滤
      if (statusFilter !== "all" && dept.status !== statusFilter) {
        return null
      }
      
      return (
        <React.Fragment key={dept.dept_id}>
          <TableRow>
            <TableCell className="font-medium">
              <div 
                className="flex items-center" 
                style={{ paddingLeft: `${level * 20}px` }}
              >
                {hasChildren && (
                  <button 
                    onClick={() => toggleExpand(dept.dept_id)}
                    className="mr-1 p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </button>
                )}
                {!hasChildren && <div className="w-6" />}
                <Folder className="h-4 w-4 text-blue-500 mr-2" />
                {dept.dept_name}
              </div>
            </TableCell>
            <TableCell>{dept.order_num}</TableCell>
            <TableCell>{dept.leader || "-"}</TableCell>
            <TableCell>{dept.phone || "-"}</TableCell>
            <TableCell>
              {dept.status === "0" ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">正常</Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">停用</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(dept)}>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setNewDept({
                        ...newDept,
                        parent_id: dept.dept_id
                      })
                      setShowAddDialog(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    添加子部门
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleDeleteDept(dept.dept_id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          {isExpanded && hasChildren && renderDeptTree(children, level + 1)}
        </React.Fragment>
      )
    }).filter(Boolean)
  }

  // 获取部门选项（用于添加/编辑部门时选择上级部门）
  const getDeptOptions = () => {
    return [
      { id: 0, name: "作为顶级部门" },
      ...deptList.map(dept => ({
        id: dept.dept_id,
        name: getDeptPath(dept)
      }))
    ]
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">部门管理</h2>
          <p className="text-muted-foreground">
            管理公司的组织架构和部门信息
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索部门名称..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-8"
                />
              </div>
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
                  添加部门
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>添加部门</DialogTitle>
                  <DialogDescription>
                    创建新的组织部门
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parent-dept" className="text-right">
                      上级部门
                    </Label>
                    <Select 
                      value={newDept.parent_id?.toString()} 
                      onValueChange={(value) => setNewDept({ ...newDept, parent_id: parseInt(value) })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择上级部门" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDeptOptions().map(dept => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dept-name" className="text-right">
                      部门名称 *
                    </Label>
                    <Input
                      id="dept-name"
                      value={newDept.dept_name}
                      onChange={(e) => setNewDept({ ...newDept, dept_name: e.target.value })}
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
                      value={newDept.order_num?.toString()}
                      onChange={(e) => setNewDept({ ...newDept, order_num: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="leader" className="text-right">
                      负责人
                    </Label>
                    <Input
                      id="leader"
                      value={newDept.leader || ""}
                      onChange={(e) => setNewDept({ ...newDept, leader: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      联系电话
                    </Label>
                    <Input
                      id="phone"
                      value={newDept.phone || ""}
                      onChange={(e) => setNewDept({ ...newDept, phone: e.target.value })}
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
                      value={newDept.email || ""}
                      onChange={(e) => setNewDept({ ...newDept, email: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      状态
                    </Label>
                    <Select 
                      value={newDept.status} 
                      onValueChange={(value) => setNewDept({ ...newDept, status: value })}
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
                    onClick={handleAddDept} 
                    disabled={!newDept.dept_name}
                  >
                    确认添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTree ? (
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
                  <TableHead>部门名称</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>联系电话</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderDeptTree(depts.filter(dept => dept.parent_id === 0))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 编辑部门对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑部门</DialogTitle>
            <DialogDescription>
              修改部门信息
            </DialogDescription>
          </DialogHeader>
          {currentDept && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-parent-dept" className="text-right">
                  上级部门
                </Label>
                <Select 
                  value={currentDept.parent_id.toString()} 
                  onValueChange={(value) => setCurrentDept({ ...currentDept, parent_id: parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择上级部门" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDeptOptions()
                      .filter(dept => dept.id !== currentDept.dept_id) // 排除自身
                      .map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-dept-name" className="text-right">
                  部门名称 *
                </Label>
                <Input
                  id="edit-dept-name"
                  value={currentDept.dept_name}
                  onChange={(e) => setCurrentDept({ ...currentDept, dept_name: e.target.value })}
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
                  value={currentDept.order_num.toString()}
                  onChange={(e) => setCurrentDept({ ...currentDept, order_num: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-leader" className="text-right">
                  负责人
                </Label>
                <Input
                  id="edit-leader"
                  value={currentDept.leader || ""}
                  onChange={(e) => setCurrentDept({ ...currentDept, leader: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  联系电话
                </Label>
                <Input
                  id="edit-phone"
                  value={currentDept.phone || ""}
                  onChange={(e) => setCurrentDept({ ...currentDept, phone: e.target.value })}
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
                  value={currentDept.email || ""}
                  onChange={(e) => setCurrentDept({ ...currentDept, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  状态
                </Label>
                <Select 
                  value={currentDept.status} 
                  onValueChange={(value) => setCurrentDept({ ...currentDept, status: value })}
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
              onClick={handleUpdateDept} 
              disabled={!currentDept || !currentDept.dept_name}
            >
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 