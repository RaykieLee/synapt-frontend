"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { PersonnelQualification } from "@/types/personnel"
import { personnelQualificationAPI } from "@/api/personnel"

const formSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  gender: z.string().min(1, "请选择性别"),
  age: z.number().min(18, "年龄不能小于18岁").max(100, "年龄不能大于100岁").optional(),
  entry_date: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
  department: z.string().optional(),
  position: z.string().optional(),
  education: z.string().optional(),
  major: z.string().optional(),
  work_experience: z.string().optional(),
  status: z.string(),
  remark: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PersonnelFormDialogProps {
  personnel?: PersonnelQualification
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
}

export function PersonnelFormDialog({
  personnel,
  open,
  onOpenChange,
  mode,
}: PersonnelFormDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: personnel?.name || "",
      gender: personnel?.gender || "",
      age: personnel?.age || undefined,
      entry_date: personnel?.entry_date || "",
      phone: personnel?.phone || "",
      email: personnel?.email || "",
      department: personnel?.department || "",
      position: personnel?.position || "",
      education: personnel?.education || "",
      major: personnel?.major || "",
      work_experience: personnel?.work_experience || "",
      status: personnel?.status || "0",
      remark: personnel?.remark || "",
    },
  })

  // 创建人员资质
  const createMutation = useMutation({
    mutationFn: personnelQualificationAPI.create,
    onSuccess: () => {
      toast.success("创建成功")
      queryClient.invalidateQueries({ queryKey: ["personnel", "qualification", "list"] })
      queryClient.invalidateQueries({ queryKey: ["personnel", "stats"] })
      onOpenChange(false)
      form.reset()
    },
    onError: () => {
      toast.error("创建失败")
    },
  })

  // 更新人员资质
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      personnelQualificationAPI.update(id, data),
    onSuccess: () => {
      toast.success("更新成功")
      queryClient.invalidateQueries({ queryKey: ["personnel", "qualification", "list"] })
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
      age: data.age ? Number(data.age) : undefined,
      email: data.email || undefined,
    }

    if (mode === "create") {
      createMutation.mutate(submitData)
    } else if (personnel) {
      updateMutation.mutate({ id: personnel.id, data: submitData })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新增人员资质" : "编辑人员资质"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "填写人员基本信息，创建新的人员资质档案。" 
              : "修改人员基本信息。"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 姓名 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 性别 */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性别 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择性别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="男">男</SelectItem>
                        <SelectItem value="女">女</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 年龄 */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年龄</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="请输入年龄" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 入职时间 */}
              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入职时间</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 联系电话 */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>联系电话</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入联系电话" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 邮箱 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入邮箱" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 部门 */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>部门</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入部门" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 职位 */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>职位</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入职位" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 学历 */}
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学历</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入学历" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 专业 */}
              <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>专业</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入专业" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
            </div>

            {/* 工作经历 */}
            <FormField
              control={form.control}
              name="work_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>工作经历</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="请输入工作经历" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
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