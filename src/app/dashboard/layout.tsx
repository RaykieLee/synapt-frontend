"use client";

import React, { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { isLoggedIn } from "@/services/auth"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface BreadcrumbItem {
  title: string;
  link?: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  
  // 认证检查
  useEffect(() => {
    // 使用服务中的isLoggedIn函数检查登录状态
    const loggedIn = isLoggedIn()
    setIsAuthenticated(loggedIn)
    
    if (!loggedIn) {
      // 使用Next.js的router进行客户端导航
      router.push('/login')
    }
  }, [router])
  
  // 根据路径生成面包屑
  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    
    // 移除 'dashboard' 前缀
    if (pathSegments[0] === 'dashboard') {
      pathSegments.shift()
    }
    
    const newBreadcrumbs = pathSegments.map((segment, index) => {
      // 将短横线命名转换为空格分隔的标题形式
      const title = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // 生成链接（除最后一个项目）
      const link = index < pathSegments.length - 1 
        ? `/dashboard/${pathSegments.slice(0, index + 1).join('/')}`
        : undefined
        
      return { title, link } as BreadcrumbItem
    })
    
    // 设置默认首页
    if (newBreadcrumbs.length === 0) {
      newBreadcrumbs.push({ title: 'Dashboard' })
    }
    
    setBreadcrumbs(newBreadcrumbs)
  }, [pathname])
  
  // 如果未认证，显示加载中
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">正在验证身份...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <Breadcrumb />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 