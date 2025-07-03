"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
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
import { DataTableToolbar } from "./data-table-toolbar"
import { ProjectManagement, ProjectManagementSearchParams } from "@/types/encrypt/project-management"

interface DataTableProps {
  columns: ColumnDef<ProjectManagement>[]
  data: ProjectManagement[]
  searchParams: ProjectManagementSearchParams
  onSearchParamsChange: (params: ProjectManagementSearchParams) => void
  selectedRows: string[]
  onSelectedRowsChange: (ids: string[]) => void
  onBatchDelete: () => void
  onAddNew: () => void
  isLoading?: boolean
  pagination: {
    page_num: number
    page_size: number
    total: number
    pages: number
  }
}

export function DataTable({
  columns,
  data,
  searchParams,
  onSearchParamsChange,
  selectedRows,
  onSelectedRowsChange,
  onBatchDelete,
  onAddNew,
  isLoading = false,
  pagination,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})

  // 同步外部选中状态到内部状态
  React.useEffect(() => {
    const newRowSelection: Record<string, boolean> = {}
    selectedRows.forEach(id => {
      const rowIndex = data.findIndex(item => item.id === id)
      if (rowIndex !== -1) {
        newRowSelection[rowIndex] = true
      }
    })
    setRowSelection(newRowSelection)
  }, [selectedRows, data])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      
      // 将选中的行索引转换为ID数组
      const selectedIds = Object.keys(newSelection)
        .filter(key => newSelection[key])
        .map(key => data[parseInt(key)]?.id)
        .filter(Boolean)
      
      onSelectedRowsChange(selectedIds)
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <DataTableToolbar
        table={table}
        searchParams={searchParams}
        onSearchParamsChange={onSearchParamsChange}
        selectedCount={selectedRows.length}
        onBatchDelete={onBatchDelete}
        onAddNew={onAddNew}
      />

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
            {isLoading ? (
              // 加载状态 - 显示10行骨架屏
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="h-12">
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} className="h-12">
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

      {/* 分页信息 */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          共 {pagination.total} 条记录，第 {pagination.page_num} / {pagination.pages} 页
        </div>
        <div className="flex items-center space-x-2">
          {selectedRows.length > 0 && (
            <div className="text-sm text-muted-foreground">
              已选择 {selectedRows.length} 项
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 