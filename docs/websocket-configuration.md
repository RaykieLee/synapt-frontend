# WebSocket 配置指南

## 概述

本项目的 WebSocket 连接已经从硬编码的 `localhost:8000` 改为动态配置，支持通过环境变量灵活配置后端服务地址。

## 配置方式

### 1. 环境变量配置

在 `synapt-frontend/.env.local` 文件中配置：

```bash
# 后端服务地址
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# WebSocket 服务地址 (可选)
NEXT_PUBLIC_WS_URL=http://localhost:8000/ws
```

### 2. 自动 URL 构建

如果没有设置 `NEXT_PUBLIC_WS_URL`，系统会自动从 `NEXT_PUBLIC_BACKEND_URL` 构建 WebSocket URL：

- `http://localhost:8000` → `ws://localhost:8000`
- `https://api.example.com` → `wss://api.example.com`

## 工具函数

项目提供了一套 WebSocket URL 构建工具函数，位于 `src/utils/websocket-config.ts`：

### 基础函数

```typescript
import { 
  getBackendUrl,
  buildWebSocketUrl,
  buildLLMChatWebSocketUrl,
  buildChatWebSocketUrl,
  getWebSocketBaseUrl
} from '@/utils/websocket-config';

// 获取后端基础 URL
const backendUrl = getBackendUrl();

// 构建通用 WebSocket URL
const wsUrl = buildWebSocketUrl('/api/v1/ws/chat/123', { token: 'abc' });

// 构建 LLM 聊天 WebSocket URL
const llmWsUrl = buildLLMChatWebSocketUrl(userId, token, configId);

// 构建普通聊天 WebSocket URL
const chatWsUrl = buildChatWebSocketUrl(userId, token);

// 获取 Socket.IO WebSocket 基础 URL
const socketIOUrl = getWebSocketBaseUrl();
```

## 部署环境配置

### 开发环境

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Docker Compose 环境

```bash
NEXT_PUBLIC_BACKEND_URL=http://synaptic-backend:8000
```

### 生产环境

```bash
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws
```

### 内网部署

```bash
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
```

## 已更新的文件

以下文件已经更新为使用动态 WebSocket URL：

### 前端文件
- `src/hooks/useWebSocket.ts` - 通用 WebSocket Hook
- `src/hooks/useLLMChat.ts` - LLM 聊天 Hook
- `src/hooks/useLLMChatForWidget.ts` - LLM 聊天组件 Hook
- `src/services/websocket.ts` - WebSocket 服务类
- `src/app/test/chat/page.tsx` - 聊天测试页面
- `src/app/dashboard/system/scheduler/runs/[runId]/page.tsx` - 调度器页面

### 后端文件
- `app/__init__.py` - 健康检查和测试接口

### 文档文件
- `docs/websocket_chat_guide.md` - WebSocket 聊天指南
- `docs/websocket_api_reference.md` - WebSocket API 参考
- `docs/voice_api_guide.md` - 语音 API 指南

## 迁移指南

如果你正在从旧版本升级，请按以下步骤操作：

1. **更新环境变量**：
   ```bash
   # 在 .env.local 中设置
   NEXT_PUBLIC_BACKEND_URL=http://your-backend-host:port
   ```

2. **更新代码**（如果有自定义 WebSocket 连接）：
   ```typescript
   // 旧方式
   const ws = new WebSocket('ws://localhost:8000/api/v1/ws/chat/123?token=abc');
   
   // 新方式
   import { buildChatWebSocketUrl } from '@/utils/websocket-config';
   const ws = new WebSocket(buildChatWebSocketUrl(123, 'abc'));
   ```

3. **验证连接**：
   - 启动前端和后端服务
   - 检查浏览器控制台是否有 WebSocket 连接错误
   - 访问 `/health` 接口查看 WebSocket URL 是否正确

## 故障排除

### 常见问题

1. **WebSocket 连接失败**
   - 检查 `NEXT_PUBLIC_BACKEND_URL` 是否正确
   - 确认后端服务是否启动
   - 检查防火墙和网络配置

2. **CORS 错误**
   - 确保后端 CORS 配置允许前端域名
   - 检查协议是否匹配（HTTP/HTTPS）

3. **环境变量不生效**
   - 重启开发服务器
   - 确认环境变量名称正确（必须以 `NEXT_PUBLIC_` 开头）
   - 检查 `.env.local` 文件格式

### 调试技巧

1. **查看构建的 URL**：
   ```typescript
   import { getBackendUrl, buildLLMChatWebSocketUrl } from '@/utils/websocket-config';
   console.log('Backend URL:', getBackendUrl());
   console.log('WebSocket URL:', buildLLMChatWebSocketUrl(1, 'token'));
   ```

2. **检查健康状态**：
   访问 `http://your-backend/health` 查看 WebSocket URL

3. **浏览器开发者工具**：
   - Network 标签查看 WebSocket 连接状态
   - Console 标签查看连接日志

## 注意事项

- 所有 WebSocket 连接现在都支持 HTTP/HTTPS 自动协议切换
- 环境变量更改后需要重启开发服务器
- 生产环境部署时确保正确设置环境变量
- Docker 部署时注意服务名称和网络配置
