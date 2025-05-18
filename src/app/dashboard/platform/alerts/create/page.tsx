"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AlertConfigCreateDto, AlertConfigUpdateDto } from "@/types/alert";
import { alertConfigAPI, alertCategoryAPI } from "@/api";

export default function AlertConfigFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const configId = searchParams.get("id");

  // 是否为编辑模式
  const isEditMode = !!configId;

  // 表单定义 - 使用泛型联合类型，适用于创建和编辑
  const form = useForm<AlertConfigCreateDto & AlertConfigUpdateDto>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      status: "0",
      remark: "",
      category_ids: [],
    },
  });

  // 查询告警配置详情 (编辑模式)
  const { data: configData, isLoading: isConfigLoading } = useQuery({
    queryKey: ["alerts", "config", "detail", configId],
    queryFn: () => alertConfigAPI.getDetail(parseInt(configId!)),
    enabled: isEditMode,
  });

  // 查询所有告警类别
  const { data: categoriesData } = useQuery({
    queryKey: ["alerts", "category", "all"],
    queryFn: () => alertCategoryAPI.getAll(),
  });

  // 页面标题和描述
  const [pageTitle, setPageTitle] = useState("新建告警配置");
  const [pageDescription, setPageDescription] = useState("创建一个新的告警配置，用于系统告警触发和通知。");

  // 更新表单默认值 (编辑模式)
  useEffect(() => {
    if (isEditMode) {
      setPageTitle("编辑告警配置");
      setPageDescription("修改告警配置的基本信息和告警规则。");
    }

    if (isEditMode && configData?.data) {
      const config = configData.data;
      form.reset({
        code: config.code,
        name: config.name,
        description: config.description,
        status: config.status,
        remark: config.remark,
        category_ids: config.categories?.map((cat) => cat.category_id) || [],
      });
    }
  }, [configData, form, isEditMode]);

  // 创建告警配置
  const createMutation = useMutation({
    mutationFn: (data: AlertConfigCreateDto) => alertConfigAPI.create(data),
    onSuccess: () => {
      toast.success("创建成功");
      queryClient.invalidateQueries({ queryKey: ["alerts", "config"] });
      router.push("/dashboard/platform/alerts");
    },
    onError: (error) => {
      toast.error(`创建失败: ${error}`);
    },
  });

  // 更新告警配置
  const updateMutation = useMutation({
    mutationFn: (data: AlertConfigUpdateDto) =>
      alertConfigAPI.update(parseInt(configId!), data),
    onSuccess: () => {
      toast.success("更新成功");
      queryClient.invalidateQueries({ queryKey: ["alerts", "config"] });
      router.push("/dashboard/platform/alerts");
    },
    onError: (error) => {
      toast.error(`更新失败: ${error}`);
    },
  });

  // 提交表单
  const onSubmit = (data: AlertConfigCreateDto & AlertConfigUpdateDto) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // 加载状态
  if (isEditMode && isConfigLoading) {
    return <div className="container mx-auto py-6">加载中...</div>;
  }

  // 操作状态
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>{pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "配置名称不能为空" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>配置名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入配置名称" {...field} />
                      </FormControl>
                      <FormDescription>
                        告警配置的显示名称，如&ldquo;CPU使用率告警&rdquo;
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  rules={{ required: "配置编码不能为空" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>配置编码</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入配置编码" {...field} />
                      </FormControl>
                      <FormDescription>
                        唯一的识别码，如&ldquo;CPU_USAGE_ALERT&rdquo;
                      </FormDescription>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">启用</SelectItem>
                          <SelectItem value="1">停用</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>配置是否启用，用于控制告警是否生效</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {categoriesData?.data && categoriesData.data.length > 0 && (
                  <FormField
                    control={form.control}
                    name="category_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>告警类别</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const values = value.split(",").map(Number);
                            field.onChange(values);
                          }}
                          value={
                            field.value && field.value.length > 0
                              ? field.value.join(",")
                              : undefined
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择告警类别（可多选）" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesData.data.map((category) => (
                              <SelectItem
                                key={category.category_id}
                                value={category.category_id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          选择该告警配置所属的类别，用于分类管理
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置说明</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入配置说明"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      详细描述该告警配置的用途和触发条件
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
                        placeholder="请输入备注信息"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/platform/alerts")}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 