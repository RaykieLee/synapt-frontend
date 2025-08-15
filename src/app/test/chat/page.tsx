"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/services/auth";
import { buildChatWebSocketUrl } from "@/utils/websocket-config";

interface Message {
  user_id: number;
  username: string;
  message: string;
  type: "user" | "system";
  timestamp?: string;
}

interface UserInfo {
  userId: number;
  userName: string;
  nickName: string;
  avatar: string;
  roles: string[];
  menus: any[];
  buttons: string[];
}

export default function ChatPage() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  useEffect(() => {
    // 从localStorage获取用户信息
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      setUser(userInfo);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const token = getAuthToken();
    if (!token) return;

    // 创建WebSocket连接，使用正确的API前缀路径
    const wsUrl = buildChatWebSocketUrl(user.userId, token);
    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = (event) => {
      console.log("Disconnected from WebSocket", event.code, event.reason);
      setConnectionStatus("disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("disconnected");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user]);

  const sendMessage = () => {
    if (socket && inputMessage.trim()) {
      socket.send(inputMessage);
      setInputMessage("");
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-4">
          <h1 className="text-2xl font-bold mb-4">加载中...</h1>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">WebSocket 聊天室</h1>
          <Badge 
            variant={connectionStatus === "connected" ? "default" : "destructive"}
          >
            {connectionStatus === "connected" ? "已连接" : 
             connectionStatus === "connecting" ? "连接中..." : "已断开"}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-4">当前用户：{user.nickName || user.userName}</p>
        <ScrollArea className="h-[400px] border rounded-md p-4 mb-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              暂无消息，开始聊天吧！
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 ${msg.type === "system" ? "text-center" : ""}`}
            >
              {msg.type === "system" ? (
                <div className="text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1 inline-block">
                  {msg.username} {msg.message}
                  {msg.timestamp && (
                    <span className="ml-2">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
              ) : (
                <div
                  className={`flex ${
                    msg.user_id === user?.userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.user_id === user?.userId
                        ? "bg-blue-500 text-white"
                        : "bg-white border"
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">
                      {msg.user_id === user?.userId ? "我" : msg.username}
                    </div>
                    <div className="text-sm break-words">{msg.message}</div>
                    {msg.timestamp && (
                      <div className={`text-xs mt-1 ${
                        msg.user_id === user?.userId ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="输入消息..."
            disabled={connectionStatus !== "connected"}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!socket || connectionStatus !== "connected" || !inputMessage.trim()}
          >
            发送
          </Button>
        </div>
      </Card>
    </div>
  );
} 