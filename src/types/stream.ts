// 视频流状态枚举
export enum StreamStatus {
  Online = '0',  // 在线
  Offline = '1', // 离线
  Error = '2',   // 错误
}

// 视频流基本信息
export interface Stream {
  stream_id: number;              // 视频流ID
  stream_name: string;            // 视频流名称
  stream_url: string;             // 视频流地址
  stream_type?: string;           // 视频流类型
  stream_transcode_url?: string;  // 转码后地址
  status: StreamStatus;           // 状态
  description?: string;           // 描述
  remark?: string;                // 备注
  create_by?: string;             // 创建者
  create_time: string;            // 创建时间
  update_by?: string;             // 更新者
  update_time?: string;           // 更新时间
}

// 视频流查询参数
export interface StreamQuery {
  keywords?: {
    stream_name?: string;         // 按名称搜索
  };
  status?: StreamStatus;          // 按状态筛选
  time_range?: {                  // 时间范围
    create_time?: {
      start?: string;
      end?: string;
    };
  };
  search_mode?: 'and' | 'or';     // 查询模式
  page_num?: number;              // 页码
  page_size?: number;             // 每页数量
}

// 创建视频流DTO
export interface StreamCreateDto {
  stream_name: string;           // 视频流名称
  stream_url: string;            // 视频流地址
  stream_type?: string;          // 视频流类型
  description?: string;          // 描述
  remark?: string;               // 备注
}

// 更新视频流DTO
export interface StreamUpdateDto {
  stream_name?: string;          // 视频流名称
  stream_url?: string;           // 视频流地址
  stream_type?: string;          // 视频流类型
  description?: string;          // 描述
  status?: StreamStatus;         // 状态
  remark?: string;               // 备注
} 