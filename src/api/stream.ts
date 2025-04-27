import { apiRequest } from "@/lib/api";
import { Stream, StreamCreateDto, StreamQuery, StreamUpdateDto } from "@/types/stream";
import { BaseResponse, PageResult } from "@/types/base";

export const streamAPI = {
  // 获取视频流列表
  getList: (params: StreamQuery) => 
    apiRequest<PageResult<Stream>>("/api/v1/streams/list", "POST", { 
      pageNum: params.pageNum, 
      pageSize: params.pageSize,
      orderBy: "createTime",
      orderType: "desc",
      params: {
        keyword: params.name,
        status: params.status
      }
    }),

  // 获取视频流详情
  getDetail: (streamId: number) => 
    apiRequest<BaseResponse<Stream>>(`/api/v1/streams/${streamId}`, "GET"),

  // 创建视频流
  create: (stream: StreamCreateDto) => 
    apiRequest<BaseResponse<Stream>>("/api/v1/streams", "POST", stream),

  // 更新视频流
  update: (streamId: number, stream: StreamUpdateDto) => 
    apiRequest<BaseResponse<Stream>>(`/api/v1/streams/${streamId}`, "PUT", stream),

  // 删除视频流
  delete: (streamId: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/streams/${streamId}`, "DELETE"),

  // 批量删除视频流
  batchDelete: (streamIds: number[]) => 
    apiRequest<BaseResponse<void>>("/api/v1/streams/batch-delete", "POST", { ids: streamIds }),

  // 启动视频流
  start: (streamId: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/streams/${streamId}/start`, "POST"),

  // 停止视频流
  stop: (streamId: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/streams/${streamId}/stop`, "POST"),

  // 重启视频流
  restart: (streamId: number) => 
    apiRequest<BaseResponse<void>>(`/api/v1/streams/${streamId}/restart`, "POST"),
}; 