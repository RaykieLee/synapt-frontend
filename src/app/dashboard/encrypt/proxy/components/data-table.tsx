"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import debounce from "lodash/debounce"

import { ProxyEntity, ProxySearchParams } from "@/types/encrypt/proxy"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination, DataTableViewOptions, DeleteConfirmationDialog } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { X, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface DataTableProps {
  columns: ColumnDef<ProxyEntity>[]
  data: ProxyEntity[]
  total: number
  page_num: number
  page_size: number
  sorting: SortingState
  loading?: boolean
  onSearch: (params: ProxySearchParams) => void
  onPaginationChange: (page_num: number, page_size: number) => void
  onSortingChange: (sorting: SortingState) => void
  onBatchDelete: (selectedIds: string[]) => void
}

export function DataTable({
  columns,
  data,
  total,
  page_num,
  page_size,
  sorting,
  loading,
  onSearch,
  onPaginationChange,
  onSortingChange,
  onBatchDelete,
}: DataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  
  const searchParamsRef = useRef<ProxySearchParams>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updaterOrValue) => {
      const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue
      onSortingChange(newSorting)
    },
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: page_num - 1, // tanstack table uses 0-based indexing
        pageSize: page_size,
      },
    },
    pageCount: Math.ceil(total / page_size),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  })

  // 防抖搜索
  const debouncedSearch = useMemo(() => 
    debounce(() => {
      if (onSearch) onSearch(searchParamsRef.current)
    }, 500), [onSearch]
  )

  const updateSearchParams = useCallback((key: string, value: string | undefined | boolean) => {
    searchParamsRef.current = {
      ...searchParamsRef.current,
      [key]: value || undefined
    }
    debouncedSearch()
  }, [debouncedSearch])

  // 检查是否有筛选条件
  const isFiltered = table.getState().columnFilters.length > 0

  // 重置筛选
  const resetFilters = () => {
    table.resetColumnFilters()
    searchParamsRef.current = {}
    if (onSearch) onSearch({})
  }

  // 计算高级筛选器数量
  const getActiveFiltersCount = () => {
    const filters = table.getState().columnFilters
    const excludeColumns = ["host", "proxy_type"] // 排除主要搜索字段
    return filters.filter(filter => 
      !excludeColumns.includes(filter.id) && filter.value
    ).length
  }

  const clearAdvancedFilters = () => {
    const currentFilters = table.getState().columnFilters
    const mainFilters = currentFilters.filter(filter => 
      ["host", "proxy_type"].includes(filter.id)
    )
    table.setColumnFilters(mainFilters)
    
    // 清除高级筛选的搜索参数
    const { host, proxy_type, search_mode } = searchParamsRef.current
    searchParamsRef.current = { host, proxy_type, search_mode }
    debouncedSearch()
  }

  const selectedCount = table.getSelectedRowModel().rows.length

  // 如果是加载状态，显示骨架屏
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-8 w-[120px]" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
        <div className="rounded-md border min-h-[520px]">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index} className="h-12">
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="h-12">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {/* 主机地址搜索 */}
          <Input
            placeholder="搜索主机地址..."
            value={(table.getColumn("host")?.getFilterValue() as string) ?? ""}
            onChange={(e) => {
              table.getColumn("host")?.setFilterValue(e.target.value)
              updateSearchParams("host", e.target.value)
            }}
            className="max-w-sm"
          />
          
          {/* 代理类型筛选 */}
          <Select
            value={(table.getColumn("proxy_type")?.getFilterValue() as string) || "all"}
            onValueChange={(value) => {
              const filterValue = value === "all" ? "" : value
              table.getColumn("proxy_type")?.setFilterValue(filterValue)
              updateSearchParams("proxy_type", value === "all" ? undefined : value)
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="http">HTTP</SelectItem>
              <SelectItem value="https">HTTPS</SelectItem>
              <SelectItem value="socks4">SOCKS4</SelectItem>
              <SelectItem value="socks5">SOCKS5</SelectItem>
            </SelectContent>
          </Select>

          {/* 更多筛选 */}
          <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed relative">
                <Filter className="mr-2 h-4 w-4" />
                更多筛选
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">高级筛选</h4>
                  <Button variant="ghost" size="sm" onClick={clearAdvancedFilters}>
                    清除
                  </Button>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-3">
                  {/* 用户名搜索 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">用户名</label>
                    <Input
                      placeholder="搜索用户名..."
                      value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
                      onChange={(e) => {
                        table.getColumn("username")?.setFilterValue(e.target.value)
                        updateSearchParams("username", e.target.value)
                      }}
                    />
                  </div>

                  {/* 分组搜索 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">分组</label>
                    <Input
                      placeholder="搜索分组..."
                      value={(table.getColumn("group")?.getFilterValue() as string) ?? ""}
                      onChange={(e) => {
                        table.getColumn("group")?.setFilterValue(e.target.value)
                        updateSearchParams("group", e.target.value)
                      }}
                    />
                  </div>

                  {/* 状态筛选 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">状态</label>
                    <Select
                      value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
                      onValueChange={(value) => {
                        const filterValue = value === "all" ? "" : value
                        table.getColumn("status")?.setFilterValue(filterValue)
                        updateSearchParams("status", value === "all" ? undefined : value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="normal">正常</SelectItem>
                        <SelectItem value="error">异常</SelectItem>
                        <SelectItem value="unknown">未知</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 激活状态筛选 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">激活状态</label>
                    <Select
                      value={(table.getColumn("is_active")?.getFilterValue() as string) || "all"}
                      onValueChange={(value) => {
                        const filterValue = value === "all" ? "" : value
                        table.getColumn("is_active")?.setFilterValue(filterValue)
                        updateSearchParams("is_active", 
                          value === "all" ? undefined : value === "true"
                        )
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="true">激活</SelectItem>
                        <SelectItem value="false">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {getActiveFiltersCount() > 0 ? 
                      `已应用 ${getActiveFiltersCount()} 个筛选条件` : 
                      "未应用筛选条件"
                    }
                  </p>
                  <Button size="sm" onClick={() => setMoreFiltersOpen(false)}>
                    完成
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

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
          {/* 批量删除 */}
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              删除选中 ({selectedCount})
            </Button>
          )}
          
          {/* 显示列选择 */}
          <DataTableViewOptions 
            table={table} 
            columnLabels={{
              proxy_type: "代理类型",
              host: "主机地址",
              port: "端口",
              username: "用户名",
              group: "分组",
              status: "状态",
              is_active: "激活状态",
              last_check: "最后检测",
              create_time: "创建时间"
            }}
          />
        </div>
      </div>

      {/* 表格 */}
      <div className="rounded-md border min-h-[520px]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-12"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="h-12">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <DataTablePagination
        table={table}
        onPageChange={(page) => onPaginationChange(page, page_size)}
      />

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          const selectedIds = table.getSelectedRowModel().rows.map(
            (row) => (row.original as ProxyEntity).id
          )
          onBatchDelete(selectedIds)
          setDeleteOpen(false)
          table.resetRowSelection()
        }}
        title="批量删除代理"
        description={`确定要删除选中的 ${selectedCount} 个代理吗？此操作无法撤销。`}
      />
    </div>
  )
} 