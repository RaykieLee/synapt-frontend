import { apiRequest } from "@/lib/api";
import { Stream, StreamCreateDto, StreamQuery, StreamUpdateDto } from "@/types/stream";
import { BaseResponse, PageResult } from "@/types/base";

export const streamAPI = {
  // 获取视频流列表
  getList: (params: StreamQuery) => 
    apiRequest<BaseResponse<PageResult<Stream>>>("/api/v1/platform/streams/list", "POST", params),

  // 获取视频流详情
  getDetail: (stream_id: number) => 
    apiRequest<BaseResponse<Stream>>(`/api/v1/platform/streams/${stream_id}`, "GET"),

  // 创建视频流
  create: (stream: StreamCreateDto) => 
    apiRequest<BaseResponse<Stream>>("/api/v1/platform/streams/create", "POST", stream),

  // 更新视频流
  update: (stream_id: number, stream: StreamUpdateDto) => 
    apiRequest<BaseResponse<Stream>>(`/api/v1/platform/streams/${stream_id}`, "PUT", stream),

  // 删除视频流
  delete: (stream_id: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/streams/${stream_id}`, "DELETE"),

  // 批量删除视频流
  batchDelete: (stream_ids: number[]) => 
    apiRequest<BaseResponse<void>>("/api/v1/platform/streams/batch-delete", "POST", { ids: stream_ids }),

  // 启动视频流
  start: (stream_id: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/streams/${stream_id}/start`, "POST"),

  // 停止视频流
  stop: (stream_id: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/streams/${stream_id}/stop`, "POST"),

  // 重启视频流
  restart: (stream_id: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/platform/streams/${stream_id}/restart`, "POST"),
}; 