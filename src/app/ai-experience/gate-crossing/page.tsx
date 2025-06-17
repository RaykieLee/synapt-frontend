'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Eye, Shield, Activity, Play, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GateCrossingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string>('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoHost = process.env.NEXT_PUBLIC_VIDEO_HOST || '127.0.0.1';
  const videoPort = process.env.NEXT_PUBLIC_VIDEO_PORT || '8080';
  const videoUrl = `http://${videoHost}:${videoPort}/record/%E9%97%B8%E6%9C%BA.mp4`;
  // const videoUrl = `http://${videoHost}:${videoPort}/record/%E6%9C%BA%E6%88%BF%E6%9F%9C%E9%97%A8%E7%8A%B6%E6%80%81%E8%AF%86%E5%88%AB%E5%B1%95%E7%A4%BA.mp4`;

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

      // 添加多个事件监听器来更准确地判断加载状态
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('error', handleError);

      // 检查视频是否已经加载完成
      if (video.readyState >= 3) { // HAVE_FUTURE_DATA 或更高
        setVideoLoaded(true);
      }

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <div className="container mx-auto py-4 px-4">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold">非法跨越道闸识别</h1>
          <Badge variant="secondary" className="ml-2">AI算法</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          基于计算机视觉和人体姿态估计的智能道闸安全监控系统
        </p>
      </motion.div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* 左侧：视频播放区域 - 占据更大空间 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                <Eye className="h-5 w-5" />
                实时监控演示
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <div className="relative bg-black rounded-lg overflow-hidden flex-1" style={{ minHeight: '300px' }}>
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
                      controls
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                      poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMTExODI3Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNDAiIGZpbGw9IiM2MzY2ZjEiLz4KPHN2ZyB4PSIzODAiIHk9IjIwNSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHA+PHBhdGggZD0ibTcgNCA5IDUuNS05IDUuNXoiLz48L3A+Cjwvc3ZnPgo8L3N2Zz4="
                    >
                      <source src={videoUrl} type="video/mp4" />
                      <source src={videoUrl} type="video/avi" />
                      <source src={videoUrl} type="video/webm" />
                      您的浏览器不支持视频播放。
                    </video>
                    
                    {/* 视频覆盖层信息 */}
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                      道闸监控点 #001
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
              
              {/* 视频说明 - 移到底部 */}
              <div className="mt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">视频说明</h4>
                  <p className="text-sm text-muted-foreground">
                    算法识别行为正常的人体用<span className="text-green-600 font-medium">绿框</span>标记，
                    当算法识别到某个人体尝试非法通过道闸时，用<span className="text-red-600 font-medium">红框</span>进行标记，
                    并保存实时抓拍画面显示到右下角的告警信息。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 右侧：场景介绍 - 占据较小空间 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-1 space-y-6"
        >
          {/* 算法介绍 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                算法介绍
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">
                非法通过道闸识别算法，主要基于计算机视觉和图像处理技术，尤其是人体姿态估计算法，
                用于监测和分析人体运动状态，从而判断人员通过道闸时是否发生非法通过行为，
                非法通过行为主要包括<span className="font-semibold text-red-600">跨越、下钻、跳跃</span>等动作。
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="text-red-600 font-semibold">跨越</div>
                  <div className="text-xs text-muted-foreground mt-1">翻越道闸</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div className="text-orange-600 font-semibold">下钻</div>
                  <div className="text-xs text-muted-foreground mt-1">钻过道闸</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                  <div className="text-yellow-600 font-semibold">跳跃</div>
                  <div className="text-xs text-muted-foreground mt-1">跳过道闸</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 算法流程 */}
          <Card>
            <CardHeader>
              <CardTitle>算法流程</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">人体检测与关键点提取</div>
                    <div className="text-muted-foreground">人体姿态估计算法提取图像中所有人体的矩形框和关键点</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">区域判断</div>
                    <div className="text-muted-foreground">判断人体矩形框底部中点是否在预设的道闸多边形区域内</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">姿态分析</div>
                    <div className="text-muted-foreground">计算人体腿部和腰部关键点的角度</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">行为识别与告警</div>
                    <div className="text-muted-foreground">结合道闸高度线、人体矩形框、关键点角度判断非法行为并发出告警</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 功能特点 */}
          <Card>
            <CardHeader>
              <CardTitle>功能特点</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">实时监控和告警</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">多种非法行为识别</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm">抓拍画面保存</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-sm">统计分析功能</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 点击告警信息可以查看具体图像。在告警管理页面可以按时间段对非法闯入行为进行统计。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 