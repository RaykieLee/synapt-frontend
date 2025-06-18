"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { SortingState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { schedulerApi } from "@/api/scheduler"
import { PipelineRunQuery, PipelineRunSearchParams, PipelineRunList } from "@/types/scheduler"
import { RunDataTable } from "./components/run-data-table"
import { columns } from "./components/run-columns"

export default function PipelineRunsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pipelineId = params.id as string

  // 从URL获取初始过滤条件
  const initialPipelineId = searchParams.get('pipeline_id') || pipelineId

  // 状态管理
  const [query, setQuery] = useState<PipelineRunQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "start_time",
        order: "desc"
      }
    ],
    params: {
      pipeline_id: initialPipelineId,
      search_mode: "and"
    }
  })

  // 获取管道信息
  const { data: pipeline } = useQuery({
    queryKey: ['scheduler', 'pipelines', pipelineId],
    queryFn: () => schedulerApi.pipelines.getDetail(pipelineId),
    staleTime: 5 * 60 * 1000,
  })

  // 查询运行记录列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["scheduler", "runs", "list", query],
    queryFn: () => schedulerApi.runs.getList(query),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // 30秒自动刷新
  })

  // 从响应中提取数据
  const runData = response as PipelineRunList || { list: [], total: 0, pages: 1, page_num: 1, page_size: 10 }
  const list = runData.list || []
  const total = runData.total || 0
  const pages = runData.pages || 1

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
  const handleSearch = useCallback((params: PipelineRunSearchParams) => {
    console.log('搜索参数：', params)
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        pipeline_id: params.pipeline_id,
        trigger_id: params.trigger_id,
        status: params.status,
        search_mode: "and"
      }
    }))
  }, [])

  // 自定义列标签
  const columnLabels = {
    id: "运行ID",
    pipeline_id: "管道ID",
    trigger_id: "触发器ID",
    status: "运行状态",
    start_time: "开始时间",
    duration: "运行时长",
    tasks_run: "任务数量",
    error_message: "错误信息",
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">运行历史</h2>
            <p className="text-muted-foreground">
              {pipeline?.name ? `管道：${pipeline.name}` : `管道ID：${pipelineId}`}
            </p>
          </div>
        </div>

        <RunDataTable
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
          defaultPipelineId={pipelineId}
          minHeight="600px"
        />
      </div>
    </div>
  )
} 