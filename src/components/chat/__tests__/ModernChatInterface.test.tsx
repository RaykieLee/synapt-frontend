import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModernChatInterface } from '../ModernChatInterface';

// Mock the hooks
jest.mock('@/hooks/useChatAdapter', () => ({
  useChatAdapter: jest.fn(() => ({
    messages: [],
    isLoading: false,
    stop: jest.fn(),
    append: jest.fn(),
    sendMessage: jest.fn(),
    isConnected: false,
    connectionError: null,
    isOpen: true
  }))
}));

describe('ModernChatInterface', () => {
  it('should not show connecting message immediately when chat opens', () => {
    render(<ModernChatInterface />);
    
    // 应该不显示"连接中..."消息
    expect(screen.queryByText('连接中...')).not.toBeInTheDocument();
  });

  it('should show connecting message after delay when chat is open and not connected', async () => {
    render(<ModernChatInterface />);
    
    // 等待1秒后应该显示"连接中..."消息
    await waitFor(() => {
      expect(screen.getByText('连接中...')).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  it('should show connection error immediately', () => {
    const { useChatAdapter: mockUseChatAdapter } = await import('@/hooks/useChatAdapter');
    mockUseChatAdapter.mockReturnValue({
      messages: [],
      isLoading: false,
      stop: jest.fn(),
      append: jest.fn(),
      sendMessage: jest.fn(),
      isConnected: false,
      connectionError: '连接失败',
      isOpen: true
    });

    render(<ModernChatInterface />);
    
    // 错误消息应该立即显示
    expect(screen.getByText('连接失败')).toBeInTheDocument();
    // 不应该显示"连接中..."消息
    expect(screen.queryByText('连接中...')).not.toBeInTheDocument();
  });
});
