import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatPopup, MobileChatPopup } from '../ChatPopup';

describe('ChatPopup', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    position: { x: 100, y: 100 },
    children: <div>Chat content</div>,
    title: "测试聊天",
    connectionStatus: {
      isConnected: false,
      error: undefined
    }
  };

  it('should show connection status when showConnectionStatus is true', () => {
    render(
      <ChatPopup 
        {...defaultProps} 
        showConnectionStatus={true}
      />
    );
    
    expect(screen.getByText('未连接')).toBeInTheDocument();
  });

  it('should not show connection status when showConnectionStatus is false', () => {
    render(
      <ChatPopup 
        {...defaultProps} 
        showConnectionStatus={false}
      />
    );
    
    expect(screen.queryByText('未连接')).not.toBeInTheDocument();
  });

  it('should show connection status by default', () => {
    render(<ChatPopup {...defaultProps} />);
    
    expect(screen.getByText('未连接')).toBeInTheDocument();
  });
});

describe('MobileChatPopup', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Chat content</div>,
    title: "测试聊天",
    connectionStatus: {
      isConnected: false,
      error: undefined
    }
  };

  it('should show connection status when showConnectionStatus is true', () => {
    render(
      <MobileChatPopup 
        {...defaultProps} 
        showConnectionStatus={true}
      />
    );
    
    expect(screen.getByText('未连接')).toBeInTheDocument();
  });

  it('should not show connection status when showConnectionStatus is false', () => {
    render(
      <MobileChatPopup 
        {...defaultProps} 
        showConnectionStatus={false}
      />
    );
    
    expect(screen.queryByText('未连接')).not.toBeInTheDocument();
  });
});
