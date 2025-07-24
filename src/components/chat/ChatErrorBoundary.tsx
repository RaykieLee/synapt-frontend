"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat widget error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-4 m-4 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-sm">聊天组件错误</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            聊天功能暂时不可用，请稍后重试。
          </p>
          <Button
            onClick={this.handleRetry}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
