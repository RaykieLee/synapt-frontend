import { useEffect, useRef, useState, useCallback } from 'react';
import { ConnectionState, WebSocketMessage } from '@/types/chat';
import { getAuthToken } from '@/services/auth';

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

  const updateConnectionState = useCallback((state: ConnectionState) => {
    setConnectionState(state);
    onConnectionStateChange?.(state);
  }, [onConnectionStateChange]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(reconnectInterval * Math.pow(2, reconnectCountRef.current), 30000);
    reconnectCountRef.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isManualDisconnectRef.current) {
        connect();
      }
    }, delay);
  }, [reconnectInterval]); // We'll define connect after this

  const connect = useCallback(() => {
    if (!userId) {
      onError?.('用户ID未提供');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onError?.('认证令牌未找到');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    isManualDisconnectRef.current = false;
    updateConnectionState('connecting');

    try {
      const wsUrl = `ws://localhost:8000/api/v1/ws/chat/${userId}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        updateConnectionState('connected');
        reconnectCountRef.current = 0;
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
        wsRef.current = null;

        if (!isManualDisconnectRef.current && reconnectCountRef.current < reconnectAttempts) {
          updateConnectionState('reconnecting');
          scheduleReconnect();
        } else {
          updateConnectionState('disconnected');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('WebSocket连接错误');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      updateConnectionState('disconnected');
      onError?.('创建WebSocket连接失败');
    }
  }, [userId, reconnectAttempts, onMessage, onError, updateConnectionState, scheduleReconnect]);



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
  }, [updateConnectionState]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      onError?.('WebSocket未连接');
    }
  }, [onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    sendMessage,
    connect,
    disconnect,
    isConnected: connectionState === 'connected'
  };
}
