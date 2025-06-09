"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { SortingState } from "@tanstack/react-table"

import { roleApi } from "@/api/role"
import { RoleQuery, Role, RoleSearchParams } from "@/types/role"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { CreateRoleDialog } from "./components/create-role-dialog"
import { EditRoleDialog } from "./components/edit-role-dialog"

export default function RolesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [query, setQuery] = useState<RoleQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "role_sort",
        order: "asc"
      }
    ],
    params: {
      search_mode: "or"
    }
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)

  // 查询角色列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["roles", "list", query],
    queryFn: () => roleApi.getList(query),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 从响应中提取数据
  const rolesData = response || { rows: [], total: 0, pages: 1 }
  const list = rolesData.rows || []
  const total = rolesData.total || 0
  const pages = rolesData.pages || 1

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page_num: page }))
  }, [])

  // 处理排序变化
  const handleSortingChange = useCallback((sorting: SortingState) => {
    setQuery((prev) => ({
      ...prev,
      sorts: sorting.map((sort) => ({
        field: sort.id,
        order: sort.desc ? "desc" : "asc"
      }))
    }))
  }, [])

  // 处理搜索
  const handleSearch = useCallback((params: RoleSearchParams) => {
    console.log('搜索参数：', params)
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        keywords: {
          role_name: params.role_name,
          role_key: params.role_key,
        },
        status: params.status,
        search_mode: "or"
      }
    }))
  }, [])

  // 删除角色的mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) => roleApi.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })

  // 批量删除角色的mutation
  const batchDeleteMutation = useMutation({
    mutationFn: (roleIds: number[]) => roleApi.batchDelete(roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })

  // 处理编辑角色
  const handleEditRole = useCallback((role: Role) => {
    setCurrentRole(role)
    setShowEditDialog(true)
  }, [])

  // 处理删除角色
  const handleDeleteRole = useCallback((roleId: number) => {
    deleteRoleMutation.mutate(roleId)
  }, [deleteRoleMutation])

  // 处理批量删除角色
  const handleBatchDelete = useCallback((roleIds: number[]) => {
    batchDeleteMutation.mutate(roleIds)
  }, [batchDeleteMutation])

  // 自定义列标签
  const columnLabels = {
    role_name: "角色名称",
    role_key: "权限标识",
    role_sort: "显示顺序",
    status: "状态",
    create_time: "创建时间",
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

        <DataTable
          columns={columns({
            onEdit: handleEditRole,
            onDelete: handleDeleteRole,
            onBatchDelete: handleBatchDelete
          })}
          data={list}
          pageCount={pages}
          pageIndex={query.page_num ? query.page_num - 1 : 0}
          pageSize={query.page_size || 10}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onSortingChange={handleSortingChange}
          isLoading={isLoading}
          columnLabels={columnLabels}
          minHeight="400px"
          showCreateButton={true}
          onCreateClick={() => setShowCreateDialog(true)}
          createButtonText="添加角色"
          createButtonIcon={Plus}
        />
      </div>

      {/* 创建角色对话框 */}
      <CreateRoleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["roles"] })
          setShowCreateDialog(false)
        }}
      />

      {/* 编辑角色对话框 */}
      <EditRoleDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        role={currentRole}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["roles"] })
          setShowEditDialog(false)
          setCurrentRole(null)
        }}
      />
    </div>
  )
} 