'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Loader,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface StreamingJsonDisplayProps {
  isStreaming: boolean;
  progress?: {
    message: string;
    step?: string;
  };
  accumulatedContent: string;
  finalData?: any;
  onComplete?: (data: any) => void;
}

export function StreamingJsonDisplay({
  isStreaming,
  progress,
  accumulatedContent,
  finalData,
  onComplete
}: StreamingJsonDisplayProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const contentRef = useRef<HTMLPreElement>(null);

  // 模拟打字机效果
  useEffect(() => {
    if (!accumulatedContent || !isStreaming) return;

    setIsTyping(true);
    let currentIndex = displayedContent.length;
    
    const typeNextChar = () => {
      if (currentIndex < accumulatedContent.length) {
        setDisplayedContent(accumulatedContent.slice(0, currentIndex + 1));
        currentIndex++;
        
        // 随机延迟模拟真实打字
        const delay = Math.random() * 30 + 10;
        setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
      }
    };

    if (currentIndex < accumulatedContent.length) {
      typeNextChar();
    }
  }, [accumulatedContent, isStreaming]);

  // 滚动到底部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedContent]);

  // 完成时的处理
  useEffect(() => {
    if (finalData && !isStreaming) {
      setDisplayedContent(JSON.stringify(finalData, null, 2));
      setIsTyping(false);
      onComplete?.(finalData);
    }
  }, [finalData, isStreaming, onComplete]);

  const handleCopy = () => {
    const content = finalData ? JSON.stringify(finalData, null, 2) : displayedContent;
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制",
      description: "JSON内容已复制到剪贴板",
    });
  };

  const getProgressStepIcon = (step?: string) => {
    switch (step) {
      case 'encoding':
        return <FileText className="h-4 w-4" />;
      case 'ai_request':
        return <Zap className="h-4 w-4" />;
      case 'ai_processing':
        return <Eye className="h-4 w-4" />;
      case 'parsing':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Loader className="h-4 w-4 animate-spin" />;
    }
  };

  const getProgressColor = (step?: string) => {
    switch (step) {
      case 'encoding':
        return 'bg-blue-500';
      case 'ai_request':
        return 'bg-purple-500';
      case 'ai_processing':
        return 'bg-green-500';
      case 'parsing':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const estimateProgress = () => {
    if (!progress?.step) return 0;
    
    const steps = ['encoding', 'ai_request', 'ai_processing', 'parsing'];
    const currentStepIndex = steps.indexOf(progress.step);
    
    if (currentStepIndex === -1) return 0;
    
    const baseProgress = (currentStepIndex / steps.length) * 100;
    
    // 在AI处理阶段根据内容长度估算进度
    if (progress.step === 'ai_processing' && displayedContent) {
      const contentProgress = Math.min(displayedContent.length / 1000, 1) * 25;
      return baseProgress + contentProgress;
    }
    
    return baseProgress;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            实时JSON流
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader className="h-3 w-3" />
                    </motion.div>
                    流式传输中
                  </Badge>
                </motion.div>
              )}
              
              {finalData && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    传输完成
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!displayedContent}
            >
              <Copy className="h-4 w-4 mr-1" />
              复制
            </Button>
          </div>
        </div>
        
        {/* 进度显示 */}
        <AnimatePresence>
          {isStreaming && progress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getProgressStepIcon(progress.step)}
                <span>{progress.message}</span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={estimateProgress()} 
                  className="h-2"
                />
                <motion.div
                  className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor(progress.step)}`}
                  style={{ width: `${estimateProgress()}%` }}
                  animate={{ width: `${estimateProgress()}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <pre 
            ref={contentRef}
            className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 border font-mono leading-relaxed"
            style={{ minHeight: '200px' }}
          >
            {displayedContent || (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>等待数据流...</p>
                </div>
              </div>
            )}
            
            {/* 光标效果 */}
            <AnimatePresence>
              {isTyping && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-primary ml-1"
                />
              )}
            </AnimatePresence>
          </pre>
          
          {/* 流式效果覆盖层 */}
          <AnimatePresence>
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
                  animation: 'shimmer 2s infinite'
                }}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* 数据统计 */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>字符数: {displayedContent.length}</span>
            <span>行数: {displayedContent.split('\n').length}</span>
          </div>
          
          {finalData && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-600">解析成功</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Card>
  );
} 