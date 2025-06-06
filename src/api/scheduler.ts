import { apiRequest } from "@/lib/api";
import { 
  Pipeline, 
  PipelineRun, 
  PipelineRunInput, 
  PipelineQuery,
  PipelineRunQuery,
  PipelineCreate,
  PipelineUpdate,
  PipelineTask,
  PipelineTaskCreate,
  PipelineTaskUpdate,
  PipelineTaskQuery,
  PipelineTrigger,
  PipelineTriggerCreate,
  PipelineTriggerUpdate,
  PipelineTriggerQuery,
  PipelineList,
  PipelineRunList,
  PipelineTaskList,
  PipelineTriggerList
} from "@/types/scheduler";

/**
 * 调度器API服务
 */
export const schedulerApi = {
  // 管道相关API
  pipelines: {
    /**
     * 获取管道列表（分页查询）
     */
    getList: (query: PipelineQuery) => 
      apiRequest<PipelineList>("/api/v1/system/scheduler/pipelines/list", "POST", query),

    /**
     * 获取单个管道详情
     */
    getDetail: (pipelineId: string) => 
      apiRequest<Pipeline>(`/api/v1/system/scheduler/pipelines/${pipelineId}`, "GET"),

    /**
     * 创建管道
     */
    create: (data: PipelineCreate) =>
      apiRequest<Pipeline>("/api/v1/system/scheduler/pipelines/create", "POST", data),

    /**
     * 更新管道
     */
    update: (pipelineId: string, data: PipelineUpdate) =>
      apiRequest<Pipeline>(`/api/v1/system/scheduler/pipelines/${pipelineId}`, "PUT", data),

    /**
     * 删除管道
     */
    delete: (pipelineId: string) =>
      apiRequest<void>(`/api/v1/system/scheduler/pipelines/${pipelineId}`, "DELETE"),

    /**
     * 启用管道
     */
    enable: (pipelineId: string) =>
      apiRequest<void>(`/api/v1/system/scheduler/pipelines/${pipelineId}/enable`, "PUT"),

    /**
     * 禁用管道
     */
    disable: (pipelineId: string) =>
      apiRequest<void>(`/api/v1/system/scheduler/pipelines/${pipelineId}/disable`, "PUT"),

    /**
     * 批量启用管道
     */
    batchEnable: (pipelineIds: string[]) =>
      apiRequest<void>("/api/v1/system/scheduler/pipelines/batch-enable", "POST", { pipeline_ids: pipelineIds }),

    /**
     * 批量禁用管道
     */
    batchDisable: (pipelineIds: string[]) =>
      apiRequest<void>("/api/v1/system/scheduler/pipelines/batch-disable", "POST", { pipeline_ids: pipelineIds }),

    /**
     * 获取管道输入参数的JSON模式
     */
    getInputSchema: (pipelineId: string) => 
      apiRequest<any>(`/api/v1/system/scheduler/pipelines/${pipelineId}/input-schema`, "GET"),

    /**
     * 运行管道
     */
    run: (pipelineId: string, input: PipelineRunInput) => 
      apiRequest<PipelineRun>(`/api/v1/system/scheduler/pipelines/${pipelineId}/run`, "POST", input),
  },

  // 管道任务相关API
  tasks: {
    /**
     * 获取管道任务列表
     */
    getList: (pipelineId: string) =>
      apiRequest<PipelineTask[]>(`/api/v1/system/scheduler/pipelines/${pipelineId}/tasks`, "GET"),

    /**
     * 创建任务
     */
    create: (pipelineId: string, data: PipelineTaskCreate) =>
      apiRequest<PipelineTask>(`/api/v1/system/scheduler/pipelines/${pipelineId}/tasks`, "POST", data),

    /**
     * 更新任务
     */
    update: (taskId: number, data: PipelineTaskUpdate) =>
      apiRequest<PipelineTask>(`/api/v1/system/scheduler/pipelines/tasks/${taskId}`, "PUT", data),

    /**
     * 删除任务
     */
    delete: (taskId: number) =>
      apiRequest<boolean>(`/api/v1/system/scheduler/pipelines/tasks/${taskId}`, "DELETE"),
  },

  // 管道触发器相关API
  triggers: {
    /**
     * 获取管道触发器列表
     */
    getList: (pipelineId: string) =>
      apiRequest<PipelineTrigger[]>(`/api/v1/system/scheduler/pipelines/${pipelineId}/triggers`, "GET"),

    /**
     * 创建触发器
     */
    create: (pipelineId: string, data: PipelineTriggerCreate) =>
      apiRequest<PipelineTrigger>(`/api/v1/system/scheduler/pipelines/${pipelineId}/triggers`, "POST", data),

    /**
     * 更新触发器
     */
    update: (triggerId: number, data: PipelineTriggerUpdate) =>
      apiRequest<PipelineTrigger>(`/api/v1/system/scheduler/pipelines/triggers/${triggerId}`, "PUT", data),

    /**
     * 删除触发器
     */
    delete: (triggerId: number) =>
      apiRequest<boolean>(`/api/v1/system/scheduler/pipelines/triggers/${triggerId}`, "DELETE"),
  },

  // 运行记录相关API
  runs: {
    /**
     * 获取运行记录列表（分页查询）
     */
    getList: (query: PipelineRunQuery) =>
      apiRequest<PipelineRunList>("/api/v1/system/scheduler/runs/list", "POST", query),

    /**
     * 获取单个运行记录详情
     */
    getDetail: (runId: number) => 
      apiRequest<PipelineRun>(`/api/v1/system/scheduler/runs/${runId}`, "GET"),

    /**
     * 删除运行记录
     */
    delete: (runId: number) =>
      apiRequest<void>(`/api/v1/system/scheduler/runs/${runId}`, "DELETE"),

    /**
     * 批量删除运行记录
     */
    batchDelete: (runIds: number[]) =>
      apiRequest<void>("/api/v1/system/scheduler/runs/batch-delete", "POST", { run_ids: runIds }),

    /**
     * 停止运行中的管道
     */
    stop: (runId: number) =>
      apiRequest<void>(`/api/v1/system/scheduler/runs/stop/${runId}`, "POST"),

    /**
     * 获取运行日志
     */
    getLogs: (runId: number) => 
      apiRequest<string>(`/api/v1/system/scheduler/runs/${runId}/logs`, "GET"),

    /**
     * 获取任务运行数据
     */
    getTaskData: (runId: number, taskId: string) => 
      apiRequest<any>(`/api/v1/system/scheduler/runs/${runId}/data/${taskId}`, "GET"),

    /**
     * 获取运行统计摘要
     */
    getStats: () =>
      apiRequest<any>("/api/v1/system/scheduler/runs/stats/summary", "GET"),
  },

  // 统计信息相关API
  stats: {
    /**
     * 获取调度器概览统计
     */
    getOverview: () =>
      apiRequest<any>("/api/v1/system/scheduler/stats/overview", "GET"),

    /**
     * 获取管道汇总统计
     */
    getPipelineSummary: () =>
      apiRequest<any>("/api/v1/system/scheduler/stats/pipeline-summary", "GET"),

    /**
     * 获取运行趋势统计
     */
    getRunTrends: () =>
      apiRequest<any>("/api/v1/system/scheduler/stats/run-trends", "GET"),
  }
}; 