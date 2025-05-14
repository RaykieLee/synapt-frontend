'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { streamAPI } from '@/api/stream';
import { Stream, StreamStatus, StreamUpdateDto, StreamQuery } from '@/types/stream';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/pagination';
import { 
  Plus, 
  Search,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StreamCard } from './components/stream-card';

// 表单验证Schema
const streamFormSchema = z.object({
  stream_name: z.string().min(1, "名称不能为空"),
  stream_url: z.string().min(1, "视频流地址不能为空").url("请输入有效的URL"),
  stream_type: z.string().optional(),
  description: z.string().optional(),
  remark: z.string().optional(),
});

type StreamFormValues = z.infer<typeof streamFormSchema>;

export default function StreamsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<StreamQuery>({
    page_num: 1,
    page_size: 12, // 修改每页显示数量，适合卡片布局
    sorts: [
      {
        field: "create_time",
        order: "desc"
      }
    ],
    params: {
      keywords: {
        stream_name: ""
      },
      status: "",
      search_mode: "and"
    }
  });
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [selectedStreams, setSelectedStreams] = useState<number[]>([]);
  
  const form = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      stream_name: "",
      stream_url: "",
      stream_type: "",
      description: "",
      remark: "",
    },
  });

  const editForm = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      stream_name: "",
      stream_url: "",
      stream_type: "",
      description: "",
      remark: "",
    },
  });

  // 获取视频流列表
  const { data: streamResponse, isLoading } = useQuery({
    queryKey: ['streams', 'list', query],
    queryFn: () => streamAPI.getList(query),
  });

  // 判断返回数据格式并正确提取数据
  const streams = streamResponse?.list || [];
  const total = streamResponse?.total || 0;
  const totalPages = streamResponse?.pages || 1;

  // 创建视频流
  const createMutation = useMutation({
    mutationFn: streamAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: '创建成功',
        description: '视频流已成功创建',
      });
    },
  });

  // 更新视频流
  const updateMutation = useMutation({
    mutationFn: ({ stream_id, data }: { stream_id: number; data: StreamFormValues }) =>
      streamAPI.update(stream_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
      setShowEditDialog(false);
      setCurrentStream(null);
      toast({
        title: '更新成功',
        description: '视频流信息已更新',
      });
    },
  });

  // 删除视频流
  const deleteMutation = useMutation({
    mutationFn: streamAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
      setShowDeleteDialog(false);
      toast({
        title: '删除成功',
        description: '视频流已删除',
      });
    },
  });

  // 批量删除视频流
  const batchDeleteMutation = useMutation({
    mutationFn: streamAPI.batchDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
      setSelectedStreams([]);
      toast({
        title: '批量删除成功',
        description: '所选视频流已删除',
      });
    },
  });

  // 启动视频流
  const startMutation = useMutation({
    mutationFn: streamAPI.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
      toast({
        title: '启动成功',
        description: '视频流已启动',
      });
    },
  });

  // 停止视频流
  const stopMutation = useMutation({
    mutationFn: streamAPI.stop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
      toast({
        title: '停止成功',
        description: '视频流已停止',
      });
    },
  });

  // 重启视频流
  const restartMutation = useMutation({
    mutationFn: streamAPI.restart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
      toast({
        title: '重启成功',
        description: '视频流已重启',
      });
    },
  });

  // 处理搜索
  const handleSearch = (name: string) => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        keywords: {
          ...(prev.params.keywords || {}),
          stream_name: name || ""
        }
      }
    }));
  };

  // 处理状态筛选
  const handleStatusFilter = (status: StreamStatus | 'all') => {
    setQuery(prev => ({
      ...prev,
      page_num: 1,
      params: {
        ...prev.params,
        status: status === 'all' ? "" : status
      }
    }));
  };

  // 监听查询参数变化
  useEffect(() => {
    console.log('Stream query updated:', query);
  }, [query]);

  // 处理选择
  const handleSelect = (stream_id: number) => {
    setSelectedStreams(prev =>
      prev.includes(stream_id)
        ? prev.filter(id => id !== stream_id)
        : [...prev, stream_id]
    );
  };

  // 处理全选
  const handleSelectAll = () => {
    if (streams.length > 0) {
      setSelectedStreams(prev =>
        prev.length === streams.length
          ? []
          : streams.map(stream => stream.stream_id)
      );
    }
  };

  // 打开编辑对话框
  const openEditDialog = (stream: Stream) => {
    setCurrentStream(stream);
    setShowEditDialog(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (stream: Stream) => {
    setCurrentStream(stream);
    setShowDeleteDialog(true);
  };

  // 提交表单处理
  const onSubmit = async (data: StreamFormValues) => {
    try {
      await createMutation.mutateAsync({
        stream_name: data.stream_name,
        stream_url: data.stream_url,
        stream_type: data.stream_type,
        description: data.description,
        remark: data.remark,
      });
    } catch (error) {
      console.error('创建视频流失败', error);
      toast({
        title: '创建失败',
        description: '创建视频流时出现错误',
        variant: 'destructive',
      });
    }
  };

  // 处理编辑
  const handleEdit = async (data: StreamFormValues) => {
    if (!currentStream) return;

    try {
      await updateMutation.mutateAsync({
        stream_id: currentStream.stream_id,
        data: {
          stream_name: data.stream_name,
          stream_url: data.stream_url,
          stream_type: data.stream_type,
          description: data.description,
          remark: data.remark,
        },
      });
    } catch (error) {
      console.error("更新失败:", error);
      toast({
        title: '更新失败',
        description: '更新视频流信息时出错',
        variant: 'destructive',
      });
    }
  };

  // 处理删除
  const handleDelete = async (stream_id: number) => {
    try {
      await deleteMutation.mutateAsync(stream_id);
    } catch (error) {
      console.error("删除失败:", error);
      toast({
        title: '删除失败',
        description: '删除视频流时出错',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (currentStream && showEditDialog) {
      editForm.reset({
        stream_name: currentStream.stream_name,
        stream_url: currentStream.stream_url,
        stream_type: currentStream.stream_type,
        description: currentStream.description,
        remark: currentStream.remark,
      });
    }
  }, [currentStream, showEditDialog, editForm]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">视频流管理</h1>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>添加视频流</span>
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search" className="mb-2 block">名称搜索</Label>
            <div className="flex">
              <Input
                id="search"
                placeholder="搜索视频流名称"
                value={query.params.keywords?.stream_name || ""}
                onChange={(e) => setQuery(prev => ({
                  ...prev,
                  params: {
                    ...prev.params,
                    keywords: {
                      ...(prev.params.keywords || {}),
                      stream_name: e.target.value
                    }
                  }
                }))}
                className="rounded-r-none"
              />
              <Button 
                onClick={() => handleSearch(query.params.keywords?.stream_name || "")}
                className="rounded-l-none"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="w-[200px]">
            <Label htmlFor="status-filter" className="mb-2 block">状态筛选</Label>
            <Select
              value={query.params.status || 'all'}
              onValueChange={(value) => handleStatusFilter(value as StreamStatus | 'all')}
            >
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="所有状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value={StreamStatus.Online}>在线</SelectItem>
                <SelectItem value={StreamStatus.Offline}>离线</SelectItem>
                <SelectItem value={StreamStatus.Error}>错误</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {selectedStreams.length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <div className="text-sm font-medium">
            已选择 {selectedStreams.length} 项
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => batchDeleteMutation.mutate(selectedStreams)}
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>批量删除</span>
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="w-full p-8 text-center">加载中...</div>
      ) : streams.length === 0 ? (
        <Card>
          <div className="w-full p-8 text-center flex flex-col items-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>暂无数据</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-3">
            {streams.map((stream) => (
              <StreamCard
                key={stream.stream_id}
                stream={stream}
                isSelected={selectedStreams.includes(stream.stream_id)}
                onSelect={handleSelect}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onStart={(id) => startMutation.mutate(id)}
                onStop={(id) => stopMutation.mutate(id)}
                onRestart={(id) => restartMutation.mutate(id)}
              />
            ))}
          </div>
          
          <div className="mt-6">
            <Pagination
              currentPage={query.page_num}
              pageSize={query.page_size}
              total={total}
              onPageChange={(page) => setQuery(prev => ({ ...prev, page_num: page }))}
            />
          </div>
        </>
      )}

      {/* 创建表单对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加视频流</DialogTitle>
            <DialogDescription>
              请填写视频流信息，带*号为必填项
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="stream_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入视频流名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stream_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>视频流地址 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入视频流地址" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stream_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类型</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入视频流类型" {...field} />
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入描述信息" {...field} />
                    </FormControl>
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
                      <Input placeholder="请输入备注信息" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? '提交中...' : '提交'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 编辑表单对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑视频流</DialogTitle>
            <DialogDescription>
              修改视频流信息，带*号为必填项
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="stream_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入视频流名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="stream_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>视频流地址 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入视频流地址" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="stream_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类型</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入视频流类型" {...field} />
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
                      <Input placeholder="请输入描述信息" {...field} />
                    </FormControl>
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
                      <Input placeholder="请输入备注信息" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? '提交中...' : '提交'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除视频流</DialogTitle>
            <DialogDescription>
              您确定要删除该视频流吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => currentStream && handleDelete(currentStream.stream_id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 