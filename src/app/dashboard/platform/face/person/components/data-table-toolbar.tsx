"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useRouter, useSearchParams } from "next/navigation"
import { PlusCircle, Target } from "lucide-react"
import { useState, useCallback, useRef } from "react"
import debounce from "lodash/debounce"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { facePersonAPI, faceLibraryAPI } from "@/api"
import { toast } from "sonner"
import { FacePerson, FacePersonSearchParams } from "@/types/face"
import { CreateEditDialog } from "./create-edit-dialog"
import { FaceRecognitionTest } from "./face-recognition-test"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: FacePersonSearchParams) => void
  columnLabels?: Record<string, string>
}

export function DataTableToolbar<TData extends object>({
  table,
  onSearch,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const router = useRouter()
  const searchParams = useSearchParams()
  const libraryId = searchParams.get("library_id")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [faceTestOpen, setFaceTestOpen] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<FacePersonSearchParams>({})

  // 获取所有人脸库
  const { data: librariesResponse } = useQuery({
    queryKey: ["face", "library", "all"],
    queryFn: () => faceLibraryAPI.getAll(),
  })
  
  const libraries = Array.isArray(librariesResponse) ? librariesResponse : [];
  
  // 生成人脸库选项
  const libraryOptions = libraries.map((library) => ({
    label: library.library_name || '未命名人脸库',
    value: library.id.toString()
  }));
  
  // 状态选项
  const statusOptions = [
    { label: "启用", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 批量删除
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => facePersonAPI.batchDelete(ids),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["face", "person"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 更新搜索参数
  const updateSearchParams = (key: keyof FacePersonSearchParams, value: string | undefined) => {
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

  // 自定义人员列标签
  const facePersonColumnLabels = {
    person_name: "姓名",
    person_code: "人员编码",
    library: "所属人脸库",
    face_count: "人脸数量",
    status: "状态",
    create_time: "创建时间",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索姓名..."
          value={(table.getColumn("person_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("person_name")?.setFilterValue(value)
            updateSearchParams("person_name", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        <Input
          placeholder="搜索人员编码..."
          value={(table.getColumn("person_code")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("person_code")?.setFilterValue(value)
            updateSearchParams("person_code", value)
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
        {!libraryId && table.getColumn("library") && (
          <DataTableFacetedFilter
            column={table.getColumn("library")}
            title="人脸库"
            options={libraryOptions}
            onSelect={(selectedValue) => {
              const libraryId = selectedValue && selectedValue.length > 0 ? selectedValue[0] : undefined;
              updateSearchParams("library_id", libraryId);
              if (onSearch) {
                const updatedParams = {
                  ...searchParamsRef.current,
                  library_id: libraryId
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
              queryClient.invalidateQueries({ queryKey: ["face", "person", "list"] })
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
          columnLabels={facePersonColumnLabels}
        />
        <Button 
          onClick={() => setFaceTestOpen(true)}
          size="sm"
          className="h-8"
          variant="outline"
        >
          <Target className="mr-2 h-4 w-4" />
          人脸识别测试
        </Button>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          className="h-8"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          新增人员
        </Button>
      </div>

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const selectedRows = table.getSelectedRowModel().rows
          const selectedIds = selectedRows.map((row) => (row.original as FacePerson).id)
          deleteMutation.mutate(selectedIds)
        }}
        title="删除人员"
        description={`您确定要删除这 ${table.getSelectedRowModel().rows.length} 个人员吗？此操作将同时删除所有相关的人脸图片数据，此操作无法撤销。`}
      />

      {/* 创建人员弹窗 */}
      <CreateEditDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultLibraryId={libraryId || undefined}
      />

      {/* 人脸识别测试弹窗 */}
      <FaceRecognitionTest
        open={faceTestOpen}
        onOpenChange={setFaceTestOpen}
      />
    </div>
  )
} 