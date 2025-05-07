import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  disabled?: boolean;
  showSizeChanger?: boolean;
}

export function Pagination({
  current,
  pageSize,
  total,
  onChange,
  onPageSizeChange,
  disabled = false,
  showSizeChanger = false,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  // 生成页码数组
  const generatePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 总页数少于最大可见页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数大于最大可见页数，需要省略部分页码
      if (current <= 3) {
        // 当前页靠近开始
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        // 当前页靠近结束
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push("ellipsis");
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pages = generatePages();

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        共 {total} 条记录，当前第 {current}/{totalPages} 页
      </div>
      
      <div className="flex items-center space-x-2">
        {showSizeChanger && (
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange?.(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
              <SelectItem value="100">100条/页</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChange(current - 1)}
          disabled={disabled || current <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">上一页</span>
        </Button>
        
        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <Button
                key={`ellipsis-${index}`}
                variant="outline"
                size="icon"
                disabled
              >
                ...
              </Button>
            );
          }
          
          return (
            <Button
              key={page}
              variant={current === page ? "default" : "outline"}
              size="icon"
              onClick={() => onChange(page as number)}
              disabled={disabled}
            >
              {page}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChange(current + 1)}
          disabled={disabled || current >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">下一页</span>
        </Button>
      </div>
    </div>
  );
} 