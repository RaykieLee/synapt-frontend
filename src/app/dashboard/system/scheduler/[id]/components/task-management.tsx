"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { SortingState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { schedulerApi } from "@/api/scheduler";
import { PipelineTaskQuery, PipelineTaskList } from "@/types/scheduler";

interface TaskManagementProps {
  pipelineId: string;
}

export function TaskManagement({ pipelineId }: TaskManagementProps) {
  const [query, setQuery] = useState<PipelineTaskQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "sort_order",
        order: "asc"
      }
    ],
    params: {
      pipeline_id: pipelineId,
      search_mode: "and"
    }
  });

  // 查询任务列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["scheduler", "tasks", "list", pipelineId, query],
    queryFn: () => schedulerApi.tasks.getList(pipelineId),
    enabled: !!pipelineId,
  });

  // 从响应中提取数据
  const list = response || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>任务管理</CardTitle>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            添加任务
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
            暂无任务数据
            <div className="mt-4">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                创建第一个任务
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              找到 {list.length} 个任务
            </div>
            <div className="grid gap-4">
              {list.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{task.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        任务ID: {task.task_id}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      {task.task_type && (
                        <p className="text-sm text-muted-foreground">
                          类型: {task.task_type}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      排序: {task.sort_order || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 