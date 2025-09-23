"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useLLMChatForWidget } from '@/hooks/useLLMChatForWidget';
import { ChatEvents, ChatMessage } from '@/types/chat';

interface ChatConnectionProviderProps {
  children: React.ReactNode;
  maxMessages?: number;
  events?: ChatEvents;
}

interface ChatConnectionContextValue {
  isConnected: boolean;
  messages: ChatMessage[];
  unreadCount: number;
  isTyping: boolean;
  connectionError?: string;
  user: any;
  sendMessage: (message: string) => void;
  markAsRead: () => void;
  connect: () => void;
  disconnect: () => void;
}

const ChatConnectionContext = createContext<ChatConnectionContextValue | undefined>(undefined);

export function ChatConnectionProvider({ children, maxMessages = 100, events }: Readonly<ChatConnectionProviderProps>) {
  const {
    isConnected,
    messages,
    unreadCount,
    isTyping,
    connectionError,
    user,
    sendMessage,
    markAsRead,
    connect,
    disconnect,
  } = useLLMChatForWidget({ maxMessages, events });

  const value = useMemo<ChatConnectionContextValue>(() => ({
    isConnected,
    messages,
    unreadCount,
    isTyping,
    connectionError,
    user,
    sendMessage,
    markAsRead,
    connect,
    disconnect,
  }), [
    isConnected,
    messages,
    unreadCount,
    isTyping,
    connectionError,
    user,
    sendMessage,
    markAsRead,
    connect,
    disconnect,
  ]);

  return (
    <ChatConnectionContext.Provider value={value}>
      {children}
    </ChatConnectionContext.Provider>
  );
}

export function useChatConnection() {
  const ctx = useContext(ChatConnectionContext);
  if (!ctx) {
    throw new Error('useChatConnection must be used within a ChatConnectionProvider');
  }
  return ctx;
}
