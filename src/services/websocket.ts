import { io, Socket } from 'socket.io-client';
import { getWebSocketBaseUrl } from '@/utils/websocket-config';

export interface QualificationRecognitionUpdate {
  type: 'progress' | 'content' | 'success' | 'error';
  message?: string;
  step?: string;
  content?: string;
  accumulated?: string;
  data?: any;
  raw_content?: string;
}

export interface QualificationRecognitionCallbacks {
  onProgress?: (message: string, step?: string) => void;
  onContent?: (content: string, accumulated: string) => void;
  onSuccess?: (data: any, rawContent?: string) => void;
  onError?: (error: string) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private baseUrl: string;

  constructor() {
    // 获取WebSocket基础URL
    this.baseUrl = getWebSocketBaseUrl();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.baseUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true
        });

        this.socket.on('connect', () => {
          console.log('WebSocket连接成功');
          resolve();
        });

        this.socket.on('connect_error', (error: Error) => {
          console.error('WebSocket连接失败:', error);
          reject(error);
        });

        this.socket.on('disconnect', (reason: string) => {
          console.log('WebSocket连接断开:', reason);
        });

        this.socket.on('connected', (data: any) => {
          console.log('收到连接确认:', data);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  async qualificationRecognitionStream(
    imageData: string,
    imageFormat: string = 'jpeg',
    callbacks: QualificationRecognitionCallbacks
  ): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('WebSocket未连接');
    }

    const socket = this.socket; // 保存引用以避免null检查问题

    return new Promise((resolve, reject) => {
      // 设置监听器
      const handleUpdate = (update: QualificationRecognitionUpdate) => {
        console.log('收到识别更新:', update);

        switch (update.type) {
          case 'progress':
            callbacks.onProgress?.(update.message || '', update.step);
            break;
          case 'content':
            callbacks.onContent?.(update.content || '', update.accumulated || '');
            break;
          case 'success':
            callbacks.onSuccess?.(update.data, update.raw_content);
            socket.off('qualification_recognition_update', handleUpdate);
            socket.off('error', handleError);
            resolve();
            break;
          case 'error':
            callbacks.onError?.(update.message || '处理失败');
            socket.off('qualification_recognition_update', handleUpdate);
            socket.off('error', handleError);
            reject(new Error(update.message || '处理失败'));
            break;
        }
      };

      const handleError = (error: any) => {
        console.error('WebSocket错误:', error);
        callbacks.onError?.(error.message || '连接错误');
        socket.off('qualification_recognition_update', handleUpdate);
        socket.off('error', handleError);
        reject(new Error(error.message || '连接错误'));
      };

      // 注册事件监听器
      socket.on('qualification_recognition_update', handleUpdate);
      socket.on('error', handleError);

      // 发送识别请求
      socket.emit('qualification_recognition_stream', {
        image_data: imageData,
        image_format: imageFormat
      });
    });
  }

  testConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('WebSocket未连接'));
        return;
      }

      const timeout = setTimeout(() => {
        this.socket?.off('test_response');
        reject(new Error('测试超时'));
      }, 5000);

      this.socket.once('test_response', (data: any) => {
        clearTimeout(timeout);
        resolve(data);
      });

      this.socket.emit('test_connection', { test: true, timestamp: Date.now() });
    });
  }
}

// 创建单例实例
export const websocketService = new WebSocketService();

// 工具函数：将文件转换为base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除data URL前缀，只保留base64数据
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}; 