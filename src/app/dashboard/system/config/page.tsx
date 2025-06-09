"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/animate-ui/radix/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { configAPI } from "@/api/config";
import { Config, ConfigQuery, ConfigSearchParams } from "@/types/config";
import { createColumns } from "./components/columns";
import { DataTable } from "./components/data-table";

// 表单验证规则
const configFormSchema = z.object({
  config_name: z.string().min(1, "配置名称不能为空"),
  config_key: z.string().min(1, "配置键名不能为空"),
  config_value: z.string().min(1, "配置值不能为空"),
  status: z.string().min(1, "状态不能为空"),
  remark: z.string().optional(),
  group_name: z.string().optional(),
  is_frontend: z.boolean().optional()
});

// 表单数据类型
type ConfigFormValues = z.infer<typeof configFormSchema>;

export default function ConfigPage() {
  const queryClient = useQueryClient();
  
  // 弹窗状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // 当前编辑的配置
  const [currentConfig, setCurrentConfig] = useState<Config | null>(null);
  
  // 状态管理
  const [query, setQuery] = useState<ConfigQuery>({
    page_num: 1,
    page_size: 10,
    sorts: [
      {
        field: "create_time",
        order: "desc"
      }
    ],
    params: {
      search_mode: "and"
    }
  });

  // 查询配置列表
  const { data: response, isLoading } = useQuery({
    queryKey: ["configs", "list", query],
    queryFn: () => configAPI.getList(query),
  });

  // 从响应中提取数据  
  const list = response?.rows || [];
  const total = response?.total || 0;
  const pages = Math.ceil(total / (query.page_size || 10));

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page_num: page }));
  }, []);

  // 处理排序变化
  const handleSortingChange = useCallback((sorting: SortingState) => {
    setQuery((prev) => ({
      ...prev,
      sorts: sorting.map((sort) => ({
        field: sort.id,
        order: sort.desc ? "desc" : "asc"
      }))
    }));
  }, []);

  // 处理搜索
  const handleSearch = useCallback((params: ConfigSearchParams) => {
    console.log('搜索参数：', params);
    
    setQuery((prev) => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        keywords: {
          config_name: params.config_name,
          config_key: params.config_key,
        },
        status: params.status,
        search_mode: "and"
      }
    }));
  }, []);

  // 创建配置表单
  const createForm = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      config_name: "",
      config_key: "",
      config_value: "",
      status: "0",
      remark: "",
      group_name: "",
      is_frontend: false
    }
  });
  
  // 编辑配置表单
  const editForm = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      config_name: "",
      config_key: "",
      config_value: "",
      status: "0",
      remark: "",
      group_name: "",
      is_frontend: false
    }
  });

  // 创建配置
  const createConfigMutation = useMutation({
    mutationFn: (data: ConfigFormValues) => configAPI.create({
      config_name: data.config_name,
      config_key: data.config_key,
      config_value: data.config_value,
      status: data.status,
      remark: data.remark,
      group_name: data.group_name,
      is_frontend: data.is_frontend
    }),
    onSuccess: () => {
      toast({
        title: "创建成功",
        description: "配置已成功创建"
      });
      setShowCreateDialog(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["configs"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "创建失败",
        description: `${error}`
      });
    }
  });
  
  // 更新配置
  const updateConfigMutation = useMutation({
    mutationFn: (data: ConfigFormValues) => {
      if (!currentConfig) throw new Error("当前配置不存在");
      return configAPI.update({
        id: currentConfig.config_id,
        config_name: data.config_name,
        config_key: data.config_key,
        config_value: data.config_value,
        status: data.status,
        remark: data.remark,
        group_name: data.group_name,
        is_frontend: data.is_frontend
      });
    },
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "配置已成功更新"
      });
      setShowEditDialog(false);
      setCurrentConfig(null);
      queryClient.invalidateQueries({ queryKey: ["configs"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: `${error}`
      });
    }
  });
  
  // 删除配置
  const deleteConfigMutation = useMutation({
    mutationFn: (configId: number) => configAPI.delete(configId),
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "配置已成功删除"
      });
      setShowDeleteDialog(false);
      setCurrentConfig(null);
      queryClient.invalidateQueries({ queryKey: ["configs"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: `${error}`
      });
    }
  });

  // 打开编辑弹窗
  const openEditDialog = (config: Config) => {
    setCurrentConfig(config);
    editForm.reset({
      config_name: config.config_name,
      config_key: config.config_key,
      config_value: config.config_value,
      status: config.status,
      remark: config.remark || "",
      group_name: config.group_name || "",
      is_frontend: config.is_frontend || false
    });
    setShowEditDialog(true);
  };
  
  // 打开删除弹窗
  const openDeleteDialog = (config: Config) => {
    setCurrentConfig(config);
    setShowDeleteDialog(true);
  };
  
  // 处理提交创建表单
  const handleCreateSubmit = (data: ConfigFormValues) => {
    createConfigMutation.mutate(data);
  };
  
  // 处理提交编辑表单
  const handleEditSubmit = (data: ConfigFormValues) => {
    updateConfigMutation.mutate(data);
  };

  // 自定义列标签
  const columnLabels = {
    config_name: "配置名称",
    config_key: "配置键名", 
    config_value: "配置键值",
    status: "状态",
    remark: "备注",
    create_time: "创建时间",
  };

  // 创建列配置
  const columns = createColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog
  });

  return (
    <div className="container mx-auto px-0 py-6 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">系统参数配置</h2>
            <p className="text-muted-foreground">
              管理系统运行时的各项参数配置
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={list}
          pageCount={pages}
          pageIndex={query.page_num ? query.page_num - 1 : 0}
          pageSize={query.page_size || 10}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onSortingChange={handleSortingChange}
          onCreateConfig={() => setShowCreateDialog(true)}
          isLoading={isLoading}
          columnLabels={columnLabels}
          minHeight="400px"
        />
      </div>
      
      {/* 创建配置弹窗 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新增配置</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="config_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置名称</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="config_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置键名</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="config_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置键值</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
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
                        <SelectItem value="0">正常</SelectItem>
                        <SelectItem value="1">停用</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createConfigMutation.isPending}
                >
                  {createConfigMutation.isPending ? "提交中..." : "提交"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 编辑配置弹窗 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑配置</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="config_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置名称</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="config_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置键名</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="config_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置键值</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
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
                        <SelectItem value="0">正常</SelectItem>
                        <SelectItem value="1">停用</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={updateConfigMutation.isPending}
                >
                  {updateConfigMutation.isPending ? "提交中..." : "提交"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 删除配置确认弹窗 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>删除配置</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            确定要删除配置 <span className="font-semibold">{currentConfig?.config_name}</span> 吗？此操作不可恢复。
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">取消</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => currentConfig && currentConfig.config_id && deleteConfigMutation.mutate(currentConfig.config_id)}
              disabled={deleteConfigMutation.isPending}
            >
              {deleteConfigMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 