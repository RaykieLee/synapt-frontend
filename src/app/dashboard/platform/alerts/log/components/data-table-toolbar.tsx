"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useState, useCallback, useRef, useEffect } from "react"
import debounce from "lodash/debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DataTableViewOptions,
  DataTableFacetedFilter,
  DeleteConfirmationDialog
} from "@/components/shared/data-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { alertConfigAPI, alertCategoryAPI, alertLogAPI } from "@/api/alert"
import { toast } from "sonner"
import { AlertCategory, AlertConfig, AlertLog, AlertLogSearchParams } from "@/types/alert"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 自定义告警日志批量处理对话框
interface AlertProcessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (status: string) => void
  title?: string
  statusOptions: { label: string, value: string }[]
  rowCount: number
  isProcessing?: boolean
}

function AlertProcessDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "批量处理告警",
  statusOptions,
  rowCount,
  isProcessing = false,
}: AlertProcessDialogProps) {
  const [processStatus, setProcessStatus] = useState<string>("1")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            请选择要将选中的 {rowCount} 条告警日志更改为的状态
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <select 
            className="w-full border rounded p-2"
            value={processStatus}
            onChange={(e) => setProcessStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            取消
          </Button>
          <Button
            variant="default"
            onClick={() => onConfirm(processStatus)}
            disabled={isProcessing}
          >
            {isProcessing ? "处理中..." : "确认处理"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (params: AlertLogSearchParams) => void
  columnLabels?: Record<string, string>
  handleOpenCreateDialog?: () => void
  configId?: number
  categoryId?: number
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  columnLabels,
  handleOpenCreateDialog,
  configId,
  categoryId,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [batchProcessOpen, setBatchProcessOpen] = useState(false)
  const [filtersInitialized, setFiltersInitialized] = useState(false)
  
  // 使用ref存储当前的搜索参数
  const searchParamsRef = useRef<AlertLogSearchParams>({})

  // 初始化过滤器
  useEffect(() => {
    if (!filtersInitialized) {
      // 初始化告警配置过滤
      if (configId !== undefined) {
        const configColumn = table.getColumn("config");
        if (configColumn) {
          configColumn.setFilterValue([configId.toString()]);
          updateSearchParams("alert_config_id", configId);
        }
      }
      
      // 初始化告警类别过滤
      if (categoryId !== undefined) {
        const categoryColumn = table.getColumn("category");
        if (categoryColumn) {
          categoryColumn.setFilterValue([categoryId.toString()]);
          updateSearchParams("category_id", categoryId);
        }
      }
      
      setFiltersInitialized(true);
    }
  }, [table, configId, categoryId, filtersInitialized]);

  // 获取所有告警配置
  const { data: configsResponse } = useQuery({
    queryKey: ["alerts", "config", "all"],
    queryFn: () => alertConfigAPI.getAll(),
  })
  
  // 获取所有告警类别
  const { data: categoriesResponse } = useQuery({
    queryKey: ["alerts", "category", "all"],
    queryFn: () => alertCategoryAPI.getAll(),
  })
  
  const configs = Array.isArray(configsResponse) ? configsResponse : [];
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
  console.log('configs', configs)
  console.log('configsResponse', configsResponse)
  console.log('categories', categories)
  console.log('categoriesResponse', categoriesResponse)
  // 生成配置选项
  const configOptions = configs.map((config: AlertConfig) => ({
    label: config.name || '未命名配置',
    value: config.id.toString()
  }));
  
  // 生成分类选项
  const categoryOptions = categories.map((category: AlertCategory) => ({
    label: category.name || '未命名分类',
    value: category.category_id.toString()
  }));
  
  // 生成告警级别选项
  const levelOptions = [
    { label: "信息", value: "info" },
    { label: "警告", value: "warning" },
    { label: "错误", value: "error" },
    { label: "严重", value: "critical" },
  ];
  
  // 处理状态选项
  const statusOptions = [
    { label: "未处理", value: "0" },
    { label: "已处理", value: "1" },
    { label: "已忽略", value: "2" },
  ];

  // 批量删除
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => alertLogAPI.batchDelete(ids),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["alerts", "log"] })
      setDeleteOpen(false)
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`)
    },
  })

  // 批量处理
  const processMutation = useMutation({
    mutationFn: (data: {log_ids: number[], status: string}) => alertLogAPI.batchProcess({
      log_ids: data.log_ids,
      status: data.status,
      process_note: `批量设置为${statusOptions.find(s => s.value === data.status)?.label || data.status}`
    }),
    onSuccess: () => {
      toast.success("处理成功")
      queryClient.invalidateQueries({ queryKey: ["alerts", "log"] })
      setBatchProcessOpen(false)
    },
    onError: (error) => {
      toast.error(`处理失败: ${error}`)
    },
  })
  
  // 处理批量处理
  const handleBatchProcess = (status: string) => {
    const ids = table.getSelectedRowModel().rows.map(
      (row) => (row.original as AlertLog).id
    )
    processMutation.mutate({
      log_ids: ids,
      status
    })
  }

  // 更新搜索参数
  const updateSearchParams = (key: keyof AlertLogSearchParams, value: string | number | undefined) => {
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

  // 自定义告警日志列标签
  const alertLogColumnLabels = {
    title: "告警标题",
    level: "告警级别",
    content: "告警内容",
    source: "告警来源",
    device_name: "设备名称",
    config: "告警配置",
    category: "告警类别",
    status: "处理状态",
    create_time: "告警时间",
    process_by: "处理人",
    ...columnLabels
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="搜索告警标题..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("title")?.setFilterValue(value)
            updateSearchParams("title", value)
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="搜索告警内容..."
          value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value
            table.getColumn("content")?.setFilterValue(value)
            updateSearchParams("content", value)
          }}
          className="h-8 w-[150px] lg:w-[200px]"
        />
        {table.getColumn("level") && (
          <DataTableFacetedFilter
            column={table.getColumn("level")}
            title="告警级别"
            options={levelOptions}
            onSelect={(selectedValue) => {
              const level = selectedValue && selectedValue.length > 0 ? selectedValue[0] : undefined;
              updateSearchParams("level", level);
              if (onSearch) {
                const updatedParams = {
                  ...searchParamsRef.current,
                  level: level
                };
                onSearch(updatedParams);
              }
            }}
          />
        )}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="处理状态"
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
        {/* 告警配置过滤项 */}
        {table.getColumn("config") && (
          <DataTableFacetedFilter
            column={table.getColumn("config")}
            title="告警配置"
            options={configOptions}
            onSelect={(selectedValue) => {
              const configId = selectedValue && selectedValue.length > 0 ? parseInt(selectedValue[0]) : undefined;
              updateSearchParams("alert_config_id", configId);
              if (onSearch) {
                const updatedParams = {
                  ...searchParamsRef.current,
                  alert_config_id: configId
                };
                onSearch(updatedParams);
              }
            }}
          />
        )}
        {/* 告警类别过滤项 */}
        {table.getColumn("category") && (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="告警类别"
            options={categoryOptions}
            onSelect={(selectedValue) => {
              const categoryId = selectedValue && selectedValue.length > 0 ? parseInt(selectedValue[0]) : undefined;
              updateSearchParams("category_id", categoryId);
              if (onSearch) {
                const updatedParams = {
                  ...searchParamsRef.current,
                  category_id: categoryId
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
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setBatchProcessOpen(true)}
            >
              批量处理
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => setDeleteOpen(true)}
            >
              删除选中
            </Button>
          </>
        )}
        <DataTableViewOptions 
          table={table} 
          columnLabels={alertLogColumnLabels}
        />
        {handleOpenCreateDialog && (
          <Button
            size="sm"
            className="h-8"
            onClick={handleOpenCreateDialog}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            创建告警
          </Button>
        )}
      </div>

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const ids = table.getSelectedRowModel().rows.map(
            (row) => (row.original as AlertLog).id
          )
          deleteMutation.mutate(ids)
        }}
        title="确认删除"
        description={`确定要删除选中的 ${table.getSelectedRowModel().rows.length} 条告警日志吗？此操作不可恢复。`}
        isDeleting={deleteMutation.isPending}
      />
      
      {/* 告警处理对话框 */}
      <AlertProcessDialog
        open={batchProcessOpen}
        onOpenChange={setBatchProcessOpen}
        onConfirm={handleBatchProcess}
        statusOptions={statusOptions}
        rowCount={table.getSelectedRowModel().rows.length}
        isProcessing={processMutation.isPending}
      />
    </div>
  )
} 