import { useEffect, useRef, useState, useCallback } from 'react';
import { getAuthToken } from '@/services/auth';

export interface LLMMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface LLMConfig {
  name: string;
  model: string;
  provider: string;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseLLMChatOptions {
  userId?: string;
  configId?: string; // LLM配置ID，不传则使用默认配置
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: LLMMessage) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onError?: (error: string) => void;
}

interface UseLLMChatReturn {
  messages: LLMMessage[];
  connectionState: ConnectionState;
  currentConfig: LLMConfig | null;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  isStreaming: boolean;
}

export function useLLMChat({
  userId,
  configId,
  reconnectAttempts = 3,
  reconnectInterval = 3000,
  onMessage,
  onConnectionStateChange,
  onError,
}: UseLLMChatOptions = {}): UseLLMChatReturn {
  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [currentConfig, setCurrentConfig] = useState<LLMConfig | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentStreamingMessageRef = useRef<string>('');

  const updateConnectionState = useCallback((state: ConnectionState) => {
    setConnectionState(state);
    onConnectionStateChange?.(state);
  }, [onConnectionStateChange]);

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addMessage = useCallback((message: Omit<LLMMessage, 'id'>) => {
    const newMessage: LLMMessage = {
      ...message,
      id: generateMessageId(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    onMessage?.(newMessage);
    return newMessage;
  }, [onMessage]);

  const updateLastMessage = useCallback((updates: Partial<LLMMessage>) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          ...updates,
        };
      }
      return newMessages;
    });
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (!userId) {
      onError?.('用户ID未提供');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onError?.('未找到认证令牌');
      return;
    }

    updateConnectionState('connecting');

    try {
      // 构建WebSocket URL
      let wsUrl = `ws://localhost:8000/api/v1/ws/llm-chat/${userId}?token=${encodeURIComponent(token)}`;
      if (configId) {
        wsUrl += `&config_id=${configId}`;
      }
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('LLM WebSocket connected');
        updateConnectionState('connected');
        reconnectCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('LLM WebSocket message:', data);

          switch (data.type) {
            case 'system':
              // 系统消息，包含配置信息
              if (data.config) {
                setCurrentConfig(data.config);
              }
              addMessage({
                type: 'system',
                content: data.message,
                timestamp: data.timestamp,
              });
              break;

            case 'user':
              // 用户消息确认
              addMessage({
                type: 'user',
                content: data.message,
                timestamp: data.timestamp,
              });
              break;

            case 'assistant_streaming':
              // 流式响应片段
              setIsStreaming(true);
              currentStreamingMessageRef.current = data.message;

              // 更新或创建流式消息
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];

                if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isStreaming) {
                  // 更新现有的流式消息
                  lastMessage.content = data.message;
                } else {
                  // 创建新的流式消息
                  newMessages.push({
                    id: generateMessageId(),
                    type: 'assistant',
                    content: data.message,
                    timestamp: data.timestamp,
                    isStreaming: true,
                  });
                }

                return newMessages;
              });
              break;

            case 'assistant':
              // 流式响应完成
              setIsStreaming(false);
              currentStreamingMessageRef.current = '';

              // 标记最后一条消息为完成状态
              updateLastMessage({
                content: data.message,
                isStreaming: false,
              });
              break;

            case 'error':
              // 错误消息
              setIsStreaming(false);
              addMessage({
                type: 'error',
                content: data.message,
                timestamp: data.timestamp,
              });
              onError?.(data.message);
              break;

            default:
              console.warn('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse LLM WebSocket message:', error);
          onError?.('消息解析失败');
        }
      };

      ws.onclose = (event) => {
        console.log('LLM WebSocket disconnected', event.code, event.reason);
        updateConnectionState('disconnected');
        setIsStreaming(false);
        
        // 清理当前连接引用
        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        // 尝试重连
        if (reconnectCountRef.current < reconnectAttempts && event.code !== 4001) {
          reconnectCountRef.current++;
          console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * reconnectCountRef.current);
        } else if (event.code === 4001) {
          onError?.('认证失败，请重新登录');
        } else if (event.code === 4004) {
          onError?.('LLM配置不存在');
        } else if (event.code === 4005) {
          onError?.('没有可用的LLM配置');
        }
      };

      ws.onerror = (error) => {
        console.error('LLM WebSocket error:', error);
        updateConnectionState('error');
        setIsStreaming(false);
        onError?.('连接错误');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create LLM WebSocket connection:', error);
      updateConnectionState('error');
      onError?.('创建连接失败');
    }
  }, [userId, configId, reconnectAttempts, reconnectInterval, onError, updateConnectionState, addMessage, updateLastMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    updateConnectionState('disconnected');
    setIsStreaming(false);
  }, [updateConnectionState]);

  const sendMessage = useCallback((message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      onError?.('连接未建立');
      return;
    }

    if (!message.trim()) {
      return;
    }

    try {
      // 发送消息给后端 (直接发送文本，与现有聊天接口兼容)
      wsRef.current.send(message.trim());
    } catch (error) {
      console.error('Failed to send message:', error);
      onError?.('发送消息失败');
    }
  }, [onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // 自动连接
  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, configId]); // 当userId或configId变化时重新连接

  // 清理定时器
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    connectionState,
    currentConfig,
    sendMessage,
    clearMessages,
    connect,
    disconnect,
    isConnected: connectionState === 'connected',
    isStreaming,
  };
}
