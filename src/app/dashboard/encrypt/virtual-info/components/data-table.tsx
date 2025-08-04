"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
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

import { Skeleton } from "@/components/ui/skeleton"

import { VirtualInfo } from "@/types/encrypt"

interface DataTableProps {
  columns: ColumnDef<VirtualInfo>[]
  data: VirtualInfo[]
  pagination?: {
    pageIndex: number
    pageSize: number
    total: number
    onPageChange: (page: number, pageSize: number) => void
  }
  loading?: boolean
  onSortingChange?: (sorting: SortingState) => void
  onRowSelectionChange?: (selectedRows: VirtualInfo[]) => void
  selectedRows?: VirtualInfo[]
  toolbar?: (table: any) => React.ReactNode
}

export function DataTable({
  columns,
  data,
  pagination,
  loading = false,
  onSortingChange,
  onRowSelectionChange,
  selectedRows = [],
  toolbar,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    city: false, // 地址列默认不显示
  })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  // 同步选中状态
  React.useEffect(() => {
    const selection: Record<string, boolean> = {}
    selectedRows.forEach((row, index) => {
      const dataIndex = data.findIndex(item => item.id === row.id)
      if (dataIndex !== -1) {
        selection[dataIndex.toString()] = true
      }
    })
    setRowSelection(selection)
  }, [selectedRows, data])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      
      // 转换为后端期望的格式
      const sorts = newSorting.map(sort => ({
        field: sort.id,
        order: sort.desc ? 'desc' as const : 'asc' as const
      }))
      onSortingChange?.(newSorting)
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      
      // 获取选中的行数据
      const selectedRowData = Object.keys(newSelection)
        .filter(key => newSelection[key])
        .map(key => data[parseInt(key)])
        .filter(Boolean)
      
      onRowSelectionChange?.(selectedRowData)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // 禁用内置分页，使用服务端分页
    manualPagination: !!pagination,
    manualSorting: !!onSortingChange,
  })

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      {toolbar && toolbar(table)}

      {/* 表格 */}
      <div className="rounded-md border min-h-[520px]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {loading ? (
              // 加载骨架屏 - 显示10行
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex} className="h-12">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-12"
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[480px] text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            已选择 {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} 行
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">每页显示</p>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  pagination.onPageChange(1, Number(e.target.value))
                }}
                className="h-8 w-[70px] rounded border px-3 py-1 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              第 {pagination.pageIndex + 1} 页，共 {Math.ceil(pagination.total / pagination.pageSize)} 页
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onPageChange(1, pagination.pageSize)}
                disabled={pagination.pageIndex === 0}
                className="h-8 w-8 rounded border p-0 disabled:opacity-50"
              >
                {'<<'}
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.pageIndex, pagination.pageSize)}
                disabled={pagination.pageIndex === 0}
                className="h-8 w-8 rounded border p-0 disabled:opacity-50"
              >
                {'<'}
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.pageIndex + 2, pagination.pageSize)}
                disabled={pagination.pageIndex >= Math.ceil(pagination.total / pagination.pageSize) - 1}
                className="h-8 w-8 rounded border p-0 disabled:opacity-50"
              >
                {'>'}
              </button>
              <button
                onClick={() => pagination.onPageChange(Math.ceil(pagination.total / pagination.pageSize), pagination.pageSize)}
                disabled={pagination.pageIndex >= Math.ceil(pagination.total / pagination.pageSize) - 1}
                className="h-8 w-8 rounded border p-0 disabled:opacity-50"
              >
                {'>>'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 