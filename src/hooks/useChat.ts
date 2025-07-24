import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatState, WebSocketMessage, ConnectionState, ChatEvents } from '@/types/chat';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '@/contexts/auth-context';

interface UseChatOptions {
  maxMessages?: number;
  events?: ChatEvents;
}

interface UseChatReturn extends ChatState {
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  markAsRead: () => void;
  toggleOpen: () => void;
  connect: () => void;
  disconnect: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { maxMessages = 100, events } = options;
  const { user } = useAuth();
  
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isConnected: false,
    messages: [],
    unreadCount: 0,
    isTyping: false,
    connectionError: undefined
  });

  const handleMessage = useCallback((wsMessage: WebSocketMessage) => {
    const timestamp = new Date(wsMessage.timestamp);
    
    switch (wsMessage.type) {
      case 'message':
        const chatMessage: ChatMessage = {
          id: `${wsMessage.data.user_id}-${Date.now()}`,
          userId: wsMessage.data.user_id.toString(),
          userName: wsMessage.data.username,
          content: wsMessage.data.message,
          timestamp,
          type: 'text',
          isOwn: wsMessage.data.user_id === user?.userId
        };

        setChatState(prev => {
          const newMessages = [...prev.messages, chatMessage];
          // Limit messages to maxMessages
          if (newMessages.length > maxMessages) {
            newMessages.splice(0, newMessages.length - maxMessages);
          }

          return {
            ...prev,
            messages: newMessages,
            unreadCount: prev.isOpen ? prev.unreadCount : prev.unreadCount + 1
          };
        });

        events?.onMessageReceived?.(chatMessage);
        break;

      case 'user_joined':
        const joinMessage: ChatMessage = {
          id: `system-join-${Date.now()}`,
          userId: 'system',
          userName: 'System',
          content: `${wsMessage.data.username} 加入了聊天`,
          timestamp,
          type: 'system',
          isOwn: false
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, joinMessage]
        }));

        events?.onUserJoined?.(wsMessage.data.username);
        break;

      case 'user_left':
        const leaveMessage: ChatMessage = {
          id: `system-leave-${Date.now()}`,
          userId: 'system',
          userName: 'System',
          content: `${wsMessage.data.username} 离开了聊天`,
          timestamp,
          type: 'system',
          isOwn: false
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, leaveMessage]
        }));

        events?.onUserLeft?.(wsMessage.data.username);
        break;

      case 'typing':
        setChatState(prev => ({
          ...prev,
          isTyping: wsMessage.data.isTyping && wsMessage.data.user_id !== user?.userId
        }));
        break;

      case 'error':
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          userId: 'system',
          userName: 'System',
          content: wsMessage.data.message || '发生错误',
          timestamp,
          type: 'error',
          isOwn: false
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
          connectionError: wsMessage.data.message
        }));

        events?.onError?.(wsMessage.data.message);
        break;
    }
  }, [user?.userId, maxMessages, events]);

  const handleConnectionStateChange = useCallback((state: ConnectionState) => {
    setChatState(prev => ({
      ...prev,
      isConnected: state === 'connected',
      connectionError: state === 'disconnected' ? '连接已断开' : undefined
    }));

    events?.onConnectionStateChange?.(state);
  }, [events]);

  const handleError = useCallback((error: string) => {
    setChatState(prev => ({
      ...prev,
      connectionError: error
    }));

    events?.onError?.(error);
  }, [events]);

  const { sendMessage: wsSendMessage, connect, disconnect, isConnected } = useWebSocket({
    userId: user?.userId?.toString(),
    onMessage: handleMessage,
    onConnectionStateChange: handleConnectionStateChange,
    onError: handleError
  });

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    wsSendMessage(content.trim());
  }, [wsSendMessage]);

  const clearMessages = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      unreadCount: 0
    }));
  }, []);

  const markAsRead = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      unreadCount: 0
    }));
  }, []);

  const toggleOpen = useCallback(() => {
    setChatState(prev => {
      const newIsOpen = !prev.isOpen;
      return {
        ...prev,
        isOpen: newIsOpen,
        unreadCount: newIsOpen ? 0 : prev.unreadCount
      };
    });
  }, []);

  // Auto-connect when user is available (only once)
  useEffect(() => {
    if (user?.userId) {
      connect();
    }
    
    // Cleanup on user change
    return () => {
      if (!user?.userId) {
        disconnect();
      }
    };
  }, [user?.userId]); // 移除 isConnected 和 connect 依赖，避免循环连接

  return {
    ...chatState,
    isConnected,
    sendMessage,
    clearMessages,
    markAsRead,
    toggleOpen,
    connect,
    disconnect
  };
}
