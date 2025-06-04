"use client"

import * as React from "react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft,
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  RefreshCw,
  Calendar,
  Activity,
  Settings,
  FileText
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
} from '@/components/animate-ui/radix/dialog'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { schedulerApi } from "@/api/scheduler"
import { Pipeline, PipelineRun, PipelineRunStatus, PipelineRunInput } from "@/types/scheduler"

export default function PipelineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const pipelineId = params.id as string

  // 状态管理
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [showRunDetailDialog, setShowRunDetailDialog] = useState(false)
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null)
  const [runParams, setRunParams] = useState<Record<string, any>>({})

  // 获取管道详情
  const { data: pipeline, isLoading: pipelineLoading } = useQuery({
    queryKey: ['scheduler', 'pipelines', pipelineId],
    queryFn: () => schedulerApi.pipelines.getDetail(pipelineId),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 获取管道的运行记录
  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ['scheduler', 'runs', pipelineId],
    queryFn: () => schedulerApi.runs.getList({ pipeline_id: pipelineId }),
    staleTime: 30 * 1000, // 30秒
  })

  // 获取管道输入参数模式
  const { data: inputSchema } = useQuery({
    queryKey: ['scheduler', 'pipelines', pipelineId, 'schema'],
    queryFn: () => schedulerApi.pipelines.getInputSchema(pipelineId),
    enabled: !!pipeline,
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 运行管道的mutation
  const runPipelineMutation = useMutation({
    mutationFn: (input: PipelineRunInput) =>
      schedulerApi.pipelines.run(pipelineId, input),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "管道已开始运行",
      })
      setShowRunDialog(false)
      setRunParams({})
      // 刷新运行记录列表
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'runs', pipelineId] })
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
  const handleRunPipeline = () => {
    setRunParams({})
    setShowRunDialog(true)
  }

  // 提交运行管道
  const handleSubmitRun = () => {
    const input: PipelineRunInput = {}
    if (Object.keys(runParams).length > 0) {
      input.params = runParams
    }
    
    runPipelineMutation.mutate(input)
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

  if (pipelineLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">加载中...</span>
      </div>
    )
  }

  if (!pipeline) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">管道不存在</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          返回
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{pipeline.name}</h2>
          <p className="text-muted-foreground">
            {pipeline.description || '管道详情和运行历史'}
          </p>
        </div>
        <Button onClick={handleRunPipeline}>
          <Play className="h-4 w-4 mr-2" />
          立即运行
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="runs">运行历史</TabsTrigger>
          <TabsTrigger value="config">配置</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>管道ID</Label>
                  <div className="mt-1 text-sm font-mono">{pipeline.id}</div>
                </div>
                <div>
                  <Label>管道名称</Label>
                  <div className="mt-1 text-sm">{pipeline.name}</div>
                </div>
                <div>
                  <Label>描述</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {pipeline.description || '无描述'}
                  </div>
                </div>
                <div>
                  <Label>任务数量</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{pipeline.tasks.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  触发器
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pipeline.triggers.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    无触发器配置
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pipeline.triggers.map((trigger, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{trigger.id}</div>
                            {trigger.schedule && (
                              <div className="text-sm text-muted-foreground">
                                {trigger.schedule}
                              </div>
                            )}
                          </div>
                          {trigger.next_fire_time && (
                            <div className="text-xs text-muted-foreground">
                              下次: {formatTime(trigger.next_fire_time)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                任务列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipeline.tasks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  无任务配置
                </div>
              ) : (
                <div className="space-y-2">
                  {pipeline.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{task.id}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground">
                            {task.description}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                运行历史
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

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                参数配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inputSchema && Object.keys(inputSchema).length > 0 ? (
                <div className="space-y-4">
                  <Label>输入参数模式</Label>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(inputSchema, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  该管道无需输入参数
                </div>
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
              配置参数并运行管道: {pipeline.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {inputSchema && Object.keys(inputSchema).length > 0 && (
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