import { useEffect, useRef, useState, useCallback } from 'react';
import { ConnectionState, WebSocketMessage } from '@/types/chat';
import { getAuthToken } from '@/services/auth';
import { buildLLMChatWebSocketUrl } from '@/utils/websocket-config';

interface UseWebSocketOptions {
  userId?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onError?: (error: string) => void;
}

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  sendMessage: (message: string) => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    userId,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onConnectionStateChange,
    onError
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const isManualDisconnectRef = useRef(false);
  const isConnectingRef = useRef(false);
  const connectWebSocketRef = useRef<() => void>(() => {});
  const scheduleReconnectRef = useRef<() => void>(() => {});

  const updateConnectionState = useCallback((state: ConnectionState) => {
    setConnectionState(state);
    onConnectionStateChange?.(state);
  }, [onConnectionStateChange]);

  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnectRef.current || reconnectCountRef.current >= reconnectAttempts) {
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(reconnectInterval * Math.pow(2, reconnectCountRef.current), 30000);
    reconnectCountRef.current++;

    console.log(`Scheduling reconnect attempt ${reconnectCountRef.current} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isManualDisconnectRef.current && !isConnectingRef.current) {
        // 直接调用连接逻辑，避免循环依赖
        connectWebSocketRef.current();
      }
    }, delay);
  }, [reconnectAttempts, reconnectInterval]);

  const connectWebSocket = useCallback(() => {
    // 防止重复连接
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (!userId) {
      onError?.('用户ID未提供');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onError?.('认证令牌未找到');
      return;
    }

    // 调试信息：检查token格式
    console.log('Token info:', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20),
      userId: userId
    });

    isConnectingRef.current = true;
    isManualDisconnectRef.current = false;
    updateConnectionState('connecting');

    try {
      const wsUrl = buildLLMChatWebSocketUrl(userId, token);
      console.log('Connecting to WebSocket:', wsUrl.substring(0, 80) + '...');

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        isConnectingRef.current = false;
        updateConnectionState('connected');
        reconnectCountRef.current = 0;

        // 清除重连定时器
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          onError?.('消息解析失败');
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        isConnectingRef.current = false;
        wsRef.current = null;

        // 根据关闭代码提供更详细的错误信息
        let errorMessage = '连接已断开';
        switch (event.code) {
          case 4001:
            errorMessage = '认证失败，请重新登录';
            break;
          case 4003:
            errorMessage = '用户ID不匹配';
            break;
          case 1006:
            errorMessage = '连接异常断开，可能是网络问题';
            break;
          case 1011:
            errorMessage = '服务器内部错误';
            break;
          default:
            if (event.reason) {
              errorMessage = `连接断开: ${event.reason}`;
            }
        }

        // 只有在非手动断开且未达到重连次数限制时才重连
        if (!isManualDisconnectRef.current && reconnectCountRef.current < reconnectAttempts) {
          // 对于认证错误，不要重连
          if (event.code === 4001 || event.code === 4003) {
            updateConnectionState('disconnected');
            onError?.(errorMessage);
          } else {
            updateConnectionState('reconnecting');
            scheduleReconnectRef.current();
          }
        } else {
          updateConnectionState('disconnected');
          if (reconnectCountRef.current >= reconnectAttempts) {
            onError?.('重连次数已达上限');
          } else {
            onError?.(errorMessage);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
        onError?.('WebSocket连接错误');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      isConnectingRef.current = false;
      updateConnectionState('disconnected');
      onError?.('创建WebSocket连接失败');
    }
  }, [userId, reconnectAttempts, onMessage, onError, updateConnectionState]);

  // 保持 refs 同步
  useEffect(() => {
    connectWebSocketRef.current = connectWebSocket;
    scheduleReconnectRef.current = scheduleReconnect;
  }, [connectWebSocket, scheduleReconnect]);

  const connect = useCallback(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const disconnect = useCallback(() => {
    console.log('Manually disconnecting WebSocket');
    isManualDisconnectRef.current = true;
    isConnectingRef.current = false;

    // 清除重连定时器
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // 关闭WebSocket连接
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    // 重置重连计数
    reconnectCountRef.current = 0;
    updateConnectionState('disconnected');
  }, [updateConnectionState]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      onError?.('WebSocket未连接');
    }
  }, [onError]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebSocket on unmount');
      isManualDisconnectRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    connectionState,
    sendMessage,
    connect,
    disconnect,
    isConnected: connectionState === 'connected'
  };
}
