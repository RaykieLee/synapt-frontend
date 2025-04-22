"use client"

import * as React from "react"
import { useState, useEffect } from "react"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// 部门类型定义
interface Dept {
  dept_id: number
  parent_id: number
  dept_name: string
  ancestors: string
  order_num: number
  leader: string
  phone: string
  email: string
  status: string
  create_time: string
  children?: Dept[]
}

export default function DeptPage() {
  const [depts, setDepts] = useState<Dept[]>([])
  const [deptList, setDeptList] = useState<Dept[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentDept, setCurrentDept] = useState<Dept | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  
  const [newDept, setNewDept] = useState({
    parent_id: 0,
    dept_name: "",
    order_num: 0,
    leader: "",
    phone: "",
    email: "",
    status: "0"
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

  // 初始化加载部门数据
  useEffect(() => {
    fetchDepts()
  }, [])

  // 获取部门树结构
  const fetchDepts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dept/tree`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.code === 200) {
        setDepts(result.data)
        // 同时获取扁平列表用于搜索和筛选
        fetchDeptList()
      } else {
        toast({
          title: "获取部门失败",
          description: result.msg || "未知错误",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("获取部门失败:", error)
      toast({
        title: "获取部门失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
      setDepts([])
    } finally {
      setIsLoading(false)
    }
  }

  // 获取部门列表（扁平结构）
  const fetchDeptList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dept/list`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.code === 200) {
        setDeptList(result.data)
      }
    } catch (error) {
      console.error("获取部门列表失败:", error)
    }
  }

  // 添加部门
  const addDept = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(newDept)
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.code === 200) {
        toast({
          title: "添加成功",
          description: "部门已成功添加"
        })
        setShowAddDialog(false)
        fetchDepts()
        
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
      } else {
        toast({
          title: "添加失败",
          description: result.msg || "未知错误",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("添加部门失败:", error)
      toast({
        title: "添加失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 更新部门
  const updateDept = async () => {
    if (!currentDept) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dept/${currentDept.dept_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          dept_id: currentDept.dept_id,
          parent_id: currentDept.parent_id,
          dept_name: currentDept.dept_name,
          order_num: currentDept.order_num,
          leader: currentDept.leader,
          phone: currentDept.phone,
          email: currentDept.email,
          status: currentDept.status
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.code === 200) {
        toast({
          title: "更新成功",
          description: "部门信息已更新"
        })
        setShowEditDialog(false)
        fetchDepts()
      } else {
        toast({
          title: "更新失败",
          description: result.msg || "未知错误",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("更新部门失败:", error)
      toast({
        title: "更新失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 删除部门
  const deleteDept = async (deptId: number) => {
    if (!window.confirm("确定要删除此部门吗？")) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dept/${deptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.code === 200) {
        toast({
          title: "删除成功",
          description: "部门已成功删除"
        })
        fetchDepts()
      } else {
        toast({
          title: "删除失败",
          description: result.msg || "未知错误",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("删除部门失败:", error)
      toast({
        title: "删除失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 搜索处理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 处理展开/折叠
  const toggleExpand = (deptId: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(deptId)) {
      newExpandedRows.delete(deptId)
    } else {
      newExpandedRows.add(deptId)
    }
    setExpandedRows(newExpandedRows)
  }

  // 获取当前部门的直接子部门
  const getChildDepts = (deptId: number) => {
    return deptList.filter(dept => dept.parent_id === deptId)
  }

  // 获取部门路径字符串（用于展示）
  const getDeptPath = (dept: Dept) => {
    if (!dept.ancestors || dept.ancestors === "0") {
      return dept.dept_name
    }
    
    const ancestorIds = dept.ancestors.split(",").filter(id => id !== "0")
    const path = ancestorIds.map(id => {
      const ancestorDept = deptList.find(d => d.dept_id === parseInt(id))
      return ancestorDept ? ancestorDept.dept_name : ""
    })
    
    return [...path, dept.dept_name].join(" / ")
  }

  // 递归渲染部门树
  const renderDeptTree = (depts: Dept[], level = 0) => {
    return depts.map(dept => (
      <React.Fragment key={dept.dept_id}>
        <TableRow>
          <TableCell className="font-medium">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {dept.children && dept.children.length > 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 mr-1"
                  onClick={() => toggleExpand(dept.dept_id)}
                >
                  {expandedRows.has(dept.dept_id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-5 mr-1"></div>
              )}
              <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
              {dept.dept_name}
            </div>
          </TableCell>
          <TableCell>{dept.leader || "-"}</TableCell>
          <TableCell>{dept.order_num}</TableCell>
          <TableCell>{dept.phone || "-"}</TableCell>
          <TableCell>
            <Badge variant={dept.status === "0" ? "outline" : "secondary"}>
              {dept.status === "0" ? "正常" : "停用"}
            </Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">操作</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentDept(dept)
                    setShowEditDialog(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
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
                  <Plus className="h-4 w-4 mr-2" />
                  添加子部门
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => deleteDept(dept.dept_id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        
        {/* 如果展开了，渲染子部门 */}
        {expandedRows.has(dept.dept_id) && dept.children && dept.children.length > 0 && renderDeptTree(dept.children, level + 1)}
      </React.Fragment>
    ))
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">部门管理</h2>
          <p className="text-muted-foreground">
            管理系统部门结构和层级关系
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="搜索部门名称..."
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
            <Button
              onClick={() => {
                setNewDept({
                  parent_id: 0,
                  dept_name: "",
                  order_num: 0,
                  leader: "",
                  phone: "",
                  email: "",
                  status: "0"
                })
                setShowAddDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              新增部门
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>部门名称</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>联系电话</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">加载中...</TableCell>
                </TableRow>
              ) : depts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">暂无数据</TableCell>
                </TableRow>
              ) : (
                renderDeptTree(depts)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 添加部门对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加部门</DialogTitle>
            <DialogDescription>
              添加新的部门信息，带 * 的字段为必填项
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parentDept" className="text-right">
                上级部门
              </Label>
              <Select
                value={String(newDept.parent_id)}
                onValueChange={(value) => setNewDept({...newDept, parent_id: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="请选择上级部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">作为一级部门</SelectItem>
                  {deptList.map(dept => (
                    <SelectItem key={dept.dept_id} value={String(dept.dept_id)}>
                      {getDeptPath(dept)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deptName" className="text-right">
                部门名称 *
              </Label>
              <Input
                id="deptName"
                className="col-span-3"
                value={newDept.dept_name}
                onChange={(e) => setNewDept({...newDept, dept_name: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orderNum" className="text-right">
                显示排序
              </Label>
              <Input
                id="orderNum"
                type="number"
                className="col-span-3"
                value={newDept.order_num}
                onChange={(e) => setNewDept({...newDept, order_num: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leader" className="text-right">
                负责人
              </Label>
              <Input
                id="leader"
                className="col-span-3"
                value={newDept.leader}
                onChange={(e) => setNewDept({...newDept, leader: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                联系电话
              </Label>
              <Input
                id="phone"
                className="col-span-3"
                value={newDept.phone}
                onChange={(e) => setNewDept({...newDept, phone: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                邮箱
              </Label>
              <Input
                id="email"
                className="col-span-3"
                value={newDept.email}
                onChange={(e) => setNewDept({...newDept, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                部门状态
              </Label>
              <Select
                value={newDept.status}
                onValueChange={(value) => setNewDept({...newDept, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="请选择部门状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">正常</SelectItem>
                  <SelectItem value="1">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={addDept} disabled={!newDept.dept_name}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑部门对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑部门</DialogTitle>
            <DialogDescription>
              修改部门信息，带 * 的字段为必填项
            </DialogDescription>
          </DialogHeader>
          {currentDept && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editParentDept" className="text-right">
                  上级部门
                </Label>
                <Select
                  value={String(currentDept.parent_id)}
                  onValueChange={(value) => setCurrentDept({...currentDept, parent_id: parseInt(value)})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="请选择上级部门" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">作为一级部门</SelectItem>
                    {deptList
                      .filter(dept => dept.dept_id !== currentDept.dept_id)
                      .map(dept => (
                        <SelectItem key={dept.dept_id} value={String(dept.dept_id)}>
                          {getDeptPath(dept)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDeptName" className="text-right">
                  部门名称 *
                </Label>
                <Input
                  id="editDeptName"
                  className="col-span-3"
                  value={currentDept.dept_name}
                  onChange={(e) => setCurrentDept({...currentDept, dept_name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editOrderNum" className="text-right">
                  显示排序
                </Label>
                <Input
                  id="editOrderNum"
                  type="number"
                  className="col-span-3"
                  value={currentDept.order_num}
                  onChange={(e) => setCurrentDept({...currentDept, order_num: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLeader" className="text-right">
                  负责人
                </Label>
                <Input
                  id="editLeader"
                  className="col-span-3"
                  value={currentDept.leader || ""}
                  onChange={(e) => setCurrentDept({...currentDept, leader: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPhone" className="text-right">
                  联系电话
                </Label>
                <Input
                  id="editPhone"
                  className="col-span-3"
                  value={currentDept.phone || ""}
                  onChange={(e) => setCurrentDept({...currentDept, phone: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editEmail" className="text-right">
                  邮箱
                </Label>
                <Input
                  id="editEmail"
                  className="col-span-3"
                  value={currentDept.email || ""}
                  onChange={(e) => setCurrentDept({...currentDept, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editStatus" className="text-right">
                  部门状态
                </Label>
                <Select
                  value={currentDept.status}
                  onValueChange={(value) => setCurrentDept({...currentDept, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="请选择部门状态" />
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
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={updateDept} disabled={!currentDept?.dept_name}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 