"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { proxyAPI } from "@/api/encrypt/proxy"
import { ProxyCreateDto, ProxyUpdateDto } from "@/types/encrypt/proxy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// 表单验证Schema
const proxySchema = z.object({
  proxy_type: z.string().min(1, "请选择代理类型"),
  host: z.string().min(1, "请输入主机地址").max(100, "主机地址不能超过100个字符"),
  port: z.number().min(1, "端口必须大于0").max(65535, "端口不能超过65535"),
  username: z.string().max(100, "用户名不能超过100个字符").optional(),
  password: z.string().max(100, "密码不能超过100个字符").optional(),
  status: z.string().optional(),
  group: z.string().max(100, "分组名不能超过100个字符").optional(),
  is_active: z.boolean(),
  remark: z.string().max(500, "备注不能超过500个字符").optional(),
})

type ProxyFormData = z.infer<typeof proxySchema>

export default function ProxyEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  
  const id = searchParams.get('id')
  const isEdit = !!id

  // 初始化表单
  const form = useForm<ProxyFormData>({
    resolver: zodResolver(proxySchema),
    defaultValues: {
      proxy_type: "",
      host: "",
      port: 8080,
      username: "",
      password: "",
      status: "unknown",
      group: "",
      is_active: true,
      remark: "",
    },
  })

  // 获取详情（编辑模式）
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["encrypt", "proxy", "detail", id],
    queryFn: () => proxyAPI.getDetail(id!),
    enabled: isEdit,
  })

  // 当获取到详情后重置表单
  useEffect(() => {
    if (isEdit && detail) {
      form.reset({
        proxy_type: detail.proxy_type,
        host: detail.host,
        port: detail.port,
        username: detail.username || "",
        password: detail.password || "",
        status: detail.status || "unknown",
        group: detail.group || "",
        is_active: detail.is_active,
        remark: detail.remark || "",
      })
    }
  }, [detail, isEdit, form])

  // 提交mutation
  const mutation = useMutation({
    mutationFn: (data: ProxyFormData) => {
      const submitData = {
        ...data,
        username: data.username || undefined,
        password: data.password || undefined,
        status: data.status || undefined,
        group: data.group || undefined,
        remark: data.remark || undefined,
      }
      
      if (isEdit) {
        return proxyAPI.update(id!, submitData as ProxyUpdateDto)
      } else {
        return proxyAPI.create(submitData as ProxyCreateDto)
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "更新成功" : "创建成功")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "proxy", "list"] })
      router.push("/dashboard/encrypt/proxy")
    },
    onError: (error: any) => {
      toast.error(`${isEdit ? "更新" : "创建"}失败: ${error.message}`)
    },
  })

  const onSubmit = (data: ProxyFormData) => {
    mutation.mutate(data)
  }

  const handleBack = () => {
    router.push("/dashboard/encrypt/proxy")
  }

  // 加载状态
  if (isEdit && detailLoading) {
    return (
      <div className="min-h-screen space-y-6 p-4 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 p-4 max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "编辑代理" : "新增代理"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "修改代理配置信息" : "添加新的代理服务器"}
          </p>
        </div>
      </div>

      {/* 表单 */}
      <Card>
        <CardHeader>
          <CardTitle>代理信息</CardTitle>
          <CardDescription>
            配置代理服务器的基本信息和连接参数
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 代理类型 */}
                <FormField
                  control={form.control}
                  name="proxy_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>代理类型 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择代理类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="http">HTTP</SelectItem>
                          <SelectItem value="https">HTTPS</SelectItem>
                          <SelectItem value="socks4">SOCKS4</SelectItem>
                          <SelectItem value="socks5">SOCKS5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 主机地址 */}
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>主机地址 *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="例如: 192.168.1.1 或 proxy.example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 端口 */}
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>端口 *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="8080" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 用户名 */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名</FormLabel>
                      <FormControl>
                        <Input placeholder="代理认证用户名（可选）" {...field} />
                      </FormControl>
                      <FormDescription>
                        如果代理需要认证，请填写用户名
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 密码 */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="代理认证密码（可选）" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 状态 */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">正常</SelectItem>
                          <SelectItem value="error">异常</SelectItem>
                          <SelectItem value="unknown">未知</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 分组 */}
                <FormField
                  control={form.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>分组</FormLabel>
                      <FormControl>
                        <Input placeholder="代理分组名称（可选）" {...field} />
                      </FormControl>
                      <FormDescription>
                        用于对代理进行分类管理
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 是否激活 */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">激活状态</FormLabel>
                      <FormDescription>
                        启用后该代理可用于连接，禁用后将不会被使用
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 备注 */}
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="代理的备注信息..." 
                        className="resize-none"
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 提交按钮 */}
              <div className="flex items-center space-x-4">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-32"
                >
                  {mutation.isPending ? (
                    <>正在{isEdit ? "更新" : "创建"}...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEdit ? "更新" : "创建"}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={mutation.isPending}
                >
                  取消
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 