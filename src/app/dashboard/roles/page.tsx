"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Role {
  id: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: "0" | "1"; // 0正常，1停用
  createTime: string;
  remark?: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);

  useEffect(() => {
    // 模拟从API获取角色数据
    const fetchRoles = async () => {
      try {
        setLoading(true);
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟数据
        const mockRoles: Role[] = [
          {
            id: 1,
            roleName: "超级管理员",
            roleKey: "admin",
            roleSort: 1,
            status: "0",
            createTime: "2023-01-01 00:00:00",
            remark: "拥有所有权限"
          },
          {
            id: 2,
            roleName: "开发人员",
            roleKey: "dev",
            roleSort: 2,
            status: "0",
            createTime: "2023-01-02 10:00:00",
            remark: "开发相关权限"
          },
          {
            id: 3,
            roleName: "测试人员",
            roleKey: "test",
            roleSort: 3,
            status: "0",
            createTime: "2023-01-03 11:00:00",
            remark: "测试相关权限"
          },
          {
            id: 4,
            roleName: "运维人员",
            roleKey: "ops",
            roleSort: 4,
            status: "0",
            createTime: "2023-01-04 12:00:00",
            remark: "运维相关权限"
          },
          {
            id: 5,
            roleName: "客服",
            roleKey: "service",
            roleSort: 5,
            status: "1",
            createTime: "2023-01-05 13:00:00",
            remark: "客服相关权限"
          }
        ];

        setRoles(mockRoles);
        setFilteredRoles(mockRoles);
      } catch (error) {
        console.error("获取角色列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(
        role =>
          role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.roleKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  }, [searchTerm, roles]);

  const handleStatusChange = (roleId: number, currentStatus: string) => {
    // 实际项目中应调用API修改角色状态
    const newStatus = currentStatus === "0" ? "1" : "0";
    const statusText = newStatus === "0" ? "启用" : "停用";
    alert(`${statusText}角色 ${roleId}`);
    
    // 更新本地状态
    setRoles(prev => 
      prev.map(role => 
        role.id === roleId 
          ? { ...role, status: newStatus as "0" | "1" } 
          : role
      )
    );
  };

  const handleDeleteRole = (roleId: number) => {
    // 实际项目中应调用API删除角色
    if (confirm(`确认删除角色 ID: ${roleId}?`)) {
      // 更新本地状态
      setRoles(prev => prev.filter(role => role.id !== roleId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">角色管理</h1>
        <Link href="/dashboard/roles/create">
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
            新增角色
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>角色列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="search" className="sr-only">
                搜索
              </Label>
              <Input
                id="search"
                placeholder="搜索角色名称或标识..."
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
                    角色编号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    权限字符
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    显示顺序
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
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
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">
                      没有找到角色
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-500">{role.id}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">{role.roleName}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{role.roleKey}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{role.roleSort}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            role.status === "0"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {role.status === "0" ? "正常" : "停用"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{role.createTime}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/roles/edit/${role.id}`}>
                            <Button variant="outline" size="sm">
                              编辑
                            </Button>
                          </Link>
                          <Link href={`/dashboard/roles/auth/${role.id}`}>
                            <Button variant="outline" size="sm">
                              分配权限
                            </Button>
                          </Link>
                          <Button
                            variant={role.status === "0" ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleStatusChange(role.id, role.status)}
                          >
                            {role.status === "0" ? "停用" : "启用"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
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