'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Activity, AlertCircle, Settings, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CabinetDoorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string>('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoHost = process.env.NEXT_PUBLIC_VIDEO_HOST || '127.0.0.1';
  const videoPort = process.env.NEXT_PUBLIC_VIDEO_PORT || '8080';
  const videoUrl = `http://${videoHost}:${videoPort}/record/%E6%9C%BA%E6%88%BF%E6%9F%9C%E9%97%A8%E7%8A%B6%E6%80%81%E8%AF%86%E5%88%AB%E5%B1%95%E7%A4%BA.mp4`;

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
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold">柜门状态识别</h1>
          <Badge variant="secondary" className="ml-2">AI算法</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          基于计算机视觉的智能柜门状态监控与任务管理系统
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
                      机房监控点 #001
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
                    算法识别柜门状态，与设置的任务单比较，查看是否有柜门在任务单之外的时间段被打开。
                    有异常时在图片左上角显示<span className="text-red-600 font-medium">红色告警文字</span>，
                    正常时显示<span className="text-green-600 font-medium">"正常"</span>状态。
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
                柜门状态识别算法，通过计算机视觉技术实时监控柜门开关状态，
                结合预设的任务单进行智能比对，自动识别异常开门行为并及时告警，
                确保机房设备安全管理。
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="text-green-600 font-semibold">正常状态</div>
                  <div className="text-xs text-muted-foreground mt-1">按任务单开门</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="text-red-600 font-semibold">异常告警</div>
                  <div className="text-xs text-muted-foreground mt-1">违规开门</div>
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
                    <div className="font-medium">摄像头配置</div>
                    <div className="text-muted-foreground">设置该摄像头下柜门序号1到4，建立监控区域</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">任务单设置</div>
                    <div className="text-muted-foreground">为柜门设置任务单，包括柜门序号、开始时间、结束时间</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">状态识别</div>
                    <div className="text-muted-foreground">实时识别柜门开关状态，监控柜门动作</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">智能比对告警</div>
                    <div className="text-muted-foreground">与任务单比较，检测异常开门行为并发出告警</div>
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
                  <span className="text-sm">实时状态监控</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">任务单管理</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm">智能告警系统</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-sm">多柜门支持</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 系统支持多个柜门同时监控，可灵活配置任务单时间段，确保机房设备安全管理的智能化和自动化。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 