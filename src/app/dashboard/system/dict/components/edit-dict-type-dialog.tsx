"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/animate-ui/radix/dialog"
import {
  Form,
  FormControl,
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

import { dictAPI } from "@/api/dict"
import { DictType } from "@/types/dict"

// 表单验证规则
const dictTypeFormSchema = z.object({
  dict_name: z.string().min(1, "字典名称不能为空"),
  dict_type: z.string().min(1, "字典类型不能为空"),
  status: z.string().min(1, "状态不能为空"),
  remark: z.string().optional()
});

type DictTypeFormValues = z.infer<typeof dictTypeFormSchema>;

interface EditDictTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dictType: DictType | null
}

export function EditDictTypeDialog({
  open,
  onOpenChange,
  dictType,
}: EditDictTypeDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<DictTypeFormValues>({
    resolver: zodResolver(dictTypeFormSchema),
    defaultValues: {
      dict_name: "",
      dict_type: "",
      status: "0",
      remark: ""
    }
  })

  // 当dictType变化时，更新表单值
  useEffect(() => {
    if (dictType) {
      form.reset({
        dict_name: dictType.dict_name,
        dict_type: dictType.dict_type,
        status: dictType.status,
        remark: dictType.remark || ""
      });
    }
  }, [dictType, form]);

  // 更新字典类型
  const updateMutation = useMutation({
    mutationFn: (data: DictTypeFormValues) => {
      if (!dictType) throw new Error("当前字典类型不存在");
      const formData = {
        ...data,
        status: String(data.status)
      };
      return dictAPI.updateDictType(dictType.dict_id, formData);
    },
    onSuccess: () => {
      toast.success("更新成功", {
        description: "字典类型已成功更新"
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["dictTypeList"] });
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: `${error}`
      });
    }
  });

  const handleSubmit = (data: DictTypeFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>编辑字典类型</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dict_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>字典名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="请输入字典名称" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dict_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>字典类型</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="请输入字典类型" />
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
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">正常</SelectItem>
                      <SelectItem value="1">停用</SelectItem>
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
                    <Textarea {...field} placeholder="请输入备注" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "更新中..." : "确认"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 