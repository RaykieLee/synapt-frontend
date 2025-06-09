"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ServerPaginationProps {
  currentPage: number
  pageSize: number
  total: number
  selectedCount?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export function ServerPagination({
  currentPage,
  pageSize,
  total,
  selectedCount = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: ServerPaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value)
    onPageSizeChange?.(newPageSize)
    
    // 如果当前页码超出了新的总页数，调整到最后一页
    const newTotalPages = Math.ceil(total / newPageSize)
    if (currentPage > newTotalPages && newTotalPages > 0) {
      onPageChange(newTotalPages)
    }
  }

  const handleFirstPage = () => {
    if (canPreviousPage) {
      onPageChange(1)
    }
  }

  const handlePreviousPage = () => {
    if (canPreviousPage) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (canNextPage) {
      onPageChange(currentPage + 1)
    }
  }

  const handleLastPage = () => {
    if (canNextPage && totalPages > 0) {
      onPageChange(totalPages)
    }
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedCount > 0 && `${selectedCount} 项已选择，`}
        共 {total} 项
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">每页行数</p>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue>{pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex w-[120px] items-center justify-center text-sm font-medium">
          第 {currentPage} 页，共 {totalPages} 页
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">跳到第一页</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">上一页</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">下一页</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">跳到最后一页</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 