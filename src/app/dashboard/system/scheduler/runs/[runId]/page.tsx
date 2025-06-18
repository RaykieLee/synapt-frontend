"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Play, RefreshCw, Download, Square, Trash2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { io, Socket } from "socket.io-client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { schedulerApi } from "@/api/scheduler"
import { PipelineRun, PipelineRunStatus } from "@/types/scheduler"
import { toast } from "sonner"

// 日志条目接口
interface LogEntry {
  timestamp: string
  level: string
  message: string
  pipeline?: string
  task?: string
  run_id?: number
}

export default function RunDetailPage() {
  const params = useParams()
  const router = useRouter()
  const runId = parseInt(params.runId as string)
  const queryClient = useQueryClient()
  
  // 日志状态
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  // 获取运行详情
  const { data: run, isLoading: runLoading } = useQuery({
    queryKey: ['scheduler', 'runs', runId],
    queryFn: () => schedulerApi.runs.getDetail(runId),
    enabled: !!runId,
    staleTime: 30 * 1000,
    refetchInterval: 5000 // 每5秒刷新一次
  })

  // 停止运行
  const stopMutation = useMutation({
    mutationFn: () => schedulerApi.runs.stop(runId),
    onSuccess: () => {
      toast.success("运行已停止")
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs", runId] })
    },
    onError: (error: any) => {
      toast.error(error.message || "停止失败")
    },
  })

  // 删除运行记录
  const deleteMutation = useMutation({
    mutationFn: () => schedulerApi.runs.delete(runId),
    onSuccess: () => {
      toast.success("运行记录已删除")
      router.back()
    },
    onError: (error: any) => {
      toast.error(error.message || "删除失败")
    },
  })

  // WebSocket 连接 (仅对运行中的任务)
  useEffect(() => {
    if (!runId || !run) return

    // 只有运行中或等待中的任务才需要 WebSocket 连接
    const needsRealtime = run.status === PipelineRunStatus.RUNNING || run.status === PipelineRunStatus.PENDING

    if (!needsRealtime) {
      setIsConnected(false)
      return
    }

    // 连接 WebSocket - 使用与 plombery 相同的配置
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000/ws', {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    })
    
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      
      // 不需要手动加入房间，直接监听日志事件
      console.log(`Listening for logs.${runId}`)
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    // 监听日志消息
    socket.on(`logs.${runId}`, (data: string) => {
      try {
        const logEntry: LogEntry = JSON.parse(data)
        setLogs(prev => [...prev, logEntry])
      } catch (error) {
        console.error('Failed to parse log data:', error)
        // 如果不是 JSON，作为普通消息处理
        const logEntry: LogEntry = {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: data,
          run_id: runId
        }
        setLogs(prev => [...prev, logEntry])
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [runId, run?.status])

  // 获取历史日志
  useEffect(() => {
    if (!runId) return

    const fetchLogs = async () => {
      try {
        const logData = await schedulerApi.runs.getLogs(runId)
        if (logData) {
          // 解析日志数据，假设是换行分隔的 JSON
          const logLines = logData.split('\n').filter(line => line.trim())
          const parsedLogs: LogEntry[] = []
          
          logLines.forEach(line => {
            try {
              const logEntry = JSON.parse(line)
              parsedLogs.push(logEntry)
            } catch (error) {
              // 如果不是 JSON，作为普通消息处理
              parsedLogs.push({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: line,
                run_id: runId
              })
            }
          })
          
          setLogs(parsedLogs)
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error)
      }
    }

    fetchLogs()
  }, [runId])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  // 状态徽章
  const getStatusBadge = (status: PipelineRunStatus) => {
    const statusMap = {
      pending: { variant: "secondary" as const, text: "等待中", className: "bg-yellow-100 text-yellow-800" },
      running: { variant: "default" as const, text: "运行中", className: "bg-blue-100 text-blue-800" }, 
      completed: { variant: "default" as const, text: "已完成", className: "bg-green-100 text-green-800" },
      failed: { variant: "destructive" as const, text: "失败", className: "bg-red-100 text-red-800" },
      cancelled: { variant: "outline" as const, text: "已取消", className: "bg-gray-100 text-gray-800" },
      timeout: { variant: "destructive" as const, text: "超时", className: "bg-red-100 text-red-800" }
    }
    
    const config = statusMap[status] || { variant: "secondary" as const, text: status, className: "" }
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    )
  }

  // 日志级别颜色
  const getLogLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR': return 'text-red-600'
      case 'WARN': 
      case 'WARNING': return 'text-orange-600'
      case 'INFO': return 'text-blue-600'
      case 'DEBUG': return 'text-gray-600'
      default: return 'text-gray-800'
    }
  }

  // 格式化持续时间
  const formatDuration = (duration: number | null | undefined) => {
    if (!duration || duration <= 0) return "-"
    
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = Math.floor(duration % 60)
    
    if (hours > 0) return `${hours}小时${minutes}分钟${seconds}秒`
    if (minutes > 0) return `${minutes}分钟${seconds}秒`
    return `${seconds}秒`
  }

  // 计算运行时长
  const calculateRunDuration = (run: PipelineRun): number | null => {
    if (!run.start_time) return null

    // 直接使用后端提供的duration字段（后端已统一使用秒作为单位）
    if (run.duration !== undefined && run.duration !== null && run.duration > 0) {
      return run.duration
    }

    // 如果没有duration，且有结束时间，使用结束时间计算
    if (run.end_time) {
      const startTime = new Date(run.start_time).getTime()
      const endTime = new Date(run.end_time).getTime()
      return Math.floor((endTime - startTime) / 1000) // 转换为秒
    }
    
    // 如果是运行中，计算当前时间差
    if (run.status === PipelineRunStatus.RUNNING || run.status === PipelineRunStatus.PENDING) {
      const startTime = new Date(run.start_time).getTime()
      const currentTime = Date.now()
      return Math.floor((currentTime - startTime) / 1000) // 转换为秒
    }
    
    return null
  }

  // 下载日志
  const handleDownloadLogs = () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleString('zh-CN')}] [${log.level}] ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `run-${runId}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const canStop = run?.status === PipelineRunStatus.RUNNING || run?.status === PipelineRunStatus.PENDING

  if (runLoading) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">运行记录不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">运行详情 #{run.id}</h2>
              <p className="text-muted-foreground">
                管道ID：{run.pipeline_id} | 触发器ID：{run.trigger_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canStop && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => stopMutation.mutate()}
                disabled={stopMutation.isPending}
              >
                <Square className="h-4 w-4 mr-2" />
                停止
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(`确认删除运行记录 #${run.id}？此操作不可撤销。`)) {
                  deleteMutation.mutate()
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </Button>
          </div>
        </div>

        {/* 运行信息概览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              运行信息
              {getStatusBadge(run.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">开始时间</p>
                <p className="text-sm">{new Date(run.start_time).toLocaleString('zh-CN')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">运行时长</p>
                <p className="text-sm">{formatDuration(calculateRunDuration(run))}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">任务数量</p>
                <p className="text-sm">{run.tasks_run?.length || 0}个</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">结束时间</p>
                <p className="text-sm">
                  {run.end_time ? new Date(run.end_time).toLocaleString('zh-CN') : "-"}
                </p>
              </div>
            </div>
            
            {run.error_message && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-800 mb-1">错误信息：</p>
                <p className="text-sm text-red-700">{run.error_message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 详情标签页 */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs">运行日志</TabsTrigger>
            <TabsTrigger value="tasks">任务详情</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    运行日志
                    {(run?.status === PipelineRunStatus.RUNNING || run?.status === PipelineRunStatus.PENDING) ? (
                      <>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-muted-foreground">
                          {isConnected ? '实时连接' : '连接断开'}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                        <span className="text-xs text-muted-foreground">
                          历史日志
                        </span>
                      </>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoScroll(!autoScroll)}
                    >
                      {autoScroll ? '关闭自动滚动' : '开启自动滚动'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadLogs}
                      disabled={logs.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载日志
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full border rounded p-4 bg-gray-50">
                  {logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无日志数据
                    </div>
                  ) : (
                    <div className="space-y-1 font-mono text-xs">
                      {logs.map((log, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-gray-500 whitespace-nowrap">
                            [{new Date(log.timestamp).toLocaleString('zh-CN')}]
                          </span>
                          <span className={`font-semibold whitespace-nowrap ${getLogLevelColor(log.level)}`}>
                            [{log.level}]
                          </span>
                          {log.task && (
                            <span className="text-purple-600 whitespace-nowrap">
                              [{log.task}]
                            </span>
                          )}
                          <span className="break-all">{log.message}</span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>任务执行详情</CardTitle>
                <CardDescription>
                  本次运行中各个任务的执行情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                {run.tasks_run && run.tasks_run.length > 0 ? (
                  <div className="space-y-4">
                    {run.tasks_run.map((task, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{task.task_id}</h4>
                          <div className="flex items-center gap-2">
                            {task.status && getStatusBadge(task.status)}
                                                         {task.duration && task.duration > 0 && (
                               <span className="text-sm text-muted-foreground">
                                 耗时：{formatDuration(task.duration)}
                               </span>
                             )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>输出数据：{task.has_output ? '是' : '否'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无任务数据
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 