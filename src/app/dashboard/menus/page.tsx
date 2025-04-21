"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Menu {
  id: number;
  menuName: string;
  parentId: number;
  orderNum: number;
  path: string;
  component?: string;
  menuType: "M" | "C" | "F"; // M目录 C菜单 F按钮
  visible: "0" | "1"; // 0显示 1隐藏
  status: "0" | "1"; // 0正常 1停用
  perms?: string;
  icon?: string;
  createTime: string;
  children?: Menu[];
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [flatMenus, setFlatMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);

  useEffect(() => {
    // 模拟从API获取菜单数据
    const fetchMenus = async () => {
      try {
        setLoading(true);
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟数据 - 树形结构菜单
        const mockMenus: Menu[] = [
          {
            id: 1,
            menuName: "系统管理",
            parentId: 0,
            orderNum: 1,
            path: "system",
            menuType: "M",
            visible: "0",
            status: "0",
            icon: "system",
            createTime: "2023-01-01 00:00:00",
            children: [
              {
                id: 2,
                menuName: "用户管理",
                parentId: 1,
                orderNum: 1,
                path: "user",
                component: "system/user/index",
                menuType: "C",
                visible: "0",
                status: "0",
                perms: "system:user:list",
                icon: "user",
                createTime: "2023-01-01 00:00:00",
                children: [
                  {
                    id: 7,
                    menuName: "用户查询",
                    parentId: 2,
                    orderNum: 1,
                    path: "",
                    menuType: "F",
                    visible: "0",
                    status: "0",
                    perms: "system:user:query",
                    createTime: "2023-01-01 00:00:00"
                  },
                  {
                    id: 8,
                    menuName: "用户新增",
                    parentId: 2,
                    orderNum: 2,
                    path: "",
                    menuType: "F",
                    visible: "0",
                    status: "0",
                    perms: "system:user:add",
                    createTime: "2023-01-01 00:00:00"
                  }
                ]
              },
              {
                id: 3,
                menuName: "角色管理",
                parentId: 1,
                orderNum: 2,
                path: "role",
                component: "system/role/index",
                menuType: "C",
                visible: "0",
                status: "0",
                perms: "system:role:list",
                icon: "role",
                createTime: "2023-01-01 00:00:00"
              },
              {
                id: 4,
                menuName: "菜单管理",
                parentId: 1,
                orderNum: 3,
                path: "menu",
                component: "system/menu/index",
                menuType: "C",
                visible: "0",
                status: "0",
                perms: "system:menu:list",
                icon: "menu",
                createTime: "2023-01-01 00:00:00"
              }
            ]
          },
          {
            id: 5,
            menuName: "系统监控",
            parentId: 0,
            orderNum: 2,
            path: "monitor",
            menuType: "M",
            visible: "0",
            status: "0",
            icon: "monitor",
            createTime: "2023-01-01 00:00:00",
            children: [
              {
                id: 6,
                menuName: "服务监控",
                parentId: 5,
                orderNum: 1,
                path: "server",
                component: "monitor/server/index",
                menuType: "C",
                visible: "0",
                status: "0",
                perms: "monitor:server:list",
                icon: "server",
                createTime: "2023-01-01 00:00:00"
              }
            ]
          }
        ];

        setMenus(mockMenus);

        // 扁平化菜单树，方便搜索
        const flatten = (items: Menu[], parentName = ""): Menu[] => {
          return items.reduce((acc: Menu[], item) => {
            const itemWithParent = { ...item, parentName };
            if (item.children && item.children.length) {
              return [...acc, itemWithParent, ...flatten(item.children, item.menuName)];
            }
            return [...acc, itemWithParent];
          }, []);
        };

        const flattenedMenus = flatten(mockMenus);
        setFlatMenus(flattenedMenus);
        setFilteredMenus(flattenedMenus);
      } catch (error) {
        console.error("获取菜单列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMenus(flatMenus);
    } else {
      const filtered = flatMenus.filter(
        menu =>
          menu.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (menu.perms && menu.perms.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (menu.path && menu.path.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMenus(filtered);
    }
  }, [searchTerm, flatMenus]);

  const getMenuTypeLabel = (type: string) => {
    switch (type) {
      case "M":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            目录
          </span>
        );
      case "C":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            菜单
          </span>
        );
      case "F":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
            按钮
          </span>
        );
      default:
        return type;
    }
  };

  const handleStatusChange = (menuId: number, currentStatus: string) => {
    // 实际项目中应调用API修改菜单状态
    const newStatus = currentStatus === "0" ? "1" : "0";
    const statusText = newStatus === "0" ? "启用" : "停用";
    alert(`${statusText}菜单 ${menuId}`);
    
    // 更新本地状态（这里只是示例，实际上应该更新树形结构）
    setFlatMenus(prev => 
      prev.map(menu => 
        menu.id === menuId 
          ? { ...menu, status: newStatus as "0" | "1" } 
          : menu
      )
    );
  };

  const handleDeleteMenu = (menuId: number) => {
    // 实际项目中应调用API删除菜单
    if (confirm(`确认删除菜单 ID: ${menuId}?`)) {
      // 更新本地状态（这里只是示例，实际上应该更新树形结构）
      setFlatMenus(prev => prev.filter(menu => menu.id !== menuId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">菜单管理</h1>
        <Link href="/dashboard/menus/create">
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新增菜单
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>菜单列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="search" className="sr-only">
                搜索
              </Label>
              <Input
                id="search"
                placeholder="搜索菜单名称、权限标识或路径..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    菜单名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    权限标识
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    路径
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">
                      加载中...
                    </td>
                  </tr>
                ) : filteredMenus.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">
                      没有找到菜单
                    </td>
                  </tr>
                ) : (
                  filteredMenus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {menu.menuName}
                        </div>
                        {menu.parentId !== 0 && (
                          <div className="text-xs text-gray-500">
                            父级: {menu.parentName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {getMenuTypeLabel(menu.menuType)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {menu.orderNum}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {menu.perms || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {menu.path || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            menu.status === "0"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {menu.status === "0" ? "正常" : "停用"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/menus/edit/${menu.id}`}>
                            <Button variant="outline" size="sm">
                              编辑
                            </Button>
                          </Link>
                          <Button
                            variant={menu.status === "0" ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleStatusChange(menu.id, menu.status)}
                          >
                            {menu.status === "0" ? "停用" : "启用"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMenu(menu.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 