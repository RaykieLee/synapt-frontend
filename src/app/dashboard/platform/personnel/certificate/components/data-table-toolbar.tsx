"use client"

import { Table } from "@tanstack/react-table"
import { X, Plus, Search, Filter, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/shared/data-table"
import { CertificateQuery } from "@/types/personnel"
import { useState } from "react"
import { CertificateFormDialog } from "./certificate-form-dialog"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { certificateAPI, personnelQualificationAPI } from "@/api/personnel"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  query: CertificateQuery
  setQuery: React.Dispatch<React.SetStateAction<CertificateQuery>>
}

export function DataTableToolbar<TData>({
  table,
  query,
  setQuery,
}: DataTableToolbarProps<TData>) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchValue, setSearchValue] = useState(query.params?.keywords?.certificate_name || "");
  const queryClient = useQueryClient();

  // 获取证书类别选项
  const { data: categoriesResponse } = useQuery({
    queryKey: ["personnel", "certificate", "categories"],
    queryFn: () => certificateAPI.getCategories(),
  });

  // 获取人员选项
  const { data: personnelOptionsResponse } = useQuery({
    queryKey: ["personnel", "qualification", "options"],
    queryFn: () => personnelQualificationAPI.getOptions(),
  });

  const categories = categoriesResponse?.data || [];
  const personnelOptions = personnelOptionsResponse?.data || [];

  const isFiltered = query.params?.keywords?.certificate_name || 
                    query.params?.status || 
                    query.params?.certificate_category || 
                    query.params?.personnel_id;

  // 获取选中的行
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(row => (row.original as any).id);
  const hasSelection = selectedRows.length > 0;

  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: (certificate_ids: number[]) => certificateAPI.batchDelete({ certificate_ids }),
    onSuccess: (data) => {
      toast.success(`批量删除成功，共删除${data.data.count}条记录`);
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "list"] });
      table.resetRowSelection();
    },
    onError: (error) => {
      toast.error("批量删除失败：" + error.message);
    }
  });

  // 批量更新状态
  const batchUpdateStatusMutation = useMutation({
    mutationFn: ({ certificate_ids, status }: { certificate_ids: number[], status: string }) => 
      certificateAPI.batchUpdateStatus(certificate_ids, status),
    onSuccess: (data, variables) => {
      const statusText = variables.status === "1" ? "启用" : "禁用";
      toast.success(`批量${statusText}成功，共${statusText}${data.data.count}条记录`);
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "list"] });
      table.resetRowSelection();
    },
    onError: (error) => {
      toast.error("批量操作失败：" + error.message);
    }
  });

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        keywords: {
          ...prev.params?.keywords,
          certificate_name: value || undefined
        }
      }
    }));
  };

  // 处理状态筛选
  const handleStatusFilter = (value: string) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        status: value === "all" ? undefined : value
      }
    }));
  };

  // 处理类别筛选
  const handleCategoryFilter = (value: string) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        certificate_category: value === "all" ? undefined : value
      }
    }));
  };

  // 处理人员筛选
  const handlePersonnelFilter = (value: string) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        personnel_id: value === "all" ? undefined : Number(value)
      }
    }));
  };

  // 重置筛选
  const resetFilters = () => {
    setSearchValue("");
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        keywords: {},
        search_mode: "and"
      }
    }));
  };

  // 批量删除处理
  const handleBatchDelete = () => {
    if (!hasSelection) return;
    batchDeleteMutation.mutate(selectedIds);
  };

  // 批量启用处理
  const handleBatchEnable = () => {
    if (!hasSelection) return;
    batchUpdateStatusMutation.mutate({ certificate_ids: selectedIds, status: "1" });
  };

  // 批量禁用处理
  const handleBatchDisable = () => {
    if (!hasSelection) return;
    batchUpdateStatusMutation.mutate({ certificate_ids: selectedIds, status: "0" });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索证书名称..."
            value={searchValue}
            onChange={(event) => handleSearch(event.target.value)}
            className="pl-8 h-8 w-[150px] lg:w-[250px]"
          />
        </div>

        {/* 状态筛选 */}
        <Select
          value={query.params?.status || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="0">有效</SelectItem>
            <SelectItem value="1">无效</SelectItem>
          </SelectContent>
        </Select>

        {/* 类别筛选 */}
        <Select
          value={query.params?.certificate_category || "all"}
          onValueChange={handleCategoryFilter}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="类别" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类别</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 人员筛选 */}
        <Select
          value={query.params?.personnel_id?.toString() || "all"}
          onValueChange={handlePersonnelFilter}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="人员" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部人员</SelectItem>
            {personnelOptions.map((person) => (
              <SelectItem key={person.value} value={person.value.toString()}>
                {person.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 重置按钮 */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* 批量操作按钮 */}
        {hasSelection && (
          <>
            {/* 批量启用 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchEnable}
              disabled={batchUpdateStatusMutation.isPending}
              className="h-8"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              批量启用
            </Button>

            {/* 批量禁用 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchDisable}
              disabled={batchUpdateStatusMutation.isPending}
              className="h-8"
            >
              <XCircle className="mr-1 h-3 w-3" />
              批量禁用
            </Button>

            {/* 批量删除 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm(`您确定要删除选中的 ${selectedRows.length} 条证书记录吗？此操作不可撤销。`)) {
                  handleBatchDelete();
                }
              }}
              disabled={batchDeleteMutation.isPending}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              批量删除
            </Button>
          </>
        )}

        {/* 新增按钮 */}
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          新增证书
        </Button>

        {/* 列显示选项 */}
        <DataTableViewOptions table={table} />
      </div>

      {/* 新增证书对话框 */}
      <CertificateFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
      />
    </div>
  )
} 