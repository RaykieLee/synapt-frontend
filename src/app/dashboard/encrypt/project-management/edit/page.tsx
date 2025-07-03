"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Upload } from "lucide-react"

import { projectManagementAPI } from "@/api/encrypt/project-management"
import { ProjectManagementCreateDto, ProjectManagementUpdateDto } from "@/types/encrypt/project-management"

// 表单验证规则
const formSchema = z.object({
  project_code: z.string().optional(),
  project_name: z.string().min(1, "项目名称不能为空").max(200, "项目名称不能超过200字符"),
  logo_url: z.string().optional(),
  official_website: z.string().url("请输入有效的网址").optional().or(z.literal("")),
  support_chain: z.string().max(100, "支持链不能超过100字符").optional(),
  sector: z.string().max(100, "所属板块不能超过100字符").optional(),
  track: z.string().max(100, "赛道不能超过100字符").optional(),
  has_token: z.string().optional(),
  current_status: z.string().optional(),
  twitter_followers: z.number().min(0, "推特粉丝数不能为负数").optional(),
  financing_amount: z.string().max(100, "融资金额不能超过100字符").optional(),
  project_description: z.string().optional(),
  detailed_description: z.string().optional(),
  participation_points: z.string().optional(),
  profit_summary: z.string().optional(),
  status: z.string().optional(),
  remark: z.string().max(500, "备注不能超过500字符").optional(),
})

type FormData = z.infer<typeof formSchema>

export default function ProjectManagementEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const id = searchParams.get('id')
  const isEdit = !!id

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_code: "",
      project_name: "",
      logo_url: "",
      official_website: "",
      support_chain: "",
      sector: "",
      track: "",
      has_token: "0",
      current_status: "not_started",
      twitter_followers: 0,
      financing_amount: "",
      project_description: "",
      detailed_description: "",
      participation_points: "",
      profit_summary: "",
      status: "0",
      remark: "",
    },
  })

  // 获取项目详情（编辑模式）
  const { data: projectDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["encrypt", "project-management", "detail", id],
    queryFn: () => projectManagementAPI.getDetail(id!),
    enabled: isEdit,
  })

  // 当获取到详情后重置表单
  useEffect(() => {
    if (isEdit && projectDetail) {
      form.reset({
        project_code: projectDetail.project_code || "",
        project_name: projectDetail.project_name || "",
        logo_url: projectDetail.logo_url || "",
        official_website: projectDetail.official_website || "",
        support_chain: projectDetail.support_chain || "",
        sector: projectDetail.sector || "",
        track: projectDetail.track || "",
        has_token: projectDetail.has_token || "0",
        current_status: projectDetail.current_status || "not_started",
        twitter_followers: projectDetail.twitter_followers || 0,
        financing_amount: projectDetail.financing_amount || "",
        project_description: projectDetail.project_description || "",
        detailed_description: projectDetail.detailed_description || "",
        participation_points: projectDetail.participation_points || "",
        profit_summary: projectDetail.profit_summary || "",
        status: projectDetail.status || "0",
        remark: projectDetail.remark || "",
      })
    }
  }, [isEdit, projectDetail, form])

  // 提交处理
  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEdit) {
        const updateData: ProjectManagementUpdateDto = {
          ...data,
          official_website: data.official_website || undefined,
        }
        return projectManagementAPI.update(id!, updateData)
      } else {
        const createData: ProjectManagementCreateDto = {
          ...data,
          official_website: data.official_website || undefined,
        }
        return projectManagementAPI.create(createData)
      }
    },
    onSuccess: () => {
      toast({
        title: "成功",
        description: isEdit ? "项目更新成功" : "项目创建成功",
      })
      queryClient.invalidateQueries({ queryKey: ["encrypt", "project-management", "list"] })
      router.push("/dashboard/encrypt/project-management")
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: `${isEdit ? "更新" : "创建"}失败: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (data: FormData) => {
    saveMutation.mutate(data)
  }

  const handleCancel = () => {
    router.push("/dashboard/encrypt/project-management")
  }

  if (isEdit && isLoadingDetail) {
    return (
      <div className="container mx-auto px-0 py-6 md:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p>加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "编辑项目" : "新增项目"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "修改项目信息" : "创建新的加密项目"}
            </p>
          </div>
        </div>

        {/* 表单 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="project_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>项目编号</FormLabel>
                        <FormControl>
                          <Input placeholder="输入项目编号" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="project_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>项目名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder="输入项目名称" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>项目LOGO</FormLabel>
                        <FormControl>
                          <Input placeholder="输入LOGO图片URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="official_website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>项目官网</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 项目分类 */}
            <Card>
              <CardHeader>
                <CardTitle>项目分类</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="support_chain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>支持链</FormLabel>
                        <FormControl>
                          <Input placeholder="如：Ethereum, BSC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>所属板块</FormLabel>
                        <FormControl>
                          <Input placeholder="如：DeFi, NFT, GameFi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="track"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>赛道</FormLabel>
                        <FormControl>
                          <Input placeholder="项目所属赛道" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 项目状态 */}
            <Card>
              <CardHeader>
                <CardTitle>项目状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="has_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>是否发币</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择发币状态" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">否</SelectItem>
                            <SelectItem value="1">是</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="current_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>当前状态</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择项目状态" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_started">未开始</SelectItem>
                            <SelectItem value="in_progress">进行中</SelectItem>
                            <SelectItem value="completed">已结束</SelectItem>
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
                        <FormLabel>启用状态</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择启用状态" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">启用</SelectItem>
                            <SelectItem value="1">停用</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 数据指标 */}
            <Card>
              <CardHeader>
                <CardTitle>数据指标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="twitter_followers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>推特粉丝数</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="financing_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>融资金额</FormLabel>
                        <FormControl>
                          <Input placeholder="如：$10M Series A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 详细信息 */}
            <Card>
              <CardHeader>
                <CardTitle>详细信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="project_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>项目介绍</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="简要介绍项目的核心功能和特点..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="detailed_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>详细介绍</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="详细介绍项目的技术架构、商业模式、发展规划等深度信息..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="participation_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>参与点</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="描述如何参与此项目、参与条件、奖励机制等..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profit_summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>收益总情况</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="记录项目的收益情况、回报率、收益分析等..."
                          className="min-h-[100px]"
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
                          placeholder="其他需要记录的信息..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saveMutation.isPending}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "保存中..." : (isEdit ? "更新" : "创建")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
