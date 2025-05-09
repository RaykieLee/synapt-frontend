"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { SortingState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { AlertConfigQuery, AlertConfig, AlertSearchParams } from "@/types/alert";
import { alertConfigAPI } from "@/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { PageResult } from "@/types/base";

export default function AlertConfigPage() {
  const router = useRouter();
  
  // 状态管理
  const [query, setQuery] = useState<AlertConfigQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "create_time",
        order: "desc"
      }
    ],
    params: {
      search_mode: "and"
    }
  });

  // 查询告警配置列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["alerts", "config", "list", query],
    queryFn: () => alertConfigAPI.getList(query),
  });

  // 从响应中提取数据
  const alertConfigsData = (response?.data || response || {}) as PageResult<AlertConfig>;
  const list = alertConfigsData.list || [];
  const total = alertConfigsData.total || 0;
  const pages = alertConfigsData.pages || 1;

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
  const handleSearch = useCallback((params: AlertSearchParams) => {
    // 确保数据发送到后端而不是在前端过滤
    console.log('搜索参数：', params);
    
    // 特别处理筛选参数：确保直接传递用户选择的值，不做反向处理
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        keywords: {
          name: params.name,
          code: params.code,
        },
        // 直接使用选中的状态值
        status: params.status,
        // 直接使用选中的类别ID数组，支持多选
        category_ids: params.category_ids || undefined,
        search_mode: "and"
      }
    }));
  }, []);

  // 自定义列标签
  const columnLabels = {
    name: "配置名称",
    code: "配置编码",
    categories: "告警类别",
    status: "状态",
    create_time: "创建时间",
  };

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">告警配置管理</h2>
            <p className="text-muted-foreground">
              管理系统中的告警配置和触发规则
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
          minHeight="400px"
        />
      </div>
    </div>
  );
} 