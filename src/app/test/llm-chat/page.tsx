"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, AlertCircle, Settings, Loader2 } from "lucide-react";
import { useLLMChat, LLMMessage } from "@/hooks/useLLMChat";
import { toast } from "sonner";

interface UserInfo {
  userId: number;
  userName: string;
  nickName: string;
  avatar: string;
  roles: string[];
  menus: any[];
  buttons: string[];
}

export default function LLMChatPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取用户信息
  useEffect(() => {
    // 从localStorage获取用户信息
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUser(userInfo);
      } catch (error) {
        console.error("Failed to parse user info:", error);
        toast.error("用户信息解析失败");
      }
    } else {
      toast.error("请先登录");
    }
  }, []);

  const {
    messages,
    connectionState,
    currentConfig,
    sendMessage,
    clearMessages,
    connect,
    disconnect,
    isConnected,
    isStreaming,
  } = useLLMChat({
    userId: user?.userId?.toString(),
    onError: (error) => {
      toast.error(error);
    },
    onConnectionStateChange: (state) => {
      if (state === 'connected') {
        toast.success("已连接到LLM服务");
      } else if (state === 'disconnected') {
        toast.warning("连接已断开");
      } else if (state === 'error') {
        toast.error("连接错误");
      }
    },
  });

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected || isStreaming) {
      return;
    }

    sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return '已连接';
      case 'connecting':
        return '连接中...';
      case 'disconnected':
        return '未连接';
      case 'error':
        return '连接错误';
      default:
        return '未知状态';
    }
  };

  const renderMessage = (message: LLMMessage) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const isError = message.type === 'error';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`flex max-w-[80%] ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          } items-start space-x-2`}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser
                ? 'bg-blue-500 text-white'
                : isSystem
                ? 'bg-gray-500 text-white'
                : isError
                ? 'bg-red-500 text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            {isUser ? (
              <User className="w-4 h-4" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4" />
            ) : isSystem ? (
              <Settings className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          <div
            className={`rounded-lg px-4 py-2 ${
              isUser
                ? 'bg-blue-500 text-white'
                : isSystem
                ? 'bg-gray-100 text-gray-800 border'
                : isError
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-white text-gray-800 border'
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
              )}
            </div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">需要登录</h2>
              <p className="text-gray-600">请先登录后再使用聊天功能</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-4">
        <p className="text-sm text-gray-600">当前用户：{user.nickName || user.userName}</p>
      </div>
      <Card className="h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <span>LLM 聊天</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              {currentConfig && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{currentConfig.name}</span>
                  <span className="text-gray-400 ml-2">
                    ({currentConfig.provider}/{currentConfig.model})
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}
                />
                <span className="text-sm text-gray-600">
                  {getConnectionStatusText()}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isConnected ? disconnect : connect}
                >
                  {isConnected ? "断开" : "连接"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMessages}
                  disabled={messages.length === 0}
                >
                  清空
                </Button>
              </div>
            </div>
          </div>
          <Separator />
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>开始与AI助手对话吧！</p>
                </div>
              </div>
            ) : (
              <div>
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isConnected
                    ? isStreaming
                      ? "AI正在回复中..."
                      : "输入消息..."
                    : "请先连接到服务器"
                }
                disabled={!isConnected || isStreaming}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !inputMessage.trim() || isStreaming}
                size="icon"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            {isStreaming && (
              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                AI正在思考中...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
