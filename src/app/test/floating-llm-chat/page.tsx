"use client";

import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FloatingLLMChatTestPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>FloatingChatWidget LLM 测试页面</span>
            <Badge variant="secondary">AI聊天</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>这个页面用于测试FloatingChatWidget组件的LLM聊天功能。</p>
            <p>点击右下角的浮动聊天按钮开始与AI助手对话。</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">功能特性：</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✅ 连接到LLM WebSocket接口 (ws://localhost:8000/api/v1/ws/llm-chat)</li>
              <li>✅ 支持流式AI回复显示</li>
              <li>✅ 自动重连机制</li>
              <li>✅ 未读消息计数</li>
              <li>✅ 打字指示器</li>
              <li>✅ 响应式设计（桌面/移动端）</li>
              <li>✅ 消息历史管理</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">使用说明：</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>确保已登录系统（localStorage中有userInfo）</li>
              <li>确保后端LLM WebSocket服务正在运行 (端口8000)</li>
              <li>点击浮动聊天按钮打开聊天窗口</li>
              <li>查看连接状态指示器</li>
              <li>输入消息与AI助手对话</li>
              <li>观察流式回复效果</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">调试信息：</h3>
            <div className="text-sm space-y-1">
              <p><strong>用户信息检查:</strong> 打开浏览器控制台查看用户信息获取日志</p>
              <p><strong>WebSocket连接:</strong> 查看网络面板的WebSocket连接状态</p>
              <p><strong>错误信息:</strong> 如果连接失败，会在聊天窗口标题栏显示具体错误</p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">技术实现：</h4>
            <div className="text-sm space-y-1">
              <p><strong>Hook:</strong> useLLMChatForWidget</p>
              <p><strong>WebSocket:</strong> /api/v1/ws/llm-chat/{`{user_id}`}</p>
              <p><strong>消息类型:</strong> system, user, assistant_streaming, assistant, error</p>
              <p><strong>AI服务:</strong> 通过litellm连接各种大模型</p>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>浮动聊天按钮应该出现在页面右下角 →</p>
          </div>
        </CardContent>
      </Card>

      {/* FloatingChatWidget 组件 */}
      <FloatingChatWidget
        config={{
          position: 'bottom-right',
          offset: { x: 20, y: 20 },
          placeholder: '与AI助手对话...',
          maxMessages: 50
        }}
        events={{
          onMessage: (message) => {
            console.log('New message:', message);
          },
          onConnectionStateChange: (state) => {
            console.log('Connection state changed:', state);
          },
          onError: (error) => {
            console.error('Chat error:', error);
          }
        }}
      />
    </div>
  );
}
