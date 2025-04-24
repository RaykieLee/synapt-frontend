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
import { Eye, MoreHorizontal, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import { dictAPI } from "@/api/dict";
import { DictType } from "@/types/dict";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from '@/components/ui/checkbox'

// 表单验证规则
const dictTypeFormSchema = z.object({
  dict_name: z.string().min(1, "字典名称不能为空"),
  dict_type: z.string().min(1, "字典类型不能为空"),
  status: z.string().min(1, "状态不能为空"),
  remark: z.string().optional()
});

// 表单数据类型
type DictTypeFormValues = z.infer<typeof dictTypeFormSchema>;

export default function DictPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // 分页和搜索参数
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [searchType, setSearchType] = useState("");
  
  // 弹窗状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // 当前编辑的字典类型
  const [currentDictType, setCurrentDictType] = useState<DictType | null>(null);
  const [selectedDicts, setSelectedDicts] = useState<DictType[]>([]);
  
  // 查询字典类型列表
  const {
    data: dictTypeList,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["dictTypeList", pageIndex, pageSize, searchName, searchType],
    queryFn: () => dictAPI.getDictTypes({
      pageNum: pageIndex,
      pageSize: pageSize,
      dictName: searchName || undefined,
      dictType: searchType || undefined
    })
  });
  
  const dictTypes = dictTypeList?.rows || [];
  const total = dictTypeList?.total || 0;
  
  // 创建字典类型表单
  const createForm = useForm<DictTypeFormValues>({
    resolver: zodResolver(dictTypeFormSchema),
    defaultValues: {
      dict_name: "",
      dict_type: "",
      status: "0",
      remark: ""
    }
  });
  
  // 编辑字典类型表单
  const editForm = useForm<DictTypeFormValues>({
    resolver: zodResolver(dictTypeFormSchema),
    defaultValues: {
      dict_name: "",
      dict_type: "",
      status: "0",
      remark: ""
    }
  });
  
  // 创建字典类型
  const createDictTypeMutation = useMutation({
    mutationFn: (data: DictTypeFormValues) => {
      // 确保status是字符串类型
      const formData = {
        ...data,
        status: String(data.status)
      };
      return dictAPI.createDictType(formData);
    },
    onSuccess: () => {
      toast({
        title: "创建成功",
        description: "字典类型已成功创建"
      });
      setShowCreateDialog(false);
      createForm.reset({
        dict_name: "",
        dict_type: "",
        status: "0",
        remark: ""
      });
      queryClient.invalidateQueries({ queryKey: ["dictTypeList"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "创建失败",
        description: `${error}`
      });
    }
  });
  
  // 更新字典类型
  const updateDictTypeMutation = useMutation({
    mutationFn: (data: DictTypeFormValues) => {
      if (!currentDictType) throw new Error("当前字典类型不存在");
      // 确保status是字符串类型
      const formData = {
        ...data,
        status: String(data.status)
      };
      return dictAPI.updateDictType(currentDictType.dict_id, formData);
    },
    onSuccess: () => {
      toast({
        title: "更新成功",
        description: "字典类型已成功更新"
      });
      setShowEditDialog(false);
      setCurrentDictType(null);
      queryClient.invalidateQueries({ queryKey: ["dictTypeList"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: `${error}`
      });
    }
  });
  
  // 删除字典类型
  const deleteDictTypeMutation = useMutation({
    mutationFn: (dictId: number) => dictAPI.deleteDictType(dictId),
    onSuccess: () => {
      toast({
        title: "删除成功",
        description: "字典类型已成功删除"
      });
      setShowDeleteDialog(false);
      setCurrentDictType(null);
      queryClient.invalidateQueries({ queryKey: ["dictTypeList"] });
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
  const openEditDialog = (dictType: DictType) => {
    setCurrentDictType(dictType);
    editForm.reset({
      dict_name: dictType.dict_name,
      dict_type: dictType.dict_type,
      status: dictType.status,
      remark: dictType.remark || ""
    });
    setShowEditDialog(true);
  };
  
  // 打开删除弹窗
  const openDeleteDialog = (dictType: DictType) => {
    setCurrentDictType(dictType);
    setShowDeleteDialog(true);
  };
  
  // 处理提交创建表单
  const handleCreateSubmit = (data: DictTypeFormValues) => {
    createDictTypeMutation.mutate(data);
  };
  
  // 处理提交编辑表单
  const handleEditSubmit = (data: DictTypeFormValues) => {
    updateDictTypeMutation.mutate(data);
  };
  
  // 搜索字典类型
  const handleSearch = () => {
    setPageIndex(1);
    refetch();
  };
  
  // 查看字典数据
  const viewDictData = (dictType: string) => {
    router.push(`/dashboard/system/dict/data?type=${dictType}`);
  };
  
  // 批量删除字典类型
  const handleBatchDelete = () => {
    if (selectedDicts.length === 0) return;
    const ids = selectedDicts.map((dict) => dict.dict_id);
    deleteDictTypeMutation.mutate(ids[0]); // Assuming batchDelete is not implemented in the API
    setSelectedDicts([]);
    queryClient.invalidateQueries({ queryKey: ["dictTypeList"] });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">字典类型管理</h1>
        <div className="flex gap-2">
          <Input
            placeholder="请输入字典名称"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-64"
          />
          <Input
            placeholder="请输入字典类型"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            新建字典类型
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {/* 字典类型列表表格 */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>字典名称</TableHead>
              <TableHead>字典类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>备注</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dictTypes.map((dictType) => (
              <TableRow key={dictType.dict_id} className="hover:bg-gray-50">
                <TableCell className="px-4 py-4 whitespace-nowrap">{dictType.dict_name}</TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">{dictType.dict_type}</TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">{dictType.status === "0" ? '正常' : '停用'}</TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">{dictType.create_time}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="max-w-xs truncate">{dictType.remark || "-"}</div>
                </TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewDictData(dictType.dict_type)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      数据
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(dictType)}>
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => openDeleteDialog(dictType)}
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {dictTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  {isLoading ? "加载中..." : "暂无数据"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
      
      {/* 创建字典类型弹窗 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新增字典类型</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="dict_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字典名称</FormLabel>
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
                  disabled={createDictTypeMutation.isPending}
                >
                  {createDictTypeMutation.isPending ? "提交中..." : "提交"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 编辑字典类型弹窗 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑字典类型</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="dict_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字典名称</FormLabel>
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
                  disabled={updateDictTypeMutation.isPending}
                >
                  {updateDictTypeMutation.isPending ? "提交中..." : "提交"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 删除字典类型确认弹窗 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>删除字典类型</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            确定要删除字典类型 <span className="font-semibold">{currentDictType?.dict_name}</span> 吗？此操作可能会影响系统功能，并且不可恢复。
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">取消</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => currentDictType && deleteDictTypeMutation.mutate(currentDictType.dict_id)}
              disabled={deleteDictTypeMutation.isPending}
            >
              {deleteDictTypeMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 