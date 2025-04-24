'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

export function VideoPlayer({ url, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const flvPlayerRef = useRef<any>(null);
  const [flvjs, setFlvjs] = useState<any>(null);

  useEffect(() => {
    // 动态导入 flv.js
    import('flv.js').then((module) => {
      setFlvjs(module.default);
    });
  }, []);

  useEffect(() => {
    if (!flvjs || !videoRef.current) return;

    if (flvjs.isSupported()) {
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: url,
        isLive: true,
      });

      flvPlayer.attachMediaElement(videoRef.current);
      flvPlayer.load();
      flvPlayer.play();

      flvPlayerRef.current = flvPlayer;

      return () => {
        flvPlayer.destroy();
      };
    }
  }, [url, flvjs]);

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