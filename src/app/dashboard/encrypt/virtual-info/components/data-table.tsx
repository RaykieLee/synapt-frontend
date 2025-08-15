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
import { DataTablePagination } from "@/components/shared/data-table"

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
        <DataTablePagination
          table={table}
          onPageChange={(page) => pagination.onPageChange(page, pagination.pageSize)}
        />
      )}
    </div>
  )
} 