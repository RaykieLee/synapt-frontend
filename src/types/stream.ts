// 视频流状态枚举
export enum StreamStatus {
  Online = '0',  // 在线
  Offline = '1', // 离线
  Error = '2',   // 错误
}

// 视频流基本信息
export interface Stream {
  id: number;              // 视频流ID
  name: string;            // 视频流名称
  rtspUrl: string;         // RTSP地址
  hlsUrl?: string;         // HLS地址
  status: StreamStatus;    // 状态
  fps?: number;            // 帧率
  resolution?: string;     // 分辨率
  description?: string;    // 描述
  createTime: string;      // 创建时间
  updatedTime: string;     // 更新时间
}

// 视频流查询参数
export interface StreamQuery {
  name?: string;           // 按名称搜索
  status?: StreamStatus;   // 按状态筛选
  pageNum?: number;        // 页码
  pageSize?: number;       // 每页数量
}

// 创建视频流DTO
export interface StreamCreateDto {
  name: string;           // 视频流名称
  rtspUrl: string;        // RTSP地址
  description?: string;   // 描述
}

// 更新视频流DTO
export interface StreamUpdateDto extends Partial<StreamCreateDto> {
  streamId: number;       // 视频流ID
  status?: StreamStatus;  // 状态
} 