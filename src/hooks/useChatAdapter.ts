import { useCallback, useMemo } from 'react';
import { useLLMChatForWidget } from './useLLMChatForWidget';
import { ModernMessage } from '@/components/ui/modern-chat';
import { ChatMessage } from '@/types/chat';

interface UseChatAdapterOptions {
  maxMessages?: number;
  events?: any;
}

export function useChatAdapter(options: UseChatAdapterOptions = {}) {
  const {
    isOpen,
    isConnected,
    messages: chatMessages,
    unreadCount,
    isTyping,
    connectionError,
    user,
    sendMessage: originalSendMessage,
    toggleOpen,
    markAsRead,
    connect,
    disconnect
  } = useLLMChatForWidget(options);

  // 转换消息格式从 ChatMessage 到 ModernMessage
  const messages: ModernMessage[] = useMemo(() => {
    return chatMessages.map((msg: ChatMessage) => ({
      id: msg.id,
      role: msg.type === 'user' ? 'user' as const : 
            msg.type === 'system' ? 'system' as const : 
            'assistant' as const,
      content: msg.content,
      timestamp: msg.timestamp,
      isStreaming: msg.isStreaming
    }));
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
    isOpen,
    isConnected,
    unreadCount,
    isTyping,
    connectionError,
    user,
    toggleOpen,
    markAsRead,
    connect,
    disconnect,
    sendMessage: originalSendMessage
  };
}