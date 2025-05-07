'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { streamAPI } from '@/api/stream';
import { Stream, StreamStatus, StreamUpdateDto } from '@/types/stream';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/pagination';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const [page_num, setPageNum] = useState(1);
  const [page_size] = useState(10);
  const [searchName, setSearchName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StreamStatus | ''>('');
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
    queryKey: ['streams', 'list', { page_num, page_size, status: selectedStatus, keyword: searchName }],
    queryFn: () => streamAPI.getList({
      keywords: {
        stream_name: searchName || undefined
      },
      status: selectedStatus || undefined,
      page_num,
      page_size,
    }),
  });

  // 判断返回数据格式并正确提取数据
  const streams = streamResponse?.data?.list || [];
  const total = streamResponse?.data?.total || 0;
  const totalPages = streamResponse?.data?.pages || 1;

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
  const handleSearch = () => {
    setPageNum(1);
    queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
  };

  // 处理状态筛选
  const handleStatusFilter = (status: StreamStatus | 'all') => {
    setSelectedStatus(status === 'all' ? '' : status);
    setPageNum(1);
    queryClient.invalidateQueries({ queryKey: ['streams', 'list'] });
  };

  // 监听搜索参数变化
  useEffect(() => {
    console.log('Stream data response:', streamResponse);
  }, [streamResponse]);

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

  // 颜色定义
  const getStatusStyle = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.Online:
        return 'bg-green-100 text-green-800';
      case StreamStatus.Offline:
        return 'bg-gray-100 text-gray-800';
      case StreamStatus.Error:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 状态显示文本
  const getStatusText = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.Online:
        return '在线';
      case StreamStatus.Offline:
        return '离线';
      case StreamStatus.Error:
        return '错误';
      default:
        return '未知';
    }
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

  // 获取状态徽章
  const getStatusBadge = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.Online:
        return <Badge variant="outline" className="bg-green-100 text-green-800">在线</Badge>;
      case StreamStatus.Offline:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">离线</Badge>;
      case StreamStatus.Error:
        return <Badge variant="outline" className="bg-red-100 text-red-800">错误</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">未知</Badge>;
    }
  };

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
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="rounded-r-none"
              />
              <Button 
                onClick={handleSearch} 
                className="rounded-l-none"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="w-[200px]">
            <Label htmlFor="status-filter" className="mb-2 block">状态筛选</Label>
            <Select
              value={selectedStatus || 'all'}
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

      <Card>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedStreams.length > 0 && selectedStreams.length === streams.length}
              onCheckedChange={handleSelectAll}
              className={cn(
                selectedStreams.length > 0 && selectedStreams.length < streams.length ? 'opacity-50' : ''
              )}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              {selectedStreams.length > 0 ? `已选择 ${selectedStreams.length} 项` : '全选'}
            </label>
          </div>

          {selectedStreams.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => batchDeleteMutation.mutate(selectedStreams)}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>批量删除</span>
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>名称</TableHead>
              <TableHead>视频流地址</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {streams.map((stream) => (
              <TableRow key={stream.stream_id}>
                <TableCell className="p-0 pl-4 w-[50px]">
                  <Checkbox
                    checked={selectedStreams.includes(stream.stream_id)}
                    onCheckedChange={() => handleSelect(stream.stream_id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{stream.stream_name}</TableCell>
                <TableCell className="max-w-[200px] truncate">{stream.stream_url}</TableCell>
                <TableCell>{getStatusBadge(stream.status)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{stream.description || '-'}</TableCell>
                <TableCell>{new Date(stream.create_time).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {stream.status === StreamStatus.Offline && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startMutation.mutate(stream.stream_id)}
                        title="启动"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {stream.status === StreamStatus.Online && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => stopMutation.mutate(stream.stream_id)}
                        title="停止"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(stream)}
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDeleteDialog(stream)}
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {streams.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>暂无数据</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {isLoading ? (
          <div className="w-full p-8 text-center">加载中...</div>
        ) : streams.length === 0 ? (
          <div className="w-full p-8 text-center">暂无数据</div>
        ) : (
          <Pagination
            currentPage={page_num}
            pageSize={page_size}
            total={total}
            onChange={setPageNum}
          />
        )}
      </Card>

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