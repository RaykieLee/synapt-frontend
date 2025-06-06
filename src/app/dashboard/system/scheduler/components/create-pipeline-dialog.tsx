"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

import { schedulerApi } from "@/api/scheduler"
import { PipelineCreate } from "@/types/scheduler"

// 表单验证模式
const formSchema = z.object({
  name: z.string().min(1, "管道名称不能为空").max(100, "管道名称不能超过100个字符"),
  description: z.string().optional(),
  enabled: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface CreatePipelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePipelineDialog({
  open,
  onOpenChange,
}: CreatePipelineDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      enabled: true,
    },
  })

  // 创建管道
  const createMutation = useMutation({
    mutationFn: (data: PipelineCreate) => schedulerApi.pipelines.create(data),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "管道创建成功",
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "pipelines"] })
      onOpenChange(false)
      form.reset()
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "创建管道失败",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (values: FormValues) => {
    const createData: PipelineCreate = {
      name: values.name,
      description: values.description || undefined,
      enabled: values.enabled,
    }
    createMutation.mutate(createData)
  }

  const handleCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" from="top">
        <DialogHeader>
          <DialogTitle>新建管道</DialogTitle>
          <DialogDescription>
            创建一个新的调度管道。管道创建后，您可以为其添加任务和触发器。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>管道名称 *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="输入管道的显示名称" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      用于在界面中显示的友好名称
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="输入管道的描述信息（可选）"
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      描述管道的用途和功能
                    </FormDescription>
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
                      <FormLabel className="text-base">启用管道</FormLabel>
                      <FormDescription>
                        创建后立即启用此管道
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

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={createMutation.isPending}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                创建管道
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 