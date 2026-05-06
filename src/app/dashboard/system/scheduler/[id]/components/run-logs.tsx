"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Eye, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { schedulerApi } from "@/api/scheduler";
import { PipelineRunQuery, PipelineRunList, PipelineRunStatus } from "@/types/scheduler";

interface RunLogsProps {
  pipelineId: string;
}

// 获取状态徽章
const getStatusBadge = (status: PipelineRunStatus) => {
  const statusConfig: Record<PipelineRunStatus, {
    variant: "default" | "destructive" | "outline" | "secondary";
    text: string;
    className?: string;
  }> = {
    [PipelineRunStatus.PENDING]: { 
      variant: "secondary", 
      text: "等待中" 
    },
    [PipelineRunStatus.RUNNING]: { 
      variant: "default", 
      text: "运行中" 
    },
    [PipelineRunStatus.COMPLETED]: { 
      variant: "default", 
      text: "已完成",
      className: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
    },
    [PipelineRunStatus.FAILED]: { 
      variant: "destructive", 
      text: "失败" 
    },
    [PipelineRunStatus.CANCELLED]: { 
      variant: "secondary", 
      text: "已取消" 
    },
  };

  const config = statusConfig[status] || statusConfig[PipelineRunStatus.PENDING];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.text}
    </Badge>
  );
};

// 格式化持续时间
const formatDuration = (duration: number) => {
  if (duration < 1000) {
    return `${Math.round(duration)}ms`;
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`;
  } else {
    return `${(duration / 60000).toFixed(1)}m`;
  }
};

export function RunLogs({ pipelineId }: RunLogsProps) {
  const [query, setQuery] = useState<PipelineRunQuery>({
    page_num: 1,
    page_size: 20,
    sorts: [
      {
        field: "start_time",
        order: "desc"
      }
    ],
    params: {
      pipeline_id: pipelineId,
      search_mode: "and"
    }
  });

  // 查询运行记录列表
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["scheduler", "runs", "list", pipelineId, query],
    queryFn: () => schedulerApi.runs.getList(query),
    enabled: !!pipelineId,
    refetchInterval: 5000, // 每5秒自动刷新
  });

  // 从响应中提取数据
  const runData = response as PipelineRunList || { list: [], total: 0, pages: 1, page_num: 1, page_size: 20 };
  const list = runData.list || [];

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>运行日志</CardTitle>
          <Button size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-lg">加载中...</div>
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无运行记录
            <div className="mt-2 text-sm">
              管道还未执行过或运行记录已被清理
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              找到 {list.length} 条运行记录
            </div>
            <div className="space-y-3">
              {list.map((run) => (
                <div key={run.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">运行 #{run.id}</h3>
                      {getStatusBadge(run.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(run.start_time).toLocaleString('zh-CN')}
                      </span>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">触发器ID:</span>
                      <div className="font-medium">{run.trigger_id || '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">运行时长:</span>
                      <div className="font-medium">
                        {run.duration ? formatDuration(run.duration) : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">任务数量:</span>
                      <div className="font-medium">{run.tasks_run?.length || 0}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">结束时间:</span>
                      <div className="font-medium">
                        {run.end_time ? new Date(run.end_time).toLocaleString('zh-CN') : '-'}
                      </div>
                    </div>
                  </div>

                  {run.error_message && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                      <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">错误信息:</div>
                      <div className="text-sm text-red-700 dark:text-red-400">{run.error_message}</div>
                    </div>
                  )}

                  {run.tasks_run && run.tasks_run.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-muted-foreground mb-2">任务执行情况:</div>
                      <div className="grid gap-2">
                        {run.tasks_run.map((task, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
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
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 