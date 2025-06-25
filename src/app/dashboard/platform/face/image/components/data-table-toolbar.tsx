"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DataTableFacetedFilter
} from "@/components/shared/data-table"
import { useState } from "react"
import { FaceImage, FaceImageSearchParams } from "@/types/face"
import { CreateEditDialog } from "./create-edit-dialog"
import { Plus, Search, Filter } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { faceImageAPI, facePersonAPI, faceLibraryAPI } from "@/api/face"
import { toast } from "sonner"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchParams: FaceImageSearchParams
  onSearch: (params: FaceImageSearchParams) => void
  onReset: () => void
}

const statusOptions = [
  {
    label: "启用",
    value: "enabled",
  },
  {
    label: "禁用",
    value: "disabled",
  },
]

export function DataTableToolbar<TData>({
  table,
  searchParams,
  onSearch,
  onReset,
}: DataTableToolbarProps<TData>) {
  const queryClient = useQueryClient()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [tempSearchParams, setTempSearchParams] = useState<FaceImageSearchParams>(searchParams)

  // 获取人脸库列表
  const { data: librariesData } = useQuery({
    queryKey: ["face-libraries", "all"],
    queryFn: () => faceLibraryAPI.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  // 获取人员列表
  const { data: personsData } = useQuery({
    queryKey: ["face-persons", "all", tempSearchParams.library_id],
    queryFn: () => facePersonAPI.getAll(tempSearchParams.library_id),
    enabled: !!tempSearchParams.library_id,
    staleTime: 5 * 60 * 1000,
  })

  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: (imageIds: number[]) => faceImageAPI.batchDelete(imageIds),
    onSuccess: () => {
      toast.success("批量删除成功")
      queryClient.invalidateQueries({ queryKey: ["face-images"] })
      queryClient.invalidateQueries({ queryKey: ["face-persons"] })
      queryClient.invalidateQueries({ queryKey: ["face-libraries"] })
      table.toggleAllPageRowsSelected(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || "批量删除失败")
    },
  })

  const isFiltered = Object.values(tempSearchParams).some(value => 
    value !== undefined && value !== "" && value !== null
  )

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedImageIds = selectedRows.map((row) => (row.original as FaceImage).id)

  const handleSearch = () => {
    onSearch(tempSearchParams)
  }

  const handleReset = () => {
    setTempSearchParams({})
    onReset()
    table.toggleAllPageRowsSelected(false)
    // 刷新列表数据
    queryClient.invalidateQueries({ queryKey: ["face-images"] })
  }

  const handleBatchDelete = () => {
    if (selectedImageIds.length === 0) {
      toast.warning("请先选择要删除的记录")
      return
    }

    if (confirm(`确定要删除选中的 ${selectedImageIds.length} 条记录吗？`)) {
      batchDeleteMutation.mutate(selectedImageIds)
    }
  }

  const libraries = librariesData?.data || []
  const persons = personsData?.data || []

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
        {/* 搜索区域 */}
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索图片ID..."
              value={tempSearchParams.image_id || ""}
              onChange={(event) =>
                setTempSearchParams(prev => ({
                  ...prev,
                  image_id: event.target.value
                }))
              }
              className="pl-8 h-8 w-[200px]"
            />
          </div>

          {/* 人脸库筛选 */}
          <Select
            value={tempSearchParams.library_id?.toString() || "all"}
            onValueChange={(value) =>
              setTempSearchParams(prev => ({
                ...prev,
                library_id: value === "all" ? undefined : Number(value),
                person_id: undefined, // 重置人员选择
              }))
            }
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="选择人脸库" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部人脸库</SelectItem>
              {libraries.map((library) => (
                <SelectItem key={library.id} value={library.id.toString()}>
                  {library.library_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 人员筛选 */}
          <Select
            value={tempSearchParams.person_id?.toString() || "all"}
            onValueChange={(value) =>
              setTempSearchParams(prev => ({
                ...prev,
                person_id: value === "all" ? undefined : Number(value),
              }))
            }
            disabled={!tempSearchParams.library_id}
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="选择人员" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部人员</SelectItem>
              {persons.map((person) => (
                <SelectItem key={person.id} value={person.id.toString()}>
                  {person.person_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 状态筛选 */}
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="状态"
              options={statusOptions}
            />
          )}

          <Button onClick={handleSearch} size="sm" className="h-8">
            <Search className="mr-1 h-3 w-3" />
            搜索
          </Button>

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-8 px-2 lg:px-3"
            >
              重置
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className="flex items-center space-x-2">
        {selectedRows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBatchDelete}
            disabled={batchDeleteMutation.isPending}
          >
            删除选中 ({selectedRows.length})
          </Button>
        )}

        <Button
          onClick={() => setShowCreateDialog(true)}
          size="sm"
          className="h-8"
        >
          <Plus className="mr-1 h-3 w-3" />
          新增
        </Button>
      </div>

      <CreateEditDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
        defaultLibraryId={tempSearchParams.library_id}
        defaultPersonId={tempSearchParams.person_id}
      />
    </div>
  )
} 