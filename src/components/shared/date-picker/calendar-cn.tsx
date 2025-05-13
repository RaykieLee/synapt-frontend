"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useNavigation } from "react-day-picker"
import { zhCN } from "date-fns/locale"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export type CalendarCNProps = React.ComponentProps<typeof DayPicker>

// 自定义的月份导航组件
function CustomCaption(props: any) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation()
  const { displayMonth } = props

  const months = [
    "一月", "二月", "三月", "四月", "五月", "六月", 
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ]
  
  const years = Array.from({ length: 20 }, (_, i) => 
    new Date().getFullYear() - 10 + i
  )
  
  const handleMonthChange = (value: string) => {
    const newMonth = new Date(displayMonth)
    newMonth.setMonth(parseInt(value))
    goToMonth(newMonth)
  }
  
  const handleYearChange = (value: string) => {
    const newMonth = new Date(displayMonth)
    newMonth.setFullYear(parseInt(value))
    goToMonth(newMonth)
  }
  
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex space-x-1">
        <Select 
          value={displayMonth.getMonth().toString()} 
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="h-8 w-[85px] text-xs border-none shadow-none focus:ring-0 bg-transparent">
            <SelectValue placeholder={months[displayMonth.getMonth()]} />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, i) => (
              <SelectItem key={i} value={i.toString()} className="text-xs">
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={displayMonth.getFullYear().toString()} 
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="h-8 w-[70px] text-xs border-none shadow-none focus:ring-0 bg-transparent">
            <SelectValue placeholder={displayMonth.getFullYear().toString()} />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()} className="text-xs">
                {year}年
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// 自定义星期格式化函数，去掉"周"字
function formatWeekdayName(date: Date) {
  const weekday = format(date, 'E', { locale: zhCN });
  return weekday.charAt(weekday.length - 1); // 只返回最后一个字符，即"一"、"二"等
}

function CalendarCN({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarCNProps) {
  // 确保日期选择器在点击时能够正确响应
  const handleDayClick = React.useCallback((day: Date) => {
    console.log("日期点击:", day);
    // 这里不需要特殊处理，只是用于调试
  }, []);

  return (
    <DayPicker
      locale={zhCN}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      onDayClick={handleDayClick}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden", // 隐藏原始标签，使用我们的自定义组件
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption
      }}
      formatters={{
        formatWeekdayName,
        formatCaption: () => '', // 我们使用自定义的Caption组件
      }}
      {...props}
    />
  )
}
CalendarCN.displayName = "CalendarCN"

export { CalendarCN }