"use client"

import * as React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Calendar,
  Activity
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/animate-ui/radix/dialog'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { schedulerApi } from "@/api/scheduler"
import { Pipeline, PipelineRun, PipelineRunStatus, PipelineRunInput } from "@/types/scheduler"

export default function SchedulerPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [showRunDetailDialog, setShowRunDetailDialog] = useState(false)
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null)
  const [runParams, setRunParams] = useState<Record<string, any>>({})

  // 获取管道列表
  const { data: pipelines = [], isLoading: pipelinesLoading } = useQuery({
    queryKey: ['scheduler', 'pipelines'],
    queryFn: () => schedulerApi.pipelines.getList(),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 获取运行记录列表
  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ['scheduler', 'runs'],
    queryFn: () => schedulerApi.runs.getList(),
    staleTime: 30 * 1000, // 30秒
  })

  // 运行管道的mutation
  const runPipelineMutation = useMutation({
    mutationFn: ({ pipelineId, input }: { pipelineId: string, input: PipelineRunInput }) =>
      schedulerApi.pipelines.run(pipelineId, input),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "管道已开始运行",
      })
      setShowRunDialog(false)
      setRunParams({})
      // 刷新运行记录列表
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'runs'] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "运行管道失败",
        variant: "destructive",
      })
    },
  })

  // 处理运行管道
  const handleRunPipeline = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline)
    setRunParams({})
    setShowRunDialog(true)
  }

  // 提交运行管道
  const handleSubmitRun = () => {
    if (!selectedPipeline) return
    
    const input: PipelineRunInput = {}
    if (Object.keys(runParams).length > 0) {
      input.params = runParams
    }
    
    runPipelineMutation.mutate({
      pipelineId: selectedPipeline.id,
      input
    })
  }

  // 查看运行详情
  const handleViewRunDetail = (run: PipelineRun) => {
    setSelectedRun(run)
    setShowRunDetailDialog(true)
  }

  // 获取状态徽章
  const getStatusBadge = (status: PipelineRunStatus) => {
    const statusConfig: Record<PipelineRunStatus, {
      variant: "default" | "destructive" | "outline" | "secondary";
      icon: any;
      text: string;
      className?: string;
    }> = {
      [PipelineRunStatus.PENDING]: { 
        variant: "secondary", 
        icon: Clock, 
        text: "等待中" 
      },
      [PipelineRunStatus.RUNNING]: { 
        variant: "default", 
        icon: RefreshCw, 
        text: "运行中" 
      },
      [PipelineRunStatus.COMPLETED]: { 
        variant: "default", 
        icon: CheckCircle, 
        text: "已完成",
        className: "bg-green-100 text-green-800 hover:bg-green-100"
      },
      [PipelineRunStatus.FAILED]: { 
        variant: "destructive", 
        icon: XCircle, 
        text: "失败" 
      },
      [PipelineRunStatus.CANCELLED]: { 
        variant: "secondary", 
        icon: AlertCircle, 
        text: "已取消" 
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  // 格式化持续时间
  const formatDuration = (duration: number) => {
    if (duration < 1000) {
      return `${Math.round(duration)}ms`
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(1)}s`
    } else {
      return `${(duration / 60000).toFixed(1)}m`
    }
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN')
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">任务调度</h2>
          <p className="text-muted-foreground">
            管理和监控系统任务管道的执行
          </p>
        </div>
      </div>

      <Tabs defaultValue="pipelines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipelines">管道列表</TabsTrigger>
          <TabsTrigger value="runs">运行记录</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                管道列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipelinesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">加载中...</span>
                </div>
              ) : pipelines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无管道数据
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>管道名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>触发器数量</TableHead>
                      <TableHead>任务数量</TableHead>
                      <TableHead>下次运行时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pipelines.map((pipeline) => (
                      <TableRow key={pipeline.id}>
                        <TableCell className="font-medium">
                          {pipeline.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {pipeline.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {pipeline.triggers.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {pipeline.tasks.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pipeline.triggers.find(t => t.next_fire_time) ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatTime(pipeline.triggers.find(t => t.next_fire_time)!.next_fire_time!)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRunPipeline(pipeline)}>
                                <Play className="mr-2 h-4 w-4" />
                                立即运行
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                运行记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">加载中...</span>
                </div>
              ) : runs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无运行记录
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>运行ID</TableHead>
                      <TableHead>管道ID</TableHead>
                      <TableHead>触发器ID</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>开始时间</TableHead>
                      <TableHead>持续时间</TableHead>
                      <TableHead>任务数量</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">
                          #{run.id}
                        </TableCell>
                        <TableCell>{run.pipeline_id}</TableCell>
                        <TableCell>{run.trigger_id}</TableCell>
                        <TableCell>
                          {getStatusBadge(run.status)}
                        </TableCell>
                        <TableCell>
                          {formatTime(run.start_time)}
                        </TableCell>
                        <TableCell>
                          {run.duration ? formatDuration(run.duration) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {run.tasks_run.length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRunDetail(run)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 运行管道对话框 */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>运行管道</DialogTitle>
            <DialogDescription>
              配置参数并运行管道: {selectedPipeline?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedPipeline?.params && (
              <div className="space-y-4">
                <Label>运行参数</Label>
                <Textarea
                  placeholder="请输入JSON格式的参数"
                  value={JSON.stringify(runParams, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value || '{}')
                      setRunParams(params)
                    } catch {
                      // 忽略JSON解析错误
                    }
                  }}
                  rows={6}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRunDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleSubmitRun}
              disabled={runPipelineMutation.isPending}
            >
              {runPipelineMutation.isPending && (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              运行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 运行详情对话框 */}
      <Dialog open={showRunDetailDialog} onOpenChange={setShowRunDetailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>运行详情</DialogTitle>
            <DialogDescription>
              运行ID: #{selectedRun?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRun && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>管道ID</Label>
                  <div className="mt-1 text-sm">{selectedRun.pipeline_id}</div>
                </div>
                <div>
                  <Label>触发器ID</Label>
                  <div className="mt-1 text-sm">{selectedRun.trigger_id}</div>
                </div>
                <div>
                  <Label>状态</Label>
                  <div className="mt-1">{getStatusBadge(selectedRun.status)}</div>
                </div>
                <div>
                  <Label>持续时间</Label>
                  <div className="mt-1 text-sm">
                    {selectedRun.duration ? formatDuration(selectedRun.duration) : '-'}
                  </div>
                </div>
              </div>
              <div>
                <Label>开始时间</Label>
                <div className="mt-1 text-sm">{formatTime(selectedRun.start_time)}</div>
              </div>
              <div>
                <Label>任务运行情况</Label>
                <div className="mt-2 space-y-2">
                  {selectedRun.tasks_run.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{task.task_id}</span>
                      <div className="flex items-center gap-2">
                        {task.status && getStatusBadge(task.status)}
                        {task.duration && (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(task.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRunDetailDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 