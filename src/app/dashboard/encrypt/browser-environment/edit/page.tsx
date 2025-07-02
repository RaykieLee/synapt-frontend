"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { browserEnvironmentAPI } from "@/api/encrypt/browser-environment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import type { BrowserEnvironmentFormData } from "@/types/encrypt/browser-environment"
import { BROWSER_TYPE_OPTIONS, STATUS_OPTIONS } from "@/types/encrypt/browser-environment"

// 表单验证Schema
const formSchema = z.object({
  name: z.string().min(1, "环境名称不能为空").max(100, "环境名称不能超过100个字符"),
  browser_type: z.enum(["MoreLogin", "HubStudio"], {
    required_error: "请选择浏览器类型",
  }),
  browser_id: z.string().max(100, "浏览器实例ID不能超过100个字符").optional(),
  proxy_id: z.string().optional(),
  status: z.string().max(50, "状态不能超过50个字符").optional(),
  remark: z.string().max(500, "备注不能超过500个字符").optional(),
})

type FormData = z.infer<typeof formSchema>

export default function BrowserEnvironmentEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  
  const id = searchParams.get("id")
  const isEdit = !!id

  // 表单初始化
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      browser_type: "MoreLogin",
      browser_id: "",
      proxy_id: "",
      status: "none",
      remark: "",
    },
  })

  // 获取详情（编辑模式）
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["encrypt", "browser-environment", "detail", id],
    queryFn: () => browserEnvironmentAPI.getDetail(id!),
    enabled: isEdit,
  })

  // 当获取到详情后重置表单
  useEffect(() => {
    if (isEdit && detail) {
      form.reset({
        name: detail.name || "",
        browser_type: detail.browser_type as "MoreLogin" | "HubStudio",
        browser_id: detail.browser_id || "",
        proxy_id: detail.proxy_id || "",
        status: detail.status || "none",
        remark: detail.remark || "",
      })
    }
  }, [detail, form, isEdit])

  // 提交Mutation
  const mutation = useMutation({
    mutationFn: (data: BrowserEnvironmentFormData) => {
      return isEdit
        ? browserEnvironmentAPI.update(id!, data)
        : browserEnvironmentAPI.create(data)
    },
    onSuccess: () => {
      toast.success(isEdit ? "更新成功" : "创建成功")
      queryClient.invalidateQueries({ queryKey: ["encrypt", "browser-environment", "list"] })
      router.push("/dashboard/encrypt/browser-environment")
    },
    onError: (error: any) => {
      toast.error(`${isEdit ? "更新" : "创建"}失败: ${error.message || "未知错误"}`)
    },
  })

  // 表单提交
  const onSubmit = (data: FormData) => {
    const submitData: BrowserEnvironmentFormData = {
      ...data,
      // 清理空字符串字段
      browser_id: data.browser_id?.trim() || undefined,
      proxy_id: data.proxy_id?.trim() || undefined,
      status: data.status === "none" ? undefined : data.status?.trim() || undefined,
      remark: data.remark?.trim() || undefined,
    }
    mutation.mutate(submitData)
  }

  // 返回列表
  const handleBack = () => {
    router.push("/dashboard/encrypt/browser-environment")
  }

  if (isEdit && detailLoading) {
    return (
      <div className="min-h-screen space-y-4 p-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 p-4 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "编辑浏览器环境" : "新增浏览器环境"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "修改浏览器环境配置信息" : "创建新的浏览器环境实例"}
          </p>
        </div>
      </div>

      {/* 表单区域 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>
            配置浏览器环境的基本参数和运行状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 环境名称 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>环境名称 *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="请输入环境名称"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        用于标识和区分不同的浏览器环境
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 浏览器类型 */}
                <FormField
                  control={form.control}
                  name="browser_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>浏览器类型 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择浏览器类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BROWSER_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        选择使用的浏览器管理平台
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 浏览器实例ID */}
                <FormField
                  control={form.control}
                  name="browser_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>浏览器实例ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="请输入浏览器实例ID"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        浏览器平台中的实例标识符（可选）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 代理ID */}
                <FormField
                  control={form.control}
                  name="proxy_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>代理ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="请输入代理ID"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        关联的代理服务器ID（暂时可不填）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 运行状态 */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>运行状态</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择运行状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">无状态</SelectItem>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        当前环境的运行状态
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* 备注 */}
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="请输入备注信息..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      记录环境的用途、配置说明等信息
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 提交按钮 */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={mutation.isPending}
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? "更新" : "创建"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 