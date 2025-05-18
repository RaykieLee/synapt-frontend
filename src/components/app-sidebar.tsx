"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  Shield,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useMenuData } from "@/hooks/use-menu-data"
import { useEffect, useState } from "react"

// 获取用户信息
const getUserInfo = () => {
  if (typeof window === 'undefined') return null
  
  const userInfoString = localStorage.getItem('userInfo')
  if (!userInfoString) return null
  
  try {
    const userInfo = JSON.parse(userInfoString)
    return {
      name: userInfo.nickName || userInfo.userName || "用户",
      email: userInfo.email || "",
      avatar: userInfo.avatar || "/avatars/user.png",
    }
  } catch (error) {
    console.error('Failed to parse user info:', error)
    return null
  }
}

// 默认团队数据
const defaultTeams = [
  {
    name: "顺畅人工智能平台",
    logo: GalleryVerticalEnd,
    plan: "人工智能团队",
  }
]

// 默认项目数据
const defaultProjects = [
  {
    name: "应用开发",
    url: "#",
    icon: Frame,
  },
  {
    name: "分析报表",
    url: "#",
    icon: PieChart,
  },
  {
    name: "文档中心",
    url: "#",
    icon: Map,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 使用自定义hook获取菜单数据
  const { menuItems, loading } = useMenuData()
  const [user, setUser] = useState({ name: "加载中...", email: "", avatar: "/avatars/user.png" })
  
  useEffect(() => {
    const userInfo = getUserInfo()
    if (userInfo) {
      setUser(userInfo)
    }
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={defaultTeams} />
      </SidebarHeader>
      <SidebarContent>
        {/* 使用动态加载的菜单数据 */}
        <NavMain items={menuItems} />
        <NavProjects projects={defaultProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
