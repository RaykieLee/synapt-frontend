"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Play, Pause } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { schedulerApi } from "@/api/scheduler";
import { PipelineTriggerQuery, PipelineTriggerList } from "@/types/scheduler";

interface TriggerManagementProps {
  pipelineId: string;
}

export function TriggerManagement({ pipelineId }: TriggerManagementProps) {
  const [query, setQuery] = useState<PipelineTriggerQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "create_time",
        order: "desc"
      }
    ],
    params: {
      pipeline_id: pipelineId,
      search_mode: "and"
    }
  });

  // 查询触发器列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["scheduler", "triggers", "list", pipelineId, query],
    queryFn: () => schedulerApi.triggers.getList(pipelineId),
    enabled: !!pipelineId,
  });

  // 从响应中提取数据
  const list = response || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>触发器管理</CardTitle>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            添加触发器
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
            暂无触发器数据
            <div className="mt-4">
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                创建第一个触发器
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              找到 {list.length} 个触发器
            </div>
            <div className="grid gap-4">
              {list.map((trigger) => (
                <div key={trigger.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{trigger.name}</h3>
                        <Badge variant={trigger.enabled ? "default" : "secondary"}>
                          {trigger.enabled ? "启用" : "禁用"}
                        </Badge>
                        {trigger.paused && (
                          <Badge variant="outline">
                            <Pause className="h-3 w-3 mr-1" />
                            暂停
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        触发器ID: {trigger.trigger_id}
                      </p>
                      {trigger.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {trigger.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-muted-foreground">
                          类型: {trigger.trigger_type}
                        </span>
                        {trigger.schedule_config && (
                          <span className="text-sm text-muted-foreground">
                            配置: {trigger.schedule_config}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        立即执行
                      </Button>
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