/**
 * WebSocket 配置工具
 * 用于动态构建 WebSocket URL，支持从环境变量获取后端地址
 */

/**
 * 获取后端基础 URL
 * 优先级：环境变量 > 默认值
 */
export function getBackendUrl(): string {
  // 从环境变量获取后端 URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  return backendUrl;
}

/**
 * 将 HTTP URL 转换为 WebSocket URL
 * @param httpUrl HTTP URL (如: http://localhost:8000)
 * @returns WebSocket URL (如: ws://localhost:8000)
 */
export function httpToWebSocketUrl(httpUrl: string): string {
  return httpUrl.replace(/^https?:\/\//, (match) => {
    return match === 'https://' ? 'wss://' : 'ws://';
  });
}

/**
 * 构建 WebSocket URL
 * @param path WebSocket 路径 (如: /api/v1/ws/llm-chat/123)
 * @param params 查询参数
 * @returns 完整的 WebSocket URL
 */
export function buildWebSocketUrl(path: string, params?: Record<string, string>): string {
  const backendUrl = getBackendUrl();
  const wsBaseUrl = httpToWebSocketUrl(backendUrl);

  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  let url = `${wsBaseUrl}${normalizedPath}`;

  // 添加查询参数
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      // URLSearchParams 会自动进行适当的编码
      searchParams.append(key, value);
    });
    url += `?${searchParams.toString()}`;
  }

  return url;
}

/**
 * 构建 LLM 聊天 WebSocket URL
 * @param userId 用户ID
 * @param token 认证令牌 (可能包含 "Bearer " 前缀)
 * @param configId 可选的配置ID
 * @returns LLM 聊天 WebSocket URL
 */
export function buildLLMChatWebSocketUrl(
  userId: string | number,
  token: string,
  configId?: string | number
): string {
  const path = `/api/v1/ws/llm-chat/${userId}`;

  // 处理 token，避免双重编码
  // 如果 token 包含 "Bearer " 前缀，直接使用，否则添加前缀
  let processedToken = token;
  if (!token.toLowerCase().startsWith('bearer ')) {
    processedToken = `Bearer ${token}`;
  }

  const params: Record<string, string> = {
    token: processedToken
  };

  if (configId) {
    params.config_id = String(configId);
  }

  return buildWebSocketUrl(path, params);
}

/**
 * 构建普通聊天 WebSocket URL
 * @param userId 用户ID
 * @param token 认证令牌 (可能包含 "Bearer " 前缀)
 * @returns 普通聊天 WebSocket URL
 */
export function buildChatWebSocketUrl(userId: string | number, token: string): string {
  const path = `/api/v1/ws/chat/${userId}`;

  // 处理 token，避免双重编码
  let processedToken = token;
  if (!token.toLowerCase().startsWith('bearer ')) {
    processedToken = `Bearer ${token}`;
  }

  const params = {
    token: processedToken
  };

  return buildWebSocketUrl(path, params);
}

/**
 * 构建 Socket.IO WebSocket URL
 * @param path 可选的路径，默认为 /ws
 * @returns Socket.IO WebSocket URL
 */
export function buildSocketIOUrl(path: string = '/ws'): string {
  const backendUrl = getBackendUrl();
  return `${backendUrl}${path}`;
}

/**
 * 获取 WebSocket 基础 URL（用于 Socket.IO）
 * 从环境变量 NEXT_PUBLIC_WS_URL 获取，如果没有则从 NEXT_PUBLIC_BACKEND_URL 构建
 */
export function getWebSocketBaseUrl(): string {
  // 优先使用专门的 WebSocket URL 环境变量
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl) {
    return wsUrl;
  }
  
  // 否则从后端 URL 构建
  const backendUrl = getBackendUrl();
  return `${backendUrl}/ws`;
}
               