import { apiRequest } from "@/lib/api";
import { 
  Pipeline, 
  PipelineRun, 
  PipelineRunInput, 
  PipelineQuery, 
  RunQuery 
} from "@/types/scheduler";

/**
 * 调度器API服务
 */
export const schedulerApi = {
  // 管道相关API
  pipelines: {
    /**
     * 获取所有管道列表
     */
    getList: () => apiRequest<Pipeline[]>("/api/v1/system/scheduler/pipelines/list", "GET"),

    /**
     * 获取单个管道详情
     */
    getDetail: (pipelineId: string) => 
      apiRequest<Pipeline>(`/api/v1/system/scheduler/pipelines/${pipelineId}`, "GET"),

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

  // 运行记录相关API
  runs: {
    /**
     * 获取运行记录列表
     */
    getList: (query?: RunQuery) => {
      const params = new URLSearchParams();
      if (query?.pipeline_id) params.append('pipeline_id', query.pipeline_id);
      if (query?.trigger_id) params.append('trigger_id', query.trigger_id);
      
      const url = `/api/v1/system/scheduler/runs/list?${params.toString()}`;
      return apiRequest<PipelineRun[]>(url, "GET");
    },

    /**
     * 获取单个运行记录详情
     */
    getDetail: (runId: number) => 
      apiRequest<PipelineRun>(`/api/v1/system/scheduler/runs/${runId}`, "GET"),

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
  }
}; 