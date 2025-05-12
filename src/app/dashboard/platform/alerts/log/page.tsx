"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { AlertLogQuery, AlertLog, AlertLogSearchParams } from "@/types/alert";
import { alertLogAPI } from "@/api/alert";
import { getColumns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { PageResult } from "@/types/base";
import { LogDetailDialog } from "./components/log-detail-dialog";

export default function AlertLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 获取URL参数中的config_id和category_id
  const configId = searchParams.get("config_id") ? parseInt(searchParams.get("config_id")!) : undefined;
  const categoryId = searchParams.get("category_id") ? parseInt(searchParams.get("category_id")!) : undefined;
  
  // 详情弹窗状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailData, setDetailData] = useState<AlertLog | null>(null);
  
  // 打开详情弹窗
  const handleOpenDetailDialog = useCallback((log: AlertLog) => {
    setDetailData(log);
    setDetailDialogOpen(true);
  }, []);
  
  // 状态管理
  const [query, setQuery] = useState<AlertLogQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "create_time",
        order: "desc"
      }
    ],
    params: {
      keywords: {},
      alert_config_id: configId,
      category_id: categoryId,
      search_mode: "and"
    }
  });

  // 当URL参数变化时更新查询
  useEffect(() => {
    setQuery(prev => ({
      ...prev,
      params: {
        ...prev.params,
        alert_config_id: configId,
        category_id: categoryId
      }
    }));
  }, [configId, categoryId]);

  // 查询告警日志列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["alerts", "log", "list", query],
    queryFn: () => alertLogAPI.getList(query),
  });

  // 从响应中提取数据
  const alertLogsData = (response?.data || response || {}) as PageResult<AlertLog>;
  const list = alertLogsData.list || [];
  const total = alertLogsData.total || 0;
  const pages = alertLogsData.pages || 1;

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page_num: page }));
  }, []);

  // 处理排序变化
  const handleSortingChange = useCallback((sorting: SortingState) => {
    setQuery((prev) => ({
      ...prev,
      sorts: sorting.map((sort) => ({
        field: sort.id,
        order: sort.desc ? "desc" : "asc"
      }))
    }));
  }, []);

  // 处理搜索
  const handleSearch = useCallback((params: AlertLogSearchParams) => {
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        keywords: {
          title: params.title,
          content: params.content,
          device_name: params.device_name,
        },
        status: params.status,
        level: params.level,
        source: params.source,
        alert_config_id: params.alert_config_id || configId,
        category_id: params.category_id || categoryId,
        search_mode: "and"
      }
    }));
  }, [configId, categoryId]);

  // 自定义列标签
  const columnLabels = {
    title: "告警标题",
    level: "告警级别",
    content: "告警内容",
    source: "告警来源",
    device_name: "设备名称",
    config: "告警配置",
    category: "告警类别",
    status: "处理状态",
    create_time: "告警时间",
    process_by: "处理人",
  };

  // 列定义，传入编辑回调
  const columns = getColumns(handleOpenDetailDialog);

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">告警日志</h2>
            <p className="text-muted-foreground">
              {configId ? "查看此告警配置的告警记录" : 
               categoryId ? "查看此告警类别的告警记录" : 
               "查看和管理系统中的所有告警日志"}
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={list}
          pageCount={pages}
          pageIndex={query.page_num ? query.page_num - 1 : 0}
          pageSize={query.page_size || 10}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onSortingChange={handleSortingChange}
          isLoading={isLoading}
          columnLabels={columnLabels}
          minHeight="600px"
          configId={configId}
          categoryId={categoryId}
        />
        
        {/* 告警日志详情弹窗 */}
        <LogDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          log={detailData}
        />
      </div>
    </div>
  );
} 