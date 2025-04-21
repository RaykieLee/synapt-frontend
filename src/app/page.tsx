"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// 定义表单验证规则
const formSchema = z.object({
  name: z.string().min(2, {
    message: "名称至少需要2个字符",
  }),
  description: z.string().optional(),
});

// 定义项目类型
interface Item {
  id: number;
  name: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

// API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // 加载数据
  useEffect(() => {
    fetchItems();
  }, []);

  // 获取所有项目
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/items`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("获取数据失败:", error);
      // 如果API连接失败，使用模拟数据
      setItems([
        { id: 1, name: "完成前端设计", description: "使用shadcn UI实现界面", completed: false },
        { id: 2, name: "实现后端API", description: "使用FastAPI构建API", completed: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 添加新项目
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, completed: false }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const newItem = await response.json();
      setItems([...items, newItem]);
      form.reset();
    } catch (error) {
      console.error("添加项目失败:", error);
    }
  };

  // 切换完成状态
  const toggleComplete = async (id: number) => {
    try {
      const item = items.find(item => item.id === id);
      if (!item) return;

      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !item.completed }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const updatedItem = await response.json();
      setItems(items.map(item => 
        item.id === id ? updatedItem : item
      ));
    } catch (error) {
      console.error("更新状态失败:", error);
    }
  };

  // 删除项目
  const deleteItem = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("删除项目失败:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">SC AI 应用中心</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>添加新项目</CardTitle>
            <CardDescription>
              创建一个新的待办项目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名称</FormLabel>
                      <FormControl>
                        <Input placeholder="输入项目名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Input placeholder="输入项目描述（可选）" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">添加项目</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p>加载中...</p>
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p>暂无项目，请添加新项目</p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className={item.completed ? "opacity-60" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className={item.completed ? "line-through" : ""}>{item.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleComplete(item.id)}
                      >
                        {item.completed ? "撤销完成" : "标记完成"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </CardTitle>
                  {item.description && (
                    <CardDescription>{item.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
