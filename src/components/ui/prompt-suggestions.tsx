"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { ModernMessage } from './modern-chat';

export interface PromptSuggestionsProps {
  append?: (message: ModernMessage) => void;
  suggestions: string[];
  className?: string;
}

export function PromptSuggestions({ append, suggestions, className }: PromptSuggestionsProps) {
  const handleSuggestionClick = (suggestion: string) => {
    if (append) {
      const message: ModernMessage = {
        id: `suggestion-${Date.now()}`,
        role: 'user',
        content: suggestion,
        timestamp: new Date(),
      };
      append(message);
    }
  };

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center gap-4 max-w-2xl mx-auto", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lightbulb className="h-5 w-5" />
        <span className="text-sm font-medium">建议问题</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 text-left justify-start whitespace-normal"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <span className="text-sm">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}