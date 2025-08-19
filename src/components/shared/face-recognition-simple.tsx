"use client";

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface FaceRecognitionSimpleHandle {
  /** 手动截取当前帧 (返回 base64 或 null 若未就绪) */
  capture: () => string | null;
}

interface FaceRecognitionSimpleProps {
  onSuccess?: (faceData: string) => void; // 自动/手动截取成功回调
  onError?: (error: string) => void;
  /** 是否在视频可播放时立即截取一次 (默认 true) */
  autoCapture?: boolean;
}

const FaceRecognitionSimple = forwardRef<FaceRecognitionSimpleHandle, FaceRecognitionSimpleProps>(
  ({ onSuccess, onError, autoCapture = true }, ref) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoCapturedRef = useRef(false); // 仅限制自动截取; 手动可多次
  const [hasError, setHasError] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("浏览器不支持摄像头");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "启动摄像头失败";
      setHasError(true);
      onError?.(msg);
      toast({ title: "摄像头错误", description: msg, variant: "destructive" });
    }
  }, [onError, toast]);

  const doCapture = useCallback((markAuto = false): string | null => {
    if (!videoRef.current) return null;
    const v = videoRef.current;
    if (!v.videoWidth) return null; // metadata not ready
    if (markAuto && autoCapturedRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.85);
    if (markAuto) autoCapturedRef.current = true;
    onSuccess?.(data);
    return data;
  }, [onSuccess]);

  // 提供给父组件的手动截取方法
  useImperativeHandle(ref, () => ({
    capture: () => doCapture(false),
  }), [doCapture]);

  // 启动摄像头
  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startCamera]);

  // 当视频可以播放时自动截取（可关闭）
  const handleCanPlay = () => {
    if (autoCapture) doCapture(true);
  };

  return (
    <div className="relative w-full max-w-xs mx-auto aspect-square rounded-full overflow-hidden bg-black ring-2 ring-black/20 animate-fade-in">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
        onCanPlay={handleCanPlay}
      />
      {!hasError && <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-red-400 bg-red-950/40 rounded-full">
          摄像头不可用
        </div>
      )}
    </div>
  );
});

FaceRecognitionSimple.displayName = "FaceRecognitionSimple";

export default FaceRecognitionSimple;