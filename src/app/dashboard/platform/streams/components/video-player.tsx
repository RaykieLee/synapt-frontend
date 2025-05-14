'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';
import { StreamStatus } from '@/types/stream';
import { VideoPlayer as SharedVideoPlayer } from '@/components/video-player';

interface VideoPlayerProps {
  url: string;
  status: StreamStatus;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
}

export function VideoPlayer({ url, status, onStart, onStop, onRestart }: VideoPlayerProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 判断流媒体类型
  const getStreamType = (url: string): 'flv' | 'hls' | 'rtsp' | 'rtmp' | 'webrtc' | 'regular' => {
    const lowercasedUrl = url.toLowerCase();
    if (lowercasedUrl.includes('.flv')) return 'flv';
    if (lowercasedUrl.includes('.m3u8')) return 'hls';
    if (lowercasedUrl.startsWith('rtsp://')) return 'rtsp';
    if (lowercasedUrl.startsWith('rtmp://')) return 'rtmp';
    if (lowercasedUrl.includes('webrtc')) return 'webrtc';
    return 'regular';
  };
  
  // 处理播放错误
  const handleError = () => {
    console.error("视频流播放错误:", url);
    setError(true);
    setIsLoading(false);
  };
  
  // 处理视频加载完成
  const handleLoaded = () => {
    console.log("视频加载完成");
    setIsLoading(false);
    setError(false);
  };

  // 监听视频流状态变化
  useEffect(() => {
    if (status === StreamStatus.Online) {
      console.log("视频流状态: 在线");
      // 设置一个超时，如果5秒后仍然在加载中，手动调用handleLoaded
      const timer = setTimeout(() => {
        if (isLoading) {
          console.log("视频流加载超时，手动结束加载状态");
          handleLoaded();
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      console.log("视频流状态:", status);
      setIsLoading(true);
    }
  }, [status, isLoading]);

  // 控制器按钮，根据状态显示不同的控制按钮
  const PlayerControls = () => (
    <div className="absolute top-2 left-2 flex space-x-1 z-10">
      {status === StreamStatus.Offline && (
        <Button
          variant="secondary"
          size="icon"
          className="w-8 h-8 rounded-full bg-black/70 hover:bg-black/90"
          onClick={onStart}
          title="启动"
        >
          <Play className="h-4 w-4 text-white" />
        </Button>
      )}
      {status === StreamStatus.Online && (
        <Button
          variant="secondary"
          size="icon"
          className="w-8 h-8 rounded-full bg-black/70 hover:bg-black/90"
          onClick={onStop}
          title="停止"
        >
          <Pause className="h-4 w-4 text-white" />
        </Button>
      )}
      <Button
        variant="secondary"
        size="icon"
        className="w-8 h-8 rounded-full bg-black/70 hover:bg-black/90"
        onClick={onRestart}
        title="重启"
      >
        <RefreshCw className="h-4 w-4 text-white" />
      </Button>
    </div>
  );

  // 将URL转换为FLV URL，如果需要的话
  const getFlvUrl = (url: string) => {
    console.log('处理视频URL:', url);
    const streamType = getStreamType(url);
    console.log('流类型:', streamType);
    
    // 如果URL不是FLV格式，可能需要做必要的转换
    // 这里假设HLS URL的路径格式可以替换为FLV
    if (streamType === 'hls' && url.includes('.m3u8')) {
      return url.replace('.m3u8', '.flv');
    }
    console.log('最终URL:', url);
    return url;
  };

  return (
    <div className="aspect-video bg-black flex items-center justify-center relative">
      {status === StreamStatus.Online ? (
        <>
          <div className="w-full h-full">
            <SharedVideoPlayer
              url={getFlvUrl(url)}
              className="w-full h-full"
              onLoaded={handleLoaded}
              onError={handleError}
            />
          </div>
          
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto mb-2"></div>
                <p>加载中...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-white text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>视频流错误</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-white text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>
            {status === StreamStatus.Error 
              ? '视频流错误' 
              : status === StreamStatus.Offline 
                ? '视频流离线' 
                : '准备中...'}
          </p>
        </div>
      )}
      
      <PlayerControls />
    </div>
  );
} 