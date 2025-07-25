"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Copy, User, Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { ModernMessage } from './modern-chat';

export interface MessageListProps {
  messages: ModernMessage[];
  onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void;
  className?: string;
}

export function MessageList({ messages, onRateResponse, className }: MessageListProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 group",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role !== 'user' && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "flex flex-col max-w-[80%]",
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2 text-sm relative break-words overflow-wrap-anywhere",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : message.role === 'system'
                    ? "bg-muted text-muted-foreground italic"
                    : "bg-muted",
                  message.isStreaming && "animate-pulse"
                )}
              >
                {message.role === 'user' || message.role === 'system' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeHighlight]}
                      components={{
                        code: ({ node, inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Message actions */}
                {message.role === 'assistant' && !message.isStreaming && (
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>复制</TooltipContent>
                    </Tooltip>

                    {onRateResponse && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onRateResponse(message.id, 'thumbs-up')}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>好评</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onRateResponse(message.id, 'thumbs-down')}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>差评</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              {message.timestamp && (
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(message.timestamp)}
                </span>
              )}
            </div>

            {message.role === 'user' && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}