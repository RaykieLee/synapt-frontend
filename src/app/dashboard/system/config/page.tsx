"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/animate-ui/radix/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/pagination";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import * as z from "zod";
import { configAPI } from "@/api/config";
import { Config } from "@/types/config";
import { Checkbox } from "@/components/animate-ui/base/checkbox";

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
  
  // 分页和搜索参数
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  
  // 弹窗状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  
  // 当前编辑的配置
  const [currentConfig, setCurrentConfig] = useState<Config | null>(null);
  
  // 选中的配置ID列表（用于批量删除）
  const [selectedConfigIds, setSelectedConfigIds] = useState<number[]>([]);
  
  // 查询配置列表
  const {
    data: configsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["configs", pageIndex, pageSize, searchKey],
    queryFn: () => configAPI.getList({
      pageNum: pageIndex,
      pageSize: pageSize,
      config_name: searchKey || undefined
    })
  });
  
  const configs = configsData?.rows || [];
  const total = configsData?.total || 0;
  
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
  
  // 批量删除接口
  const batchDeleteConfigs = async (ids: number[]) => {
    const promises = ids.map(id => configAPI.delete(id));
    await Promise.all(promises);
    return { success: true };
  };
  
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
        id: currentConfig.id,
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
  
  // 批量删除配置
  const batchDeleteMutation = useMutation({
    mutationFn: batchDeleteConfigs,
    onSuccess: () => {
      toast({
        title: "批量删除成功",
        description: "选中的配置已成功删除"
      });
      setShowBatchDeleteDialog(false);
      setSelectedConfigIds([]);
      queryClient.invalidateQueries({ queryKey: ["configs"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "批量删除失败",
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
  
  // 处理表格中复选框变化
  const handleConfigSelection = (configId: number, checked: boolean) => {
    if (checked) {
      setSelectedConfigIds((prev) => [...prev, configId]);
    } else {
      setSelectedConfigIds((prev) => prev.filter(id => id !== configId));
    }
  };
  
  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = configs.map(config => config.id);
      setSelectedConfigIds(allIds);
    } else {
      setSelectedConfigIds([]);
    }
  };
  
  // 搜索配置
  const handleSearch = () => {
    setPageIndex(1);
    refetch();
  };
  
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

        {/* 搜索和操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="请输入配置名称或键名"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
            <Button variant="outline" size="sm" className="h-8" onClick={handleSearch}>
              搜索
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" className="h-8" onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              新建配置
            </Button>
            {selectedConfigIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="h-8"
                onClick={() => setShowBatchDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                批量删除
              </Button>
            )}
          </div>
        </div>
      
      {/* 配置列表表格 */}
      <div className="border rounded-md">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <Checkbox
                  checked={selectedConfigIds.length === configs.length && configs.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配置名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">键名</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">键值</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configs.map((config) => (
              <tr key={config.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <Checkbox
                    checked={selectedConfigIds.includes(config.id)}
                    onCheckedChange={(checked) => handleConfigSelection(config.id, !!checked)}
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{config.config_name}</td>
                <td className="px-4 py-4 whitespace-nowrap">{config.config_key}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="max-w-xs truncate">{config.config_value}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{config.status === "0" ? '正常' : '停用'}</td>
                <td className="px-4 py-4">
                  <div className="max-w-xs truncate">{config.remark || "-"}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(config)}>
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => openDeleteDialog(config)}
                      >
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {configs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                  {isLoading ? "加载中..." : "暂无数据"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* 分页器 */}
      {total > 0 && (
        <div className="mt-4 flex justify-end">
          <Pagination
            currentPage={pageIndex}
            pageSize={pageSize}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            total={total}
          />
        </div>
      )}
      
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
              onClick={() => currentConfig && deleteConfigMutation.mutate(currentConfig.id)}
              disabled={deleteConfigMutation.isPending}
            >
              {deleteConfigMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 批量删除配置确认弹窗 */}
      <Dialog open={showBatchDeleteDialog} onOpenChange={setShowBatchDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>批量删除配置</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            确定要删除选中的 <span className="font-semibold">{selectedConfigIds.length}</span> 个配置吗？此操作不可恢复。
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">取消</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => batchDeleteMutation.mutate(selectedConfigIds)}
              disabled={batchDeleteMutation.isPending}
            >
              {batchDeleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
} 