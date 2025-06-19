"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/shared/data-table"
import { Upload, Plus, Trash2, AlertTriangle } from "lucide-react"
import { useState, useCallback, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { attachmentApi } from "@/api/attachment"
import { Attachment } from "@/types/attachment"
import debounce from "lodash/debounce"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: any) => void
  onUpload?: () => void
  columnLabels?: Record<string, string>
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  onUpload,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [searchValues, setSearchValues] = useState({
    file_name: "",
    mime_type: "",
    entity_code: "",
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // 使用 ref 存储当前的搜索参数
  const searchParamsRef = useRef<any>({})
  
  // 判断是否有筛选条件
  const isFiltered = Object.values(searchValues).some(value => value !== "")

  // 批量删除 mutation
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => attachmentApi.batchDelete({ attachment_ids: ids }),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "批量删除成功",
      })
      queryClient.invalidateQueries({ queryKey: ["attachments", "list"] })
      table.resetRowSelection()
      setShowDeleteConfirm(false)
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "批量删除失败",
        variant: "destructive",
      })
      setShowDeleteConfirm(false)
    },
  })

  // 获取选中的行
  const selectedRows = table.getSelectedRowModel().rows
  const selectedAttachmentIds = selectedRows.map(row => (row.original as Attachment).id)

  const handleBatchDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (selectedAttachmentIds.length > 0) {
      batchDeleteMutation.mutate(selectedAttachmentIds)
    }
  }

  // 更新搜索参数
  const updateSearchParams = (key: string, value: string | undefined) => {
    if (key === 'entity_code') {
      // entity_code 直接设置在根级别
      searchParamsRef.current = {
        ...searchParamsRef.current,
        entity_code: value || undefined,
        search_mode: "and"
      }
    } else {
      // file_name 和 mime_type 需要放在 keywords 对象中
      searchParamsRef.current = {
        ...searchParamsRef.current,
        keywords: {
          ...searchParamsRef.current.keywords,
          [key]: value || undefined
        },
        search_mode: "and"
      }
    }
    debouncedSearch()
  }

  // 创建防抖搜索函数
  const debouncedSearchFn = useCallback(() => {
    if (onSearch) {
      onSearch(searchParamsRef.current)
    }
  }, [onSearch])

  // 使用防抖处理搜索
  const debouncedSearch = debounce(debouncedSearchFn, 500)

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索文件名..."
          value={searchValues.file_name}
          onChange={(event) => {
            const value = event.target.value
            setSearchValues({ ...searchValues, file_name: value })
            updateSearchParams("file_name", value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="搜索文件类型..."
          value={searchValues.mime_type}
          onChange={(event) => {
            const value = event.target.value
            setSearchValues({ ...searchValues, mime_type: value })
            updateSearchParams("mime_type", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        <Input
          placeholder="实体代码..."
          value={searchValues.entity_code}
          onChange={(event) => {
            const value = event.target.value
            setSearchValues({ ...searchValues, entity_code: value })
            updateSearchParams("entity_code", value)
          }}
          className="h-8 w-[120px] lg:w-[150px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              console.log('重置所有筛选条件')
              // 清除所有输入框的值
              setSearchValues({
                file_name: "",
                mime_type: "",
                entity_code: "",
              })
              // 重置表格的列过滤器
              table.resetColumnFilters()
              // 清空搜索参数
              searchParamsRef.current = {}
              // 触发搜索
              if (onSearch) {
                onSearch({})
              }
            }}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {selectedRows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={handleBatchDelete}
            disabled={batchDeleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            批量删除 ({selectedRows.length})
          </Button>
        )}
        {onUpload && (
          <Button
            variant="default"
            size="sm"
            onClick={onUpload}
            className="h-8"
          >
            <Upload className="mr-2 h-4 w-4" />
            上传文件
          </Button>
        )}
        <DataTableViewOptions table={table} columnLabels={columnLabels} />
      </div>
      
      {/* 自定义删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-semibold">确认删除</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              确定要删除选中的 {selectedRows.length} 个附件吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={batchDeleteMutation.isPending}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={batchDeleteMutation.isPending}
              >
                {batchDeleteMutation.isPending ? "删除中..." : "确认删除"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 