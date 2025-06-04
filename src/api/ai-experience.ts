// 充电桩监控相关API服务

import { apiRequest } from "@/lib/api";

// 告警级别信息
export interface LevelStats {
  [key: string]: number; // 例如: { "warning": 10, "error": 5 }
}

// 设备告警信息
export interface DeviceStats {
  name: string;
  count: number;
}

// 设备级别告警信息
export interface DeviceLevelStats {
  [device: string]: {
    [level: string]: number;
  }
}

export interface ChargingPileStats {
  abnormal_alerts: number;
  today_alerts: number;
  by_level: LevelStats;
  by_device: DeviceStats[];
  device_level_data: DeviceLevelStats;
}

export interface ChargingPileChartData {
  time: string;
  value: number;
  abnormal: number;
}

export interface ChargingPileMonitorData {
  stats: ChargingPileStats;
}

/**
 * 获取充电桩监控统计数据
 */
export const getChargingPileStats = async (): Promise<ChargingPileMonitorData> => {
  return apiRequest<ChargingPileMonitorData>('/api/v1/platform/alerts/stats/charging-pile/stats', 'GET');
};

/**
 * 获取充电桩监控历史数据
 * @param timeRange 时间范围
 * @param deviceName 设备名称
 */
export const getChargingPileHistory = async (
  timeRange: 'day' | 'week' | 'month' = 'day',
  deviceName?: string
): Promise<ChargingPileChartData[]> => {
  let url = `/api/v1/platform/alerts/stats/charging-pile/history?time_range=${timeRange}`;
  if (deviceName) {
    url += `&device_name=${encodeURIComponent(deviceName)}`;
  }
  return apiRequest<ChargingPileChartData[]>(url, 'GET');
}; 