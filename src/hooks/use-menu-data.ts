"use client"

import { useEffect, useState } from 'react'
import {
  Shield, 
  Users, 
  Settings, 
  List, 
  Menu as MenuIcon,
  Home,
  FileText,
  Layers,
  PieChart,
  Bell,
  ShieldAlert,
  Wrench,
  FolderTree,
  ListChecks,
  LayoutDashboard,
  Server,
  Database,
  Activity,
  Github,
  Info,
  Lock,
  Mail,
  MessageSquare,
  Search,
  CreditCard,
  Calendar
} from "lucide-react"

// 图标映射表
const iconMap: Record<string, any> = {
  'system': Shield,
  'user': Users,
  'role': Settings,
  'menu': MenuIcon,
  'home': Home,
  'settings': Settings,
  'users': Users,
  'file': FileText,
  'layers': Layers,
  'chart': PieChart,
  'bell': Bell,
  'shield': ShieldAlert,
  'wrench': Wrench,
  'folder': FolderTree,
  'list': ListChecks,
  'dashboard': LayoutDashboard,
  'server': Server,
  'database': Database,
  'activity': Activity,
  'github': Github,
  'info': Info,
  'lock': Lock,
  'mail': Mail,
  'message': MessageSquare,
  'search': Search,
  'card': CreditCard,
  'calendar': Calendar
}

// 从本地存储中获取用户信息
const getUserInfo = () => {
  if (typeof window === 'undefined') return null
  
  const userInfoString = localStorage.getItem('userInfo')
  if (!userInfoString) return null
  
  try {
    return JSON.parse(userInfoString)
  } catch (error) {
    console.error('Failed to parse user info:', error)
    return null
  }
}

// 菜单项接口
export interface MenuItem {
  title: string
  url: string
  icon?: any
  isActive?: boolean
  items?: SubMenuItem[]
}

// 子菜单项接口
export interface SubMenuItem {
  title: string
  url: string
  isActive?: boolean
}

// 处理后端返回的菜单数据，转换为sidebar需要的格式
const processMenuData = (menus: any[]) => {
  return menus.map(menu => {
    // 只处理类型为"M"(目录)的菜单
    if (menu.menu_type === 'M') {
      const subItems = menu.children
        ? menu.children
            .filter((subMenu: any) => subMenu.menu_type === 'C' && subMenu.status === '0' && subMenu.visible === '0')
            .map((subMenu: any) => ({
              title: subMenu.label,
              url: `/dashboard/${menu.path}/${subMenu.path}`,
              isActive: false
            }))
        : []

      return {
        title: menu.label,
        url: '#',
        icon: iconMap[menu.icon] || Shield,
        isActive: false,
        items: subItems
      }
    }
    return null
  }).filter(Boolean) as MenuItem[]
}

export function useMenuData() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userInfo = getUserInfo()
    
    if (userInfo && userInfo.menus) {
      const processedMenus = processMenuData(userInfo.menus)
      setMenuItems(processedMenus)
    } else {
      // 如果没有找到用户菜单数据，设置默认菜单
      setMenuItems([
        {
          title: "系统管理",
          url: "#",
          icon: Shield,
          items: [
            {
              title: "用户管理",
              url: "/dashboard/system/users",
            },
            {
              title: "角色管理",
              url: "/dashboard/system/roles",
            },
            {
              title: "菜单管理",
              url: "/dashboard/system/menus",
            },
          ],
        }
      ])
    }
    
    setLoading(false)
  }, [])

  return { menuItems, loading }
} 