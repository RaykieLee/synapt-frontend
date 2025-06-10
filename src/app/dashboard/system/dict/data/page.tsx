"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ColumnDef, SortingState } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { dictAPI } from "@/api/dict"
import { DictData, DictDataSearchParams } from "@/types/dict"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { CreateDictDataDialog } from "./components/create-dict-data-dialog"
import { EditDictDataDialog } from "./components/edit-dict-data-dialog"

export default function DictDataPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  
  // 获取URL参数中的字典类型
  const dictType = searchParams.get("type") || ""
  const dictTypeName = searchParams.get("name") || ""
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  
  // 搜索状态
  const [searchFilter, setSearchFilter] = useState<DictDataSearchParams>({})
  
  // 排序状态
  const [sorting, setSorting] = useState<SortingState>([])
  
  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState<DictData | null>(null)

  // 如果没有字典类型参数，重定向到字典类型页面
  useState(() => {
    if (!dictType) {
      router.push("/dashboard/system/dict")
    }
  })

  // 查询字典数据列表
  const {
    data: dictDataList,
    isLoading,
  } = useQuery({
    queryKey: ["dictDataList", currentPage, pageSize, dictType, searchFilter, sorting],
    queryFn: () => {
      const params = {
        pageNum: currentPage,
        pageSize: pageSize,
        dictType: dictType,
        dictLabel: searchFilter.dict_label,
        status: searchFilter.status,
      }
      return dictAPI.getDictDataList(params)
    },
    enabled: !!dictType,
    staleTime: 5 * 60 * 1000 // 5分钟
  })

  // 删除字典数据
  const deleteMutation = useMutation({
    mutationFn: (id: number) => dictAPI.deleteDictData(id),
    onSuccess: () => {
      toast.success("删除成功", {
        description: "字典数据已成功删除"
      })
      queryClient.invalidateQueries({ queryKey: ["dictDataList"] })
    },
    onError: (error) => {
      toast.error("删除失败", {
        description: `${error}`
      })
    }
  })

  // 处理搜索
  const handleSearch = (params: DictDataSearchParams) => {
    setSearchFilter(params)
    setCurrentPage(1) // 重置到第一页
  }

  // 处理排序
  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting)
    setCurrentPage(1) // 重置到第一页
  }

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // 编辑操作
  const handleEdit = (data: DictData) => {
    setEditData(data)
    setEditDialogOpen(true)
  }

  // 删除操作
  const handleDelete = (data: DictData) => {
    if (window.confirm(`确定要删除字典数据 "${data.dict_label}" 吗？`)) {
      deleteMutation.mutate(data.dict_code)
    }
  }

  // 根据ID删除数据
  const handleDeleteById = (dictCode: number) => {
    const data = list.find(item => item.dict_code === dictCode);
    if (data) {
      handleDelete(data);
    }
  }

  // 返回到字典类型页面
  const handleBack = () => {
    router.push("/dashboard/system/dict")
  }

  // 创建表格列，传入操作处理函数
  const tableColumns = columns({
    onEdit: handleEdit,
    onDelete: handleDeleteById,
  })

  const list = dictDataList?.rows || []
  const total = dictDataList?.total || 0
  const pageCount = Math.ceil(total / pageSize)

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={tableColumns}
        data={list}
        pageCount={pageCount}
        pageIndex={currentPage - 1}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onSortingChange={handleSortingChange}
        isLoading={isLoading}
        minHeight="400px"
        showCreateButton={true}
        onCreateClick={() => setCreateDialogOpen(true)}
        createButtonText="新增字典数据"
        createButtonIcon={Plus}
        showBackButton={true}
        onBackClick={handleBack}
        dictTypeName={dictTypeName}
      />

      {/* 创建对话框 */}
      <CreateDictDataDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        dictType={dictType}
      />

      {/* 编辑对话框 */}
      <EditDictDataDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        data={editData}
      />
    </div>
  )
} 