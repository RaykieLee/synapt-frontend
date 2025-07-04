"use client"

import { useState, useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { SortingState } from "@tanstack/react-table"
import debounce from "lodash/debounce"
import { toast } from "sonner"

import { DataTable } from "./components/data-table"
import { getColumns } from "./components/columns"
import { ProxyEntity, ProxyQuery, ProxySearchParams, PageResult } from "@/types/encrypt/proxy"
import { proxyAPI } from "@/api/encrypt/proxy"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ProxyPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // 状态管理
  const [query, setQuery] = useState<ProxyQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [{ field: "create_time", order: "desc" }],
    params: { keywords: {}, search_mode: "and" }
  })

  const [sorting, setSorting] = useState<SortingState>([
    { id: "create_time", desc: true }
  ])

  // 获取代理列表
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["encrypt", "proxy", "list", query],
    queryFn: () => proxyAPI.getList(query),
  })

  // 统一数据处理
  const proxyData = (response || {}) as PageResult<ProxyEntity>
  const list = proxyData.list || []
  const total = proxyData.total || 0

  // 批量删除
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => proxyAPI.batchDelete({ ids }),
    onSuccess: (data) => {
      toast.success(`删除成功，共删除 ${data.deleted_count} 条记录`)
      queryClient.invalidateQueries({ queryKey: ["encrypt", "proxy", "list"] })
    },
    onError: (error: any) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  // 批量检测
  const batchCheckMutation = useMutation({
    mutationFn: (ids: string[]) => proxyAPI.batchCheck({ proxy_ids: ids }),
    onSuccess: (data) => {
      toast.success(`检测完成，成功: ${data.success_count}, 失败: ${data.failed_count}`)
      queryClient.invalidateQueries({ queryKey: ["encrypt", "proxy", "list"] })
    },
    onError: (error: any) => {
      toast.error(`批量检测失败: ${error.message}`)
    },
  })

  // 搜索处理
  const handleSearch = useCallback((searchParams: ProxySearchParams) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: Object.keys(searchParams).length === 0 
        ? { keywords: {}, search_mode: "and" }
        : {
            keywords: { 
              host: searchParams.host,
              proxy_type: searchParams.proxy_type,
              username: searchParams.username,
              group: searchParams.group
            },
            status: searchParams.status,
            is_active: searchParams.is_active,
            search_mode: searchParams.search_mode || "and"
          }
    }))
  }, [])

  // 分页处理
  const handlePaginationChange = useCallback((page_num: number, page_size: number) => {
    setQuery(prev => ({ ...prev, page_num, page_size }))
  }, [])

  // 排序处理
  const handleSortingChange = useCallback((sorting: SortingState) => {
    setSorting(sorting)
    const sorts = sorting.map(sort => ({
      field: sort.id,
      order: sort.desc ? "desc" as const : "asc" as const
    }))
    setQuery(prev => ({ ...prev, sorts }))
  }, [])

  // 批量删除处理
  const handleBatchDelete = useCallback((selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      toast.warning("请选择要删除的记录")
      return
    }
    deleteMutation.mutate(selectedIds)
  }, [deleteMutation])

  // 批量检测处理
  const handleBatchCheck = useCallback((selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      toast.warning("请选择要检测的代理")
      return
    }
    batchCheckMutation.mutate(selectedIds)
  }, [batchCheckMutation])

  // 新增处理
  const handleAdd = useCallback(() => {
    router.push("/dashboard/encrypt/proxy/edit")
  }, [router])

  return (
    <div className="min-h-screen space-y-4 p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">代理管理</h1>
          <p className="text-muted-foreground">
            管理和配置代理服务器设置
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增代理
        </Button>
      </div>

      <DataTable
        columns={getColumns()}
        data={list}
        total={total}
        page_num={query.page_num || 1}
        page_size={query.page_size || 10}
        sorting={sorting}
        loading={isLoading}
        onSearch={handleSearch}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onBatchDelete={handleBatchDelete}
        onBatchCheck={handleBatchCheck}
      />
    </div>
  )
} 