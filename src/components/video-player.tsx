'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  className?: string;
  onLoaded?: () => void;
  onError?: () => void;
}

export function VideoPlayer({ url, className, onLoaded, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const flvPlayerRef = useRef<any>(null);
  const [flvjs, setFlvjs] = useState<any>(null);

  useEffect(() => {
    // 动态导入 flv.js
    import('flv.js').then((module) => {
      setFlvjs(module.default);
    }).catch(err => {
      console.error('加载flv.js库失败:', err);
      onError?.();
    });
  }, [onError]);

  useEffect(() => {
    if (!flvjs || !videoRef.current) return;

    if (flvjs.isSupported()) {
      console.log('创建FLV播放器:', url);
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: url,
        isLive: true,
      });

      flvPlayer.attachMediaElement(videoRef.current);
      
      // 添加事件监听
      flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
        console.log('FLV视频加载完成');
        onLoaded?.();
      });
      
      flvPlayer.on(flvjs.Events.ERROR, (err: any) => {
        console.error('FLV播放器错误:', err);
        onError?.();
      });

      flvPlayer.load();
      flvPlayer.play();

      flvPlayerRef.current = flvPlayer;

      return () => {
        flvPlayer.destroy();
      };
    } else {
      console.warn('当前浏览器不支持FLV.js');
      onError?.();
    }
  }, [url, flvjs, onLoaded, onError]);

  // 监听视频元素事件
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleCanPlay = () => {
      console.log('视频可以播放');
      onLoaded?.();
    };

    const handleError = (e: Event) => {
      console.error('视频元素错误:', e);
      onError?.();
    };

    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);
    
    // 添加数据加载事件 
    videoElement.addEventListener('loadeddata', () => {
      console.log('视频数据已加载');
      onLoaded?.();
    });

    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadeddata', () => {
        onLoaded?.();
      });
    };
  }, [onLoaded, onError]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className={className}
        controls={false}
        autoPlay
        muted
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
} 