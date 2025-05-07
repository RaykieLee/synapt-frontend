"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { AlertConfigUpdateDto } from "@/types/alert";
import { alertConfigAPI, alertCategoryAPI } from "@/api";

export default function EditAlertConfigPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const configId = parseInt(params.id);

  // 表单定义
  const form = useForm<AlertConfigUpdateDto>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      threshold: "",
      frequency: 15,
      enabled: true,
      status: "0",
      remark: "",
      category_ids: [],
    },
  });

  // 查询告警配置详情
  const { data: configData, isLoading } = useQuery({
    queryKey: ["alerts", "config", "detail", configId],
    queryFn: () => alertConfigAPI.getDetail(configId),
    enabled: !!configId,
  });

  // 查询所有告警类别
  const { data: categoriesData } = useQuery({
    queryKey: ["alerts", "category", "all"],
    queryFn: () => alertCategoryAPI.getAll(),
  });

  // 更新表单默认值
  useEffect(() => {
    if (configData?.data?.data) {
      const config = configData.data.data;
      form.reset({
        code: config.code,
        name: config.name,
        description: config.description,
        threshold: config.threshold,
        frequency: config.frequency,
        enabled: config.enabled,
        status: config.status,
        remark: config.remark,
        category_ids: config.categories.map((cat) => cat.category_id),
      });
    }
  }, [configData, form]);

  // 更新告警配置
  const updateMutation = useMutation({
    mutationFn: (data: AlertConfigUpdateDto) =>
      alertConfigAPI.update(configId, data),
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
  const onSubmit = (data: AlertConfigUpdateDto) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">加载中...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/platform/alerts">
              告警配置
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>编辑配置</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>编辑告警配置</CardTitle>
          <CardDescription>
            修改告警配置的基本信息和告警规则。
          </CardDescription>
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
                        告警配置的显示名称，如"CPU使用率告警"
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
                        唯一的识别码，如"CPU_USAGE_ALERT"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>告警阈值</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入告警阈值" {...field} />
                      </FormControl>
                      <FormDescription>
                        触发告警的临界值，如"90%"或"5次/分钟"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>告警频率(分钟)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="请输入告警频率"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(isNaN(value) ? "" : value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        告警触发的最小间隔时间，防止频繁告警
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
                        defaultValue={field.value}
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
                      <FormDescription>配置的系统状态</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">启用</FormLabel>
                        <FormDescription>
                          是否启用该告警配置进行实时监控
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

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
                        {categoriesData?.data?.data?.map((category) => (
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
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 