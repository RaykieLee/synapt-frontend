"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

import { AttachmentQuery, Attachment } from "@/types/attachment";
import { attachmentApi } from "@/api/attachment";
import { getColumns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { AttachmentUpload } from "./components/attachment-upload";
import { AttachmentListResponse } from "@/types/attachment";

export default function AttachmentsPage() {
  // 状态管理
  const [query, setQuery] = useState<AttachmentQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [{ field: "created_at", order: "desc" }],
    params: { keywords: {}, search_mode: "and" }
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // 查询数据
  const { data: response, isLoading } = useQuery({
    queryKey: ["attachments", "list", query],
    queryFn: () => attachmentApi.getList(query),
    refetchOnWindowFocus: false,
  });

  const data = (response || {}) as AttachmentListResponse;
  const list = data.list || [];
  const total = data.total || 0;
  const pages = data.pages || 1;

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
  const handleSearch = useCallback((searchParams: any) => {
    console.log('主页面收到搜索参数：', searchParams);
    const newParams = Object.keys(searchParams).length === 0 
      ? { keywords: {}, search_mode: "and", _reset: Date.now() }  // 重置时添加时间戳
      : searchParams;  // 否则直接使用传入的参数
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1,
      params: newParams
    }));
  }, []);

  const columns = getColumns();

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">附件管理</h2>
            <p className="text-muted-foreground">管理系统中的所有附件文件</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={list}
          pageCount={pages}
          pageIndex={query.page_num ? query.page_num - 1 : 0}
          pageSize={query.page_size || 10}
          onPageChange={handlePageChange}
          onSortingChange={handleSortingChange}
          onSearch={handleSearch}
          isLoading={isLoading}
          onUpload={() => setUploadDialogOpen(true)}
        />

        <AttachmentUpload
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
        />
      </div>
    </div>
  );
} 