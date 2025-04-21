"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  userName: string;
  nickName: string;
  email: string;
  phone: string;
  status: "0" | "1"; // 0正常，1停用
  createTime: string;
  roleNames?: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    // 模拟从API获取用户数据
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟数据 - 实际应该从API获取
        const mockUsers: User[] = [
          {
            id: 1,
            userName: "admin",
            nickName: "管理员",
            email: "admin@example.com",
            phone: "13800000000",
            status: "0",
            createTime: "2023-01-15 08:30:00",
            roleNames: ["超级管理员"]
          },
          {
            id: 2,
            userName: "zhangsan",
            nickName: "张三",
            email: "zhangsan@example.com",
            phone: "13811111111",
            status: "0",
            createTime: "2023-02-20 10:15:00",
            roleNames: ["开发人员"]
          },
          {
            id: 3,
            userName: "lisi",
            nickName: "李四",
            email: "lisi@example.com",
            phone: "13822222222",
            status: "1",
            createTime: "2023-03-05 14:45:00",
            roleNames: ["测试人员"]
          },
          {
            id: 4,
            userName: "wangwu",
            nickName: "王五",
            email: "wangwu@example.com",
            phone: "13833333333",
            status: "0",
            createTime: "2023-04-10 09:20:00",
            roleNames: ["运维人员"]
          },
          {
            id: 5,
            userName: "zhaoliu",
            nickName: "赵六",
            email: "zhaoliu@example.com",
            phone: "13844444444",
            status: "0",
            createTime: "2023-05-15 16:30:00",
            roleNames: ["客服"]
          }
        ];

        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } catch (error) {
        console.error("获取用户列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        user =>
          user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nickName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleResetPassword = (userId: number) => {
    // 实际项目中应调用API重置密码
    alert(`重置用户 ${userId} 的密码`);
  };

  const handleStatusChange = (userId: number, currentStatus: string) => {
    // 实际项目中应调用API修改用户状态
    const newStatus = currentStatus === "0" ? "1" : "0";
    const statusText = newStatus === "0" ? "启用" : "停用";
    alert(`${statusText}用户 ${userId}`);
    
    // 更新本地状态
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus as "0" | "1" } 
          : user
      )
    );
  };

  const handleDeleteUser = (userId: number) => {
    // 实际项目中应调用API删除用户
    if (confirm(`确认删除用户 ID: ${userId}?`)) {
      // 更新本地状态
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
        <Link href="/dashboard/users/action/create">
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
            新增用户
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="search" className="sr-only">
                搜索
              </Label>
              <Input
                id="search"
                placeholder="搜索用户名、昵称或邮箱..."
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
                    用户编号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户昵称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    手机号码
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
                    <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">
                      加载中...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">
                      没有找到用户
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-500">{user.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                        <div className="text-xs text-gray-500">
                          {user.roleNames?.join(", ") || "无角色"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{user.nickName}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{user.phone}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === "0"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status === "0" ? "正常" : "停用"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{user.createTime}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/users/action/edit/${user.id}`}>
                            <Button variant="outline" size="sm">
                              编辑
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            重置密码
                          </Button>
                          <Button
                            variant={user.status === "0" ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleStatusChange(user.id, user.status)}
                          >
                            {user.status === "0" ? "停用" : "启用"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
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