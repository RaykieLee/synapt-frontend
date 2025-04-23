"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// 定义菜单类型
interface SubMenuItemType {
  title: string
  url: string
  isActive?: boolean
  children?: SubMenuItemType[]
  isExternal?: boolean
}

interface MenuItemType {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: SubMenuItemType[]
  isExternal?: boolean
}

// 嵌套子菜单项容器 - 使用div而不是li
const NestedMenuItemContainer = ({ 
  children,
  className,
  level = 0 
}: { 
  children: React.ReactNode
  className?: string
  level?: number 
}) => {
  return (
    <div className={cn("relative", level > 0 ? `pl-${level * 2}` : "", className)}>
      {children}
    </div>
  )
}

// 递归渲染子菜单项组件
const SubMenuItem = ({ 
  item, 
  level = 0 
}: { 
  item: SubMenuItemType, 
  level?: number 
}) => {
  const pathname = usePathname()
  
  // 检查当前路径是否匹配此项目
  const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
  // 检查是否有子菜单
  const hasChildren = item.children && item.children.length > 0
  // 是否有活跃的子项
  const hasActiveChild = hasChildren && item.children?.some(
    childItem => pathname === childItem.url || pathname.startsWith(childItem.url + "/")
  )
  
  // 菜单内容 - 不包含外层容器
  const menuContent = (
    <>
      {hasChildren ? (
        // 有子菜单的项目
        <Collapsible
          defaultOpen={isActive || hasActiveChild}
          className="w-full group/subcollapsible"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton className={isActive ? "bg-accent" : ""}>
              <span>{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90" />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 space-y-1">
              {item.children?.map((childItem, index) => (
                <SubMenuItem 
                  key={`${childItem.title}-${index}`}
                  item={childItem} 
                  level={level + 1} 
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        // 没有子菜单的项目
        <SidebarMenuSubButton 
          asChild
          className={isActive ? "bg-accent" : ""}
        >
          {item.isExternal ? (
            <a 
              href={item.url} 
              className="w-full"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span>{item.title}</span>
            </a>
          ) : (
            <Link href={item.url} className="w-full">
              <span>{item.title}</span>
            </Link>
          )}
        </SidebarMenuSubButton>
      )}
    </>
  )
  
  // 如果是第一级子菜单，使用SidebarMenuSubItem (li元素)
  // 如果是嵌套子菜单，使用自定义div容器避免嵌套li
  return level === 0 ? (
    <SidebarMenuSubItem>
      {menuContent}
    </SidebarMenuSubItem>
  ) : (
    <NestedMenuItemContainer level={level}>
      {menuContent}
    </NestedMenuItemContainer>
  )
}

export function NavMain({
  items,
}: {
  items: MenuItemType[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>平台</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // 检查此组是否有活跃的子项
          const hasActiveChild = item.items?.some(subItem => {
            if (subItem.url !== '#' && (pathname === subItem.url || pathname.startsWith(subItem.url + "/"))) {
              return true
            }
            // 检查深层子菜单
            if (subItem.children) {
              return subItem.children.some(childItem => 
                pathname === childItem.url || pathname.startsWith(childItem.url + "/")
              )
            }
            return false
          })
          
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || hasActiveChild}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem, index) => (
                      <SubMenuItem 
                        key={`${subItem.title}-${index}`} 
                        item={subItem} 
                      />
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
