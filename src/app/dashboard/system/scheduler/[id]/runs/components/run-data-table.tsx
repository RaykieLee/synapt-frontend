"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "@/components/shared/data-table"
import { RunDataTableToolbar } from "./run-data-table-toolbar"
import { Skeleton } from "@/components/ui/skeleton"
import { PipelineRunSearchParams } from "@/types/scheduler"

interface RunDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onSearch?: (params: PipelineRunSearchParams) => void
  onSortingChange?: (sorting: SortingState) => void
  isLoading?: boolean
  columnLabels?: Record<string, string>
  minHeight?: string
  defaultPipelineId?: string // 新增：默认的管道ID过滤条件
}

export function RunDataTable<TData extends object, TValue>({
  columns,
  data,
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onSearch,
  onSortingChange,
  isLoading = false,
  columnLabels,
  minHeight = "400px",
  defaultPipelineId,
}: RunDataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  // 处理排序变化
  React.useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // 启用手动模式，表示这些操作由外部控制
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    pageCount: pageCount,
  })

  // 当页面变化时调用外部传入的回调
  const currentPageIndex = table.getState().pagination.pageIndex;
  React.useEffect(() => {
    // 添加条件判断，防止无限循环
    // 确保只有在表格内部的 pageIndex 确实发生变化，并且与父组件传入的 pageIndex 不同时才调用 onPageChange
    if (onPageChange && table.getState().pagination.pageIndex !== pageIndex) { 
      onPageChange(currentPageIndex + 1); // 转换为1-based索引传给外部
    }
  }, [currentPageIndex, onPageChange, pageIndex, table]);
  
  // 单独处理onPageChange的变化
  React.useEffect(() => {
    // 仅在onPageChange变化时重置组件状态
    if (onPageChange) {
      setRowSelection({})
    }
  }, [onPageChange])

  // 生成骨架屏行
  const renderSkeletonRows = () => {
    // 生成与pageSize相同数量的骨架行
    return Array(pageSize)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {columns.map((column, columnIndex) => (
            <TableCell key={`skeleton-cell-${columnIndex}`}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))
  }

  // 生成空白填充行以保持表格高度
  const renderEmptyRows = () => {
    if (!data.length) return null;
    
    // 计算需要填充的行数
    const filledRowCount = Math.min(data.length, pageSize);
    const emptyRowCount = pageSize - filledRowCount;
    
    if (emptyRowCount <= 0) return null;
    
    return Array(emptyRowCount)
      .fill(0)
      .map((_, index) => (
        <TableRow 
          key={`empty-${index}`} 
          className="h-[41px] border-0"
        >
          {columns.map((column, columnIndex) => (
            <TableCell 
              key={`empty-cell-${columnIndex}`}
              className="border-0"
            >
              &nbsp;
            </TableCell>
          ))}
        </TableRow>
      ));
  };

  // 判断是否有实际数据
  const hasRealData = !isLoading && table.getRowModel().rows?.length > 0;

  return (
    <div className="space-y-4">
      <RunDataTableToolbar 
        table={table} 
        onSearch={onSearch} 
        columnLabels={columnLabels}
        defaultPipelineId={defaultPipelineId}
      />
      <div className={`rounded-md ${hasRealData ? 'border' : 'border-t border-l border-r'}`}>
        <div style={{ minHeight }}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
            <TableBody className={!hasRealData ? 'border-0' : undefined}>
              {isLoading ? (
                // 显示骨架屏
                renderSkeletonRows()
              ) : table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {renderEmptyRows()}
                </>
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="h-24 text-center text-muted-foreground"
                  >
                    暂无运行记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <DataTablePagination
        table={table}
        onPageChange={(page) => {
          // 手动分页时需要手动设置table状态
          table.setPageIndex(page - 1);
          if (onPageChange) {
            onPageChange(page);
          }
        }}
      />
    </div>
  )
} 