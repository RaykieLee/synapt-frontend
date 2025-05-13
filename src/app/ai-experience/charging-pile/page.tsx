'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AlertCircle, Camera } from "lucide-react";
import { useState } from "react";
import { VideoPlayer } from "@/components/video-player";

// 视频流配置
const STREAM_URL = "http://172.16.100.177:8085/live/cctv5.flv";
const STREAM_URL2 = "http://172.16.100.177:8085/live/cctv4.flv";

// 模拟数据
const mockData = {
  stats: {
    totalInspections: 1234,
    abnormalDetections: 56,
    todayInspections: 123,
    efficiency: 98.5
  },
  chartData: [
    { time: '00:00', value: 30 },
    { time: '04:00', value: 25 },
    { time: '08:00', value: 45 },
    { time: '12:00', value: 55 },
    { time: '16:00', value: 40 },
    { time: '20:00', value: 35 },
  ],
  alerts: [
    { id: 1, type: '异常', location: '检测到未授权人员进入禁区', time: '10:25:33', status: '未处理' },
    { id: 2, type: '故障', location: '检测到吸烟行为', time: '10:20:15', status: '已处理' },
    { id: 3, type: '异常', location: '检测到火灾', time: '10:15:42', status: '处理中' },
    { id: 4, type: '异常', location: '检测到烟雾', time: '10:15:42', status: '处理中' },
    { id: 5, type: '异常', location: '检测到人员跌倒', time: '10:15:42', status: '处理中' },

    // ... 更多告警数据
  ]
};

export default function ChargingPileDetectionPage() {
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="grid grid-cols-4 gap-4 h-full">
        {/* 左侧区域：摄像头和统计面板 */}
        <div className="col-span-3 grid grid-rows-5 gap-4 h-full">
          {/* 摄像头区域 - 现在占据3/5的高度 */}
          <div className="row-span-2 grid grid-cols-2 gap-4">
            {/* 摄像头 1 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  摄像头 1
                </Badge>
              </div>
              <div className="w-full h-full bg-gray-800">
                <VideoPlayer url={STREAM_URL} />
              </div>
            </Card>
            
            {/* 摄像头 2 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  摄像头 2
                </Badge>
              </div>
              <div className="w-full h-full bg-gray-800">
                <VideoPlayer url={STREAM_URL2} />
              </div>
            </Card>
          </div>

          {/* 统计面板区域 - 现在占据2/5的高度 */}
          <div className="row-span-2">
            <Card className="h-full p-6">
              <h2 className="text-2xl font-bold mb-4">检测统计</h2>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <StatCard 
                  title="总检测次数" 
                  value={mockData.stats.totalInspections.toString()}
                />
                <StatCard 
                  title="异常检出数" 
                  value={mockData.stats.abnormalDetections.toString()} 
                  type="warning"
                />
                <StatCard 
                  title="今日检测" 
                  value={mockData.stats.todayInspections.toString()}
                />
                <StatCard 
                  title="检测效率" 
                  value={`${mockData.stats.efficiency}%`}
                  type="success"
                />
              </div>
              <div className="h-[calc(100%-140px)]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* 右侧告警列表 */}
        <div className="col-span-1 h-full">
          <Card className="h-full p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold">实时告警</h2>
            </div>
            <ScrollArea className="h-[calc(80%-40px)]">
              <div className="space-y-2">
                {mockData.alerts.map((alert) => (
                  <Card key={alert.id} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={
                          alert.type === '异常' ? 'destructive' : 'secondary'
                        }
                      >
                        {alert.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.location}</p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge 
                        variant={
                          alert.status === '未处理' 
                            ? 'destructive' 
                            : alert.status === '处理中' 
                              ? 'default' 
                              : 'secondary'
                        }
                      >
                        {alert.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({ 
  title, 
  value, 
  type = 'default' 
}: { 
  title: string; 
  value: string; 
  type?: 'default' | 'warning' | 'success' 
}) {
  return (
    <Card className="p-4">
      <h3 className="text-sm text-muted-foreground mb-2">{title}</h3>
      <p className={`text-2xl font-bold ${
        type === 'warning' 
          ? 'text-yellow-500' 
          : type === 'success' 
            ? 'text-green-500' 
            : ''
      }`}>
        {value}
      </p>
    </Card>
  );
} 