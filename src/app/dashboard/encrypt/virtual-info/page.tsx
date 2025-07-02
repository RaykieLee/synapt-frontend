"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { SortingState } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

import { DataTable } from "./components/data-table"
import { getColumns } from "./components/columns"
import { DataTableToolbar } from "./components/data-table-toolbar"
import { DeleteConfirmationDialog } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { virtualInfoAPI } from "@/api/encrypt"
import { 
  VirtualInfo, 
  VirtualInfoQuery, 
  VirtualInfoList, 
  VirtualInfoSearchParams 
} from "@/types/encrypt"

export default function VirtualInfoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [query, setQuery] = useState<VirtualInfoQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [{ field: "create_time", order: "desc" }],
    params: { keywords: {}, search_mode: "and" }
  })
  
  const [selectedRows, setSelectedRows] = useState<VirtualInfo[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // 获取虚拟信息列表
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["encrypt", "virtual-info", "list", query],
    queryFn: () => virtualInfoAPI.getList(query),
  })

  // 统一数据处理
  const virtualInfoData = (response || {}) as VirtualInfoList
  const list = virtualInfoData.list || []
  const total = virtualInfoData.total || 0

  // 批量删除
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => virtualInfoAPI.batchDelete({ ids }),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "删除成功",
      })
      queryClient.invalidateQueries({ queryKey: ["encrypt", "virtual-info", "list"] })
      setSelectedRows([])
      setDeleteDialogOpen(false)
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: `删除失败: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  // 搜索处理
  const handleSearch = useCallback((searchParams: VirtualInfoSearchParams) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: Object.keys(searchParams).length === 0 
        ? { keywords: {}, search_mode: "and" }
        : {
            keywords: {
              first: searchParams.first,
              last: searchParams.last,
              email: searchParams.email,
              phone: searchParams.phone,
              city: searchParams.city,
              username: searchParams.username,
            },
            user_id: searchParams.user_id,
            gender: searchParams.gender,
            country: searchParams.country,
            status: searchParams.status,
            search_mode: searchParams.search_mode || "and"
          }
    }))
  }, [])

  // 分页处理
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setQuery(prev => ({
      ...prev,
      page_num: page,
      page_size: pageSize
    }))
  }, [])

  // 排序处理
  const handleSortChange = useCallback((sorting: SortingState) => {
    const sorts = sorting.map(sort => ({
      field: sort.id,
      order: sort.desc ? 'desc' as const : 'asc' as const
    }))
    setQuery(prev => ({
      ...prev,
      sorts
    }))
  }, [])

  const columns = getColumns()

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">加载失败</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-4 p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">虚拟信息管理</h1>
          <p className="text-muted-foreground">管理虚拟身份信息数据</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list}
        pagination={{
          pageIndex: (query.page_num || 1) - 1,
          pageSize: query.page_size || 10,
          total: total,
          onPageChange: handlePageChange,
        }}
        loading={isLoading}
        onSortingChange={handleSortChange}
        onRowSelectionChange={setSelectedRows}
        selectedRows={selectedRows}
        toolbar={(table: any) => (
          <DataTableToolbar
            table={table}
            onSearch={handleSearch}
            selectedCount={selectedRows.length}
            onBatchDelete={() => setDeleteDialogOpen(true)}
            onAddNew={() => router.push("/dashboard/encrypt/virtual-info/edit")}
          />
        )}
      />

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除选中的 ${selectedRows.length} 条虚拟信息吗？此操作无法撤销。`}
        onConfirm={() => {
          const ids = selectedRows.map(row => row.id)
          deleteMutation.mutate(ids)
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
} 