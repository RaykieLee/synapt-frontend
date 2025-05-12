"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

import { AppAccessQuery, AppAccess, AppAccessSearchParams } from "@/types/app";
import { appAccessAPI } from "@/api";
import { PageResult } from "@/types/base";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

export default function AppAccessPage() {
  const router = useRouter();
  
  // 状态管理
  const [query, setQuery] = useState<AppAccessQuery>({
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

  // 查询应用接入列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["app-access", "list", query],
    queryFn: () => appAccessAPI.getList(query),
  });

  // 从响应中提取数据
  const appAccessData = (response?.data || response || {}) as PageResult<AppAccess>;
  const list = appAccessData.list || [];
  const total = appAccessData.total || 0;
  const pages = appAccessData.pages || 1;

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
  const handleSearch = useCallback((params: AppAccessSearchParams) => {
    console.log('搜索参数：', params);
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        keywords: {
          app_name: params.keywords?.app_name,
          app_code: params.keywords?.app_code,
        },
        status: params.status,
        time_range: params.time_range,
        search_mode: "and"
      }
    }));
  }, []);

  // 自定义列标签
  const columnLabels = {
    app_code: "应用编码",
    app_name: "应用名称",
    api_key: "API密钥",
    status: "状态",
    expire_time: "过期时间",
    create_time: "创建时间",
  };

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">应用接入管理</h2>
            <p className="text-muted-foreground">
              管理第三方应用接入和API密钥
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