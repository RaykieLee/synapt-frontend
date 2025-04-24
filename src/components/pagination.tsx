"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaginationProps {
  currentPage: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function Pagination({
  currentPage,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const [pages, setPages] = useState<Array<number | string>>([])
  
  const totalPages = Math.ceil(total / pageSize)
  
  useEffect(() => {
    const generatePagination = () => {
      if (totalPages <= 7) {
        // 如果总页数小于等于7，显示所有页码
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }
      
      // 否则，构建有省略号的分页
      if (currentPage <= 3) {
        // 当前页靠近开始
        return [1, 2, 3, 4, 5, "...", totalPages]
      } else if (currentPage >= totalPages - 2) {
        // 当前页靠近结尾
        return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
      } else {
        // 当前页在中间
        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
      }
    }
    
    setPages(generatePagination())
  }, [currentPage, totalPages])
  
  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return
    }
    onPageChange(page)
  }
  
  // 处理每页条数变化
  const handlePageSizeChange = (value: string) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(value))
    }
  }
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          共 {total} 条记录，每页显示
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="h-8 w-16">
            <SelectValue placeholder={pageSize.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">条</span>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">上一页</span>
        </Button>
        
        {pages.map((page, i) => (
          <div key={i}>
            {typeof page === "number" ? (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page)}
                disabled={page === currentPage}
              >
                {page}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">下一页</span>
        </Button>
      </div>
    </div>
  )
} 