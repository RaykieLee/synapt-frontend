// Chat-related type definitions for the floating chat widget

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'error';
  isOwn: boolean;
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
  placeholder: '输入消息...',
  disabled: false
};

// WebSocket connection states
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

// Chat event types
export interface ChatEvents {
  onMessageReceived?: (message: ChatMessage) => void;
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
