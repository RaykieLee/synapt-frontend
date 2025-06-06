"use client"

import * as React from "react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Trash2
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import { schedulerApi } from "@/api/scheduler"
import { Pipeline, PipelineRun, PipelineRunStatus, PipelineRunInput, PipelineUpdate, PipelineTask, PipelineTrigger } from "@/types/scheduler"

// 表单验证模式
const formSchema = z.object({
  name: z.string().min(1, "管道名称不能为空").max(100, "管道名称不能超过100个字符"),
  description: z.string().optional(),
  enabled: z.boolean(),
  params_schema: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function PipelineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const pipelineId = params.id as string

  // 检查URL参数，确定是否进入编辑模式
  const [isEditMode, setIsEditMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('mode') === 'edit'
    }
    return false
  })
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [showRunDetailDialog, setShowRunDetailDialog] = useState(false)
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null)
  const [runParams, setRunParams] = useState<Record<string, any>>({})
  
  // 任务相关状态
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<PipelineTask | null>(null)
  const [taskEnabled, setTaskEnabled] = useState(true)
  
  // 触发器相关状态  
  const [showTriggerDialog, setShowTriggerDialog] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState<PipelineTrigger | null>(null)
  const [triggerType, setTriggerType] = useState<string>("manual")
  const [triggerEnabled, setTriggerEnabled] = useState(true)

  // 获取管道详情
  const { data: pipeline, isLoading: pipelineLoading } = useQuery({
    queryKey: ['scheduler', 'pipelines', pipelineId],
    queryFn: () => schedulerApi.pipelines.getDetail(pipelineId),
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 获取管道的运行记录
  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['scheduler', 'runs', pipelineId],
    queryFn: () => schedulerApi.runs.getList({ 
      params: { 
        pipeline_id: pipelineId 
      } 
    }),
    staleTime: 30 * 1000, // 30秒
  })

  const runs = runsData?.list || []

  // 获取管道输入参数模式
  const { data: inputSchema } = useQuery({
    queryKey: ['scheduler', 'pipelines', pipelineId, 'schema'],
    queryFn: () => schedulerApi.pipelines.getInputSchema(pipelineId),
    enabled: !!pipeline,
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 表单初始化
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: pipeline?.name || "",
      description: pipeline?.description || "",
      enabled: pipeline?.enabled || false,
      params_schema: "",
    },
  })

  // 更新管道的mutation
  const updatePipelineMutation = useMutation({
    mutationFn: (data: PipelineUpdate) => schedulerApi.pipelines.update(pipelineId, data),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "管道信息已更新",
      })
      setIsEditMode(false)
      // 移除URL中的编辑模式参数
      router.replace(`/dashboard/system/scheduler/pipelines/${pipelineId}`)
      // 刷新管道详情
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "更新管道失败",
        variant: "destructive",
      })
    },
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

  // 处理编辑模式切换
  const handleEditToggle = () => {
    if (isEditMode) {
      // 取消编辑，重置表单并移除URL参数
      form.reset()
      setIsEditMode(false)
      router.replace(`/dashboard/system/scheduler/pipelines/${pipelineId}`)
    } else {
      setIsEditMode(true)
      router.replace(`/dashboard/system/scheduler/pipelines/${pipelineId}?mode=edit`)
    }
  }

  // 提交表单
  const onSubmit = (values: FormValues) => {
    const updateData: PipelineUpdate = {
      name: values.name,
      description: values.description || undefined,
      enabled: values.enabled,
      params_schema: values.params_schema || undefined,
    }
    updatePipelineMutation.mutate(updateData)
  }

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

  // 处理任务编辑
  const handleEditTask = (task: any) => {
    // 暂时使用any类型，稍后会完善
    setSelectedTask(task)
    setTaskEnabled(task?.enabled !== false)
    setShowTaskDialog(true)
  }

  // 创建任务的mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => schedulerApi.tasks.create(pipelineId, {
      pipeline_id: pipelineId,
      task_id: `task_${Date.now()}`, // 生成临时ID，后端会用UUID替换
      name: data.name,
      description: data.description,
      task_type: data.task_type,
      config: data.config,
      enabled: data.enabled,
    }),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "任务已创建",
      })
      setShowTaskDialog(false)
      setSelectedTask(null)
      // 刷新管道详情
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "创建任务失败",
        variant: "destructive",
      })
    },
  })

  // 更新任务的mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: any }) => schedulerApi.tasks.update(taskId, data),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "任务已更新",
      })
      setShowTaskDialog(false)
      setSelectedTask(null)
      // 刷新管道详情
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "更新任务失败",
        variant: "destructive",
      })
    },
  })

  // 删除任务的mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => schedulerApi.tasks.delete(taskId),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "任务已删除",
      })
      // 刷新管道详情
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "删除任务失败",
        variant: "destructive",
      })
    },
  })

  // 处理任务删除
  const handleDeleteTask = (task: any) => {
    if (confirm(`确认删除任务 "${task.name || task.id}"？`)) {
      deleteTaskMutation.mutate(task.id)
    }
  }

  // 切换任务启用状态
  const toggleTaskEnabled = (task: any) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { enabled: !task.enabled }
    })
  }

  // 保存任务
  const handleSaveTask = () => {
    const formData = {
      name: (document.getElementById('task-name') as HTMLInputElement)?.value || '',
      description: (document.getElementById('task-description') as HTMLTextAreaElement)?.value || '',
      task_type: (document.getElementById('task-type') as HTMLInputElement)?.value || '',
      config: (document.getElementById('task-config') as HTMLTextAreaElement)?.value || '',
      enabled: taskEnabled,
    }

    // 验证必填字段
    if (!formData.name.trim()) {
      toast({
        title: "错误",
        description: "请输入任务名称",
        variant: "destructive",
      })
      return
    }

    // 验证JSON配置
    if (formData.config) {
      try {
        JSON.parse(formData.config)
      } catch {
        toast({
          title: "错误",
          description: "配置信息格式不正确，请输入有效的JSON",
          variant: "destructive",
        })
        return
      }
    }

    if (selectedTask) {
      // 更新任务
      updateTaskMutation.mutate({ 
        taskId: selectedTask.id, 
        data: formData 
      })
    } else {
      // 创建任务
      createTaskMutation.mutate(formData)
    }
  }

  // 处理触发器编辑
  const handleEditTrigger = (trigger: any) => {
    setSelectedTrigger(trigger)
    setTriggerType(trigger?.trigger_type || "manual")
    setTriggerEnabled(trigger?.enabled !== false)
    setShowTriggerDialog(true)
  }

  // 创建触发器的mutation
  const createTriggerMutation = useMutation({
    mutationFn: (data: any) => schedulerApi.triggers.create(pipelineId, {
      pipeline_id: pipelineId,
      trigger_id: `trigger_${Date.now()}`, // 生成临时ID，后端会用UUID替换
      name: data.name,
      description: data.description,
      trigger_type: data.trigger_type,
      schedule_config: data.schedule_config,
      params: data.params,
      enabled: data.enabled,
    }),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "触发器已创建",
      })
      setShowTriggerDialog(false)
      setSelectedTrigger(null)
      // 刷新管道详情
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "创建触发器失败",
        variant: "destructive",
      })
    },
  })

  // 更新触发器的mutation
  const updateTriggerMutation = useMutation({
    mutationFn: ({ triggerId, data }: { triggerId: number; data: any }) => schedulerApi.triggers.update(triggerId, data),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "触发器已更新",
      })
      setShowTriggerDialog(false)
      setSelectedTrigger(null)
      // 刷新管道详情
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "更新触发器失败",
        variant: "destructive",
      })
    },
  })

  // 删除触发器的mutation
  const deleteTriggerMutation = useMutation({
    mutationFn: (triggerId: number) => schedulerApi.triggers.delete(triggerId),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "触发器已删除",
      })
      // 刷新管道详情
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "删除触发器失败",
        variant: "destructive",
      })
    },
  })

  // 处理触发器删除
  const handleDeleteTrigger = (trigger: any) => {
    if (confirm(`确认删除触发器 "${trigger.name || trigger.id}"？`)) {
      deleteTriggerMutation.mutate(trigger.id)
    }
  }

  // 切换触发器启用状态
  const toggleTriggerEnabled = (trigger: any) => {
    updateTriggerMutation.mutate({
      triggerId: trigger.id,
      data: { enabled: !trigger.enabled }
    })
  }

  // 保存触发器
  const handleSaveTrigger = () => {
    const name = (document.getElementById('trigger-name') as HTMLInputElement)?.value || ''
    const description = (document.getElementById('trigger-description') as HTMLTextAreaElement)?.value || ''
    const enabled = triggerEnabled
    const params = (document.getElementById('trigger-params') as HTMLTextAreaElement)?.value || ''

    // 验证必填字段
    if (!name.trim()) {
      toast({
        title: "错误",
        description: "请输入触发器名称",
        variant: "destructive",
      })
      return
    }

    // 根据类型构建调度配置
    let scheduleConfig = ""
    try {
      if (triggerType === "cron") {
        const expression = (document.getElementById('cron-expression') as HTMLInputElement)?.value
        if (!expression) {
          toast({
            title: "错误",
            description: "请输入Cron表达式",
            variant: "destructive",
          })
          return
        }
        scheduleConfig = JSON.stringify({ 
          expression,
          start_date: (document.getElementById('start-date') as HTMLInputElement)?.value || null,
          end_date: (document.getElementById('end-date') as HTMLInputElement)?.value || null,
        })
      } else if (triggerType === "interval") {
        const value = (document.getElementById('interval-value') as HTMLInputElement)?.value
        const unit = (document.getElementById('interval-unit') as HTMLSelectElement)?.value
        const maxInstances = (document.getElementById('max-instances') as HTMLInputElement)?.value || "1"
        if (!value) {
          toast({
            title: "错误",
            description: "请输入间隔时间",
            variant: "destructive",
          })
          return
        }
        scheduleConfig = JSON.stringify({
          interval: parseInt(value),
          unit,
          max_instances: parseInt(maxInstances),
          start_date: (document.getElementById('interval-start-date') as HTMLInputElement)?.value || null,
          end_date: (document.getElementById('interval-end-date') as HTMLInputElement)?.value || null,
        })
      } else if (triggerType === "date") {
        const runDate = (document.getElementById('run-date') as HTMLInputElement)?.value
        if (!runDate) {
          toast({
            title: "错误",
            description: "请选择执行时间",
            variant: "destructive",
          })
          return
        }
        scheduleConfig = JSON.stringify({ run_date: runDate })
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "配置信息生成失败",
        variant: "destructive",
      })
      return
    }

    const formData = {
      name,
      description,
      trigger_type: triggerType,
      schedule_config: scheduleConfig,
      params,
      enabled,
    }

    if (selectedTrigger) {
      // 更新触发器
      updateTriggerMutation.mutate({ 
        triggerId: selectedTrigger.id, 
        data: formData 
      })
    } else {
      // 创建触发器
      createTriggerMutation.mutate(formData)
    }
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

  // 格式化触发器类型
  const formatTriggerType = (triggerType: string) => {
    const typeMap: Record<string, string> = {
      'manual': '手动',
      'cron': 'Cron表达式',
      'interval': '时间间隔',
      'date': '定时执行'
    }
    return typeMap[triggerType] || triggerType || '手动'
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

      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="runs">运行历史</TabsTrigger>
          <TabsTrigger value="config">配置</TabsTrigger>
        </TabsList>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditToggle}
                  disabled={updatePipelineMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  取消
                </Button>
                <Button 
                  size="sm" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={updatePipelineMutation.isPending}
                >
                  {updatePipelineMutation.isPending && (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditToggle}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleRunPipeline}
                >
                  <Play className="h-4 w-4 mr-2" />
                  立即运行
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  基本信息
                  {isEditMode && (
                    <Badge variant="outline" className="ml-auto">
                      编辑模式
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditMode ? (
                  <Form {...form}>
                    <div className="space-y-4">
                      <div>
                        <Label>管道ID</Label>
                        <div className="mt-1 text-sm font-mono text-muted-foreground">{pipeline.id}</div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>管道名称 *</FormLabel>
                            <FormControl>
                              <Input placeholder="输入管道名称" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>描述</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="输入管道描述（可选）"
                                className="resize-none"
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">启用管道</FormLabel>
                              <FormDescription className="text-sm">
                                控制管道是否可以被触发执行
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                ) : (
                  <>
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
                      <Label>状态</Label>
                      <div className="mt-1">
                        <Badge variant={pipeline.enabled ? "default" : "secondary"}>
                          {pipeline.enabled ? "已启用" : "已禁用"}
                        </Badge>
                      </div>
                    </div>
                <div>
                  <Label>任务数量</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{pipeline.tasks.length}</Badge>
                  </div>
                </div>
                    <div>
                      <Label>触发器数量</Label>
                      <div className="mt-1">
                        <Badge variant="outline">{pipeline.triggers.length}</Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  触发器
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTrigger(null)
                      setTriggerType("manual")
                      setShowTriggerDialog(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加触发器
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pipeline.triggers.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    无触发器配置
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTrigger(null)
                          setTriggerType("manual")
                          setTriggerEnabled(true)
                          setShowTriggerDialog(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        添加第一个触发器
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pipeline.triggers.map((trigger, index) => (
                      <div key={trigger.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                                                  <div className="flex-1">
                          <div className="font-medium">{trigger.name || "未命名触发器"}</div>
                            {trigger.schedule && (
                              <div className="text-xs text-muted-foreground mt-1">
                                调度: {trigger.schedule}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {formatTriggerType(trigger.trigger_type)}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={trigger.enabled}
                                onCheckedChange={() => toggleTriggerEnabled(trigger)}
                                disabled={updateTriggerMutation.isPending}
                              />
                              <span className="text-xs text-muted-foreground">
                                {trigger.enabled ? "启用" : "禁用"}
                              </span>
                          </div>
                          {trigger.next_fire_time && (
                            <div className="text-xs text-muted-foreground">
                              下次: {formatTime(trigger.next_fire_time)}
                            </div>
                          )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTrigger(trigger)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTrigger(trigger)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                任务列表
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTask(null)
                    setTaskEnabled(true)
                    setShowTaskDialog(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加任务
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipeline.tasks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  无任务配置
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(null)
                        setTaskEnabled(true)
                        setShowTaskDialog(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加第一个任务
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {pipeline.tasks.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{task.name || "未命名任务"}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={task.enabled}
                            onCheckedChange={() => toggleTaskEnabled(task)}
                            disabled={updateTaskMutation.isPending}
                          />
                          <span className="text-xs text-muted-foreground">
                            {task.enabled ? "启用" : "禁用"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
                {isEditMode && (
                  <Badge variant="outline" className="ml-auto">
                    编辑模式
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="params_schema"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>参数JSON Schema</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='请输入JSON Schema格式的参数定义，例如：&#10;{&#10;  "type": "object",&#10;  "properties": {&#10;    "param1": {"type": "string"}&#10;  }&#10;}'
                            className="resize-none font-mono text-sm"
                            rows={12}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          定义管道运行时接受的参数格式（JSON Schema）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <>
              {inputSchema && Object.keys(inputSchema).length > 0 ? (
                <div className="space-y-4">
                  <Label>输入参数模式</Label>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(inputSchema, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  该管道无需输入参数
                </div>
                  )}
                </>
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
                                            <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
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

      {/* 任务编辑弹窗 */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "编辑任务" : "新建任务"}
            </DialogTitle>
            <DialogDescription>
              配置管道任务的基本信息和执行参数
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">任务名称 *</Label>
              <Input
                id="task-name"
                placeholder="输入任务名称"
                defaultValue={selectedTask?.name || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">描述</Label>
              <Textarea
                id="task-description"
                placeholder="输入任务描述（可选）"
                rows={3}
                defaultValue={selectedTask?.description || ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-type">任务类型</Label>
                <Input
                  id="task-type"
                  placeholder="输入任务类型"
                  defaultValue={selectedTask?.task_type || ""}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="task-enabled" 
                  checked={taskEnabled}
                  onCheckedChange={setTaskEnabled}
                />
                <Label htmlFor="task-enabled">启用任务</Label>
              </div>
            </div>
                          <div className="space-y-2">
                <Label htmlFor="task-config">配置信息</Label>
                <Textarea
                  id="task-config"
                  placeholder="输入JSON格式的配置信息（可选）"
                  rows={6}
                  className="font-mono text-sm"
                  defaultValue={selectedTask?.config ? JSON.stringify(selectedTask.config, null, 2) : ""}
                />
              </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTaskDialog(false)
                setSelectedTask(null)
              }}
            >
              取消
            </Button>
            <Button onClick={() => handleSaveTask()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 触发器编辑弹窗 */}
      <Dialog open={showTriggerDialog} onOpenChange={setShowTriggerDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTrigger ? "编辑触发器" : "新建触发器"}
            </DialogTitle>
            <DialogDescription>
              配置管道触发器的类型和调度规则
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trigger-name">触发器名称 *</Label>
              <Input
                id="trigger-name"
                placeholder="输入触发器名称"
                defaultValue={selectedTrigger?.name || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trigger-description">描述</Label>
              <Textarea
                id="trigger-description"
                placeholder="输入触发器描述（可选）"
                rows={2}
                defaultValue={selectedTrigger?.description || ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trigger-type">触发器类型 *</Label>
                <select
                  id="trigger-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                >
                  <option value="manual">手动触发</option>
                  <option value="cron">Cron表达式</option>
                  <option value="interval">时间间隔</option>
                  <option value="date">定时执行</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 mt-7">
                <Switch 
                  id="trigger-enabled" 
                  checked={triggerEnabled}
                  onCheckedChange={setTriggerEnabled}
                />
                <Label htmlFor="trigger-enabled">启用触发器</Label>
              </div>
            </div>
            
            {/* 根据触发器类型显示不同的配置界面 */}
            {triggerType === "cron" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cron-expression">Cron表达式 *</Label>
                  <Input
                    id="cron-expression"
                    placeholder="如：0 0 8 * * ? (每天8点执行)"
                    defaultValue={selectedTrigger?.schedule_config ? (() => {
                      try {
                        return JSON.parse(selectedTrigger.schedule_config).expression || ""
                      } catch {
                        return ""
                      }
                    })() : ""}
                  />
                  <div className="text-xs text-muted-foreground">
                    格式：秒 分 时 日 月 星期 [年]。<a href="#" className="text-blue-500 hover:underline">查看Cron表达式帮助</a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">开始时间</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      defaultValue={selectedTrigger?.schedule_config ? (() => {
                        try {
                          const startDate = JSON.parse(selectedTrigger.schedule_config).start_date
                          return startDate ? new Date(startDate).toISOString().slice(0, 16) : ""
                        } catch {
                          return ""
                        }
                      })() : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">结束时间</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      defaultValue={selectedTrigger?.schedule_config ? (() => {
                        try {
                          const endDate = JSON.parse(selectedTrigger.schedule_config).end_date
                          return endDate ? new Date(endDate).toISOString().slice(0, 16) : ""
                        } catch {
                          return ""
                        }
                      })() : ""}
                    />
                  </div>
                </div>
              </div>
            )}

            {triggerType === "interval" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interval-value">间隔时间 *</Label>
                    <Input
                      id="interval-value"
                      type="number"
                      placeholder="输入数值"
                      min="1"
                      defaultValue={selectedTrigger?.schedule_config ? (() => {
                        try {
                          return JSON.parse(selectedTrigger.schedule_config).interval || ""
                        } catch {
                          return ""
                        }
                      })() : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval-unit">时间单位</Label>
                    <select
                      id="interval-unit"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={selectedTrigger?.schedule_config ? (() => {
                        try {
                          return JSON.parse(selectedTrigger.schedule_config).unit || "minutes"
                        } catch {
                          return "minutes"
                        }
                      })() : "minutes"}
                    >
                      <option value="seconds">秒</option>
                      <option value="minutes">分钟</option>
                      <option value="hours">小时</option>
                      <option value="days">天</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-instances">最大实例数</Label>
                    <Input
                      id="max-instances"
                      type="number"
                      placeholder="1"
                      min="1"
                      defaultValue={selectedTrigger?.schedule_config ? (() => {
                        try {
                          return JSON.parse(selectedTrigger.schedule_config).max_instances || "1"
                        } catch {
                          return "1"
                        }
                      })() : "1"}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interval-start-date">开始时间</Label>
                    <Input
                      id="interval-start-date"
                      type="datetime-local"
                      defaultValue={selectedTrigger?.schedule_config ? (() => {
                        try {
                          const startDate = JSON.parse(selectedTrigger.schedule_config).start_date
                          return startDate ? new Date(startDate).toISOString().slice(0, 16) : ""
                        } catch {
                          return ""
                        }
                      })() : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval-end-date">结束时间</Label>
                    <Input
                      id="interval-end-date"
                      type="datetime-local"
                      defaultValue={selectedTrigger?.schedule_config ? (() => {
                        try {
                          const endDate = JSON.parse(selectedTrigger.schedule_config).end_date
                          return endDate ? new Date(endDate).toISOString().slice(0, 16) : ""
                        } catch {
                          return ""
                        }
                      })() : ""}
                    />
                  </div>
                </div>
              </div>
            )}

            {triggerType === "date" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="run-date">执行时间 *</Label>
                  <Input
                    id="run-date"
                    type="datetime-local"
                    required
                    defaultValue={selectedTrigger?.schedule_config ? (() => {
                      try {
                        const runDate = JSON.parse(selectedTrigger.schedule_config).run_date
                        return runDate ? new Date(runDate).toISOString().slice(0, 16) : ""
                      } catch {
                        return ""
                      }
                    })() : ""}
                  />
                  <div className="text-xs text-muted-foreground">
                    指定具体的执行时间，只会执行一次
                  </div>
                </div>
              </div>
            )}

            {triggerType === "manual" && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  手动触发类型无需配置调度规则，可通过API或界面手动启动管道执行。
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="trigger-params">触发器参数</Label>
              <Textarea
                id="trigger-params"
                placeholder="输入JSON格式的触发器参数（可选）"
                rows={4}
                className="font-mono text-sm"
                defaultValue={selectedTrigger?.params ? (() => {
                  try {
                    return typeof selectedTrigger.params === 'string' 
                      ? selectedTrigger.params 
                      : JSON.stringify(selectedTrigger.params, null, 2)
                  } catch {
                    return ""
                  }
                })() : ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTriggerDialog(false)
                setSelectedTrigger(null)
              }}
            >
              取消
            </Button>
            <Button onClick={() => handleSaveTrigger()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 