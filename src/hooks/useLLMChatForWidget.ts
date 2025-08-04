import { useState, useCallback, useRef, useEffect } from 'react';
import { getAuthToken } from '@/services/auth';
import { ChatMessage, ConnectionState, ChatEvents } from '@/types/chat';
import { buildLLMChatWebSocketUrl } from '@/utils/websocket-config';

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
}

export function useLLMChatForWidget(options: UseLLMChatForWidgetOptions = {}): UseLLMChatForWidgetReturn {
  const { maxMessages = 100, events } = options;
  const [user, setUser] = useState<UserInfo | null>(null);
  
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
    }

    events?.onConnectionStateChange?.(state);
  }, [events]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    if (!isOpen && message.userId !== user?.userId?.toString()) {
      setUnreadCount(prev => prev + 1);
    }

    events?.onMessage?.(newMessage);
    return newMessage;
  }, [maxMessages, isOpen, user?.userId, events]);

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

    const token = getAuthToken();
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

          switch (data.type) {
            case 'system':
              addMessage({
                content: data.message,
                userId: '0',
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
              // 更新或创建流式消息
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                
                if (lastMessage && lastMessage.userId === '0' && lastMessage.isStreaming) {
                  // 更新现有的流式消息
                  lastMessage.content = data.message;
                } else {
                  // 创建新的流式消息
                  newMessages.push({
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    content: data.message,
                    userId: '0',
                    username: 'AI助手',
                    timestamp: new Date(data.timestamp),
                    type: 'assistant',
                    isStreaming: true
                  });
                }
                
                return newMessages;
              });
              break;

            case 'assistant':
              setIsTyping(false);
              // 标记最后一条消息为完成状态
              updateLastMessage({
                content: data.message,
                isStreaming: false
              });
              break;

            case 'error':
              setIsTyping(false);
              addMessage({
                content: data.message,
                userId: '0',
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
            if (user?.userId) {
              connectToWebSocket(user.userId);
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
  }, [updateConnectionState, addMessage, updateLastMessage, user?.userId]);

  const connect = useCallback(() => {
    if (user?.userId) {
      connectToWebSocket(user.userId);
    } else {
      setConnectionError('用户ID未提供');
    }
  }, [user?.userId, connectToWebSocket]);

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

  // 获取用户信息
  useEffect(() => {
    console.log('获取用户信息...');
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        console.log('用户信息获取成功:', userInfo);
        setUser(userInfo);
      } catch (error) {
        console.error("Failed to parse user info:", error);
        setConnectionError('用户信息解析失败');
      }
    } else {
      console.log('未找到用户信息');
      setConnectionError('请先登录');
    }
  }, []);

  // 自动连接 - 只在用户ID变化时触发
  useEffect(() => {
    console.log('useLLMChatForWidget useEffect triggered, user:', user);

    if (user?.userId) {
      console.log('用户ID存在:', user.userId, '开始连接WebSocket...');
      connectToWebSocket(user.userId);
    } else {
      console.log('用户ID不存在，无法连接');
      if (user === null) {
        // 还在加载用户信息
        setConnectionError('加载用户信息中...');
      } else {
        setConnectionError('用户未登录');
      }
    }

    // 清理函数：只在用户变化时断开连接
    return () => {
      if (!user?.userId) {
        console.log('用户信息清空，断开连接');
        disconnect();
      }
    };
  }, [user?.userId, connectToWebSocket, disconnect, user]);

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
    user,
    sendMessage,
    toggleOpen,
    markAsRead,
    connect,
    disconnect
  };
}
