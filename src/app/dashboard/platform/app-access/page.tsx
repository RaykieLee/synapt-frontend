"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { AppAccessQuery, AppAccess, AppAccessSearchParams } from "@/types/app";
import { appAccessAPI } from "@/api";
import { PageResult } from "@/types/base";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { AppDialog } from "./components/app-dialog";

export default function AppAccessPage() {
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
  
  // 创建弹窗状态
  const [createOpen, setCreateOpen] = useState(false);

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

  // 处理创建按钮点击
  const handleCreateClick = useCallback(() => {
    setCreateOpen(true);
  }, []);

  // 安全关闭弹窗的函数
  const safeCloseDialog = useCallback((closeFunc: () => void) => {
    // 首先使用RAF确保在下一帧执行
    requestAnimationFrame(() => {
      // 然后使用setTimeout确保React有时间更新DOM
      setTimeout(() => {
        closeFunc()
      }, 150)
    })
  }, [])

  // 处理弹窗状态变化
  const handleDialogOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      safeCloseDialog(() => setCreateOpen(false))
    } else {
      setCreateOpen(true)
    }
  }, [safeCloseDialog])

  // 处理创建成功
  const handleCreateSuccess = () => {
    // 安全关闭弹窗
    safeCloseDialog(() => setCreateOpen(false))
  };

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
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
        minHeight="600px"
        onCreateClick={handleCreateClick}
      />
      
      {/* 创建应用对话框 */}
      <AppDialog
        mode="create"
        open={createOpen}
        onOpenChange={handleDialogOpenChange}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
} 