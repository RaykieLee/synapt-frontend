"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { CreateDictTypeDialog } from "./components/create-dict-type-dialog";
import { EditDictTypeDialog } from "./components/edit-dict-type-dialog";

import { dictAPI } from "@/api/dict";
import { DictType, DictTypeSearchParams } from "@/types/dict";

export default function DictPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // 分页和搜索参数
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchParams, setSearchParams] = useState<DictTypeSearchParams>({});
  
  // 弹窗状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentDictType, setCurrentDictType] = useState<DictType | null>(null);
  
  // 查询字典类型列表
  const {
    data: dictTypeList,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["dictTypeList", pageIndex, pageSize, searchParams],
    queryFn: () => dictAPI.getDictTypes({
      pageNum: pageIndex,
      pageSize: pageSize,
      dictName: searchParams.dict_name,
      dictType: searchParams.dict_type,
      status: searchParams.status
    })
  });
  
  const dictTypes = dictTypeList?.rows || [];
  const total = dictTypeList?.total || 0;
  const pageCount = Math.ceil(total / pageSize);
  
  // 删除字典类型
  const deleteMutation = useMutation({
    mutationFn: (dictId: number) => dictAPI.deleteDictType(dictId),
    onSuccess: () => {
      toast.success("删除成功", {
        description: "字典类型已成功删除"
      });
      queryClient.invalidateQueries({ queryKey: ["dictTypeList"] });
    },
    onError: (error) => {
      toast.error("删除失败", {
        description: `${error}`
      });
    }
  });

  // 批量删除字典类型
  const batchDeleteMutation = useMutation({
    mutationFn: (dictIds: number[]) => dictAPI.batchDeleteDictTypes(dictIds),
    onSuccess: () => {
      toast.success("批量删除成功", {
        description: "选中的字典类型已成功删除"
      });
      queryClient.invalidateQueries({ queryKey: ["dictTypeList"] });
    },
    onError: (error) => {
      toast.error("批量删除失败", {
        description: `${error}`
      });
    }
  });
  
  // 处理搜索
  const handleSearch = (params: DictTypeSearchParams) => {
    setSearchParams(params);
    setPageIndex(1); // 重置到第一页
  };
  
  // 处理分页变化
  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };
  
  // 处理编辑
  const handleEdit = (dictType: DictType) => {
    setCurrentDictType(dictType);
    setShowEditDialog(true);
  };
  
  // 处理删除
  const handleDelete = (dictId: number) => {
    deleteMutation.mutate(dictId);
  };

  // 处理批量删除
  const handleBatchDelete = (dictIds: number[]) => {
    batchDeleteMutation.mutate(dictIds);
  };
  
  // 查看字典数据
  const handleViewData = (dictType: string) => {
    // 找到对应的字典类型数据，获取名称
    const dictTypeData = dictTypes.find(dt => dt.dict_type === dictType);
    const dictTypeName = dictTypeData?.dict_name || dictType;
    router.push(`/dashboard/system/dict/data?type=${dictType}&name=${encodeURIComponent(dictTypeName)}`);
  };

  // 表格列配置
  const tableColumns = columns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleViewData
  });

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">字典类型管理</h2>
            <p className="text-muted-foreground">
              管理系统中的数据字典类型定义
            </p>
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          data={dictTypes}
          pageCount={pageCount}
          pageIndex={pageIndex - 1} // React Table使用0-based索引
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onSortingChange={() => {}} // TODO: 实现排序
          isLoading={isLoading}
          showCreateButton={true}
          onCreateClick={() => setShowCreateDialog(true)}
          createButtonText="新建字典类型"
          createButtonIcon={PlusCircle}
          onBatchDelete={handleBatchDelete}
        />

        {/* 创建字典类型弹窗 */}
        <CreateDictTypeDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {/* 编辑字典类型弹窗 */}
        <EditDictTypeDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          dictType={currentDictType}
        />
      </div>
    </div>
  );
} 