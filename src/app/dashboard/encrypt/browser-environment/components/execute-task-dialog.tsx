"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/animate-ui/radix/dialog"
import { Label } from "@/components/ui/label"
import { RefreshCw, Play } from "lucide-react"
import { toast } from "sonner"

import { browserEnvironmentAPI } from "@/api/encrypt/browser-environment"
import type { BrowserEnvironment } from "@/types/encrypt/browser-environment"

interface ExecuteTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  environment: BrowserEnvironment
}

export function ExecuteTaskDialog({ 
  open, 
  onOpenChange, 
  environment 
}: ExecuteTaskDialogProps) {
  const queryClient = useQueryClient()
  const [task, setTask] = useState("")

  // 执行任务
  const executeTaskMutation = useMutation({
    mutationFn: (taskContent: string) => 
      browserEnvironmentAPI.executeTask(environment.id, { task: taskContent }),
    onSuccess: (data) => {
      toast.success("任务执行成功")
      setTask("")
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
    },
    onError: (error: any) => {
      toast.error(`任务执行失败: ${error.message || '未知错误'}`)
    },
  })

  const handleExecute = () => {
    if (!task.trim()) {
      toast.warning("请输入任务内容")
      return
    }
    executeTaskMutation.mutate(task.trim())
  }

  const handleCancel = () => {
    setTask("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            执行浏览器任务
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div>在环境 "{environment.name}" 中执行自动化任务</div>
            <div className="text-sm text-amber-600">
              💡 例如：打开百度，搜索世界上最好的编程语言是什么，并总结返回结果给我
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task">任务描述</Label>
            <Textarea
              id="task"
              placeholder="请输入您希望浏览器执行的任务，例如：打开某个网站，搜索信息，填写表单等..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={4}
              className="min-h-[100px]"
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <div className="font-medium mb-1">环境信息：</div>
              <div>• 环境名称：{environment.name}</div>
              <div>• 浏览器类型：{environment.browser_type}</div>
              <div>• 当前状态：活跃</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={executeTaskMutation.isPending}
          >
            取消
          </Button>
          
          <Button 
            onClick={handleExecute}
            disabled={executeTaskMutation.isPending || !task.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {executeTaskMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                执行中...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                开始执行
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 