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
}

/**
 * 触发器信息
 */
export interface Trigger {
  id: string;
  name?: string;
  schedule?: string;
  next_fire_time?: string;
}

/**
 * 管道信息
 */
export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  triggers: Trigger[];
  tasks: Task[];
  params?: any;
}

/**
 * 任务信息
 */
export interface Task {
  id: string;
  description?: string;
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
export interface PipelineQuery {
  pipeline_id?: string;
  trigger_id?: string;
}

/**
 * 运行查询参数
 */
export interface RunQuery {
  pipeline_id?: string;
  trigger_id?: string;
} 