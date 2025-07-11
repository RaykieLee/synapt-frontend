"use client"

import { Row } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, Play, Trash2, Power, PowerOff, Eye, Clock } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Pipeline } from "@/types/scheduler"
import { schedulerApi } from "@/api/scheduler"
import { PipelineRunDialog } from "./pipeline-run-dialog"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [runDialogOpen, setRunDialogOpen] = useState(false)

  const pipeline = row.original as Pipeline

  // 启用/禁用管道
  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      enabled 
        ? schedulerApi.pipelines.enable(pipeline.id)
        : schedulerApi.pipelines.disable(pipeline.id),
    onSuccess: (_, enabled) => {
      toast({
        title: "成功",
        description: `管道已${enabled ? '启用' : '禁用'}`,
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "pipelines"] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "操作失败",
        variant: "destructive",
      })
    },
  })

  // 删除管道
  const deleteMutation = useMutation({
    mutationFn: () => schedulerApi.pipelines.delete(pipeline.id),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "管道已删除",
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "pipelines"] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "删除失败",
        variant: "destructive",
      })
    },
  })

  const handleView = () => {
    router.push(`/dashboard/system/scheduler/pipelines/${pipeline.id}`)
  }

  const handleViewRuns = () => {
    router.push(`/dashboard/system/scheduler/${pipeline.id}/runs`)
  }

  const handleToggleEnable = () => {
    toggleMutation.mutate(!pipeline.enabled)
  }

  const handleRun = () => {
    setRunDialogOpen(true)
  }

  const handleDelete = () => {
    if (confirm(`确认删除管道 "${pipeline.name}"？此操作不可撤销。`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            查看详情
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewRuns}>
            <Clock className="mr-2 h-4 w-4" />
            运行历史
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleRun} disabled={!pipeline.enabled}>
            <Play className="mr-2 h-4 w-4" />
            立即运行
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleEnable}>
            {pipeline.enabled ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                禁用
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                启用
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 动态参数运行对话框 */}
      <PipelineRunDialog
        pipelineId={pipeline.id}
        pipelineName={pipeline.name}
        open={runDialogOpen}
        onOpenChange={setRunDialogOpen}
      />
    </>
  )
} 