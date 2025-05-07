"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { AlertConfigCreateDto } from "@/types/alert";
import { alertConfigAPI } from "@/api";

export default function CreateAlertConfigPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 表单定义
  const form = useForm<AlertConfigCreateDto>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      threshold: "",
      frequency: 15,
      status: "0",
      remark: "",
    },
  });

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

  // 提交表单
  const onSubmit = (data: AlertConfigCreateDto) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>新建告警配置</CardTitle>
          <CardDescription>
            创建一个新的告警配置，用于系统告警触发和通知。
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
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 