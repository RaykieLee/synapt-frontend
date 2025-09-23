"use client";

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageInput } from './message-input';
import { MessageList } from './message-list';
import { PromptSuggestions } from './prompt-suggestions';
import { TypingIndicator } from './typing-indicator';

export interface ModernMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  // Extended metadata to support tool/think rendering
  type?: 'text' | 'system' | 'error' | 'user' | 'assistant' | 'tool_start' | 'tool_progress' | 'tool_success' | 'tool_error' | 'tool_complete' | 'tool_result' | 'assistant_streaming';
  metadata?: Record<string, any>;
  toolName?: string;
}

export interface ModernChatProps {
  messages: ModernMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  isGenerating?: boolean;
  stop?: () => void;
  setMessages?: (messages: ModernMessage[]) => void;
  append?: (message: ModernMessage) => void;
  suggestions?: string[];
  onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void;
  className?: string;
  transcribeAudio?: (blob: Blob) => Promise<string>;
}

export interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
}

export interface ChatMessagesProps {
  messages: ModernMessage[];
  isTyping?: boolean;
  onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void;
  showToolSteps?: boolean;
}

export interface ChatFormProps {
  isPending?: boolean;
  handleSubmit: (e?: React.FormEvent) => void;
  className?: string;
  children: (props: { files: File[] | null; setFiles: (files: File[] | null) => void }) => React.ReactElement;
}

// ChatContainer Component
export function ChatContainer({ children, className }: Readonly<ChatContainerProps>) {
  return (
    <div className={cn("flex flex-col h-full max-h-[600px] w-full overflow-hidden", className)}>
      {children}
    </div>
  );
}

// ChatMessages Component
export function ChatMessages({ messages, isTyping, onRateResponse, showToolSteps }: Readonly<ChatMessagesProps>) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 min-h-0 max-h-full">
      <div className="py-4 space-y-4">
        <MessageList messages={messages} onRateResponse={onRateResponse} showToolSteps={showToolSteps} />
        {isTyping && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
}

// ChatForm Component
export function ChatForm({ isPending, handleSubmit, className, children }: Readonly<ChatFormProps>) {
  const [files, setFiles] = useState<File[] | null>(null);

  return (
    <form onSubmit={handleSubmit} className={cn("p-4 border-t bg-background shrink-0", className)}>
      {children({ files, setFiles })}
    </form>
  );
}

// Main Chat Component
export function ModernChat({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isGenerating = false,
  stop,
  setMessages,
  append,
  suggestions = [],
  onRateResponse,
  className,
  transcribeAudio
}: Readonly<ModernChatProps>) {
  const isEmpty = messages.length === 0;
  const lastMessage = messages.at(-1);
  const isTyping = lastMessage?.role === "user" && isGenerating;
  // Always show tool steps per UX requirement
  const showToolSteps = true;

  return (
    <ChatContainer className={className}>
      {isEmpty && suggestions.length > 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <PromptSuggestions
            append={append}
            suggestions={suggestions}
          />
        </div>
      ) : null}

      {!isEmpty ? (
        <ChatMessages 
          messages={messages} 
          isTyping={isTyping}
          onRateResponse={onRateResponse}
          showToolSteps={true}
        />
      ) : null}

      <ChatForm
        className="mt-auto"
        isPending={isGenerating || isTyping}
        handleSubmit={handleSubmit}
      >
        {({ files, setFiles }) => (
          <MessageInput
            value={input}
            onChange={handleInputChange}
            allowAttachments={false}
            stop={stop}
            isGenerating={isGenerating}
            transcribeAudio={transcribeAudio}
          />
        )}
      </ChatForm>
    </ChatContainer>
  );
}