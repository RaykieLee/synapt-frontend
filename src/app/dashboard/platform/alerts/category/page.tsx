"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

import { AlertCategoryQuery, AlertCategory } from "@/types/alert";
import { alertCategoryAPI } from "@/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getColumns } from "@/app/dashboard/platform/alerts/category/components/columns";
import { DataTable } from "@/app/dashboard/platform/alerts/category/components/data-table";
import { PageResult } from "@/types/base";
import { CategoryFormDialog } from "@/app/dashboard/platform/alerts/category/components/category-form-dialog";

export default function AlertCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 获取URL参数中的config_id
  const configId = searchParams.get("config_id") ? parseInt(searchParams.get("config_id")!) : undefined;
  // 表单弹窗状态
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editData, setEditData] = useState<AlertCategory | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  
  // 打开新建弹窗
  const handleOpenCreateDialog = useCallback(() => {
    setEditData(null);
    setFormMode("create");
    setFormDialogOpen(true);
  }, []);
  
  // 打开编辑弹窗
  const handleOpenEditDialog = useCallback((category: AlertCategory) => {
    setEditData(category);
    setFormMode("edit");
    setFormDialogOpen(true);
  }, []);
  
  // 状态管理
  const [query, setQuery] = useState<AlertCategoryQuery>({
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
      config_id: configId,
      search_mode: "and"
    }
  });

  // 当configId变化时更新查询参数
  useEffect(() => {
    setQuery(prev => ({
      ...prev,
      params: {
        ...prev.params,
        config_id: configId
      }
    }));
  }, [configId]);

  // 查询告警类别列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["alerts", "category", "list", query],
    queryFn: () => alertCategoryAPI.getList(query),
  });

  // 从响应中提取数据
  const alertCategoriesData = (response?.data || response || {}) as PageResult<AlertCategory>;
  const list = alertCategoriesData.list || [];
  const total = alertCategoriesData.total || 0;
  const pages = alertCategoriesData.pages || 1;

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
  const handleSearch = useCallback((params: {
    name?: string;
    code?: string;
    status?: string;
  }) => {
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        keywords: {
          name: params.name,
          code: params.code,
        },
        status: params.status,
        search_mode: "and"
      }
    }));
  }, []);

  // 自定义列标签
  const columnLabels = {
    name: "类别名称",
    code: "类别编码",
    description: "描述",
    frequency: "告警频率",
    status: "状态",
    create_time: "创建时间",
  };

  // 列定义，传入编辑回调
  const columns = getColumns(handleOpenEditDialog);

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">告警类别管理</h2>
            <p className="text-muted-foreground">
              {configId ? "管理此告警配置关联的类别" : "管理系统中的告警类别和分类"}
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
          handleOpenCreateDialog={handleOpenCreateDialog}
        />
        
        {/* 告警类别表单弹窗 */}
        <CategoryFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          editData={editData}
          mode={formMode}
          configId={configId}
        />
      </div>
    </div>
  );
} 