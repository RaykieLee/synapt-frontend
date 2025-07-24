"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FloatingChatButtonProps } from '@/types/chat';
import { cn } from '@/lib/utils';

export function FloatingChatButton({
  position = 'bottom-left',
  offset = { x: 20, y: 20 },
  className,
  disabled = false,
  unreadCount = 0,
  onClick
}: FloatingChatButtonProps) {
  const positionStyle = {
    [position.includes('bottom') ? 'bottom' : 'top']: `${offset.y}px`,
    [position.includes('left') ? 'left' : 'right']: `${offset.x}px`,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn('fixed z-50', className)}
            style={positionStyle}
          >
            <Button
              size="lg"
              className={cn(
                "floating-chat-button relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "border-2 border-background",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={onClick}
              disabled={disabled}
            >
              <MessageCircle className="h-6 w-6" />
              
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className={cn(
                    "unread-badge absolute -top-2 -right-2 h-6 w-6 rounded-full p-0",
                    "flex items-center justify-center text-xs font-bold"
                  )}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="mb-2">
          <p>打开聊天</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
