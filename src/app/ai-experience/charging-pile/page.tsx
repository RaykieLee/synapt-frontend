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
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AlertCircle, Battery, Calendar, Camera, ChevronUp, Clock, Database, Zap } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { VideoPlayer } from "@/components/video-player";
import { useQuery } from "@tanstack/react-query";
import { 
  ChargingPileChartData, 
  DeviceStats, 
  getChargingPileHistory, 
  getChargingPileStats 
} from "@/api/ai-experience";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 视频流配置
const videoHost = process.env.NEXT_PUBLIC_VIDEO_HOST || '172.16.100.177';
const videoPort = process.env.NEXT_PUBLIC_VIDEO_PORT || '8085';
const localVideoHost = process.env.NEXT_PUBLIC_LOCAL_VIDEO_HOST || 'localhost';
const localVideoPort = process.env.NEXT_PUBLIC_LOCAL_VIDEO_PORT || '8080';

const STREAM_URL = `http://${videoHost}:${videoPort}/live/cctv5.flv`;
// const STREAM_URL2 = `http://${videoHost}:${videoPort}/live/cctv4.flv`;
const STREAM_URL2 = `http://${localVideoHost}:${localVideoPort}/live/stream1.live.flv`;
// http://${localVideoHost}:${localVideoPort}/live/stream1.live.flv
// rtmp://${localVideoHost}:1935/live/stream1
// 告警级别颜色
const LEVEL_COLORS = {
  info: "#3b82f6",    // 蓝色
  notice: "#3b82f6",  // 蓝色
  warning: "#f59e0b", // 黄色
  error: "#ef4444",   // 红色
  critical: "#dc2626", // 深红色
  emergency: "#dc2626" // 深红色
};

// 告警级别文本
const LEVEL_TEXT = {
  info: "提示",
  notice: "提示",
  warning: "警告",
  error: "错误",
  critical: "严重",
  emergency: "紧急"
};

// 图表颜色
const CHART_COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", 
  "#00c49f", "#ffbb28", "#ff8042", "#a4de6c"
];

export default function ChargingPileDetectionPage() {
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [chartData, setChartData] = useState<ChargingPileChartData[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("all");

  // 获取统计数据
  const { data: monitorData, isLoading: statsLoading } = useQuery({
    queryKey: ['charging-pile', 'stats'],
    queryFn: getChargingPileStats,
    staleTime: 5 * 60 * 1000 // 5分钟后过期
  });

  // 获取图表数据
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['charging-pile', 'history', timeRange, selectedDevice],
    queryFn: () => getChargingPileHistory(
      timeRange, 
      selectedDevice === 'all' ? undefined : selectedDevice
    ),
    staleTime: 5 * 60 * 1000 // 5分钟后过期
  });

  // 当数据加载完成或时间范围变化时更新图表数据
  useEffect(() => {
    if (historyData) {
      setChartData(historyData);
    }
  }, [historyData, timeRange]);

  // 转换告警级别数据为饼图格式
  const levelPieData = useMemo(() => {
    if (!monitorData || !monitorData.stats.by_level) return [];
    
    return Object.entries(monitorData.stats.by_level).map(([level, count]) => ({
      name: LEVEL_TEXT[level as keyof typeof LEVEL_TEXT] || level,
      value: count,
      level
    }));
  }, [monitorData]);

  // 设备下拉选项
  const deviceOptions = useMemo(() => {
    if (!monitorData || !monitorData.stats.by_device) return [];
    return monitorData.stats.by_device;
  }, [monitorData]);

  return (
    <div className="container mx-auto p-4 h-full">
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-120px)]">
        {/* 左侧区域：摄像头和统计面板 */}
        <div className="col-span-3 grid grid-rows-[minmax(200px,_2fr)_minmax(320px,_3fr)] gap-4 h-full">
          {/* 摄像头区域 - 约占2/5的高度，但最小高度为200px */}
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* 摄像头 1 */}
            <Card className="relative overflow-hidden h-full">
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
            <Card className="relative overflow-hidden h-full">
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

          {/* 统计面板区域 - 约占3/5的高度，但最小高度为320px */}
          <div className="h-full">
            <Card className="h-full overflow-hidden">
              <div className="p-6 pb-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Battery className="w-5 h-5 text-primary mr-2" />
                    <h2 className="text-2xl font-bold">充电桩监控统计</h2>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* 设备选择器 */}
                    <Select
                      value={selectedDevice}
                      onValueChange={(value: string) => setSelectedDevice(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="全部设备" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部设备</SelectItem>
                        {deviceOptions.map((device) => (
                          <SelectItem key={device.name} value={device.name}>
                            {device.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* 时间范围选择器 */}
                    <Tabs 
                      defaultValue="day" 
                      value={timeRange} 
                      onValueChange={(v: string) => setTimeRange(v as 'day' | 'week' | 'month')}
                      className="h-9"
                    >
                      <TabsList>
                        <TabsTrigger value="day" className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          今日
                        </TabsTrigger>
                        <TabsTrigger value="week" className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          本周
                        </TabsTrigger>
                        <TabsTrigger value="month" className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          本月
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                
                {/* 统计卡片 */}
                <div className="grid grid-cols-3 gap-3 mb-4 h-[176px]">
                  <StatCard 
                    title="异常告警" 
                    value={statsLoading || !monitorData ? '0' : monitorData.stats.abnormal_alerts.toString()} 
                    type="warning"
                    icon={<AlertCircle className="w-5 h-5 text-yellow-500" />}
                    loading={statsLoading}
                    className="h-full"
                  />
                  <StatCard 
                    title="今日告警" 
                    value={statsLoading || !monitorData ? '0' : monitorData.stats.today_alerts.toString()}
                    icon={<Clock className="w-5 h-5 text-indigo-500" />}
                    loading={statsLoading}
                    className="h-full"
                  />
                  
                  {/* 告警级别占比图表 */}
                  <Card className="p-4 relative h-full flex flex-col">
                    <h3 className="text-sm text-muted-foreground mb-3">告警级别分布</h3>
                      {statsLoading || !levelPieData.length ? (
                      <div className="flex-1 flex items-center justify-center">
                        <Skeleton className="h-[80%] w-[90%]" />
                      </div>
                      ) : (
                      <div className="flex-1 flex items-center">
                        <div className="flex w-full h-[90%] gap-2">
                          {/* 饼图部分 */}
                          <div className="w-[80px] h-[80px] flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={levelPieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                                  outerRadius={32}
                                  innerRadius={10}
                                  paddingAngle={3}
                                  stroke="#fff"
                                  strokeWidth={1}
                            >
                              {levelPieData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={LEVEL_COLORS[entry.level as keyof typeof LEVEL_COLORS] || CHART_COLORS[index % CHART_COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                                  formatter={(value: number, name: string) => [`${value}条`, name]}
                              contentStyle={{ 
                                backgroundColor: 'rgba(23, 23, 23, 0.8)',
                                border: 'none',
                                borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '4px 8px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                          </div>
                          
                          {/* 自定义图例 */}
                          <div className="flex flex-col justify-center gap-1 text-[10px] sm:text-xs flex-1 max-w-[calc(100%-90px)]">
                            {levelPieData.map((entry, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: LEVEL_COLORS[entry.level as keyof typeof LEVEL_COLORS] || CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="truncate text-muted-foreground">{entry.name}</span>
                                <span className="ml-auto font-medium text-right whitespace-nowrap">{entry.value}条</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
              
              <Separator />
              
              <div className="p-6 pt-4 grid grid-cols-2 gap-4">
                {/* 左侧：趋势图 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {timeRange === 'day' ? '今日告警趋势' : 
                      timeRange === 'week' ? '本周告警趋势' : '本月告警趋势'}
                      {selectedDevice !== 'all' ? ` - ${selectedDevice}` : ''}
                    </h3>
                  </div>
                  <div className="h-32">
                    {historyLoading || chartData.length === 0 ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={128}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorAbnormal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(23, 23, 23, 0.8)',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white'
                            }}
                          />
                          <Legend />
                          <Area
                            name="告警总数"
                            type="monotone"
                            dataKey="value"
                            stroke="#8884d8"
                            strokeWidth={2}
                            fill="url(#colorValue)"
                          />
                          <Area
                            name="异常告警"
                            type="monotone"
                            dataKey="abnormal"
                            stroke="#ff9800"
                            strokeWidth={2}
                            fill="url(#colorAbnormal)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                
                {/* 右侧：设备告警统计 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">设备告警统计</h3>
                  </div>
                  <div className="h-32">
                    {statsLoading || !monitorData?.stats.by_device.length ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={128}>
                        <BarChart
                          data={monitorData.stats.by_device}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={100}
                            tick={{ fontSize: 12 }} 
                          />
                          <Tooltip
                            formatter={(value: number, name: string, props: any) => [value, '告警数量']}
                            contentStyle={{ 
                              backgroundColor: 'rgba(23, 23, 23, 0.8)',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white'
                            }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#8884d8" 
                            name="告警数量"
                            radius={[0, 4, 4, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 右侧告警列表 */}
        <div className="col-span-1 h-full">
          {/* RealTimeAlerts component removed - depends on deleted alert module */}
        </div>
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({ 
  title, 
  value, 
  type = 'default',
  icon,
  loading = false,
  change,
  className
}: { 
  title: string; 
  value: string; 
  type?: 'default' | 'warning' | 'success';
  icon?: React.ReactNode;
  loading?: boolean;
  change?: number;
  className?: string;
}) {
  return (
    <Card className={`p-4 relative overflow-hidden hover:shadow-md transition-all duration-200 ${className || ''}`}>
      {loading ? (
        <>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
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
            </div>
            <div className="p-2 rounded-full bg-muted/50">
              {icon}
            </div>
          </div>
          
          {change !== undefined && (
            <div className="mt-2 flex items-center text-xs">
              <span className={change > 0 ? "text-green-500" : "text-red-500"}>
                {change > 0 ? <ChevronUp className="inline h-3 w-3 mr-0.5" /> : '▼ '}
                {Math.abs(change)}%
              </span>
              <span className="text-muted-foreground ml-1">vs 昨日</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
} 