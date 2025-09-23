"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Copy, User, Bot, Wrench, CheckCircle2, AlertTriangle, ListChecks, ChevronDown, ChevronRight } from 'lucide-react';
import DynamicAvatarImage from '@/components/ui/avatar-image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { ModernMessage } from './modern-chat';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ThinkingBlock } from "@/components/ui/thinking-block";
import { parseThinkContent } from "@/lib/think-parser";

export interface MessageListProps {
  messages: ModernMessage[];
  onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void;
  className?: string;
  currentUser?: {
    avatar?: string;
    name?: string;
  };
  // 是否显示工具步骤（思考过程）分组
  showToolSteps?: boolean;
}

// Code block renderer
function CodeBlockRenderer({ inline, className, children, ...props }: any) {
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
}

// Render a single tool_* message bubble
function ToolMessage({ message }: Readonly<{ message: ModernMessage }>) {
  if (message.type === 'tool_result') {
    return (
      <Collapsible defaultOpen={true} className="border rounded-md">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-xs">
          <span className="font-medium">工具结果{message.toolName ? ` · ${message.toolName}` : ''}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <ChevronRight className="h-3.5 w-3.5 data-[state=open]:hidden" />
            <ChevronDown className="h-3.5 w-3.5 hidden data-[state=open]:block" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-2">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{ code: CodeBlockRenderer as any }}
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const base = "rounded-md px-2.5 py-1.5 text-xs flex items-center gap-2 border";
  let color = 'bg-sky-50 text-sky-700 border-sky-200'; // default for tool_complete
  switch (message.type) {
    case 'tool_start':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'tool_progress':
      color = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'tool_success':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'tool_error':
      color = 'bg-red-50 text-red-700 border-red-200';
      break;
    default:
      break;
  }

  return (
    <div className={cn(base, color)}>
      {message.type === 'tool_start' && <Wrench className="h-3.5 w-3.5" />}
      {message.type === 'tool_progress' && <Wrench className="h-3.5 w-3.5" />}
      {message.type === 'tool_success' && <CheckCircle2 className="h-3.5 w-3.5" />}
      {message.type === 'tool_error' && <AlertTriangle className="h-3.5 w-3.5" />}
      {message.type === 'tool_complete' && <ListChecks className="h-3.5 w-3.5" />}
      <span className="whitespace-pre-wrap">{message.content}</span>
    </div>
  );
}

type RenderItem =
  | { kind: 'message'; message: ModernMessage }
  | { kind: 'tool-group'; key: string; items: ModernMessage[] }
  | { kind: 'answer-block'; key: string; tools: ModernMessage[]; assistants: ModernMessage[] };

// Group consecutive tool_* messages as one block (until tool_complete or break)
function groupForRender(messages: ModernMessage[]): RenderItem[] {
  const items: RenderItem[] = [];

  const isTool = (m: ModernMessage) => (m.type?.startsWith('tool_') ?? false);
  const isAssistantMsg = (m: ModernMessage) => m.role === 'assistant';
  const isToolSummarySystem = (m: ModernMessage) =>
    m.role === 'system' && typeof m.content === 'string' && /^\s*工具调用完成[:：]/.test(m.content || ' ');
  const isUserOrSystemBoundary = (m: ModernMessage) =>
    m.role === 'user' || (m.role === 'system' && !isToolSummarySystem(m));

  const collectUntilNextUserOrSystem = (start: number) => {
    const tools: ModernMessage[] = [];
    let lastAssistant: ModernMessage | undefined;
    let idx = start;
    while (idx < messages.length && !isUserOrSystemBoundary(messages[idx])) {
      const m = messages[idx];
      if (isTool(m)) tools.push(m);
      if (isAssistantMsg(m)) lastAssistant = m;
      idx++;
    }
    const assistants = lastAssistant ? [lastAssistant] : [];
    return { nextIndex: idx, tools, assistants } as const;
  };

  let i = 0;
  while (i < messages.length) {
    const cur = messages[i];

    if (isUserOrSystemBoundary(cur)) {
      // Skip standalone tool summary system messages entirely
      if (isToolSummarySystem(cur)) {
        i++;
        continue;
      }
      items.push({ kind: 'message', message: cur });
      const { nextIndex, tools, assistants } = collectUntilNextUserOrSystem(i + 1);
      if (tools.length > 0 || assistants.length > 0) {
        const key = `answer-${tools[0]?.id ?? cur.id}-${assistants[0]?.id ?? 'pending'}`;
        items.push({ kind: 'answer-block', key, tools, assistants });
      }
      i = nextIndex;
      continue;
    }

    if (isAssistantMsg(cur) || isTool(cur)) {
      const { nextIndex, tools, assistants } = collectUntilNextUserOrSystem(i);
      const key = `answer-${tools[0]?.id ?? cur.id}-${assistants[0]?.id ?? 'pending'}`;
      items.push({ kind: 'answer-block', key, tools, assistants });
      i = nextIndex;
      continue;
    }

    // Skip tool summary system message if it somehow falls through
    if (!isToolSummarySystem(cur)) {
      items.push({ kind: 'message', message: cur });
    }
    i++;
  }

  return items;
}

// Standalone icon renderer for tool steps
function StepIcon({ type }: Readonly<{ type?: ModernMessage['type'] }>) {
  switch (type) {
    case 'tool_start':
      return <Wrench className="h-3.5 w-3.5 text-blue-600" />;
    case 'tool_progress':
      return <Wrench className="h-3.5 w-3.5 text-amber-600" />;
    case 'tool_success':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
    case 'tool_error':
      return <AlertTriangle className="h-3.5 w-3.5 text-red-600" />;
    case 'tool_complete':
      return <ListChecks className="h-3.5 w-3.5 text-sky-600" />;
    default:
      return <Wrench className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

// Single step row in the vertical timeline
function StepRow({ m, isLast }: Readonly<{ m: ModernMessage; isLast: boolean }>) {
  const showConnector = !isLast;
  const isResult = m.type === 'tool_result';
  const titleByType = (t?: ModernMessage['type']) => {
    switch (t) {
      case 'tool_start':
        return '开始';
      case 'tool_progress':
        return '执行中';
      case 'tool_success':
        return '成功';
      case 'tool_error':
        return '失败';
      case 'tool_complete':
        return '完成';
      case 'tool_result':
        return '输出';
      default:
        return '步骤';
    }
  };

  return (
    <div className="relative pl-7">
      {showConnector && (
        <div className="absolute left-2 top-4 bottom-0 w-px bg-border" />
      )}
      <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-background border flex items-center justify-center">
        <StepIcon type={m.type} />
      </div>
      <div className="pb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-foreground">{titleByType(m.type)}</span>
          {m.toolName ? (
            <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {m.toolName}
            </span>
          ) : null}
        </div>
        {!isResult ? (
          <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
            {m.content}
          </div>
        ) : (
          <div className="mt-2">
            <ToolMessage message={m} />
          </div>
        )}
      </div>
    </div>
  );
}

// A dedicated, single-card presentation for tool invocation steps (vertical timeline)
function ToolCallCard({ tools }: Readonly<{ tools: ModernMessage[] }>) {
  const toolNames = Array.from(new Set(tools.map(t => t.toolName).filter(Boolean))) as string[];

  return (
    <div className="w-full rounded-lg border bg-card">
      <div className="px-3 py-2 text-xs text-muted-foreground border-b bg-muted/50 flex items-center gap-2">
        <span className="inline-flex items-center gap-1">
          <Wrench className="h-3.5 w-3.5" />
          工具调用
        </span>
        {toolNames.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {toolNames.map((name) => (
              <span key={name} className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        )}
        <span className="ml-auto">步骤 {tools.length}</span>
      </div>
      <div className="p-3">
        {tools.map((m, idx) => (
          <StepRow key={m.id} m={m} isLast={idx === tools.length - 1} />
        ))}
      </div>
    </div>
  );
}

// Backward-compat thin wrapper: render legacy tool-group using the new ToolCallCard
function ToolGroupBlock({ items }: Readonly<{ items: ModernMessage[] }>) {
  return (
    <div className={cn('flex gap-3 group justify-start')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-[80%] items-start w-full">
        <ToolCallCard tools={items} />
      </div>
    </div>
  );
}

function AssistantBubble({ message, onRateResponse }: Readonly<{ message: ModernMessage; onRateResponse?: (id: string, r: 'thumbs-up' | 'thumbs-down') => void }>) {
  const isAssistant = message.role === 'assistant';
  return (
    <div
      className={cn(
        'rounded-lg px-4 py-2 text-sm relative break-words overflow-wrap-anywhere',
        'bg-muted',
        message.isStreaming && 'animate-pulse'
      )}
    >
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{ code: CodeBlockRenderer as any }}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
        >
          {(() => {
            const parsed = parseThinkContent(message.content);
            return parsed.responseContent ?? message.content;
          })()}
        </ReactMarkdown>
      </div>

      {isAssistant && !message.isStreaming && (
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => navigator.clipboard.writeText(message.content)}
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
  );
}

function AnswerBlock({ entry, onRateResponse }: Readonly<{ entry: Extract<RenderItem, { kind: 'answer-block' }>; onRateResponse?: (id: string, r: 'thumbs-up' | 'thumbs-down') => void }>) {
  const lastAssistant = entry.assistants[entry.assistants.length - 1];
  // If the assistant message mostly duplicates the tool_result text, hide it to avoid redundancy
  const toolResultText = (entry.tools
    .filter(t => t.type === 'tool_result')
    .map(t => (t.content || '').trim())
    .join('\n\n')
  ).toLowerCase();
  const assistantText = (lastAssistant?.content || '').trim().toLowerCase();
  // Also treat summary-only lines (e.g., "工具调用完成:") as non-renderable assistant bubbles
  const isSummaryAssistant = !!lastAssistant && /^\s*工具调用完成[:：]/.test(lastAssistant.content || '');
  // Simple heuristic: if assistant includes a sizable prefix of tool result or vice versa, consider duplicate
  const sampleTool = toolResultText.slice(0, Math.min(160, toolResultText.length));
  const sampleAsst = assistantText.slice(0, Math.min(160, assistantText.length));
  const isDuplicate = !!sampleTool && !!sampleAsst && (
    assistantText.includes(sampleTool.slice(0, Math.max(40, Math.floor(sampleTool.length * 0.4)))) ||
    toolResultText.includes(sampleAsst.slice(0, Math.max(40, Math.floor(sampleAsst.length * 0.4))))
  );
  return (
    <div className={cn('flex gap-3 group justify-start')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-[80%] items-start w-full">
        <ToolCallCard tools={entry.tools} />

        {lastAssistant && !isDuplicate && !isSummaryAssistant && (
          <div className="mt-1">
            <AssistantBubble message={lastAssistant} onRateResponse={onRateResponse} />
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageList({ messages, onRateResponse, className, currentUser, showToolSteps = true }: Readonly<MessageListProps>) {
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
    }).format(new Date(timestamp));
  };

  const renderItems: RenderItem[] = showToolSteps
    ? groupForRender(messages)
    : messages.map((m) => ({ kind: 'message', message: m } as RenderItem));

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        {renderItems.map((entry) => {
          if (entry.kind === 'answer-block') {
            return <AnswerBlock key={entry.key} entry={entry} onRateResponse={onRateResponse} />;
          }
          if (entry.kind === 'tool-group') {
            // Fallback: legacy grouping (shouldn’t usually trigger after new logic)
            return <ToolGroupBlock key={entry.key} items={entry.items} />;
          }
          const message = entry.message;
          const isUser = message.role === 'user';
          const isAssistant = message.role === 'assistant';
          return (
            <div key={message.id} className={cn('flex gap-3 group', isUser ? 'justify-end' : 'justify-start')}>
              {!isUser && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={cn('flex flex-col max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
                {isAssistant && (() => {
                  const parsed = parseThinkContent(message.content);
                  return parsed.thinkingContent ? (
                    <div className="w-full mb-2">
                      <ThinkingBlock content={parsed.thinkingContent} isThinkingComplete={parsed.isThinkingComplete} />
                    </div>
                  ) : null;
                })()}

                <div
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm relative break-words overflow-wrap-anywhere',
                    (() => {
                      if (message.role === 'user') return 'bg-primary text-primary-foreground';
                      if (message.role === 'system') return 'bg-muted text-muted-foreground italic';
                      return 'bg-muted';
                    })(),
                    message.isStreaming && 'animate-pulse'
                  )}
                >
                  {isUser || message.role === 'system' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        components={{ code: CodeBlockRenderer as any }}
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                      >
                        {(() => {
                          const parsed = parseThinkContent(message.content);
                          return parsed.responseContent ?? message.content;
                        })()}
                      </ReactMarkdown>
                    </div>
                  )}

                  {isAssistant && !message.isStreaming && (
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

                {message.timestamp && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(message.timestamp)}
                  </span>
                )}
              </div>

              {isUser && (
                <Avatar className="h-8 w-8 shrink-0">
                  {currentUser?.avatar ? (
                    <DynamicAvatarImage
                      avatarPath={currentUser.avatar}
                      alt={currentUser.name || '用户'}
                      className="aspect-square size-full rounded-full"
                      fallbackClassName="h-4 w-4"
                    />
                  ) : null}
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}