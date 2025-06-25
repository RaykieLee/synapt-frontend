"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog";
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
import { FaceLibraryCreateDto, FaceLibraryUpdateDto } from "@/types/face";
import { faceLibraryAPI } from "@/api";

interface CreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  libraryId?: number;
}

export function CreateEditDialog({
  open,
  onOpenChange,
  libraryId,
}: CreateEditDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!libraryId;

  // 表单定义
  const form = useForm<FaceLibraryCreateDto & FaceLibraryUpdateDto>({
    defaultValues: {
      library_code: "",
      library_name: "",
      description: "",
      status: "0",
      remark: "",
    },
  });

  // 查询人脸库详情 (编辑模式)
  const { data: libraryData, isLoading: isLibraryLoading } = useQuery({
    queryKey: ["face", "library", "detail", libraryId],
    queryFn: () => faceLibraryAPI.getDetail(libraryId!),
    enabled: isEditMode && !!libraryId,
  });

  // 更新表单默认值 (编辑模式)
  useEffect(() => {
    if (isEditMode && libraryData?.data) {
      const library = libraryData.data;
      form.reset({
        library_code: library.library_code,
        library_name: library.library_name,
        description: library.description,
        status: library.status,
        remark: library.remark,
      });
    } else if (!isEditMode) {
      form.reset({
        library_code: "",
        library_name: "",
        description: "",
        status: "0",
        remark: "",
      });
    }
  }, [libraryData, form, isEditMode, open]);

  // 创建人脸库
  const createMutation = useMutation({
    mutationFn: (data: FaceLibraryCreateDto) => faceLibraryAPI.create(data),
    onSuccess: () => {
      toast.success("创建成功");
      queryClient.invalidateQueries({ queryKey: ["face", "library"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`创建失败: ${error}`);
    },
  });

  // 更新人脸库
  const updateMutation = useMutation({
    mutationFn: (data: FaceLibraryUpdateDto) =>
      faceLibraryAPI.update(libraryId!, data),
    onSuccess: () => {
      toast.success("更新成功");
      queryClient.invalidateQueries({ queryKey: ["face", "library"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`更新失败: ${error}`);
    },
  });

  // 提交表单
  const onSubmit = (data: FaceLibraryCreateDto & FaceLibraryUpdateDto) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // 关闭弹窗时重置表单
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  // 操作状态
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "编辑人脸库" : "新建人脸库"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "修改人脸库的基本信息和配置。" 
              : "创建一个新的人脸库，用于管理人脸识别数据。"
            }
          </DialogDescription>
        </DialogHeader>

        {isEditMode && isLibraryLoading ? (
          <div className="py-8 text-center">加载中...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="library_name"
                  rules={{ required: "人脸库名称不能为空" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>人脸库名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入人脸库名称" {...field} />
                      </FormControl>
                      <FormDescription>
                        人脸库的显示名称，如"员工人脸库"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="library_code"
                  rules={{ required: "人脸库编码不能为空" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>人脸库编码</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入人脸库编码" {...field} />
                      </FormControl>
                      <FormDescription>
                        唯一的识别码，如"EMPLOYEE_FACE_LIB"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormDescription>
                      人脸库的启用状态
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
                        placeholder="请输入人脸库描述信息"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      人脸库的详细描述，用于说明用途和特点
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
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      其他备注信息
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "保存中..." : isEditMode ? "保存" : "创建"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
} 