import { apiRequest } from '@/lib/api';

export interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface BinanceAssetValue {
  asset: string;
  amount: number;
  value_usdt: number;
  percentage: number;
}

export interface BinanceSummary {
  total_assets: number;
  main_assets: BinanceBalance[];
  all_balances: BinanceBalance[];
  total_value_usdt: number;
  total_value_cny: number;
  usd_to_cny_rate: number;
  asset_values: BinanceAssetValue[];
  last_updated: number;
}

export interface BinanceConfig {
  target_amount: number;
  base_amount: number;
}

export const binanceApi = {
  // 获取余额
  getBalance: async (): Promise<BinanceBalance[]> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    return await apiRequest<BinanceBalance[]>(`${baseUrl}/encrypt/binance/balance`);
  },

  // 获取账户摘要
  getSummary: async (): Promise<BinanceSummary> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    return await apiRequest<BinanceSummary>(`${baseUrl}/encrypt/binance/summary`);
  },

  // 获取配置
  getConfig: async (): Promise<BinanceConfig> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    return await apiRequest<BinanceConfig>(`${baseUrl}/encrypt/binance/config`);
  },

  // 更新配置
  updateConfig: async (config: BinanceConfig): Promise<BinanceConfig> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    return await apiRequest<BinanceConfig>(`${baseUrl}/encrypt/binance/config`, 'POST', config);
  },
}; 