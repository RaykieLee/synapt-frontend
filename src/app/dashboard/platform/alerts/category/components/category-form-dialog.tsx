"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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

import { alertCategoryAPI } from "@/api"
import { AlertCategory, AlertCategoryCreateDto, AlertCategoryUpdateDto } from "@/types/alert"

// 表单验证 Schema
const formSchema = z.object({
  code: z.string().min(1, "编码不能为空").max(50, "编码不能超过50个字符"),
  name: z.string().min(1, "名称不能为空").max(100, "名称不能超过100个字符"),
  description: z.string().optional(),
  status: z.enum(["0", "1"], {
    required_error: "请选择状态",
  }),
  remark: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 组件 Props 类型定义
interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: AlertCategory | null;
  mode: "create" | "edit";
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  editData = null,
  mode = "create",
}: CategoryFormDialogProps) {
  // 状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: editData?.code || "",
      name: editData?.name || "",
      description: editData?.description || "",
      status: (editData?.status as "0" | "1") || "1",
      remark: editData?.remark || "",
    },
  });
  
  // 在编辑模式下，当 editData 变化时重置表单
  React.useEffect(() => {
    if (editData) {
      form.reset({
        code: editData.code || "",
        name: editData.name || "",
        description: editData.description || "",
        status: (editData.status as "0" | "1") || "1",
        remark: editData.remark || "",
      });
    } else {
      form.reset({
        code: "",
        name: "",
        description: "",
        status: "1",
        remark: "",
      });
    }
  }, [editData, form]);
  
  // 获取 React Query 客户端
  const queryClient = useQueryClient();
  
  // 创建告警类别 Mutation
  const createMutation = useMutation({
    mutationFn: (data: AlertCategoryCreateDto) => alertCategoryAPI.create(data),
    onSuccess: () => {
      toast.success("告警类别创建成功");
      // 关闭弹窗
      onOpenChange(false);
      // 重置表单
      form.reset();
      // 刷新列表数据
      queryClient.invalidateQueries({ queryKey: ["alerts", "category"] });
    },
    onError: (error: any) => {
      toast.error(`创建失败: ${error.message || "未知错误"}`);
    },
  });
  
  // 更新告警类别 Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: AlertCategoryUpdateDto }) => 
      alertCategoryAPI.update(id, data),
    onSuccess: () => {
      toast.success("告警类别更新成功");
      // 关闭弹窗
      onOpenChange(false);
      // 重置表单
      form.reset();
      // 刷新列表数据
      queryClient.invalidateQueries({ queryKey: ["alerts", "category"] });
    },
    onError: (error: any) => {
      toast.error(`更新失败: ${error.message || "未知错误"}`);
    },
  });
  
  // 提交表单
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (mode === "create") {
        // 创建新告警类别
        await createMutation.mutateAsync({
          code: values.code,
          name: values.name,
          description: values.description,
          status: values.status,
          enabled: values.status === "1",
          remark: values.remark,
        });
      } else if (mode === "edit" && editData) {
        // 更新现有告警类别
        await updateMutation.mutateAsync({
          id: editData.category_id,
          data: {
            code: values.code,
            name: values.name,
            description: values.description,
            status: values.status,
            enabled: values.status === "1",
            remark: values.remark,
          }
        });
      }
    } catch (error) {
      console.error("提交表单时出错:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新建告警类别" : "编辑告警类别"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "创建一个新的告警类别，填写必要的信息。" 
              : "编辑告警类别的详细信息。"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>类别编码</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入类别编码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>类别名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入类别名称" {...field} />
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
                    <Textarea 
                      placeholder="请输入类别描述" 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状态</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">启用</SelectItem>
                      <SelectItem value="0">禁用</SelectItem>
                    </SelectContent>
                  </Select>
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
                      className="resize-none" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (mode === "create" ? "创建中..." : "更新中...") 
                  : (mode === "create" ? "创建" : "更新")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 