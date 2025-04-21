"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Role {
  id: number;
  roleName: string;
  roleKey: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    userName: "",
    nickName: "",
    password: "",
    confirmPassword: "",
    email: "",
    phonenumber: "",
    selectedRoles: [] as number[],
    status: "0" // 0正常，1停用
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 模拟获取角色列表
    const fetchRoles = async () => {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模拟数据
        const mockRoles: Role[] = [
          { id: 1, roleName: "超级管理员", roleKey: "admin" },
          { id: 2, roleName: "开发人员", roleKey: "dev" },
          { id: 3, roleName: "测试人员", roleKey: "test" },
          { id: 4, roleName: "运维人员", roleKey: "ops" },
          { id: 5, roleName: "客服", roleKey: "service" }
        ];
        
        setRoles(mockRoles);
      } catch (error) {
        console.error("获取角色列表失败:", error);
      }
    };
    
    fetchRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData(prev => {
      const selectedRoles = [...prev.selectedRoles];
      if (selectedRoles.includes(roleId)) {
        return { 
          ...prev, 
          selectedRoles: selectedRoles.filter(id => id !== roleId) 
        };
      } else {
        return { ...prev, selectedRoles: [...selectedRoles, roleId] };
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.userName) {
      newErrors.userName = "用户名不能为空";
    } else if (formData.userName.length < 4) {
      newErrors.userName = "用户名长度不能少于4个字符";
    }
    
    if (!formData.nickName) {
      newErrors.nickName = "用户昵称不能为空";
    }
    
    if (!formData.password) {
      newErrors.password = "密码不能为空";
    } else if (formData.password.length < 6) {
      newErrors.password = "密码长度不能少于6个字符";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "邮箱格式不正确";
    }
    
    if (formData.phonenumber && !/^1[3-9]\d{9}$/.test(formData.phonenumber)) {
      newErrors.phonenumber = "手机号码格式不正确";
    }
    
    if (formData.selectedRoles.length === 0) {
      newErrors.roles = "请至少选择一个角色";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 实际项目中应该调用API创建用户
      console.log("提交的用户数据:", formData);
      
      // 模拟成功响应
      alert("用户创建成功!");
      
      // 返回用户列表页面
      router.push("/dashboard/users");
    } catch (error) {
      console.error("创建用户失败:", error);
      alert("创建用户失败，请重试!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">创建用户</h1>
        <Link href="/dashboard/users">
          <Button variant="outline">返回</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="userName">
                  用户名<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="请输入用户名"
                />
                {errors.userName && (
                  <p className="text-sm text-red-500">{errors.userName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickName">
                  用户昵称<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nickName"
                  name="nickName"
                  value={formData.nickName}
                  onChange={handleChange}
                  placeholder="请输入用户昵称"
                />
                {errors.nickName && (
                  <p className="text-sm text-red-500">{errors.nickName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  密码<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  确认密码<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="请再次输入密码"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入邮箱"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phonenumber">手机号码</Label>
                <Input
                  id="phonenumber"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  placeholder="请输入手机号码"
                />
                {errors.phonenumber && (
                  <p className="text-sm text-red-500">{errors.phonenumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>用户状态</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="statusNormal"
                    name="status"
                    value="0"
                    checked={formData.status === "0"}
                    onChange={() => handleStatusChange("0")}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="statusNormal" className="text-sm font-normal">
                    正常
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="statusDisabled"
                    name="status"
                    value="1"
                    checked={formData.status === "1"}
                    onChange={() => handleStatusChange("1")}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="statusDisabled" className="text-sm font-normal">
                    停用
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                用户角色<span className="text-red-500">*</span>
              </Label>
              <div className="border rounded-md p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={formData.selectedRoles.includes(role.id)}
                        onCheckedChange={() => handleRoleToggle(role.id)}
                      />
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-normal"
                      >
                        {role.roleName}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.roles && (
                  <p className="text-sm text-red-500 mt-2">{errors.roles}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Link href="/dashboard/users">
                <Button variant="outline" type="button">
                  取消
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 