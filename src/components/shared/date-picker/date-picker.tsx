"use client"

import * as React from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarCN } from "./calendar-cn"

export interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = "选择日期",
  disabled = false
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy年MM月dd日", { locale: zhCN }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarCN
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
        <div className="flex items-center justify-between p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDate(new Date())
              setOpen(false)
            }}
          >
            今天
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => {
                setDate(undefined)
                setOpen(false)
              }}
            >
              清除
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setOpen(false)
              }}
            >
              确定
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker 