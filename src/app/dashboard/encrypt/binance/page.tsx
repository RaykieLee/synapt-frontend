"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, TrendingUp, Wallet, DollarSign, PieChart, Settings } from 'lucide-react';
import { binanceApi, BinanceBalance, BinanceSummary, BinanceAssetValue, BinanceConfig } from '@/api/binance';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/animate-ui/radix/dialog';
import { Progress } from '@/components/animate-ui/radix/progress';

export default function BinancePage() {
  const [summary, setSummary] = useState<BinanceSummary | null>(null);
  const [config, setConfig] = useState<BinanceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<BinanceConfig>({
    target_amount: 100000,
    base_amount: 10000
  });

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [summaryData, configData] = await Promise.all([
        binanceApi.getSummary(),
        binanceApi.getConfig().catch(() => ({ target_amount: 100000, base_amount: 10000 }))
      ]);
      
      setSummary(summaryData);
      setConfig(configData);
      setTempConfig(configData);
      
      if (showRefreshing) {
        toast({
          title: "刷新成功",
          description: "币安余额数据已更新",
        });
      }
    } catch (error) {
      toast({
        title: "获取数据失败",
        description: error instanceof Error ? error.message : "请检查网络连接或API配置",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const saveConfig = async () => {
    if (!tempConfig) return;
    
    try {
      setConfigLoading(true);
      const updatedConfig = await binanceApi.updateConfig(tempConfig);
      setConfig(updatedConfig);
      setIsSettingsOpen(false);
      
      toast({
        title: "设置保存成功",
        description: "目标金额和基础金额已更新",
      });
    } catch (error) {
      toast({
        title: "保存设置失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 10000) {
      return (num / 1000).toFixed(2) + 'K';
    } else if (num >= 1) {
      // 对于大于等于1的数字，显示完整数字，最多8位小数
      return num.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 8 
      });
    }
    // 对于小于1的数字，显示科学计数法或精确小数
    return num.toFixed(8);
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 10000) {
      return '$' + (num / 1000).toFixed(2) + 'K';
    }
    // 对于小于10K的金额，显示完整数字
    return '$' + num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatCNY = (num: number): string => {
    if (num >= 1000000) {
      return '¥' + (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 10000) {
      return '¥' + (num / 10000).toFixed(2) + '万';
    }
    // 对于小于1万的金额，显示完整数字
    return '¥' + num.toLocaleString('zh-CN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatLastUpdated = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN');
  };

  const calculateProgress = (): { 
    current: number; 
    target: number; 
    progress: number; 
    remaining: number; 
  } => {
    if (!summary || !config) {
      return { current: 0, target: 100000, progress: 0, remaining: 100000 };
    }
    
    const current = summary.total_value_cny + config.base_amount;
    const target = config.target_amount;
    const progress = Math.min((current / target) * 100, 100);
    const remaining = Math.max(target - current, 0);
    
    return { current, target, progress, remaining };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">币安余额</h1>
            <p className="text-muted-foreground">查看您的币安账户余额</p>
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
          <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">币安余额</h1>
            <p className="text-muted-foreground">查看您的币安账户余额</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>币安投资设置</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target_amount">目标金额（人民币）</Label>
                    <Input
                      id="target_amount"
                      type="number"
                      value={tempConfig.target_amount}
                      onChange={(e) => setTempConfig(prev => ({
                        ...prev,
                        target_amount: Number(e.target.value)
                      }))}
                      placeholder="请输入目标金额"
                    />
                  </div>
                  <div>
                    <Label htmlFor="base_amount">基础金额（小金库，人民币）</Label>
                    <Input
                      id="base_amount"
                      type="number"
                      value={tempConfig.base_amount}
                      onChange={(e) => setTempConfig(prev => ({
                        ...prev,
                        base_amount: Number(e.target.value)
                      }))}
                      placeholder="请输入基础金额"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={saveConfig}
                    disabled={configLoading}
                  >
                    {configLoading ? "保存中..." : "保存"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={() => fetchData(true)} 
              disabled={refreshing}
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>

              {summary && config && (
          <>
            {/* 投资进度条 */}
            {(() => {
              const progressData = calculateProgress();
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      基本物质保障进度
                    </CardTitle>
                    <CardDescription>
                      当前总资产（币安 + 小金库）距离目标金额(房子:100w, 车子:10w, 彩礼:10w, 装修:20w)的进度
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>当前: {formatCNY(progressData.current)}</span>
                      <span>目标: {formatCNY(progressData.target)}</span>
                    </div>
                    <Progress value={progressData.progress} className="h-3" />
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>进度: {progressData.progress.toFixed(1)}%</span>
                      <span>
                        {progressData.remaining > 0 
                          ? `还需: ${formatCNY(progressData.remaining)}`
                          : "🎉 目标已达成！"
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCNY(summary.total_value_cny)}
                        </div>
                        <div className="text-xs text-muted-foreground">币安资产</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {formatCNY(config.base_amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">基础金库</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* 总览卡片 */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总资产价值</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.total_value_usdt || 0)}
                </div>
                <div className="text-lg font-semibold text-blue-600 mt-1">
                  {formatCNY(summary.total_value_cny || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  汇率: 1 USD = {summary.usd_to_cny_rate?.toFixed(2) || '7.20'} CNY
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">资产数量</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_assets}</div>
                <p className="text-xs text-muted-foreground">种不同资产</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最大持仓</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.asset_values && summary.asset_values.length > 0 ? summary.asset_values[0].asset : 
                   (summary.main_assets.length > 0 ? summary.main_assets[0].asset : 'N/A')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.asset_values && summary.asset_values.length > 0 ? 
                    formatCurrency(summary.asset_values[0].value_usdt) : 
                    (summary.main_assets.length > 0 ? formatNumber(summary.main_assets[0].total) : '0')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">更新时间</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {formatLastUpdated(summary.last_updated)}
                </div>
                <p className="text-xs text-muted-foreground">最后更新</p>
              </CardContent>
            </Card>
          </div>

          {/* 资产价值排行 */}
          {summary.asset_values && summary.asset_values.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>资产价值排行</span>
                </CardTitle>
                <CardDescription>
                  按价值排序的资产列表（USDT计价）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.asset_values.slice(0, 10).map((assetValue, index) => (
                    <div key={assetValue.asset} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <span className="text-sm font-bold text-primary">
                            {assetValue.asset.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{assetValue.asset}</h3>
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {assetValue.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            持有量: {formatNumber(assetValue.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(assetValue.value_usdt)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          价值
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 主要资产详情 */}
          <Card>
            <CardHeader>
              <CardTitle>主要资产详情</CardTitle>
              <CardDescription>
                显示您持有的主要数字资产余额
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.main_assets.map((balance, index) => (
                  <div key={balance.asset} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <span className="text-sm font-bold text-primary">
                          {balance.asset.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{balance.asset}</h3>
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          可用: {formatNumber(balance.free)} | 锁定: {formatNumber(balance.locked)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatNumber(balance.total)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        总余额
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 完整余额列表 */}
          {summary.all_balances.length > 5 && (
            <Card>
              <CardHeader>
                <CardTitle>完整余额列表</CardTitle>
                <CardDescription>
                  所有非零余额的数字资产
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {summary.all_balances.slice(5).map((balance) => (
                    <div key={balance.asset} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {balance.asset.slice(0, 1)}
                          </span>
                        </div>
                        <span className="font-medium">{balance.asset}</span>
                      </div>
                      <span className="text-sm">
                        {formatNumber(balance.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 