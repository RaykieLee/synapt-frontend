'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Eye, Shield, Activity, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PowerLineDamagePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string>('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoUrl = "http://127.0.0.1:8080/record/%E8%BE%93%E7%94%B5%E7%BA%BF%E8%B7%AF%E5%A4%96%E5%8A%9B%E7%A0%B4%E5%9D%8F%E8%AF%86%E5%88%AB.mp4";

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
          <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold">输电线路外力破坏识别</h1>
          <Badge variant="secondary" className="ml-2">AI算法</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          基于目标检测和图像处理技术的智能输电线路安全监控系统
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
                      输电线路监控点 #001
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
                    视频文件由图片序列合并而成，前一张图为原始图像，后一张图为识别结果图。
                    算法检测到外力破坏威胁时，会在识别结果图上绘制<span className="text-red-600 font-medium">红色矩形框</span>
                    并标注<span className="text-blue-600 font-medium">中文类别标签</span>，实现对输电线路安全威胁的实时监控。
                  </p>
                </div>
              </div>

              {/* 技术优势 - 从右侧移动到左侧 */}
              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      技术优势
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                        <div className="text-sm">
                          <div className="font-medium">高精度识别</div>
                          <div className="text-muted-foreground text-xs">基于深度学习的目标检测算法，识别准确率高</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></div>
                        <div className="text-sm">
                          <div className="font-medium">实时处理</div>
                          <div className="text-muted-foreground text-xs">优化的算法架构，支持实时视频流处理</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></div>
                        <div className="text-sm">
                          <div className="font-medium">环境适应性强</div>
                          <div className="text-muted-foreground text-xs">适应各种天气和光照条件下的监控需求</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2"></div>
                        <div className="text-sm">
                          <div className="font-medium">可扩展性</div>
                          <div className="text-muted-foreground text-xs">支持多路视频同时监控，易于系统扩展</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                输电线路外力破坏识别算法主要基于<span className="font-semibold text-blue-600">目标检测</span>和
                <span className="font-semibold text-green-600">图像处理技术</span>，
                能够识别出输电线路上可能存在的各种外力破坏情况，包括但不限于施工机械、
                违章建筑、植被侵入等威胁因素。
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="text-red-600 font-semibold text-sm">施工威胁</div>
                  <div className="text-xs text-muted-foreground mt-1">挖掘机、吊车等</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div className="text-orange-600 font-semibold text-sm">违章建筑</div>
                  <div className="text-xs text-muted-foreground mt-1">违规搭建物</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="text-green-600 font-semibold text-sm">植被侵入</div>
                  <div className="text-xs text-muted-foreground mt-1">树木生长威胁</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <div className="text-purple-600 font-semibold text-sm">异物悬挂</div>
                  <div className="text-xs text-muted-foreground mt-1">风筝、塑料袋等</div>
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
                    <div className="font-medium">图像预处理</div>
                    <div className="text-muted-foreground">对输入图像进行降噪、增强等预处理操作</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">目标检测</div>
                    <div className="text-muted-foreground">使用深度学习模型检测图像中的潜在威胁目标</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">特征分析</div>
                    <div className="text-muted-foreground">分析检测目标的形状、大小、位置等特征</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">威胁评估与告警</div>
                    <div className="text-muted-foreground">评估威胁等级并生成相应的告警信息</div>
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
                  <span className="text-sm">24小时实时监控</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">多类型威胁识别</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm">智能告警推送</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-sm">历史数据分析</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 系统能够自动识别输电线路周围的各种威胁因素，及时发出告警，有效预防外力破坏事故的发生。
                </p>
              </div>
            </CardContent>
          </Card>


        </motion.div>
      </div>
    </div>
  );
} 