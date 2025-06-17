"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FaceRecognitionSimpleProps {
  onSuccess?: (faceData: string) => void;
  onError?: (error: string) => void;
}

export default function FaceRecognitionSimple({
  onSuccess,
  onError,
}: FaceRecognitionSimpleProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>("");

  // 启动摄像头 - 简化版本
  const startCamera = useCallback(async () => {
    try {
      setError("");
      console.log('启动摄像头...');
      
      // 检查浏览器支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持摄像头功能');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      console.log('获取到视频流:', stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 立即设置状态
        setIsStreaming(true);
        
        // 尝试播放
        videoRef.current.play().catch(err => {
          console.error('播放视频失败:', err);
        });
        
        console.log('视频设置完成');
      }
    } catch (error) {
      console.error('启动摄像头失败:', error);
      const errorMessage = error instanceof Error ? error.message : '启动摄像头失败';
      setError(errorMessage);
      onError?.(errorMessage);
      toast({
        title: "摄像头启动失败",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [onError, toast]);

  // 停止摄像头
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('停止摄像头轨道:', track);
      });
      streamRef.current = null;
    }
    setIsStreaming(false);
    setError("");
  }, []);

  // 测试拍照
  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        toast({
          title: "拍照成功",
          description: "图像已捕获",
        });
        
        onSuccess?.(imageData);
      }
    }
  }, [onSuccess, toast]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="w-5 h-5" />
          摄像头测试
        </CardTitle>
        <CardDescription>简化的摄像头功能测试</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 视频预览区域 */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          {!isStreaming ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p>点击下方按钮启动摄像头</p>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  直播中
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="space-y-2">
          {!isStreaming ? (
            <Button onClick={startCamera} className="w-full" size="lg">
              <Camera className="w-4 h-4 mr-2" />
              启动摄像头
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={capturePhoto} className="w-full">
                拍照测试
              </Button>
              <Button onClick={stopCamera} variant="outline" className="w-full">
                <CameraOff className="w-4 h-4 mr-2" />
                停止
              </Button>
            </div>
          )}
        </div>
        
        {/* 调试信息 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>状态: {isStreaming ? '摄像头已启动' : '摄像头未启动'}</p>
          <p>流对象: {streamRef.current ? '已获取' : '未获取'}</p>
          <p>视频元素: {videoRef.current ? '已创建' : '未创建'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 