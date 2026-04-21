"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, User, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FaceRecognitionProps {
  onSuccess?: (faceData: string) => void;
  onError?: (error: string) => void;
  title?: string;
  description?: string;
  className?: string;
}

export default function FaceRecognition({
  onSuccess,
  onError,
  title = "人脸识别验证",
  description = "请将您的脸部对准摄像头进行识别",
  className = ""
}: FaceRecognitionProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognitionStatus, setRecognitionStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  // 启动摄像头
  const startCamera = useCallback(async () => {
    try {
      console.log('正在启动摄像头...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('摄像头权限获取成功，视频流:', stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 等待视频加载完成
        const handleLoadedMetadata = () => {
          console.log('视频元数据加载完成');
          setIsStreaming(true);
          videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
        
        const handleCanPlay = () => {
          console.log('视频可以播放');
          setIsStreaming(true);
          videoRef.current?.removeEventListener('canplay', handleCanPlay);
        };
        
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoRef.current.addEventListener('canplay', handleCanPlay);
        
        try {
          await videoRef.current.play();
          console.log('视频开始播放');
        } catch (playError) {
          console.error('视频播放失败:', playError);
        }
        
        // 备用：延迟设置状态
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            console.log('备用方式设置视频状态');
            setIsStreaming(true);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('启动摄像头失败:', error);
      const errorMessage = error instanceof Error ? error.message : '启动摄像头失败';
      onError?.(errorMessage);
      toast({
        title: "摄像头启动失败",
        description: "请检查摄像头权限设置",
        variant: "destructive",
      });
    }
  }, [onError, toast]);

  // 停止摄像头
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCapturedImage(null);
    setRecognitionStatus('idle');
  }, []);

  // 执行人脸识别处理
  const simulateFaceRecognition = useCallback(async (imageData: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟人脸检测和特征提取过程
        const success = Math.random() > 0.25; // 75%成功率用于演示

        if (success) {
          setRecognitionStatus('success');
          onSuccess?.(imageData);
          toast({
            title: "识别成功",
            description: "人脸验证通过，正在登录...",
          });
          resolve();
        } else {
          setRecognitionStatus('failed');
          reject(new Error('未能识别出有效的人脸特征，请调整位置后重试'));
        }
      }, 1500); // 模拟1.5秒识别时间
    });
  }, [onSuccess, toast]);

  // 拍照并识别
  const captureAndRecognize = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('无法获取canvas上下文');

      // 设置canvas尺寸
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 绘制当前视频帧到canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 获取图像数据
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);

      // 模拟人脸识别处理
      await simulateFaceRecognition(imageData);

    } catch (error) {
      console.error('人脸识别失败:', error);
      const errorMessage = error instanceof Error ? error.message : '人脸识别处理失败';
      setRecognitionStatus('failed');
      onError?.(errorMessage);
      toast({
        title: "识别失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onError, toast, simulateFaceRecognition]);



  // 重新尝试识别
  const retryRecognition = useCallback(() => {
    setCapturedImage(null);
    setRecognitionStatus('idle');
  }, []);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 视频预览区域 */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {!isStreaming && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p>点击下方按钮启动摄像头</p>
              </div>
            </div>
          )}
          
          {isStreaming && !capturedImage && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
                style={{ transform: 'scaleX(-1)' }} // 镜像显示，更符合用户习惯
              />
              <div className="absolute inset-0 border-2 border-dashed border-blue-400 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-blue-500 rounded-lg"></div>
              </div>
              {/* 添加状态指示器 */}
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  摄像头已启动
                </div>
              </div>
            </>
          )}
          
          {capturedImage && (
            <div className="relative w-full h-full">
              <Image
                src={capturedImage}
                alt="拍摄的照片"
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
              <div className="absolute top-2 right-2">
                {recognitionStatus === 'success' && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    识别成功
                  </Badge>
                )}
                {recognitionStatus === 'failed' && (
                  <Badge variant="destructive">
                    <XCircle className="w-4 h-4 mr-1" />
                    识别失败
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* 控制按钮 */}
        <div className="space-y-2">
          {!isStreaming && !capturedImage && (
            <Button onClick={startCamera} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              启动摄像头
            </Button>
          )}
          
          {isStreaming && !capturedImage && (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={captureAndRecognize} 
                disabled={isProcessing}
                className="col-span-1"
              >
                {isProcessing ? "识别中..." : "开始识别"}
              </Button>
              <Button onClick={stopCamera} variant="outline" className="col-span-1">
                <CameraOff className="w-4 h-4 mr-2" />
                关闭摄像头
              </Button>
            </div>
          )}
          
          {capturedImage && recognitionStatus === 'failed' && (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={retryRecognition} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                重新拍摄
              </Button>
              <Button onClick={stopCamera} variant="outline">
                <CameraOff className="w-4 h-4 mr-2" />
                关闭摄像头
              </Button>
            </div>
          )}
          
          {capturedImage && recognitionStatus === 'success' && (
            <Button onClick={stopCamera} className="w-full">
              完成验证
            </Button>
          )}
        </div>
        
        {isProcessing && (
          <div className="text-center text-sm text-gray-500">
            正在进行人脸识别，请保持静止...
          </div>
        )}
      </CardContent>
    </Card>
  );
} 