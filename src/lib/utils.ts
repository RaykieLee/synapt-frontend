import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: Date | string | null | undefined, formatStr: string = "yyyy-MM-dd HH:mm:ss"): string {
  if (!date) return "-"
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, formatStr, { locale: zhCN })
  } catch (error) {
    console.error("日期格式化错误:", error)
    return "-"
  }
}

export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M'
  return (num / 1000000000).toFixed(1) + 'B'
}
