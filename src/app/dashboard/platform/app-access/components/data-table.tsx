"use client"

import { useState } from "react"

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
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
import { AppAccessSearchParams } from "@/types/app"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount: number
  pageIndex?: number
  pageSize?: number
  isLoading?: boolean
  onPageChange?: (page: number) => void
  onSortingChange?: (sorting: SortingState) => void
  onSearch?: (params: AppAccessSearchParams) => void
  columnLabels?: Record<string, string>
  minHeight?: string
  onCreateClick?: () => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  isLoading = false,
  onPageChange,
  onSortingChange,
  onSearch,
  columnLabels,
  minHeight = "400px",
  onCreateClick,
}: DataTableProps<TData, TValue>) {
  // 排序状态
  const [sorting, setSorting] = useState<SortingState>([])
  // 列筛选状态
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // 列显示状态
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  // 行选择状态
  const [rowSelection, setRowSelection] = useState({})

  // 表格实例
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (newSorting) => {
      setSorting(newSorting)
      if (onSortingChange) {
        onSortingChange(newSorting as SortingState)
      }
    },
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    pageCount,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar 
        table={table} 
        onSearch={onSearch} 
        columnLabels={columnLabels}
        onCreateClick={onCreateClick}
      />
      <div className={`rounded-md border ${isLoading ? 'opacity-60' : ''}`} style={{ minHeight }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell colSpan={columns.length} className="h-16">
                    <div className="h-4 bg-muted/40 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
      <DataTablePagination
        table={table}
        onPageChange={onPageChange}
      />
    </div>
  )
} 