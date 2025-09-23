import { useCallback, useMemo } from 'react';
import { useChatConnection } from '@/contexts/chat-connection-context';
import { ModernMessage } from '@/components/ui/modern-chat';
import { ChatMessage } from '@/types/chat';

interface UseChatAdapterOptions {
  maxMessages?: number;
  events?: any;
}

export function useChatAdapter(options: UseChatAdapterOptions = {}) {
  const {
    isConnected,
    messages: chatMessages,
    unreadCount,
    isTyping,
    connectionError,
    user,
    sendMessage: originalSendMessage,
    markAsRead,
    connect,
    disconnect
  } = useChatConnection();

  // 转换消息格式从 ChatMessage 到 ModernMessage
  const messages: ModernMessage[] = useMemo(() => {
    return chatMessages.map((msg: ChatMessage) => {
      let role: 'user' | 'assistant' | 'system' = 'assistant';
      if (msg.type === 'user') {
        role = 'user';
      } else if (msg.type === 'system') {
        role = 'system';
      }
      return {
        id: msg.id,
        role,
        content: msg.content,
        timestamp: msg.timestamp,
        isStreaming: msg.isStreaming,
        type: msg.type as any,
        metadata: (msg as any).metadata,
        toolName: (msg as any).toolName,
      };
    });
  }, [chatMessages]);

  // 适配 handleSubmit 函数
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    // 这里我们需要从输入框获取值，但由于这是适配器，我们先留空
    // 实际的发送逻辑会在组件中处理
  }, []);

  // 适配 append 函数
  const append = useCallback((message: ModernMessage) => {
    if (message.role === 'user') {
      originalSendMessage(message.content);
    }
  }, [originalSendMessage]);

  // 模拟 ai/react 的 useChat hook 返回值
  return {
    messages,
    input: '', // 这个会在实际组件中管理
    handleInputChange: () => {}, // 这个会在实际组件中管理
    handleSubmit,
    isLoading: !isConnected || isTyping,
    stop: () => {}, // 可以后续实现停止功能
    append,
    setMessages: () => {}, // 可以后续实现
    
    // 额外的状态
    isConnected,
    unreadCount,
    isTyping,
    connectionError,
    user,
    markAsRead,
    connect,
    disconnect,
    sendMessage: originalSendMessage
  };
}