'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertCircle, Activity } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function VideoPlayer({
  videoUrl,
  title = '演示视频',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = true,
  className = '',
  style = { minHeight: '400px' }
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string>('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => {
        setVideoLoaded(true);
        setVideoError('');
      };

      const handleCanPlay = () => {
        setVideoLoaded(true);
        setVideoError('');
      };

      const handleLoadStart = () => {
        setVideoLoaded(false);
        setVideoError('');
      };

      const handleError = (e: Event) => {
        const target = e.target as HTMLVideoElement;
        let errorMessage = '视频加载失败';
        
        if (target.error) {
          switch (target.error.code) {
            case target.error.MEDIA_ERR_ABORTED:
              errorMessage = '视频加载被中止';
              break;
            case target.error.MEDIA_ERR_NETWORK:
              errorMessage = '网络错误，无法加载视频';
              break;
            case target.error.MEDIA_ERR_DECODE:
              errorMessage = '视频解码错误';
              break;
            case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = '不支持的视频格式或视频源不可用';
              break;
            default:
              errorMessage = '未知错误';
          }
        }
        
        setVideoError(errorMessage);
        setVideoLoaded(false);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('error', handleError);

      if (video.readyState >= 3) {
        setVideoLoaded(true);
      }

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('error', handleError);
      };
    }
  }, [videoUrl]);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`} style={style}>
      {videoError ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-lg font-semibold mb-2">视频加载失败</p>
          <p className="text-sm text-gray-400 text-center px-4">{videoError}</p>
          <p className="text-xs text-gray-500 mt-4 text-center px-4">
            请确保视频服务器正在运行：{videoUrl}
          </p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            className="w-full h-full object-cover"
            poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMTExODI3Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNDAiIGZpbGw9IiM2MzY2ZjEiLz4KPHN2ZyB4PSIzODAiIHk9IjIwNSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHA+PHBhdGggZD0ibTcgNCA5IDUuNS05IDUuNXoiLz48L3A+Cjwvc3ZnPgo8L3N2Zz4="
          >
            <source src={videoUrl} type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
          
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
            {title}
          </div>
          <div className="absolute top-4 right-4 bg-green-600/80 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {videoLoaded ? '演示视频' : '加载中...'}
          </div>
          
          {!videoLoaded && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                <p className="text-sm">正在加载视频...</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 