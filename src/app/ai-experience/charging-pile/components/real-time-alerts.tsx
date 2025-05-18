'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { alertLogAPI } from "@/api/alert";
import { AlertLog } from "@/types/alert";
import { BaseResponse } from "@/types/base";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import Image from "next/image";

const CONFIG_CODE = "CHARGING_PILE_CODE";
const REFRESH_INTERVAL = 10000; // 10秒刷新一次

export function RealTimeAlerts() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['alerts', 'realtime', CONFIG_CODE],
    queryFn: () => alertLogAPI.getRealtimeAlerts(CONFIG_CODE),
    refetchInterval: REFRESH_INTERVAL
  });
  
  // 从响应中提取真正的告警数据数组
  const alerts: AlertLog[] = data || [];
  
  const getAlertLevelColor = (level: string) => {
    switch(level) {
      case 'emergency': return 'destructive';
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'notice': 
      case 'info':
      default: return 'secondary';
    }
  };
  
  const getAlertLevelLabel = (level: string) => {
    switch(level) {
      case 'emergency': return '紧急';
      case 'critical': return '严重';
      case 'warning': return '警告';
      case 'notice': 
      case 'info':
      default: return '提示';
    }
  };
  
  const formatAlertTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
    } catch (e) {
      return timeStr;
    }
  };
  
  return (
    <Card className="h-full p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-bold">实时告警</h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center flex-grow">
          <p>加载中...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center flex-grow">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
          <p>获取告警失败</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col justify-center items-center flex-grow">
          <p className="text-muted-foreground">暂无告警</p>
        </div>
      ) : (
        <ScrollArea className="flex-grow overflow-hidden">
          <div className="space-y-3 pb-2">
            {[...alerts].reverse().map((alert: AlertLog) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onImageClick={(url) => setSelectedImage(url)} 
              />
            ))}
          </div>
        </ScrollArea>
      )}
      
      {/* 图片预览对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <span className="hidden">打开图片</span>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>告警图片</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedImage && (
              <Image 
                src={`/api/v1/system/file/public/preview?path=${encodeURIComponent(selectedImage)}`}
                alt="告警图片"
                className="max-h-[80vh] object-contain"
                width={800}
                height={600}
              />
            )}
          </div>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">关闭</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// 单个告警卡片组件
function AlertCard({ 
  alert, 
  onImageClick 
}: { 
  alert: AlertLog; 
  onImageClick: (url: string) => void;
}) {
  // 判断是否有图片
  const hasImage = !!alert.image_url;
  
  const getAlertLevelColor = (level: string) => {
    switch(level) {
      case 'emergency': return 'destructive';
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'notice': 
      case 'info':
      default: return 'secondary';
    }
  };
  
  const getAlertLevelLabel = (level: string) => {
    switch(level) {
      case 'emergency': return '紧急';
      case 'critical': return '严重';
      case 'warning': return '警告';
      case 'notice': 
      case 'info':
      default: return '提示';
    }
  };
  
  const formatAlertTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
    } catch (e) {
      return timeStr;
    }
  };
  
  // 显示缩略图或图片占位符
  const renderThumbnail = () => {
    if (!hasImage) return null;
    
    // 使用Dialog包装缩略图，点击时可以查看大图
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative w-16 h-16 overflow-hidden rounded cursor-pointer flex-shrink-0" onClick={() => onImageClick(alert.image_url!)}>
            <Image 
              src={`/api/v1/system/file/public/preview?path=${encodeURIComponent(alert.image_url!)}`}
              alt={alert.title}
              className="object-cover"
              fill
              sizes="64px"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{alert.title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Image 
              src={`/api/v1/system/file/public/preview?path=${encodeURIComponent(alert.image_url!)}`}
              alt={alert.title}
              className="max-h-[80vh] object-contain"
              width={800}
              height={600}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {hasImage && renderThumbnail()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={getAlertLevelColor(alert.level)}>
              {getAlertLevelLabel(alert.level)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatAlertTime(alert.create_time || '')}
            </span>
          </div>
          <p className="text-sm font-medium mb-1 truncate">{alert.title}</p>
          {alert.content && (
            <p className="text-xs text-muted-foreground line-clamp-2">{alert.content}</p>
          )}
          {alert.device_name && (
            <p className="text-xs text-muted-foreground mt-1 truncate">设备: {alert.device_name}</p>
          )}
        </div>
      </div>
    </Card>
  );
} 