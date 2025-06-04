"use client"

import { Row } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, Eye, Trash2, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { PipelineRun, PipelineRunStatus } from "@/types/scheduler"
import { schedulerApi } from "@/api/scheduler"

interface RunRowActionsProps<TData> {
  row: Row<TData>
}

export function RunRowActions<TData>({
  row,
}: RunRowActionsProps<TData>) {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const run = row.original as PipelineRun

  // 删除运行记录
  const deleteMutation = useMutation({
    mutationFn: () => schedulerApi.runs.delete(run.id),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "运行记录已删除",
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "删除失败",
        variant: "destructive",
      })
    },
  })

  // 停止运行
  const stopMutation = useMutation({
    mutationFn: () => schedulerApi.runs.stop(run.id),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "运行已停止",
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "停止失败",
        variant: "destructive",
      })
    },
  })

  const handleView = () => {
    router.push(`/dashboard/system/scheduler/runs/${run.id}`)
  }

  const handleStop = () => {
    if (confirm(`确认停止运行 #${run.id}？`)) {
      stopMutation.mutate()
    }
  }

  const handleDelete = () => {
    if (confirm(`确认删除运行记录 #${run.id}？此操作不可撤销。`)) {
      deleteMutation.mutate()
    }
  }

  const canStop = run.status === PipelineRunStatus.RUNNING || run.status === PipelineRunStatus.PENDING

  return (
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
        {canStop && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleStop}>
              <Square className="mr-2 h-4 w-4" />
              停止运行
            </DropdownMenuItem>
          </>
        )}
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
  )
} 