"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

import { FaceLibraryQuery, FaceLibrary, FaceLibrarySearchParams } from "@/types/face";
import { faceLibraryAPI } from "@/api";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { PageResult } from "@/types/base";

export default function FacePage() {
  const router = useRouter();
  
  // 状态管理
  const [query, setQuery] = useState<FaceLibraryQuery>({
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

  // 查询人脸库列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["face", "library", "list", query],
    queryFn: () => faceLibraryAPI.getList(query),
  });

  // 从响应中提取数据
  const faceLibrariesData = (response?.data || response || {}) as PageResult<FaceLibrary>;
  const list = faceLibrariesData.list || [];
  const total = faceLibrariesData.total || 0;
  const pages = faceLibrariesData.pages || 1;

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
  const handleSearch = useCallback((params: FaceLibrarySearchParams) => {
    console.log('搜索参数：', params);
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        keywords: {
          library_name: params.library_name,
          library_code: params.library_code,
        },
        status: params.status,
        search_mode: "and"
      }
    }));
  }, []);

  // 自定义列标签
  const columnLabels = {
    library_name: "人脸库名称",
    library_code: "人脸库编码",
    total_persons: "人员数量",
    total_faces: "人脸数量",
    status: "状态",
    description: "描述",
    create_time: "创建时间",
  };

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">人脸识别管理</h2>
            <p className="text-muted-foreground">
              管理人脸识别系统中的人脸库和相关数据
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
          minHeight="650px"
        />
      </div>
    </div>
  );
} 