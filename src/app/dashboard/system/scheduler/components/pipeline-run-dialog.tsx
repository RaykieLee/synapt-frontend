"use client"

import React, { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { schedulerApi } from "@/api/scheduler"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PipelineRunDialogProps {
  pipelineId: string
  pipelineName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 动态创建Zod schema的函数
function createZodSchemaFromJsonSchema(jsonSchema: any): z.ZodSchema {
  const shape: Record<string, z.ZodTypeAny> = {}
  
  if (jsonSchema.properties) {
    Object.entries(jsonSchema.properties).forEach(([key, prop]: [string, any]) => {
      let fieldSchema: z.ZodTypeAny
      
      switch (prop.type) {
        case 'string':
          if (prop.format === 'date') {
            fieldSchema = z.string().optional()
          } else {
            let stringSchema = z.string()
            if (prop.minLength) stringSchema = stringSchema.min(prop.minLength)
            if (prop.maxLength) stringSchema = stringSchema.max(prop.maxLength)
            fieldSchema = stringSchema
          }
          break
        case 'integer':
          let intSchema = z.number().int()
          if (prop.minimum !== undefined) intSchema = intSchema.min(prop.minimum)
          if (prop.maximum !== undefined) intSchema = intSchema.max(prop.maximum)
          fieldSchema = intSchema
          break
        case 'number':
          let numSchema = z.number()
          if (prop.minimum !== undefined) numSchema = numSchema.min(prop.minimum)
          if (prop.maximum !== undefined) numSchema = numSchema.max(prop.maximum)
          fieldSchema = numSchema
          break
        case 'boolean':
          fieldSchema = z.boolean()
          break
        case 'array':
          if (prop.items?.type === 'string') {
            fieldSchema = z.array(z.string()).optional()
          } else {
            fieldSchema = z.array(z.any()).optional()
          }
          break
        default:
          fieldSchema = z.any()
      }
      
      // 处理可选字段
      if (!jsonSchema.required?.includes(key) || prop.default !== undefined) {
        if (!(fieldSchema instanceof z.ZodOptional)) {
          fieldSchema = fieldSchema.optional()
        }
      }
      
      shape[key] = fieldSchema
    })
  }
  
  return z.object(shape)
}

// 动态表单字段组件
function DynamicFormField({ 
  name, 
  property, 
  form, 
  control 
}: { 
  name: string
  property: any
  form: any
  control: any 
}) {
  const { type, title, description, default: defaultValue } = property

  switch (type) {
    case 'string':
      if (property.format === 'date') {
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{title || name}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: zhCN })
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )
      } else {
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{title || name}</FormLabel>
                <FormControl>
                  {property.maxLength && property.maxLength > 100 ? (
                    <Textarea
                      placeholder={description || `请输入${title || name}`}
                      {...field}
                    />
                  ) : (
                    <Input
                      placeholder={description || `请输入${title || name}`}
                      {...field}
                    />
                  )}
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )
      }

    case 'integer':
    case 'number':
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title || name}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={description || `请输入${title || name}`}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === '' ? undefined : Number(value))
                  }}
                  value={field.value || ''}
                />
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              {(property.minimum !== undefined || property.maximum !== undefined) && (
                <FormDescription>
                  范围: {property.minimum || 0} - {property.maximum || '无限制'}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case 'boolean':
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{title || name}</FormLabel>
                {description && <FormDescription>{description}</FormDescription>}
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
      )

    case 'array':
      if (property.items?.type === 'string') {
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{title || name}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      placeholder="输入标签后按回车添加"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const value = e.currentTarget.value.trim()
                          if (value && !field.value?.includes(value)) {
                            field.onChange([...(field.value || []), value])
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {field.value?.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                          <button
                            type="button"
                            className="ml-1 text-xs"
                            onClick={() => {
                              const newTags = field.value.filter((_: any, i: number) => i !== index)
                              field.onChange(newTags.length > 0 ? newTags : undefined)
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )
      }
      return null

    default:
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title || name}</FormLabel>
              <FormControl>
                <Input
                  placeholder={description || `请输入${title || name}`}
                  {...field}
                />
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      )
  }
}

export function PipelineRunDialog({
  pipelineId,
  pipelineName,
  open,
  onOpenChange,
}: PipelineRunDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formSchema, setFormSchema] = useState<z.ZodType<any, any, any> | null>(null)

  // 获取管道输入schema
  const { data: schemaData, isLoading: schemaLoading } = useQuery({
    queryKey: ["pipeline", "input-schema", pipelineId],
    queryFn: () => schedulerApi.pipelines.getInputSchema(pipelineId),
    enabled: open,
  })

  // 创建动态表单
  const form = useForm({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
  })

  // 当schema加载完成时，创建Zod schema和设置默认值
  useEffect(() => {
    if (schemaData) {
      const zodSchema = createZodSchemaFromJsonSchema(schemaData)
      setFormSchema(zodSchema)
      
      // 设置默认值
      const defaultValues: Record<string, any> = {}
      if (schemaData.properties) {
        Object.entries(schemaData.properties).forEach(([key, prop]: [string, any]) => {
          if (prop.default !== undefined) {
            defaultValues[key] = prop.default
          }
        })
      }
      form.reset(defaultValues)
    }
  }, [schemaData, form])

  // 运行管道
  const runMutation = useMutation({
    mutationFn: (params: any) => 
      schedulerApi.pipelines.run(pipelineId, { 
        trigger_id: "_manual",  // 手动触发器ID
        params 
      }),
    onSuccess: () => {
      toast({
        title: "成功",
        description: "管道已开始运行",
      })
      queryClient.invalidateQueries({ queryKey: ["scheduler", "runs"] })
      onOpenChange(false)
      form.reset()
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error.message || "运行失败",
        variant: "destructive",
      })
    },
  })

  const onSubmit: SubmitHandler<any> = (data) => {
    runMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>运行管道</DialogTitle>
          <DialogDescription>
            管道名称: {pipelineName}
            <br />
            请填写以下参数来运行管道
          </DialogDescription>
        </DialogHeader>

        {schemaLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">正在加载参数配置...</div>
          </div>
        ) : !schemaData ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">该管道无需参数</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {schemaData.properties && Object.entries(schemaData.properties).map(([key, property]: [string, any]) => (
                <DynamicFormField
                  key={key}
                  name={key}
                  property={property}
                  form={form}
                  control={form.control}
                />
              ))}

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
                  disabled={runMutation.isPending}
                >
                  {runMutation.isPending ? "运行中..." : "开始运行"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
} 