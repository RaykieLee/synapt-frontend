"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/animate-ui/radix/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { AlertLog, AlertLogUpdateDto } from "@/types/alert"
import { alertLogAPI } from "@/api/alert"

// 表单验证 Schema
const formSchema = z.object({
  status: z.string(),
  process_note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 组件 Props 类型定义
interface LogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AlertLog | null;
}

export function LogDetailDialog({
  open,
  onOpenChange,
  log,
}: LogDetailDialogProps) {
  // 状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: log?.status || "0",
      process_note: "",
    },
  });
  
  // 当日志数据变化时重置表单
  React.useEffect(() => {
    if (log) {
      form.reset({
        status: log.status || "0",
        process_note: "",
      });
    }
  }, [log, form]);
  
  // 获取 React Query 客户端
  const queryClient = useQueryClient();
  
  // 更新告警日志 Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: AlertLogUpdateDto }) => 
      alertLogAPI.update(id, data),
    onSuccess: () => {
      toast.success("告警处理成功");
      // 关闭弹窗
      onOpenChange(false);
      // 刷新列表数据
      queryClient.invalidateQueries({ queryKey: ["alerts", "log"] });
    },
    onError: (error: any) => {
      toast.error(`处理失败: ${error.message || "未知错误"}`);
    },
  });
  
  // 提交表单
  const onSubmit = async (values: FormValues) => {
    if (!log) return;
    
    setIsSubmitting(true);
    
    try {
      await updateMutation.mutateAsync({
        id: log.id,
        data: {
          status: values.status,
          process_note: values.process_note,
        }
      });
    } catch (error) {
      console.error("提交表单时出错:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 获取级别标签样式
  const getLevelBadge = (level: string) => {
    const levelMap: Record<string, { label: string, variant: "default" | "destructive" | "outline" | "secondary" }> = {
      "info": { label: "信息", variant: "default" },
      "warning": { label: "警告", variant: "secondary" },
      "error": { label: "错误", variant: "destructive" },
      "critical": { label: "严重", variant: "destructive" },
    };
    
    const levelInfo = levelMap[level] || { label: level, variant: "outline" };
    
    return (
      <Badge variant={levelInfo.variant}>
        {levelInfo.label}
      </Badge>
    )
  };
  
  // 获取状态标签样式
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "outline" }> = {
      "0": { label: "未处理", variant: "outline" },
      "1": { label: "已处理", variant: "default" },
      "2": { label: "已忽略", variant: "secondary" },
    };
    
    const statusInfo = statusMap[status] || { label: "未知", variant: "outline" };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  };
  
  if (!log) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>告警详情</DialogTitle>
          <DialogDescription>
            查看告警详情和处理告警
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">告警标题</h4>
              <p className="text-sm">{log.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">告警级别</h4>
              <div className="text-sm">{getLevelBadge(log.level)}</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">告警内容</h4>
            <p className="text-sm whitespace-pre-wrap">{log.content || "-"}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">告警来源</h4>
              <p className="text-sm">{log.source || "-"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">设备名称</h4>
              <p className="text-sm">{log.device_name || "-"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">IP地址</h4>
              <p className="text-sm">{log.ip || "-"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">告警时间</h4>
              <p className="text-sm">{log.create_time ? new Date(log.create_time).toLocaleString('zh-CN') : "-"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">告警配置</h4>
              <p className="text-sm">{log.config?.name || "-"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">告警类别</h4>
              <p className="text-sm">{log.category?.name || "-"}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">当前状态</h4>
              <div className="text-sm">{getStatusBadge(log.status)}</div>
            </div>
            {log.status !== "0" && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">处理人</h4>
                <p className="text-sm">{log.process_by || "-"}</p>
              </div>
            )}
          </div>
          
          {log.status !== "0" && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">处理备注</h4>
              <p className="text-sm whitespace-pre-wrap">{log.process_note || "-"}</p>
            </div>
          )}
        </div>
        
        <Separator />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>处理状态</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择处理状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">未处理</SelectItem>
                      <SelectItem value="1">已处理</SelectItem>
                      <SelectItem value="2">已忽略</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="process_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>处理备注</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入处理备注"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                关闭
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "处理中..." : "保存处理"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 