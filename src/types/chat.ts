// Chat-related type definitions for the floating chat widget

export interface ChatMessage {
  id: string;
  userId: string;
  userName?: string;
  username?: string; // 兼容后端返回的字段名
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'error' | 'user' | 'assistant';
  isOwn?: boolean;
  isStreaming?: boolean; // 用于标识流式消息
}

export interface ChatState {
  isOpen: boolean;
  isConnected: boolean;
  messages: ChatMessage[];
  unreadCount: number;
  isTyping: boolean;
  connectionError?: string;
}

export interface WebSocketMessage {
  type: 'message' | 'user_joined' | 'user_left' | 'typing' | 'error';
  data: any;
  timestamp: string;
}

export interface ChatWidgetConfig {
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  offset: { x: number; y: number };
  theme: 'light' | 'dark' | 'auto';
  maxMessages: number;
  reconnectAttempts: number;
  reconnectInterval: number;
  placeholder: string;
  disabled: boolean;
}

export const defaultChatConfig: ChatWidgetConfig = {
  position: 'bottom-left',
  offset: { x: 20, y: 20 },
  theme: 'auto',
  maxMessages: 100,
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  placeholder: '与AI助手对话...',
  disabled: false
};

// WebSocket connection states
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

// Chat event types
export interface ChatEvents {
  onMessageReceived?: (message: ChatMessage) => void;
  onMessage?: (message: ChatMessage) => void; // 添加 onMessage 支持
  onUserJoined?: (userName: string) => void;
  onUserLeft?: (userName: string) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onError?: (error: string) => void;
}

// Props interfaces for components
export interface FloatingChatButtonProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  offset?: { x: number; y: number };
  className?: string;
  disabled?: boolean;
  unreadCount?: number;
  onClick?: () => void;
}

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
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  currentUserId?: string;
}

export interface FloatingChatWidgetProps {
  config?: Partial<ChatWidgetConfig>;
  events?: ChatEvents;
  className?: string;
}

export interface ModernChatInterfaceProps {
  className?: string;
  suggestions?: string[];
  onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void;
  maxMessages?: number;
  events?: ChatEvents;
}
