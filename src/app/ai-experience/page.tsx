'use client';

import { useQuery } from '@tanstack/react-query';
import { configAPI } from '@/api/config';
import { menuApi } from '@/api/menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ExternalLink, Bot, Sparkles, Zap, Blocks, BringToFront, GitPullRequest } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Menu } from '@/types/menu';
import { MotionHighlight } from '@/components/animate-ui/effects/motion-highlight';

interface MenuItem {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  isExternal?: boolean;
  menu_type?: string;
}

// 图标映射表
const iconMap: Record<string, any> = {
  'bot': Bot,
  'sparkles': Sparkles,
  'zap': Zap,
  // 可以根据需要添加更多图标
};

// 将后端菜单数据转换为前端所需格式
const transformMenuData = (menus: Menu[]): MenuItem[] => {
    console.log(`menus: ${menus}`);
  return menus
    .filter(menu =>  menu.status === '0' && menu.visible === '0' && menu.menu_type !== 'F')
    .map(menu => ({
      id: menu.menu_id.toString(),
      name: menu.menu_name,
      path: menu.menu_type === 'F' ? undefined : menu.path,
      icon: menu.icon,
      isExternal: menu.path?.startsWith('http'),
      menu_type: menu.menu_type,
      children: menu.children ? transformMenuData(menu.children) : []
    }))
};

export default function AiExperiencePage() {
  const router = useRouter();
  const [menuData, setMenuData] = useState<MenuItem[]>([]);

  // 获取AI体验中心的菜单ID
  const { data: menuId, isLoading: isLoadingMenuId } = useQuery({
    queryKey: ['aiExperienceMenuId'],
    queryFn: async () => {
      const response = await configAPI.getAiExperienceMenu();
      return response;
    }
  });

  // 获取完整的菜单树
  const { data: menuTree, isLoading: isLoadingMenuTree } = useQuery({
    queryKey: ['menuTree', menuId],
    enabled: !!menuId,
    queryFn: async () => {
      const tree = await menuApi.getTree();
      console.log(tree);
      console.log(menuId);
      // 找到AI体验中心对应的菜单及其子菜单
      const aiExperienceMenu = tree.find(menu => menu.menu_id.toString() === menuId);
      console.log(aiExperienceMenu);
      if (!aiExperienceMenu || !aiExperienceMenu.children) {
        return [];
      }
      const aiExperienceMenuTree = transformMenuData(aiExperienceMenu.children);
      console.log(`aiExperienceMenuTree: ${aiExperienceMenuTree}`);
      return aiExperienceMenuTree;
    }
  });

  useEffect(() => {
    if (menuTree) {
      setMenuData(menuTree);
    }
  }, [menuTree]);

  // 处理导航
  const handleNavigation = (item: MenuItem) => {
    if (item.isExternal && item.path) {
      window.open(item.path, '_blank');
    } else if (item.path) {
      router.push(item.path);
    }
  };

  // 渲染菜单项
  const renderMenuItem = (item: MenuItem, index: number) => {
    const IconComponent = item.icon ? iconMap[item.icon] || Bot : Bot;

    return (
      <div key={item.id} data-value={item.id} onClick={() => handleNavigation(item)}>
        <div className="p-3 flex flex-col border rounded-xl cursor-pointer">
          <div className="flex items-center justify-around size-8 rounded-lg bg-primary/10 mb-1">
            <IconComponent className="size-4 text-primary" />
          </div>
          <p className="text-sm font-medium mb-0.5 line-clamp-1">{item.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {item.isExternal ? '外部链接' : '内部应用'}
          </p>
          {item.isExternal && item.path && (
            <ExternalLink className="h-3 w-3 text-muted-foreground mt-1" />
          )}
        </div>
      </div>
    );
  };

  // 渲染目录
  const renderDirectory = (directory: MenuItem, index: number) => {
    if (!directory?.children?.length) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        key={directory.id}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h2 className="text-xl font-bold">{directory.name}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <MotionHighlight hover className="rounded-xl">
            {directory.children?.map((item: MenuItem, idx: number) => renderMenuItem(item, idx))}
          </MotionHighlight>
        </div>
      </motion.div>
    );
  };

  // 渲染加载状态
  const renderLoading = () => {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-6 w-1" />
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-24" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const isLoading = isLoadingMenuId || isLoadingMenuTree;

  // 渲染错误状态
  if (!isLoading && !menuId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>
            未找到AI体验中心的配置信息
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 如果menuData为空，显示提示信息
  if (!isLoading && (!menuData || menuData.length === 0)) {
    return (
      <div className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">顺畅AI 体验中心</h1>
          <p className="text-xl text-muted-foreground">暂无可用的AI应用</p>
        </motion.div>
      </div>
    ); 
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4">顺畅AI 体验中心</h1>
        <p className="text-xl text-muted-foreground">探索人工智能的无限可能</p>
      </motion.div>
      
      {isLoading ? renderLoading() : (
        <div className="space-y-12">
          {Array.isArray(menuData) && menuData.map((directory, index) => renderDirectory(directory, index))}
        </div>
      )}
    </div>
  );
} 