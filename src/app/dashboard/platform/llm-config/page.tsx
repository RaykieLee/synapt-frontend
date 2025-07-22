"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import debounce from "lodash/debounce";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "./components/data-table";
import { getColumns } from "./components/columns";
import { CreateEditDialog } from "./components/create-edit-dialog";
import { llmConfigAPI } from "@/api/llm-config";
import { 
  LLMConfig, 
  LLMConfigQuery, 
  LLMConfigSearchParams,
  LLMConfigListResponse 
} from "@/types/llm-config";

export default function LLMConfigPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LLMConfig | null>(null);
  
  // 查询参数状态
  const [query, setQuery] = useState<LLMConfigQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [{ field: "create_time", order: "desc" }],
    params: { keywords: {}, search_mode: "and" }
  });

  // 搜索参数引用
  const searchParamsRef = useRef<LLMConfigSearchParams>({});

  // 防抖搜索
  const debouncedSearch = useMemo(() => debounce(() => {
    if (Object.keys(searchParamsRef.current).length === 0) {
      setQuery(prev => ({
        ...prev,
        page_num: 1,
        params: { keywords: {}, search_mode: "and" }
      }));
    } else {
      setQuery(prev => ({
        ...prev,
        page_num: 1,
        params: {
          keywords: {
            config_code: searchParamsRef.current.config_code,
            config_name: searchParamsRef.current.config_name,
            provider: searchParamsRef.current.provider,
            model_name: searchParamsRef.current.model_name
          },
          status: searchParamsRef.current.status,
          search_mode: searchParamsRef.current.search_mode || "and"
        }
      }));
    }
  }, 500), []);

  // 获取配置列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["llm-config", "list", query],
    queryFn: () => llmConfigAPI.getList(query),
  });

  // 统一数据处理
  const configData = (response || {}) as LLMConfigListResponse;
  const list = configData.list || [];
  const total = configData.total || 0;

  // 删除配置
  const deleteMutation = useMutation({
    mutationFn: (data: { ids: string[] }) => llmConfigAPI.batchDelete(data),
    onSuccess: () => {
      toast.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["llm-config", "list"] });
    },
    onError: (error: any) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  // 处理搜索
  const handleSearch = useCallback((searchParams: LLMConfigSearchParams) => {
    searchParamsRef.current = searchParams;
    debouncedSearch();
  }, [debouncedSearch]);

  // 处理分页
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setQuery(prev => ({
      ...prev,
      page_num: page,
      page_size: pageSize
    }));
  }, []);

  // 处理创建
  const handleCreate = () => {
    setEditingConfig(null);
    setIsCreateDialogOpen(true);
  };

  // 处理编辑
  const handleEdit = (config: LLMConfig) => {
    setEditingConfig(config);
    setIsCreateDialogOpen(true);
  };

  // 处理成功
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["llm-config", "list"] });
    setIsCreateDialogOpen(false);
    setEditingConfig(null);
  };

  // 处理批量删除
  const handleBatchDelete = (selectedIds: string[]) => {
    deleteMutation.mutate({ ids: selectedIds });
  };

  return (
    <div className="min-h-screen space-y-4 p-4 max-w-6xl mx-auto">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">大模型配置管理</h1>
            <p className="text-sm text-muted-foreground">
              管理大语言模型的配置信息
            </p>
          </div>
        </div>

        <DataTable 
          columns={getColumns()}
          data={list}
          loading={isLoading}
          total={total}
          pageNum={query.page_num || 1}
          pageSize={query.page_size || 10}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onBatchDelete={handleBatchDelete}
          onAddNew={handleCreate}
        />

        <CreateEditDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          config={editingConfig}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}