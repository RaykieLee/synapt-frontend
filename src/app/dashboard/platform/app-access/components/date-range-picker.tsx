"use client"

import * as React from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { zhCN } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CalendarCN } from "@/components/shared/date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps {
  className?: string
  value?: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  placeholder?: string
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
}

export function DateRangePicker({
  className,
  value,
  onChange,
  placeholder = "选择日期范围",
  align = "start",
  side = "bottom",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // 快速选择的预设选项
  const selectPreset = (preset: string) => {
    const now = new Date()
    let date: DateRange
    
    switch (preset) {
      case "today":
        date = {
          from: now,
          to: now,
        }
        break
      case "yesterday":
        const yesterday = addDays(now, -1)
        date = {
          from: yesterday,
          to: yesterday,
        }
        break
      case "7days":
        date = {
          from: addDays(now, -7),
          to: now,
        }
        break
      case "30days":
        date = {
          from: addDays(now, -30),
          to: now,
        }
        break
      case "90days":
        date = {
          from: addDays(now, -90),
          to: now,
        }
        break
      case "thisMonth":
        date = {
          from: startOfMonth(now),
          to: endOfMonth(now),
        }
        break
      case "lastMonth":
        const lastMonth = addDays(startOfMonth(now), -1)
        date = {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        }
        break
      case "thisYear":
        date = {
          from: startOfYear(now),
          to: endOfYear(now),
        }
        break
      default:
        return
    }
    
    onChange(date)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "h-8 w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "yyyy年MM月dd日", { locale: zhCN })} ~{" "}
                  {format(value.to, "yyyy年MM月dd日", { locale: zhCN })}
                </>
              ) : (
                format(value.from, "yyyy年MM月dd日", { locale: zhCN })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align={align}
          side={side}
        >
          <div className="p-2 border-b">
            <Select
              onValueChange={(value) => selectPreset(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="快速选择..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="yesterday">昨天</SelectItem>
                <SelectItem value="7days">最近 7 天</SelectItem>
                <SelectItem value="30days">最近 30 天</SelectItem>
                <SelectItem value="90days">最近 90 天</SelectItem>
                <SelectItem value="thisMonth">本月</SelectItem>
                <SelectItem value="lastMonth">上月</SelectItem>
                <SelectItem value="thisYear">今年</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-3">
            <CalendarCN
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t p-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onChange(undefined)
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
        </PopoverContent>
      </Popover>
    </div>
  )
} 