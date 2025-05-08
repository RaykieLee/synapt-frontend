"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { SortingState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
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
      search_mode: "and"
    }
  });

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
    console.log('Search params:', params); // 添加日志
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
    status: "状态",
    create_time: "创建时间",
  };

  // 添加调试日志
  console.log('Current query:', query);
  console.log('Response:', response);
  console.log('AlertCategoriesData:', alertCategoriesData);
  console.log('List:', list);

  // 列定义，传入编辑回调
  const columns = getColumns(handleOpenEditDialog);

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">告警类别管理</h2>
            <p className="text-muted-foreground">
              管理系统中的告警类别和分类
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleOpenCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              新建告警类别
            </Button>
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
        
        {/* 告警类别表单弹窗 */}
        <CategoryFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          editData={editData}
          mode={formMode}
        />
      </div>
    </div>
  );
} 