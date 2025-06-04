"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Settings, Play, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { schedulerApi } from "@/api/scheduler";
import { Pipeline } from "@/types/scheduler";

// 子页面组件（暂时使用占位符）
import { TaskManagement } from "./components/task-management";
import { TriggerManagement } from "./components/trigger-management";
import { RunLogs } from "./components/run-logs";

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params.id as string;

  // 查询管道详情
  const { data: pipeline, isLoading } = useQuery({
    queryKey: ["scheduler", "pipelines", "detail", pipelineId],
    queryFn: () => schedulerApi.pipelines.getDetail(pipelineId),
    enabled: !!pipelineId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">加载中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">管道不存在</div>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="mt-4"
            >
              返回
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{pipeline.name}</h1>
              <p className="text-muted-foreground">
                管道ID: {pipeline.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={pipeline.enabled ? "default" : "secondary"}>
              {pipeline.enabled ? "已启用" : "已禁用"}
            </Badge>
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/system/scheduler/${pipeline.id}/edit`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              编辑
            </Button>
          </div>
        </div>

        {/* 管道基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">管道名称</label>
                <div className="mt-1">{pipeline.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">状态</label>
                <div className="mt-1">
                  <Badge variant={pipeline.enabled ? "default" : "secondary"}>
                    {pipeline.enabled ? "已启用" : "已禁用"}
                  </Badge>
                </div>
              </div>
              {pipeline.description && (
                <div className="col-span-full">
                  <label className="text-sm font-medium text-muted-foreground">描述</label>
                  <div className="mt-1">{pipeline.description}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                <div className="mt-1">
                  {pipeline.create_time ? new Date(pipeline.create_time).toLocaleString('zh-CN') : '-'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">更新时间</label>
                <div className="mt-1">
                  {pipeline.update_time ? new Date(pipeline.update_time).toLocaleString('zh-CN') : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 标签页内容 */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">
              <Settings className="h-4 w-4 mr-2" />
              任务管理
            </TabsTrigger>
            <TabsTrigger value="triggers">
              <Play className="h-4 w-4 mr-2" />
              触发器管理
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="h-4 w-4 mr-2" />
              运行日志
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks">
            <TaskManagement pipelineId={pipelineId} />
          </TabsContent>
          
          <TabsContent value="triggers">
            <TriggerManagement pipelineId={pipelineId} />
          </TabsContent>
          
          <TabsContent value="logs">
            <RunLogs pipelineId={pipelineId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 