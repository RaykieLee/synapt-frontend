import { apiRequest } from "@/lib/api";

/**
 * MCP状态信息
 */
export interface MCPServerStatus {
  name: string;
  command: string;
  args: string[];
  status: 'unknown' | 'configured' | 'connected' | 'disconnected' | 'error' | 'invalid_config';
  tools: string[];
  error?: string;
}

export interface MCPStatus {
  configured: boolean;
  config_valid?: boolean;
  servers: MCPServerStatus[];
}

/**
 * MCP API
 */
export const mcpAPI = {
  /**
   * 获取MCP状态
   */
  getStatus: () => apiRequest<MCPStatus>('/api/v1/platform/llm/mcp-status/status', 'GET'),

  /**
   * 测试MCP连接
   */
  testConnection: () => apiRequest<{ tested: boolean; timestamp: string }>('/api/v1/platform/llm/mcp-status/test-connection', 'POST'),

  /**
   * 重新加载MCP配置
   */
  reloadConfig: () => apiRequest<{ reloaded: boolean; timestamp: string; servers_count: number }>('/api/v1/platform/llm/mcp-status/reload-config', 'POST'),
};
