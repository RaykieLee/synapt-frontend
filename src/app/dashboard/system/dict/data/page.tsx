"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { ArrowLeft, MoreHorizontal, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import * as z from "zod";
import { dictAPI } from "@/api/dict";
import { DictData, DictType } from "@/types/dict";

// 表单验证规则
const dictDataFormSchema = z.object({
  dict_sort: z.coerce.number().min(0, "排序不能小于0"),
  dict_label: z.string().min(1, "标签不能为空"),
  dict_value: z.string().min(1, "键值不能为空"),
  dict_type: z.string().min(1, "字典类型不能为空"),
  css_class: z.string().optional(),
  list_class: z.string().optional(),
  is_default: z.string(),
  status: z.string().min(1, "状态不能为空"),
  remark: z.string().optional()
});

// 表单数据类型
type DictDataFormValues = z.infer<typeof dictDataFormSchema>;

export default function DictDataPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  // 获取URL参数中的字典类型
  const dictType = searchParams.get("type") || "";
  
  // 分页和搜索参数
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchLabel, setSearchLabel] = useState("");
  
  // 弹窗状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // 当前编辑的字典数据
  const [currentDictData, setCurrentDictData] = useState<DictData | null>(null);
  
  // 如果URL中没有字典类型，则返回到字典类型页面
  useEffect(() => {
    if (!dictType) {
      router.push("/dashboard/system/dict");
    }
  }, [dictType, router]);
  
  // 查询字典类型详情
  const { data: dictTypeData } = useQuery({
    queryKey: ["dictType", dictType],
    queryFn: () => {
      if (!dictType) return null;
      return dictAPI.getDictTypes({ dictType }).then(res => res.rows[0] || null);
    },
    enabled: !!dictType
  });
  
  // 查询字典数据列表
  const {
    data: dictDataList,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["dictDataList", pageIndex, pageSize, dictType, searchLabel],
    queryFn: () => dictAPI.getDictDataList({
      pageNum: pageIndex,
      pageSize: pageSize,
      dictType: dictType,
      dictLabel: searchLabel || undefined
    }),
    enabled: !!dictType
  });
  
  const dictDatas = dictDataList?.rows || [];
  const total = dictDataList?.total || 0;
  
  // 创建字典数据表单
  const createForm = useForm<DictDataFormValues>({
    resolver: zodResolver(dictDataFormSchema),
    defaultValues: {
      dict_sort: 0,
      dict_label: "",
      dict_value: "",
      dict_type: dictType,
      css_class: "",
      list_class: "",
      is_default: "N",
      status: "0",
      remark: ""
    }
  });
  
  // 编辑字典数据表单
  const editForm = useForm<DictDataFormValues>({
    resolver: zodResolver(dictDataFormSchema),
    defaultValues: {
      dict_sort: 0,
      dict_label: "",
      dict_value: "",
      dict_type: dictType,
      css_class: "",
      list_class: "",
      is_default: "N",
      status: "0",
      remark: ""
    }
  });
  
  // 创建字典数据
  const createDictDataMutation = useMutation({
    mutationFn: (data: DictDataFormValues) => {
      // 确保status是字符串类型
      const formData = {
        ...data,
        status: String(data.status),
        is_default: String(data.is_default)
      };
      return dictAPI.createDictData(formData);
    },
    onSuccess: () => {
      toast({
        title: "创建成功",
        description: "字典数据已成功创建"
      });
      setShowCreateDialog(false);
      createForm.reset({
        dict_sort: 0,
        dict_label: "",
        dict_value: "",
        dict_type: dictType,
        css_class: "",
        list_class: "",
        is_default: "N",
        status: "0",
        remark: ""
      });
      queryClient.invalidateQueries({ queryKey: ["dictDataList"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "创建失败",
        description: `${error}`
      });
    }
  });
  
  // 更新字典数据
  const updateDictDataMutation = useMutation({
    mutationFn: (data: DictDataFormValues) => {
      if (!currentDictData) throw new Error("当前字典数据不存在");
      // 确保status是字符串类型
      const formData = {
        ...data,
        status: String(data.status),
        is_default: String(data.is_default)
      };
      return dictAPI.updateDictData(currentDictData.dict_code, formData);
    },
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "字典数据已成功更新"
      });
      setShowEditDialog(false);
      setCurrentDictData(null);
      queryClient.invalidateQueries({ queryKey: ["dictDataList"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: `${error}`
      });
    }
  });
  
  // 删除字典数据
  const deleteDictDataMutation = useMutation({
    mutationFn: (dictCode: number) => dictAPI.deleteDictData(dictCode),
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "字典数据已成功删除"
      });
      setShowDeleteDialog(false);
      setCurrentDictData(null);
      queryClient.invalidateQueries({ queryKey: ["dictDataList"] });
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
  const openEditDialog = (dictData: DictData) => {
    setCurrentDictData(dictData);
    editForm.reset({
      dict_sort: dictData.dict_sort,
      dict_label: dictData.dict_label,
      dict_value: dictData.dict_value,
      dict_type: dictData.dict_type,
      css_class: dictData.css_class || "",
      list_class: dictData.list_class || "",
      is_default: dictData.is_default,
      status: dictData.status,
      remark: dictData.remark || ""
    });
    setShowEditDialog(true);
  };
  
  // 打开删除弹窗
  const openDeleteDialog = (dictData: DictData) => {
    setCurrentDictData(dictData);
    setShowDeleteDialog(true);
  };
  
  // 处理提交创建表单
  const handleCreateSubmit = (data: DictDataFormValues) => {
    createDictDataMutation.mutate(data);
  };
  
  // 处理提交编辑表单
  const handleEditSubmit = (data: DictDataFormValues) => {
    updateDictDataMutation.mutate(data);
  };
  
  // 返回字典类型页面
  const goBack = () => {
    router.push("/dashboard/system/dict");
  };
  
  // 搜索字典数据
  const handleSearch = () => {
    setPageIndex(1);
    refetch();
  };
  
  if (!dictType) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            字典数据管理：{dictTypeData?.dict_name || dictType}
          </h1>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="请输入字典标签"
            value={searchLabel}
            onChange={(e) => setSearchLabel(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            新建字典数据
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {/* 字典数据列表表格 */}
      <div className="border rounded-md">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">键值</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">样式类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">是否默认</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dictDatas.map((dictData) => (
              <tr key={dictData.dict_code} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">{dictData.dict_sort}</td>
                <td className="px-4 py-4 whitespace-nowrap">{dictData.dict_label}</td>
                <td className="px-4 py-4 whitespace-nowrap">{dictData.dict_value}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {dictData.list_class ? <span className={dictData.list_class}>{dictData.list_class}</span> : "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{dictData.status === "0" ? '正常' : '停用'}</td>
                <td className="px-4 py-4 whitespace-nowrap">{dictData.is_default === "Y" ? '是' : '否'}</td>
                <td className="px-4 py-4">
                  <div className="max-w-xs truncate">{dictData.remark || "-"}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(dictData)}>
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => openDeleteDialog(dictData)}
                      >
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {dictDatas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
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
      
      {/* 创建字典数据弹窗 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新增字典数据</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="dict_sort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>排序</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="dict_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字典标签</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="dict_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字典键值</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="dict_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字典类型</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="css_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>样式属性</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="list_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>表格回显样式</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择样式" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">无</SelectItem>
                        <SelectItem value="default">默认</SelectItem>
                        <SelectItem value="primary">主要</SelectItem>
                        <SelectItem value="success">成功</SelectItem>
                        <SelectItem value="info">信息</SelectItem>
                        <SelectItem value="warning">警告</SelectItem>
                        <SelectItem value="danger">危险</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>是否默认</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择是否默认" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Y">是</SelectItem>
                        <SelectItem value="N">否</SelectItem>
                      </SelectContent>
                    </Select>
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
                  disabled={createDictDataMutation.isPending}
                >
                  {createDictDataMutation.isPending ? "提交中..." : "提交"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 编辑字典数据弹窗 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑字典数据</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="dict_sort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>排序</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="dict_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字典标签</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="dict_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字典键值</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="dict_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字典类型</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="css_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>样式属性</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="list_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>表格回显样式</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择样式" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">无</SelectItem>
                        <SelectItem value="default">默认</SelectItem>
                        <SelectItem value="primary">主要</SelectItem>
                        <SelectItem value="success">成功</SelectItem>
                        <SelectItem value="info">信息</SelectItem>
                        <SelectItem value="warning">警告</SelectItem>
                        <SelectItem value="danger">危险</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>是否默认</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择是否默认" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Y">是</SelectItem>
                        <SelectItem value="N">否</SelectItem>
                      </SelectContent>
                    </Select>
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
                  disabled={updateDictDataMutation.isPending}
                >
                  {updateDictDataMutation.isPending ? "提交中..." : "提交"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 删除字典数据确认弹窗 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>删除字典数据</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            确定要删除字典数据 <span className="font-semibold">{currentDictData?.dict_label}</span> 吗？此操作不可恢复。
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">取消</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => currentDictData && deleteDictDataMutation.mutate(currentDictData.dict_code)}
              disabled={deleteDictDataMutation.isPending}
            >
              {deleteDictDataMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 