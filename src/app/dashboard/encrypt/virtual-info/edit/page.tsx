"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form } from "@/components/ui/form"

import { VirtualInfoForm } from "./virtual-info-form"
import { virtualInfoAPI } from "@/api/encrypt"
import { VirtualInfoCreateDto, VirtualInfoUpdateDto } from "@/types/encrypt"

// 表单验证Schema
const virtualInfoSchema = z.object({
  first: z.string().optional(),
  last: z.string().optional(),
  gender: z.string().optional(),
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  phone: z.string().optional(),
  username: z.string().optional(),
  status: z.string().optional(),
  remark: z.string().optional(),
})

type VirtualInfoFormData = z.infer<typeof virtualInfoSchema>

export default function VirtualInfoEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const id = searchParams.get('id')
  const isEdit = !!id

  // 表单初始化
  const form = useForm<VirtualInfoFormData>({
    resolver: zodResolver(virtualInfoSchema),
    defaultValues: {
      first: "",
      last: "",
      gender: "",
      email: "",
      phone: "",
      username: "",
      status: "0",
      remark: "",
    },
  })

  // 获取详情（编辑模式）
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["encrypt", "virtual-info", "detail", id],
    queryFn: () => virtualInfoAPI.getDetail(id!),
    enabled: isEdit,
  })

  // 当获取到详情后重置表单
  useEffect(() => {
    if (isEdit && detail) {
      form.reset({
        first: detail.first || "",
        last: detail.last || "",
        gender: detail.gender || "",
        email: detail.email || "",
        phone: detail.phone || "",
        username: detail.username || "",
        status: detail.status || "0",
        remark: detail.remark || "",
      })
    }
  }, [detail, isEdit, form])

  // 创建/更新变异
  const mutation = useMutation({
    mutationFn: (data: VirtualInfoCreateDto | VirtualInfoUpdateDto) =>
      isEdit 
        ? virtualInfoAPI.update(id!, data as VirtualInfoUpdateDto)
        : virtualInfoAPI.create(data as VirtualInfoCreateDto),
    onSuccess: () => {
      toast({
        title: "成功",
        description: isEdit ? "更新成功" : "创建成功",
      })
      queryClient.invalidateQueries({ queryKey: ["encrypt", "virtual-info", "list"] })
      router.push("/dashboard/encrypt/virtual-info")
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: `${isEdit ? "更新" : "创建"}失败: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: VirtualInfoFormData) => {
    mutation.mutate(data)
  }

  const handleCancel = () => {
    router.push("/dashboard/encrypt/virtual-info")
  }

  if (isEdit && detailLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? "编辑虚拟信息" : "新增虚拟信息"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "修改虚拟身份信息数据" : "创建新的虚拟身份信息"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">虚拟信息详细设置</h3>
              <p className="text-sm text-muted-foreground">
                请填写虚拟身份的相关信息
              </p>
            </div>
            <VirtualInfoForm form={form} />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={mutation.isPending}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {mutation.isPending ? "保存中..." : isEdit ? "更新" : "创建"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 