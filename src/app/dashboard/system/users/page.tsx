"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { SortingState } from "@tanstack/react-table"

import { userApi } from "@/api/user"
import { UserQuery, User, UserSearchParams } from "@/types/user"
import { CreateUserDialog } from "./components/create-user-dialog"
import { EditUserDialog } from "./components/edit-user-dialog"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"

export default function UsersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [query, setQuery] = useState<UserQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "create_time",
        order: "desc"
      }
    ],
    params: {
      search_mode: "and"
    }
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // 获取用户列表查询
  const { data: response, isLoading } = useQuery({
    queryKey: ["users", "list", query],
    queryFn: () => userApi.getList(query),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 从响应中提取数据
  const usersData = response || { rows: [], total: 0, pages: 1 }
  const list = usersData.rows || []
  const total = usersData.total || 0
  const pages = usersData.pages || 1

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
  const handleSearch = useCallback((params: UserSearchParams) => {
    console.log('搜索参数：', params)
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        keywords: {
          user_name: params.user_name,
          nick_name: params.nick_name,
          email: params.email,
          phonenumber: params.phonenumber,
        },
        status: params.status,
        dept_id: params.dept_id,
        search_mode: "and"
      }
    }))
  }, [])

  // 删除用户的mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => userApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  // 批量删除用户的mutation
  const batchDeleteMutation = useMutation({
    mutationFn: (userIds: number[]) => userApi.batchDelete(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  // 处理编辑用户
  const handleEditUser = useCallback((user: User) => {
    setCurrentUser(user)
    setShowEditDialog(true)
  }, [])

  // 处理删除用户
  const handleDeleteUser = useCallback((userId: number) => {
    deleteUserMutation.mutate(userId)
  }, [deleteUserMutation])

  // 处理批量删除用户
  const handleBatchDelete = useCallback((userIds: number[]) => {
    batchDeleteMutation.mutate(userIds)
  }, [batchDeleteMutation])

  // 自定义列标签
  const columnLabels = {
    user_name: "用户名",
    nick_name: "昵称",
    email: "邮箱",
    phonenumber: "手机号",
    roles: "角色",
    status: "状态",
    create_time: "创建时间",
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">用户管理</h2>
            <p className="text-muted-foreground">
              管理系统用户，控制账号访问与权限
            </p>
          </div>
        </div>

        <DataTable
          columns={columns({
            onEdit: handleEditUser,
            onDelete: handleDeleteUser,
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
          createButtonText="添加用户"
          createButtonIcon={UserPlus}
        />
      </div>

      {/* 创建用户对话框 */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["users"] })
          setShowCreateDialog(false)
        }}
      />

      {/* 编辑用户对话框 */}
      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={currentUser}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["users"] })
          setShowEditDialog(false)
          setCurrentUser(null)
        }}
      />
    </div>
  )
} 