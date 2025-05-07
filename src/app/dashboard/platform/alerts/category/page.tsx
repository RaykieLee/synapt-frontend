"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertCategoryQuery,
  AlertCategoryCreateDto,
  AlertCategoryUpdateDto,
  AlertCategory
} from "@/types/alert";
import { alertCategoryAPI } from "@/api";

export default function AlertCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 状态管理
  const [query, setQuery] = useState<AlertCategoryQuery>({
    page_num: 1,
    page_size: 10,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openBatchDeleteDialog, setOpenBatchDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);

  // 表单定义
  const createForm = useForm<AlertCategoryCreateDto>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      status: "0",
      remark: "",
    },
  });

  const editForm = useForm<AlertCategoryUpdateDto>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      status: "0",
      remark: "",
    },
  });

  // 查询告警类别列表
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["alerts", "category", "list", query],
    queryFn: () => alertCategoryAPI.getList(query),
  });

  // 查询告警类别详情
  const { data: categoryDetail, refetch: refetchDetail } = useQuery({
    queryKey: ["alerts", "category", "detail", currentCategory],
    queryFn: () =>
      currentCategory ? alertCategoryAPI.getDetail(currentCategory) : null,
    enabled: !!currentCategory,
  });

  // 创建告警类别
  const createMutation = useMutation({
    mutationFn: (data: AlertCategoryCreateDto) => alertCategoryAPI.create(data),
    onSuccess: () => {
      toast.success("创建成功");
      queryClient.invalidateQueries({ queryKey: ["alerts", "category"] });
      setOpenCreateDialog(false);
      createForm.reset();
    },
    onError: (error) => {
      toast.error(`创建失败: ${error}`);
    },
  });

  // 更新告警类别
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AlertCategoryUpdateDto;
    }) => alertCategoryAPI.update(id, data),
    onSuccess: () => {
      toast.success("更新成功");
      queryClient.invalidateQueries({ queryKey: ["alerts", "category"] });
      setOpenEditDialog(false);
      setCurrentCategory(null);
    },
    onError: (error) => {
      toast.error(`更新失败: ${error}`);
    },
  });

  // 删除告警类别
  const deleteMutation = useMutation({
    mutationFn: (id: number) => alertCategoryAPI.delete(id),
    onSuccess: () => {
      toast.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["alerts", "category"] });
      setOpenDeleteDialog(false);
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`);
    },
  });

  // 批量删除告警类别
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => alertCategoryAPI.batchDelete(ids),
    onSuccess: () => {
      toast.success("批量删除成功");
      queryClient.invalidateQueries({ queryKey: ["alerts", "category"] });
      setOpenBatchDeleteDialog(false);
      setSelectedIds([]);
    },
    onError: (error) => {
      toast.error(`批量删除失败: ${error}`);
    },
  });

  // 更新表单默认值
  useEffect(() => {
    if (categoryDetail?.data && openEditDialog) {
      const category = categoryDetail.data;
      editForm.reset({
        code: category.code,
        name: category.name,
        description: category.description,
        status: category.status,
        remark: category.remark,
      });
    }
  }, [categoryDetail, editForm, openEditDialog]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page_num: page }));
  };

  // 处理编辑
  const handleEdit = (id: number) => {
    setCurrentCategory(id);
    setOpenEditDialog(true);
  };

  // 处理单个删除
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  // 确认单个删除
  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  // 确认批量删除
  const confirmBatchDelete = () => {
    if (selectedIds.length > 0) {
      batchDeleteMutation.mutate(selectedIds);
    }
  };

  // 处理选择行
  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked && categoriesData?.data?.list) {
      setSelectedIds(
        categoriesData.data.list.map((item: AlertCategory) => item.category_id)
      );
    } else {
      setSelectedIds([]);
    }
  };

  // 提交创建表单
  const onCreateSubmit = (data: AlertCategoryCreateDto) => {
    createMutation.mutate(data);
  };

  // 提交编辑表单
  const onEditSubmit = (data: AlertCategoryUpdateDto) => {
    if (currentCategory) {
      updateMutation.mutate({ id: currentCategory, data });
    }
  };

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
            <BreadcrumbLink>告警类别</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">告警类别管理</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/platform/alerts")}
          >
            返回告警配置
          </Button>
          <Button onClick={() => setOpenCreateDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            新建类别
          </Button>
        </div>
      </div>

      {/* 筛选表单 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">类别名称</label>
              <Input
                placeholder="请输入类别名称"
                value={query.name || ""}
                onChange={(e) =>
                  setQuery((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">类别编码</label>
              <Input
                placeholder="请输入类别编码"
                value={query.code || ""}
                onChange={(e) =>
                  setQuery((prev) => ({ ...prev, code: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">状态</label>
              <Select
                value={query.status || "all"}
                onValueChange={(value) =>
                  setQuery((prev) => ({ ...prev, status: value === "all" ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="0">正常</SelectItem>
                  <SelectItem value="1">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() =>
                  setQuery({
                    page_num: 1,
                    page_size: query.page_size,
                  })
                }
                variant="outline"
                className="mr-2"
              >
                重置
              </Button>
              <Button
                onClick={() =>
                  setQuery((prev) => ({ ...prev, page_num: 1 }))
                }
              >
                查询
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 工具栏 */}
      <div className="flex justify-between mb-4">
        <div>
          <Button
            variant="destructive"
            disabled={selectedIds.length === 0}
            onClick={() => setOpenBatchDeleteDialog(true)}
          >
            批量删除
          </Button>
        </div>
      </div>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      categoriesData?.data?.list &&
                      categoriesData.data.list.length > 0 &&
                      selectedIds.length ===
                        categoriesData.data.list.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>类别名称</TableHead>
                <TableHead>类别编码</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesData?.data?.list?.map((category: AlertCategory) => (
                <TableRow key={category.category_id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(category.category_id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(category.category_id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.code}</TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        category.status === "0" ? "outline" : "destructive"
                      }
                    >
                      {category.status === "0" ? "正常" : "停用"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {category.create_time
                      ? new Date(category.create_time).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="h-8"
                      onClick={() => handleEdit(category.category_id)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(category.category_id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!categoriesData?.data?.list ||
                categoriesData.data.list.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      {categoriesData?.data?.total &&
        categoriesData.data.total > 0 && (
          <div className="flex justify-end mt-4">
            <Pagination
              currentPage={query.page_num || 1}
              pageSize={query.page_size || 10}
              total={categoriesData.data.total}
              onChange={handlePageChange}
            />
          </div>
        )}

      {/* 创建对话框 */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新建告警类别</DialogTitle>
            <DialogDescription>
              创建一个新的告警类别，用于分类告警配置。
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                rules={{ required: "类别名称不能为空" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类别名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入类别名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="code"
                rules={{ required: "类别编码不能为空" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类别编码</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入类别编码" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入类别描述"
                        className="resize-none"
                        {...field}
                      />
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

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenCreateDialog(false)}
                  type="button"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog
        open={openEditDialog}
        onOpenChange={(open) => {
          setOpenEditDialog(open);
          if (!open) setCurrentCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑告警类别</DialogTitle>
            <DialogDescription>
              修改告警类别的基本信息。
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                rules={{ required: "类别名称不能为空" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类别名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入类别名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="code"
                rules={{ required: "类别编码不能为空" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类别编码</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入类别编码" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入类别描述"
                        className="resize-none"
                        {...field}
                      />
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

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenEditDialog(false)}
                  type="button"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除这个告警类别吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <Dialog
        open={openBatchDeleteDialog}
        onOpenChange={setOpenBatchDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量删除</DialogTitle>
            <DialogDescription>
              您确定要删除这{selectedIds.length}个告警类别吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenBatchDeleteDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBatchDelete}
              disabled={batchDeleteMutation.isPending}
            >
              {batchDeleteMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 