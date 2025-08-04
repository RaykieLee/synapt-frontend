/**
 * WebSocket 配置工具测试
 * 用于验证 URL 构建逻辑的正确性
 */

import { 
  buildLLMChatWebSocketUrl, 
  buildChatWebSocketUrl,
  buildWebSocketUrl 
} from './websocket-config';

// 模拟环境变量
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:8000';

// 测试用例
console.log('=== WebSocket URL 构建测试 ===');

// 测试 1: 带 Bearer 前缀的 token
const tokenWithBearer = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc1NDM1NzYyOH0.50TxmO__pAqvc9JISJrdnwRCGv2Xk5wQLkb5coF2ctE';
const llmUrl1 = buildLLMChatWebSocketUrl(100, tokenWithBearer);
console.log('1. LLM Chat URL (带 Bearer):', llmUrl1);

// 测试 2: 不带 Bearer 前缀的 token
const tokenWithoutBearer = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc1NDM1NzYyOH0.50TxmO__pAqvc9JISJrdnwRCGv2Xk5wQLkb5coF2ctE';
const llmUrl2 = buildLLMChatWebSocketUrl(100, tokenWithoutBearer);
console.log('2. LLM Chat URL (不带 Bearer):', llmUrl2);

// 测试 3: 普通聊天 URL
const chatUrl = buildChatWebSocketUrl(100, tokenWithBearer);
console.log('3. Chat URL:', chatUrl);

// 测试 4: 带配置ID的 LLM 聊天
const llmUrlWithConfig = buildLLMChatWebSocketUrl(100, tokenWithBearer, 'config123');
console.log('4. LLM Chat URL (带配置):', llmUrlWithConfig);

// 测试 5: 通用 WebSocket URL 构建
const genericUrl = buildWebSocketUrl('/api/v1/ws/test/123', { 
  token: tokenWithBearer,
  param1: 'value1'
});
console.log('5. 通用 WebSocket URL:', genericUrl);

console.log('=== 测试完成 ===');

// 验证 URL 格式
console.log('\n=== URL 格式验证 ===');
const testUrl = new URL(llmUrl1.replace('ws://', 'http://'));
console.log('协议:', testUrl.protocol);
console.log('主机:', testUrl.host);
console.log('路径:', testUrl.pathname);
console.log('查询参数:', testUrl.searchParams.toString());
console.log('Token 参数:', testUrl.searchParams.get('token'));
