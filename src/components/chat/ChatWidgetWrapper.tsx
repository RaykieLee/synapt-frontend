"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { FloatingChatWidget } from './FloatingChatWidget';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// Pages where the chat widget should not be displayed
const EXCLUDED_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

export function ChatWidgetWrapper() {
  const pathname = usePathname();
  const { user, isLoading, token } = useAuth();

  // Don't show on excluded paths
  if (EXCLUDED_PATHS.includes(pathname)) {
    return null;
  }

  // Don't show if no authentication
  if (!isLoading && !token && !user) {
    return null;
  }

  return (
    <ChatErrorBoundary>
      <FloatingChatWidget
        config={{
          position: 'bottom-right',
          offset: { x: 50, y: 50 },
          placeholder: '输入消息...',
          maxMessages: 100,
          reconnectAttempts: 5,
          reconnectInterval: 3000
        }}
        events={{
          onMessageReceived: (message) => {
            console.log('New message received:', message);
          },
          onConnectionStateChange: (state) => {
            console.log('Connection state changed:', state);
            if (state === 'connected') {
              toast.success('聊天已连接');
            } else if (state === 'disconnected') {
              toast.error('聊天连接已断开');
            }
          },
          onError: (error) => {
            console.error('Chat error:', error);
            toast.error(`聊天错误: ${error}`);
          }
        }}
      />
    </ChatErrorBoundary>
  );
}
