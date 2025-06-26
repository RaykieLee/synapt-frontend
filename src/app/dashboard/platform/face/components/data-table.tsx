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
import { DataTableToolbar } from "./data-table-toolbar"
import { Skeleton } from "@/components/ui/skeleton"
import { FaceLibrarySearchParams } from "@/types/face"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onSearch?: (params: FaceLibrarySearchParams) => void
  onSortingChange?: (sorting: SortingState) => void
  isLoading?: boolean
  columnLabels?: Record<string, string>
  minHeight?: string
}

export function DataTable<TData extends object, TValue>({
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
  minHeight = "650px",
}: DataTableProps<TData, TValue>) {
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
    if (onPageChange && table.getState().pagination.pageIndex !== pageIndex) { 
      onPageChange(currentPageIndex + 1); // 转换为1-based索引传给外部
    }
  }, [currentPageIndex, onPageChange, pageIndex, table]);
  
  // 单独处理onPageChange的变化
  React.useEffect(() => {
    if (onPageChange) {
      setRowSelection({})
    }
  }, [onPageChange])

  // 生成骨架屏行
  const renderSkeletonRows = () => {
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
      <DataTableToolbar 
        table={table} 
        onSearch={onSearch} 
        columnLabels={columnLabels}
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
                    className="h-24 text-center"
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination 
        table={table} 
        onPageChange={onPageChange}
      />
    </div>
  )
} 