"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { PlusCircle } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import debounce from "lodash/debounce"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { appAccessAPI } from "@/api"
import { toast } from "sonner"
import { AppAccess, AppAccessSearchParams } from "@/types/app"
import { DateRangePicker } from "./date-range-picker"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: AppAccessSearchParams) => void
  columnLabels?: Record<string, string>
  onCreateClick?: () => void
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  columnLabels,
  onCreateClick,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  // 日期范围状态
  const [createTimeRange, setCreateTimeRange] = useState<DateRange | undefined>()
  const [expireTimeRange, setExpireTimeRange] = useState<DateRange | undefined>()
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<AppAccessSearchParams>({})
  
  // 状态选项
  const statusOptions = [
    { label: "启用", value: "0" },
    { label: "停用", value: "1" },
  ]

  // 批量删除
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => appAccessAPI.batchDelete(ids),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["app-access", "list"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 创建防抖搜索函数
  const debouncedSearchFn = useCallback(() => {
    if (onSearch) {
      onSearch(searchParamsRef.current)
    }
  }, [onSearch]);

  // 使用防抖处理搜索
  const debouncedSearch = debounce(debouncedSearchFn, 500);

  // 更新搜索参数
  const updateSearchParams = useCallback((key: string, value: any) => {
    // 根据不同的键处理不同类型的数据
    if (key === "app_name" || key === "app_code") {
      // 处理关键词搜索
      searchParamsRef.current = {
        ...searchParamsRef.current,
        keywords: {
          ...searchParamsRef.current.keywords,
          [key]: value || undefined
        }
      }
    } else if (key === "create_time" || key === "expire_time") {
      // 处理时间范围
      searchParamsRef.current = {
        ...searchParamsRef.current,
        time_range: {
          ...searchParamsRef.current.time_range,
          [key]: value || undefined
        }
      }
    } else {
      // 处理其它普通字段
      searchParamsRef.current = {
        ...searchParamsRef.current,
        [key]: value || undefined
      }
    }
    
    debouncedSearch();
  }, [debouncedSearch]);

  // 处理创建时间范围变化
  const handleCreateTimeRangeChange = useCallback((range: DateRange | undefined) => {
    setCreateTimeRange(range);
    
    // 转换日期范围为格式化的字符串
    const timeRange = range ? {
      start: range.from ? format(range.from, "yyyy-MM-dd HH:mm:ss") : undefined,
      end: range.to ? format(range.to, "yyyy-MM-dd 23:59:59") : undefined,
    } : undefined;
    
    updateSearchParams("create_time", timeRange);
  }, [updateSearchParams]);

  // 处理过期时间范围变化
  const handleExpireTimeRangeChange = useCallback((range: DateRange | undefined) => {
    setExpireTimeRange(range);
    
    // 转换日期范围为格式化的字符串
    const timeRange = range ? {
      start: range.from ? format(range.from, "yyyy-MM-dd HH:mm:ss") : undefined,
      end: range.to ? format(range.to, "yyyy-MM-dd 23:59:59") : undefined,
    } : undefined;
    
    updateSearchParams("expire_time", timeRange);
  }, [updateSearchParams]);

  // 自定义应用接入列标签
  const appAccessColumnLabels = {
    app_code: "应用编码",
    app_name: "应用名称",
    status: "状态",
    expire_time: "过期时间",
    create_time: "创建时间",
    ...columnLabels
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="搜索应用名称..."
            value={(table.getColumn("app_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              const value = event.target.value
              table.getColumn("app_name")?.setFilterValue(value)
              updateSearchParams("app_name", value)
            }}
            className="h-10 w-[150px] lg:w-[200px]"
          />
          <Input
            placeholder="搜索应用编码..."
            value={(table.getColumn("app_code")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              const value = event.target.value
              table.getColumn("app_code")?.setFilterValue(value)
              updateSearchParams("app_code", value)
            }}
            className="h-10 w-[150px] lg:w-[200px]"
          />
          
          <div className="flex items-center w-[300px]">
            {/* <span className="text-sm font-medium mr-1">创建时间:</span> */}
            <DateRangePicker
              value={createTimeRange}
              onChange={handleCreateTimeRangeChange}
              placeholder="选择创建时间范围"
              align="start"
              className="w-[220px]"
            />
          </div>
          
          <div className="flex items-center w-[300px]">
            {/* <span className="text-sm font-medium mr-1">过期时间:</span> */}
            <DateRangePicker
              value={expireTimeRange}
              onChange={handleExpireTimeRangeChange}
              placeholder="选择过期时间范围"
              align="start"
              className="w-[220px]"
            />
          </div>
          
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="状态"
              options={statusOptions}
              onSelect={(selectedValue) => {
                const status = selectedValue && selectedValue.length > 0 ? selectedValue[0] : undefined;
                updateSearchParams("status", status);
              }}
            />
          )}
          
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters()
                searchParamsRef.current = {}
                setCreateTimeRange(undefined)
                setExpireTimeRange(undefined)
                if (onSearch) {
                  onSearch({})
                }
              }}
              className="h-8 px-2"
            >
              重置
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
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
            columnLabels={appAccessColumnLabels}
          />
          <Button
            size="sm"
            className="h-8"
            onClick={onCreateClick}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            新建应用
          </Button>
        </div>
      </div>

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const selectedIds = table.getSelectedRowModel().rows.map(
            (row) => (row.original as AppAccess).id
          )
          deleteMutation.mutate(selectedIds)
        }}
        title="确认批量删除"
        description={`确定要删除选中的 ${table.getSelectedRowModel().rows.length} 个应用接入吗？此操作不可恢复。`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
} 