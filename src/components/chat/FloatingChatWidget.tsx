"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { FloatingChatButton } from './FloatingChatButton';
import { ChatPopup, MobileChatPopup } from './ChatPopup';
import { ModernChatInterface } from './ModernChatInterface';
import { useLLMChatForWidget } from '@/hooks/useLLMChatForWidget';
import { FloatingChatWidgetProps, defaultChatConfig } from '@/types/chat';
import { cn } from '@/lib/utils';

export function FloatingChatWidget({
  config = {},
  events,
  className
}: FloatingChatWidgetProps) {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Merge config with defaults using useMemo to prevent unnecessary re-renders
  const finalConfig = useMemo(() => ({ ...defaultChatConfig, ...config }), [config]);

  // Initialize LLM chat hook
  const {
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
  } = useLLMChatForWidget({
    maxMessages: finalConfig.maxMessages,
    events
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update button position when window resizes
  useEffect(() => {
    const updateButtonPosition = () => {
      const { position, offset } = finalConfig;
      let x = offset.x;
      let y = offset.y;

      switch (position) {
        case 'bottom-left':
          x = offset.x;
          y = window.innerHeight - offset.y;
          break;
        case 'bottom-right':
          x = window.innerWidth - offset.x - 56; // 56px is button width
          y = window.innerHeight - offset.y;
          break;
        case 'top-left':
          x = offset.x;
          y = offset.y;
          break;
        case 'top-right':
          x = window.innerWidth - offset.x - 56;
          y = offset.y;
          break;
      }

      setButtonPosition({ x, y });
    };

    updateButtonPosition();
    window.addEventListener('resize', updateButtonPosition);
    return () => window.removeEventListener('resize', updateButtonPosition);
  }, [finalConfig]);

  // Handle button click
  const handleButtonClick = () => {
    toggleOpen();
    if (!isOpen) {
      markAsRead();
    }
  };

  // Handle popup close
  const handlePopupClose = () => {
    if (isOpen) {
      toggleOpen();
    }
  };

  // Don't render if disabled
  if (finalConfig.disabled) {
    return null;
  }

  // Connection status indicator
  const getConnectionStatus = () => {
    if (!isConnected && connectionError) {
      return connectionError;
    }
    if (!isConnected) {
      return '连接中...';
    }
    return null;
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className={cn("floating-chat-widget", className)}>
      {/* Floating Button */}
      <FloatingChatButton
        position={finalConfig.position}
        offset={finalConfig.offset}
        disabled={finalConfig.disabled}
        unreadCount={unreadCount}
        onClick={handleButtonClick}
      />

      {/* Chat Popup */}
      {isMobile ? (
        <MobileChatPopup
          isOpen={isOpen}
          onClose={handlePopupClose}
          title="AI聊天"
          connectionStatus={{
            isConnected,
            error: connectionError
          }}
        >
          <ModernChatInterface
            className="h-full"
            maxMessages={finalConfig.maxMessages}
            events={events}
          />
        </MobileChatPopup>
      ) : (
        <ChatPopup
          isOpen={isOpen}
          onClose={handlePopupClose}
          position={buttonPosition}
          title="AI聊天"
          connectionStatus={{
            isConnected,
            error: connectionError
          }}
        >
          <ModernChatInterface
            className="h-full"
            maxMessages={finalConfig.maxMessages}
            events={events}
          />
        </ChatPopup>
      )}
    </div>
  );
}
