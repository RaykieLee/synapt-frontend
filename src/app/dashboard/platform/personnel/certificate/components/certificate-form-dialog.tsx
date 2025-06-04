"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Certificate } from "@/types/personnel"
import { certificateAPI, personnelQualificationAPI } from "@/api/personnel"

const formSchema = z.object({
  certificate_name: z.string().min(1, "证书名称不能为空"),
  certificate_category: z.string().min(1, "请选择证书类别"),
  certificate_level: z.number().min(1, "请选择证书级别").max(4, "证书级别无效"),
  issuing_authority: z.string().optional(),
  certificate_number: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  certificate_file: z.string().optional(),
  status: z.string(),
  remark: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CertificateFormDialogProps {
  certificate?: Certificate
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
}

export function CertificateFormDialog({
  certificate,
  open,
  onOpenChange,
  mode,
}: CertificateFormDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificate_name: certificate?.certificate_name || "",
      certificate_category: certificate?.certificate_category || "",
      certificate_level: certificate?.certificate_level || 0,
      issuing_authority: certificate?.issuing_authority || "",
      certificate_number: certificate?.certificate_number || "",
      issue_date: certificate?.issue_date || "",
      expiry_date: certificate?.expiry_date || "",
      certificate_file: certificate?.certificate_file || "",
      status: certificate?.status || "0",
      remark: certificate?.remark || "",
    },
  })

  // 获取证书类别选项
  const { data: categoriesResponse } = useQuery({
    queryKey: ["personnel", "certificate", "categories"],
    queryFn: () => certificateAPI.getCategories(),
  });

  // 获取证书级别选项
  const { data: levelsResponse } = useQuery({
    queryKey: ["personnel", "certificate", "levels"],
    queryFn: () => certificateAPI.getLevels(),
  });

  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.data || []);
  const levels = Array.isArray(levelsResponse) ? levelsResponse : (levelsResponse?.data || []);

  // 创建证书
  const createMutation = useMutation({
    mutationFn: certificateAPI.create,
    onSuccess: () => {
      toast.success("创建成功")
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "list"] })
      queryClient.invalidateQueries({ queryKey: ["personnel", "stats"] })
      onOpenChange(false)
      form.reset()
    },
    onError: () => {
      toast.error("创建失败")
    },
  })

  // 更新证书
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      certificateAPI.update(id, data),
    onSuccess: () => {
      toast.success("更新成功")
      queryClient.invalidateQueries({ queryKey: ["personnel", "certificate", "list"] })
      queryClient.invalidateQueries({ queryKey: ["personnel", "stats"] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error("更新失败")
    },
  })

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      issuing_authority: data.issuing_authority || undefined,
      certificate_number: data.certificate_number || undefined,
      issue_date: data.issue_date || undefined,
      expiry_date: data.expiry_date || undefined,
      certificate_file: data.certificate_file || undefined,
      remark: data.remark || undefined,
    }

    if (mode === "create") {
      createMutation.mutate(submitData)
    } else if (certificate) {
      updateMutation.mutate({ id: certificate.id, data: submitData })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新增证书" : "编辑证书"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "为人员添加新的证书资质信息。" 
              : "修改证书资质信息。"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 证书名称 */}
              <FormField
                control={form.control}
                name="certificate_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>证书名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入证书名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 证书类别 */}
              <FormField
                control={form.control}
                name="certificate_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>证书类别 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择证书类别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 证书级别 */}
              <FormField
                control={form.control}
                name="certificate_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>证书级别 *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择证书级别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels.map((level: any) => (
                          <SelectItem key={level.value} value={level.value.toString()}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 颁发机构 */}
              <FormField
                control={form.control}
                name="issuing_authority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>颁发机构</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入颁发机构" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 证书编号 */}
              <FormField
                control={form.control}
                name="certificate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>证书编号</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入证书编号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 颁发日期 */}
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>颁发日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 有效期至 */}
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>有效期至</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 证书文件 */}
              <FormField
                control={form.control}
                name="certificate_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>证书文件</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入文件URL" {...field} />
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">有效</SelectItem>
                        <SelectItem value="1">无效</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 备注 */}
            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="请输入备注" 
                      className="min-h-[60px]"
                      {...field} 
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
                disabled={isLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "保存中..." : mode === "create" ? "创建" : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 