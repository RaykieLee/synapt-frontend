"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/animate-ui/radix/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { llmConfigAPI } from "@/api/llm";
import { LLMConfig, ModelType, LLMSubcategory } from "@/types/llm";
import { toast } from "sonner";

const formSchema = z.object({
  config_name: z.string().min(1, "配置名称不能为空"),
  model_type: z.nativeEnum(ModelType, { required_error: "请选择模型类型" }),
  llm_subcategories: z.array(z.nativeEnum(LLMSubcategory)).optional(),
  provider: z.string().min(1, "提供商不能为空"),
  model_name: z.string().min(1, "模型名称不能为空"),
  api_key: z.string().min(1, "API密钥不能为空"),
  base_url: z.string().url("请输入有效的URL").optional().or(z.literal("")),
  description: z.string().optional(),
  status: z.string().min(1, "状态不能为空"),
  max_tokens: z.number().min(1, "最大token数必须大于0").optional(),
  temperature: z.number().min(0).max(2, "温度值必须在0-2之间").optional(),
  timeout: z.number().min(1, "超时时间必须大于0").optional(),
  max_retries: z.number().min(1, "最大重试次数必须大于0").optional(),
  remark: z.string().optional(),
});

interface CreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: LLMConfig | null;
  onSuccess?: () => void;
}

export function CreateEditDialog({ 
  open, 
  onOpenChange, 
  config, 
  onSuccess 
}: CreateEditDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      config_name: "",
      model_type: ModelType.LLM,
      llm_subcategories: [],
      provider: "",
      model_name: "",
      api_key: "",
      base_url: "",
      description: "",
      status: "0",
      max_tokens: 2048,
      temperature: 0.7,
      timeout: 30,
      max_retries: 3,
      remark: "",
    },
  });

  // 编辑时填充表单数据
  useEffect(() => {
    if (config) {
      form.reset({
        config_name: config.config_name,
        model_type: config.model_type || ModelType.LLM,
        llm_subcategories: config.llm_subcategories || [],
        provider: config.provider,
        model_name: config.model_name,
        api_key: config.api_key,
        base_url: config.base_url || "",
        description: config.description || "",
        status: config.status,
        max_tokens: config.max_tokens || 2048,
        temperature: config.temperature || 0.7,
        timeout: config.timeout || 30,
        max_retries: config.max_retries || 3,
        remark: config.remark || "",
      });
    } else {
      form.reset({
        config_name: "",
        model_type: ModelType.LLM,
        llm_subcategories: [],
        provider: "",
        model_name: "",
        api_key: "",
        base_url: "",
        description: "",
        status: "0",
        max_tokens: 2048,
        temperature: 0.7,
        timeout: 30,
        max_retries: 3,
        remark: "",
      });
    }
  }, [config, form]);

  const createMutation = useMutation({
    mutationFn: llmConfigAPI.create,
    onSuccess: () => {
      toast.success("创建成功");
      queryClient.invalidateQueries({ queryKey: ["llm"] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      llmConfigAPI.update(id, data),
    onSuccess: () => {
      toast.success("更新成功");
      queryClient.invalidateQueries({ queryKey: ["llm"] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (config) {
        await updateMutation.mutateAsync({
          id: config.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {config ? "编辑大模型配置" : "创建大模型配置"}
          </DialogTitle>
          <DialogDescription>
            {config 
              ? "修改大模型配置信息" 
              : "添加新的大语言模型配置"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


            <FormField
              control={form.control}
              name="config_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>配置名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：GPT-4配置" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模型类型</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择模型类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ModelType.LLM}>LLM (大语言模型)</SelectItem>
                      <SelectItem value={ModelType.EMBEDDING}>Embedding (嵌入模型)</SelectItem>
                      <SelectItem value={ModelType.SPEECH2TEXT}>Speech2text (语音转文字)</SelectItem>
                      <SelectItem value={ModelType.TTS}>TTS (文字转语音)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LLM子类别选择 - 仅当模型类型为LLM时显示 */}
            {form.watch("model_type") === ModelType.LLM && (
              <FormField
                control={form.control}
                name="llm_subcategories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LLM子类别 (可多选)</FormLabel>
                    <FormDescription>
                      选择该LLM模型支持的功能类别
                    </FormDescription>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(LLMSubcategory).map((subcategory) => {
                        const isSelected = field.value?.includes(subcategory) || false;
                        const getSubcategoryInfo = (sub: LLMSubcategory) => {
                          switch (sub) {
                            case LLMSubcategory.CHAT:
                              return { label: "对话聊天", description: "支持多轮对话交互" };
                            case LLMSubcategory.VISION:
                              return { label: "视觉理解", description: "支持图像识别和理解" };
                            case LLMSubcategory.TOOLS:
                              return { label: "工具调用", description: "支持函数调用和工具使用" };
                            case LLMSubcategory.THINKING:
                              return { label: "思维链", description: "支持推理思考过程" };
                            default:
                              return { label: sub, description: "" };
                          }
                        };
                        const info = getSubcategoryInfo(subcategory);

                        return (
                          <div
                            key={subcategory}
                            className={`
                              relative cursor-pointer rounded-lg border-2 p-3 transition-all
                              ${isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                              }
                            `}
                            onClick={() => {
                              const currentValue = field.value || [];
                              if (isSelected) {
                                field.onChange(currentValue.filter((item) => item !== subcategory));
                              } else {
                                field.onChange([...currentValue, subcategory]);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`
                                w-4 h-4 rounded-full border-2 flex items-center justify-center
                                ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}
                              `}>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{info.label}</div>
                                <div className="text-xs text-muted-foreground">{info.description}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 提供商字段 - 仅LLM类型显示 */}
            {form.watch("model_type") === ModelType.LLM && (
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>提供商</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择提供商" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="azure">Azure</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="moonshot">Moonshot</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="model_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模型名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：gpt-4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API密钥</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="输入API密钥" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>基础URL（可选）</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="例如：https://api.openai.com/v1" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述（可选）</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="配置描述信息..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LLM特有参数 - 仅LLM类型显示 */}
            {form.watch("model_type") === ModelType.LLM && (
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="max_tokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最大Token数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>温度值</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>超时时间（秒）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">启用配置</FormLabel>
                    <FormDescription>
                      启用后该配置可用于调用大模型
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "0"}
                      onCheckedChange={(checked) => field.onChange(checked ? "0" : "1")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              >
                {isSubmitting ? "保存中..." : config ? "更新" : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}