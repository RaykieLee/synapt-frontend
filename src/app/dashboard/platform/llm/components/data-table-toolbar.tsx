import { useState, useCallback, useRef, useMemo } from "react"
import { Table } from "@tanstack/react-table"
import { X, Filter, ChevronDown, Plus, Settings, Zap, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import debounce from "lodash/debounce"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/base/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTableViewOptions } from "@/components/shared/data-table"
import { LLMConfigSearchParams } from "@/types/llm"
import { mcpAPI, MCPServerStatus } from "@/api/mcp"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch: (searchParams: LLMConfigSearchParams) => void
  onAddNew?: () => void
  onBatchDelete?: (selectedIds: string[]) => void
  onMCPConfig?: () => void
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  onAddNew,
  onBatchDelete,
  onMCPConfig,
}: DataTableToolbarProps<TData>) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [mcpPopoverOpen, setMcpPopoverOpen] = useState(false)
  const searchParamsRef = useRef<LLMConfigSearchParams>({})
  const queryClient = useQueryClient()

  // 获取MCP状态
  const { data: mcpStatus, refetch: refetchMCPStatus, isFetching: isFetchingMCPStatus } = useQuery({
    queryKey: ["mcp-status"],
    queryFn: mcpAPI.getStatus,
    refetchInterval: 10000, // 10秒刷新一次
  })

  // 重新加载MCP配置
  const reloadConfigMutation = useMutation({
    mutationFn: mcpAPI.reloadConfig,
    onSuccess: () => {
      toast.success("MCP配置重新加载成功")
      refetchMCPStatus() // 重新获取状态
    },
    onError: (error: any) => {
      toast.error(`重新加载失败: ${error.message || '未知错误'}`)
    },
  })

  // 测试连接
  const testConnectionMutation = useMutation({
    mutationFn: mcpAPI.testConnection,
    onSuccess: () => {
      toast.success("连接测试完成")
      refetchMCPStatus() // 重新获取状态
    },
    onError: (error: any) => {
      toast.error(`测试连接失败: ${error.message || '未知错误'}`)
    },
  })

  // 防抖搜索
  const debouncedSearch = useMemo(() => debounce(() => {
    if (onSearch) onSearch(searchParamsRef.current)
  }, 500), [onSearch])

  const updateSearchParams = useCallback((key: string, value: string | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch()
  }, [debouncedSearch])

  // 获取MCP状态图标和颜色
  const getMCPStatusInfo = () => {
    if (!mcpStatus) {
      return { icon: AlertCircle, color: "text-gray-500", label: "未知" }
    }

    const { configured, config_valid, servers } = mcpStatus
    
    if (!configured) {
      return { icon: XCircle, color: "text-gray-500", label: "未配置" }
    }

    if (!config_valid) {
      return { icon: XCircle, color: "text-red-500", label: "配置无效" }
    }

    const connectedCount = servers.filter((s: MCPServerStatus) => s.status === 'connected').length
    const configuredCount = servers.filter((s: MCPServerStatus) => s.status === 'configured').length
    const errorCount = servers.filter((s: MCPServerStatus) => s.status === 'error').length

    if (connectedCount > 0) {
      return { icon: CheckCircle, color: "text-green-500", label: `${connectedCount}个已连接` }
    } else if (configuredCount > 0) {
      return { icon: AlertCircle, color: "text-yellow-500", label: `${configuredCount}个已配置` }
    } else if (errorCount > 0) {
      return { icon: XCircle, color: "text-red-500", label: `${errorCount}个错误` }
    } else {
      return { icon: AlertCircle, color: "text-gray-500", label: "无服务器" }
    }
  }

  const statusInfo = getMCPStatusInfo()

  // 计算活跃筛选器数量（排除主要搜索字段）
  const getActiveFiltersCount = () => {
    const filters = table.getState().columnFilters
    const excludeColumns = ["config_name", "provider"] // 排除主要搜索字段
    return filters.filter(filter => 
      !excludeColumns.includes(filter.id) && filter.value
    ).length
  }

  const activeFiltersCount = getActiveFiltersCount()
  const isFiltered = table.getState().columnFilters.length > 0

  // 清除所有筛选
  const clearAllFilters = () => {
    table.resetColumnFilters()
    searchParamsRef.current = {}
    if (onSearch) onSearch({})
  }

  // 清除高级筛选
  const clearAdvancedFilters = () => {
    // 保留主要搜索字段，清除其他筛选
    const mainFilters = ["config_name", "provider"]
    const newParams: LLMConfigSearchParams = {}
    
    mainFilters.forEach(field => {
      const value = table.getColumn(field)?.getFilterValue() as string
      if (value) {
        if (field === "config_name") {
          newParams.config_name = value
        } else if (field === "provider") {
          newParams.provider = value
        }
      }
    })
    
    // 清除非主要字段的筛选
    table.getState().columnFilters.forEach(filter => {
      if (!mainFilters.includes(filter.id)) {
        table.getColumn(filter.id)?.setFilterValue("")
      }
    })
    
    searchParamsRef.current = newParams
    if (onSearch) onSearch(newParams)
  }

  const selectedCount = table.getSelectedRowModel().rows.length

  const handleBatchDelete = () => {
    if (onBatchDelete) {
      const selectedIds = table.getSelectedRowModel().rows.map(
        (row) => (row.original as any).id
      )
      onBatchDelete(selectedIds)
      table.resetRowSelection()
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 主要搜索字段 */}
        <Input
          placeholder="搜索配置名称..."
          value={(table.getColumn("config_name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => {
            table.getColumn("config_name")?.setFilterValue(e.target.value)
            updateSearchParams("config_name", e.target.value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        <Select
          value={(table.getColumn("provider")?.getFilterValue() as string) || "all"}
          onValueChange={(value) => {
            const filterValue = value === "all" ? "" : value
            table.getColumn("provider")?.setFilterValue(filterValue)
            updateSearchParams("provider", value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="全部提供商" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部提供商</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="azure">Azure</SelectItem>
            <SelectItem value="deepseek">DeepSeek</SelectItem>
            <SelectItem value="moonshot">Moonshot</SelectItem>
            <SelectItem value="other">其他</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={(table.getColumn("model_type")?.getFilterValue() as string) || "all"}
          onValueChange={(value) => {
            const filterValue = value === "all" ? "" : value
            table.getColumn("model_type")?.setFilterValue(filterValue)
            updateSearchParams("model_type", value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="模型类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="LLM">LLM</SelectItem>
            <SelectItem value="Embedding">Embedding</SelectItem>
            <SelectItem value="Speech2text">Speech2text</SelectItem>
            <SelectItem value="TTS">TTS</SelectItem>
          </SelectContent>
        </Select>

        {/* 更多筛选 */}
        <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed relative">
              <Filter className="mr-2 h-4 w-4" />
              更多筛选
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">高级筛选</h4>
                <Button variant="ghost" size="sm" onClick={clearAdvancedFilters}>
                  清除
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">模型名称</label>
                  <Input
                    placeholder="搜索模型..."
                    value={(table.getColumn("model_name")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => {
                      table.getColumn("model_name")?.setFilterValue(e.target.value)
                      updateSearchParams("model_name", e.target.value)
                    }}
                    className="h-8"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">状态</label>
                  <Select
                    value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
                    onValueChange={(value) => {
                      const filterValue = value === "all" ? "" : value
                      table.getColumn("status")?.setFilterValue(filterValue)
                      updateSearchParams("status", value === "all" ? undefined : value)
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="0">启用</SelectItem>
                      <SelectItem value="1">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {activeFiltersCount > 0 ? `已应用 ${activeFiltersCount} 个筛选条件` : "未应用筛选条件"}
                </p>
                <Button size="sm" onClick={() => setMoreFiltersOpen(false)}>
                  完成
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 重置按钮 */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* 右侧按钮 */}
      <div className="flex items-center space-x-2">
        {/* 批量删除按钮 */}
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={handleBatchDelete}
          >
            删除选中 ({selectedCount})
          </Button>
        )}
        
        {/* 显示列选择 */}
        <DataTableViewOptions
          table={table}
          columnLabels={{
            config_name: "配置名称",
            model_type: "模型类型",
            provider: "提供商",
            model_name: "模型名称",
            status: "状态",
            description: "描述",
            create_time: "创建时间"
          }}
        />
        
        {/* MCP状态按钮 */}
        <Popover open={mcpPopoverOpen} onOpenChange={setMcpPopoverOpen}>
          <PopoverTrigger>
            <Button variant="outline" size="sm" className="h-8">
              <statusInfo.icon className={`mr-2 h-4 w-4 ${statusInfo.color}`} />
              MCP
              <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                {statusInfo.label}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">MCP服务器状态</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchMCPStatus()}
                  disabled={isFetchingMCPStatus}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isFetchingMCPStatus ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
              
              {mcpStatus?.servers && mcpStatus.servers.length > 0 ? (
                <div className="space-y-2">
                  {mcpStatus.servers.map((server: MCPServerStatus) => (
                    <div key={server.name} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {server.status === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {server.status === 'configured' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                        {server.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                        {server.status === 'unknown' && <AlertCircle className="h-4 w-4 text-gray-500" />}
                        <span className="font-medium">{server.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {server.tools.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {server.tools.length} 工具
                          </Badge>
                        )}
                        <Badge 
                          variant={server.status === 'connected' ? 'default' : 
                                  server.status === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {server.status === 'connected' ? '已连接' :
                           server.status === 'configured' ? '已配置' :
                           server.status === 'error' ? '错误' : '未知'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {mcpStatus?.configured ? '暂无可用的MCP服务器' : '尚未配置MCP服务器'}
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMcpPopoverOpen(false)
                    onMCPConfig?.()
                  }}
                  className="flex-1"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  配置MCP
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reloadConfigMutation.mutate()}
                  disabled={reloadConfigMutation.isPending}
                  className="flex-1"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${reloadConfigMutation.isPending ? 'animate-spin' : ''}`} />
                  重新加载
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnectionMutation.mutate()}
                  disabled={testConnectionMutation.isPending}
                  className="flex-1"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  测试连接
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* 新增配置按钮 */}
        {onAddNew && (
          <Button onClick={onAddNew} size="sm" className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            新增配置
          </Button>
        )}
      </div>
    </div>
  )
}