"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

import { FacePersonQuery, FacePerson, FacePersonSearchParams } from "@/types/face";
import { facePersonAPI } from "@/api";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { PageResult } from "@/types/base";

export default function FacePersonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const libraryId = searchParams.get("library_id");
  
  // 状态管理
  const [query, setQuery] = useState<FacePersonQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "create_time",
        order: "desc"
      }
    ],
    params: {
      search_mode: "and",
      library_id: libraryId || undefined
    }
  });

  // 查询人员列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["face", "person", "list", query],
    queryFn: () => facePersonAPI.getList(query),
  });

  // 从响应中提取数据
  const facePersonsData = (response?.data || response || {}) as PageResult<FacePerson>;
  const list = facePersonsData.list || [];
  const total = facePersonsData.total || 0;
  const pages = facePersonsData.pages || 1;

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
  const handleSearch = useCallback((params: FacePersonSearchParams) => {
    console.log('搜索参数：', params);
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1, // 重置到第一页
      params: {
        ...prev.params,
        keywords: {
          person_name: params.person_name,
          person_code: params.person_code,
        },
        status: params.status,
        library_id: params.library_id || libraryId || undefined,
        search_mode: "and"
      }
    }));
  }, [libraryId]);

  // 自定义列标签
  const columnLabels = {
    person_name: "姓名",
    person_code: "人员编码",
    library: "所属人脸库",
    face_count: "人脸数量",
    status: "状态",
    create_time: "创建时间",
  };

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {libraryId ? "人员管理" : "人员管理"}
            </h2>
            <p className="text-muted-foreground">
              {libraryId ? "管理指定人脸库中的人员信息" : "管理人脸识别系统中的人员信息"}
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