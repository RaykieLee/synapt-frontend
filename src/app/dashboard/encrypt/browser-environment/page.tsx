"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { SortingState } from "@tanstack/react-table"

import { browserEnvironmentAPI } from "@/api/encrypt/browser-environment"
import { DataTable } from "./components/data-table"
import { getColumns } from "./components/columns"
import { Button } from "@/components/ui/button"
import { Plus, Zap } from "lucide-react"
import { toast } from "sonner"

import type {
  BrowserEnvironment,
  BrowserEnvironmentQuery,
  BrowserEnvironmentListResponse,
  BrowserEnvironmentSearchParams
} from "@/types/encrypt/browser-environment"

export default function BrowserEnvironmentPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [query, setQuery] = useState<BrowserEnvironmentQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [{ field: "create_time", order: "desc" }],
    params: { keywords: {}, search_mode: "and" }
  })
  
  // 数据查询
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["encrypt", "browser-environment", "list", query],
    queryFn: () => browserEnvironmentAPI.getList(query),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 统一数据处理
  const environmentData = (response || {}) as BrowserEnvironmentListResponse
  const list = environmentData.list || []
  const total = environmentData.total || 0
  const pages = Math.ceil(total / (query.page_size || 10))

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    setQuery(prev => ({ ...prev, page_num: page }))
  }, [])

  // 处理排序变化
  const handleSortingChange = useCallback((sorting: SortingState) => {
    setQuery(prev => ({
      ...prev,
      sorts: sorting.map(sort => ({
        field: sort.id,
        order: sort.desc ? "desc" : "asc"
      }))
    }))
  }, [])

  // 处理搜索
  const handleSearch = useCallback((params: BrowserEnvironmentSearchParams) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: Object.keys(params).length === 0 
        ? { keywords: {}, search_mode: "and" }
        : {
            keywords: {
              name: params.name,
              browser_type: params.browser_type,
              browser_id: params.browser_id,
              status: params.status
            },
            browser_type: params.browser_type,
            status: params.status,
            search_mode: params.search_mode || "and"
          }
    }))
  }, [])



  // 自定义列标签
  const columnLabels = {
    name: "环境名称",
    browser_type: "浏览器类型",
    browser_id: "实例ID",
    status: "运行状态",
    last_used: "最后使用",
    create_time: "创建时间",
    remark: "备注"
  }

  if (error) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">加载失败: {(error as Error).message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">浏览器环境管理</h2>
            <p className="text-muted-foreground">
              管理和配置不同类型的浏览器环境实例
            </p>
          </div>
        </div>

        <DataTable
          columns={getColumns()}
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
          onCreateClick={() => router.push("/dashboard/encrypt/browser-environment/edit")}
          createButtonText="新增环境"
          createButtonIcon={Plus}
          showCreateWithApiButton={true}
          onCreateWithApiClick={() => router.push("/dashboard/encrypt/browser-environment/edit?withApi=true")}
          createWithApiButtonText="通过API创建"
          createWithApiButtonIcon={Zap}
        />
      </div>
    </div>
  )
} 