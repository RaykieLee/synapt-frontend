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
  Calendar,
  ScanFace
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
  isExternal?: boolean
}

// 子菜单项接口
export interface SubMenuItem {
  title: string
  url: string
  isActive?: boolean
  children?: SubMenuItem[]  // 添加children字段支持多级菜单
  isExternal?: boolean
}

// 处理后端返回的菜单数据，转换为sidebar需要的格式
const processMenuData = (menus: any[]) => {
  // 检查是否为外部链接的辅助函数
  const isExternalUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // 递归处理菜单及其子菜单
  const processMenu = (menu: any, parentPath: string = ''): MenuItem | null => {
    // 只处理类型为"M"(目录)或"C"(菜单)的菜单
    if (menu.menu_type === 'M' || menu.menu_type === 'C') {
      // 检查是否为外部链接
      const isExternal = menu.path && isExternalUrl(menu.path);
      
      // 构建当前菜单的路径 - 如果是外部链接则直接使用
      const currentPath = isExternal 
        ? menu.path
        : parentPath 
          ? `${parentPath}/${menu.path}` 
          : menu.path;
      
      // 处理子菜单
      const subItems: SubMenuItem[] = [];
      
      if (menu.children && menu.children.length > 0) {
        // 过滤符合条件的子菜单
        menu.children
          .filter((subMenu: any) => 
            (subMenu.menu_type === 'C' || subMenu.menu_type === 'M') && 
            subMenu.status === '0' && 
            subMenu.visible === '0'
          )
          .forEach((subMenu: any) => {
            // 检查子菜单是否为外部链接
            const isSubExternal = subMenu.path && isExternalUrl(subMenu.path);
            
            // 无论是菜单还是目录，都直接添加为子项
            subItems.push({
              title: subMenu.label,
              url: subMenu.menu_type === 'M' 
                ? '#' // 目录类型使用#作为URL
                : isSubExternal 
                  ? subMenu.path // 外部链接直接使用
                  : `/dashboard/${currentPath}/${subMenu.path}`, // 菜单类型使用实际路径
              isActive: false,
              isExternal: isSubExternal, // 标记是否为外部链接
              // 如果是目录类型，并且有子项，递归处理子项
              ...(subMenu.menu_type === 'M' && subMenu.children && subMenu.children.length > 0
                ? { 
                    children: processMenu(subMenu, isExternal ? '' : currentPath)?.items || [] 
                  }
                : {})
            });
          });
      }
      
      return {
        title: menu.label,
        url: menu.menu_type === 'M' 
          ? '#' 
          : isExternal 
            ? menu.path // 外部链接直接使用
            : `/dashboard/${currentPath}`,
        icon: iconMap[menu.icon] || Shield,
        isActive: false,
        isExternal: isExternal, // 标记是否为外部链接
        items: subItems
      };
    }
    
    return null;
  };
  
  // 处理顶层菜单
  return menus
    .map(menu => processMenu(menu))
    .filter(Boolean) as MenuItem[];
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