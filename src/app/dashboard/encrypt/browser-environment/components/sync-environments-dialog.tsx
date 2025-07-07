"use client"

import { useState, useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Search, RefreshCw, Download, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

import { browserEnvironmentAPI } from "@/api/encrypt/browser-environment"
import type { HubStudioEnvironment, SyncResult } from "@/types/encrypt/browser-environment"

interface SyncEnvironmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SyncEnvironmentsDialog({ open, onOpenChange }: SyncEnvironmentsDialogProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])

  // 获取HubStudio环境列表
  const { data: environments = [], isLoading, error, refetch } = useQuery({
    queryKey: ["hubstudio", "environments"],
    queryFn: browserEnvironmentAPI.getHubStudioEnvironments,
    enabled: open, // 只有在对话框打开时才查询
    staleTime: 30 * 1000, // 30秒
  })

  // 同步环境的mutation
  const syncMutation = useMutation({
    mutationFn: browserEnvironmentAPI.syncHubStudioEnvironments,
    onSuccess: (result: SyncResult) => {
      // 刷新浏览器环境列表
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
      
      // 显示成功消息
      const message = `同步完成：成功 ${result.synced_count} 个，跳过 ${result.skipped_count} 个，失败 ${result.error_count} 个`
      toast.success(message)
      
      // 如果有错误，显示详细信息
      if (result.errors.length > 0) {
        const errorMessage = result.errors.slice(0, 3).join('\n') + 
          (result.errors.length > 3 ? `\n...还有 ${result.errors.length - 3} 个错误` : '')
        toast.error("部分环境同步失败", {
          description: errorMessage
        })
      }
      
      // 清空选择并关闭对话框
      setSelectedCodes([])
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error("同步失败", {
        description: error instanceof Error ? error.message : "未知错误"
      })
    }
  })

  // 过滤环境列表
  const filteredEnvironments = useMemo(() => {
    if (!searchTerm) return environments
    
    const term = searchTerm.toLowerCase()
    return environments.filter(env => 
      (env.container_name || "").toLowerCase().includes(term) ||
      (env.container_code || "").toLowerCase().includes(term) ||
      (env.tag_name || "").toLowerCase().includes(term) ||
      (env.remark || "").toLowerCase().includes(term)
    )
  }, [environments, searchTerm])

  // 处理全选/取消全选
  const handleSelectAll = useCallback(() => {
    if (selectedCodes.length === filteredEnvironments.length) {
      setSelectedCodes([])
    } else {
      setSelectedCodes(filteredEnvironments.map(env => env.container_code))
    }
  }, [filteredEnvironments, selectedCodes.length])

  // 处理单个环境选择
  const handleEnvironmentToggle = useCallback((containerCode: string) => {
    setSelectedCodes(prev => 
      prev.includes(containerCode)
        ? prev.filter(code => code !== containerCode)
        : [...prev, containerCode]
    )
  }, [])

  // 处理同步
  const handleSync = useCallback(() => {
    if (selectedCodes.length === 0) {
      toast.warning("请选择要同步的环境")
      return
    }

    syncMutation.mutate({ container_codes: selectedCodes })
  }, [selectedCodes, syncMutation])

  // 重置状态
  const resetState = useCallback(() => {
    setSearchTerm("")
    setSelectedCodes([])
  }, [])

  // 监听对话框关闭，重置状态
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      resetState()
    }
    onOpenChange(newOpen)
  }, [onOpenChange, resetState])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            同步HubStudio环境
          </DialogTitle>
          <DialogDescription>
            从HubStudio获取环境列表，选择要同步到本地数据库的环境。已存在的环境将被跳过。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* 搜索和操作栏 */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索环境名称、实例ID、标签或备注..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

          {/* 选择统计 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filteredEnvironments.length > 0 && selectedCodes.length === filteredEnvironments.length}
                onCheckedChange={handleSelectAll}
                disabled={filteredEnvironments.length === 0}
              />
              <span className="text-sm text-muted-foreground">
                全选 ({filteredEnvironments.length} 个环境)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                已选择 {selectedCodes.length} 个
              </Badge>
              {filteredEnvironments.length !== environments.length && (
                <Badge variant="outline">
                  过滤后 {filteredEnvironments.length} / {environments.length}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* 环境列表 */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-2">
              {isLoading ? (
                // 加载状态
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : error ? (
                // 错误状态
                <div className="flex items-center justify-center p-8 text-center">
                  <div className="space-y-2">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      获取HubStudio环境列表失败
                    </p>
                    <p className="text-xs text-destructive">
                      {error instanceof Error ? error.message : "未知错误"}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      重试
                    </Button>
                  </div>
                </div>
              ) : filteredEnvironments.length === 0 ? (
                // 空状态
                <div className="flex items-center justify-center p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "未找到匹配的环境" : "暂无可同步的环境"}
                    </p>
                    {searchTerm && (
                      <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                        清除搜索
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                // 环境列表
                filteredEnvironments.map((env) => (
                  <div
                    key={env.container_code}
                    className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedCodes.includes(env.container_code) ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => handleEnvironmentToggle(env.container_code)}
                  >
                    <Checkbox
                      checked={selectedCodes.includes(env.container_code)}
                      onCheckedChange={() => handleEnvironmentToggle(env.container_code)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{env.container_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {env.container_code}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {env.tag_name && (
                          <p className="text-xs text-muted-foreground">
                            标签: {env.tag_name}
                          </p>
                        )}
                        {env.remark && (
                          <p className="text-xs text-muted-foreground truncate">
                            备注: {env.remark}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          创建时间: {env.create_time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSync}
            disabled={selectedCodes.length === 0 || syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                同步中...
              </>
            ) : (
              `同步选定环境 (${selectedCodes.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 