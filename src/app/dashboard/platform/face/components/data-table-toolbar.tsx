"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"
import { useState, useCallback, useRef } from "react"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { faceLibraryAPI } from "@/api"
import { toast } from "sonner"
import { FaceLibrary, FaceLibrarySearchParams } from "@/types/face"
import { CreateEditDialog } from "./create-edit-dialog"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: FaceLibrarySearchParams) => void
  columnLabels?: Record<string, string>
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<FaceLibrarySearchParams>({})
  
  // 状态选项
  const statusOptions = [
    { label: "启用", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 批量删除
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => faceLibraryAPI.batchDelete(ids),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["face", "library"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 更新搜索参数
  const updateSearchParams = (key: keyof FaceLibrarySearchParams, value: string | undefined) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch();
  }

  // 创建防抖搜索函数
  const debouncedSearchFn = useCallback(() => {
    if (onSearch) {
      onSearch(searchParamsRef.current)
    }
  }, [onSearch]);

  // 使用防抖处理搜索
  const debouncedSearch = debounce(debouncedSearchFn, 500);

  // 自定义人脸库列标签
  const faceLibraryColumnLabels = {
    library_name: "人脸库名称",
    library_code: "人脸库编码",
    total_persons: "人员数量",
    total_faces: "人脸数量",
    status: "状态",
    description: "描述",
    create_time: "创建时间",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索人脸库名称..."
          value={(table.getColumn("library_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("library_name")?.setFilterValue(value)
            updateSearchParams("library_name", value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="搜索人脸库编码..."
          value={(table.getColumn("library_code")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("library_code")?.setFilterValue(value)
            updateSearchParams("library_code", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="状态"
            options={statusOptions}
            onSelect={(selectedValue) => {
              const status = selectedValue && selectedValue.length > 0 ? selectedValue[0] : undefined;
              updateSearchParams("status", status);
              if (onSearch) {
                const updatedParams = {
                  ...searchParamsRef.current,
                  status: status
                };
                onSearch(updatedParams);
              }
            }}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              searchParamsRef.current = {}
              if (onSearch) {
                onSearch({})
              }
              // 刷新列表数据
              queryClient.invalidateQueries({ queryKey: ["face", "library", "list"] })
            }}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {table.getSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setDeleteOpen(true)}
          >
            删除选中
          </Button>
        )}
        <DataTableViewOptions 
          table={table} 
          columnLabels={faceLibraryColumnLabels}
        />
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          className="h-8"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          新建人脸库
        </Button>
      </div>

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const selectedRows = table.getSelectedRowModel().rows
          const selectedIds = selectedRows.map((row) => (row.original as FaceLibrary).id)
          deleteMutation.mutate(selectedIds)
        }}
        title="删除人脸库"
        description={`您确定要删除这 ${table.getSelectedRowModel().rows.length} 个人脸库吗？此操作将同时删除所有相关的人员和人脸图片数据，此操作无法撤销。`}
      />

      {/* 创建人脸库弹窗 */}
      <CreateEditDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
} 