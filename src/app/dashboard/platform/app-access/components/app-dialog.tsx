"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarIcon, Loader2, Save, Edit, Copy } from "lucide-react"
import { format } from "date-fns"
import { CalendarCN } from "@/components/shared/date-picker"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

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
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

interface AppDialogProps {
  app?: AppAccess
  mode: "view" | "create" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: AppAccess) => void
}

export function AppDialog({ app, mode, open, onOpenChange, onSuccess }: AppDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(mode === "edit" || mode === "create")
  const isViewMode = mode === "view"
  const isCreateMode = mode === "create"
  // 添加日期选择器的popover状态
  const [expireTimePopoverOpen, setExpireTimePopoverOpen] = useState(false)

  // 安全关闭弹窗的函数
  const safeCloseDialog = useCallback((closeFunc: () => void) => {
    // 首先使用RAF确保在下一帧执行
    requestAnimationFrame(() => {
      // 然后使用setTimeout确保React有时间更新DOM
      setTimeout(() => {
        closeFunc()
      }, 150)
    })
  }, [])

  // 处理弹窗打开状态变化
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      // 安全关闭弹窗
      safeCloseDialog(() => onOpenChange(false))
    } else {
      onOpenChange(true)
    }
  }, [onOpenChange, safeCloseDialog])

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

  // 当app数据更新时，重置表单
  useEffect(() => {
    if (app) {
      form.reset({
        app_code: app.app_code || "",
        app_name: app.app_name || "",
        ip_whitelist: app.ip_whitelist || "",
        expire_time: app.expire_time ? new Date(app.expire_time) : null,
        description: app.description || "",
        status: app.status || "0",
        remark: app.remark || "",
      })
    }
  }, [app, form])

  // 当对话框打开时，重置编辑状态
  useEffect(() => {
    if (open) {
      setIsEditing(mode === "edit" || mode === "create")
    }
  }, [open, mode])

  // 创建应用接入
  const createMutation = useMutation({
    mutationFn: (data: AppAccessCreateDto) => appAccessAPI.create(data),
    onSuccess: (response) => {
      toast.success("应用接入已成功创建")
      queryClient.invalidateQueries({ queryKey: ["app-access", "list"] })
      setIsSubmitting(false)
      
      // 安全关闭弹窗
      safeCloseDialog(() => {
        if (onSuccess) {
          onSuccess(response.data)
        }
      })
    },
    onError: (error) => {
      toast.error(`创建应用接入时出错: ${error instanceof Error ? error.message : '未知错误'}`)
      setIsSubmitting(false)
    }
  })

  // 更新应用接入
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; app: AppAccessUpdateDto }) => 
      appAccessAPI.update(data.id, data.app),
    onSuccess: (response) => {
      toast.success("应用接入已成功更新")
      queryClient.invalidateQueries({ queryKey: ["app-access", "detail", app?.id] })
      queryClient.invalidateQueries({ queryKey: ["app-access", "list"] })
      setIsEditing(false)
      setIsSubmitting(false)
      
      // 安全回调
      safeCloseDialog(() => {
        if (onSuccess) {
          onSuccess(response.data)
        }
      })
    },
    onError: (error) => {
      toast.error(`更新应用接入时出错: ${error instanceof Error ? error.message : '未知错误'}`)
      setIsSubmitting(false)
    }
  })

  // 表单提交处理
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    console.log("提交表单数据:", values)
    
    // 转换日期格式
    const formattedData = {
      ...values,
      expire_time: values.expire_time ? format(values.expire_time, "yyyy-MM-dd HH:mm:ss") : undefined,
    }
    
    console.log("格式化后的数据:", formattedData)
    
    if (isCreateMode) {
      // 创建新应用
      createMutation.mutate(formattedData as AppAccessCreateDto)
    } else if (isEditing && app) {
      // 更新现有应用
      updateMutation.mutate({ id: app.id, app: formattedData })
    }
  }

  // 复制API密钥
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("API密钥已复制到剪贴板")
      })
      .catch((err) => {
        toast.error("复制失败")
        console.error('无法复制文本: ', err)
      })
  }

  // 获取对话框标题
  const getDialogTitle = () => {
    if (isCreateMode) return "创建应用接入"
    if (isViewMode && !isEditing) return "应用接入详情"
    return "编辑应用接入"
  }

  // 处理日期选择
  const handleDateSelect = (date: Date | undefined) => {
    console.log("选择日期:", date); // 添加调试信息
    if (date) {
      // 确保选择的日期正确格式化并设置到23:59:59
      const selectedDate = new Date(date);
      selectedDate.setHours(23, 59, 59, 999);
      form.setValue("expire_time", selectedDate, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      
      // 直接触发表单更新
      form.trigger("expire_time");
      
      // 打印确认日期已设置
      console.log("日期已设置:", form.getValues("expire_time"));
    } else {
      form.setValue("expire_time", null, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      form.trigger("expire_time");
    }
  };

  // 设置预设日期
  const setPresetDate = (days: number) => {
    const date = new Date();
    date.setHours(23, 59, 59, 999); // 设置为当天最后一秒
    date.setDate(date.getDate() + days);
    form.setValue("expire_time", date, { shouldValidate: true, shouldDirty: true });
    console.log("设置预设日期:", date);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {isCreateMode 
              ? "创建新的应用接入凭证，用于第三方应用对接平台API" 
              : isEditing 
                ? "修改应用接入信息" 
                : "查看应用接入详细信息"}
          </DialogDescription>
        </DialogHeader>

        {/* 查看模式 */}
        {isViewMode && !isEditing && app ? (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
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
                  <dd className="sm:col-span-2 flex items-center gap-2">
                    <code className="font-mono bg-muted p-2 rounded text-xs break-all">{app.api_key}</code>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(app.api_key)}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">复制</span>
                    </Button>
                  </dd>
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

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                关闭
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="app_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>应用编码</FormLabel>
                    <FormControl>
                      <Input placeholder="app_code" {...field} readOnly={!isCreateMode} />
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
                    <FormLabel>应用名称</FormLabel>
                    <FormControl>
                      <Input placeholder="应用名称" {...field} />
                    </FormControl>
                    <FormDescription>
                      应用的显示名称
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        应用接入的状态，停用后将无法访问API
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expire_time"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>过期时间</FormLabel>
                        <Popover 
                          open={expireTimePopoverOpen} 
                          onOpenChange={(open) => {
                            setExpireTimePopoverOpen(open);
                            // 如果关闭Popover，确保表单同步
                            if (!open) {
                              form.trigger("expire_time");
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExpireTimePopoverOpen(true);
                                }}
                                type="button"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "yyyy年MM月dd日", { locale: zhCN })
                                ) : (
                                  <span>选择日期</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="start">
                            <div className="flex flex-col space-y-4">
                              {/* 预设选项 */}
                              <div className="flex flex-col space-y-2">
                                <div className="text-sm font-medium">选择预设时间</div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPresetDate(30);
                                      // 关闭弹出窗
                                      setTimeout(() => setExpireTimePopoverOpen(false), 100);
                                    }}
                                  >
                                    30天
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPresetDate(90);
                                      // 关闭弹出窗
                                      setTimeout(() => setExpireTimePopoverOpen(false), 100);
                                    }}
                                  >
                                    90天
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPresetDate(180);
                                      // 关闭弹出窗
                                      setTimeout(() => setExpireTimePopoverOpen(false), 100);
                                    }}
                                  >
                                    6个月
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPresetDate(365);
                                      // 关闭弹出窗
                                      setTimeout(() => setExpireTimePopoverOpen(false), 100);
                                    }}
                                  >
                                    1年
                                  </Button>
                                </div>
                              </div>
                              
                              {/* 日历选择 */}
                              <div className="border rounded-md p-3">
                                <DayPicker
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={(date) => {
                                    console.log("DayPicker onSelect:", date);
                                    handleDateSelect(date);
                                    // 选择日期后关闭弹出窗
                                    if (date) {
                                      setTimeout(() => setExpireTimePopoverOpen(false), 100);
                                    }
                                  }}
                                  defaultMonth={field.value || new Date()}
                                  disabled={(date: Date) => date < new Date()}
                                  locale={zhCN}
                                  modifiersClassNames={{
                                    selected: "bg-primary text-primary-foreground",
                                    today: "bg-accent text-accent-foreground"
                                  }}
                                  footer={
                                    <div className="flex justify-between mt-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleDateSelect(undefined);
                                          // 不关闭弹出窗，让用户确认已清除
                                        }}
                                        type="button"
                                      >
                                        清除
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const now = new Date();
                                          now.setHours(23, 59, 59, 999);
                                          handleDateSelect(now);
                                          // 选择今天后关闭弹出窗
                                          setTimeout(() => setExpireTimePopoverOpen(false), 100);
                                        }}
                                        type="button"
                                      >
                                        今天
                                      </Button>
                                    </div>
                                  }
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          应用接入凭证的过期时间，不设置则永不过期
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              
              <FormField
                control={form.control}
                name="ip_whitelist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP白名单</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.1,192.168.1.2" {...field} />
                    </FormControl>
                    <FormDescription>
                      允许访问的IP地址，多个IP用英文逗号分隔，留空表示不限制
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
                        placeholder="应用的详细描述"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      应用的详细描述信息
                    </FormDescription>
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
                        placeholder="内部备注信息"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      内部备注信息，不对外显示
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  if (isViewMode) {
                    setIsEditing(false)
                  } else {
                    onOpenChange(false)
                  }
                }} type="button">
                  {isViewMode ? "取消" : "关闭"}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
} 