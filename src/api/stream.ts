import { apiRequest } from "@/lib/api";
import { Stream, StreamCreateDto, StreamQuery, StreamUpdateDto } from "@/types/stream";
import { BaseResponse } from "@/types/base";

export const streamAPI = {
  // 获取视频流列表
  getList: (params: StreamQuery) => 
    apiRequest<BaseResponse<Stream[]>>("/api/v1/streams", "POST", { search_params: params }),

  // 获取视频流详情
  getDetail: (streamId: number) => 
    apiRequest<Stream>(`/api/v1/streams/${streamId}`),

  // 创建视频流
  create: (stream: StreamCreateDto) => 
    apiRequest<Stream>("/api/v1/streams", "POST", stream),

  // 更新视频流
  update: (streamId: number, stream: StreamUpdateDto) => 
    apiRequest<Stream>(`/api/v1/streams/${streamId}`, "PUT", stream),

  // 删除视频流
  delete: (streamId: number) => 
    apiRequest<void>(`/api/v1/streams/${streamId}`, "DELETE"),

  // 批量删除视频流
  batchDelete: (streamIds: number[]) => 
    apiRequest<void>("/api/v1/streams/batch", "DELETE", { ids: streamIds }),

  // 启动视频流
  start: (streamId: number) => 
    apiRequest<void>(`/api/v1/streams/${streamId}/start`, "POST"),

  // 停止视频流
  stop: (streamId: number) => 
    apiRequest<void>(`/api/v1/streams/${streamId}/stop`, "POST"),

  // 重启视频流
  restart: (streamId: number) => 
    apiRequest<void>(`/api/v1/streams/${streamId}/restart`, "POST"),
}; 