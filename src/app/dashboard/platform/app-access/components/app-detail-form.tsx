"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarIcon, Loader2, ArrowLeft, Save, Edit } from "lucide-react"
import { format } from "date-fns"
import { CalendarCN } from "@/components/shared/date-picker"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"
import { zhCN } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { AppAccess, AppAccessCreateDto, AppAccessUpdateDto } from "@/types/app"
import { appAccessAPI } from "@/api"

// 表单验证模式
const formSchema = z.object({
  app_code: z.string().min(3, {
    message: "应用编码至少3个字符",
  }).max(50, {
    message: "应用编码不能超过50个字符",
  }),
  app_name: z.string().min(2, {
    message: "应用名称至少2个字符",
  }).max(100, {
    message: "应用名称不能超过100个字符",
  }),
  ip_whitelist: z.string().optional(),
  expire_time: z.date().optional().nullable(),
  description: z.string().max(500, {
    message: "描述不能超过500个字符",
  }).optional(),
  status: z.string({
    required_error: "请选择状态",
  }),
  remark: z.string().max(500, {
    message: "备注不能超过500个字符",
  }).optional(),
})

interface AppDetailFormProps {
  app?: AppAccess
  mode: "view" | "create" | "edit"
}

export function AppDetailForm({ app, mode }: AppDetailFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(mode === "edit")
  const isViewMode = mode === "view"
  const isCreateMode = mode === "create"

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      app_code: app?.app_code || "",
      app_name: app?.app_name || "",
      ip_whitelist: app?.ip_whitelist || "",
      expire_time: app?.expire_time ? new Date(app.expire_time) : null,
      description: app?.description || "",
      status: app?.status || "0",
      remark: app?.remark || "",
    },
  })

  // 创建应用接入
  const createMutation = useMutation({
    mutationFn: (data: AppAccessCreateDto) => appAccessAPI.create(data),
    onSuccess: (response) => {
      toast({
        title: "创建成功",
        description: "应用接入已成功创建",
      })
      queryClient.invalidateQueries({ queryKey: ["app-access", "list"] })
      router.push(`/dashboard/platform/app-access/${response.data.id}`)
    },
    onError: (error) => {
      toast({
        title: "创建失败",
        description: `创建应用接入时出错: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  })

  // 更新应用接入
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; app: AppAccessUpdateDto }) => 
      appAccessAPI.update(data.id, data.app),
    onSuccess: (response) => {
      toast({
        title: "更新成功",
        description: "应用接入已成功更新",
      })
      queryClient.invalidateQueries({ queryKey: ["app-access", "detail", app?.id] })
      queryClient.invalidateQueries({ queryKey: ["app-access", "list"] })
      setIsEditing(false)
      setIsSubmitting(false)
    },
    onError: (error) => {
      toast({
        title: "更新失败",
        description: `更新应用接入时出错: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  })

  // 表单提交处理
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // 转换日期格式
    const formattedData = {
      ...values,
      expire_time: values.expire_time ? format(values.expire_time, "yyyy-MM-dd HH:mm:ss") : undefined,
    }
    
    if (isCreateMode) {
      // 创建新应用
      createMutation.mutate(formattedData as AppAccessCreateDto)
    } else if (isEditing && app) {
      // 更新现有应用
      updateMutation.mutate({ id: app.id, app: formattedData })
    }
  }

  // 对于查看模式，我们使用一个不同的渲染逻辑，显示详细信息
  if (isViewMode && app && !isEditing) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{app.app_name}</h2>
            <p className="text-muted-foreground">
              应用接入详细信息
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/platform/app-access")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <dl className="divide-y divide-border">
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">应用编码</dt>
              <dd className="sm:col-span-2">{app.app_code}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">应用名称</dt>
              <dd className="sm:col-span-2">{app.app_name}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">API密钥</dt>
              <dd className="sm:col-span-2 font-mono bg-muted p-2 rounded">{app.api_key}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">状态</dt>
              <dd className="sm:col-span-2">
                <Badge variant={app.status === "0" ? "default" : "destructive"}>
                  {app.status === "0" ? "启用" : "停用"}
                </Badge>
              </dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">IP白名单</dt>
              <dd className="sm:col-span-2">{app.ip_whitelist || "无限制"}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">过期时间</dt>
              <dd className="sm:col-span-2">{app.expire_time ? formatDateTime(app.expire_time) : "永不过期"}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">最后访问时间</dt>
              <dd className="sm:col-span-2">{app.last_access_time ? formatDateTime(app.last_access_time) : "未访问"}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">访问次数</dt>
              <dd className="sm:col-span-2">{app.access_count || 0}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">应用描述</dt>
              <dd className="sm:col-span-2">{app.description || "无"}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">备注</dt>
              <dd className="sm:col-span-2">{app.remark || "无"}</dd>
            </div>
            
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">创建信息</dt>
              <dd className="sm:col-span-2">
                由 {app.create_by || "系统"} 于 {formatDateTime(app.create_time)} 创建
                {app.update_by && app.update_time && (
                  <>
                    <br />
                    由 {app.update_by} 于 {formatDateTime(app.update_time)} 更新
                  </>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    )
  }
  
  // 标题部分
  const title = isCreateMode 
    ? "创建应用接入" 
    : isEditing 
      ? "编辑应用接入" 
      : app?.app_name;
  
  const description = isCreateMode 
    ? "创建新的第三方应用接入并生成API密钥"
    : isEditing
      ? `编辑 ${app?.app_name} 的应用接入信息` 
      : "应用接入详细信息";

  // 表单渲染
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {(!isCreateMode && isEditing) && (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回查看
          </Button>
        )}
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="app_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>应用编码 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="请输入应用编码" 
                      {...field} 
                      disabled={!isCreateMode} // 只有创建模式可以修改编码
                    />
                  </FormControl>
                  <FormDescription>
                    应用的唯一标识符，创建后不可更改
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="app_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>应用名称 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="请输入应用名称" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    应用的显示名称
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状态 *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">启用</SelectItem>
                      <SelectItem value="1">停用</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    应用的当前状态
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="ip_whitelist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IP白名单</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="请输入IP白名单，多个IP使用英文逗号分隔" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  允许访问API的IP地址列表，留空表示不限制IP
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expire_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>过期时间</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "yyyy年MM月dd日", { locale: zhCN })
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarCN
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date: Date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  API密钥的有效期，留空表示永不过期
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>应用描述</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="请输入应用描述" 
                    className="resize-none h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="remark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>备注</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="请输入备注信息" 
                    className="resize-none h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => isViewMode && !isEditing 
                ? router.back() 
                : isViewMode && isEditing 
                  ? setIsEditing(false) 
                  : router.push("/dashboard/platform/app-access")
              }
            >
              {isViewMode && !isEditing ? "返回" : isViewMode && isEditing ? "取消编辑" : "取消"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isCreateMode ? "创建" : "保存"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 