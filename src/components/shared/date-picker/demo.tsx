"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { DatePicker } from "./date-picker"

export function DatePickerDemo() {
  const [date, setDate] = useState<Date>()

  return (
    <div className="flex flex-col space-y-4 p-4">
      <h2 className="text-lg font-medium">日期选择器示例</h2>
      
      <div className="grid gap-4 max-w-sm">
        <DatePicker
          date={date}
          setDate={setDate}
          placeholder="请选择日期"
        />

        <div className="p-4 border rounded-md bg-muted/20">
          <p>已选择日期: {date ? format(date, 'yyyy年MM月dd日 (EEEE)', { locale: zhCN }) : '未选择'}</p>
        </div>
      </div>
    </div>
  )
}

export default DatePickerDemo 