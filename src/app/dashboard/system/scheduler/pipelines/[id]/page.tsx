"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { 
  ArrowLeft, 
  Play, 
  RefreshCw, 
  Activity, 
  Settings, 
  Clock, 
  Calendar,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Search,
  Check,
  ChevronsUpDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { schedulerApi } from "@/api/scheduler"
import { PipelineUpdate } from "@/types/scheduler"

// 表单验证模式
const formSchema = z.object({
  name: z.string().min(1, "管道名称不能为空").max(100, "管道名称不能超过100个字符"),
  description: z.string().optional(),
  enabled: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export default function PipelineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const pipelineId = params.id as string

  // 状态管理
  const [isEditMode, setIsEditMode] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showTriggerDialog, setShowTriggerDialog] = useState(false)
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [selectedTrigger, setSelectedTrigger] = useState<any>(null)
  const [selectedRunTrigger, setSelectedRunTrigger] = useState<any>(null)
  
  // 任务相关状态
  const [taskEnabled, setTaskEnabled] = useState(true)
  const [selectedTaskType, setSelectedTaskType] = useState<string>("")
  const [selectedBuiltinTask, setSelectedBuiltinTask] = useState<string>("")
  const [builtinTaskSelectorOpen, setBuiltinTaskSelectorOpen] = useState(false)
  
  // 触发器相关状态  
  const [triggerType, setTriggerType] = useState<string>("manual")
  const [triggerEnabled, setTriggerEnabled] = useState(true)

  // 删除确认弹窗状态
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean
    type: 'task' | 'trigger'
    item: any
    title: string
    description: string
  }>({
    open: false,
    type: 'task',
    item: null,
    title: '',
    description: ''
  })

  // 获取管道详情
  const { data: pipeline, isLoading: pipelineLoading } = useQuery({
    queryKey: ['scheduler', 'pipelines', pipelineId],
    queryFn: () => schedulerApi.pipelines.getDetail(pipelineId),
    staleTime: 5 * 60 * 1000,
  })

  // 获取任务类型列表
  const { data: taskTypes } = useQuery({
    queryKey: ['scheduler', 'task-types'],
    queryFn: () => schedulerApi.taskRegistry.getTypes(),
    staleTime: 10 * 60 * 1000, // 10分钟
  })

  // 获取内置函数列表（当选择内置函数类型时）
  const { data: builtinTasks } = useQuery({
    queryKey: ['scheduler', 'builtin-tasks'],
    queryFn: () => schedulerApi.taskRegistry.getBuiltinFunctions(),
    enabled: selectedTaskType === 'builtin_function',
    staleTime: 5 * 60 * 1000, // 5分钟
  })

  // 表单初始化
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: pipeline?.name || "",
      description: pipeline?.description || "",
      enabled: pipeline?.enabled || false,
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

  // 运行管道
  const runMutation = useMutation({
    mutationFn: (triggerData: any) => schedulerApi.pipelines.run(pipelineId, triggerData),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "管道已开始运行",
      })
      setShowRunDialog(false)
      setSelectedRunTrigger(null)
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "运行失败",
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

  // 更新任务的mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: any }) => schedulerApi.tasks.update(taskId, data),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "任务已更新",
      })
      // 如果是在弹窗中更新，关闭弹窗
      if (showTaskDialog) {
        setShowTaskDialog(false)
        setSelectedTask(null)
        setSelectedTaskType("")
        setSelectedBuiltinTask("")
        setBuiltinTaskSelectorOpen(false)
      }
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "更新任务失败",
        variant: "destructive",
      })
      // 不关闭弹窗，让用户可以修改后重试
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

  // 更新触发器的mutation
  const updateTriggerMutation = useMutation({
    mutationFn: ({ triggerId, data }: { triggerId: number; data: any }) => schedulerApi.triggers.update(triggerId, data),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "触发器已更新",
      })
      // 如果是在弹窗中更新，关闭弹窗
      if (showTriggerDialog) {
        setShowTriggerDialog(false)
        setSelectedTrigger(null)
      }
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "更新触发器失败",
        variant: "destructive",
      })
      // 不关闭弹窗，让用户可以修改后重试
    },
  })

  // 创建任务的mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => schedulerApi.tasks.create(pipelineId, {
      pipeline_id: pipelineId,
      task_id: data.task_id, // 使用传入的task_id，不自动生成
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
      setSelectedTaskType("")
      setSelectedBuiltinTask("")
      setBuiltinTaskSelectorOpen(false)
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "创建任务失败",
        variant: "destructive",
      })
      // 不关闭弹窗，让用户可以修改后重试
    },
  })

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
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'pipelines', pipelineId] })
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "创建触发器失败",
        variant: "destructive",
      })
      // 不关闭弹窗，让用户可以修改后重试
    },
  })

  const handleEditToggle = () => {
    if (isEditMode) {
      form.reset()
      setIsEditMode(false)
    } else {
      setIsEditMode(true)
    }
  }

  const onSubmit = (values: FormValues) => {
    const updateData: PipelineUpdate = {
      name: values.name,
      description: values.description || undefined,
      enabled: values.enabled,
    }
    updatePipelineMutation.mutate(updateData)
  }

  const handleRunPipeline = () => {
    const enabledTriggers = pipeline?.triggers?.filter(t => t.enabled) || []
    
    if (enabledTriggers.length === 0) {
      toast({
        title: "提示",
        description: "该管道没有启用的触发器，请先创建并启用一个触发器",
        variant: "destructive",
      })
      return
    }
    
    if (enabledTriggers.length === 1) {
      // 只有一个触发器，直接运行
      runMutation.mutate({ trigger_id: String(enabledTriggers[0].trigger_id) })
    } else {
      // 多个触发器，显示选择对话框
      setSelectedRunTrigger(null)
      setShowRunDialog(true)
    }
  }

  const handleSubmitRun = () => {
    if (!selectedRunTrigger) {
      toast({
        title: "错误",
        description: "请选择一个触发器",
        variant: "destructive",
      })
      return
    }
    runMutation.mutate({ trigger_id: String(selectedRunTrigger.trigger_id) })
  }

  const handleViewRuns = () => {
    router.push(`/dashboard/system/scheduler/${pipelineId}/runs`)
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setTaskEnabled(task?.enabled !== false)
    setSelectedTaskType(task?.task_type || "")
    setSelectedBuiltinTask(task?.task_type === 'builtin_function' ? task?.task_id || "" : "")
    setBuiltinTaskSelectorOpen(false)
    setShowTaskDialog(true)
  }

  const handleDeleteTask = (task: any) => {
    setDeleteConfirmDialog({
      open: true,
      type: 'task',
      item: task,
      title: `确认删除任务 "${task.name || task.id}"？`,
      description: '删除任务将不可恢复，请确认操作。'
    })
  }

  const toggleTaskEnabled = (task: any) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { enabled: !task.enabled }
    })
  }

  // 处理内置函数选择
  const handleBuiltinTaskSelect = async (taskId: string) => {
    if (!taskId) return
    
    try {
      const taskDetail = await schedulerApi.taskRegistry.getBuiltinFunctionDetail(taskId)
      
      // 自动填充表单字段
      const taskNameInput = document.getElementById('task-name') as HTMLInputElement
      const taskDescInput = document.getElementById('task-description') as HTMLTextAreaElement
      
      if (taskNameInput) taskNameInput.value = taskDetail.name || taskDetail.id
      if (taskDescInput) taskDescInput.value = taskDetail.description || ""
      
      setSelectedBuiltinTask(taskId)
      setBuiltinTaskSelectorOpen(false)
    } catch (error) {
      toast({
        title: "错误",
        description: "获取任务详情失败",
        variant: "destructive",
      })
    }
  }

  // 保存任务
  const handleSaveTask = () => {
    let taskId = '';
    
    if (selectedTaskType === 'builtin_function' && selectedBuiltinTask) {
      // 内置函数类型：使用选择的内置函数ID
      taskId = selectedBuiltinTask;
    } else {
      // 其他类型：使用用户输入的task_id，如果为空则自动生成
      taskId = (document.getElementById('task-id') as HTMLInputElement)?.value || `task_${Date.now()}`;
    }
    
    const formData = {
      task_id: taskId,
      name: (document.getElementById('task-name') as HTMLInputElement)?.value || '',
      description: (document.getElementById('task-description') as HTMLTextAreaElement)?.value || '',
      task_type: selectedTaskType,
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

    if (!selectedTaskType) {
      toast({
        title: "错误",
        description: "请选择任务类型",
        variant: "destructive",
      })
      return
    }

    if (selectedTaskType === 'builtin_function' && !selectedBuiltinTask) {
      toast({
        title: "错误",
        description: "请选择内置函数",
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

  const handleEditTrigger = (trigger: any) => {
    setSelectedTrigger(trigger)
    setTriggerType(trigger?.trigger_type || "manual")
    setTriggerEnabled(trigger?.enabled !== false)
    setShowTriggerDialog(true)
  }

  const handleDeleteTrigger = (trigger: any) => {
    setDeleteConfirmDialog({
      open: true,
      type: 'trigger',
      item: trigger,
      title: `确认删除触发器 "${trigger.name || trigger.id}"？`,
      description: '删除触发器将不可恢复，请确认操作。'
    })
  }

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
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{pipeline.name}</h2>
          <p className="text-muted-foreground">
            {pipeline.description || '管道详情信息'}
          </p>
        </div>
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
                variant="outline" 
                size="sm" 
                onClick={handleViewRuns}
              >
                <Clock className="h-4 w-4 mr-2" />
                运行历史
              </Button>
              <Button 
                size="sm" 
                onClick={handleRunPipeline}
                disabled={!pipeline.enabled || runMutation.isPending}
              >
                {runMutation.isPending && (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Play className="h-4 w-4 mr-2" />
                立即运行
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
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
              <div className="grid gap-4 md:grid-cols-2">
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
                  <Label>创建时间</Label>
                  <div className="mt-1 text-sm">
                    {pipeline.create_time ? formatTime(pipeline.create_time) : "-"}
                  </div>
                </div>
                <div>
                  <Label>更新时间</Label>
                  <div className="mt-1 text-sm">
                    {pipeline.update_time ? formatTime(pipeline.update_time) : "-"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 触发器管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                触发器管理
              </div>
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
                添加触发器
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!pipeline.triggers || pipeline.triggers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
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
                  <div key={trigger.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{trigger.name || `触发器 ${index + 1}`}</div>
                        {trigger.schedule && (
                          <div className="text-xs text-muted-foreground mt-1">
                            调度: {trigger.schedule}
                          </div>
                        )}
                        {trigger.next_fire_time && (
                          <div className="text-xs text-muted-foreground mt-1">
                            下次执行: {formatTime(trigger.next_fire_time)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {trigger.trigger_type === 'manual' ? '手动' : 
                           trigger.trigger_type === 'cron' ? 'Cron' :
                           trigger.trigger_type === 'interval' ? '间隔' : 
                           trigger.trigger_type}
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

        {/* 任务管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                任务管理
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTask(null)
                  setTaskEnabled(true)
                  setSelectedTaskType("")
                  setSelectedBuiltinTask("")
                  setBuiltinTaskSelectorOpen(false)
                  setShowTaskDialog(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加任务
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!pipeline.tasks || pipeline.tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                无任务配置
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(null)
                      setTaskEnabled(true)
                      setSelectedTaskType("")
                      setSelectedBuiltinTask("")
                      setBuiltinTaskSelectorOpen(false)
                      setShowTaskDialog(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加第一个任务
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pipeline.tasks.map((task, index) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{task.name || `任务 ${index + 1}`}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </div>
                        )}
                        {task.task_type && (
                          <div className="text-xs text-muted-foreground mt-1">
                            类型: {task.task_type}
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
            {/* 任务ID输入框 - 内置函数类型时隐藏，因为会自动使用函数ID */}
            {selectedTaskType !== 'builtin_function' && (
              <div className="space-y-2">
                <Label htmlFor="task-id">任务ID</Label>
                <Input
                  id="task-id"
                  placeholder="任务标识符（留空自动生成）"
                  defaultValue={selectedTask?.task_id || ""}
                  readOnly={!!selectedTask}
                  className={selectedTask ? "bg-muted" : ""}
                />
                <div className="text-xs text-muted-foreground">
                  用于在管道中唯一标识此任务，留空将自动生成
                </div>
              </div>
            )}
            
            {/* 内置函数类型时显示当前选择的函数ID */}
            {selectedTaskType === 'builtin_function' && selectedBuiltinTask && (
              <div className="space-y-2">
                <Label>任务ID</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {selectedBuiltinTask}
                </div>
                <div className="text-xs text-muted-foreground">
                  内置函数的任务ID自动使用函数标识符
                </div>
              </div>
            )}
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
                <Label htmlFor="task-type">任务类型 *</Label>
                <select
                  id="task-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedTaskType}
                  onChange={(e) => {
                    setSelectedTaskType(e.target.value)
                    setSelectedBuiltinTask("") // 重置内置函数选择
                  }}
                >
                  <option value="">请选择任务类型</option>
                  {taskTypes?.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.display_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 mt-7">
                <Switch 
                  id="task-enabled" 
                  checked={taskEnabled}
                  onCheckedChange={setTaskEnabled}
                />
                <Label htmlFor="task-enabled">启用任务</Label>
              </div>
            </div>
            
            {/* 当选择内置函数时显示函数选择器 */}
            {selectedTaskType === 'builtin_function' && (
              <div className="space-y-2">
                <Label htmlFor="builtin-task">选择内置函数 *</Label>
                <Popover open={builtinTaskSelectorOpen} onOpenChange={setBuiltinTaskSelectorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={builtinTaskSelectorOpen}
                      className="w-full justify-between"
                    >
                      {selectedBuiltinTask
                        ? builtinTasks?.find((task) => task.id === selectedBuiltinTask)?.name ||
                          builtinTasks?.find((task) => task.id === selectedBuiltinTask)?.id ||
                          "选择内置函数"
                        : "请选择内置函数"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="搜索内置函数..." />
                      <CommandList>
                        <CommandEmpty>未找到匹配的内置函数</CommandEmpty>
                        <CommandGroup>
                          {builtinTasks?.map((task) => (
                            <CommandItem
                              key={task.id}
                              value={`${task.id} ${task.name} ${task.description || ''}`}
                              onSelect={() => handleBuiltinTaskSelect(task.id)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedBuiltinTask === task.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col">
                                <div className="font-medium">{task.name}</div>
                                {task.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {task.description}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  ID: {task.id}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedBuiltinTask && (
                  <div className="text-xs text-muted-foreground">
                    已选择内置函数，任务名称和描述将自动填充
                  </div>
                )}
              </div>
            )}
            
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
                setSelectedTaskType("")
                setSelectedBuiltinTask("")
                setBuiltinTaskSelectorOpen(false)
              }}
            >
              取消
            </Button>
            <Button onClick={handleSaveTask}>
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
            <Button onClick={handleSaveTrigger}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 运行管道触发器选择对话框 */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>选择触发器运行</DialogTitle>
            <DialogDescription>
              该管道有多个启用的触发器，请选择一个用于运行
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              {pipeline?.triggers?.filter(t => t.enabled).map((trigger) => (
                <div
                  key={trigger.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRunTrigger?.id === trigger.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRunTrigger(trigger)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{trigger.name}</div>
                      {trigger.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {trigger.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {trigger.trigger_type === 'manual' ? '手动' : 
                         trigger.trigger_type === 'cron' ? 'Cron' :
                         trigger.trigger_type === 'interval' ? '间隔' : 
                         trigger.trigger_type}
                      </Badge>
                      {selectedRunTrigger?.id === trigger.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRunDialog(false)
                setSelectedRunTrigger(null)
              }}
            >
              取消
            </Button>
            <Button 
              onClick={handleSubmitRun}
              disabled={!selectedRunTrigger || runMutation.isPending}
            >
              {runMutation.isPending && (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              运行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteConfirmDialog.open} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmDialog({ ...deleteConfirmDialog, open: false })
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{deleteConfirmDialog.title}</DialogTitle>
            <DialogDescription>{deleteConfirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteConfirmDialog({ ...deleteConfirmDialog, open: false })
              }}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (deleteConfirmDialog.type === 'task') {
                  deleteTaskMutation.mutate(deleteConfirmDialog.item.id)
                } else if (deleteConfirmDialog.type === 'trigger') {
                  deleteTriggerMutation.mutate(deleteConfirmDialog.item.id)
                }
                setDeleteConfirmDialog({ ...deleteConfirmDialog, open: false })
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 