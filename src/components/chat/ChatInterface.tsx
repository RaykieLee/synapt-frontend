"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatInterfaceProps, ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = '输入消息...',
  className,
  currentUserId
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isOwn = message.isOwn || message.userId === currentUserId;
    const isSystem = message.type === 'system';
    const isError = message.type === 'error';

    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center my-2">
          <Badge variant="secondary" className="text-xs px-3 py-1">
            {message.content}
            <span className="ml-2 opacity-70">
              {formatTime(message.timestamp)}
            </span>
          </Badge>
        </div>
      );
    }

    if (isError) {
      return (
        <div key={message.id} className="flex justify-center my-2">
          <Badge variant="destructive" className="text-xs px-3 py-1">
            {message.content}
            <span className="ml-2 opacity-70">
              {formatTime(message.timestamp)}
            </span>
          </Badge>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={cn(
          "flex mb-4",
          isOwn ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-lg px-3 py-2 shadow-sm",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {!isOwn && (
            <div className="text-xs font-medium mb-1 opacity-70">
              {message.userName || message.username}
            </div>
          )}
          <div className="text-sm break-words whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
            )}
          </div>
          <div
            className={cn(
              "text-xs mt-1 opacity-70",
              isOwn ? "text-right" : "text-left"
            )}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages Area */}
      <ScrollArea className="chat-messages flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-sm">暂无消息</div>
              <div className="text-xs mt-1 opacity-70">开始聊天吧！</div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
