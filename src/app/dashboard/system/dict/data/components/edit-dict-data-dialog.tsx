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
import { DictData } from "@/types/dict"

// 表单验证规则
const dictDataFormSchema = z.object({
  dict_sort: z.coerce.number().min(0, "排序不能小于0"),
  dict_label: z.string().min(1, "标签不能为空"),
  dict_value: z.string().min(1, "键值不能为空"),
  dict_type: z.string().min(1, "字典类型不能为空"),
  is_default: z.string(),
  status: z.string().min(1, "状态不能为空"),
  remark: z.string().optional()
});

type DictDataFormValues = z.infer<typeof dictDataFormSchema>;

interface EditDictDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: DictData | null
}

export function EditDictDataDialog({
  open,
  onOpenChange,
  data
}: EditDictDataDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<DictDataFormValues>({
    resolver: zodResolver(dictDataFormSchema),
    defaultValues: {
      dict_sort: 0,
      dict_label: "",
      dict_value: "",
      dict_type: "",
      is_default: "N",
      status: "0",
      remark: ""
    }
  })

  // 当数据变化时重置表单
  useEffect(() => {
    if (data) {
      form.reset({
        dict_sort: data.dict_sort || 0,
        dict_label: data.dict_label || "",
        dict_value: data.dict_value || "",
        dict_type: data.dict_type || "",
        is_default: data.is_default || "N",
        status: String(data.status) || "0",
        remark: data.remark || ""
      })
    }
  }, [data, form])

  // 更新字典数据
  const updateMutation = useMutation({
    mutationFn: (updateData: DictDataFormValues) => {
      if (!data?.dict_code) {
        throw new Error("字典数据ID不存在");
      }
      const formData = {
        ...updateData,
        status: String(updateData.status),
        is_default: String(updateData.is_default)
      };
      return dictAPI.updateDictData(data.dict_code, formData);
    },
    onSuccess: () => {
      toast.success("更新成功", {
        description: "字典数据已成功更新"
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["dictDataList"] });
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: `${error}`
      });
    }
  });

  const handleSubmit = (updateData: DictDataFormValues) => {
    updateMutation.mutate(updateData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑字典数据</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dict_sort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>排序</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="请输入排序号" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dict_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>字典标签</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="请输入字典标签" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dict_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>字典键值</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="请输入字典键值" />
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
              name="is_default"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>是否默认</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择是否默认" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Y">是</SelectItem>
                      <SelectItem value="N">否</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea 
                      {...field} 
                      placeholder="请输入备注（可选）" 
                      className="min-h-[100px]"
                    />
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