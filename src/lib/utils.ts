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
