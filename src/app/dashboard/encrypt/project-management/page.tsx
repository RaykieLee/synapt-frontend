"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { projectManagementAPI } from "@/api/encrypt/project-management"
import { ProjectManagementSearchParams } from "@/types/encrypt/project-management"
import { DataTable } from "./components/data-table"
import { getColumns } from "./components/columns"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"

export default function ProjectManagementPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // 搜索参数状态
  const [searchParams, setSearchParams] = useState<ProjectManagementSearchParams>({
    keywords: {},
  })

  // 选中行状态
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // 查询参数
  const queryParams = useMemo(() => ({
    page_num: 1,
    page_size: 10,
    sorts: [{ field: "create_time", order: "desc" as const }],
    params: {
      keywords: searchParams.keywords || {},
      current_status: searchParams.current_status,
      has_token: searchParams.has_token,
      search_mode: "and" as const,
    },
  }), [searchParams])

  // 获取项目列表
  const { data, isLoading, error } = useQuery({
    queryKey: ["encrypt", "project-management", "list", queryParams],
    queryFn: () => projectManagementAPI.getList(queryParams),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => projectManagementAPI.batchDelete({ ids }),
    onSuccess: () => {
      toast({
        title: "成功",
        description: `已删除 ${selectedRows.length} 个项目`,
      })
      setSelectedRows([])
      setDeleteDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["encrypt", "project-management", "list"] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: `批量删除失败: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  const handleSearch = (params: ProjectManagementSearchParams) => {
    setSearchParams(params)
  }

  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      toast({
        title: "提示",
        description: "请先选择要删除的项目",
        variant: "destructive",
      })
      return
    }
    setDeleteDialogOpen(true)
  }

  const confirmBatchDelete = () => {
    batchDeleteMutation.mutate(selectedRows)
  }

  const handleAddNew = () => {
    router.push("/dashboard/encrypt/project-management/edit")
  }

  if (error) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">加载失败: {(error as Error).message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-0 md:flex md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">项目管理</h2>
          <p className="text-muted-foreground">
            管理加密项目的基本信息和状态
          </p>
        </div>
      </div>
      
      <DataTable
        columns={getColumns()}
        data={data?.list || []}
        searchParams={searchParams}
        onSearchParamsChange={handleSearch}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onBatchDelete={handleBatchDelete}
        onAddNew={handleAddNew}
        isLoading={isLoading}
        pagination={{
          page_num: data?.page_num || 1,
          page_size: data?.page_size || 10,
          total: data?.total || 0,
          pages: data?.pages || 0,
        }}
      />

      {/* 批量删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除选中的 {selectedRows.length} 个项目吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={batchDeleteMutation.isPending}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBatchDelete}
              disabled={batchDeleteMutation.isPending}
            >
              {batchDeleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 