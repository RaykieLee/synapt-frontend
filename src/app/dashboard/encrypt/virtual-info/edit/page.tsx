"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"

// Tabs are used in child form component
import { Form } from "@/components/ui/form"

import { VirtualInfoForm } from "./virtual-info-form"
import { virtualInfoAPI } from "@/api/encrypt"
import { VirtualInfoCreateDto, VirtualInfoUpdateDto } from "@/types/encrypt"

// 表单验证Schema
const virtualInfoSchema = z.object({
  // 基本信息
  first: z.string().optional(),
  last: z.string().optional(),
  gender: z.string().optional(),
  nat: z.string().optional(),
  
  // 联系方式
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  // 联系方式类字段精简：移除 gmail/x/discord，保留 email（如后续不需要可再移除）
  
  // 地址信息
  street_number: z.string().optional(),
  street_name: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postcode: z.string().optional(),
  coordinates_latitude: z.number().optional(),
  coordinates_longitude: z.number().optional(),
  
  // 账户信息
  username: z.string().optional(),
  password: z.string().optional(),
  ssn: z.string().optional(),
  picture: z.string().optional(),
  // UI-only field for toggling password visibility
  show_password: z.boolean().optional(),
  
  // 安全信息
  seed: z.string().optional(),
  wallet_word: z.string().optional(),
  
  // 其他设置
  status: z.string().optional(),
  remark: z.string().optional(),
})

type VirtualInfoFormData = z.infer<typeof virtualInfoSchema>

export default function VirtualInfoEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const idParam = searchParams.get('id')
  const editId: string = idParam ?? ""
  const isEdit = !!idParam

  // 表单初始化
  const form = useForm<VirtualInfoFormData>({
    resolver: zodResolver(virtualInfoSchema),
    defaultValues: {
      // 基本信息
      first: "",
      last: "",
      gender: "",
      nat: "",
      
  // 联系信息（已精简，仅保留 email，如无需要可删除）
  email: "",
      
      // 地址信息
      street_number: "",
      street_name: "",
      city: "",
      state: "",
      country: "",
      postcode: "",
      coordinates_latitude: undefined,
      coordinates_longitude: undefined,
      
      // 账户信息
      username: "",
      password: "",
      ssn: "",
      picture: "",
      
      // 安全信息
      seed: "",
      wallet_word: "",
      
      // 其他设置
      status: "0",
      remark: "",
    },
  })

  // 获取详情（编辑模式）
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["encrypt", "virtual-info", "detail", editId],
    queryFn: () => virtualInfoAPI.getDetail(editId),
    enabled: isEdit,
  })

  // 当获取到详情后重置表单
  useEffect(() => {
    if (isEdit && detail) {
      form.reset({
        // 基本信息
        first: detail.first || "",
        last: detail.last || "",
        gender: detail.gender || "",
        nat: detail.nat || "",
        
  // 联系信息（已精简，仅保留 email，如无需要可删除）
  email: detail.email || "",
        
        // 地址信息
        street_number: detail.street_number || "",
        street_name: detail.street_name || "",
        city: detail.city || "",
        state: detail.state || "",
        country: detail.country || "",
        postcode: detail.postcode || "",
        coordinates_latitude: detail.coordinates_latitude,
        coordinates_longitude: detail.coordinates_longitude,
        
        // 账户信息
        username: detail.username || "",
        password: detail.password || "",
        ssn: detail.ssn || "",
        picture: detail.picture || "",
        
        // 安全信息
        seed: detail.seed || "",
        wallet_word: detail.wallet_word || "",
        
        // 其他设置
        status: detail.status || "0",
        remark: detail.remark || "",
      })
    }
  }, [detail, isEdit, form])

  // 创建/更新变异
  const mutation = useMutation({
    mutationFn: (data: VirtualInfoCreateDto | VirtualInfoUpdateDto) =>
      isEdit 
        ? virtualInfoAPI.update(editId, data)
        : virtualInfoAPI.create(data),
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
  // 移除仅用于前端显示控制的字段
  const { show_password, ...payload } = data as any
  mutation.mutate(payload)
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
            {(() => {
              let submitLabel = "创建"
              if (isEdit) submitLabel = "更新"
              if (mutation.isPending) submitLabel = "保存中..."
              return (
                <Button type="submit" disabled={mutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {submitLabel}
                </Button>
              )
            })()}
          </div>
        </form>
      </Form>
    </div>
  )
} 