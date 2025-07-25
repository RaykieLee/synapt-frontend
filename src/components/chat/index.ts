// Export all chat components
export { FloatingChatWidget } from './FloatingChatWidget';
export { FloatingChatButton } from './FloatingChatButton';
export { ChatPopup, MobileChatPopup } from './ChatPopup';
export { ModernChatInterface } from './ModernChatInterface';

// Export hooks
export { useChat } from '@/hooks/useChat';
export { useWebSocket } from '@/hooks/useWebSocket';
export { useLLMChatForWidget } from '@/hooks/useLLMChatForWidget';
export { useChatAdapter } from '@/hooks/useChatAdapter';

// Export types
export * from '@/types/chat';
