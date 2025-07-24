"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/services/auth";

interface UserInfo {
  userId: number;
  userName: string;
  nickName: string;
  avatar: string;
  roles: string[];
  menus: any[];
  buttons: string[];
}

export default function UserInfoTestPage() {
  const [userFromStorage, setUserFromStorage] = useState<UserInfo | null>(null);
  const [userFromToken, setUserFromToken] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 从localStorage获取用户信息
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserFromStorage(userInfo);
      } catch (error) {
        console.error("Failed to parse user info from localStorage:", error);
      }
    }

    // 从token获取用户信息
    const authToken = getAuthToken();
    setToken(authToken);
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        setUserFromToken(payload);
      } catch (error) {
        console.error("Failed to parse token:", error);
      }
    }
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('userInfo');
    setUserFromStorage(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">用户信息测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* localStorage中的用户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>localStorage 用户信息</CardTitle>
          </CardHeader>
          <CardContent>
            {userFromStorage ? (
              <div className="space-y-2">
                <p><strong>用户ID:</strong> {userFromStorage.userId}</p>
                <p><strong>用户名:</strong> {userFromStorage.userName}</p>
                <p><strong>昵称:</strong> {userFromStorage.nickName}</p>
                <p><strong>头像:</strong> {userFromStorage.avatar}</p>
                <p><strong>角色:</strong> {userFromStorage.roles?.join(', ')}</p>
                <div>
                  <strong>完整信息:</strong>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(userFromStorage, null, 2)}
                  </pre>
                </div>
                <Button onClick={clearStorage} variant="destructive" size="sm">
                  清除localStorage
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">未找到localStorage中的用户信息</p>
            )}
          </CardContent>
        </Card>

        {/* Token中的用户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>JWT Token 用户信息</CardTitle>
          </CardHeader>
          <CardContent>
            {token ? (
              <div className="space-y-2">
                <p><strong>Token存在:</strong> 是</p>
                <p><strong>Token长度:</strong> {token.length}</p>
                {userFromToken && (
                  <>
                    <p><strong>用户名 (sub):</strong> {userFromToken.sub}</p>
                    <p><strong>用户ID:</strong> {userFromToken.user_id}</p>
                    <p><strong>过期时间:</strong> {new Date(userFromToken.exp * 1000).toLocaleString()}</p>
                    <div>
                      <strong>完整Token载荷:</strong>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(userFromToken, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-500">未找到认证Token</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 使用建议 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使用建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>LLM聊天页面应该使用:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>用户ID: {userFromStorage?.userId || "未获取到"}</li>
              <li>显示名称: {userFromStorage?.nickName || userFromStorage?.userName || "未获取到"}</li>
              <li>WebSocket URL: ws://localhost:8000/api/v1/ws/llm-chat/{userFromStorage?.userId || "USER_ID"}?token=TOKEN</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
