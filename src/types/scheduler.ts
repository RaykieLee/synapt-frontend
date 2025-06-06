/**
 * 分页查询参数基类
 */
export interface PageParams {
  page_num?: number;
  page_size?: number;
  sorts?: Array<{
    field: string;
    order: "asc" | "desc";
  }>;
  params?: Record<string, any>;
}

/**
 * 管道运行状态枚举
 */
export enum PipelineRunStatus {
  PENDING = "pending",
  RUNNING = "running", 
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

/**
 * 任务运行信息
 */
export interface TaskRun {
  duration?: number;
  has_output: boolean;
  status?: PipelineRunStatus;
  task_id: string;
}

/**
 * 通知规则
 */
export interface NotificationRule {
  channels: string[];
  pipeline_status: PipelineRunStatus[];
}

/**
 * 管道运行基础信息
 */
export interface PipelineRunBase {
  pipeline_id: string;
  trigger_id: string;
  status: PipelineRunStatus;
  start_time: string;
  tasks_run: TaskRun[];
}

/**
 * 管道运行完整信息
 */
export interface PipelineRun extends PipelineRunBase {
  id: number;
  duration: number;
  end_time?: string;
  error_message?: string;
  create_by?: string;
  create_time?: string;
}

/**
 * 触发器信息（简化版）
 */
export interface Trigger {
  id: string;
  name?: string;
  schedule?: string;
  next_fire_time?: string;
}

/**
 * 任务信息
 */
export interface Task {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  enabled?: boolean;
}

/**
 * 管道运行输入参数
 */
export interface PipelineRunInput {
  trigger_id?: string;
  params?: Record<string, any>;
}

/**
 * 管道查询参数
 */
export interface PipelineQuery extends PageParams {
  params?: {
    keywords?: {
      name?: string;
      description?: string;
    };
    enabled?: number; // 1-启用，0-禁用
    search_mode?: string;
  };
}

/**
 * 运行查询参数
 */
export interface PipelineRunQuery extends PageParams {
  params?: {
    pipeline_id?: string;
    trigger_id?: string;
    status?: string;
    keywords?: {
      pipeline_id?: string;
    };
    search_mode?: string;
  };
}

// ========== 新增：完整的CRUD类型定义 ==========

/**
 * 管道任务基础信息
 */
export interface PipelineTaskBase {
  task_id: string;
  name: string;
  description?: string;
  task_type?: string;
  config?: string; // JSON字符串
  sort_order?: number;
  enabled?: boolean;
}

/**
 * 管道任务完整信息
 */
export interface PipelineTask extends PipelineTaskBase {
  id: number;
  pipeline_id: string;
  create_by?: string;
  create_time?: string;
  update_by?: string;
  update_time?: string;
}

/**
 * 创建管道任务
 */
export interface PipelineTaskCreate extends PipelineTaskBase {
  pipeline_id: string;
}

/**
 * 更新管道任务
 */
export interface PipelineTaskUpdate {
  name?: string;
  description?: string;
  task_type?: string;
  config?: string;
  sort_order?: number;
  enabled?: boolean;
}

/**
 * 管道触发器基础信息
 */
export interface PipelineTriggerBase {
  trigger_id: string;
  name: string;
  description?: string;
  trigger_type: string; // manual, cron, interval, date
  schedule_config?: string; // JSON字符串
  params?: string; // JSON字符串
  enabled?: boolean;
  paused?: boolean;
}

/**
 * 管道触发器完整信息（数据库版本）
 */
export interface PipelineTrigger extends PipelineTriggerBase {
  id: number;
  pipeline_id: string;
  schedule?: string; // 兼容旧版API的schedule字段
  next_fire_time?: string; // 下次执行时间
  create_by?: string;
  create_time?: string;
  update_by?: string;
  update_time?: string;
}

/**
 * 创建管道触发器
 */
export interface PipelineTriggerCreate extends PipelineTriggerBase {
  pipeline_id: string;
}

/**
 * 更新管道触发器
 */
export interface PipelineTriggerUpdate {
  name?: string;
  description?: string;
  trigger_type?: string;
  schedule_config?: string;
  params?: string;
  enabled?: boolean;
  paused?: boolean;
}

/**
 * 管道信息
 */
export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  triggers: PipelineTrigger[];
  tasks: PipelineTask[];
  params?: any;
  create_by?: string;
  create_time?: string;
  update_by?: string;
  update_time?: string;
}

/**
 * 创建管道
 */
export interface PipelineCreate {
  id?: string;
  name: string;
  description?: string;
  enabled?: boolean;
  params_schema?: string; // JSON字符串
  tasks?: PipelineTaskBase[];
  triggers?: PipelineTriggerBase[];
}

/**
 * 更新管道
 */
export interface PipelineUpdate {
  name?: string;
  description?: string;
  enabled?: boolean;
  params_schema?: string;
}

/**
 * 管道详情信息（包含完整的任务和触发器）
 */
export interface PipelineDetail {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  params_schema?: string;
  create_by?: string;
  create_time?: string;
  update_by?: string;
  update_time?: string;
  tasks: PipelineTask[];
  triggers: PipelineTrigger[];
}

// ========== 查询参数类型 ==========

/**
 * 管道任务查询参数
 */
export interface PipelineTaskQuery extends PageParams {
  params?: {
    pipeline_id?: string;
    keywords?: {
      name?: string;
      task_type?: string;
    };
    enabled?: number;
    search_mode?: string;
  };
}

/**
 * 管道触发器查询参数
 */
export interface PipelineTriggerQuery extends PageParams {
  params?: {
    pipeline_id?: string;
    keywords?: {
      name?: string;
      trigger_type?: string;
    };
    enabled?: number;
    search_mode?: string;
  };
}

// ========== 列表响应类型 ==========

/**
 * 管道列表响应
 */
export interface PipelineList {
  total: number;
  list: Pipeline[];
  page_num: number;
  page_size: number;
  pages: number;
}

/**
 * 管道运行记录列表响应
 */
export interface PipelineRunList {
  total: number;
  list: PipelineRun[];
  page_num: number;
  page_size: number;
  pages: number;
}

/**
 * 管道任务列表响应
 */
export interface PipelineTaskList {
  total: number;
  list: PipelineTask[];
  page_num: number;
  page_size: number;
  pages: number;
}

/**
 * 管道触发器列表响应
 */
export interface PipelineTriggerList {
  total: number;
  list: PipelineTrigger[];
  page_num: number;
  page_size: number;
  pages: number;
}

/**
 * 管道详情列表响应
 */
export interface PipelineDetailList {
  total: number;
  list: PipelineDetail[];
  page_num: number;
  page_size: number;
  pages: number;
}

// ========== 搜索参数类型 ==========

/**
 * 管道搜索参数
 */
export interface PipelineSearchParams {
  name?: string;
  description?: string;
  enabled?: number; // 1-启用，0-禁用
}

/**
 * 运行记录搜索参数
 */
export interface PipelineRunSearchParams {
  pipeline_id?: string;
  status?: string;
}

/**
 * 任务搜索参数
 */
export interface PipelineTaskSearchParams {
  name?: string;
  task_type?: string;
  enabled?: number;
}

/**
 * 触发器搜索参数
 */
export interface PipelineTriggerSearchParams {
  name?: string;
  trigger_type?: string;
  enabled?: number;
} 