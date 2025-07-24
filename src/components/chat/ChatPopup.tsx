"use client";

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatPopupProps } from '@/types/chat';
import { cn } from '@/lib/utils';

export function ChatPopup({
  isOpen,
  onClose,
  position,
  className,
  children
}: ChatPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate popup position to avoid viewport overflow
  const getPopupStyle = () => {
    const popupWidth = 380;
    const popupHeight = 500;
    const margin = 10;

    let left = position.x;
    let bottom = window.innerHeight - position.y + 70; // 70px offset from button

    // Adjust horizontal position if popup would overflow
    if (left + popupWidth > window.innerWidth - margin) {
      left = window.innerWidth - popupWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    // Adjust vertical position if popup would overflow
    if (bottom + popupHeight > window.innerHeight - margin) {
      bottom = window.innerHeight - popupHeight - margin;
    }

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      bottom: `${bottom}px`,
      width: `${popupWidth}px`,
      height: `${popupHeight}px`,
      zIndex: 1000,
    };
  };

  return (
    <div
      ref={popupRef}
      style={getPopupStyle()}
      className={cn(
        "chat-popup chat-popup-enter animate-in slide-in-from-bottom-2 fade-in-0 duration-200",
        className
      )}
    >
      <Card className="h-full flex flex-col shadow-2xl border-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <h3 className="font-semibold text-lg">聊天</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </Card>
    </div>
  );
}

// Mobile responsive version
export function MobileChatPopup({
  isOpen,
  onClose,
  className,
  children
}: Omit<ChatPopupProps, 'position'>) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div
        ref={popupRef}
        className={cn(
          "fixed inset-x-4 top-4 bottom-4 md:inset-x-8 md:top-8 md:bottom-8",
          "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
          className
        )}
      >
        <Card className="h-full flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <h3 className="font-semibold text-lg">聊天</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
}
