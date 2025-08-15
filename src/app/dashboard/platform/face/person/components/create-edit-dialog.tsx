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
import { FacePersonCreateDto, FacePersonUpdateDto } from "@/types/face";
import { facePersonAPI, faceLibraryAPI } from "@/api";

interface CreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId?: string;
  defaultLibraryId?: string;
}

export function CreateEditDialog({
  open,
  onOpenChange,
  personId,
  defaultLibraryId,
}: CreateEditDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!personId;

  // 表单定义
  const form = useForm<FacePersonCreateDto & FacePersonUpdateDto>({
    defaultValues: {
      library_id: defaultLibraryId || "",
      person_code: "",
      person_name: "",
      status: "0",
      remark: "",
    },
  });

  // 查询人员详情 (编辑模式)
  const { data: personData, isLoading: isPersonLoading } = useQuery({
    queryKey: ["face", "person", "detail", personId],
    queryFn: () => facePersonAPI.getDetail(personId!),
    enabled: isEditMode && !!personId,
  });

  // 查询所有人脸库
  const { data: librariesResponse, isLoading: isLibrariesLoading, error: librariesError } = useQuery({
    queryKey: ["face", "library", "all"],
    queryFn: () => faceLibraryAPI.getAll(),
  });

  const libraries = Array.isArray(librariesResponse) ? librariesResponse : [];

  // 调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('人脸库数据调试:', {
      response: librariesResponse,
      data: libraries,
      loading: isLibrariesLoading,
      error: librariesError
    });
  }

  // 更新表单默认值 (编辑模式)
  useEffect(() => {
    if (isEditMode && personData?.data) {
      const person = personData.data;
      form.reset({
        library_id: person.library_id,
        person_code: person.person_code,
        person_name: person.person_name,
        status: person.status,
        remark: person.remark,
      });
    } else if (!isEditMode) {
      form.reset({
        library_id: defaultLibraryId || "",
        person_code: "",
        person_name: "",
        status: "0",
        remark: "",
      });
    }
  }, [personData, form, isEditMode, open, defaultLibraryId]);

  // 创建人员
  const createMutation = useMutation({
    mutationFn: (data: FacePersonCreateDto) => facePersonAPI.create(data),
    onSuccess: () => {
      toast.success("创建成功");
      queryClient.invalidateQueries({ queryKey: ["face", "person"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`创建失败: ${error}`);
    },
  });

  // 更新人员
  const updateMutation = useMutation({
    mutationFn: (data: FacePersonUpdateDto) =>
      facePersonAPI.update(personId!, data),
    onSuccess: () => {
      toast.success("更新成功");
      queryClient.invalidateQueries({ queryKey: ["face", "person"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`更新失败: ${error}`);
    },
  });

  // 提交表单
  const onSubmit = (data: FacePersonCreateDto & FacePersonUpdateDto) => {
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
            {isEditMode ? "编辑人员" : "新增人员"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "修改人员的基本信息。" 
              : "添加一个新的人员到人脸库中。"
            }
          </DialogDescription>
        </DialogHeader>

        {isEditMode && isPersonLoading ? (
          <div className="py-8 text-center">加载中...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="person_name"
                  rules={{ required: "姓名不能为空" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入姓名" {...field} />
                      </FormControl>
                      <FormDescription>
                        人员的真实姓名
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="person_code"
                  rules={{ required: "人员编码不能为空" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>人员编码</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入人员编码" {...field} />
                      </FormControl>
                      <FormDescription>
                        唯一的人员标识码
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
                        人员的启用状态
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="library_id"
                rules={{ required: "请选择人脸库" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所属人脸库</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value)} 
                      value={field.value?.toString()}
                      disabled={isLibrariesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            isLibrariesLoading 
                              ? "加载中..." 
                              : libraries.length === 0 
                              ? "暂无人脸库" 
                              : "请选择人脸库"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {libraries.length === 0 ? (
                          <div className="px-2 py-1 text-sm text-gray-500">
                            {isLibrariesLoading ? "加载中..." : "暂无人脸库"}
                          </div>
                        ) : (
                          libraries.map((library) => (
                            <SelectItem key={library.id} value={library.id.toString()}>
                              {library.library_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      选择人员所属的人脸库 {libraries.length > 0 && `(共${libraries.length}个)`}
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
                        rows={3}
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