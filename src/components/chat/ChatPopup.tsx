"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  className?: string;
  children?: React.ReactNode;
  title?: string;
  connectionStatus?: {
    isConnected: boolean;
    error?: string;
  };
  showConnectionStatus?: boolean;
}

export interface MobileChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  connectionStatus?: {
    isConnected: boolean;
    error?: string;
  };
  showConnectionStatus?: boolean;
}

// Desktop Chat Popup
export function ChatPopup({
  isOpen,
  onClose,
  position,
  className,
  children,
  title = "聊天",
  connectionStatus,
  showConnectionStatus = true
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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate popup position to avoid going off screen
  const popupWidth = 580;
  const popupHeight = 600;
  const padding = 20;

  let adjustedX = position.x;
  let adjustedY = position.y;

  // Adjust horizontal position
  if (adjustedX + popupWidth > window.innerWidth - padding) {
    adjustedX = window.innerWidth - popupWidth - padding;
  }
  if (adjustedX < padding) {
    adjustedX = padding;
  }

  // Adjust vertical position
  if (adjustedY + popupHeight > window.innerHeight - padding) {
    adjustedY = window.innerHeight - popupHeight - padding;
  }
  if (adjustedY < padding) {
    adjustedY = padding;
  }

  return (
    <div
      ref={popupRef}
      className={cn(
        "fixed z-50 w-[550px] h-[600px] shadow-2xl",
        className
      )}
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
      }}
    >
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b shrink-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {title}
            {connectionStatus && showConnectionStatus && (
              <Badge variant={connectionStatus.isConnected ? "default" : "destructive"} className="text-xs">
                {connectionStatus.isConnected ? (
                  <><Wifi className="h-3 w-3 mr-1" />已连接</>
                ) : (
                  <><WifiOff className="h-3 w-3 mr-1" />未连接</>
                )}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0 overflow-hidden">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

// Mobile Chat Popup (Full Screen)
export function MobileChatPopup({
  isOpen,
  onClose,
  className,
  children,
  title = "聊天",
  connectionStatus,
  showConnectionStatus = true
}: MobileChatPopupProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background",
      className
    )}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            {connectionStatus && showConnectionStatus && (
              <Badge variant={connectionStatus.isConnected ? "default" : "destructive"} className="text-xs">
                {connectionStatus.isConnected ? (
                  <><Wifi className="h-3 w-3 mr-1" />已连接</>
                ) : (
                  <><WifiOff className="h-3 w-3 mr-1" />未连接</>
                )}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}