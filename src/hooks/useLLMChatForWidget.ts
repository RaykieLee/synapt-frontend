import { useState, useCallback, useRef, useEffect } from 'react';
import { getAuthToken } from '@/services/auth';
import { ChatMessage, ConnectionState, ChatEvents } from '@/types/chat';
import { buildLLMChatWebSocketUrl } from '@/utils/websocket-config';
import { useAuth } from '@/contexts/auth-context';

interface UserInfo {
  userId: number;
  userName: string;
  nickName: string;
  avatar: string;
  roles: string[];
  menus: any[];
  buttons: string[];
}

interface UseLLMChatForWidgetOptions {
  maxMessages?: number;
  events?: ChatEvents;
}

interface UseLLMChatForWidgetReturn {
  isOpen: boolean;
  isConnected: boolean;
  messages: ChatMessage[];
  unreadCount: number;
  isTyping: boolean;
  connectionError?: string;
  user: UserInfo | null;
  sendMessage: (message: string) => void;
  toggleOpen: () => void;
  markAsRead: () => void;
  connect: () => void;
  disconnect: () => void;
  clearMessages: () => void;
}

export function useLLMChatForWidget(options: UseLLMChatForWidgetOptions = {}): UseLLMChatForWidgetReturn {
  const { maxMessages = 100, events } = options;
  // 从全局认证上下文获取用户与令牌，避免本地存储读取导致的连接延迟
  const { user: authUser, token: authToken } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | undefined>();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const isManualDisconnectRef = useRef(false);
  const isConnectingRef = useRef(false); // 防止重复连接

  const updateConnectionState = useCallback((state: ConnectionState) => {
    setIsConnected(state === 'connected');
    // 设置连接错误信息
    switch (state) {
      case 'connecting':
        setConnectionError('连接中...');
        break;
      case 'connected':
        setConnectionError(undefined);
        break;
      case 'disconnected':
        setConnectionError('连接已断开');
        break;
      case 'reconnecting':
        setConnectionError('重新连接中...');
        break;
      default:
        setConnectionError(undefined);
        break;
    }

    events?.onConnectionStateChange?.(state);
  }, [events]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    };

    setMessages(prev => {
      // 检查是否是重复的系统消息
      if (message.type === 'system') {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage &&
            lastMessage.type === 'system' &&
            lastMessage.content === message.content &&
            lastMessage.userId === message.userId) {
          console.log('跳过重复的系统消息:', message.content);
          return prev; // 不添加重复消息
        }
      }

      const updated = [...prev, newMessage];
      // 限制消息数量
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages);
      }
      return updated;
    });

    // 如果聊天窗口未打开，增加未读计数
    if (!isOpen && message.userId !== authUser?.userId?.toString()) {
      setUnreadCount(prev => prev + 1);
    }

    events?.onMessage?.(newMessage);
    return newMessage;
  }, [maxMessages, isOpen, authUser?.userId, events]);

  const updateLastMessage = useCallback((updates: Partial<ChatMessage>) => {
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

  const connectToWebSocket = useCallback((userId: number) => {
    console.log('尝试连接LLM WebSocket...', userId);

    // 防止重复连接
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket已连接或正在连接中，跳过重复连接');
      return;
    }

    // 优先使用 AuthContext 中的 token，回退到存储中的 token
    const token = authToken || getAuthToken();
    if (!token) {
      console.error('认证令牌未找到');
      setConnectionError('认证令牌未找到');
      return;
    }

    isManualDisconnectRef.current = false;
    isConnectingRef.current = true; // 设置连接中标记
    updateConnectionState('connecting');

    try {
      // 使用LLM聊天WebSocket接口
  const wsUrl = buildLLMChatWebSocketUrl(userId, token);
      console.log('连接WebSocket URL:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('LLM WebSocket connected');
        isConnectingRef.current = false; // 清除连接中标记
        updateConnectionState('connected');
        reconnectCountRef.current = 0;
        setConnectionError(undefined);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('LLM WebSocket message:', data);
          // 统一的“工具调用完成”总结行匹配（允许前置🎯 emoji 与空白）
          const TOOL_COMPLETE_REGEX = /^\s*(?:🎯\s*)?工具调用完成[:：]/;

          switch (data.type) {
            case 'system':
              addMessage({
                content: data.message,
                // 保留后端的 user_id（避免一律用'0'而丢失 -1 等语义）
                userId: (data.user_id ?? 0).toString(),
                username: '系统',
                timestamp: new Date(data.timestamp),
                type: 'system'
              });
              break;

            case 'user':
              addMessage({
                content: data.message,
                userId: data.user_id?.toString(),
                username: data.username,
                timestamp: new Date(data.timestamp),
                type: 'user'
              });
              break;

            case 'assistant_streaming':
              setIsTyping(true);
              // 更新或创建当前回答的流式消息（不覆盖前面已经产生的工具消息）
              setMessages(prev => {
                const newMessages = [...prev];
                // 从末尾向前查找最后一条处于流式状态的 AI 消息；
                // 允许跨越工具消息与系统消息，但一旦遇到“用户”消息则停止，避免跨越到上一轮对话。
                let idx = newMessages.length - 1;
                let lastStreaming: ChatMessage | undefined;
                for (; idx >= 0; idx--) {
                  const m = newMessages[idx];
                  if (m.userId === '0' && (m.isStreaming || m.type === 'assistant_streaming')) {
                    lastStreaming = m;
                    break;
                  }
                  if (m.type === 'user') {
                    break; // 不跨越用户消息边界
                  }
                }
                if (lastStreaming && (lastStreaming.isStreaming || lastStreaming.type === 'assistant_streaming')) {
                  lastStreaming.content = data.message;
                  lastStreaming.type = 'assistant_streaming';
                  lastStreaming.isStreaming = true;
                } else {
                  newMessages.push({
                    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
                    content: data.message,
                    userId: '0',
                    username: 'AI助手',
                    timestamp: new Date(data.timestamp),
                    type: 'assistant_streaming',
                    isStreaming: true
                  });
                }
                return newMessages;
              });
              break;

            case 'assistant':
              setIsTyping(false);
              // 将最近一条流式AI消息标记为完成，保留内容
              setMessages(prev => {
                const newMessages = [...prev];
                const isSummary = typeof data.message === 'string' && TOOL_COMPLETE_REGEX.test(data.message || '');
                for (let i = newMessages.length - 1; i >= 0; i--) {
                  const m = newMessages[i];
                  if (m.userId === '0' && (m.isStreaming || m.type === 'assistant_streaming')) {
                    // 如果是“工具调用完成”类的总结行，并且已有流式正文，保留原有正文而不覆盖
                    const contentToUse = isSummary && (m.content?.trim()?.length ?? 0) > 0 ? m.content : data.message;
                    newMessages[i] = { ...m, content: contentToUse, isStreaming: false, type: 'assistant' };
                    return newMessages;
                  }
                  if (m.type === 'user') break; // 不跨越上一轮用户消息
                }
                // 如果没有找到流式消息：仅当不是总结行时才追加，避免一个只含“工具调用完成”的尾部泡泡
                if (!isSummary) {
                  newMessages.push({
                    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
                    content: data.message,
                    userId: '0',
                    username: 'AI助手',
                    timestamp: new Date(data.timestamp),
                    type: 'assistant',
                  });
                }
                return newMessages;
              });
              break;

            case 'tool_start':
              // 专门处理工具开始事件，按系统型工具步骤呈现
              addMessage({
                content: data.message,
                userId: (data.user_id ?? 0).toString(),
                username: '系统',
                timestamp: new Date(data.timestamp),
                type: 'tool_start',
                // @ts-ignore
                metadata: data.metadata || {},
              } as any);
              break;

            case 'tool_progress':
            case 'tool_success':
            case 'tool_error':
            case 'tool_complete':
              // 这些系统型工具状态作为独立的“思考/步骤”消息追加
              addMessage({
                content: data.message,
                userId: (data.user_id ?? 0).toString(),
                username: '系统',
                timestamp: new Date(data.timestamp),
                type: data.type,
                // @ts-ignore 附带元数据以便 UI 呈现“第x/y个工具”等
                metadata: data.metadata || {},
              } as any);
              break;

            case 'tool_result':
              // 工具执行的输出，独立一条消息，方便展开查看
              addMessage({
                content: data.message,
                userId: (data.user_id ?? -1).toString(),
                username: data.username || '工具调用',
                timestamp: new Date(data.timestamp),
                type: 'tool_result',
                // @ts-ignore
                toolName: data.tool_name,
                // @ts-ignore
                metadata: data.metadata || {},
              } as any);
              break;

            case 'error':
              setIsTyping(false);
              addMessage({
                content: data.message,
                userId: (data.user_id ?? 0).toString(),
                username: '系统',
                timestamp: new Date(data.timestamp),
                type: 'error'
              });
              break;

            default:
              console.warn('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse LLM WebSocket message:', error);
          setConnectionError('消息解析失败');
        }
      };

      ws.onclose = (event) => {
        console.log('LLM WebSocket disconnected:', event.code, event.reason);
        wsRef.current = null;
        isConnectingRef.current = false; // 清除连接中标记
        setIsTyping(false);

        // 根据关闭代码提供更具体的错误信息
        let errorMessage = '连接已断开';
        switch (event.code) {
          case 4001:
            errorMessage = '认证失败，请重新登录';
            break;
          case 4003:
            errorMessage = '用户ID不匹配';
            break;
          case 4004:
            errorMessage = 'LLM配置不存在';
            break;
          case 4005:
            errorMessage = '没有可用的LLM配置';
            break;
          case 1006:
            errorMessage = '连接异常断开';
            break;
          default:
            if (event.reason) {
              errorMessage = event.reason;
            }
        }

        if (!isManualDisconnectRef.current && reconnectCountRef.current < 5 && event.code !== 4001) {
          updateConnectionState('reconnecting');
          reconnectCountRef.current++;
          console.log(`尝试重连 (${reconnectCountRef.current}/5)...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            if (authUser?.userId) {
              connectToWebSocket(authUser.userId);
            }
          }, 3000 * reconnectCountRef.current);
        } else {
          updateConnectionState('disconnected');
          setConnectionError(errorMessage);
        }
      };

      ws.onerror = (error) => {
        console.error('LLM WebSocket error:', error);
        updateConnectionState('disconnected');
        setConnectionError('WebSocket连接错误');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create LLM WebSocket connection:', error);
      updateConnectionState('disconnected');
      setConnectionError('创建WebSocket连接失败');
    }
  }, [updateConnectionState, addMessage, updateLastMessage, authUser?.userId, authToken]);

  const connect = useCallback(() => {
    if (authUser?.userId) {
      connectToWebSocket(authUser.userId);
    } else {
      setConnectionError('用户ID未提供');
    }
  }, [authUser?.userId, connectToWebSocket]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    updateConnectionState('disconnected');
    setIsTyping(false);
  }, [updateConnectionState]);

  const sendMessage = useCallback((message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError('连接未建立');
      return;
    }

    if (!message.trim()) {
      return;
    }

    try {
      // 直接发送文本消息（与LLM WebSocket接口兼容）
      wsRef.current.send(message.trim());
    } catch (error) {
      console.error('Failed to send message:', error);
      setConnectionError('发送消息失败');
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // 不再从本地存储拉取用户信息，直接依赖 AuthContext 提供的用户信息

  // 自动连接 - 只在用户ID变化时触发
  useEffect(() => {
    console.log('useLLMChatForWidget useEffect triggered, user/token:', authUser, !!authToken);

    if (authUser?.userId && authToken) {
      console.log('用户与令牌存在，开始预连接WebSocket...', authUser.userId);
      connectToWebSocket(authUser.userId);
    } else if (!authUser?.userId) {
      console.log('用户ID不存在，无法连接');
      setConnectionError('用户未登录');
    }

    // 清理函数：当用户登出或丢失时断开连接
    return () => {
      if (!authUser?.userId) {
        console.log('用户信息清空，断开连接');
        disconnect();
      }
    };
  }, [authUser?.userId, authToken, connectToWebSocket, disconnect]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    isConnected,
    messages,
    unreadCount,
    isTyping,
    connectionError,
    user: authUser as UserInfo | null,
    sendMessage,
    toggleOpen,
    markAsRead,
    connect,
    disconnect,
    clearMessages: () => {
      // 本地清空
      setMessages([]);
      // 通知后端清空
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send("__CLEAR__");
        }
      } catch (e) {
        console.warn('发送__CLEAR__失败', e);
      }
    }
  };
}
