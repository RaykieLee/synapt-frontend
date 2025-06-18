"use client"

import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  onPageChange?: (page: number) => void
}

export function DataTablePagination<TData>({
  table,
  onPageChange,
}: DataTablePaginationProps<TData>) {
  const isServerPagination = !!onPageChange
  const pageSize = table.getState().pagination.pageSize
  const pageIndex = table.getState().pagination.pageIndex
  
  // 使用本地状态存储选择的大小，避免与table状态直接交互
  const [selectedSize, setSelectedSize] = useState<string>(String(pageSize))
  
  // 当pageSize变化时更新本地状态
  useEffect(() => {
    setSelectedSize(String(pageSize))
  }, [pageSize])
  
  // 处理pageSize变化
  const handlePageSizeChange = (value: string) => {
    setSelectedSize(value)
    table.setPageSize(Number(value))
  }
  
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} 项已选择，
        共 {table.getFilteredRowModel().rows.length} 项
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">每页行数</p>
          <Select
            value={selectedSize}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue>{selectedSize}</SelectValue>
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[140px] items-center justify-center text-sm font-medium">
          第 {pageIndex + 1} 页，
          共 {isServerPagination 
              ? table.getPageCount() 
              : Math.ceil(table.getFilteredRowModel().rows.length / pageSize)
            } 页
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              if (isServerPagination && onPageChange) {
                onPageChange(1)
              } else {
                table.setPageIndex(0)
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">跳到第一页</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (isServerPagination && onPageChange) {
                onPageChange(pageIndex)  // pageIndex 是 0-based，转换为 1-based 需要 pageIndex + 1 - 1 = pageIndex
              } else {
                table.previousPage()
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">上一页</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (isServerPagination && onPageChange) {
                onPageChange(pageIndex + 2)  // pageIndex 是 0-based，下一页是 pageIndex + 1 + 1 = pageIndex + 2
              } else {
                table.nextPage()
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">下一页</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              if (isServerPagination && onPageChange) {
                onPageChange(table.getPageCount())
              } else {
                table.setPageIndex(table.getPageCount() - 1)
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">跳到最后一页</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 