"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { SortingState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { schedulerApi } from "@/api/scheduler"
import { PipelineQuery, PipelineSearchParams, PipelineList } from "@/types/scheduler"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"

export default function SchedulerPage() {
  const router = useRouter()
  
  // 状态管理
  const [query, setQuery] = useState<PipelineQuery>({
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

  // 查询管道列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["scheduler", "pipelines", "list", query],
    queryFn: () => schedulerApi.pipelines.getList(query),
  })

  // 从响应中提取数据
  const pipelineData = response as PipelineList || { list: [], total: 0, pages: 1, page_num: 1, page_size: 10 }
  const list = pipelineData.list || []
  const total = pipelineData.total || 0
  const pages = pipelineData.pages || 1

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
  const handleSearch = useCallback((params: PipelineSearchParams) => {
    console.log('搜索参数：', params)
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        keywords: {
          name: params.name,
          description: params.description,
        },
        enabled: params.enabled,
        search_mode: "and"
      }
    }))
  }, [])

  // 自定义列标签
  const columnLabels = {
    name: "管道名称",
    id: "管道ID",
    description: "描述",
    enabled: "状态",
    triggers: "触发器",
    tasks: "任务",
    create_time: "创建时间",
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">调度器管理</h2>
            <p className="text-muted-foreground">
              管理系统中的调度管道和执行任务
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
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
        />
      </div>
    </div>
  )
} 