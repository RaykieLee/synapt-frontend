"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

import { PersonnelQualificationQuery, PersonnelQualification } from "@/types/personnel";
import { personnelQualificationAPI } from "@/api/personnel";
import { getColumns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { PageResult } from "@/types/base";

export default function PersonnelQualificationPage() {
  // 状态管理
  const [query, setQuery] = useState<PersonnelQualificationQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [{ field: "create_time", order: "desc" }],
    params: { keywords: {}, search_mode: "and" }
  });

  // 查询数据
  const { data: response, isLoading } = useQuery({
    queryKey: ["personnel", "qualification", "list", query],
    queryFn: () => personnelQualificationAPI.getList(query),
  });

  const data = (response?.data || response || {}) as PageResult<PersonnelQualification>;
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

  const columns = getColumns();

  return (
    <div className="flex flex-col space-y-4">
      <DataTable
        columns={columns}
        data={list}
        pageCount={pages}
        pageIndex={query.page_num ? query.page_num - 1 : 0}
        pageSize={query.page_size || 10}
        onPageChange={handlePageChange}
        onSortingChange={handleSortingChange}
        isLoading={isLoading}
        query={query}
        setQuery={setQuery}
      />
    </div>
  );
} 