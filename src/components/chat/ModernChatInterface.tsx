"use client";

import React, { useState, useCallback } from 'react';
import { ModernChat } from '@/components/ui/modern-chat';
import { useChatAdapter } from '@/hooks/useChatAdapter';
import { cn } from '@/lib/utils';

export interface ModernChatInterfaceProps {
  className?: string;
  suggestions?: string[];
  onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void;
  maxMessages?: number;
  events?: any;
}

export function ModernChatInterface({
  className,
  suggestions = [
    "你好，请介绍一下自己",
    "帮我写一个简单的Python函数",
    "解释一下什么是机器学习",
    "今天天气怎么样？"
  ],
  onRateResponse,
  maxMessages = 100,
  events
}: ModernChatInterfaceProps) {
  const [input, setInput] = useState('');
  
  const {
    messages,
    handleSubmit: originalHandleSubmit,
    isLoading,
    stop,
    append,
    sendMessage,
    isConnected,
    connectionError
  } = useChatAdapter({ maxMessages, events });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !isConnected) return;
    
    // 发送消息
    sendMessage(input.trim());
    
    // 清空输入框
    setInput('');
  }, [input, sendMessage, isConnected]);

  // 语音转录功能
  const transcribeAudio = useCallback(async (blob: Blob): Promise<string> => {
    try {
      // 动态导入API函数以避免SSR问题
      const { transcribeAudio: apiTranscribeAudio } = await import('@/lib/api');

      // 调用后端API进行语音转录
      const result = await apiTranscribeAudio(blob, {
        model: 'sensevoice',
        sampleRate: 16000,
        language: 'zh'
      });

      return result;
    } catch (error) {
      console.error('语音转录失败:', error);
      // 返回错误提示而不是抛出异常，这样用户界面不会崩溃
      return '语音转录失败，请重试';
    }
  }, []);

  return (
    <div className={cn("h-full flex flex-col overflow-hidden", className)}>
      {/* 连接状态指示器 */}
      {connectionError && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 shrink-0">
          <div className="text-sm text-destructive text-center">
            {connectionError}
          </div>
        </div>
      )}
      
      {!isConnected && !connectionError && (
        <div className="px-4 py-2 bg-muted/50 border-b shrink-0">
          <div className="text-sm text-muted-foreground text-center">
            连接中...
          </div>
        </div>
      )}

      {/* 主聊天界面 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ModernChat
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isGenerating={isLoading}
          stop={stop}
          append={append}
          suggestions={suggestions}
          onRateResponse={onRateResponse}
          transcribeAudio={transcribeAudio}
          className="h-full"
        />
      </div>
    </div>
  );
}