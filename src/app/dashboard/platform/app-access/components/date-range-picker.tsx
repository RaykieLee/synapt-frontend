"use client"

import * as React from "react"
import { addDays, format, subDays } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
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
  
  // 预设日期范围选项
  const presets = [
    {
      name: "今天",
      getValue: () => ({
        from: new Date(),
        to: new Date(),
      }),
    },
    {
      name: "昨天",
      getValue: () => ({
        from: subDays(new Date(), 1),
        to: subDays(new Date(), 1),
      }),
    },
    {
      name: "最近7天",
      getValue: () => ({
        from: subDays(new Date(), 6),
        to: new Date(),
      }),
    },
    {
      name: "最近30天",
      getValue: () => ({
        from: subDays(new Date(), 29),
        to: new Date(),
      }),
    },
    {
      name: "本月",
      getValue: () => {
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return {
          from: startOfMonth,
          to: today,
        }
      },
    },
  ]

  // 选择预设日期范围
  const selectPreset = (preset: typeof presets[number]) => {
    const newValue = preset.getValue()
    onChange(newValue)
  }
  
  // 清除选择
  const handleClear = () => {
    onChange(undefined)
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
              "h-10 min-w-[300px] justify-start text-left font-normal border-border shadow-sm",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "yyyy年MM月dd日", { locale: zhCN })} -{" "}
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
        <PopoverContent className="w-auto p-0" align={align} side={side}>
          <div className="flex flex-col space-y-4 p-3">
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(value) => {
                  const preset = presets.find((preset) => preset.name === value)
                  if (preset) {
                    selectPreset(preset)
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="选择快捷日期" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">清除</span>
              </Button>
            </div>
            <div className="rounded-md border">
              <CalendarCN
                mode="range"
                defaultMonth={value?.from}
                selected={value}
                onSelect={onChange}
                numberOfMonths={2}
                initialFocus
                fixedWeeks
                locale={zhCN}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 